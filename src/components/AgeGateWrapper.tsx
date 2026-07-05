import React, { useState } from 'react';
import { AgeGateModal } from './AgeGateModal';
import { AgeGateDenied } from './AgeGateDenied';

interface AgeGateWrapperProps {
  children: React.ReactNode;
}

const AGE_GATE_COOKIE_NAME = 'faixa_rosa_age_verified';
const AGE_GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const hasAgeGateCookie = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${AGE_GATE_COOKIE_NAME}=true`);
};

const setAgeGateCookie = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AGE_GATE_COOKIE_NAME}=true; Max-Age=${AGE_GATE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secureFlag}`;
};

export const AgeGateWrapper: React.FC<AgeGateWrapperProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean>(() => hasAgeGateCookie());
  const [showDenyMessage, setShowDenyMessage] = useState<boolean>(false);

  const handleConfirm = () => {
    setAgeGateCookie();
    setIsVerified(true);
  };

  const handleDeny = () => {
    setShowDenyMessage(true);
  };

  const handleBack = () => {
    setShowDenyMessage(false);
  };

  // Mostrar mensagem de acesso negado
  if (showDenyMessage) {
    return <AgeGateDenied onBack={handleBack} />;
  }

  // Mostrar modal de verificação de idade
  if (!isVerified) {
    return <AgeGateModal onConfirm={handleConfirm} onDeny={handleDeny} />;
  }

  // Mostrar conteúdo se verificado
  return <>{children}</>;
};
