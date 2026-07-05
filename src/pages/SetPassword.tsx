import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InputField from '../components/InputField';
import { useToast } from '../hooks/use-toast';

export default function SetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Detectar fluxo de reset de senha via magic link (resetPasswordForEmail)
    const init = async () => {
      const tempData = localStorage.getItem('tempAuthData');
      if (tempData) {
        const data = JSON.parse(tempData);
        setUserEmail(data.email || '');
        return;
      }

      // Sem tempAuthData: pode ser fluxo de reset de senha
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || '');
        setIsPasswordReset(true);
        return;
      }

      // Sem dados e sem sessão, voltar pro início
      navigate('/auth-register');
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Definindo senha para o usuário...');

      // Atualizar usuário com a nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Erro ao definir senha:', updateError);
        throw updateError;
      }

      console.log('✅ Senha definida com sucesso!');

      toast({
        title: isPasswordReset ? "Senha redefinida!" : "Senha criada!",
        description: "Agora você pode entrar com email e senha.",
      });

      // Fluxo de reset de senha — redirecionar pro login
      if (isPasswordReset) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      // Continuar para o próximo passo
      const tempData = localStorage.getItem('tempAuthData');
      if (tempData) {
        const data = JSON.parse(tempData);

        if (data.userType === 'companion') {
          // Acompanhante → continuar cadastro
          navigate('/basic-info-register');
        } else {
          // Cliente → salvar sessão e ir para home
          localStorage.setItem('user', JSON.stringify({
            id: data.userId,
            user_id: data.userId,
            email: data.email,
            name: data.username,
            type: 'client',
            isLoggedIn: true,
            clientId: data.clientId
          }));
          localStorage.removeItem('tempAuthData');
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('❌ Erro ao definir senha:', err);
      setError(err.message || 'Erro ao criar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 p-6 sm:p-8">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Header Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          Crie sua senha
        </h1>
        <p className="text-gray-500 text-center mb-6 text-base font-normal" style={{ fontFamily: "'Inter', sans-serif" }}>
          Para {userEmail}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <InputField
            id="password"
            label="Senha"
            type="password"
            placeholder="Crie sua senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Criando senha...</span>
                </div>
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-blue-700 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            💡 Com essa senha, você poderá entrar usando seu email e senha, além do Google.
          </p>
        </div>
      </div>
    </div>
  );
}
