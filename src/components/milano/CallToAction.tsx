import React from 'react';

interface CallToActionProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const CallToAction: React.FC<CallToActionProps> = ({
  title = "Conheça o Empreendimento",
  children,
  className = '',
  variant = 'primary'
}) => {
  const backgroundClass = variant === 'primary' 
    ? 'bg-milano-primary' 
    : 'bg-milano-background';

  return (
    <section className={`${className} ${backgroundClass} py-16 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Title */}
        <h2 className="font-sans text-milano-cta text-milano-text-light font-bold mb-8">
          {title}
        </h2>
        
        {/* Decorative Italian Line */}
        <div className="flex justify-center mb-12">
          <div className="w-48 h-1 bg-gradient-italian rounded-full shadow-lg"></div>
        </div>
        
        {/* Content */}
        <div className="text-milano-text-light">
          {children}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-transparent border-2 border-milano-accent text-milano-accent hover:bg-milano-accent hover:text-milano-text-dark px-8 py-3 rounded-md font-semibold transition-all duration-300 transform hover:scale-105">
            Conheça Mais
          </button>
          
          <button className="bg-milano-accent text-milano-text-dark hover:bg-milano-accent-light px-8 py-3 rounded-md font-semibold transition-all duration-300 transform hover:scale-105">
            Agende uma Visita
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;