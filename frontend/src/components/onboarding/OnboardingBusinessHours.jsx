import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '../../services/api';
import { toast } from 'sonner';

const OnboardingBusinessHours = () => {
  const [businessHours, setBusinessHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const defaultHours = {
    "0": { isOpen: false, intervals: [] },
    "1": { isOpen: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    "2": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
    "3": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
    "4": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
    "5": { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
    "6": { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }] }
  };

  useEffect(() => {
    loadBusinessHours();
  }, []);

  const loadBusinessHours = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/business-hours');
      if (response && response.businessHours && Object.keys(response.businessHours).length > 0) {
        setBusinessHours(response.businessHours);
      } else {
        setBusinessHours(defaultHours);
      }
    } catch (error) {
      console.warn('Erro ao carregar horários, usando padrão:', error.message);
      setBusinessHours(defaultHours);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIndex) => {
    setBusinessHours(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], isOpen: !prev[dayIndex]?.isOpen, intervals: prev[dayIndex]?.isOpen ? [] : prev[dayIndex]?.intervals || [] }}));
  };

  const addInterval = (dayIndex) => {
    setBusinessHours(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], intervals: [...(prev[dayIndex]?.intervals || []), { start: '09:00', end: '18:00' }] }}));
  };

  const removeInterval = (dayIndex, intervalIndex) => {
    setBusinessHours(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], intervals: prev[dayIndex]?.intervals?.filter((_, index) => index !== intervalIndex) || [] }}));
  };

  const updateInterval = (dayIndex, intervalIndex, field, value) => {
    setBusinessHours(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], intervals: prev[dayIndex]?.intervals?.map((interval, index) => index === intervalIndex ? { ...interval, [field]: value } : interval) || [] }}));
  };

  const validateHours = () => {
    for (const dayIndex in businessHours) {
      const day = businessHours[dayIndex];
      if (day.isOpen) {
        for (const interval of day.intervals || []) {
          if (!interval.start || !interval.end) {
            setError(`No dia ${daysOfWeek[dayIndex]}, preencha todos os campos de horário.`);
            return false;
          }
          if (interval.start >= interval.end) {
            setError(`No dia ${daysOfWeek[dayIndex]}, o horário de término deve ser posterior ao de início.`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const saveBusinessHours = async () => {
    setError('');
    if (!validateHours()) return;
    try {
      setSaving(true);
      await apiRequest.post('/business-hours', { businessHours });
      toast.success('Horários salvos com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar horários.');
      setError(error.message || 'Erro ao salvar horários.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-8"><Clock className="w-8 h-8 animate-spin mx-auto text-[#704abf]" /></div>;

  return (
    <div>
      {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((dayName, dayIndex) => {
          const dayData = businessHours[dayIndex] || { isOpen: false, intervals: [] };
          return (
            <div key={dayIndex} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <span className="font-semibold text-gray-800">{dayName}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={dayData.isOpen} onChange={() => toggleDay(dayIndex)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              {dayData.isOpen && (
                <div className="space-y-3">
                  {dayData.intervals.map((interval, intervalIndex) => (
                    <div key={intervalIndex} className="flex items-center gap-2">
                      <Input type="time" value={interval.start} onChange={(e) => updateInterval(dayIndex, intervalIndex, 'start', e.target.value)} className="bg-gray-100 border-gray-200" />
                      <Input type="time" value={interval.end} onChange={(e) => updateInterval(dayIndex, intervalIndex, 'end', e.target.value)} className="bg-gray-100 border-gray-200" />
                      <Button variant="ghost" size="sm" onClick={() => removeInterval(dayIndex, intervalIndex)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addInterval(dayIndex)} className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700">
                    <Plus className="w-4 h-4 mr-2" />Adicionar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={saveBusinessHours} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Horários</>}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingBusinessHours;
