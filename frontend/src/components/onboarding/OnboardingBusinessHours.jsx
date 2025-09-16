import React from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OnboardingBusinessHours = ({ businessHours, setBusinessHours }) => {
  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

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

  // A validação pode ser movida para o componente pai se necessário, mas por enquanto pode ficar aqui
  // para dar feedback instantâneo, caso se decida adicionar novamente um setError local.
  const validateHours = () => {
    for (const dayIndex in businessHours) {
      const day = businessHours[dayIndex];
      if (day.isOpen) {
        for (const interval of day.intervals || []) {
          if (!interval.start || !interval.end) return false;
          if (interval.start >= interval.end) return false;
        }
      }
    }
    return true;
  };

  if (!businessHours || Object.keys(businessHours).length === 0) {
    return <div className="text-center p-8"><Clock className="w-8 h-8 animate-spin mx-auto text-purple-600" /></div>;
  }

  return (
    <div>
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
                  {(dayData.intervals || []).map((interval, intervalIndex) => (
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
    </div>
  );
};

export default OnboardingBusinessHours;
