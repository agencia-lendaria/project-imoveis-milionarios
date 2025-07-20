import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title?: string;
  showAuth?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "DUOMO",
  showAuth = true,
  className = ''
}) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className={`${className} bg-duomo-primary shadow-duomo-primary`}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo-duomo.png" 
                alt="Logo Duomo" 
                className="h-8 w-auto"
              />
              <h1 className="font-sans text-2xl font-bold text-duomo-text-light tracking-wider uppercase">
                {title}
              </h1>
            </div>
          </div>


          {/* Área do Usuário */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-duomo-text-light">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md bg-transparent text-duomo-text-light hover:text-gray-300 transition-all duration-200 border-none"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">Sair</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;