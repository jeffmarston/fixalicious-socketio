'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let argv = require('yargs').argv;
bluebird.promisifyAll(redis.RedisClient.prototype);


var redisSessions = redis.createClient();
var redisTransactions = redis.createClient();
var msg_count = 0;

class Subscriber {

    static subscribeAll() {

        let suffix = (argv.subscriber) ? "-" + argv.subscriber : "-ui";
        let sub_sessionKey = "fix-svr-sessions" + suffix;
        let sub_transactionKey = "fix-svr-BAXA" + suffix;
        let my_sessionKey = "ui-sessions";
        let my_transactionKey = "ui-transactions-BAXA";

        function pollForSessions(err, result) {
            let session = JSON.parse(result[1]);
            console.log("BRPOPed session: " + result[1]);
            global.io.emit('session', session);

            redisSessions.hsetAsync(my_sessionKey, session.session, result[1]).then(o => {
                setTimeout(() => {
                    return redisSessions.brpop(sub_sessionKey, 0, pollForSessions)
                }, 40);
            });
        }
        console.log("Watching on Redis key: " + sub_sessionKey);
        redisSessions.brpop(sub_sessionKey, 0, pollForSessions);


        function pollForTransactions(err, transaction) {
            //console.log("BRPOPed transaction: " + transaction);
            global.io.emit("transaction", transaction);
            setTimeout(() => {
                redisTransactions.brpoplpush(sub_transactionKey, my_transactionKey, 0, pollForTransactions)
            }, 40);
        }
        console.log("Watching on Redis key: " + sub_transactionKey);
        redisTransactions.brpoplpush(sub_transactionKey, my_transactionKey, 0, pollForTransactions);

    }

}

module.exports = Subscriber;




