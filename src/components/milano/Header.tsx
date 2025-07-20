import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title?: string;
  showAuth?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Milano Residence",
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
    <header className={`${className} bg-black/50 backdrop-blur-sm border-b border-milano-accent/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <h1 className="font-milano text-xl font-bold text-milano-accent tracking-wide">
                {title}
              </h1>
            </div>
          </div>

          {/* Navegação Central */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#dashboard" 
              className="text-milano-text-light hover:text-milano-accent transition-colors duration-200 font-medium"
            >
              Dashboard
            </a>
            <a 
              href="#clients" 
              className="text-milano-text-light hover:text-milano-accent transition-colors duration-200 font-medium"
            >
              Clientes
            </a>
            <a 
              href="#properties" 
              className="text-milano-text-light hover:text-milano-accent transition-colors duration-200 font-medium"
            >
              Propriedades
            </a>
            <a 
              href="#reports" 
              className="text-milano-text-light hover:text-milano-accent transition-colors duration-200 font-medium"
            >
              Relatórios
            </a>
          </nav>

          {/* Área do Usuário */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-milano-text-light">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-milano-text-light hover:bg-milano-accent/10 hover:text-milano-accent transition-all duration-200"
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