import React from 'react';
import { CreditCard, MapPin, ScanFace, Timer, Video } from 'lucide-react';
import type { SecurityStepId } from '../lib/security-steps';

export interface SecurityStepDefinition {
  id: SecurityStepId;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const SECURITY_STEP_DEFINITIONS: SecurityStepDefinition[] = [
  {
    id: 'video-call',
    number: 1,
    title: 'Videochamada de 1 minuto',
    description: 'Realize uma chamada rapida pela propria conversa antes do encontro.',
    icon: <Video size={24} />,
  },
  {
    id: 'secure-payment',
    number: 2,
    title: 'Pagamento seguro',
    description: 'Registre o valor do encontro e acompanhe o status de pagamento dentro da conversa.',
    icon: <CreditCard size={24} />,
  },
  {
    id: 'selfie-verification',
    number: 3,
    title: 'Selfie de verificacao',
    description: 'Capture uma selfie para deixar um registro de verificacao associado a conversa.',
    icon: <ScanFace size={24} />,
  },
  {
    id: 'location-checkin',
    number: 4,
    title: 'Check-in no local',
    description: 'Confirme a chegada compartilhando a localizacao no momento do encontro.',
    icon: <MapPin size={24} />,
  },
  {
    id: 'time-monitoring',
    number: 5,
    title: 'Monitoramento de tempo',
    description: 'Defina a duracao esperada e acompanhe o prazo direto na conversa.',
    icon: <Timer size={24} />,
  },
];

export const SECURITY_STEP_LABELS = Object.fromEntries(
  SECURITY_STEP_DEFINITIONS.map((step) => [step.id, step.title])
) as Record<SecurityStepId, string>;
