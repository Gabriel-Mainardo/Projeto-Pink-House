import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-900 ml-1">
        {label}
      </label>
      <input
        className={`
          w-full px-5 py-4
          text-gray-700 bg-white
          border border-gray-200
          rounded-2xl
          focus:outline-none focus:ring-1 focus:ring-[#ff4081] focus:border-[#ff4081]
          placeholder-gray-400
          text-base
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default InputField;
