// Temporary storefront prices for visual development. These packages never
// create payments or wallet credits. Final prices require a separate rollout.
export const PINKCOIN_PREVIEW_MODE: boolean = true;

export interface PinkcoinPreviewPackage {
  code: string;
  name: string;
  description: string;
  coins: number;
  price: number;
  recommended?: boolean;
}

export const pinkcoinPreviewPackages: readonly PinkcoinPreviewPackage[] = [
  { code: 'preview-basic', name: 'Básico', description: 'Para começar a explorar', coins: 100, price: 9.9 },
  { code: 'preview-essential', name: 'Essencial', description: 'Mais possibilidades para seu perfil', coins: 300, price: 24.9 },
  { code: 'preview-boost', name: 'Impulso', description: 'Para dar mais destaque ao seu perfil', coins: 700, price: 49.9, recommended: true },
  { code: 'preview-premium', name: 'Premium', description: 'Mais PinkCoins para aproveitar', coins: 1500, price: 89.9 },
];
