import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar se já está logado
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.isLoggedIn && admin.role === 'admin') {
          navigate('/admin-dashboard');
        }
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulação de login administrativo - em produção seria integrado com um backend
    try {
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Senha de admin para acesso rápido
      if (password === 'admin123') {
        // Armazenar informações do admin (em um app real, armazenaria um token JWT)
        localStorage.setItem('admin', JSON.stringify({
          username: 'admin',
          role: 'admin',
          isLoggedIn: true
        }));

        // Redirecionar para o painel de administração
        navigate('/admin-dashboard');
      } else {
        setError('Senha incorreta');
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Card de Login Admin */}
          <div className="bg-white border border-gray-200 p-8 rounded-xl space-y-6 shadow-lg">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-velvet-pink-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-velvet-pink-600" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                Painel <span className="text-transparent bg-clip-text bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600">Administrativo</span>
              </h1>
              <p className="text-gray-600 text-sm">
                Digite a senha de administrador para acessar
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha de Administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:border-velvet-pink-600 focus:outline-none transition-colors pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white rounded-lg py-3 px-4 font-medium hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-velvet-pink-500 focus:ring-offset-2 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Acessar Painel"
                )}
              </button>
              
              <div className="text-center mt-4">
                <Link to="/" className="text-sm text-velvet-pink-600 hover:text-velvet-pink-500">
                  Voltar para o site
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLogin; 