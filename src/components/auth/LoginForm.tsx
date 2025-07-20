import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginFormData } from '../../types/auth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

export default function LoginForm() {
  const { signIn, session, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Se já estiver autenticado, redirecionar
  if (session && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): boolean => {
    setError('');

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Email deve ter um formato válido');
      return false;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        // Tratar diferentes tipos de erro
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Email ou senha incorretos');
            break;
          case 'Email not confirmed':
            setError('Email não confirmado. Verifique sua caixa de entrada.');
            break;
          case 'Too many requests':
            setError('Muitas tentativas. Tente novamente em alguns minutos.');
            break;
          default:
            setError(error.message || 'Erro ao fazer login. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-darker via-brand-dark to-brand-darker p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logopipiolo.png" 
            alt="Pipiolo Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-brand-gold">
            Dashboard Agência Lendária
          </h2>
          <p className="text-gray-300 mt-2">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botão Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="relative"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Informações */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Dashboard interno da Agência Lendária
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Para acesso autorizado apenas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 