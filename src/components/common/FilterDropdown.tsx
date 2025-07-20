import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-brand-gray mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
        >
          <option value="">Todos</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};

export default FilterDropdown;