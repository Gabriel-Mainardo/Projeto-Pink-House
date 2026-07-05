import React from 'react';

interface FilterPillProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
}

const BASE_STYLES = 'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap border ';

const SELECTED_STYLES = 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm';

const UNSELECTED_STYLES = 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50';

const PRIMARY_STYLES = 'px-3 py-1.5 rounded-full text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 border border-transparent shadow-sm flex items-center gap-1.5';

const FilterPill: React.FC<FilterPillProps> = ({
  label,
  selected,
  onClick,
  icon,
  variant = 'default',
  className = ''
}) => {
  const baseStyles = variant === 'primary'
    ? PRIMARY_STYLES
    : `${BASE_STYLES}${selected ? SELECTED_STYLES : UNSELECTED_STYLES}`;

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};

export default FilterPill;
