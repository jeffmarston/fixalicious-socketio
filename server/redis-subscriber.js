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
        let my_sessionKey = "ui-sessions";

        let pollers = [];
        function addTransactionPoller(sessionName) {
            let sub_transactionKey = "fix-svr-" + sessionName + suffix;
            let ui_transactionKey = "ui-transactions-" + sessionName;
            console.log("Watching for new transactions on: " + sub_transactionKey);

            let newClient = redis.createClient();
            pollers.push(newClient);
            newClient.brpoplpush(sub_transactionKey, ui_transactionKey, 0, (err, message)=>{

                console.log(" - received message on: " + sub_transactionKey);

                global.io.emit("transaction", message);
                redisTransactions.brpoplpush(sub_transactionKey, ui_transactionKey, 0, handleTransactions);
            });
        }

        function pollForSessions(err, result) {
            console.log("Session update received: " + result[1]);
            let session = JSON.parse(result[1]);
            global.io.emit('session', session);

            if (session.status == "up") {
                addTransactionPoller(session.session);
            } else {
                //removeTransactionPoller(session.session);
            }

            redisSessions.hsetAsync(my_sessionKey, session.session, result[1]).then(o => {
                return redisSessions.brpop(sub_sessionKey, 0, pollForSessions);
            });
        }
        console.log("Watching for session changes on: " + sub_sessionKey);
        redisSessions.brpop(sub_sessionKey, 0, pollForSessions);
    }

}

module.exports = Subscriber;




