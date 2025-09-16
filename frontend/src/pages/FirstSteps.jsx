import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
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

// Placeholder components for the actual steps
const Step1 = () => (
  <div>
    <p className="mb-4 text-gray-600">Defina aqui os dias e horários em que você está disponível para receber agendamentos. Seus clientes só conseguirão marcar horários dentro dos intervalos que você selecionar.</p>
    <OnboardingBusinessHours />
  </div>
);
const Step2 = () => (
    <div>
        <p className="mb-4 text-gray-600">Adicione os serviços que você oferece. A 'duração' é muito importante, pois nosso sistema a usará para evitar que clientes marquem horários conflitantes.</p>
        <OnboardingServices />
    </div>
);
const Step3 = () => (
    <div>
        <p className="mb-4 text-gray-600">Revise os dados do seu negócio. O 'Nome da Empresa' será exibido para seus clientes na página de agendamento. O e-mail e o WhatsApp serão usados para comunicação.</p>
        <div className="space-y-4">
            <div>
                <Label htmlFor="businessName">Nome da Empresa</Label>
                <Input id="businessName" defaultValue="Minha Empresa" />
            </div>
            <div>
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input id="email" type="email" defaultValue="contato@minhaempresa.com" />
            </div>
            <div>
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <Input id="whatsapp" type="tel" defaultValue="(11) 99999-9999" />
            </div>
        </div>
    </div>
);

const FirstSteps = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
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
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Step Indicators */}
        <div className="flex justify-center items-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-24 h-1 ${step > s ? 'bg-purple-600' : 'bg-gray-300'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo! Vamos configurar sua conta.</CardTitle>
            <CardDescription>Siga os passos para deixar tudo pronto para seus clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="link">Seguir para o painel</Button>
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
                  <AlertDialogAction onClick={handleSkip}>Seguir para o Painel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex gap-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                Próximo
              </Button>
            )}
            {step === 3 && (
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
      </div>
    </div>
  );
};

export default FirstSteps;
