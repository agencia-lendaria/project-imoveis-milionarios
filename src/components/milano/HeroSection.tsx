import React from 'react';
import IlluminatedSign from './IlluminatedSign';
import ItalianFlag from './ItalianFlag';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Milano",
  subtitle = "RESIDENCE",
  backgroundImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=1080&fit=crop&crop=center",
  className = ''
}) => {
  return (
    <section 
      className={`${className} relative min-h-screen flex items-center justify-center overflow-hidden`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      
      {/* Content Container */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        {/* Main Title Section */}
        <div className="flex flex-col items-center justify-center space-y-8">
          
          {/* Title with Flag */}
          <div className="flex items-center justify-center space-x-6">
            {/* Vertical Text */}
            <div 
              className="text-milano-text-light font-sans text-lg tracking-widest hidden md:block"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}
            >
              {subtitle}
            </div>
            
            {/* Main Title with Flag */}
            <div className="relative">
              <h1 className="font-milano text-6xl md:text-8xl lg:text-9xl font-bold text-milano-text-light tracking-wide uppercase select-none">
                {title}
              </h1>
              
              {/* Italian Flag positioned above title */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <ItalianFlag size="md" />
              </div>
            </div>
          </div>
          
          {/* Illuminated Sign */}
          <div className="mt-12">
            <IlluminatedSign 
              text={title}
              size="lg"
              className="animate-pulse"
            />
          </div>
          
          {/* Subtitle for mobile */}
          <div className="md:hidden">
            <p className="text-milano-text-light font-sans text-lg tracking-widest uppercase">
              {subtitle}
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center">
          <div className="w-32 h-1 bg-gradient-italian rounded-full"></div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-milano-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;