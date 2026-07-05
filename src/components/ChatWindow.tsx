import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minus, Plus, Smile } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'anitta' | 'companion';
  timestamp: Date;
  companionName?: string;
  companionAvatar?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  prompt: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isCompanion?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, isCompanion = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ações rápidas diferenciadas por tipo de usuário
  const QUICK_ACTIONS: QuickAction[] = isCompanion
    ? [
        { label: 'Stories', icon: '📸', prompt: 'Como postar stories?' },
        { label: 'Planos', icon: '💎', prompt: 'Quais são os planos disponíveis?' },
        { label: 'Perfil', icon: '✏️', prompt: 'Como editar meu perfil?' },
      ]
    : [
        { label: 'Eventos', icon: '📅', prompt: 'Quais são os próximos eventos?' },
        { label: 'Benefícios', icon: '💎', prompt: 'Quais são os benefícios?' },
        { label: 'Contato', icon: '💬', prompt: 'Como entro em contato?' },
      ];

  // Inicializar mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: isCompanion
            ? 'Olá! Bem-vinda à Faixa Rosa Brasil. 💖\n\nSou a Anitta, sua assistente pessoal. Como posso te ajudar a elevar sua carreira hoje?'
            : 'Olá! Bem-vinda à Faixa Rosa Brasil. 💖\n\nSou a Anitta, sua assistente pessoal. Como posso te ajudar hoje?',
          sender: 'anitta',
          timestamp: new Date()
        }
      ]);
    }
  }, [isCompanion, messages.length]);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Respostas automáticas da Anitta
  const getAnittaResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Respostas para ACOMPANHANTES
    if (isCompanion) {
      if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola')) {
        return 'Oi, linda! 😊 Como posso te ajudar hoje? Precisa de ajuda com stories, planos ou configurações?';
      }

      if (msg.includes('stories') || msg.includes('story') || msg.includes('postar')) {
        return 'Para postar stories, vá no seu Dashboard e clique em "Criar Story"! 📸 Você pode adicionar fotos, vídeos e até links. Os stories ficam visíveis por 24h!';
      }

      if (msg.includes('plano') || msg.includes('assinatura') || msg.includes('premium')) {
        return 'Temos planos VIP com vantagens incríveis! 💎 Acesse a área de Planos no seu Dashboard para ver todas as opções e benefícios.';
      }

      if (msg.includes('perfil') || msg.includes('cadastro') || msg.includes('editar')) {
        return 'Você pode editar seu perfil a qualquer momento no Dashboard! ✏️ Mantenha suas fotos e informações sempre atualizadas para atrair mais clientes.';
      }

      if (msg.includes('foto') || msg.includes('imagem') || msg.includes('video')) {
        return 'Adicione fotos e vídeos de qualidade! 📷 Imagens nítidas e bem iluminadas chamam mais atenção. Você pode fazer upload no seu perfil ou nos stories.';
      }

      if (msg.includes('ajuda') || msg.includes('suporte') || msg.includes('problema')) {
        return 'Estou aqui para ajudar! 🆘 Me conte qual é sua dúvida ou problema que vou te orientar. Também temos suporte técnico disponível.';
      }

      if (msg.includes('obrigado') || msg.includes('obrigada') || msg.includes('valeu')) {
        return 'De nada, querida! 💕 Qualquer coisa é só chamar. Sucesso no seu trabalho!';
      }

      // Resposta padrão para acompanhantes
      return 'Entendi! 🤔 Posso te ajudar com dúvidas sobre stories, planos, edição de perfil, fotos, vídeos e muito mais. O que você precisa?';
    }

    // Respostas para CLIENTES
    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola')) {
      return 'Oi, querido! 😊 Como posso te ajudar hoje? Está procurando uma acompanhante especial?';
    }

    if (msg.includes('preço') || msg.includes('valor') || msg.includes('quanto custa')) {
      return 'Os valores variam de acordo com cada acompanhante! 💰 Use os filtros para encontrar perfis dentro do seu orçamento. Quer que eu te ajude a buscar?';
    }

    if (msg.includes('local') || msg.includes('cidade') || msg.includes('região')) {
      return 'Você pode filtrar por cidade e bairro no topo da página! 📍 Assim fica mais fácil encontrar acompanhantes perto de você.';
    }

    if (msg.includes('evento') || msg.includes('eventos')) {
      return 'Temos eventos exclusivos para membros! 🎉 Confira a agenda completa na seção de Eventos. Aproveite!';
    }

    if (msg.includes('benefício') || msg.includes('benefícios') || msg.includes('vantagem')) {
      return 'São muitos benefícios! 💎 Acesso exclusivo, eventos VIP, descontos especiais e muito mais. Vale muito a pena!';
    }

    if (msg.includes('contato') || msg.includes('falar') || msg.includes('conversar')) {
      return 'Para entrar em contato, acesse o perfil e use as informações disponíveis! 💬 Mantenha sempre o respeito!';
    }

    if (msg.includes('como funciona') || msg.includes('como usar')) {
      return 'É super simples! 🌟 Navegue pelos perfis, veja os stories das acompanhantes e entre em contato diretamente pelo WhatsApp delas. Quer dicas de como escolher?';
    }

    if (msg.includes('obrigado') || msg.includes('obrigada') || msg.includes('valeu')) {
      return 'Por nada, amor! 💕 Estou sempre aqui se precisar de ajuda. Aproveite o site!';
    }

    if (msg.includes('stories')) {
      return 'Os Stories são perfeitos para conhecer melhor as acompanhantes! 📸 Elas postam fotos e vídeos exclusivos. Role para cima e confira!';
    }

    // Resposta padrão para clientes
    return 'Entendi! 🤔 Estou aqui para te ajudar no que precisar. Você pode me perguntar sobre preços, localização, como funciona o site ou qualquer outra dúvida!';
  };

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular digitação da Anitta
    setTimeout(() => {
      const anittaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAnittaResponse(text),
        sender: 'anitta',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, anittaResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-8 z-50 w-full max-w-sm animate-scale-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Container Principal do Chat - Estilo Faixa Rosa */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px]">

        {/* Header Estilo Faixa Rosa */}
        <div className="bg-[#d91d83] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                alt="Anitta AI"
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#d91d83] rounded-full"></div>
            </div>
            <div>
              <h2 className="text-lg leading-tight" style={{ fontWeight: 600 }}>Anitta AI</h2>
              <p className="text-xs opacity-90" style={{ fontWeight: 400 }}>Assistente Virtual • Online</p>
            </div>
          </div>
          <div className="flex space-x-4 opacity-80">
            <button className="hover:opacity-100 transition-opacity">
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Chat */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 chat-scrollbar">
          {/* Data label */}
          <div className="text-center my-4">
            <span className="bg-gray-200 text-gray-500 text-[10px] px-3 py-1 rounded-full uppercase" style={{ fontWeight: 500, letterSpacing: '0.1em' }}>
              Hoje
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end space-x-2'}`}
            >
              {msg.sender === 'anitta' && (
                <img
                  src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                  alt="Anitta"
                  className="w-8 h-8 rounded-full object-cover mb-4 shadow-sm flex-shrink-0"
                />
              )}
              <div className="max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl shadow-sm text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#d91d83] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ fontWeight: 400 }}>{msg.text}</p>
                </div>
                <p className={`text-[10px] mt-1 text-gray-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`} style={{ fontWeight: 400 }}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {isTyping && (
            <div className="flex justify-start items-center space-x-2">
              <img
                src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                alt="Anitta"
                className="w-8 h-8 rounded-full object-cover shadow-sm"
              />
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
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
        <div className="bg-white p-4 border-t border-gray-100">
          {/* Ações Rápidas */}
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSendMessage(action.prompt)}
                className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-white border border-pink-100 text-[#d91d83] rounded-full text-xs hover:bg-pink-50 transition-colors shadow-sm"
                style={{ fontWeight: 500 }}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-[#d91d83] transition-colors">
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-gray-100 rounded-full py-3 px-5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 transition-all border-none placeholder:text-gray-400/70"
                style={{ fontWeight: 400 }}
              />
              <button className="absolute right-3 text-gray-400 hover:text-yellow-500">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !inputText.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() ? 'bg-[#d91d83] text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-4 h-4 transform -rotate-[15deg] ml-0.5" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest" style={{ fontWeight: 400 }}>
              Powered by <span className="text-pink-300">Faixa Rosa Intelligence</span>
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ChatWindow;
