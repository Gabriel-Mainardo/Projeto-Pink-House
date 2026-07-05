import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InputField from '../components/InputField';
import RegisterTypeModal from '../components/RegisterTypeModal';

export default function AuthRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedUserType = location.state?.userType as 'client' | 'companion' | undefined;
  const userType = requestedUserType === 'client' ? 'client' : 'companion';
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasAuthenticatedUser, setHasAuthenticatedUser] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (requestedUserType === 'client') {
      navigate('/client-signup', { replace: true });
    }
  }, [navigate, requestedUserType]);

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
      } catch (error) {
        console.error('Erro ao verificar sessao no cadastro de acompanhante:', error);
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

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Validação simples de email - aceita qualquer coisa com @ e algo depois
  const isValidEmail = (email: string) => {
    return email.includes('@') && email.split('@')[1]?.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.email || !formData.password) {
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
      // PRIMEIRO: Verificar se email já existe em outra categoria
      if (userType === 'companion') {
        // Se está cadastrando como acompanhante, verificar se já é cliente
        const { data: existingClient } = await supabase
          .from('clientes')
          .select('email')
          .eq('email', formData.email)
          .single();

        if (existingClient) {
          throw new Error('Este email já está cadastrado como cliente. Use outro email ou faça login como cliente.');
        }
      } else if (userType === 'client') {
        // Se está cadastrando como cliente, verificar se já é acompanhante
        const { data: existingCompanion } = await supabase
          .from('acompanhantes')
          .select('email')
          .eq('email', formData.email)
          .single();

        if (existingCompanion) {
          throw new Error('Este email já está cadastrado como acompanhante. Use outro email ou faça login como acompanhante.');
        }
      }

      // Criar conta no Supabase Auth
      let authUser: any = null;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            user_type: userType,
          },
        },
      });

      if (signUpError) {
        // Se o usuário já existe no Auth, tentar fazer login em vez de falhar
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
          console.log('✅ Login automático bem sucedido para usuário existente');
        } else {
          throw signUpError;
        }
      } else {
        authUser = data?.user;

        // Se signup não criou sessão (ex: email confirmation ativo), tentar login
        if (!data?.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            // Se falhar auto-login, continuar sem sessão — o user ID do signup é suficiente
            // para prosseguir com o cadastro
            console.warn('⚠️ Auto-login falhou após signup, continuando com dados do signup:', signInError.message);
          } else {
            authUser = signInData.user;
          }
        }
      }

      // Continuar com o fluxo
      if (authUser) {
        const data = { user: authUser };
        // Salvar dados temporários no localStorage
        const tempData = {
          userId: data.user.id,
          email: formData.email,
          userType: userType,
        };

        console.log('💾 AuthRegister - Salvando tempAuthData:', tempData);
        localStorage.setItem('tempAuthData', JSON.stringify(tempData));

        // Verificar se salvou
        const verificacao = localStorage.getItem('tempAuthData');
        console.log('✅ AuthRegister - Verificação após salvar:', verificacao);

        // Redirecionar
        if (userType === 'companion') {
          // Acompanhante precisa completar cadastro
          console.log('🚀 AuthRegister - Navegando para /basic-info-register');
          navigate('/basic-info-register');
        } else {
          // Cliente vai direto pra HOME mas ainda precisa preencher nome
          // Vamos redirecionar para uma página de completar cadastro de cliente também
          navigate('/client-signup', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);

      // Mensagens de erro amigáveis
      if (err.message?.includes('already registered')) {
        setError('Este email já está cadastrado. Faça login.');
      } else if (err.message?.includes('invalid email')) {
        setError('Email inválido');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      setError('');

      console.log(`🔵 Iniciando ${provider} Sign In...`);
      console.log('🔵 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔵 Redirect to:', `${window.location.origin}/auth/callback`);

      // Salvar o tipo de usuário no localStorage antes de redirecionar
      localStorage.setItem('pendingUserType', userType);

      // Redirecionar para OAuth (Google ou Facebook)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...(provider === 'google' && {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          }),
        },
      });

      console.log(`🔵 Resposta do signInWithOAuth (${provider}):`, { data, error });

      if (error) {
        console.error(`❌ Erro no ${provider} Sign In:`, error);
        console.error('❌ Erro completo:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log(`✅ Redirecionando para ${provider}...`);
    } catch (err: any) {
      console.error(`❌ Erro ao fazer login com ${provider}:`, err);
      console.error('❌ Erro detalhado:', {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err
      });
      setError(err.message || `Erro ao fazer login com ${provider}. Tente novamente.`);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleSocialSignIn('google');
  const handleFacebookSignIn = () => handleSocialSignIn('facebook');
  const handleAppleSignIn = () => handleSocialSignIn('apple');

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f6f3f4] flex items-center justify-center p-6">
        <div className="h-10 w-10 rounded-full border-4 border-[#ff4b8b]/20 border-t-[#ff4b8b] animate-spin" />
      </div>
    );
  }

  if (!hasAuthenticatedUser && !requestedUserType) {
    return <RegisterTypeModal variant="page" />;
  }

  if (requestedUserType === 'client') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-gray-600">Redirecionando para o cadastro de cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 p-6 sm:p-8">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Header Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          Crie sua conta
        </h1>
        <p className="text-gray-500 text-center mb-6 text-base font-normal" style={{ fontFamily: "'Inter', sans-serif" }}>
          Bem-vinda a Pink House.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <InputField
            id="email"
            label="E-mail"
            type="text"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange('email')}
            autoComplete="email"
          />

          <InputField
            id="password"
            label="Crie sua senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange('password')}
          />

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            </div>
          )}

          <div className="mt-6 mb-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 rounded-2xl
                bg-gradient-to-r from-[#FF5C8D] to-[#FF9EB8]
                text-white font-bold text-lg
                shadow-lg shadow-pink-200/50
                hover:shadow-pink-300/60
                active:scale-[0.99] transition-all duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Criando conta...</span>
                </div>
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </form>

        {/* Social Login Section */}
        <div className="w-full space-y-3 mb-6">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
              Continuar com Google
            </span>
          </button>

        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#d91d83] font-bold hover:underline"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}




