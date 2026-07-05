import React from 'react';

interface InputProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  type = 'text'
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label
        htmlFor={name}
        className="text-gray-700 text-[15px] font-semibold pl-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-5 py-3.5 rounded-2xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
      />
    </div>
  );
};

export default Input;
