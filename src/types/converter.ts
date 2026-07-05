export interface ConversionState {
  balance: number;
  conversionRate: number;
  inputValue: number;
}

export interface AdvisorResponse {
  advice: string;
  sentiment: 'positive' | 'neutral' | 'caution';
}
