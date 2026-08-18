const ERROR_MESSAGES: Record<string, string> = {
  AUTHENTICATION_REQUIRED: 'Faça login para continuar.',
  COMPANION_PROFILE_REQUIRED: 'Esta funcionalidade está disponível para perfis de acompanhante.',
  INSUFFICIENT_PINKCOINS: 'Saldo de PinkCoins insuficiente.',
  INSUFFICIENT_PINKPOINTS: 'Saldo de PinkPoints insuficiente.',
  RESOURCE_NOT_FOUND: 'O recurso solicitado não foi encontrado.',
  RESOURCE_DISABLED: 'Este recurso ainda não está disponível para compra com PinkCoins.',
  RESOURCE_REQUIRES_PINKCOINS: 'Este recurso agora deve ser ativado com PinkCoins.',
  RESOURCE_CONFIGURATION_INVALID: 'A configuração deste recurso precisa ser revisada.',
  RESOURCE_DAILY_LIMIT_REACHED: 'O limite diário deste recurso foi atingido.',
  RESOURCE_COOLDOWN_ACTIVE: 'Aguarde o intervalo mínimo antes de realizar uma nova subida.',
  REWARD_NOT_FOUND: 'A recompensa não foi encontrada.',
  REWARD_UNAVAILABLE: 'Esta recompensa está indisponível.',
  REWARD_OUT_OF_STOCK: 'Esta recompensa está esgotada.',
  MINIMUM_REDEMPTION_NOT_REACHED: 'É necessário atingir o saldo mínimo para realizar resgates.',
  TRANSACTION_ALREADY_PROCESSED: 'Esta operação já foi processada.',
  IDEMPOTENCY_KEY_REQUIRED: 'Não foi possível identificar esta operação. Tente novamente.',
  PAYMENT_NOT_CONFIRMED: 'O pagamento ainda não foi confirmado.',
  ADMIN_AUTHORIZATION_REQUIRED: 'É necessária uma sessão administrativa segura.',
};

export class PinkEconomyError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message || ERROR_MESSAGES[code] || 'Não foi possível concluir a operação.');
    this.name = 'PinkEconomyError';
  }
}

export const parsePinkEconomyError = (error: unknown): PinkEconomyError => {
  const rawMessage = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : String(error || '');

  const code = Object.keys(ERROR_MESSAGES).find((candidate) => rawMessage.includes(candidate));
  return new PinkEconomyError(code || 'PINK_ECONOMY_ERROR', code ? undefined : rawMessage);
};

export const createIdempotencyKey = (scope: string) => {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${scope}:${id}`;
};
