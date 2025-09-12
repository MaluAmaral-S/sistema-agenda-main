// src/controllers/appointmentController.js
const { Appointment, User, Service, BusinessHours } = require('../models');
const { Op } = require('sequelize');

// --- SUAS FUNÇÕES AUXILIARES ORIGINAIS (MANTIDAS) ---

// Função auxiliar para converter horário em minutos
const timeToMinutes = (timeString) => {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Função auxiliar para converter minutos em horário
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Função para verificar se o horário está dentro do funcionamento
const isWithinBusinessHours = (businessHours, dayOfWeek, startTime, endTime) => {
  const daySchedule = businessHours[dayOfWeek.toString()];
  
  if (!daySchedule || !daySchedule.isOpen) {
    return false;
  }

  // Garante que 'intervals' é uma lista (array) antes de tentar usá-la.
  if (!daySchedule.intervals || !Array.isArray(daySchedule.intervals)) {
    return false;
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return daySchedule.intervals.some(interval => {
    const intervalStart = timeToMinutes(interval.start);
    const intervalEnd = timeToMinutes(interval.end);
    return startMinutes >= intervalStart && endMinutes <= intervalEnd;
  });
};

// Função para verificar conflitos de horário
const hasTimeConflict = async (userId, date, startTime, endTime, excludeAppointmentId = null) => {
  const whereClause = {
    userId,
    appointmentDate: date,
    status: ['confirmed', 'pending'], // Considera tanto pendentes quanto confirmados
    [Op.or]: [
      { // Um agendamento existente começa durante o novo
        appointmentTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime }
      }
    ]
  };

  if (excludeAppointmentId) {
    whereClause.id = { [Op.ne]: excludeAppointmentId };
  }

  const conflictingAppointments = await Appointment.count({ where: whereClause });
  return conflictingAppointments > 0;
};

// --- SUAS FUNÇÕES DE CONTROLLER ORIGINAIS (MANTIDAS) ---

// POST /api/empresa/:id/agendamentos - Cliente solicita um novo agendamento
const createAppointment = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const {
            serviceId,
            clientName,
            clientEmail,
            clientPhone,
            appointmentDate,
            appointmentTime,
            observations
        } = req.body;

        const business = await User.findByPk(userId);
        if (!business) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }

        const service = await Service.findOne({ where: { id: serviceId, userId } });
        if (!service) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }

        const startMinutes = timeToMinutes(appointmentTime);
        const endMinutes = startMinutes + service.duracao_minutos;
        const endTime = minutesToTime(endMinutes);

        const businessHours = await BusinessHours.findOne({ where: { userId } });
        if (!businessHours) {
            return res.status(400).json({ error: 'Horários de funcionamento não configurados' });
        }

        const appointmentDateObj = new Date(appointmentDate + 'T00:00:00');
        const dayOfWeek = appointmentDateObj.getDay();

        if (!isWithinBusinessHours(businessHours.businessHours, dayOfWeek, appointmentTime, endTime)) {
            return res.status(400).json({ error: 'Horário fora do funcionamento da empresa' });
        }

        const hasConflict = await hasTimeConflict(userId, appointmentDate, appointmentTime, endTime);
        if (hasConflict) {
            return res.status(400).json({ error: 'Horário não disponível' });
        }

        const appointment = await Appointment.create({
            userId,
            serviceId,
            clientName,
            clientEmail,
            clientPhone,
            appointmentDate,
            appointmentTime,
            endTime,
            observations,
            status: 'pending'
        });

        const appointmentWithService = await Appointment.findByPk(appointment.id, {
            include: [{ model: Service, as: 'service', attributes: ['nome', 'duracao_minutos', 'preco'] }]
        });

        res.status(201).json({
            message: 'Agendamento solicitado com sucesso',
            appointment: appointmentWithService
        });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/empresa/:id/agendamentos - Listar agendamentos da empresa
const getAppointments = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const { status, date, page = 1, limit = 10 } = req.query;

        const business = await User.findByPk(userId);
        if (!business) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }

        const whereClause = { userId };
        if (status) whereClause.status = status;
        if (date) whereClause.appointmentDate = date;

        const offset = (page - 1) * limit;

        const { count, rows: appointments } = await Appointment.findAndCountAll({
            where: whereClause,
            include: [{ model: Service, as: 'service', attributes: ['nome', 'duracao_minutos', 'preco'] }],
            order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            appointments,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PATCH /api/agendamentos/:id/confirmar - Empresa confirma agendamento
const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOne({
            where: { id, userId: req.user.id },
            include: [{ model: Service, as: 'service' }]
        });

        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });
        if (appointment.status !== 'pending') return res.status(400).json({ error: 'Agendamento não está pendente' });

        await appointment.update({ status: 'confirmed' });
        res.json({ message: 'Agendamento confirmado com sucesso', appointment });
    } catch (error) {
        console.error('Erro ao confirmar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PATCH /api/agendamentos/:id/recusar - Empresa recusa agendamento
const rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        const appointment = await Appointment.findOne({ where: { id, userId: req.user.id } });
        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });
        if (appointment.status !== 'pending') return res.status(400).json({ error: 'Agendamento não está pendente' });

        await appointment.update({ status: 'rejected', rejectionReason });
        res.json({ message: 'Agendamento recusado com sucesso', appointment });
    } catch (error) {
        console.error('Erro ao recusar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PATCH /api/agendamentos/:id/remarcar - Empresa sugere nova data/hora
const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { suggestedDate, suggestedTime } = req.body;

        const appointment = await Appointment.findOne({
            where: { id, userId: req.user.id },
            include: [{ model: Service, as: 'service' }]
        });
        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });
        if (appointment.status !== 'pending') return res.status(400).json({ error: 'Agendamento não está pendente' });

        const startMinutes = timeToMinutes(suggestedTime);
        const endMinutes = startMinutes + appointment.service.duracao_minutos;
        const suggestedEndTime = minutesToTime(endMinutes);

        const businessHours = await BusinessHours.findOne({ where: { userId: req.user.id } });
        const dayOfWeek = new Date(suggestedDate).getDay();

        if (!isWithinBusinessHours(businessHours.businessHours, dayOfWeek, suggestedTime, suggestedEndTime)) {
            return res.status(400).json({ error: 'Horário sugerido fora do funcionamento da empresa' });
        }

        const hasConflict = await hasTimeConflict(req.user.id, suggestedDate, suggestedTime, suggestedEndTime, id);
        if (hasConflict) {
            return res.status(400).json({ error: 'Horário sugerido não disponível' });
        }

        await appointment.update({ status: 'rescheduled', suggestedDate, suggestedTime, suggestedEndTime });
        res.json({ message: 'Nova data/hora sugerida com sucesso', appointment });
    } catch (error) {
        console.error('Erro ao remarcar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// --- FUNÇÃO GETAVAILABLESLOTS ATUALIZADA E CORRIGIDA ---

const getAvailableSlots = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const { date, serviceId } = req.query;

        if (!date || !serviceId) {
            return res.status(400).json({ error: 'Data e serviço são obrigatórios' });
        }

        const [service, businessHoursRecord, user] = await Promise.all([
            Service.findOne({ where: { id: serviceId, userId } }),
            BusinessHours.findOne({ where: { userId } }),
            User.findByPk(userId)
        ]);

        if (!user) return res.status(404).json({ error: 'Empresa não encontrada' });
        if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
        if (!businessHoursRecord) return res.status(400).json({ error: 'Horários de funcionamento não configurados' });

        const dateObj = new Date(date + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        const daySchedule = businessHoursRecord.businessHours[dayOfWeek.toString()];

        if (!daySchedule || !daySchedule.isOpen) {
            return res.json({ availableSlots: [] });
        }
        
        if (!daySchedule.intervals || !Array.isArray(daySchedule.intervals)) {
            return res.json({ availableSlots: [] });
        }

        const existingAppointments = await Appointment.findAll({
            where: {
                userId,
                appointmentDate: date,
                status: { [Op.ne]: 'rejected' } // <-- CORREÇÃO FINAL APLICADA AQUI
            },
            include: [{ model: Service, as: 'service', attributes: ['duracao_minutos'] }]
        });

        const bookedSlots = existingAppointments.map(app => {
            const start = timeToMinutes(app.appointmentTime);
            const end = start + (app.service?.duracao_minutos || service.duracao_minutos);
            return { start, end };
        });

        const availableSlots = [];
        const serviceDuration = service.duracao_minutos;
        const now = new Date();
        const isToday = now.toISOString().split('T')[0] === date;

        for (const interval of daySchedule.intervals) {
            let slotStartMinutes = timeToMinutes(interval.start);
            const intervalEndMinutes = timeToMinutes(interval.end);

            while (slotStartMinutes + serviceDuration <= intervalEndMinutes) {
                const slotEndMinutes = slotStartMinutes + serviceDuration;

                const slotDateTime = new Date(`${date}T${minutesToTime(slotStartMinutes)}:00`);
                if (isToday && slotDateTime < now) {
                    slotStartMinutes += 15;
                    continue;
                }

                const hasConflict = bookedSlots.some(booked =>
                    (slotStartMinutes < booked.end && slotEndMinutes > booked.start)
                );

                if (!hasConflict) {
                    availableSlots.push({ startTime: minutesToTime(slotStartMinutes) });
                }
                
                slotStartMinutes += 15; // Intervalo de verificação de 15 min
            }
        }

        res.json({ availableSlots });

    } catch (error) {
        console.error('Erro ao buscar horários disponíveis:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    confirmAppointment,
    rejectAppointment,
    rescheduleAppointment,
    getAvailableSlots
};