import React from 'react';
import { Transaction } from '../../types/rositas';

interface RositasTransactionHistoryProps {
  transactions: Transaction[];
}

export const RositasTransactionHistory: React.FC<RositasTransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="mt-4">
      <h3 className="text-[17px] text-gray-900 mb-3" style={{ }}>
        Histórico de Transações
      </h3>
      <div className="space-y-2">
        {transactions.map((transaction) => {
          const isPositive = transaction.amount > 0;
          const sign = isPositive ? '+' : '';

          return (
            <div key={transaction.id} className="bg-white rounded-[18px] px-5 py-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-gray-800 text-[13px]" style={{ }}>
                  {transaction.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[13px] flex items-center" style={{ }}>
                  {transaction.currencyType === 'love' && (
                     <span className="mr-1">💝</span>
                  )}
                  {sign}{transaction.amount}
                </span>
                <span className="text-[11px] text-gray-300 ml-1" style={{ }}>{transaction.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
