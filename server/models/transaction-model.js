'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
var rp = require('request-promise');

// var request = Promise.promisify(require("request"));
// Promise.promisifyAll(request);

class TransactionModel {

    static getAll(sessionName) {
        return client.lrangeAsync("ui-transactions-" + sessionName, 0, 300).then((items) => {
            return _.map(items, (o) => {
                let json = JSON.parse(o);
                return json;
            });
        });
    }

    static create(sessionName, transaction) {
        console.log(" == CREATE == ");
        console.log(transaction);

        return rp.post(
            'http://localhost:9999/' + sessionName + '/ExecutionReport',
            { json: transaction },
            function (error, response, body) {
                if (error) {
                    console.error(error);
                } else {
                    console.log("Response = " + response.statusCode);
                }
            }
        );
    }

    static delete(sessionName) {
        return client.delAsync("ui-transactions-" + sessionName);
    }
}

module.exports = TransactionModel;