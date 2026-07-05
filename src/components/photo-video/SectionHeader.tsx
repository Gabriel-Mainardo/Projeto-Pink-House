import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  onAdd: () => void;
  buttonText: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  onAdd,
  buttonText
}) => {
  return (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl text-gray-900" style={{ }}>
        {title}
      </h2>
      <button
        onClick={onAdd}
        className="bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-colors"
        style={{ }}
      >
        <Icon size={16} />
        <span className="hidden sm:inline">{buttonText}</span>
      </button>
    </div>
  );
};

export default SectionHeader;
