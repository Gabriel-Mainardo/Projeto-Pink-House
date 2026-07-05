import { useState, useEffect } from "react";
import { Menu, Search, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import FilterBar from "./FilterBar";
import { RegistrationModal } from "./RegistrationModal";
import SideMenu from "./menu/SideMenu";

interface HeaderSimpleProps {
  onFilterClick?: () => void;
  selectedGender?: 'Mulheres' | 'Homens' | 'Trans';
  onGenderChange?: (gender: 'Mulheres' | 'Homens' | 'Trans') => void;
  selectedCity?: string;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  showFilterBar?: boolean;
  showBackButton?: boolean;
  backTo?: string;
  showSideMenu?: boolean;
}

const HeaderSimple: React.FC<HeaderSimpleProps> = ({
  onFilterClick,
  selectedGender,
  onGenderChange,
  selectedCity,
  selectedLocation,
  onLocationChange,
  showFilterBar = true,
  showBackButton = false,
  backTo = '/',
  showSideMenu = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState<'client' | 'companion' | ''>("");

  // Verificar se está logado e tipo de usuário
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsLoggedIn(parsedUser.isLoggedIn || false);
        setUserName(parsedUser.name || "");
        setUserType(parsedUser.type || "");
      } catch {
        setIsLoggedIn(false);
        setUserName("");
        setUserType("");
      }
    }
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-gray-100 backdrop-blur supports-[backdrop-filter]:bg-gray-100/80">
        <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2 -ml-4 sm:-ml-6">
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-1 p-2 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-medium text-pink-500" style={{ }}>
                  Voltar
                </span>
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold whitespace-nowrap" style={{ }}>
              Faixa Rosa Brasil
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 mr-0 sm:mr-16">
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-gray-200 hover:bg-gray-300 !rounded-full">
              <Search className="h-7 w-7" strokeWidth={3} />
            </Button>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  // Navegar para o dashboard correto baseado no tipo de usuário
                  if (userType === 'client') {
                    navigate('/client-dashboard');
                  } else if (userType === 'companion') {
                    navigate('/companion-dashboard');
                  } else {
                    navigate('/'); // fallback para home
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
              >
                <User className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-sm font-medium hidden sm:block" style={{ }}>
                  {userName}
                </span>
              </button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-gray-200 hover:bg-gray-300 !rounded-full"
                onClick={() => setIsRegistrationModalOpen(true)}
              >
                <User className="h-7 w-7" strokeWidth={3} />
              </Button>
            )}
          </div>
        </div>
      </header>
      {showFilterBar && (
        <FilterBar
          onFilterClick={onFilterClick}
          selectedGender={selectedGender}
          onGenderChange={onGenderChange}
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
        />
      )}

      {/* Side Menu */}
      {showSideMenu && (
        <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}

      {/* Modal de Registro */}
      {isRegistrationModalOpen && (
        <RegistrationModal onClose={() => setIsRegistrationModalOpen(false)} />
      )}
    </>
  );
};

export default HeaderSimple;
