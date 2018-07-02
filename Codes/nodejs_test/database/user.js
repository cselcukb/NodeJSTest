// Init Sequelize
const Sequelize = require('sequelize');
var sequelize = require('../config/db');

const User = sequelize.define('user', {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    is_active: Sequelize.BOOLEAN,
});

module.exports = User;