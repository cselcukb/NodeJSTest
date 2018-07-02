// Init Sequelize
const Sequelize = require('sequelize');
var sequelize = require('../config/db');

const Country = sequelize.define('country', {
    country_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    country_iso: Sequelize.STRING,
    country_name: Sequelize.STRING,
    country_nicename: Sequelize.STRING,
    country_numcode: Sequelize.STRING
});

module.exports = Country;