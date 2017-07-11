'use strict';

let _ = require('lodash');
let util = require('util');
let vm = require('vm');
let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let TransactionModel = require("./transaction-model");
let ActionModel = require("./action-model");

class ScenarioModel {

    static getAll() {
        // return redisClient.hvalsAsync('ui-scenarios').then((items) => {
        //     let result = _.map(items, item => {
        //         return JSON.parse(item);
        //     });
        //     return result.sort((a, b) => { return a.label > b.label });
        // });
    }

    static getById(label) {
        // return redisClient.hgetAsync('ui-scenarios', label).then((item) => {
        //     return JSON.parse(item);
        // });
    }

    static create(label, scenario) {
        // return redisClient.hsetAsync('ui-scenarios', label, JSON.stringify(scenario));
    }

    static delete(label) {
        // return redisClient.hdelAsync('ui-scenarios', 1, label);
    }

    static refreshAll() {
        // if (ScenarioModel.activeSessions) {
        //     for (let session in ScenarioModel.activeSessions) {
        //         let scenario = ScenarioModel.activeSessions[session];
        //         ScenarioModel.getById(scenario.label).then(scenario => {
        //             ScenarioModel.activeSessions[session] = scenario;
        //         });
        //     }
        // }
    }

    static refreshScenario() {
        // get from DB and set a collection
    }

    static enable(scenarioId, sessions) {
        console.log(`Enabled scenario [${scenarioId}] on sessions: [${sessions.join()}]`);
        //sessions.forEach(session => {
        // ScenarioModel.activeSessions = ScenarioModel.activeSessions || {};
        // ActionModel.getById(scenarioId).then(scenario => {

        //     ScenarioModel.activeSessions[session] = ScenarioModel.activeSessions[session] || [];
        //     ScenarioModel.activeSessions[session].push(scenario);
        // });
        //}, this);
    }

    static disable(scenarioId, sessions) {
        console.log(`Enabled scenario [${scenarioId}] on sessions: [${sessions.join()}]`);
        // sessions.forEach(session => {
        //     if (ScenarioModel.activeSessions) {
        //         delete ScenarioModel.activeSessions[session];
        //     }
        // }, this);
    }

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
                // console.log(scenariosToRun);
                scenariosToRun.forEach(scenarioToRun => {
                    console.log(`==> ${scenarioToRun.label} triggered on: ${sessionName}`);
                    ScenarioModel.executeCode(sessionName, scenarioToRun, fixIn);
                }, this);
            }
        });
    }


    static executeCode(sessionName, scenario, fixIn) {
        let channel = `scenario-output[${sessionName}]`;
        let cons = {
            log: (txt) => {
                global.io.emit(channel, { scenario: scenario.label, log: txt });
            },
            error: (txt) => {
                global.io.emit(channel, { scenario: scenario.label, error: txt });
            },
        };

        let sandbox = {
            setInterval: setInterval,
            setTimeout: setTimeout,
            JSON: JSON,
            console: cons,
            send: (o) => {
                try {
                    return TransactionModel.create(sessionName, o);
                } catch (err) {
                    console.error(err);
                    global.io.emit(channel, { scenario: scenario.label, error: err.message + "\n" + err.stack });
                }
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