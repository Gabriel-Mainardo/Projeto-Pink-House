const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') || '';
const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') || 'https://api-sandbox.asaas.com/v3';

export interface AsaasCustomer {
  name: string;
  email?: string;
  cpfCnpj: string;
  phone?: string;
}

export interface AsaasPaymentRequest {
  customer: string; // customer ID
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

async function asaasRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${ASAAS_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Asaas API error:', data);
    throw new Error(data.errors?.[0]?.description || `Asaas API error: ${response.status}`);
  }

  return data;
}

// Criar ou buscar cliente no Asaas
export async function findOrCreateCustomer(customer: AsaasCustomer): Promise<string> {
  // Tentar buscar cliente pelo CPF
  const searchResult = await asaasRequest(`/customers?cpfCnpj=${customer.cpfCnpj}`);

  if (searchResult.data && searchResult.data.length > 0) {
    return searchResult.data[0].id;
  }

  // Criar novo cliente
  const newCustomer = await asaasRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });

  return newCustomer.id;
}

// Criar cobrança PIX
export async function createPixPayment(
  customerId: string,
  value: number,
  description: string,
  externalReference?: string
): Promise<{ paymentId: string; pixQrCode: AsaasPixQrCode; invoiceUrl: string }> {
  const dueDate = new Date();
  dueDate.setMinutes(dueDate.getMinutes() + 30); // 30 min para pagar
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const payment = await asaasRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX',
      value,
      dueDate: dueDateStr,
      description,
      externalReference,
    }),
  });

  // Buscar QR Code do PIX
  const pixQrCode = await asaasRequest(`/payments/${payment.id}/pixQrCode`);

  return {
    paymentId: payment.id,
    pixQrCode,
    invoiceUrl: payment.invoiceUrl,
  };
}

// Criar cobrança por Cartão de Crédito
export async function createCreditCardPayment(
  customerId: string,
  value: number,
  description: string,
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  },
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  },
  externalReference?: string
): Promise<{ paymentId: string; status: string; invoiceUrl: string }> {
  const dueDate = new Date();
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const payment = await asaasRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value,
      dueDate: dueDateStr,
      description,
      externalReference,
      creditCard,
      creditCardHolderInfo,
    }),
  });

  return {
    paymentId: payment.id,
    status: payment.status,
    invoiceUrl: payment.invoiceUrl,
  };
}

// Criar cobrança por Boleto
export async function createBoletoPayment(
  customerId: string,
  value: number,
  description: string,
  externalReference?: string
): Promise<{ paymentId: string; bankSlipUrl: string; invoiceUrl: string }> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // 3 dias para pagar
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const payment = await asaasRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'BOLETO',
      value,
      dueDate: dueDateStr,
      description,
      externalReference,
    }),
  });

  return {
    paymentId: payment.id,
    bankSlipUrl: payment.bankSlipUrl,
    invoiceUrl: payment.invoiceUrl,
  };
}

// Consultar status de pagamento
export async function getPaymentStatus(paymentId: string) {
  return await asaasRequest(`/payments/${paymentId}`);
}
