import { useState, useRef, useEffect } from 'react';
import { X, Send, Minus, Plus, Smile } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  icon: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Catálogo', icon: '📖', prompt: 'Como faço para ver o catálogo?' },
  { label: 'Segurança', icon: '🔒', prompt: 'É seguro usar a plataforma?' },
  { label: 'Contato', icon: '💬', prompt: 'Como entro em contato?' },
];

const VirtualAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCompanion, setIsCompanion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verificar se é acompanhante
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsCompanion(parsedUser.type === 'companion');
      } catch {
        setIsCompanion(false);
      }
    }
  }, []);

  // Respostas pré-definidas do assistente
  const botResponses = {
    saudacao: [
      "Olá! Bem-vinda à Faixa Rosa Brasil. 💖\n\nSou a Anitta, sua assistente pessoal. Como posso te ajudar hoje?",
      "Oi! Sou a Anitta e estou aqui para te ajudar. ✨ O que você gostaria de saber?",
      "Olá! Seja bem-vinda! Sou a Anitta, sua assistente virtual. 💖"
    ],
    catalogo: [
      "Para explorar nosso catálogo, clique em 'Explorar Catálogo' na sua área. 📖 Lá você encontrará perfis verificados na sua região.",
      "Nosso catálogo possui perfis verificados. ✨ Você pode filtrar por localização e características.",
      "No catálogo você pode ver fotos, descrições e informações de contato. Tudo verificado e seguro! 🔒"
    ],
    contato: [
      "Para entrar em contato, acesse o perfil no catálogo e use as informações de contato fornecidas. 💬",
      "Cada perfil tem informações específicas de contato. Recomendamos sempre ser respeitoso! 💖",
      "O contato é feito diretamente através das informações no perfil. Mantenha sempre o respeito! ✨"
    ],
    seguranca: [
      "Sua segurança é nossa prioridade! 🔒 Todos os perfis são verificados com total discrição.",
      "Garantimos total privacidade dos seus dados. Nunca compartilhamos informações com terceiros. 💖",
      "Temos verificação rigorosa e suporte 24/7 para sua segurança. ✨"
    ],
    preco: [
      "Os valores são definidos individualmente. 💰 Você pode ver essas informações no perfil.",
      "Cada profissional define seus próprios valores e condições. Consulte nos perfis! 📖",
      "Os valores variam conforme o profissional. Consulte diretamente no perfil de interesse. ✨"
    ],
    default: [
      "Entendo sua dúvida! 💖 Posso te ajudar com informações sobre nosso catálogo, contatos e segurança.",
      "Não tenho certeza sobre isso, mas posso te ajudar com dúvidas sobre navegação e perfis. ✨",
      "Hmm, não entendi bem. Pode reformular? Estou aqui para ajudar! 💖"
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') ||
        message.includes('boa tarde') || message.includes('boa noite') || message.includes('opa')) {
      return botResponses.saudacao[Math.floor(Math.random() * botResponses.saudacao.length)];
    }

    if (message.includes('catálogo') || message.includes('catalogo') || message.includes('perfis') ||
        message.includes('acompanhantes') || message.includes('buscar') || message.includes('procurar')) {
      return botResponses.catalogo[Math.floor(Math.random() * botResponses.catalogo.length)];
    }

    if (message.includes('contato') || message.includes('falar') || message.includes('conversar') ||
        message.includes('whatsapp') || message.includes('telefone') || message.includes('ligar')) {
      return botResponses.contato[Math.floor(Math.random() * botResponses.contato.length)];
    }

    if (message.includes('seguro') || message.includes('segurança') || message.includes('privacidade') ||
        message.includes('discreto') || message.includes('confiável')) {
      return botResponses.seguranca[Math.floor(Math.random() * botResponses.seguranca.length)];
    }

    if (message.includes('preço') || message.includes('preco') || message.includes('valor') ||
        message.includes('quanto custa') || message.includes('pagamento')) {
      return botResponses.preco[Math.floor(Math.random() * botResponses.preco.length)];
    }

    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    addMessage(userMessage, false);
    setInputValue('');
    setIsTyping(true);

    // Simular tempo de digitação do bot
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addMessage(botResponse, true);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage("Olá! Bem-vinda à Faixa Rosa Brasil. 💖\n\nSou a Anitta, sua assistente pessoal. Como posso te ajudar a elevar sua carreira hoje?", true);
      }, 500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Botão flutuante - Estilo Faixa Rosa */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50">
          {/* Tooltip */}
          <div className="absolute bottom-12 sm:bottom-14 right-0 mb-1 px-2 py-1 bg-[#d91d83] text-white text-[9px] sm:text-[10px] rounded-full shadow-lg whitespace-nowrap font-medium">
            {isCompanion ? 'Ajuda' : 'Fale com Anitta'}
            <div className="absolute top-full right-3 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#d91d83]"></div>
          </div>

          {/* Botão do chat */}
          <button
            onClick={openChat}
            className="relative w-11 h-11 sm:w-12 sm:h-12 bg-[#d91d83] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden"
          >
            <img
              src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
              alt="Anitta AI"
              className="w-full h-full object-cover"
            />
            {/* Status online */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </button>
        </div>
      )}

      {/* Chat Window - Estilo Faixa Rosa */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 w-72 sm:w-80 h-[400px] sm:h-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50">

          {/* Header Estilo Faixa Rosa */}
          <div className="bg-[#d91d83] p-3 sm:p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                  alt="Anitta AI"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white object-cover"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#d91d83] rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base leading-tight">Anitta AI</h2>
                <p className="text-[10px] sm:text-xs opacity-90">Assistente Virtual - Online</p>
              </div>
            </div>
            <div className="flex space-x-3 opacity-80">
              <button className="hover:opacity-100 transition-opacity">
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Corpo do Chat */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4 chat-scrollbar">
            {/* Data label */}
            <div className="text-center">
              <span className="bg-gray-200 text-gray-500 text-[9px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-wider">
                Hoje
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start items-end space-x-2' : 'justify-end'}`}
              >
                {msg.isBot && (
                  <img
                    src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                    alt="Anitta"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover mb-4 shadow-sm flex-shrink-0"
                  />
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl shadow-sm text-xs sm:text-sm ${
                      msg.isBot
                      ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                      : 'bg-[#d91d83] text-white rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                  <p className={`text-[9px] sm:text-[10px] mt-1 text-gray-400 px-1 ${msg.isBot ? 'text-left' : 'text-right'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start items-center space-x-2">
                <img
                  src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                  alt="Anitta"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shadow-sm"
                />
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rodapé e Input */}
          <div className="bg-white p-2.5 sm:p-3 border-t border-gray-100">
            {/* Ações Rápidas */}
            <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto pb-2.5 sm:pb-3 no-scrollbar">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSendMessage(action.prompt)}
                  className="flex-shrink-0 flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-pink-100 text-[#d91d83] rounded-full text-[10px] sm:text-xs font-medium hover:bg-pink-50 transition-colors shadow-sm"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-[#d91d83] transition-colors">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-gray-100 rounded-full py-2 sm:py-2.5 px-3 sm:px-4 pr-8 sm:pr-10 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 transition-all border-none"
                />
                <button className="absolute right-2 sm:right-3 text-gray-400 hover:text-yellow-500">
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping || !inputValue.trim()}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                  inputValue.trim() ? 'bg-[#d91d83] text-white shadow-lg hover:bg-pink-600' : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform -rotate-[15deg]" />
              </button>
            </div>

            <div className="mt-2 sm:mt-3 text-center">
              <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold tracking-widest">
                Powered by <span className="text-pink-300">Faixa Rosa Intelligence</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default VirtualAssistantChat;
