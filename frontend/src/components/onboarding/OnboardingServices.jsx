import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../common/LoadingSpinner';
import { Scissors, PlusCircle, List, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const formatarMinutosParaDuracao = (minutos) => {
    if (!minutos || minutos < 1) return '00:00';
    const hours = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const timeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
};

const OnboardingServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await apiRequest.get('/servicos');
            setServices(data);
        } catch (err) {
            setError(err.message || 'Não foi possível carregar os serviços.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.target);
        const duracaoEmTempo = formData.get('duracao');

        const serviceData = {
            nome: formData.get('nome'),
            descricao: formData.get('descricao'),
            duracao_minutos: timeToMinutes(duracaoEmTempo),
            preco: parseFloat(formData.get('preco')) || 0
        };

        if (!serviceData.nome || serviceData.duracao_minutos <= 0) {
            setError("Nome do serviço e duração são obrigatórios.");
            setSubmitting(false);
            return;
        }

        try {
            await apiRequest.post('/servicos', serviceData);
            setSuccess('Serviço adicionado com sucesso!');
            e.target.reset();
            loadServices();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erro ao adicionar serviço.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Tem a certeza de que deseja apagar este serviço?')) return;

        try {
            await apiRequest.delete(`/servicos/${serviceId}`);
            setSuccess('Serviço apagado com sucesso!');
            loadServices();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err)
        {
            setError(err.message || 'Erro ao apagar serviço.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                    <PlusCircle className="w-5 h-5 mr-2 text-[#704abf]" />
                    Adicionar Novo Serviço
                </h3>
                <form onSubmit={handleCreateService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nome-onboarding">Nome do Serviço *</Label>
                            <Input id="nome-onboarding" name="nome" required placeholder="Ex: Corte de Cabelo" />
                        </div>
                        <div>
                            <Label htmlFor="duracao-onboarding">Duração *</Label>
                            <Input id="duracao-onboarding" name="duracao" type="time" required defaultValue="00:30" step="300" />
                        </div>
                        <div>
                            <Label htmlFor="preco-onboarding">Preço (R$)</Label>
                            <Input id="preco-onboarding" name="preco" type="number" step="0.01" min="0" placeholder="25.00" />
                        </div>
                        <div className="sm:col-span-2">
                             <Label htmlFor="descricao-onboarding">Descrição</Label>
                            <Input id="descricao-onboarding" name="descricao" placeholder="Opcional" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</> : 'Adicionar Serviço'}
                        </Button>
                    </div>
                </form>
            </div>

            <div>
                <h3 className="text-lg font-semibold flex items-center mb-4">
                    <List className="w-5 h-5 mr-2 text-[#704abf]" />
                    Meus Serviços
                </h3>
                {loading ? (
                    <LoadingSpinner text="A carregar serviços..." />
                ) : services.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 border rounded-lg">
                        <Scissors className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Nenhum serviço registado ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-2 border rounded-lg p-2">
                        {services.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{service.nome}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatarMinutosParaDuracao(service.duracao_minutos)} - R$ {parseFloat(service.preco || 0).toFixed(2)}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="mt-4 bg-green-50 border-green-200 text-green-800"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
        </div>
    );
};

export default OnboardingServices;
