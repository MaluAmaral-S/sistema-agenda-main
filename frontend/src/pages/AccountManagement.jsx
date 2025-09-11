import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AccountManagement = () => {
  const { user, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    ownerName: '',
    businessName: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [error, setError] = useState({ profile: '', password: '' });
  const [success, setSuccess] = useState({ profile: '', password: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        ownerName: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setError({ ...error, profile: '' });
    setSuccess({ ...success, profile: '' });

    try {
      await updateProfile(profileData);
      setSuccess({ ...success, profile: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setError({ ...error, profile: err.message || 'Falha ao atualizar o perfil.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError({ ...error, password: 'As novas senhas não coincidem.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
        setError({ ...error, password: 'A nova senha deve ter pelo menos 8 caracteres.' });
        return;
    }

    setLoadingPassword(true);
    setError({ ...error, password: '' });
    setSuccess({ ...success, password: '' });

    try {
      await updateProfile(passwordData); // The same endpoint handles password changes
      setSuccess({ ...success, password: 'Senha alterada com sucesso!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError({ ...error, password: err.message || 'Falha ao alterar a senha. Verifique sua senha atual.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciamento de Conta</h1>

      {/* Profile Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <User className="w-6 h-6 mr-3 text-[#704abf]" />
          Informações do Perfil
        </h2>

        {error.profile && (
          <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.profile}</AlertDescription>
          </Alert>
        )}
        {success.profile && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success.profile}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="ownerName">Seu Nome</Label>
              <Input
                id="ownerName"
                name="ownerName"
                type="text"
                value={profileData.ownerName}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="businessName">Nome da Empresa</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                value={profileData.businessName}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="mt-1"
            />
          </div>
          {/* Email is not editable for now to avoid complexity */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 bg-gray-100"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loadingProfile}>
              {loadingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>

      {/* Password Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <Lock className="w-6 h-6 mr-3 text-[#704abf]" />
          Alterar Senha
        </h2>

        {error.password && (
          <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.password}</AlertDescription>
          </Alert>
        )}
        {success.password && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success.password}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loadingPassword}>
              {loadingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Alterar Senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountManagement;
