import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, Send, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { sendEmailMagicLink, checkEmailVerifiedInDb } from '../services/verificationService';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => Promise<void> | void;
  onStatusChange?: () => Promise<void> | void;
  userEmail?: string;
  companionId?: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
  onStatusChange,
  companionId,
  userEmail = ''
}: EmailVerificationModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref-based guard for synchronous double-click prevention.
  // React state updates are async — the button's disabled attribute may not apply
  // before a second click fires, especially with the async suppression check.
  const sendingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLinkSent(false);
      setFeedback(null);
      setFeedbackType(null);
      setVerified(false);
      setCooldown(0);
      setPolling(false);
    } else {
      // Stop polling when modal closes
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Start polling to detect if user clicked the link
  const startPolling = () => {
    if (!companionId || pollingRef.current) return;
    setPolling(true);

    pollingRef.current = setInterval(async () => {
      // Apenas confere o flag explícito no DB (setado por
      // handleEmailVerificationCallback quando a usuária clica no link).
      // NÃO usar verifyEmail aqui — ele confia em email_confirmed_at do Supabase
      // Auth, que pode ser auto-setado no signup.
      const isVerified = await checkEmailVerifiedInDb(companionId);

      if (isVerified) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setPolling(false);
        setVerified(true);
        setFeedback('Email verificado com sucesso!');
        setFeedbackType('success');
        await onVerified?.();
        await onStatusChange?.();
        setTimeout(() => onClose(), 1500);
      }
    }, 3000); // Check every 3 seconds
  };

  const handleSendLink = async () => {
    if (sendingRef.current || cooldown > 0) return;
    if (!userEmail || !companionId) {
      setFeedback('Email ou ID da acompanhante nao encontrado.');
      setFeedbackType('error');
      return;
    }

    sendingRef.current = true;
    setIsSending(true);
    setFeedback(null);
    setFeedbackType(null);

    try {
      const result = await sendEmailMagicLink(userEmail, companionId);

      if (result.success) {
        setLinkSent(true);
        setCooldown(60);
        setFeedback(result.message || null);
        setFeedbackType('success');
        startPolling();
      } else if (result.message) {
        const secsMatch = result.message.match(/aguarde (\d+) segundo/i);
        if (secsMatch) {
          // Rate limit: um link já foi enviado recentemente (ex: no cadastro).
          // Transiciona para a fase 2 para que o usuário saiba verificar a caixa
          // de entrada, em vez de ficar preso na tela inicial sem feedback.
          const secs = parseInt(secsMatch[1], 10);
          setCooldown(secs);
          setLinkSent(true);
          setFeedback('Um link de verificacao ja foi enviado para este e-mail. Verifique sua caixa de entrada e pasta de spam.');
          setFeedbackType('success');
          startPolling();
        } else {
          setFeedback(result.message);
          setFeedbackType('error');
        }
      }
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleCheckManually = async () => {
    if (!companionId) return;

    // Apenas confere o flag explícito no DB (setado por
    // handleEmailVerificationCallback quando a usuária clica no link).
    const isVerified = await checkEmailVerifiedInDb(companionId);

    if (isVerified) {
      setVerified(true);
      setFeedback('Email verificado com sucesso!');
      setFeedbackType('success');
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setPolling(false);
      await onVerified?.();
      await onStatusChange?.();
      setTimeout(() => onClose(), 1500);
    } else {
      setFeedback('Email ainda nao verificado. Clique no link enviado para seu email.');
      setFeedbackType('error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <UploadLoadingOverlay
      show={isSending}
      message="Enviando link de verificação..."
      subMessage="Estamos disparando o e-mail. Isso pode levar alguns segundos."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#F7F7F8] w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <header className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="flex-1 text-center text-base font-bold leading-tight tracking-tight text-gray-900 pr-9">
            Confirmar E-mail
          </h2>
        </header>

        <main className="px-4 pt-4 pb-6">
          <div className="w-full bg-white rounded-xl shadow-sm p-5 flex flex-col items-center">
            {/* Icon */}
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${verified ? 'bg-green-50' : 'bg-[#d91d83]/5'}`}>
              {verified ? (
                <ShieldCheck className="w-8 h-8 text-green-500" strokeWidth={1.5} />
              ) : (
                <Mail className="w-8 h-8 text-[#d91d83]" strokeWidth={1.5} />
              )}
            </div>

            {/* Title */}
            <h1 className="mb-2 text-center text-lg font-bold leading-tight tracking-tight text-gray-900">
              {verified
                ? 'Email Verificado!'
                : linkSent
                  ? 'Verifique sua caixa de entrada'
                  : 'Verifique seu e-mail'}
            </h1>

            {/* Subtitle */}
            <p className="mb-5 text-center text-sm font-normal leading-relaxed text-gray-600">
              {verified
                ? 'Sua verificacao de email foi concluida com sucesso.'
                : linkSent
                  ? (
                    <>
                      Enviamos um link de verificacao para{' '}
                      <strong className="text-gray-900">{userEmail}</strong>.
                      <br /><br />
                      Abra seu email, clique no botao de verificacao e voce sera redirecionada de volta ao site automaticamente.
                      <br /><br />
                      <span className="text-xs text-gray-400">Verifique tambem sua pasta de spam.</span>
                    </>
                  )
                  : (
                    <>
                      Enviaremos um link de verificacao para{' '}
                      <strong className="text-gray-900">{userEmail}</strong>.
                    </>
                  )
              }
            </p>

            {/* Feedback */}
            {feedback && (
              <div className={`w-full mb-4 p-3 rounded-xl border ${feedbackType === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <p className="text-center text-xs font-medium">
                  {feedback}
                </p>
              </div>
            )}

            {/* Phase 1: Send Link */}
            {!linkSent && !verified && (
              <button
                onClick={handleSendLink}
                disabled={isSending || cooldown > 0}
                className="mb-3 w-full rounded-full py-3 px-5 text-sm font-bold text-white shadow-lg shadow-[#d91d83]/25 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-[#d91d83]/30 flex items-center justify-center gap-2 bg-gradient-to-r from-[#d91d83] to-[#9C27B0] disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  <span>Aguarde {cooldown}s...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar link de verificacao</span>
                  </>
                )}
              </button>
            )}

            {/* Phase 2: Waiting for click */}
            {linkSent && !verified && (
              <>
                {/* Polling indicator */}
                {polling && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#d91d83]" />
                    <span>Aguardando verificacao...</span>
                  </div>
                )}

                {/* Manual check button */}
                <button
                  onClick={handleCheckManually}
                  className="mb-3 w-full rounded-full py-3 px-5 text-sm font-bold text-white shadow-lg shadow-[#d91d83]/25 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-[#d91d83]/30 flex items-center justify-center gap-2 bg-gradient-to-r from-[#d91d83] to-[#9C27B0]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ja cliquei no link</span>
                </button>

                {/* Resend */}
                <button
                  onClick={handleSendLink}
                  disabled={isSending || cooldown > 0}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#d91d83] transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar link'}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
