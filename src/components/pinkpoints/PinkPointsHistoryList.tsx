import React from 'react';
import { CreditCard, MessageSquare, Gift } from 'lucide-react';
import { HistoryItem } from '../../types/pinkpoints';

interface HistoryListProps {
  items: HistoryItem[];
}

const getIcon = (type: HistoryItem['type']) => {
  const iconColor = '#d91d83';
  switch (type) {
    case 'recharge':
      return <CreditCard className="w-5 h-5" style={{ color: iconColor }} />;
    case 'chat':
      return <MessageSquare className="w-5 h-5" style={{ color: iconColor }} />;
    case 'gift':
      return <Gift className="w-5 h-5" style={{ color: iconColor }} />;
    default:
      return <CreditCard className="w-5 h-5" style={{ color: iconColor }} />;
  }
};

const PinkPointsHistoryList: React.FC<HistoryListProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Histórico de Pontos</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                {getIcon(item.type)}
              </div>

              {/* Text Info */}
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.title}</p>
                <p className="text-gray-500 text-sm">+{item.points} PinkPoints</p>
              </div>
            </div>

            {/* Date */}
            <div className="text-gray-400 text-xs sm:text-sm font-medium">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinkPointsHistoryList;
