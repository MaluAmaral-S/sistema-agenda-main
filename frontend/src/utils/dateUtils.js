// Local: frontend/src/utils/dateUtils.js
import { parseISO, startOfDay } from 'date-fns';

/**
 * Analisa uma string de data e hora da API (ex: "2025-09-12" e "10:00:00")
 * e a converte em um objeto de Data do JavaScript correto no fuso horário local do usuário.
 * Isso evita os bugs de conversão de UTC.
 * @param {string} dateString - A data no formato "AAAA-MM-DD"
 * @param {string} timeString - A hora no formato "HH:MM:SS" ou "HH:MM"
 * @returns {Date}
 */
export const parseDateFromAPI = (dateString, timeString) => {
  const fullISOString = `${dateString}T${timeString}`;
  return parseISO(fullISOString);
};

/**
 * Analisa apenas uma string de data da API (ex: "2025-09-12") e a retorna
 * como um objeto de Data representando o início daquele dia no fuso horário local.
 * @param {string} dateString - A data no formato "AAAA-MM-DD"
 * @returns {Date}
 */
export const parseDateOnlyFromAPI = (dateString) => {
  const date = parseISO(dateString);
  return startOfDay(date);
};
