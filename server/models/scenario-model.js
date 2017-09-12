'use strict';

let _ = require('lodash');
let util = require('util');
let vm = require('vm');
let bluebird = require('bluebird');
let redis = require('redis');
let config = require('../config');
let redisClient = redis.createClient(config.redis.port, config.redis.host);
bluebird.promisifyAll(redis.RedisClient.prototype);

let TransactionModel = require("./transaction-model");
let ActionModel = require("./action-model");
let evaluation = require('./evaluation');

class ScenarioModel {

    static run(scenarioName, transaction) {
        let sessionName = transaction.session;
        let channel = `scenario-output[${sessionName}]`;
        global.io.emit(channel, { scenario: sessionName, log: " ! Running scenario: " + scenarioName });

        let fixIn = {
            header: _.keyBy(transaction.message.header, "Name"),
            body: _.keyBy(transaction.message.body, "Name"),
            trailer: _.keyBy(transaction.message.trailer, "Name")
        };

        console.log(`======== run : ${scenarioName} ==========`);
        return ActionModel.getById(scenarioName).then(scenario => {
            if (scenario.code) {
                ScenarioModel.executeCode(sessionName, scenario, fixIn);
            } else {
                console.error(scenario.label + " has no code to run.");
            }
        });
    }

    static trigger(sessionName, transaction) {
        // ignore outbound messages
        if (transaction.direction) { return; }
        // ignore heartbeats
        let msgType = _.find(transaction.message.header, o => (o.Tag == 35));
        if (msgType && msgType.Value == "0") { return; }

        let fixIn = {
            header: _.keyBy(transaction.message.header, "Name"),
            body: _.keyBy(transaction.message.body, "Name"),
            trailer: _.keyBy(transaction.message.trailer, "Name")
        };

        ActionModel.getEnabledScenarios(sessionName).then(scenariosToRun => {
            if (scenariosToRun) {
                scenariosToRun.forEach(scenarioToRun => {
                    console.log(`[scenario] ${scenarioToRun.label} triggered on: ${sessionName}`);
                    ScenarioModel.executeCode(sessionName, scenarioToRun, fixIn);
                }, this);
            }
        });
    }


    static executeCode(sessionName, scenario, fixIn) {
        let channel = `scenario-output[${sessionName}]`;
        let cons = {
            log: (txt) => {
                if (typeof(txt)=="object") {
                    txt = JSON.stringify(txt, null, 2);
                }
                global.io.emit(channel, { scenario: scenario.label, log: txt });
            },
            error: (txt) => {
                if (typeof(txt)=="object") {
                    txt = JSON.stringify(txt, null, 2);
                }
                global.io.emit(channel, { scenario: scenario.label, error: txt });
            },
        };

        let sandbox = {
            //setInterval: setInterval,
            setTimeout: setTimeout,
            JSON: JSON,
            evaluate: evaluation.evaluateTemplate,
            console: cons,
            send: (o) => {
                try {
                    return TransactionModel.create(sessionName, o);
                } catch (err) {
                    console.error(err);
                    global.io.emit(channel, { scenario: scenario.label, error: err.message + "\n" + err.stack });
                }
                return null;
            },
            fixIn: fixIn,
            fixOut: {}
        };
        try {
            let script = new vm.Script(scenario.code);
            script.runInNewContext(sandbox);
        } catch (err) {
            console.error(err);
            global.io.emit(channel, { scenario: scenario.label, error: err.message + "\n" + err.stack });
        }
        // console.log(util.inspect(sandbox));
    }
}

module.exports = ScenarioModel;