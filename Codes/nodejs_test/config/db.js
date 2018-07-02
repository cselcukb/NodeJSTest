var db = {};
// Init Sequelize
const Sequelize = require('sequelize');
const sequelize = new Sequelize('node_js_test_app', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false,

    define: {
        //prevent sequelize from pluralizing table names
        freezeTableName: true,
        underscored: true
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// module.exports = db;
module.exports = sequelize;