import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PixPaymentModal } from "./PixPaymentModal";
import { STORY_PRICES } from "../services/paymentService";

interface StoryOption {
  id: string;
  title: string;
  duration: string;
  cost: number;
  price: string;
  description: string;
}

const storyOptions: StoryOption[] = [
  {
    id: "simple",
    title: "Story Simples",
    duration: "24h",
    cost: 20,
    price: "R$ 2,00",
    description: "1 foto ou vídeo curto",
  },
  {
    id: "featured",
    title: "Story Destaque",
    duration: "48h",
    cost: 50,
    price: "R$ 5,00",
    description: "Aparece primeiro nos stories",
  },
  {
    id: "vip",
    title: "Story VIP",
    duration: "7 dias",
    cost: 100,
    price: "R$ 10,00",
    description: "Destaque máximo + borda especial",
  },
];

interface StoriesPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (optionId: string) => void;
}

const StoriesPayModal = ({ isOpen, onClose, onConfirm }: StoriesPayModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("simple");
  const [showPayment, setShowPayment] = useState(false);

  const handleConfirm = () => {
    // Abrir modal de pagamento via Asaas
    setShowPayment(true);
  };

  const handlePaymentConfirmed = () => {
    setShowPayment(false);
    onConfirm(selectedOption);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 rounded-t-3xl md:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground" style={{ }}>
              Stories
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground" style={{ }}>
            Escolha uma opção para se destacar.
          </p>
        </div>

        {/* Balance Info */}
        <div className="px-6 py-4 bg-white">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border">
            <div>
              <p className="text-sm text-muted-foreground" style={{ }}>
                Seu saldo
              </p>
              <p className="text-2xl font-bold text-primary" style={{ }}>
                150 Rositas
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              style={{ }}
            >
              Adicionar +
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 py-4 space-y-3">
          {storyOptions.map((option) => (
            <div key={option.id} className="relative">
              <input
                type="radio"
                id={option.id}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.id}
                className="flex items-start gap-4 p-4 rounded-3xl bg-white cursor-pointer transition-all duration-200 hover:bg-white peer-checked:ring-[3px] border border-border"
                style={selectedOption === option.id ? { borderColor: '#ff6a9f', boxShadow: '0 0 0 3px #ff6a9f' } : {}}
              >
                <div
                  className="flex items-center justify-center w-6 h-6 mt-1 rounded-full border-2 transition-all duration-200"
                  style={{ borderColor: selectedOption === option.id ? '#ff6a9f' : '#d1d5db' }}
                >
                  {selectedOption === option.id && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground" style={{ }}>
                      {option.title} ({option.duration})
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full text-black" style={{ }}>
                      {option.cost} Rositas
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground" style={{ }}>
                    {option.description}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-3xl md:rounded-b-3xl">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-full"
              style={{ }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-full"
              style={{ }}
            >
              Confirmar Publicação
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PixPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentConfirmed={handlePaymentConfirmed}
        productName={`Story ${storyOptions.find(o => o.id === selectedOption)?.title || ''}`}
        value={STORY_PRICES[selectedOption] || 2.00}
        transactionType="story"
        referenceId={selectedOption}
        description={`Story ${storyOptions.find(o => o.id === selectedOption)?.title} - Faixa Rosa`}
      />
    </div>
  );
};

export default StoriesPayModal;
