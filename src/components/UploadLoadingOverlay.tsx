import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface UploadLoadingOverlayProps {
  show: boolean;
  message?: string;
  subMessage?: string;
}

/**
 * Overlay fullscreen durante uploads de mídia.
 * Usa createPortal para renderizar no document.body, evitando problemas
 * de stacking context / z-index com modais aninhados.
 */
export default function UploadLoadingOverlay({
  show,
  message = 'Enviando mídia...',
  subMessage = 'Por favor, aguarde. Não feche esta tela.',
}: UploadLoadingOverlayProps) {
  // Bloquear scroll do body enquanto o overlay está ativo
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  if (typeof document === 'undefined') return null;

  const node = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647, // máximo int32 — acima de qualquer coisa
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: 32,
          maxWidth: 320,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,45,141,0.15), rgba(155,79,255,0.15))',
            }}
          />
          <Loader2
            className="animate-spin"
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 48,
              height: 48,
              color: '#d91d83',
            }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{message}</p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{subMessage}</p>
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            overflow: 'hidden',
            borderRadius: 9999,
            background: '#f3f4f6',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              width: '50%',
              background: 'linear-gradient(90deg, #FF2D8D, #9B4FFF)',
              animation: 'upload-overlay-slide 1.4s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes upload-overlay-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );

  return createPortal(node, document.body);
}
