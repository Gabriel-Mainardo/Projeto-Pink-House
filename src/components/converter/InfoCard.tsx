import React from 'react';

interface InfoCardProps {
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col border-2 border-pink-100 md:border-gray-200 rounded-2xl p-4 w-full bg-white shadow-sm">
      <span
        className="text-gray-600 text-sm mb-1"
        style={{
          }}
      >
        {label}
      </span>
      <span
        className="text-gray-900 text-3xl md:text-2xl"
        style={{
          }}
      >
        {value}
      </span>
    </div>
  );
};

export default InfoCard;
