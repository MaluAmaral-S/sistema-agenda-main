import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../common/LoadingSpinner';
import { LayoutGrid, PlusCircle, List, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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
            <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
                    <PlusCircle className="w-5 h-5 mr-3 text-purple-600" />
                    Adicionar Novo Serviço
                </h3>
                <form onSubmit={handleCreateService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="nome-onboarding" className="mb-2 block">Nome do Serviço *</Label>
                            <Input id="nome-onboarding" name="nome" required placeholder="Ex: Corte de Cabelo" />
                        </div>
                        <div>
                            <Label htmlFor="duracao-onboarding" className="mb-2 block">Duração *</Label>
                            <Input id="duracao-onboarding" name="duracao" type="time" required defaultValue="00:30" step="300" />
                        </div>
                        <div>
                            <Label htmlFor="preco-onboarding" className="mb-2 block">Preço (R$)</Label>
                            <Input id="preco-onboarding" name="preco" type="number" step="0.01" min="0" placeholder="25.00" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="descricao-onboarding" className="mb-2 block">Descrição</Label>
                            <Input id="descricao-onboarding" name="descricao" placeholder="Opcional" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</> : 'Adicionar Serviço'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
                    <List className="w-5 h-5 mr-3 text-purple-600" />
                    Meus Serviços
                </h3>
                {loading ? (
                    <LoadingSpinner text="A carregar serviços..." />
                ) : services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">Nenhum serviço registado ainda.</p>
                        <p className="text-sm">Adicione seu primeiro serviço acima.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {services.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                                <div>
                                    <p className="font-semibold text-gray-800">{service.nome}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatarMinutosParaDuracao(service.duracao_minutos)} - R$ {parseFloat(service.preco || 0).toFixed(2)}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)} className="text-gray-400 hover:bg-red-100 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
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
