import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <Search 
        size={16} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
      />
      <button
        onClick={onSearch}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchInput;