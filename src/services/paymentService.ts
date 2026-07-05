import { supabase } from '../lib/supabase';

export type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO';
export type TransactionType = 'rositas' | 'boost' | 'story' | 'secure_payment';
export type TransactionStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'FAILED'
  | 'REFUNDED'
  | 'OVERDUE'
  | 'NOT_FOUND';

export interface PaymentRequest {
  customerName: string;
  customerEmail?: string;
  customerCpf: string;
  customerPhone?: string;
  value: number;
  description: string;
  billingType: BillingType;
  transactionType: TransactionType;
  referenceId: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  asaas_payment_id: string;
  asaas_customer_id?: string | null;
  transaction_type: TransactionType;
  reference_id: string;
  amount: number;
  billing_type: BillingType;
  status: TransactionStatus;
  external_reference?: string | null;
  description?: string | null;
  webhook_data?: unknown;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PixPaymentResult {
  success: true;
  paymentId: string;
  pixQrCode: {
    encodedImage: string;
    payload: string;
    expirationDate: string;
  };
  invoiceUrl: string;
  externalReference: string;
}

export interface CreditCardPaymentResult {
  success: true;
  paymentId: string;
  status: string;
  invoiceUrl: string;
  externalReference: string;
}

export interface BoletoPaymentResult {
  success: true;
  paymentId: string;
  bankSlipUrl: string;
  invoiceUrl: string;
  externalReference: string;
}

export interface PaymentStatusResult {
  success: true;
  status: TransactionStatus;
  transaction: PaymentTransaction | null;
}

type PaymentResult = PixPaymentResult | CreditCardPaymentResult | BoletoPaymentResult;

export async function createPayment(request: PaymentRequest): Promise<PaymentResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Usuario nao autenticado. Faca login para continuar.');
  }

  const { data, error } = await supabase.functions.invoke('asaas-payment', {
    body: {
      action: 'create_payment',
      ...request,
    },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao criar cobranca');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Erro ao processar pagamento');
  }

  return data as PaymentResult;
}

export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
  const { data, error } = await supabase.functions.invoke('asaas-payment', {
    body: {
      action: 'check_status',
      paymentId,
    },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao verificar status');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Erro ao verificar pagamento');
  }

  return data as PaymentStatusResult;
}

export function pollPaymentStatus(
  paymentId: string,
  onStatusChange: (status: TransactionStatus, transaction: PaymentTransaction | null) => void,
  intervalMs = 5000,
  maxAttempts = 60
): () => void {
  let attempts = 0;
  let stopped = false;

  const poll = async () => {
    if (stopped || attempts >= maxAttempts) {
      return;
    }

    attempts += 1;

    try {
      const result = await checkPaymentStatus(paymentId);
      onStatusChange(result.status, result.transaction);

      if (
        result.status === 'CONFIRMED' ||
        result.status === 'RECEIVED' ||
        result.status === 'REFUNDED' ||
        result.status === 'OVERDUE' ||
        result.status === 'FAILED'
      ) {
        return;
      }

      if (!stopped) {
        setTimeout(poll, intervalMs);
      }
    } catch (error) {
      console.error('Erro no polling do pagamento:', error);

      if (!stopped) {
        setTimeout(poll, intervalMs * 2);
      }
    }
  };

  poll();

  return () => {
    stopped = true;
  };
}

export async function getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transacoes:', error);
    return [];
  }

  return (data || []) as PaymentTransaction[];
}

export const ROSITAS_PRICES: Record<string, number> = {
  start: 19.9,
  essencial: 59.9,
  top: 139.9,
  premium: 299.9,
  black: 599.9,
};

export const STORY_PRICES: Record<string, number> = {
  simple: 2.0,
  featured: 5.0,
  vip: 10.0,
};
