import React from 'react';
import { Flower2, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegisterTypeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'page';
}

const RegisterTypeModal: React.FC<RegisterTypeModalProps> = ({
  isOpen = true,
  onClose,
  variant = 'page',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    navigate('/');
  };

  const handleClientRegister = () => {
    navigate('/client-signup', { state: { userType: 'client' } });
    onClose?.();
  };

  const handleCompanionRegister = () => {
    navigate('/auth-register', { state: { userType: 'companion' } });
    onClose?.();
  };

  const handleLogin = () => {
    navigate('/login');
    onClose?.();
  };

  const wrapperClassName =
    variant === 'modal'
      ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-6 sm:p-6'
      : 'min-h-screen bg-[#f6f3f4] flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10';

  return (
    <div className={wrapperClassName}>
      <div className="mx-auto w-full max-w-[420px] sm:max-w-[560px] lg:max-w-[800px]">
        <div className="relative w-full rounded-[32px] bg-white px-5 pb-7 pt-6 shadow-[0_24px_80px_rgba(34,34,34,0.12)] sm:rounded-[36px] sm:px-8 sm:pb-9 sm:pt-7 lg:px-10 lg:pb-10 lg:pt-8">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute right-5 top-5 text-[#2e2e2e] transition-transform hover:scale-105 hover:text-black sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          </button>

          <div className="px-2 text-center sm:px-8">
            <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#252525] sm:text-[36px]">
              Crie sua conta gratuita
            </h1>
            <p className="mx-auto mt-3 max-w-[320px] text-[16px] leading-[1.45] text-[#7f7f7f] sm:max-w-[420px] sm:text-[19px]">
              Escolha a opção que mais combina com você para começar a brilhar na Pink House.
            </p>
          </div>

          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
            <section className="rounded-[4px] bg-[#eaf4f8] px-4 py-5 sm:px-5 sm:py-6 lg:flex lg:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8dce7]">
                  <ShoppingCart className="h-[18px] w-[18px] text-[#ff4e91]" strokeWidth={2.25} />
                </div>
                <h2 className="text-[18px] font-semibold leading-none text-[#1f1f1f] sm:text-[22px]">
                  Quero ser cliente
                </h2>
              </div>

              <p className="mt-5 flex-1 text-[14px] leading-[1.55] text-[#676767] sm:mt-6 sm:text-[16px]">
                Explore um catálogo exclusivo das melhores acompanhantes da sua região.
              </p>

              <button
                type="button"
                onClick={handleClientRegister}
                className="mt-6 w-full rounded-full bg-[#012d57] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#02213f] sm:mt-7 sm:py-4 sm:text-[17px]"
              >
                Cadastro Cliente
              </button>
            </section>

            <section className="rounded-[4px] bg-[#f8e8ef] px-4 py-5 sm:px-5 sm:py-6 lg:flex lg:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe7ef]">
                  <Flower2 className="h-[18px] w-[18px] text-[#ff4e91]" strokeWidth={2.25} />
                </div>
                <h2 className="text-[18px] font-semibold leading-none text-[#1f1f1f] sm:text-[22px]">
                  Sou acompanhante
                </h2>
              </div>

              <p className="mt-5 flex-1 text-[14px] leading-[1.55] text-[#676767] sm:mt-6 sm:text-[16px]">
                Divulgue seu perfil e alcance milhares de clientes prontos para conhecer você.
              </p>

              <button
                type="button"
                onClick={handleCompanionRegister}
                className="mt-6 w-full rounded-full bg-[#ff4b8b] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#eb3d7d] sm:mt-7 sm:py-4 sm:text-[17px]"
              >
                Cadastro Acompanhante
              </button>
            </section>
          </div>

          <div className="mt-6 text-center text-[15px] text-[#8b8b8b] sm:mt-8 sm:text-[18px]">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={handleLogin}
              className="font-medium text-[#ff4b8b] underline underline-offset-2"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTypeModal;
