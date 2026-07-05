import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Flower2, X } from 'lucide-react';

const ClientLogin = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleClientRegister = () => {
    navigate('/client-signup', { state: { userType: 'client' } });
  };

  const handleCompanionRegister = () => {
    navigate('/auth-register', { state: { userType: 'companion' } });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f6f3f4] px-4 py-6 sm:px-6 sm:py-10 relative overflow-hidden">
      {/* Background decorativo desktop */}
      <div className="hidden md:block fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#ff4b8b]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/8 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[420px] items-center justify-center md:max-w-[720px] lg:max-w-[800px]">
        <div className="relative w-full rounded-[32px] bg-white px-5 pb-7 pt-6 shadow-[0_24px_80px_rgba(34,34,34,0.12)] sm:rounded-[36px] sm:px-8 sm:pb-9 sm:pt-7 md:px-10 md:pb-10 md:pt-8">
          {/* Botão fechar */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute right-5 top-5 text-[#2e2e2e] transition-transform hover:scale-105 hover:text-black sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          </button>

          {/* Título e subtítulo */}
          <div className="px-2 text-center sm:px-8">
            <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#252525] sm:text-[36px]">
              Crie sua conta gratuita
            </h1>
            <p className="mx-auto mt-3 max-w-[320px] text-[16px] leading-[1.45] text-[#7f7f7f] sm:max-w-[420px] sm:text-[19px]">
              Escolha a opção que mais combina com você para começar a brilhar na Faixa Rosa.
            </p>
          </div>

          {/* Cards de seleção */}
          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
            {/* Card Cliente */}
            <section className="rounded-[20px] bg-[#eaf4f8] px-5 py-5 sm:px-6 sm:py-6 md:flex md:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8dce7]">
                  <ShoppingCart className="h-[18px] w-[18px] text-[#ff4e91]" strokeWidth={2.25} />
                </div>
                <h2 className="text-[18px] font-semibold leading-none text-[#1f1f1f] sm:text-[22px]">
                  Quero ser cliente
                </h2>
              </div>

              <p className="mt-4 text-[14px] leading-[1.55] text-[#676767] sm:mt-5 sm:text-[17px]">
                Explore um catálogo exclusivo das melhores acompanhantes da sua região.
              </p>

              <button
                type="button"
                onClick={handleClientRegister}
                className="mt-5 w-full rounded-full bg-[#012d57] px-5 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#02213f] hover:shadow-lg active:scale-[0.98] sm:mt-6 sm:py-3.5 sm:text-[17px] md:mt-auto md:pt-3"
              >
                Cadastro Cliente
              </button>
            </section>

            {/* Card Acompanhante */}
            <section className="rounded-[20px] bg-[#f8e8ef] px-5 py-5 sm:px-6 sm:py-6 md:flex md:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe7ef]">
                  <Flower2 className="h-[18px] w-[18px] text-[#ff4e91]" strokeWidth={2.25} />
                </div>
                <h2 className="text-[18px] font-semibold leading-none text-[#1f1f1f] sm:text-[22px]">
                  Sou acompanhante
                </h2>
              </div>

              <p className="mt-4 text-[14px] leading-[1.55] text-[#676767] sm:mt-5 sm:text-[17px]">
                Divulgue seu perfil e alcance milhares de clientes prontos para conhecer você.
              </p>

              <button
                type="button"
                onClick={handleCompanionRegister}
                className="mt-5 w-full rounded-full bg-[#ff4b8b] px-5 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#eb3d7d] hover:shadow-lg active:scale-[0.98] sm:mt-6 sm:py-3.5 sm:text-[17px] md:mt-auto md:pt-3"
              >
                Cadastro Acompanhante
              </button>
            </section>
          </div>

          {/* Link de login */}
          <div className="mt-6 text-center text-[15px] text-[#8b8b8b] sm:mt-8 sm:text-[17px]">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={handleLogin}
              className="font-medium text-[#ff4b8b] underline underline-offset-2 transition-colors hover:text-[#eb3d7d]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
