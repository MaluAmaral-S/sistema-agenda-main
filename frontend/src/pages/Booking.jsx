import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import {
  CalendarCheck,
  Scissors,
  Calendar,
  Clock,
  User,
  Check,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const Booking = () => {
  const { businessSlug } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clientData, setClientData] = useState({
    nome: "",
    telefone: "",
    email: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [hoursConfigured, setHoursConfigured] = useState(true);

  const formatPrice = (price) => {
    if (!price) return "Consulte o valor";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? (mins > 0 ? `${hours}h ${mins}min` : `${hours}h`) : `${mins}min`;
  };
  const formatDate = (date) => date.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  useEffect(() => {
    if (businessSlug) {
      loadBusinessData();
    } else {
      setError("Link de agendamento inválido");
      setLoading(false);
    }
  }, [businessSlug]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest.get(`/business/${businessSlug}`);
      
      setBusinessData(data.business);
      setServices(data.services || []);

      const hoursData = data.businessHours;
      let hoursArray = [];

      if (hoursData && typeof hoursData === 'object' && !Array.isArray(hoursData) && Object.keys(hoursData).length > 0) {
        hoursArray = Object.keys(hoursData).map(dayKey => ({
          dayOfWeek: parseInt(dayKey, 10),
          is_open: hoursData[dayKey].isOpen,
          intervals: hoursData[dayKey].intervals || [],
        }));
        setHoursConfigured(true);
      } else {
        setHoursConfigured(false);
      }
      
      setBusinessHours(hoursArray);

    } catch (error) {
      console.error("Erro ao carregar dados da empresa:", error);
      setError("Não foi possível carregar os dados da empresa");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate || !businessData) return;
    try {
      // CORREÇÃO: Formata a data para YYYY-MM-DD no fuso horário local
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const response = await apiRequest.get(
        `/empresa/${businessData.id}/horarios-disponiveis?serviceId=${selectedService.id}&date=${dateStr}`
      );
      
      if (response && response.availableSlots) {
        const slots = response.availableSlots.map(slot => slot.startTime);
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }

    } catch (error) {
      console.error("Erro ao carregar horários disponíveis:", error);
      setAvailableSlots([]);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      // CORREÇÃO: Formata a data para YYYY-MM-DD no fuso horário local
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const appointmentDateStr = `${year}-${month}-${day}`;

      const bookingData = {
        serviceId: selectedService.id,
        clientName: clientData.nome,
        clientEmail: clientData.email,
        clientPhone: clientData.telefone,
        appointmentDate: appointmentDateStr,
        appointmentTime: selectedTime,
      };
      await apiRequest.post(`/empresa/${businessData.id}/agendamentos`, bookingData);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento. Tente novamente.");
    }
  };

  const goToPreviousStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const goToNextStep = () => currentStep < 5 && setCurrentStep(currentStep + 1);

  const canContinue = () => {
    switch (currentStep) {
      case 1: return selectedService !== null;
      case 2: return selectedDate !== null && hoursConfigured;
      case 3: return selectedTime !== null;
      case 4: return clientData.nome && clientData.telefone;
      default: return false;
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedTime(null);
    setCurrentStep(2);
  };

  const handleDateSelect = (day) => {
    if (day.isDisabled) return;
    setSelectedDate(day.date);
    setSelectedTime(null);
    setCurrentStep(3);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setCurrentStep(4);
  };

  const handleClientDataChange = (field, value) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };
  
  const isDayDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    const dayOfWeek = date.getDay();
    const businessDay = businessHours.find((h) => h.dayOfWeek === dayOfWeek);

    if (!businessDay || !businessDay.is_open) return true;

    return false;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: "", isCurrentMonth: false, isDisabled: true });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isDisabled = isDayDisabled(date); 
      days.push({
        day: i, date, isCurrentMonth: true,
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
        isDisabled,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 0; i < remainingDays; i++) {
      days.push({ day: "", isCurrentMonth: false, isDisabled: true });
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Carregando informações...
          </h3>
          <p className="text-gray-600">
            Aguarde enquanto buscamos os dados da empresa
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Erro ao Carregar
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Agendamento Confirmado!
          </h3>
          <p className="text-green-700 mb-6">
            Seu agendamento foi realizado com sucesso. Você receberá uma
            confirmação em breve.
          </p>
          <div className="bg-white rounded-lg p-4 border border-green-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Detalhes do Agendamento
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium text-gray-900">
                  {selectedService?.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium text-gray-900">
                  {selectedDate && formatDate(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium text-gray-900">
                  {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duração:</span>
                <span className="font-medium text-gray-900">
                  {selectedService &&
                    formatDuration(selectedService.duracao_minutos)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Preço:</span>
                <span className="font-semibold text-purple-600">
                  {selectedService && formatPrice(selectedService.preco)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                <CalendarCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Agendamento Online</h1>
                <p className="text-white/80 text-sm">{businessData?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[{ step: 1, label: "Serviço" }, { step: 2, label: "Data" }, { step: 3, label: "Horário" }, { step: 4, label: "Dados" }].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === item.step ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" : currentStep > item.step ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {currentStep > item.step ? <Check className="w-5 h-5" /> : item.step}
                  </div>
                  <div className="hidden sm:block text-sm font-medium text-gray-700">{item.label}</div>
                </div>
                {index < 3 && (<div className="flex-1 h-1 bg-gray-200 mx-4"><div className={`h-full transition-all duration-300 ${currentStep > item.step ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-200"}`}></div></div>)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Scissors className="w-6 h-6 mr-3 text-purple-600" />
              Escolha o Serviço
            </h2>
            <p className="text-gray-600 mb-6">Selecione o serviço que você deseja agendar</p>
            <div className="grid gap-4">
              {services.map((service) => (
                <div key={service.id} onClick={() => handleServiceSelect(service)} className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${selectedService?.id === service.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.descricao}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(service.duracao_minutos)}
                        </span>
                        <span className="text-lg font-semibold text-purple-600">{formatPrice(service.preco)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-purple-600" />
              Escolha a Data
            </h2>
            <p className="text-gray-600 mb-6">Selecione o dia para seu agendamento</p>
            {!hoursConfigured ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-gray-600 font-semibold">Horários não configurados</p>
                <p className="text-sm text-gray-500 mt-1">Este estabelecimento ainda não definiu seus horários de funcionamento.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                  <h3 className="text-lg font-semibold text-gray-900">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map((day) => (<div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((day, index) => (
                    <button key={index} onClick={() => handleDateSelect(day)} disabled={day.isDisabled} className={`p-3 text-sm rounded-lg transition-colors ${day.isSelected ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" : day.isDisabled ? "text-gray-300 cursor-not-allowed" : day.isCurrentMonth ? "text-gray-900 hover:bg-purple-100" : "text-gray-400"}`}>
                      {day.day}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-purple-600" />
              Escolha o Horário
            </h2>
            <p className="text-gray-600 mb-6">Selecione o horário disponível para seu agendamento</p>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button key={slot} onClick={() => handleTimeSelect(slot)} className={`p-3 text-sm rounded-lg border transition-colors ${selectedTime === slot ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhum horário disponível para esta data</p>
                <p className="text-sm text-gray-500 mt-1">Tente selecionar outra data</p>
              </div>
            )}
          </div>
        )}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <User className="w-6 h-6 mr-3 text-purple-600" />
              Seus Dados
            </h2>
            <p className="text-gray-600 mb-6">Preencha suas informações para finalizar o agendamento</p>
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input type="text" id="nome" required value={clientData.nome} onChange={(e) => handleClientDataChange("nome", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors" placeholder="Digite seu nome completo" />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input type="tel" id="telefone" required value={clientData.telefone} onChange={(e) => handleClientDataChange("telefone", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcional)</label>
                <input type="email" id="email" value={clientData.email} onChange={(e) => handleClientDataChange("email", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors" placeholder="seu@email.com" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Serviço:</span><span className="font-medium text-gray-900">{selectedService?.nome}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Data:</span><span className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Horário:</span><span className="font-medium text-gray-900">{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Duração:</span><span className="font-medium text-gray-900">{selectedService && formatDuration(selectedService.duracao_minutos)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Preço:</span><span className="font-semibold text-purple-600">{selectedService && formatPrice(selectedService.preco)}</span></div>
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                Confirmar Agendamento
              </button>
            </form>
          </div>
        )}
        {!bookingSuccess && (
          <div className="flex justify-between mt-8">
            <button onClick={goToPreviousStep} disabled={currentStep === 1} className={`px-6 py-3 rounded-lg font-medium flex items-center ${currentStep === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            <button onClick={goToNextStep} disabled={!canContinue()} className={`px-6 py-3 rounded-lg font-medium flex items-center ${!canContinue() ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Booking;