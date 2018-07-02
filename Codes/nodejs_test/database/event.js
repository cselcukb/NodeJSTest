// Init Sequelize
const Sequelize = require('sequelize');
var sequelize = require('../config/db');

const Event = sequelize.define('event', {
    event_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    country_id: Sequelize.STRING,
    event_site_id: Sequelize.STRING,
    event_name: Sequelize.STRING,
    event_price: Sequelize.TEXT,
    event_date: Sequelize.STRING,
    event_location: Sequelize.STRING,
    event_link: Sequelize.STRING,
});

module.exports = Event;
