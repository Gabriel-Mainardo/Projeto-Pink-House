export interface Env {
  NVIDIA_API_KEY: string;
  NVIDIA_CHAT_MODEL?: string;
  ALLOWED_ORIGIN?: string;
}

type IncomingMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type PinkChatRequest = {
  message?: string;
  page?: string;
  conversation?: IncomingMessage[];
  siteContext?: string;
};

const defaultSystemPrompt = `
Voce e Pink, a assistente oficial da House Pink.
Responda sempre em portugues do Brasil, com tom direto, elegante e util.
Entenda e explique tudo sobre o site: cadastro de cliente, cadastro de acompanhante, login, filtros da home e catalogo, dashboard, mensagens, wallet, subidas, stories, perfil, termos e privacidade.
Quando nao souber um dado especifico do usuario, deixe isso claro e oriente o proximo passo dentro do site.
Nao invente preco, regra, politica ou funcionalidade inexistente.
Mantenha respostas curtas e praticas.
`.trim();

const jsonHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
});

const resolveOrigin = (request: Request, env: Env) => {
  const requestOrigin = request.headers.get('Origin') || '*';
  if (!env.ALLOWED_ORIGIN || env.ALLOWED_ORIGIN === '*') {
    return requestOrigin;
  }
  return env.ALLOWED_ORIGIN;
};

const buildMessages = (payload: PinkChatRequest) => {
  const conversation = Array.isArray(payload.conversation) ? payload.conversation.slice(-8) : [];
  const context = payload.siteContext?.trim() ? `Contexto do site:\n${payload.siteContext.trim()}` : '';
  const page = payload.page ? `Pagina atual do usuario: ${payload.page}` : '';
  const systemContent = [defaultSystemPrompt, context, page].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: systemContent },
    ...conversation.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: typeof item.content === 'string' ? item.content : '',
    })),
    { role: 'user', content: payload.message?.trim() || '' },
  ];
};

const extractReply = (data: any) => {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === 'string' ? item.text : ''))
      .join('\n')
      .trim();
  }

  return '';
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = resolveOrigin(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: jsonHeaders(origin),
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Metodo nao permitido.' }), {
        status: 405,
        headers: jsonHeaders(origin),
      });
    }

    if (!env.NVIDIA_API_KEY) {
      return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY nao configurada no Worker.' }), {
        status: 500,
        headers: jsonHeaders(origin),
      });
    }

    let payload: PinkChatRequest;

    try {
      payload = (await request.json()) as PinkChatRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'JSON invalido.' }), {
        status: 400,
        headers: jsonHeaders(origin),
      });
    }

    const message = payload.message?.trim();
    if (!message) {
      return new Response(JSON.stringify({ error: 'Mensagem obrigatoria.' }), {
        status: 400,
        headers: jsonHeaders(origin),
      });
    }

    try {
      const upstreamResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: env.NVIDIA_CHAT_MODEL || 'moonshotai/kimi-k2.6',
          messages: buildMessages(payload),
          temperature: 0.5,
          top_p: 0.9,
          max_tokens: 2048,
          stream: false,
        }),
      });

      const text = await upstreamResponse.text();
      const data = text ? JSON.parse(text) : null;

      if (!upstreamResponse.ok) {
        const upstreamError =
          data?.error?.message ||
          data?.error ||
          'Falha ao consultar a NVIDIA.';

        return new Response(JSON.stringify({ error: upstreamError }), {
          status: upstreamResponse.status,
          headers: jsonHeaders(origin),
        });
      }

      const reply = extractReply(data);

      if (!reply) {
        return new Response(JSON.stringify({ error: 'A IA nao retornou conteudo.' }), {
          status: 502,
          headers: jsonHeaders(origin),
        });
      }

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: jsonHeaders(origin),
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: error?.message || 'Erro interno no Worker.',
        }),
        {
          status: 500,
          headers: jsonHeaders(origin),
        }
      );
    }
  },
};
