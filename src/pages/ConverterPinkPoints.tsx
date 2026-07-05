import React from 'react';
import ConverterCard from '../components/converter/ConverterCard';

const ConverterPinkPoints = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop: centered card, Mobile: full screen */}
      <div className="md:flex md:items-center md:justify-center md:p-4 md:min-h-screen">
        <ConverterCard />
      </div>
    </div>
  );
};

export default ConverterPinkPoints;
