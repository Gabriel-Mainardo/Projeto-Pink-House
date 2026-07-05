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
Responda sempre em portugues do Brasil com clareza, objetividade e tom elegante.
Explique o funcionamento do site: home, catalogo, filtros, login, cadastro, dashboards, mensagens, wallet, subidas, stories, perfis, termos e privacidade.
Nao invente recursos, regras ou politicas que nao foram informados.
Se faltar um dado especifico, seja transparente e oriente o usuario para o proximo passo dentro do site.
Mantenha respostas curtas e praticas.
`.trim();

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido.' });
  }

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ error: 'NVIDIA_API_KEY nao configurada no backend.' });
  }

  const payload = (req.body || {}) as PinkChatRequest;
  const message = payload.message?.trim();

  if (!message) {
    return res.status(400).json({ error: 'Mensagem obrigatoria.' });
  }

  try {
    const upstreamResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NVIDIA_CHAT_MODEL || 'moonshotai/kimi-k2.6',
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
      return res.status(upstreamResponse.status).json({
        error: data?.error?.message || data?.error || 'Falha ao consultar a NVIDIA.',
      });
    }

    const reply = extractReply(data);

    if (!reply) {
      return res.status(502).json({ error: 'A IA nao retornou conteudo.' });
    }

    return res.status(200).json({ reply });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Erro interno no backend.',
    });
  }
}
