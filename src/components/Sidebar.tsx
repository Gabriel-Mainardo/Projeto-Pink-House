import React from 'react';
import { LayoutDashboard, User, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: User, label: 'Meu Perfil', active: true },
    { icon: MessageSquare, label: 'Mensagens', active: false },
    { icon: Settings, label: 'Configuracoes', active: false },
  ];

  const handleLogout = () => {
    // Limpar todos os dados do localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('tempAuthData');

    // Disparar evento customizado para atualizar outros componentes
    window.dispatchEvent(new Event('userLogout'));

    // Redirecionar para a página inicial
    navigate('/');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-50 border-r border-slate-100 h-screen sticky top-0 left-0">
      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-extrabold text-[#FF007F] tracking-tight" style={{ }}>Faixa Rosa</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              item.active
                ? 'bg-pink-50 text-[#FF007F]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
            style={{ }}
          >
            <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors"
          style={{ }}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
