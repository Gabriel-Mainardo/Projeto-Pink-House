import React from 'react';
import FilterPill from './FilterPill';
import { Star, X } from 'lucide-react';
import {
  LOCATION_OPTIONS,
  AVAILABILITY_OPTIONS,
  PRICE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  SECURITY_OPTIONS,
  PHYSICAL_STYLE_OPTIONS,
  AGE_OPTIONS,
  BODY_OPTIONS,
  MAIN_SERVICES_OPTIONS,
  PREMIUM_FILTERS_OPTIONS
} from '../constants/filterOptions';

interface AdvancedFiltersProps {
  selected: Record<string, string[]>;
  toggleOption: (category: string, id: string) => void;
  onApply: () => void;
  onClose?: () => void;
  onClear?: () => void;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-gray-900 font-semibold text-xs mb-2" style={{ }}>{title}</h3>
);

const FilterGroup: React.FC<{
  category: string;
  options: { id: string, label: string }[];
  selectedValues: string[];
  onToggle: (cat: string, id: string) => void;
  helperText?: React.ReactNode;
}> = ({ category, options, selectedValues, onToggle, helperText }) => (
  <div className="mb-4">
    <SectionTitle title={category === 'location' ? 'Localização' :
                          category === 'availability' ? 'Disponibilidade' :
                          category === 'price' ? 'Faixa de preço' :
                          category === 'serviceType' ? 'Tipo de atendimento' :
                          category === 'security' ? 'Segurança' :
                          category === 'physical' ? 'Estilo físico' :
                          category === 'age' ? 'Idade' :
                          category === 'body' ? 'Corpo' :
                          category === 'services' ? 'Serviços principais' : ''} />
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <FilterPill
          key={opt.id}
          label={opt.label}
          selected={selectedValues.includes(opt.id)}
          onClick={() => onToggle(category, opt.id)}
        />
      ))}
    </div>
    {helperText && <div className="mt-1 text-[10px] text-gray-400">{helperText}</div>}
  </div>
);

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ selected, toggleOption, onApply, onClose, onClear }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300 relative">

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Fechar filtros"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Header */}
      <div className="mb-4 pr-10">
        <h2 className="text-xl font-bold text-gray-900" style={{ }}>Filtros Avançados</h2>
        <p className="text-gray-500 text-sm mt-0.5" style={{ }}>Refine os resultados e encontre a acompanhante ideal.</p>
      </div>

      {/* Grid Layout - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-8">

        {/* Column 1 */}
        <div>
          <FilterGroup
            category="location"
            options={LOCATION_OPTIONS}
            selectedValues={selected.location || []}
            onToggle={toggleOption}
          />
          <FilterGroup
            category="serviceType"
            options={SERVICE_TYPE_OPTIONS}
            selectedValues={selected.serviceType || []}
            onToggle={toggleOption}
          />
          <FilterGroup
            category="age"
            options={AGE_OPTIONS}
            selectedValues={selected.age || []}
            onToggle={toggleOption}
          />
        </div>

        {/* Column 2 */}
        <div>
          <FilterGroup
            category="availability"
            options={AVAILABILITY_OPTIONS}
            selectedValues={selected.availability || []}
            onToggle={toggleOption}
          />
          <FilterGroup
            category="security"
            options={SECURITY_OPTIONS}
            selectedValues={selected.security || []}
            onToggle={toggleOption}
          />
          <FilterGroup
            category="body"
            options={BODY_OPTIONS}
            selectedValues={selected.body || []}
            onToggle={toggleOption}
          />
        </div>

        {/* Column 3 */}
        <div>
          <FilterGroup
            category="price"
            options={PRICE_OPTIONS}
            selectedValues={selected.price || []}
            onToggle={toggleOption}
            helperText={
              <div className="flex justify-between w-full max-w-[320px] px-1">
                <span>Mais acessível</span>
                <span>Mais exclusivo</span>
              </div>
            }
          />
          <FilterGroup
            category="physical"
            options={PHYSICAL_STYLE_OPTIONS}
            selectedValues={selected.physical || []}
            onToggle={toggleOption}
          />
          <FilterGroup
            category="services"
            options={MAIN_SERVICES_OPTIONS}
            selectedValues={selected.services || []}
            onToggle={toggleOption}
          />
        </div>
      </div>

      {/* Premium Filters (Full Width) */}
      <div className="mb-4">
         <h3 className="text-gray-900 font-semibold text-xs mb-2 flex items-center gap-1.5" style={{ }}>
           <Star size={12} className="fill-yellow-400 text-yellow-400" />
           Filtros Premium
         </h3>
         <div className="flex flex-wrap gap-1.5">
           {PREMIUM_FILTERS_OPTIONS.map((opt) => (
             <FilterPill
               key={opt.id}
               label={opt.label}
               selected={selected.premium?.includes(opt.id)}
               onClick={() => toggleOption('premium', opt.id)}
             />
           ))}
         </div>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-4">
        {onClear && (
          <button
            onClick={onClear}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors"
            style={{ }}
          >
            Limpar filtros
          </button>
        )}
        <button
          onClick={onApply}
          className="w-full sm:w-auto px-6 py-2.5 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
          style={{ }}
        >
          Aplicar filtros
        </button>
      </div>

    </div>
  );
};

export default AdvancedFilters;
