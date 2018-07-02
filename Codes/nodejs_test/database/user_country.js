// Init Sequelize
const Sequelize = require('sequelize');
var sequelize = require('../config/db');

const UserCountry = sequelize.define('user_country', {
    user_id: Sequelize.INTEGER,
    country_id: Sequelize.STRING
});
UserCountry.removeAttribute( 'id' );

module.exports = UserCountry;