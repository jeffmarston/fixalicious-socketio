'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

class ScenarioModel {

    static getAll() {
        return client.hvalsAsync('ui-scenarios').then((items) => {
            return _.map(items, o=>{ 
                return JSON.parse(o);
            });
        });
    }

    static getById(sessionName) {
         return client.hgetAsync('ui-scenarios', sessionName).then((item) => {
            return JSON.parse(item).code;
        });
    }

    static create(sessionName, code) {
        let scenario = { session: sessionName, code: code};
        return client.hsetAsync('ui-scenarios', sessionName, JSON.stringify(scenario) );
    }

    static delete(sessionName) {
        return client.hdelAsync('ui-scenarios', 1, sessionName );
    }
}

module.exports = ScenarioModel;