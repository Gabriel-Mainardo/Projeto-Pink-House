import React, { useState } from 'react';
import { ArrowLeft, Banknote, Check, CheckCircle2, DollarSign, Lock, ShieldCheck } from 'lucide-react';
import { PixPaymentModal } from './PixPaymentModal';

interface PaymentSecurityScreenProps {
  onClose?: () => void;
  onActivate?: (serviceValue: number) => void | Promise<void>;
  conversationId?: string;
  isCompanion?: boolean;
  presetValue?: number;
}

const steps = [
  {
    id: 1,
    title: 'Valor definido na conversa',
    description: 'A acompanhante registra o valor do encontro dentro das etapas de seguranca.',
    icon: <DollarSign className="w-6 h-6 text-pink-500" />,
  },
  {
    id: 2,
    title: 'Pagamento confirmado',
    description: 'O cliente paga pelo fluxo seguro e o status fica visivel para os dois lados.',
    icon: <Banknote className="w-6 h-6 text-pink-500" />,
  },
  {
    id: 3,
    title: 'Liberacao manual',
    description: 'Depois do atendimento, a acompanhante pode marcar o pagamento como liberado.',
    icon: <CheckCircle2 className="w-6 h-6 text-pink-500" />,
  },
  {
    id: 4,
    title: 'Historico rastreavel',
    description: 'Toda a trilha do pagamento fica registrada na conversa para consulta posterior.',
    icon: <ShieldCheck className="w-6 h-6 text-pink-500" />,
  },
];

const benefits = [
  'Reduz combinados fora da conversa.',
  'Mostra status claro de aguardando, pago e liberado.',
  'Ajuda os dois lados a acompanhar o combinado em tempo real.',
  'Mantem o valor associado a conversa correta.',
];

const PaymentSecurityScreen: React.FC<PaymentSecurityScreenProps> = ({
  onClose,
  onActivate,
  conversationId,
  isCompanion = true,
  presetValue,
}) => {
  const [serviceValue, setServiceValue] = useState(
    presetValue ? presetValue.toFixed(2).replace('.', ',') : ''
  );
  const [showPixModal, setShowPixModal] = useState(false);

  const parsedValue = parseFloat(serviceValue.replace(',', '.')) || 0;
  const canContinue = parsedValue > 0;

  const handlePrimaryAction = async () => {
    if (!canContinue) {
      return;
    }

    if (isCompanion) {
      await onActivate?.(parsedValue);
      onClose?.();
      return;
    }

    setShowPixModal(true);
  };

  const handlePaymentConfirmed = async () => {
    setShowPixModal(false);
    await onActivate?.(parsedValue);
    onClose?.();
  };

  const formatCurrency = (input: string) => input.replace(/[^0-9.,]/g, '');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      <header className="sticky top-0 z-10 bg-white flex items-center px-4 h-16 border-b border-gray-100 shadow-sm">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg font-bold text-gray-900 flex-1">Pagamento Seguro</h1>
      </header>

      <main className="flex-1 px-5 pt-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-pink-500" strokeWidth={2.5} />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Pagamento protegido pela conversa</h2>
        <p className="text-gray-500 text-center text-sm leading-relaxed mb-8 max-w-sm">
          {isCompanion
            ? 'Defina o valor do encontro para o cliente receber o pedido de pagamento dentro da conversa.'
            : 'Finalize o pagamento e o status sera atualizado automaticamente para os dois participantes.'}
        </p>

        <div className="w-full mb-4">
          <span className="text-pink-500 font-medium">Como funciona</span>
        </div>

        <div className="w-full space-y-4 mb-10">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start"
            >
              <span className="text-3xl font-bold text-pink-500 shrink-0 mt-1">{step.id}.</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-[15px] mb-1">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
              </div>
              <div className="shrink-0 pt-1">{step.icon}</div>
            </div>
          ))}
        </div>

        <div className="w-full mb-8">
          <h3 className="font-medium text-gray-900 mb-4">Por que usar esse fluxo?</h3>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-gray-500 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6">
          <p className="text-center text-gray-600 text-sm leading-relaxed">
            O pagamento fica vinculado a esta conversa e pode ser acompanhado pelas duas partes em tempo real.
          </p>
        </div>

        {onActivate && (
          <div className="w-full mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isCompanion ? 'Valor do servico (R$)' : 'Valor a pagar (R$)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-pink-400" />
              </div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={serviceValue}
                onChange={(event) => setServiceValue(formatCurrency(event.target.value))}
                readOnly={!isCompanion && presetValue !== undefined}
                className="w-full bg-pink-50 border border-pink-100 rounded-2xl pl-10 pr-4 py-4 text-gray-800 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
              />
            </div>
            {parsedValue > 0 && (
              <p className="text-xs text-gray-400 mt-2 text-right">
                {isCompanion
                  ? 'O cliente recebera um pedido de pagamento via PIX'
                  : `Total do pagamento: R$ ${parsedValue.toFixed(2).replace('.', ',')}`}
              </p>
            )}
          </div>
        )}

        <div className="w-full space-y-4">
          <button
            onClick={() => void handlePrimaryAction()}
            disabled={onActivate !== undefined && !canContinue}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompanion
              ? 'Solicitar pagamento seguro'
              : `Pagar R$ ${parsedValue > 0 ? parsedValue.toFixed(2).replace('.', ',') : '0,00'}`}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 font-medium transition-colors"
          >
            Voltar
          </button>
        </div>
      </main>

      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        onPaymentConfirmed={() => void handlePaymentConfirmed()}
        productName="Pagamento seguro da conversa"
        value={parsedValue}
        transactionType="secure_payment"
        referenceId={conversationId || 'secure-payment'}
        description="Pagamento vinculado a uma conversa segura"
        allowedBillingTypes={['PIX']}
        successMessage="O pagamento foi confirmado e registrado na conversa."
      />
    </div>
  );
};

export default PaymentSecurityScreen;
