import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: code + new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('Um código de verificação foi enviado para seu e-mail.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Falha ao enviar e-mail de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // The backend needs email, code, and new password
      await resetPassword(email, code, password);
      setSuccess('Sua senha foi redefinida com sucesso! Você será redirecionado para o login.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Falha ao redefinir a senha. O código pode ser inválido ou ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-[#704abf]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar Senha</h1>
          <p className="text-white/80">Siga os passos para redefinir sua senha</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          {success && step === 2 && !isLoading && (
             <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
             </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-white">Seu E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-white"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-white text-[#704abf] hover:bg-gray-100 font-semibold py-3">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Código'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
               <div>
                <Label htmlFor="code" className="text-white">Código de Verificação</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-white"
                  placeholder="Código de 4 dígitos"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Nova Senha</Label>
                <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-white pr-10"
                      placeholder="Mín. 6 caracteres"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
              </div>
               <div>
                <Label htmlFor="confirm-password" className="text-white">Confirmar Nova Senha</Label>
                <div className="relative mt-1">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-white pr-10"
                      placeholder="Confirme a nova senha"
                      required
                    />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-white text-[#704abf] hover:bg-gray-100 font-semibold py-3">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redefinir Senha'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-white/80 hover:text-white text-sm">
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
