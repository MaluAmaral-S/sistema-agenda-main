// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  confirmAppointment,
  rejectAppointment,
  rescheduleAppointment,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// Rotas públicas (para clientes)
router.post('/empresa/:id/agendamentos', createAppointment);
router.get('/empresa/:id/horarios-disponiveis', getAvailableSlots);

// Rotas protegidas (para empresas)
router.get('/empresa/:id/agendamentos', authenticateToken, getAppointments);
router.patch('/agendamentos/:id/confirmar', authenticateToken, confirmAppointment);
router.patch('/agendamentos/:id/recusar', authenticateToken, rejectAppointment);
router.patch('/agendamentos/:id/remarcar', authenticateToken, rescheduleAppointment);

module.exports = router;

