'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

class ScenarioModel {

    static getAll() {
        return client.hvalsAsync('ui-scenarios').then((items) => {
            let result = _.map(items, item => {
                return JSON.parse(item);
            });
            return result.sort((a,b)=>{ return a.label > b.label});
        });
    }

    static getById(label) {
        return client.hgetAsync('ui-scenarios', label).then((item) => {
            return JSON.parse(item);
        });
    }

    static create(label, scenario) {
        return client.hsetAsync('ui-scenarios', label, JSON.stringify(scenario));
    }

    static delete(label) {
        return client.hdelAsync('ui-scenarios', 1, label);
    }
}

module.exports = ScenarioModel;