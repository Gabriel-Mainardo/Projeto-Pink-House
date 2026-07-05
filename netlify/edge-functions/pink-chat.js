const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
const defaultModel = 'moonshotai/kimi-k2.6';

const siteContext = `
Voce e Pink, a assistente oficial da House Pink.

Seu papel:
- orientar usuarios sobre qualquer area do site
- explicar navegacao, login, cadastro, catalogo, perfis, stories, wallet, subidas, planos, privacidade e termos
- responder com clareza, objetividade e tom acolhedor

Mapa principal do site:
- home: /
- catalogo: /catalog
- perfil individual: /profile/:id
- login acompanhante: /login
- cadastro acompanhante: /auth-register
- login cliente: /client-login
- cadastro cliente: /client-signup
- dashboard cliente: /client-dashboard
- dashboard acompanhante: /companion-dashboard
- wallet: /wallet
- subidas: /subidas
- stories: /my-stories
- termos: /terms-of-use
- privacidade: /privacy-policy

Regras:
- fale sempre em portugues do Brasil
- trate o projeto pelo nome House Pink
- nao invente promocoes, precos ou dados internos
- respostas curtas e objetivas
`;

const buildMessages = ({ conversation, message, page }) => {
  const history = Array.isArray(conversation)
    ? conversation
        .filter((e) => e && typeof e.content === 'string' && (e.role === 'user' || e.role === 'assistant'))
        .slice(-8)
    : [];

  return [
    { role: 'system', content: `${siteContext}\n\nPagina atual: ${page || '/'}` },
    ...history,
    { role: 'user', content: message }
  ];
};

export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const apiKey = Deno.env.get('NVIDIA_API_KEY');
    const model = Deno.env.get('NVIDIA_CHAT_MODEL') || defaultModel;

    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return new Response(JSON.stringify({ error: 'Mensagem vazia.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const response = await fetch(invokeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: buildMessages({
          conversation: body.conversation,
          message,
          page: body.page
        }),
        max_tokens: 2048,
        temperature: 0.6,
        top_p: 0.95,
        stream: false,
        chat_template_kwargs: { enable_thinking: false }
      })
    });

    const rawText = await response.text();
    let data = {};
    try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { raw: rawText }; }

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data?.error?.message || data?.detail || 'Falha ao consultar a IA.'
      }), { status: response.status, headers: corsHeaders });
    }

    const reply = data?.choices?.[0]?.message?.content;
    const normalizedReply = Array.isArray(reply)
      ? reply.map((item) => item?.text || '').join('\n').trim()
      : typeof reply === 'string' ? reply.trim() : '';

    return new Response(JSON.stringify({
      reply: normalizedReply || 'Nao consegui gerar uma resposta agora.'
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error?.message || 'Erro inesperado.'
    }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: '/api/pink-chat' };
