'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);


var redisSessionsPoller = redis.createClient();
var msg_count = 0;

class Subscriber {

    static subscribeAll() {
        let suffix = (global.argv.subscriber) ? "-" + global.argv.subscriber : "-ui";
        console.log("Subscribing to redis channels with suffix: " + suffix)
        let sub_sessionKey = "fix-svr-sessions" + suffix;
        let my_sessionKey = "ui-sessions";

        let pollers = [];

        function addTransactionPoller(sessionName) {
            let sub_transactionKey = "fix-svr-" + sessionName + suffix;
            let ui_transactionKey = "ui-transactions-" + sessionName;
            console.log("Watching for new transactions on: " + sub_transactionKey);

            let newClient = redis.createClient();
            newClient.name = "[" + sessionName + "]";
            pollers.push(newClient);

            let handleTransactions = (err, message) => {
                console.log(newClient.name + " - received message on: " + sub_transactionKey);
                global.io.emit("transaction", message);
                newClient.brpoplpush(sub_transactionKey, ui_transactionKey, 0, handleTransactions);
            };
            newClient.brpoplpush(sub_transactionKey, ui_transactionKey, 0, handleTransactions);
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

            redisSessionsPoller.hsetAsync(my_sessionKey, session.session, result[1]).then(o => {
                return redisSessionsPoller.brpop(sub_sessionKey, 0, pollForSessions);
            });
        }
        console.log("Watching for session changes on: " + sub_sessionKey);
        redisSessionsPoller.brpop(sub_sessionKey, 0, pollForSessions);

        var redisSessions = redis.createClient();
        redisSessions.hvalsAsync(my_sessionKey).then((items) => {
            let objects = _.map(items, o=> JSON.parse(o) );
            objects.forEach((session) => {
                console.log("Watching session: session.session");
                addTransactionPoller(session.session);
            }, this);
        });
    }
}

module.exports = Subscriber;