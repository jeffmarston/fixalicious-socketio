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

    static run(session, scenarioId) {
        console.log("======== running ==========");
        console.log(session.session + " -> " + scenarioId);
        ScenarioModel.activeSessions = {};

        ScenarioModel.getById(scenarioId).then(scenario => {
            ScenarioModel.activeSessions[session.session] = scenario;
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

        console.log(`======== triggered on: ${sessionName} ==========`);
        console.log(fixIn);
        let scenarioToRun = (ScenarioModel.activeSessions) ? ScenarioModel.activeSessions[sessionName] : null;
        if (scenarioToRun) {
            ScenarioModel.executeCode(sessionName, scenarioToRun.code, fixIn);
        }
    }


    static executeCode(session, code, fixIn) {
        let cons = {
            log: console.log,
            error: console.error
        };

        let sandbox = {
            setInterval: setInterval,
            setTimeout: setTimeout,
            console: cons,
            send: (o) => {
                console.log("Sending from Custom Scenario: " + JSON.stringify(o));
                try {
                    return TransactionModel.create(session, o);
                } catch (err) {
                    console.error(err);
                }
            },
            fixIn: fixIn,
            fixOut: {}
        };
        try {
            let script = new vm.Script(code);
            script.runInNewContext(sandbox);
        } catch (exception) {
            console.error(exception);
        }
        // console.log(util.inspect(sandbox));
    }
}

module.exports = ScenarioModel;