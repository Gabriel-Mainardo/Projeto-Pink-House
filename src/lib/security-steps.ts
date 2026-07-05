export const SECURITY_STEP_IDS = [
  'video-call',
  'secure-payment',
  'selfie-verification',
  'location-checkin',
  'time-monitoring',
] as const;

export type SecurityStepId = (typeof SECURITY_STEP_IDS)[number];

export type PaymentStatus =
  | 'not_requested'
  | 'awaiting_payment'
  | 'paid'
  | 'released'
  | 'failed';

export type MonitoringStatus =
  | 'idle'
  | 'configured'
  | 'active'
  | 'overdue'
  | 'completed';

export interface DurationOption {
  value: string;
  label: string;
  minutes: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { value: '30min', label: '30 minutos', minutes: 30 },
  { value: '1h', label: '1 hora', minutes: 60 },
  { value: '1h30', label: '1 hora e 30 minutos', minutes: 90 },
  { value: '2h', label: '2 horas', minutes: 120 },
  { value: '3h', label: '3 horas', minutes: 180 },
  { value: 'pernoite', label: 'Pernoite', minutes: 720 },
];

export function durationToMinutes(duration: string | null | undefined): number {
  const option = DURATION_OPTIONS.find((item) => item.value === duration);
  return option?.minutes ?? 0;
}

export function durationToLabel(duration: string | null | undefined): string {
  const option = DURATION_OPTIONS.find((item) => item.value === duration);
  return option?.label ?? duration ?? '';
}

export function addMinutesToIso(baseIso: string, minutes: number): string {
  const base = new Date(baseIso);
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}

export function formatCurrencyBRL(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'R$ 0,00';
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDateTime(iso: string | null | undefined): string | undefined {
  if (!iso) {
    return undefined;
  }

  return new Date(iso).toLocaleString('pt-BR');
}

export function getRemainingMilliseconds(expiresAt: string | null | undefined): number {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(new Date(expiresAt).getTime() - Date.now(), 0);
}

export function formatRemainingTime(expiresAt: string | null | undefined): string {
  const remaining = getRemainingMilliseconds(expiresAt);
  if (remaining <= 0) {
    return 'Tempo esgotado';
  }

  const totalMinutes = Math.floor(remaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }

  return `${minutes}min`;
}

export function uniqStepIds(stepIds: readonly string[]): SecurityStepId[] {
  const unique = Array.from(new Set(stepIds));
  return unique.filter((stepId): stepId is SecurityStepId =>
    SECURITY_STEP_IDS.includes(stepId as SecurityStepId)
  );
}
