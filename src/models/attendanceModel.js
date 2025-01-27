const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    photo_url: { type: DataTypes.STRING, allowNull: false },
    clock_in: { type: DataTypes.DATE, allowNull: true },
    clock_out: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Attendance;
