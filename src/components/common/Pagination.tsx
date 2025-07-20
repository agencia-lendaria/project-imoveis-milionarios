import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-300 px-2 py-3 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`relative px-4 py-2 text-sm font-medium rounded-lg ${
            currentPage === 0
              ? 'text-gray-400 bg-gray-200'
              : 'text-blue-600 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={`relative ml-3 px-4 py-2 text-sm font-medium rounded-lg ${
            currentPage === totalPages - 1
              ? 'text-gray-400 bg-gray-200'
              : 'text-blue-600 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Próximo
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium text-gray-900">{currentPage * pageSize + 1}</span> a{' '}
            <span className="font-medium text-gray-900">
              {Math.min((currentPage + 1) * pageSize, totalItems)}
            </span>{' '}
            de <span className="font-medium text-gray-900">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="flex items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`relative p-1 rounded-md ${
                currentPage === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="mx-2 text-sm text-gray-600">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`relative p-1 rounded-md ${
                currentPage === totalPages - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;