import React from 'react';
import { Lock } from 'lucide-react';
import { MenuItemData } from '../../types/menu';

interface MenuItemProps {
  item: MenuItemData;
  locked?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, locked = false, onClick }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 transition-colors group ${
        locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBgClass} ${item.iconColorClass}`}>
          {item.customIcon ? (
            item.customIcon
          ) : (
            <item.icon size={20} strokeWidth={2} />
          )}
        </div>

        {/* Text Content */}
        <div className="flex flex-col">
          <span
            className="text-[15px] text-gray-900 leading-tight"
          >
            {item.title}
          </span>
          <span
            className="text-[13px] text-gray-500 leading-tight mt-0.5"
          >
            {item.subtitle}
          </span>
        </div>
      </div>

      {locked && (
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
          <Lock size={10} className="text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium">Em breve</span>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
