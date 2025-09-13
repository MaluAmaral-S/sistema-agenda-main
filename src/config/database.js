// src/config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuração para SQLite (para testes) ou PostgreSQL (para produção)
const dialect = process.env.DB_DIALECT || 'postgres';

let sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_NAME || 'agendamentos_db.sqlite',
    logging: false
  });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
    timezone: '-03:00', // Força o Sequelize a usar o fuso horário de Brasília
  });
}

module.exports = sequelize;

