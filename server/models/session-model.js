'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient(6379, 'mrsbuffy');
let scenarioModel = require("./scenario-model");

bluebird.promisifyAll(redis.RedisClient.prototype);

class SessionModel {

    static getAll() {
        return client.hvalsAsync('ui-sessions').then((items) => {
            return _.map(items, o => {
                return JSON.parse(o);
            });
        });
    }

    static create(sessionName) {
        let newSession = { name: sessionName };
        return client.rpushAsync('ui-sessions', JSON.stringify(newSession));
    }

    static delete(sessionName) {
        let session = { name: sessionName };
        return client.lremAsync('ui-sessions', 1, JSON.stringify(session));
    }

    static enableScenarios(sessionName) {
        // return client.hgetAsync('ui-sessions', sessionName).then((item) => {
        //     let session = JSON.parse(item);
        //     enable = enable || [];
        //     disable = disable || [];
        //     session.scenarios = session.scenarios || [];
        //     _.remove(session.scenarios, o => {
        //         return (disable.indexOf(o) > -1) || (enable.indexOf(o) > -1);
        //     })
        //     session.scenarios = session.scenarios.concat(enable);

        //     // disable
        //     disable.forEach(scenarioId => {
        //         scenarioModel.disable(session, scenarioId);
        //     }, this);

        //     // enable
        //     session.scenarios.forEach(scenarioId => {
        //         scenarioModel.enable(session, scenarioId);
        //     }, this);

        //     return client.hset('ui-sessions', sessionName, JSON.stringify(session));
        // });

    }
}

module.exports = SessionModel;