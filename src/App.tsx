import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, matchPath } from "react-router-dom";
import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from "react";
import Index from "./pages/Index";
import ProfilePreviewRoute from "./pages/ProfilePreviewRoute";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SimpleAdminDashboard from "./pages/SimpleAdminDashboard";
import ModelRegister from "./pages/ModelRegister";
import ChatVip from "./pages/ChatVip";
import Subidas from "./pages/Subidas";
import AuthRegister from "./pages/AuthRegister";
import AuthCallback from "./pages/AuthCallback";
import SetPassword from "./pages/SetPassword";
import BasicInfoRegister from "./pages/BasicInfoRegister";
import ServiceTypeSelection from "./pages/ServiceTypeSelection";
import LocationRegister from "./pages/LocationRegister";
import ProfessionalNameWizard from "./pages/ProfessionalNameWizard";
import PrivacySelection from "./pages/PrivacySelection";
import FaceVerification from "./pages/FaceVerification";
import Welcome from "./pages/Welcome";
import PhotoUpload from "./pages/PhotoUpload";
import Pricing from "./pages/Pricing";
import AdVideoUpload from "./pages/AdVideoUpload";
import Wallet from "./pages/Wallet";
import IndiqueGanhe from "./pages/IndiqueGanhe";
import PhotoVideoManager from "./pages/PhotoVideoManager";
import PinkPoints from "./pages/PinkPoints";
import GanharPinkPoints from "./pages/GanharPinkPoints";
import ConverterPinkPoints from "./pages/ConverterPinkPoints";
import MinhasRositas from "./pages/MinhasRositas";
import EditarPerfil from "./pages/EditarPerfil";
import ProtectedRoute from "./components/ProtectedRoute";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { LocationProvider } from './contexts/LocationContext';
import LocationPopup from './components/LocationPopup';
import AdminStories from "./pages/AdminStories";
import GlobalHeader from "./components/GlobalHeader";
import CardPreview from "./pages/CardPreview";
import ClientRegister from "./pages/ClientRegister";
import ClientLogin from "./pages/ClientLogin";
import ClientArea from "./pages/ClientArea";
import ClientSignup from "./pages/ClientSignup";
import ClientDashboard from "./pages/ClientDashboard";
import CompanionDashboard from "./pages/CompanionDashboard";
import MyStories from "./pages/MyStories";
import MyBoosts from "./pages/MyBoosts";
import RankingInfo from "./pages/RankingInfo";
import PinkAssistantChat from "./components/PinkAssistantChat";
import Footer from "./components/Footer";
import BottomNavigation from "./components/BottomNavigation";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const routesWithLocalFooter = [
  "/",
  "/profile",
  "/profile/:id",
  "/perfil/:id",
  "/catalog",
  "/photo-upload",
  "/pricing",
  "/admin-login",
  "/admin-dashboard",
  "/terms-of-use",
  "/privacy-policy",
  "/admin-stories",
  "/client-area",
  "/face-verification",
  "/welcome",
  "/register-success",
  "/service-type",
  "/professional-name-wizard",
];

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h1>
            <p className="text-gray-600 mb-4">
              O site encontrou um erro. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer">Detalhes do erro</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente para controlar a visibilidade da Bottom Navigation
const AppContent = () => {
  const location = useLocation();

  // Detector global de tokens Supabase no hash da URL.
  // Quando o site_url é usado como fallback de redirect (ex: e-mail de
  // confirmação de cadastro sem emailRedirectTo personalizado), o Supabase
  // redireciona para https://pinkhousebr.com#access_token=...&type=signup.
  // Esse efeito captura esse caso em QUALQUER rota e envia para /auth/callback.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    if (!hashParams.get('access_token') && !hashParams.get('error')) return;
    // Já estamos no callback — não redirecionar de novo.
    if (window.location.pathname === '/auth/callback') return;
    // Preservar query params da URL atual (ex: source, companion_id) se existirem.
    const search = window.location.search;
    window.location.replace('/auth/callback' + search + hash);
  }, []);

  // Rotas onde a barra inferior deve ser escondida
  const hideBottomNavRoutes = ['/client-signup', '/client-login', '/client-register', '/profile', '/profile/:id', '/perfil/:id'];
  const shouldHideBottomNav = hideBottomNavRoutes.some((route) =>
    Boolean(matchPath({ path: route, end: true }, location.pathname))
  );

  const hasLocalFooter = routesWithLocalFooter.some((route) =>
    Boolean(matchPath({ path: route, end: true }, location.pathname))
  );

  return (
    <>
      <GlobalHeader />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Navigate to="/catalog" replace />} />
        <Route path="/profile/:id" element={<ProfilePreviewRoute />} />
        <Route path="/editar-perfil/:id" element={<EditarPerfil />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/photo-upload" element={<PhotoUpload />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/ad-video-upload" element={<AdVideoUpload />} />
        <Route path="/mensagens" element={<ChatVip />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/subidas" element={<Subidas />} />
        <Route path="/indique-ganhe" element={<IndiqueGanhe />} />
        <Route path="/photo-video-manager" element={<PhotoVideoManager />} />
        <Route path="/pinkpoints" element={<PinkPoints />} />
        <Route path="/ganhar-pinkpoints" element={<GanharPinkPoints />} />
        <Route path="/converter-pinkpoints" element={<ConverterPinkPoints />} />
        <Route path="/minhas-rositas" element={<MinhasRositas />} />
        <Route path="/perfil/:id" element={<ProfilePreviewRoute />} />

        {/* Rotas Administrativas */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/simple-admin" element={
          <ProtectedRoute requireAdmin={true}>
            <SimpleAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/admin-stories" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminStories />
          </ProtectedRoute>
        } />

        {/* Preview de Cards */}
        <Route path="/card" element={<CardPreview />} />

        {/* ========== ROTAS DE CLIENTE ========== */}
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/signup" element={<ClientSignup />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />

        {/* Rotas antigas de cliente (redirect) */}
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-signup" element={<ClientSignup />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client-register" element={<ClientRegister />} />
        <Route path="/client-area" element={<ClientArea />} />

        {/* ========== ROTAS DE ACOMPANHANTE ========== */}
        <Route path="/companion/login" element={<Login />} />
        <Route path="/companion/signup" element={<AuthRegister />} />
        <Route path="/companion/dashboard" element={<CompanionDashboard />} />

        {/* Rotas antigas de acompanhante (redirect) */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth-register" element={<AuthRegister />} />
        <Route path="/companion-dashboard" element={<CompanionDashboard />} />
        <Route path="/my-stories" element={<MyStories />} />
        <Route path="/my-boosts" element={<MyBoosts />} />
        <Route path="/ranking-info" element={<RankingInfo />} />
        <Route path="/cadastro-modelo" element={<ModelRegister />} />

        {/* Wizard de cadastro de acompanhante */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/basic-info-register" element={<BasicInfoRegister />} />
        <Route path="/service-type" element={<ServiceTypeSelection />} />
        <Route path="/location-register" element={<LocationRegister />} />
        <Route path="/professional-name-wizard" element={<ProfessionalNameWizard />} />
        <Route path="/privacy-selection" element={<PrivacySelection />} />
        <Route path="/face-verification" element={<FaceVerification />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!shouldHideBottomNav && <BottomNavigation />}
      {!hasLocalFooter && <Footer />}
      <LocationPopup />
      <PinkAssistantChat />
    </>
  );
};

const App = () => {
  // Estado para controlar a tela de carregamento - DESABILITADO para teste
  const [isLoading, setIsLoading] = useState(false); // Mudado para false
  // Estado para controlar a animação de fade-out
  const [isFadingOut, setIsFadingOut] = useState(false);

  const splashRef = useRef(null);

  // Efeito para simular o carregamento - COMENTADO PARA TESTE
  // useEffect(() => {
  //   // Simular um tempo de carregamento REDUZIDO para 1 segundo
  //   const timer = setTimeout(() => {
  //     // Iniciar animação de fade-out
  //     setIsFadingOut(true);

  //     // Remover splash screen após a animação terminar
  //     const fadeOutTimer = setTimeout(() => {
  //       setIsLoading(false);
  //     }, 300); // Tempo da animação de fade-out

  //     return () => clearTimeout(fadeOutTimer);
  //   }, 1000); // 1 segundo de tela de carregamento (reduzido de 3.5s)

  //   return () => clearTimeout(timer);
  // }, []);

  // Componente da tela de carregamento
  const SplashScreen = () => (
    <div 
      ref={splashRef}
      className={`fixed inset-0 bg-gradient-to-br from-white via-pink-50 to-white flex flex-col items-center justify-center z-[100] transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 mb-4 relative animate-[bounce_2s_ease-in-out_infinite]">
          <img 
            src="https://i.imgur.com/Cix818V.png" 
            alt="Faixa Rosa Logo" 
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,192,203,0.5)]"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
        
        <div className="text-3xl font-bold leading-tight animate-fade-in">
          <div className="flex items-center space-x-1" style={{ }}>
            <span className="text-black">Faixa</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-velvet-pink-600 via-velvet-pink-400 to-velvet-pink-500 drop-shadow-sm">Rosa</span>
          </div>
        </div>
        
        <div className="mt-8 flex space-x-2">
          <div className="w-2 h-2 bg-velvet-pink-400 rounded-full animate-[ping_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-2 bg-velvet-pink-500 rounded-full animate-[ping_1s_ease-in-out_0.2s_infinite]"></div>
          <div className="w-2 h-2 bg-velvet-pink-600 rounded-full animate-[ping_1s_ease-in-out_0.4s_infinite]"></div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500 font-medium animate-fade-in opacity-80" style={{ animationDelay: '0.7s', letterSpacing: '0.5px' }}>
          Encontrando acompanhantes próximas...
        </div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-velvet-pink-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-l from-velvet-pink-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
    </div>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <TooltipProvider>
            {/* Removido splash screen temporariamente */}
            {/* {isLoading && <SplashScreen />} */}

            <Toaster />
            <Sonner />

            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </LocationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
