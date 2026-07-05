import { useMemo, useRef, useState, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Oi, eu sou a Pink. Posso te ajudar com cadastro, login, catálogo, planos, filtros, navegação e qualquer parte da House Pink.'
  }
];

const CHAT_API_URL = import.meta.env.VITE_PINK_CHAT_API_URL || '/api/pink-chat';
const SITE_CONTEXT = `
House Pink e um marketplace premium de acompanhantes e clientes.
Voce responde em portugues do Brasil.
Explique fluxos do site com clareza: home, catalogo, filtros, login, cadastro, dashboards, mensagens, carteira, subidas, stories, termos e privacidade.
Nao invente politicas nem recursos inexistentes.
Se o usuario pedir algo operacional do site, explique o caminho dentro da interface.
`.trim();

const PinkAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('openPinkChat', handler);
    return () => window.removeEventListener('openPinkChat', handler);
  }, []);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user' as const, content: question }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          page: window.location.pathname,
          conversation: nextMessages.slice(-8),
          siteContext: SITE_CONTEXT
        })
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
      } else {
        const data = await res.json().catch(() => null);
        reply =
          typeof data?.error === 'string'
            ? data.error
            : 'O chat da Pink nao esta disponivel agora.';
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: reply || 'Nao consegui montar uma resposta agora. Tente novamente.'
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado.';
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `${message} Tente novamente em instantes.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-[68px] sm:bottom-[74px] right-3 z-[90] w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-[28px] border border-pink-200 bg-white shadow-[0_24px_80px_rgba(217,29,131,0.25)] md:right-6">
          <div className="bg-gradient-to-r from-[#d91d83] via-[#ef4ba8] to-[#ff82c2] p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Pink</p>
                    <p className="text-xs text-white/85">Assistente IA da House Pink</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                aria-label="Fechar assistente"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-[#fff8fc] px-3 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-[#d91d83] text-white'
                      : 'bg-white text-gray-700 border border-pink-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-pink-100 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                  Pink esta digitando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-pink-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Pergunte qualquer coisa sobre a House Pink..."
                rows={1}
                className="min-h-[46px] flex-1 resize-none rounded-2xl border border-pink-100 bg-[#fff8fc] px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#d91d83]"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#d91d83] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

    </>
  );
};

export default PinkAssistantChat;
