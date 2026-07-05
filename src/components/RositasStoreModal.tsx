import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { PRODUCTS, HISTORY } from '../constants/rositas';
import { ROSITAS_PRICES } from '../services/paymentService';
import { Product } from '../types/rositas';
import { RositasHeader } from './rositas/RositasHeader';
import { RositasBalanceCard } from './rositas/RositasBalanceCard';
import { RositasProductCard } from './rositas/RositasProductCard';
import { RositasTransactionHistory } from './rositas/RositasTransactionHistory';
import { PixPaymentModal } from './PixPaymentModal';

interface RositasStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RositasStoreModal: React.FC<RositasStoreModalProps> = ({ isOpen, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(true);
  };

  const handlePaymentConfirmed = () => {
    setShowPayment(false);
    setSelectedProduct(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F6] overflow-y-auto">
      <div className="min-h-screen flex justify-center font-sans">
        {/* Mobile container */}
        <div className="w-full max-w-md bg-[#F2F2F6] min-h-screen">

          {/* Main Content */}
          <div className="px-5 py-2">

            <RositasHeader onClose={onClose} />

            <div className="mt-4">
              <RositasBalanceCard />
            </div>

            <h3 className="text-[17px] text-gray-900 mb-3 mt-6" style={{ }}>
              Comprar mais Rositas
            </h3>

            <div className="space-y-3">
              {PRODUCTS.map((product) => (
                <RositasProductCard
                  key={product.id}
                  product={product}
                  onBuy={handleBuy}
                />
              ))}
            </div>

            <div className="mt-8 mb-8 flex items-center justify-center gap-1.5 text-gray-400">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs" style={{ }}>Pagamento Seguro via Asaas</span>
            </div>

            <RositasTransactionHistory transactions={HISTORY} />

            <div className="h-8"></div> {/* Bottom spacer */}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedProduct && (
        <PixPaymentModal
          isOpen={showPayment}
          onClose={() => { setShowPayment(false); setSelectedProduct(null); }}
          onPaymentConfirmed={handlePaymentConfirmed}
          productName={`${selectedProduct.rositasAmount} Rositas (${selectedProduct.tierName})`}
          value={ROSITAS_PRICES[selectedProduct.id] || 0}
          transactionType="rositas"
          referenceId={selectedProduct.id}
          description={`Compra de ${selectedProduct.rositasAmount} Rositas - Pacote ${selectedProduct.tierName}`}
        />
      )}
    </div>
  );
};
