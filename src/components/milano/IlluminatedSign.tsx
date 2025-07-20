import React from 'react';

interface IlluminatedSignProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const IlluminatedSign: React.FC<IlluminatedSignProps> = ({ 
  text, 
  className = '',
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-milano-title',
    xl: 'text-milano-hero'
  };

  return (
    <div className={`${className} text-center`}>
      <h1 
        className={`
          ${sizeClasses[size]} 
          font-milano 
          font-bold 
          text-milano-accent 
          text-shadow-milano-illuminated
          drop-shadow-milano-glow
          tracking-wider
          uppercase
          select-none
        `}
        style={{
          textShadow: '0 0 10px #D4B254, 0 0 20px #D4B254, 0 0 30px #D4B254'
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export default IlluminatedSign;