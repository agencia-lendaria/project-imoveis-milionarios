import React from 'react';

interface ItalianFlagProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ItalianFlag: React.FC<ItalianFlagProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-6',
    md: 'w-12 h-8', 
    lg: 'w-16 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} inline-flex overflow-hidden rounded-sm shadow-sm`}>
      <div className="w-1/3 bg-milano-italy-green"></div>
      <div className="w-1/3 bg-milano-italy-white"></div>
      <div className="w-1/3 bg-milano-italy-red"></div>
    </div>
  );
};

export default ItalianFlag;