import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-gradient rounded-xl shadow-gold p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;