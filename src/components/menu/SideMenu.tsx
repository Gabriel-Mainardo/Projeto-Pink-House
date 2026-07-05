import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Map,
  Sparkles,
  Newspaper,
  Flame,
  Video,
  PlayCircle,
  ShieldCheck,
  User,
  Heart,
  Bell,
  HelpCircle,
  Shield,
  Megaphone,
  Mail,
  FileText,
  Gem
} from 'lucide-react';
import MenuItem from './MenuItem';
import { MenuSectionData } from '../../types/menu';
import { useToast } from '../../hooks/use-toast';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Items that have working routes
  const workingRoutes: Record<string, string> = {
    'Termos & privacidade': '/terms-of-use',
    'Seja acompanhante': '/auth-register',
  };

  const handleItemClick = (title: string) => {
    if (workingRoutes[title]) {
      navigate(workingRoutes[title]);
      onClose();
    } else {
      toast({ title: '🔒 Em desenvolvimento', description: 'Esta funcionalidade estará disponível em breve!' });
    }
  };

  const sections: MenuSectionData[] = [
    {
      title: 'Explorar',
      items: [
        {
          icon: MapPin,
          title: 'Acompanhantes por cidade',
          subtitle: 'Veja outras regiões do Brasil',
          iconColorClass: 'text-red-500',
          iconBgClass: 'bg-red-50',
        },
        {
          icon: Map,
          title: 'Acompanhantes por bairro',
          subtitle: 'Boa Viagem, Pina, Centro...',
          iconColorClass: 'text-cyan-500',
          iconBgClass: 'bg-cyan-50',
        },
        {
          icon: Sparkles,
          title: 'Categorias',
          subtitle: 'Morenas, loiras, trans, luxo...',
          iconColorClass: 'text-yellow-500',
          iconBgClass: 'bg-yellow-50',
        },
        {
          icon: Newspaper,
          title: 'Novidades',
          subtitle: 'Perfis recém-cadastrados',
          iconColorClass: 'text-blue-400',
          iconBgClass: 'bg-blue-50',
        },
        {
          icon: Flame,
          title: 'Mais vistas',
          subtitle: 'As favoritas do momento',
          iconColorClass: 'text-orange-500',
          iconBgClass: 'bg-orange-50',
        },
        {
          icon: Sparkles,
          title: 'Disponíveis agora',
          subtitle: 'Acompanhantes com status online',
          iconColorClass: 'text-green-600',
          iconBgClass: 'bg-green-50',
          customIcon: <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-100" />
        },
      ]
    },
    {
      title: 'Mídia',
      items: [
        {
          icon: Video,
          title: 'Stories premium',
          subtitle: 'Momento a momento das modelos',
          iconColorClass: 'text-gray-700',
          iconBgClass: 'bg-gray-100',
        },
        {
          icon: PlayCircle,
          title: 'Vídeos (Faixa Rosa Flash)',
          subtitle: 'Clipes rápidos das acompanhantes',
          iconColorClass: 'text-orange-500',
          iconBgClass: 'bg-orange-50',
        },
        {
          icon: ShieldCheck,
          title: 'Modelos verificadas',
          subtitle: 'Perfis com checagem de segurança',
          iconColorClass: 'text-slate-600',
          iconBgClass: 'bg-slate-100',
        },
      ]
    },
    {
      title: 'Minha Conta',
      items: [
        {
          icon: User,
          title: 'Perfil e preferências',
          subtitle: 'Cidade favorita, filtros, idioma',
          iconColorClass: 'text-blue-600',
          iconBgClass: 'bg-blue-50',
        },
        {
          icon: Heart,
          title: 'Minhas favoritas',
          subtitle: 'Atalhos para quem você salvou',
          iconColorClass: 'text-red-500',
          iconBgClass: 'bg-red-50',
        },
        {
          icon: Bell,
          title: 'Alertas & notificações',
          subtitle: 'Avise quando houver novas modelos',
          iconColorClass: 'text-yellow-500',
          iconBgClass: 'bg-yellow-50',
        },
      ]
    },
    {
      title: 'Ajuda & segurança',
      items: [
        {
          icon: HelpCircle,
          title: 'Central de ajuda',
          subtitle: 'Perguntas frequentes',
          iconColorClass: 'text-red-500',
          iconBgClass: 'bg-transparent',
        },
        {
          icon: Shield,
          title: 'Dicas de segurança',
          subtitle: 'Como se proteger ao contratar',
          iconColorClass: 'text-red-500',
          iconBgClass: 'bg-transparent',
        },
        {
          icon: Megaphone,
          title: 'Canal de denúncias',
          subtitle: 'Reporte perfis suspeitos',
          iconColorClass: 'text-gray-600',
          iconBgClass: 'bg-transparent',
        },
        {
          icon: Mail,
          title: 'Fale conosco',
          subtitle: 'Atendimento Faixa Rosa',
          iconColorClass: 'text-gray-600',
          iconBgClass: 'bg-transparent',
        },
        {
          icon: FileText,
          title: 'Termos & privacidade',
          subtitle: 'Políticas da plataforma',
          iconColorClass: 'text-gray-600',
          iconBgClass: 'bg-transparent',
        },
      ]
    },
    {
      title: 'Para acompanhantes',
      items: [
        {
          icon: Gem,
          title: 'Seja acompanhante',
          subtitle: 'Crie seu perfil na Faixa Rosa',
          iconColorClass: 'text-cyan-500',
          iconBgClass: 'bg-cyan-50',
        }
      ]
    }
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-[340px] sm:max-w-[380px] bg-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >

        {/* Header */}
        <div className="pt-4 pb-2 px-5 bg-gray-100 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1
                className="text-xl text-gray-800 tracking-tight"
                style={{
                  }}
              >
                Pink House
              </h1>
              <p
                className="text-sm text-gray-500"
                style={{
                  }}
              >
                Menu rápido do cliente
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-2">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.title && (
                <h2
                  className="text-xs text-gray-400 uppercase tracking-wide px-3 py-2"
                  style={{
                    }}
                >
                  {section.title}
                </h2>
              )}
              <div>
                {section.items.map((item, itemIdx) => (
                  <MenuItem
                    key={itemIdx}
                    item={item}
                    locked={!workingRoutes[item.title]}
                    onClick={() => handleItemClick(item.title)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-100 border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="space-y-3">
            <button
              onClick={() => { navigate('/catalog'); onClose(); }}
              className="w-full py-3 rounded-full border-2 border-[#ff007f] text-[#ff007f] text-sm hover:bg-[#ff007f]/5 transition-colors"
            >
              Ver catálogo completo
            </button>
            <button
              onClick={() => { navigate('/catalog'); onClose(); }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff007f] to-[#e60073] text-white text-sm shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-shadow"
            >
              Ver acompanhantes em Recife
            </button>
          </div>

          <div className="mt-4 text-center">
            <p
              className="text-[10px] text-gray-400"
              style={{
                }}
            >
              Conteúdo destinado a maiores de 18 anos.
            </p>
            <p
              className="text-[10px] text-gray-400"
              style={{
                }}
            >
              © 2025 Pink House Brasil.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default SideMenu;
