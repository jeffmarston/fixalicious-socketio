'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);


var redisSub = redis.createClient();
var redisClient = redis.createClient();
var msg_count = 0;



class Subscriber {

    static subscribeAll() {

        function pollForSessions(err, result) {
            let session = JSON.parse(result[1]);
            console.log("BRPOPed session: " + result[1]);
            global.io.emit('session', session);
            
            redisClient.hsetAsync('ui-sessions', session.session, result[1]).then(o => {
                return redisClient.brpop('fix-svr-sessions-tr', 0, pollForSessions);
            });
        }
        redisClient.brpop('fix-svr-sessions-tr', 0, pollForSessions);


        function pollForTransactions(err, transaction) {
            //console.log("BRPOPed transaction: " + transaction);
            global.io.emit('transaction', transaction);
            redisClient.brpoplpush('fix-svr-BAXA-tr', 'ui-transactions-BAXA', 0, pollForTransactions);
        }
        redisClient.brpoplpush('fix-svr-BAXA-tr', 'ui-transactions-BAXA', 0, pollForTransactions);

    }

}

module.exports = Subscriber;




