import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setError('');
    if (!resetEmail) {
      setError('Informe seu email');
      return;
    }
    setResetLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      if (resetError) throw resetError;
      setResetMessage('Link de redefinição enviado! Verifique sua caixa de entrada.');
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar link de redefinição');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Fazer login com Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Verificar se é cliente - buscar por id (padrão) com fallback por email
        const { data: clienteById } = await supabase
          .from('clientes')
          .select('id, name')
          .eq('id', data.user.id)
          .maybeSingle();

        let cliente = clienteById;
        if (!cliente) {
          // Fallback para registros antigos que podem ter id diferente
          const { data: clienteByEmail } = await supabase
            .from('clientes')
            .select('id, name')
            .eq('email', data.user.email)
            .maybeSingle();
          cliente = clienteByEmail;
        }

        // Verificar se é acompanhante (buscar por auth_user_id primeiro, fallback por email)
        const { data: acompanhantesById } = await supabase
          .from('acompanhantes')
          .select('id, name, location, auth_user_id')
          .eq('auth_user_id', data.user.id)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);

        let acompanhante = acompanhantesById?.[0];
        if (!acompanhante && data.user.email) {
          // Busca case-insensitive por email
          const { data: acompanhantesByEmail } = await supabase
            .from('acompanhantes')
            .select('id, name, location, auth_user_id')
            .ilike('email', data.user.email)
            .order('updated_at', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1);
          acompanhante = acompanhantesByEmail?.[0];

          // Se encontrou por email mas não tem auth_user_id, atualizar
          if (acompanhante && !acompanhante.auth_user_id) {
            await supabase
              .from('acompanhantes')
              .update({ auth_user_id: data.user.id })
              .eq('id', acompanhante.id);
            console.log('✅ auth_user_id atualizado para acompanhante:', acompanhante.id);
          }
        }

        console.log('🔍 LOGIN DEBUG', {
          authId: data.user.id,
          authEmail: data.user.email,
          clienteById: !!clienteById,
          clienteByEmail: !!cliente,
          acompByAuthId: !!acompanhantesById?.[0],
          acompByEmail: !acompanhantesById?.[0] && !!acompanhante,
          acompanhanteId: acompanhante?.id ?? null,
          resultado: acompanhante ? 'companion' : cliente ? 'client' : 'sem-perfil',
        });

        if (acompanhante) {
          // Acompanhante → companion dashboard
          localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: acompanhante.name,
            location: acompanhante.location || '',
            type: 'companion',
            isLoggedIn: true,
            companionId: acompanhante.id
          }));
          navigate('/companion-dashboard');
        } else if (cliente) {
          // Verificar se também tem cadastro pendente como acompanhante
          // Se sim, priorizar acompanhante
          const { data: pendingCompanion } = await supabase
            .from('cadastros_pendentes')
            .select('id, name, display_name, location')
            .eq('email', data.user.email)
            .maybeSingle();

          if (pendingCompanion) {
            localStorage.setItem('user', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: pendingCompanion.display_name || pendingCompanion.name || data.user.email?.split('@')[0],
              location: pendingCompanion.location || '',
              type: 'companion',
              isLoggedIn: true,
              isPending: true,
            }));
            navigate('/register-success');
          } else {
            // Cliente existente → home
            localStorage.setItem('user', JSON.stringify({
              id: data.user.id,
              user_id: data.user.id,
              email: data.user.email,
              name: cliente.name,
              type: 'client',
              isLoggedIn: true,
              clientId: cliente.id
            }));
            navigate('/');
          }
        } else {
          // Verificar cadastros_pendentes antes de auto-criar como cliente
          const { data: pendingCompanion } = await supabase
            .from('cadastros_pendentes')
            .select('id, name, display_name, location')
            .eq('email', data.user.email)
            .maybeSingle();

          if (pendingCompanion) {
            localStorage.setItem('user', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: pendingCompanion.display_name || pendingCompanion.name || data.user.email?.split('@')[0],
              location: pendingCompanion.location || '',
              type: 'companion',
              isLoggedIn: true,
              isPending: true,
            }));
            navigate('/register-success');
          } else {
            // Usuário existe no Auth mas não tem perfil em nenhuma tabela.
            // NÃO auto-criar como cliente — acompanhantes estavam sendo
            // classificadas erroneamente. Mandar pra escolher tipo de conta.
            await supabase.auth.signOut();
            setError('Conta sem perfil. Refaça o cadastro escolhendo o tipo de conta.');
            setTimeout(() => navigate('/auth-register'), 1500);
            return;
          }
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else {
        setError(error.message || 'Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register attempt:", { registerEmail, registerUsername, registerPassword });
    // Redirecionar para página de cadastro completo
    navigate('/cadastro-modelo');
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center p-4 pt-6 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dtvsnunnl/image/upload/v1763546949/ChatGPT_Image_19_de_nov._de_2025_07_08_50_atgldh.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-background/30" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-3xl shadow-2xl p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 whitespace-nowrap">
              Pink House
            </h1>
            <p className="text-muted-foreground text-lg">
              Acesso exclusivo à elite.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-xl border-input bg-background/50 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-xl border-input bg-background/50 pr-12 placeholder:text-muted-foreground/60"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Entrar"
              )}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setShowReset(v => !v); setResetMessage(''); setError(''); }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {showReset ? 'Voltar' : 'Esqueceu a senha?'}
              </button>
            </div>
          </form>

          {showReset && (
            <form onSubmit={handleResetPassword} className="mt-4 space-y-3 p-4 rounded-xl bg-muted/40 border">
              <Label htmlFor="resetEmail" className="text-sm">Receber link de redefinição por email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
              {resetMessage && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {resetMessage}
                </div>
              )}
              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full h-12 rounded-xl"
              >
                {resetLoading ? 'Enviando...' : 'Enviar link'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted-foreground text-sm">ou</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <Button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                localStorage.setItem('isLogin', 'true');
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                  },
                });
                if (error) {
                  setError(error.message);
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/auth-register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>

          {/* Terms and Privacy Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao continuar você concorda com os nossos{' '}
              <Link to="/terms-of-use" className="underline hover:text-gray-700">
                termos de serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy-policy" className="underline hover:text-gray-700">
                política de privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
