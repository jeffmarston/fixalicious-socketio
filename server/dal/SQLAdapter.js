'use strict';

let Sequelize = require('sequelize');

class SQLAdapter {
    constructor() {
        this.sequelize = new Sequelize('TCSR10p7', 'sa', 'ezetc', {
            host: 'kenney9020',
            dialect: 'mssql',
            dialectOptions: {
                instanceName: 'SQL12'
            },

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });
    }
}

module.exports = new SQLAdapter().sequelize;