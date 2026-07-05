import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const BUTTON_CLASSES = 'w-full bg-[#ff4d8d] hover:bg-[#ff337a] active:bg-[#e62e6e] text-white text-lg py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.99]';

const BUTTON_SHADOW = '0 10px 20px -5px rgba(255, 77, 141, 0.4)';

const Button: React.FC<ButtonProps> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`${BUTTON_CLASSES} ${className}`}
      style={{
        boxShadow: BUTTON_SHADOW,
      }}
    >
      {children}
    </button>
  );
};

export default Button;
