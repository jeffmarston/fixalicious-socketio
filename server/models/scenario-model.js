'use strict';

let _ = require('lodash');
let util = require('util');
let vm = require('vm');
let bluebird = require('bluebird');
let redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let TransactionModel = require("./transaction-model");

class ScenarioModel {

    static getAll() {
        return client.hvalsAsync('ui-scenarios').then((items) => {
            let result = _.map(items, item => {
                return JSON.parse(item);
            });
            return result.sort((a, b) => { return a.label > b.label });
        });
    }

    static getById(label) {
        return client.hgetAsync('ui-scenarios', label).then((item) => {
            return JSON.parse(item);
        });
    }

    static create(label, scenario) {
        return client.hsetAsync('ui-scenarios', label, JSON.stringify(scenario));
    }

    static delete(label) {
        return client.hdelAsync('ui-scenarios', 1, label);
    }

    static refreshAll() {
        if (ScenarioModel.activeSessions) {
            for(let session in ScenarioModel.activeSessions) {
                let scenario = ScenarioModel.activeSessions[session];
                ScenarioModel.getById(scenario.label).then(scenario => {
                    ScenarioModel.activeSessions[session] = scenario;
                });
            }
        }
    }

    static refreshScenario() {
        // get from DB and set a collection
    }

    static enable(session, scenarioId) {
        console.log(`Starting scenario: ${scenarioId} on session: ${session.session}`);
        ScenarioModel.activeSessions = ScenarioModel.activeSessions || {};
        ScenarioModel.getById(scenarioId).then(scenario => {
            ScenarioModel.activeSessions[session.session] = scenario;
        });
    }

    static disable(session, scenarioId) {
        console.log(`Stopping scenario: ${scenarioId} on session: ${session.session}`);
        if (ScenarioModel.activeSessions) {
            delete ScenarioModel.activeSessions[session.session];
        }
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

        console.log(`======== triggered on: ${sessionName} ==========`);
        let scenarioToRun = (ScenarioModel.activeSessions) ? ScenarioModel.activeSessions[sessionName] : null;
        if (scenarioToRun) {
            ScenarioModel.executeCode(sessionName, scenarioToRun, fixIn);
        }
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