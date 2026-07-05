import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient, type EmailOtpType, type Session, type User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { markEmailAsVerified } from '../services/verificationService';

const EMAIL_CONFIRM_TYPES = ['signup', 'email', 'magiclink', 'email_change', 'recovery'];
const supabaseImplicitCallback = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      flowType: 'implicit',
      persistSession: false,
      detectSessionInUrl: true,
    },
  }
);

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processando autenticação...');
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Garantir tempo mínimo de loading visível (evita "piscar" e sumir)
    const startTime = Date.now();
    const MIN_LOADING_MS = 800;
    (async () => {
      await handleCallback();
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getHashParams = () => {
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    return new URLSearchParams(rawHash);
  };

  const fetchLatestCompanion = async (field: 'id' | 'auth_user_id' | 'email', value: string) => {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('id, name, location, auth_user_id, email')
      .eq(field, value)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error(`Erro ao buscar acompanhante por ${field}:`, error);
      return null;
    }

    return (data || [])[0] || null;
  };

  const establishSessionFromUrl = async (): Promise<User | null> => {
    const hashParams = getHashParams();
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (code) {
      console.log('AuthCallback: callback PKCE detectado, trocando code por sessao.');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        if (error.message?.includes('both auth code and code verifier should be non-empty')) {
          console.warn('AuthCallback: code recebido sem code_verifier. Ignorando troca de sessao e seguindo fallback.');
          return null;
        }
        throw error;
      }
      return data.session?.user ?? null;
    }

    if (tokenHash && type) {
      console.log('AuthCallback: callback OTP detectado, verificando token_hash no cliente implicit.');
      const { data, error } = await supabaseImplicitCallback.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      if (error) {
        throw error;
      }
      if (data.session) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (setSessionError) {
          throw setSessionError;
        }
      }
      return data.user ?? data.session?.user ?? null;
    }

    if (accessToken && refreshToken) {
      console.log('AuthCallback: callback implicit detectado, restaurando sessao do hash.');
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        throw error;
      }
      return data.user ?? data.session?.user ?? null;
    }

    const {
      data: { session: implicitSession },
    } = await supabaseImplicitCallback.auth.getSession();

    if (implicitSession?.access_token && implicitSession?.refresh_token) {
      console.log('AuthCallback: sessao implicit detectada, sincronizando com cliente principal.');
      const { error } = await supabase.auth.setSession({
        access_token: implicitSession.access_token,
        refresh_token: implicitSession.refresh_token,
      });
      if (error) {
        throw error;
      }
      return implicitSession.user;
    }

    return null;
  };

  const syncMainClientSession = async (session: Session | null) => {
    if (!session?.access_token || !session.refresh_token) {
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (error) {
      throw error;
    }
  };

  const resolveVerificationCompanionId = async (user: any) => {
    const companionIdFromQuery = searchParams.get('companion_id');
    if (companionIdFromQuery) {
      return companionIdFromQuery;
    }

    const pendingCompanionId = localStorage.getItem('pendingEmailVerification');
    if (pendingCompanionId) {
      return pendingCompanionId;
    }

    const byAuth = await fetchLatestCompanion('auth_user_id', user.id);

    if (byAuth?.id) {
      return byAuth.id;
    }

    if (!user.email) {
      return null;
    }

    const byEmail = await fetchLatestCompanion('email', user.email);

    return byEmail?.id || null;
  };

  const resolveVerificationCompanionIdWithoutUser = async () => {
    const companionIdFromQuery = searchParams.get('companion_id');
    if (companionIdFromQuery) {
      return companionIdFromQuery;
    }

    const pendingCompanionId = localStorage.getItem('pendingEmailVerification');
    if (pendingCompanionId) {
      return pendingCompanionId;
    }

    return null;
  };

  const handleCallback = async () => {
    try {
      console.log('AuthCallback: iniciando processamento.');
      const establishedUser = await establishSessionFromUrl();

      const source = searchParams.get('source');
      const hashParams = getHashParams();
      const typeFromHash = hashParams.get('type');
      const typeFromQuery = searchParams.get('type');
      const isEmailVerification =
        source === 'email_verification' ||
        EMAIL_CONFIRM_TYPES.includes(typeFromHash || '') ||
        EMAIL_CONFIRM_TYPES.includes(typeFromQuery || '');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resolvedUser = session?.user ?? establishedUser;

      if (resolvedUser) {
        if (isEmailVerification) {
          await handleEmailVerificationCallback(resolvedUser);
          return;
        }

        await processUser(resolvedUser, false);
        return;
      }

      const {
        data: { session: implicitSession },
      } = await supabaseImplicitCallback.auth.getSession();

      if (implicitSession?.user) {
        await syncMainClientSession(implicitSession);

        if (isEmailVerification) {
          await handleEmailVerificationCallback(implicitSession.user);
          return;
        }

        await processUser(implicitSession.user, false);
        return;
      }

      if (isEmailVerification) {
        const fallbackCompanionId = await resolveVerificationCompanionIdWithoutUser();

        if (fallbackCompanionId) {
          setStatus('Verificando email...');
          const result = await markEmailAsVerified(fallbackCompanionId);

          if (!result.success) {
            throw new Error(result.message || 'Nao foi possivel concluir a verificacao de email.');
          }

          const companion = await fetchLatestCompanion('id', fallbackCompanionId);

          if (companion) {
            localStorage.setItem(
              'user',
              JSON.stringify({
                id: companion.id,
                email: companion.email,
                name: companion.name || companion.email?.split('@')[0],
                location: companion.location || '',
                type: 'companion',
                isLoggedIn: true,
                companionId: companion.id,
              })
            );
          }

          localStorage.setItem('email_just_confirmed', '1');
          setStatus('Email verificado! Redirecionando...');
          window.setTimeout(() => navigate('/companion-dashboard?openVerification=true'), 1000);
          return;
        }
      }

      throw new Error('Nenhuma sessao foi identificada no callback.');
    } catch (error: any) {
      console.error('Erro no callback:', error);
      setIsError(true);
      setStatus('Não conseguimos confirmar seu e-mail automaticamente.');
      setErrorDetails(error?.message || 'Sessão não identificada. Tente abrir o link novamente ou voltar ao site e clicar em "Já cliquei no link".');
    }
  };

  const handleEmailVerificationCallback = async (user: any) => {
    try {
      setStatus('Verificando email...');
      console.log('AuthCallback: processando verificacao de email para', user.email);

      const resolvedCompanionId = await resolveVerificationCompanionId(user);

      if (resolvedCompanionId) {
        const result = await markEmailAsVerified(resolvedCompanionId);
        console.log('markEmailAsVerified:', result, 'companionId:', resolvedCompanionId);
        if (!result.success) {
          // Surfacar a causa real ao invés de fingir sucesso e seguir.
          throw new Error(result.message || 'Não foi possível confirmar o email no banco.');
        }
      } else {
        console.error('Nao foi possivel resolver o companionId para verificacao de email.');
        throw new Error(
          'Não foi possível identificar a acompanhante para verificar. Volte ao app e clique em "Reenviar link".'
        );
      }

      let companion = await fetchLatestCompanion('auth_user_id', user.id);

      if (!companion && user.email) {
        companion = await fetchLatestCompanion('email', user.email);

        if (companion && !companion.auth_user_id) {
          await supabase
            .from('acompanhantes')
            .update({ auth_user_id: user.id })
            .eq('id', companion.id);
        }
      }

      if (companion) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: companion.name || user.email?.split('@')[0],
            location: companion.location || '',
            type: 'companion',
            isLoggedIn: true,
            companionId: companion.id,
          })
        );
      } else if (user.email) {
        const { data: pendingRegistration } = await supabase
          .from('cadastros_pendentes')
          .select('id, name, display_name, location, auth_user_id')
          .eq('email', user.email)
          .maybeSingle();

        if (pendingRegistration) {
          if (!pendingRegistration.auth_user_id) {
            await supabase
              .from('cadastros_pendentes')
              .update({ auth_user_id: user.id })
              .eq('id', pendingRegistration.id);
          }

          localStorage.setItem(
            'user',
            JSON.stringify({
              id: user.id,
              email: user.email,
              name:
                pendingRegistration.display_name ||
                pendingRegistration.name ||
                user.email?.split('@')[0],
              location: pendingRegistration.location || '',
              type: 'companion',
              isLoggedIn: true,
              isPending: true,
            })
          );
        }
      }

      localStorage.setItem('email_just_confirmed', '1');
      setStatus('Email verificado! Redirecionando...');
      window.setTimeout(() => {
        if (companion) {
          navigate('/companion-dashboard?openVerification=true');
          return;
        }

        navigate('/register-success');
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao verificar email:', error);
      setIsError(true);
      setStatus('Erro ao verificar seu e-mail.');
      setErrorDetails(error?.message || 'Tente novamente clicando no link do e-mail ou volte ao site.');
    }
  };

  const processUser = async (user: any, emailConfirmedRecently = false) => {
    try {
      console.log('Processando usuario:', user.email, '| emailConfirmedRecently:', emailConfirmedRecently);

      const isLoginFlow = localStorage.getItem('isLogin') === 'true';
      const pendingUserType = localStorage.getItem('pendingUserType') || 'client';

      let existingCompanion: any = await fetchLatestCompanion('auth_user_id', user.id);
      if (!existingCompanion) {
        existingCompanion = await fetchLatestCompanion('email', user.email);

        if (existingCompanion && !existingCompanion.auth_user_id) {
          await supabase
            .from('acompanhantes')
            .update({ auth_user_id: user.id })
            .eq('id', existingCompanion.id);
        }
      }

      const { data: clientById } = await supabase
        .from('clientes')
        .select('id, name')
        .eq('id', user.id)
        .maybeSingle();

      let existingClient: any = clientById;
      if (!existingClient) {
        const { data: clientByEmail } = await supabase
          .from('clientes')
          .select('id, name')
          .eq('email', user.email)
          .maybeSingle();
        existingClient = clientByEmail;
      }

      if (existingCompanion) {
        // NÃO verificar email automaticamente aqui.
        // email_confirmed_at é setado automaticamente pelo Supabase quando
        // email confirmation está desabilitado. A verificação de email deve
        // acontecer APENAS pelo fluxo explícito de magic link (handleEmailVerificationCallback).

        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: existingCompanion.name || user.email?.split('@')[0],
            location: existingCompanion.location || '',
            type: 'companion',
            isLoggedIn: true,
            companionId: existingCompanion.id,
          })
        );

        localStorage.removeItem('pendingUserType');
        localStorage.removeItem('isLogin');
        if (emailConfirmedRecently) {
          localStorage.setItem('email_just_confirmed', '1');
        }
        navigate('/companion-dashboard');
        return;
      }

      // Verificar cadastros_pendentes antes de tratar como cliente
      // Acompanhantes que começaram o cadastro mas ainda não finalizaram
      // ficam nessa tabela e NÃO devem ser tratadas como clientes
      let pendingCompanion: any = null;
      if (user.email) {
        const { data: pending } = await supabase
          .from('cadastros_pendentes')
          .select('id, name, display_name, location')
          .eq('email', user.email)
          .maybeSingle();
        pendingCompanion = pending;
      }

      if (pendingCompanion) {
        // Acompanhante com cadastro pendente — redirecionar para continuar o cadastro
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: pendingCompanion.display_name || pendingCompanion.name || user.email?.split('@')[0],
            location: pendingCompanion.location || '',
            type: 'companion',
            isLoggedIn: true,
            isPending: true,
          })
        );
        localStorage.removeItem('pendingUserType');
        localStorage.removeItem('isLogin');
        setStatus('Cadastro em andamento! Redirecionando...');
        navigate('/register-success');
        return;
      }

      if (existingClient) {
        const clientName =
          existingClient.name ||
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0];

        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            user_id: user.id,
            email: user.email,
            name: clientName,
            type: 'client',
            isLoggedIn: true,
            clientId: existingClient.id,
          })
        );
        localStorage.removeItem('pendingUserType');
        localStorage.removeItem('tempAuthData');
        localStorage.removeItem('isLogin');
        setStatus('Login realizado! Redirecionando...');
        navigate('/client-dashboard');
        return;
      }

      // Só auto-criar como cliente se o fluxo explícito de cadastro de cliente
      // marcou pendingUserType. NUNCA auto-criar em login (isLoginFlow), pois
      // acompanhantes que fazem login antes de ter linha em `acompanhantes`
      // estavam virando clientes por engano.
      if (pendingUserType === 'client' && !isLoginFlow) {
        const { data: newClient, error: createError } = await supabase
          .from('clientes')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
          })
          .select('id, name')
          .single();

        if (createError) {
          console.error('Erro ao criar cliente:', createError);
          setStatus('Erro ao criar conta. Redirecionando...');
          window.setTimeout(() => navigate('/client-signup'), 2000);
          return;
        }

        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            user_id: user.id,
            email: user.email,
            name: newClient.name,
            type: 'client',
            isLoggedIn: true,
            clientId: newClient.id,
          })
        );
        localStorage.removeItem('pendingUserType');
        localStorage.removeItem('tempAuthData');
        localStorage.removeItem('isLogin');
        setStatus('Conta criada! Redirecionando...');
        navigate('/client-dashboard');
        return;
      }

      setStatus('Redirecionando para criar senha...');
      localStorage.setItem(
        'tempAuthData',
        JSON.stringify({
          userId: user.id,
          email: user.email,
          username: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
          userType: 'companion',
        })
      );
      localStorage.removeItem('pendingUserType');
      localStorage.removeItem('isLogin');
      navigate('/set-password');
    } catch (error: any) {
      console.error('Erro ao processar usuario:', error);
      setStatus('Erro na autenticacao. Redirecionando...');

      window.setTimeout(() => {
        navigate('/auth-register');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-full mb-6 flex items-center justify-center ${isError ? 'bg-red-50' : 'bg-pink-200 opacity-80'}`}>
          {isError ? (
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <img
              src="https://i.imgur.com/Cix818V.png"
              alt="Faixa Rosa Logo"
              className="w-16 h-16 object-contain"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
        </div>

        {!isError && (
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        )}

        <p className={`text-base font-semibold mb-2 ${isError ? 'text-red-700' : 'text-gray-800'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
          {status}
        </p>

        {errorDetails && (
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{errorDetails}</p>
        )}

        {isError && (
          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-semibold shadow-lg shadow-pink-200 active:scale-[0.98] transition-all"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-full text-gray-600 text-sm hover:text-gray-900 transition-colors"
            >
              Ir para o login
            </button>
          </div>
        )}

        {!isError && (
          <p className="text-xs text-gray-400 mt-2">Por favor, aguarde. Não feche esta tela.</p>
        )}
      </div>
    </div>
  );
}
