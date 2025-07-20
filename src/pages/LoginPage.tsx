import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginFormData } from '../types/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Header } from '../components/duomo';
// import { IlluminatedSign } from '../components/milano';

export default function LoginPage() {
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
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
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
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-milano-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-darker via-brand-dark to-brand-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-duomo.png" 
              alt="Logo Duomo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-brand-gold text-3xl font-bold text-center">
            Dashboard Agência Lendária
          </h1>
          <p className="text-gray-300 text-sm mt-2 text-center">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-base font-medium text-brand-darker bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Footer */}
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