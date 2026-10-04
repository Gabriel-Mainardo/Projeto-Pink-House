import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DeleteAccountButtonProps {
  className?: string;
}

export default function DeleteAccountButton({ className = '' }: DeleteAccountButtonProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const requestInProgress = useRef(false);

  const close = () => {
    if (requestInProgress.current) return;
    setStep(0);
    setConfirmation('');
    setError('');
  };

  const deleteAccount = async () => {
    if (confirmation !== 'EXCLUIR' || requestInProgress.current) return;
    requestInProgress.current = true;
    setIsDeleting(true);
    setError('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Sua sessão expirou. Entre novamente antes de excluir a conta.');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('delete-account', {
        body: { confirmation: 'EXCLUIR' },
      });
      if (invokeError) {
        const response = (invokeError as { context?: Response }).context;
        const details = response instanceof Response ? await response.json().catch(() => null) : null;
        throw new Error(details?.error || 'Não foi possível excluir a conta. Tente novamente.');
      }
      if (!data?.success) throw new Error('Não foi possível confirmar a exclusão da conta.');

      await supabase.auth.signOut({ scope: 'local' });
      localStorage.removeItem('user');
      localStorage.removeItem('tempAuthData');
      localStorage.removeItem('pendingUserType');
      window.dispatchEvent(new Event('userLogout'));
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível excluir a conta.');
    } finally {
      requestInProgress.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setStep(1)} className={className}>
        <Trash2 size={20} aria-hidden="true" />
        Excluir conta
      </button>

      {step > 0 && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="delete-account-title" className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Excluir sua conta?' : 'Confirmação final'}
            </h2>

            {step === 1 ? (
              <>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Seu acesso, perfil, conversas e arquivos enviados pela conta serão removidos permanentemente. Esta ação não pode ser desfeita.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={close} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700">
                    Cancelar
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700">
                    Sim, continuar
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); void deleteAccount(); }}>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Para confirmar pela segunda vez, digite <strong>EXCLUIR</strong> abaixo.
                </p>
                <input
                  autoFocus
                  aria-label="Digite EXCLUIR para confirmar"
                  autoComplete="off"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={isDeleting}
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
                {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={close} disabled={isDeleting} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={confirmation !== 'EXCLUIR' || isDeleting} className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {isDeleting ? 'Excluindo...' : 'Excluir minha conta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
