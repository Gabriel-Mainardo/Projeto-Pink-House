import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RegisterTypeModal from '../components/RegisterTypeModal';

const ClientSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedUserType = location.state?.userType as 'client' | 'companion' | undefined;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasAuthenticatedUser, setHasAuthenticatedUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuthState = async () => {
      try {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          if (isMounted) {
            setHasAuthenticatedUser(true);
            setIsCheckingAuth(false);
          }
          return;
        }

        const { data } = await supabase.auth.getSession();

        if (isMounted) {
          setHasAuthenticatedUser(Boolean(data.session?.user));
          setIsCheckingAuth(false);
        }
      } catch (authError) {
        console.error('Erro ao verificar sessao no cadastro de cliente:', authError);
        if (isMounted) {
          setHasAuthenticatedUser(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validação simples de email - aceita qualquer coisa com @ e algo depois
  const isValidEmail = (email: string) => {
    return email.includes('@') && email.split('@')[1]?.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso para prosseguir');
      return;
    }

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Email inválido. Verifique o formato.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // PRIMEIRO: Verificar se email já existe como acompanhante
      const { data: existingCompanion } = await supabase
        .from('acompanhantes')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingCompanion) {
        throw new Error('Este email já está cadastrado como acompanhante. Use outro email ou faça login como acompanhante.');
      }

      // Criar conta no Supabase Auth
      let authUser: any = null;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'client',
            username: formData.username,
          },
        },
      });

      if (signUpError) {
        // Se o usuário já existe no Auth, tentar fazer login
        if (signUpError.message?.includes('already registered') || signUpError.message?.includes('User already registered')) {
          console.log('⚠️ Usuário já existe no Auth, tentando login automático...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            throw new Error('Este email já está cadastrado. Faça login com sua senha.');
          }
          authUser = signInData.user;
        } else {
          throw signUpError;
        }
      } else {
        authUser = data?.user;

        // Se signup não criou sessão, fazer login
        if (!data?.session && authUser) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (signInData?.user) authUser = signInData.user;
        }
      }

      if (authUser) {
        const data = { user: authUser };
        console.log('✅ Usuário criado no Auth:', data.user.id);
        console.log('📧 Email:', formData.email);
        console.log('👤 Nome:', formData.username);

        // Verificar se já existe um registro para este id (id = auth.users.id)
        const { data: existingClient } = await supabase
          .from('clientes')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingClient) {
          // Criar registro na tabela de clientes apenas se não existir
          console.log('📝 Tentando inserir cliente no banco:', {
            id: data.user.id,
            email: formData.email,
            name: formData.username
          });

          const { data: insertedData, error: insertError } = await supabase
            .from('clientes')
            .insert({
              id: data.user.id,
              email: formData.email,
              name: formData.username
            })
            .select();

          if (insertError) {
            console.error('❌ Erro ao criar cliente:', insertError);
            console.error('📋 Código do erro:', insertError.code);
            console.error('📋 Mensagem do erro:', insertError.message);
            console.error('📋 Detalhes completos:', JSON.stringify(insertError, null, 2));

            // Se o erro for do trigger de email duplicado, mostrar mensagem clara
            if (insertError.message?.includes('já está cadastrado')) {
              throw new Error(insertError.message);
            }

            throw insertError;
          }

          console.log('✅ Cliente criado com sucesso no banco!', insertedData);
        } else {
          console.log('✅ Cliente já existe no banco, fazendo login...');
        }

        // Salvar dados do cliente no localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          user_id: data.user.id,
          email: formData.email,
          name: formData.username,
          type: 'client',
          isLoggedIn: true,
          clientId: data.user.id
        }));

        // Redirecionar para dashboard do cliente
        navigate('/client-dashboard');
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);

      // Tratar erros específicos
      if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login.');
      } else if (err.message?.includes('invalid email')) {
        setError('Email inválido');
      } else if (err.code === '23505' || err.message?.includes('duplicate key')) {
        // Usuário já existe - redirecionar para login
        setError('Esta conta já existe. Redirecionando para login...');
        setTimeout(() => {
          navigate('/client-login');
        }, 2000);
      } else if (err.code === '23503' || err.message?.includes('foreign key')) {
        setError('Erro de configuração do banco. Contate o suporte.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Salvar tipo de usuário antes de redirecionar
      localStorage.setItem('pendingUserType', 'client');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erro no Google Sign In:', error);
        throw error;
      }
    } catch (err: any) {
      console.error('Erro ao fazer login com Google:', err);
      setError(err.message || 'Erro ao fazer login com Google. Tente novamente.');
      setIsLoading(false);
    }
  };


  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f6f3f4] flex items-center justify-center p-6">
        <div className="h-10 w-10 rounded-full border-4 border-[#ff4b8b]/20 border-t-[#ff4b8b] animate-spin" />
      </div>
    );
  }

  if (!hasAuthenticatedUser && requestedUserType !== 'client') {
    return <RegisterTypeModal variant="page" />;
  }

  return (
    <div className="bg-[#FFF0F5] dark:bg-[#18181B] min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Background Blobs */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full pointer-events-none opacity-50 dark:opacity-20 hidden md:block">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FF3385]/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-md bg-white dark:bg-[#27272A] rounded-[2rem] shadow-[0_4px_20px_-2px_rgba(255,51,133,0.1)] dark:shadow-none overflow-hidden relative">
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF3385] to-purple-500"></div>

        {/* Header */}
        <div className="px-6 pt-6 pb-1 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#FF3385] transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <span className="material-icons-round text-2xl">arrow_back</span>
          </button>
          <div className="w-8"></div>
        </div>

        <div className="px-8 pb-8">
          {/* Title Section */}
          <div className="text-center mt-2 mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-100 dark:bg-pink-900/30 text-[#FF3385] mb-3 shadow-[0_0_15px_rgba(255,51,133,0.3)]">
              <span className="material-icons-round text-2xl">person_add</span>
            </div>
            <h1 className="text-xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mb-1.5 font-['Poppins',sans-serif]">
              Cadastro de <span className="text-[#FF3385]">Cliente</span>
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
              Crie sua conta gratuita para navegar pelo catálogo exclusivo.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="group relative">
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 ml-1" htmlFor="username">
                Nome de usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF3385] transition-colors">person</span>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3 bg-[#F9FAFB] dark:bg-[#3F3F46] border-transparent focus:border-[#FF3385] focus:ring-2 focus:ring-[#FF3385]/20 rounded-xl text-[#1F2937] dark:text-[#F3F4F6] placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium transition-all duration-200 ease-in-out outline-none"
                  id="username"
                  name="username"
                  placeholder="crie seu usuario"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="group relative">
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF3385] transition-colors">email</span>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3 bg-[#F9FAFB] dark:bg-[#3F3F46] border-transparent focus:border-[#FF3385] focus:ring-2 focus:ring-[#FF3385]/20 rounded-xl text-[#1F2937] dark:text-[#F3F4F6] placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium transition-all duration-200 ease-in-out outline-none"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  type="text"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 ml-1" htmlFor="password">
                Crie sua senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF3385] transition-colors">lock</span>
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-3 bg-[#F9FAFB] dark:bg-[#3F3F46] border-transparent focus:border-[#FF3385] focus:ring-2 focus:ring-[#FF3385]/20 rounded-xl text-[#1F2937] dark:text-[#F3F4F6] placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium transition-all duration-200 ease-in-out outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-[#1F2937] dark:hover:text-[#F3F4F6] transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-icons-round text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center pt-2">
              <label className="flex items-center cursor-pointer relative">
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors mr-3 ${
                  acceptTerms
                    ? 'bg-[#FF3385] border-[#FF3385]'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}>
                  {acceptTerms && (
                    <svg className="w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] select-none">
                  Aceito os{' '}
                  <Link to="/terms-of-use" className="text-[#FF3385] hover:text-[#E62E76] underline decoration-[#FF3385]/30 underline-offset-2 font-medium">
                    termos de uso
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Criar conta</span>
                    <span className="material-icons-round text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-[#27272A] text-xs text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider font-medium">
                ou continuar com
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2 text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6]">Continuar com Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Já tem uma conta?{' '}
              <Link to="/client-login" className="text-[#FF3385] hover:text-[#E62E76] font-semibold transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientSignup;
