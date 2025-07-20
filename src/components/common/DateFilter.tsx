import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface DateFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  defaultFilter?: string; // Add prop to control default filter
}

const DateFilter: React.FC<DateFilterProps> = ({ 
  onDateRangeChange, 
  defaultFilter = 'week' // Default to 'week' for backward compatibility
}) => {
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date();
    // Set initial date based on defaultFilter
    if (defaultFilter === 'month') {
      date.setDate(date.getDate() - 30);
    } else {
      date.setDate(date.getDate() - 7);
    }
    return date;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [quickFilter, setQuickFilter] = useState<string>(defaultFilter);

  const handleQuickFilterChange = (filter: string) => {
    setQuickFilter(filter);
    
    const end = new Date();
    let start = new Date();
    
    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        break;
      case 'custom':
        return;
    }
    
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      setQuickFilter('custom');
      onDateRangeChange(start, end);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex space-x-2">
        <button
          onClick={() => handleQuickFilterChange('today')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            quickFilter === 'today' 
              ? 'bg-brand-gold text-brand-darker font-medium' 
              : 'bg-brand-dark text-brand-gray hover:bg-brand-dark/50'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => handleQuickFilterChange('yesterday')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            quickFilter === 'yesterday' 
              ? 'bg-brand-gold text-brand-darker font-medium' 
              : 'bg-brand-dark text-brand-gray hover:bg-brand-dark/50'
          }`}
        >
          Ontem
        </button>
        <button
          onClick={() => handleQuickFilterChange('week')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            quickFilter === 'week' 
              ? 'bg-brand-gold text-brand-darker font-medium' 
              : 'bg-brand-dark text-brand-gray hover:bg-brand-dark/50'
          }`}
        >
          7 dias
        </button>
        <button
          onClick={() => handleQuickFilterChange('month')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            quickFilter === 'month' 
              ? 'bg-brand-gold text-brand-darker font-medium' 
              : 'bg-brand-dark text-brand-gray hover:bg-brand-dark/50'
          }`}
        >
          30 dias
        </button>
      </div>
      
      <div className="relative">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          className="pl-9 pr-4 py-2 bg-brand-dark border border-brand-gold/20 rounded-lg text-white text-sm focus:ring-brand-gold focus:border-brand-gold"
          placeholderText="Selecione um período"
          dateFormat="dd/MM/yyyy"
        />
        <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gold" />
      </div>
    </div>
  );
};

export default DateFilter;