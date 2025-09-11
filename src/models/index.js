const User = require('./User');
const Service = require('./Service');
const BusinessHours = require('./BusinessHours');
const Appointment = require('./Appointment');

const sequelize = require("../config/database");
const { Sequelize } = require("sequelize");

module.exports = {
  User,
  Service,
  BusinessHours,
  Appointment,
  sequelize,
  Sequelize
};

