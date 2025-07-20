import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ChangePasswordFormData } from '../../types/auth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChangePasswordFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ onClose, onSuccess }: ChangePasswordFormProps) {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    setError('');

    if (!formData.currentPassword.trim()) {
      setError('Senha atual é obrigatória');
      return false;
    }

    if (!formData.newPassword) {
      setError('Nova senha é obrigatória');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Nova senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError('A nova senha deve ser diferente da atual');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Confirmação de senha é obrigatória');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
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
      const { error } = await changePassword(formData.newPassword);
      
      if (error) {
        switch (error.message) {
          case 'New password should be different from the old password.':
            setError('A nova senha deve ser diferente da atual');
            break;
          case 'Password should be at least 6 characters':
            setError('A senha deve ter pelo menos 6 caracteres');
            break;
          default:
            setError('Erro ao alterar senha. Tente novamente.');
        }
      } else {
        setSuccess(true);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        // Chamar callback de sucesso após 2 segundos
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
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
    
    // Limpar sucesso quando usuário começar a digitar novamente
    if (success) {
      setSuccess(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 relative">
      {/* Header com botão fechar */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Alterar Senha</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Senha alterada com sucesso!</p>
            <p className="text-sm text-green-600/80">Você será redirecionado em breve...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Senha Atual */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Senha Atual
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.currentPassword}
              onChange={handleInputChange}
              disabled={loading || success}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('current')}
              disabled={loading || success}
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Nova Senha */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={loading || success}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nova senha (mín. 6 caracteres)"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('new')}
              disabled={loading || success}
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {formData.newPassword && (
            <div className="mt-2">
              <div className="text-xs text-gray-600">
                Força da senha: 
                <span className={`ml-1 font-medium ${
                  formData.newPassword.length >= 8 
                    ? 'text-green-600' 
                    : formData.newPassword.length >= 6 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {formData.newPassword.length >= 8 ? 'Forte' : 
                   formData.newPassword.length >= 6 ? 'Média' : 'Fraca'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar Nova Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading || success}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Confirme sua nova senha"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('confirm')}
              disabled={loading || success}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword && (
            <div className="mt-2">
              <div className={`text-xs ${
                formData.newPassword === formData.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.newPassword === formData.confirmPassword 
                  ? '✓ Senhas coincidem' 
                  : '✗ Senhas não coincidem'}
              </div>
            </div>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || success}
            className={`${onClose ? 'flex-1' : 'w-full'} relative`}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Alterando...</span>
              </>
            ) : success ? (
              '✓ Senha Alterada'
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </div>
      </form>

      {/* Dicas de segurança */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para uma senha segura:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Use pelo menos 8 caracteres</li>
          <li>• Combine letras, números e símbolos</li>
          <li>• Evite informações pessoais</li>
          <li>• Use uma senha única para cada conta</li>
        </ul>
      </div>
    </div>
  );
} 