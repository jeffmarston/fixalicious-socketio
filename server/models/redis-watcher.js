'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let scenarioModel = require("./scenario-model");
let sessionModel = require("./session-model");
bluebird.promisifyAll(redis.RedisClient.prototype);
let config = require('../config');
var redisSessionsPoller = redis.createClient(config.redis.port, config.redis.host);
var msg_count = 0;

class Subscriber {

    static subscribeAll() {
        let suffix = (config.subscriber) ? "-" + config.subscriber : "-ui";
        console.log("Subscribing to redis channels with suffix: " + suffix)
        let sub_sessionKey = "fix-svr-sessions" + suffix;
        let my_sessionKey = "ui-sessions";

        let pollers = [];

        // * 
        // * Create a new poller for transactions (recursive, kind of)
        // *
        function addTransactionPoller(sessionName) {
            let sub_transactionKey = "fix-svr-" + sessionName + suffix;
            let ui_transactionKey = "ui-transactions-" + sessionName;
            console.log("Watching for new transactions on: " + sub_transactionKey);

            let newClient = redis.createClient(config.redis.port, config.redis.host);
            newClient.name = "[" + sessionName + "]";
            pollers.push(newClient);

            // * Function to run when a new transaction is found 
            let handleTransactions = (err, message) => {
                console.log(newClient.name + " - received message on: " + sub_transactionKey);

                //notify consumers
                global.io.emit("transaction", message);

                // if there is an active scenario for this session, trigger it
                scenarioModel.trigger(sessionName, JSON.parse(message));

                // go look for the next message
                newClient.brpoplpush(sub_transactionKey, ui_transactionKey, 0, handleTransactions);
            }; newClient.brpoplpush(sub_transactionKey, ui_transactionKey, 0, handleTransactions);
        }


        // * 
        // * Create a new poller for session changes (recursive, kind of)
        // *
        var redisSessions = redis.createClient(config.redis.port, config.redis.host);
        redisSessions.hvalsAsync(my_sessionKey).then((items) => {
            let sessionArray = _.map(items, o => JSON.parse(o));
            sessionArray.forEach((session) => {
                if (session.status == "up") {
                    addTransactionPoller(session.session);
                    sessionModel.enableScenarios(session.session, session.scenarios);
                } else {
                    //removeTransactionPoller(session.session);
                }

            }, this);
        });



        function pollForSessions(err, result) {
            console.log("Session update received: " + result[1]);
            let session = JSON.parse(result[1]);
            global.io.emit('session', session);
            if (session.status == "up") {
                addTransactionPoller(session.session);
                sessionModel.enableScenarios(session.session);
            } else {
                //removeTransactionPoller(session.session);
            }

            redisSessionsPoller.hsetAsync(my_sessionKey, session.session, result[1]).then(o => {
                return redisSessionsPoller.brpop(sub_sessionKey, 0, pollForSessions);
            });
        }
        console.log("Watching for session changes on: " + sub_sessionKey);
        redisSessionsPoller.brpop(sub_sessionKey, 0, pollForSessions);
    }
}

module.exports = Subscriber;