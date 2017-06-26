'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);

class SessionModel {

    static getAll() {
        return client.hvalsAsync('ui-sessions').then((items) => {
            return _.map(items, o=>{ 
                return JSON.parse(o);
            });
        });
    }

    static create(sessionName) {
        let newSession = { name: sessionName };
        return client.rpushAsync('ui-sessions', JSON.stringify(newSession) );
    }

    static delete(sessionName) {
        let newSession = { name: sessionName };
        return client.lremAsync('ui-sessions', 1, JSON.stringify(newSession) );
    }
}

module.exports = SessionModel;