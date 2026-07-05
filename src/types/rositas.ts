export interface Product {
  id: string;
  tierName: string;
  price: string;
  rositasAmount: number;
  pinkPoints: number;
  description: string;
  bonusText?: string;
  isRecommended?: boolean;
  highlightColor?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currencyType: 'rositas' | 'love';
  date: string;
}
