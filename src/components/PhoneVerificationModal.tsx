import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle, HelpCircle, RefreshCw, Smartphone, X } from 'lucide-react';
import {
  confirmPhoneVerificationCode,
  sendPhoneVerificationCode,
} from '../services/verificationService';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId?: string;
  initialPhone?: string;
  onVerified?: (phoneNumber: string) => Promise<void> | void;
}

const OTP_LENGTH = 6;

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  companionId,
  initialPhone = '',
  onVerified,
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState(formatPhone(initialPhone));
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setPhone(formatPhone(initialPhone));
  }, [initialPhone]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return;
    }

    document.body.style.overflow = '';
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(event.target.value));
  };

  const handleSendCode = async () => {
    if (phone.replace(/\D/g, '').length < 11) {
      setError('Informe um celular valido com DDD.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await sendPhoneVerificationCode(phone);

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Nao foi possivel enviar o codigo por SMS.');
      return;
    }

    setNormalizedPhone(result.normalizedPhone || '');
    setCodeSent(true);
    setCode(Array.from({ length: OTP_LENGTH }, () => ''));
    setSuccessMessage(result.message || 'Codigo enviado com sucesso.');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
  };

  const handleCodeChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/\D/g, '').slice(-1);
    const nextCode = [...code];
    nextCode[index] = sanitizedValue;
    setCode(nextCode);

    if (sanitizedValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    if (!companionId) {
      setError('Nao foi possivel identificar a acompanhante para concluir a verificacao.');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length !== OTP_LENGTH) {
      setError('Digite o codigo completo de 6 digitos.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await confirmPhoneVerificationCode(companionId, normalizedPhone || phone, fullCode);

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Codigo invalido ou expirado.');
      return;
    }

    const finalPhone = normalizedPhone || phone;
    await onVerified?.(finalPhone);
    setSuccessMessage(result.message || 'Telefone confirmado com sucesso.');
    setTimeout(() => onClose(), 1000);
  };

  const handleResendCode = async () => {
    setCode(Array.from({ length: OTP_LENGTH }, () => ''));
    await handleSendCode();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#F7F7F8] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-gray-900 text-lg font-bold tracking-tight">
            Confirmar Celular
          </h1>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <main className="px-4 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#d91d83]/10 flex items-center justify-center mb-2">
              <Smartphone className="w-8 h-8 text-[#d91d83]" />
            </div>
            <h2 className="text-gray-900 text-2xl font-bold leading-tight">
              Verifique seu numero
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Enviaremos um codigo por SMS. Depois, confirme os 6 digitos para concluir a etapa.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-900 text-sm font-semibold mb-1.5 block ml-1">
                  Celular
                </span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Smartphone className="w-5 h-5 text-[#d91d83]" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-0000"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#d91d83] focus:ring-2 focus:ring-[#d91d83]/20 transition-all outline-none"
                    disabled={codeSent || isLoading}
                  />
                </div>
              </label>

              {!codeSent && (
                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d91d83] to-[#9C27B0] hover:from-[#D81B60] hover:to-[#8E24AA] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="flex items-center justify-center h-12 w-full">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-white text-base font-bold tracking-wide">
                        Enviar Codigo por SMS
                      </span>
                    )}
                  </div>
                </button>
              )}
            </div>

            {codeSent && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-widest">
                    Verificacao
                  </span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-gray-900 text-sm font-semibold mb-1.5 block ml-1">
                      Codigo de Verificacao
                    </span>
                    <div className="flex gap-2 justify-between">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            inputRefs.current[index] = element;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) => handleCodeChange(index, event.target.value)}
                          onKeyDown={(event) => handleKeyDown(index, event)}
                          placeholder="-"
                          className="w-11 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 bg-gray-50 focus:border-[#d91d83] focus:ring-2 focus:ring-[#d91d83]/20 transition-all outline-none"
                        />
                      ))}
                    </div>
                  </label>

                  <button
                    onClick={handleVerifyCode}
                    disabled={isLoading}
                    className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d91d83] to-[#9C27B0] hover:from-[#D81B60] hover:to-[#8E24AA] shadow-lg shadow-[#d91d83]/25 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center h-12 w-full gap-2">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="text-white text-base font-bold tracking-wide">
                            Confirmar Numero
                          </span>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="text-green-600 text-sm text-center">
                {successMessage}
              </p>
            )}
          </div>

          {codeSent && (
            <div className="flex flex-col items-center gap-4 mt-2">
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="group flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#d91d83] transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Reenviar codigo</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#d91d83] transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Verifique se o provider de SMS do Supabase esta ativo</span>
              </button>
            </div>
          )}
        </main>

        <div className="h-6 w-full bg-[#F7F7F8]"></div>
      </div>
    </div>
  );
}
