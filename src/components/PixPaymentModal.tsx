import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Copy, Loader2, QrCode, X } from 'lucide-react';
import {
  createPayment,
  pollPaymentStatus,
  type BillingType,
  type PaymentTransaction,
  type TransactionType,
} from '../services/paymentService';
import { toast } from 'sonner';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: (result?: { paymentId: string; transaction: PaymentTransaction | null }) => void;
  productName: string;
  value: number;
  transactionType: TransactionType;
  referenceId: string;
  description?: string;
  allowedBillingTypes?: BillingType[];
  successMessage?: string;
}

type Step = 'cpf' | 'method' | 'pix' | 'processing' | 'success' | 'error';

const DEFAULT_BILLING_TYPES: BillingType[] = ['PIX', 'BOLETO'];

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentConfirmed,
  productName,
  value,
  transactionType,
  referenceId,
  description,
  allowedBillingTypes = DEFAULT_BILLING_TYPES,
  successMessage,
}) => {
  const [step, setStep] = useState<Step>('cpf');
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [billingType, setBillingType] = useState<BillingType>(allowedBillingTypes[0] || 'PIX');
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixPayload, setPixPayload] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setStep('cpf');
    setCpf('');
    setName('');
    setPixQrCode('');
    setPixPayload('');
    setInvoiceUrl('');
    setIsLoading(false);
    setCopied(false);
    setBillingType(allowedBillingTypes[0] || 'PIX');

    if (stopPolling) {
      stopPolling();
      setStopPolling(null);
    }
  }, [allowedBillingTypes, isOpen, stopPolling]);

  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [stopPolling]);

  const formatCpf = (input: string) => {
    const numbers = input.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    }

    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  const handleCreatePayment = useCallback(async () => {
    if (cpf.replace(/\D/g, '').length < 11) {
      toast.error('CPF invalido');
      return;
    }

    if (!name.trim()) {
      toast.error('Informe seu nome');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPayment({
        customerName: name.trim(),
        customerCpf: cpf,
        value,
        description: description || `${productName} - Faixa Rosa`,
        billingType,
        transactionType,
        referenceId,
      });

      if (billingType === 'PIX' && 'pixQrCode' in result) {
        setPixQrCode(result.pixQrCode.encodedImage);
        setPixPayload(result.pixQrCode.payload);
        setInvoiceUrl(result.invoiceUrl);
        setStep('pix');

        const stop = pollPaymentStatus(result.paymentId, (status, transaction) => {
          if (status === 'CONFIRMED' || status === 'RECEIVED') {
            setStep('success');
            toast.success('Pagamento confirmado');

            setTimeout(() => {
              onPaymentConfirmed({
                paymentId: result.paymentId,
                transaction,
              });
            }, 1500);
          }

          if (status === 'FAILED' || status === 'OVERDUE') {
            setStep('error');
          }
        });

        setStopPolling(() => stop);
      } else if (billingType === 'CREDIT_CARD' && 'status' in result) {
        if (result.status === 'CONFIRMED') {
          setStep('success');
          toast.success('Pagamento aprovado');

          setTimeout(() => {
            onPaymentConfirmed({
              paymentId: result.paymentId,
              transaction: null,
            });
          }, 1500);
        } else {
          setStep('error');
        }
      } else if (billingType === 'BOLETO' && 'bankSlipUrl' in result) {
        setInvoiceUrl(result.invoiceUrl);
        window.open(result.bankSlipUrl, '_blank');
        setStep('processing');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, [billingType, cpf, description, name, onPaymentConfirmed, productName, referenceId, transactionType, value]);

  const handleCopyPix = async () => {
    if (!pixPayload) {
      return;
    }

    await navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success('Codigo PIX copiado');

    window.setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Pagamento</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-3 bg-pink-50 border-b">
          <p className="text-sm text-gray-600">{productName}</p>
          <p className="text-2xl font-bold text-[#F54180]">R$ {value.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="p-5">
          {step === 'cpf' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(event) => setCpf(formatCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <button
                onClick={() => setStep('method')}
                disabled={cpf.replace(/\D/g, '').length < 11 || !name.trim()}
                className="w-full py-3 bg-[#F54180] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Escolha a forma de pagamento:</p>

              {allowedBillingTypes.includes('PIX') && (
                <button
                  onClick={() => {
                    setBillingType('PIX');
                    void handleCreatePayment();
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PIX</p>
                    <p className="text-xs text-gray-500">Aprovacao instantanea</p>
                  </div>
                </button>
              )}

              {allowedBillingTypes.includes('BOLETO') && (
                <button
                  onClick={() => {
                    setBillingType('BOLETO');
                    void handleCreatePayment();
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Boleto</p>
                    <p className="text-xs text-gray-500">Ate 3 dias uteis</p>
                  </div>
                </button>
              )}

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  <span className="text-sm text-gray-500">Gerando cobranca...</span>
                </div>
              )}

              <button onClick={() => setStep('cpf')} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                Voltar
              </button>
            </div>
          )}

          {step === 'pix' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Aguardando pagamento...</span>
              </div>

              {pixQrCode && (
                <div className="mx-auto w-48 h-48 bg-white border rounded-lg p-2">
                  <img
                    src={`data:image/png;base64,${pixQrCode}`}
                    alt="QR Code PIX"
                    className="w-full h-full"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500">Escaneie o QR Code com o app do seu banco</p>

              <div className="relative">
                <div className="bg-gray-50 rounded-lg p-3 pr-12 break-all text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {pixPayload}
                </div>
                <button
                  onClick={() => void handleCopyPix()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg"
                  title="Copiar codigo PIX"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              <button
                onClick={() => void handleCopyPix()}
                className="w-full py-3 bg-[#1F1F1F] text-white rounded-xl font-medium hover:bg-black transition-colors"
              >
                {copied ? 'Copiado!' : 'Copiar codigo PIX'}
              </button>

              <p className="text-xs text-gray-400">A confirmacao sera atualizada automaticamente</p>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Processando pagamento</h3>
              <p className="text-sm text-gray-500">Aguardando confirmacao do pagamento...</p>
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-500 underline"
                >
                  Ver fatura
                </a>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pagamento confirmado!</h3>
              <p className="text-sm text-gray-500">{successMessage || `${productName} foi pago com sucesso.`}</p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Erro no pagamento</h3>
              <p className="text-sm text-gray-500">Nao foi possivel processar o pagamento. Tente novamente.</p>
              <button
                onClick={() => setStep('cpf')}
                className="w-full py-3 bg-[#F54180] text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
