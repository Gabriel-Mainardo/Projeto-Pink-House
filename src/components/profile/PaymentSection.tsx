import { DollarSign, CreditCard } from "lucide-react";

const paymentMethods = [
  {
    icon: () => (
      <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Pix"
  },
  { icon: DollarSign, label: "Dinheiro" },
  { icon: CreditCard, label: "Cartão" },
];

export const PaymentSection = () => {
  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>
        Formas de Pagamento
      </h2>
      <div className="flex gap-4">
        {paymentMethods.map((method, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border">
              {typeof method.icon === 'function' ? (
                <method.icon />
              ) : (
                <method.icon className="w-6 h-6 text-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium" style={{ }}>
              {method.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
