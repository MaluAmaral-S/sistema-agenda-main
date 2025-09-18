import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingBusinessHours from '../components/onboarding/OnboardingBusinessHours';
import OnboardingServices from '../components/onboarding/OnboardingServices';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest } from '../services/api';
import { Wand2, Calendar, Check } from 'lucide-react';

// Placeholder components for the actual steps
const Step1 = ({ businessHours, setBusinessHours }) => (
  <OnboardingBusinessHours businessHours={businessHours} setBusinessHours={setBusinessHours} />
);
const Step2 = () => (
  <OnboardingServices />
);

import { toast } from 'sonner';

const FirstSteps = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businessHours, setBusinessHours] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Carregar os horários de funcionamento iniciais quando o componente montar
    const loadBusinessHours = async () => {
      try {
        const response = await apiRequest.get('/business-hours');
        if (response && response.businessHours && Object.keys(response.businessHours).length > 0) {
          setBusinessHours(response.businessHours);
        } else {
          // Define um estado padrão se não houver horários configurados
          const defaultHours = {
            "1": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
            "2": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
            "3": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
            "4": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
            "5": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
          };
          setBusinessHours(defaultHours);
        }
      } catch (error) {
        console.warn('Erro ao carregar horários, usando padrão:', error.message);
      }
    };
    loadBusinessHours();
  }, []);

  const handleNext = async () => {
    if (step === 1) {
      setIsSaving(true);
      try {
        await apiRequest.post('/business-hours', { businessHours });
        toast.success('Horários salvos com sucesso!');
        setStep(step + 1);
      } catch (error) {
        toast.error('Não foi possível salvar os horários. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    } else if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    navigate('/painel');
  };

  const handleFinish = async () => {
    try {
      await apiRequest.patch('/auth/complete-onboarding');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao finalizar o onboarding:', error);
      // Optionally, show an error message to the user
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1 businessHours={businessHours} setBusinessHours={setBusinessHours} />;
      case 2:
        return <Step2 />;
      default:
        return <Step1 businessHours={businessHours} setBusinessHours={setBusinessHours} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white text-center">Configuração Inicial da Conta</h1>
        </div>
      </header>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Step Indicators */}
          <div className="flex justify-center items-center">
            {[
              { step: 1, icon: <Wand2 className="w-5 h-5" /> },
              { step: 2, icon: <Calendar className="w-5 h-5" /> },
            ].map(({ step: s, icon }) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  step === s ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-110 shadow-lg' :
                  step > s ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <Check className="w-6 h-6" /> : icon}
                </div>
                {s < 2 && (
                  <div className="flex-1 h-1 bg-gray-200 mx-4 rounded">
                    <div className={`h-full rounded transition-all duration-500 ${step > s ? "bg-gradient-to-r from-green-500 to-green-600" : ""}`} style={{ width: step > s ? '100%' : '0%' }}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-gray-800">Bem-vindo(a), {user?.name || 'Empreendedor(a)'}!</h2>
              <p className="text-lg text-gray-600 mt-2">Vamos começar configurando seus horários de funcionamento.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-gray-800">Quase lá! Agora, cadastre seus serviços.</h2>
              <p className="text-lg text-gray-600 mt-2">Adicione os serviços que você oferece. A duração é crucial para evitar conflitos de agendamento.</p>
            </>
          )}
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          {/* Left Side: Skip or Back */}
          <div>
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                    Pular e ir para o Painel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você pode concluir as configurações mais tarde no seu painel.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSkip}>Pular</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Right Side: Next or Finish */}
          <div>
            {step < 2 && (
              <Button onClick={handleNext} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                {isSaving ? "Salvando..." : "Próximo"}
              </Button>
            )}
            {step === 2 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">Finalizar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tudo pronto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que selecionou tudo certo? Você poderá alterar essas configurações depois.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinish}>Finalizar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FirstSteps;
