'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

class TransactionModel {
    
    static getAll(sessionName) {
        return client.lrangeAsync('session:' + sessionName, 0, 300).then((items) => {
            return _.map(items, (o)=> { return JSON.parse(o) } );
        });
    }

    static create(sessionName, transaction) {
        let newSession = { name: sessionName };
        return client.rpushAsync('session:' + sessionName, JSON.stringify(transaction) );
    }

    static delete(sessionName) {
        return client.delAsync('session:' + sessionName);
    }
}

module.exports = TransactionModel;