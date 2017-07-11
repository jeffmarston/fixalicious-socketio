'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ScenarioModel = require('../../models/scenario-model');
let TransactionModel = require('../../models/transaction-model');
let ErrorResource = require('../../resources/error-resource');

let bluebird = require('bluebird');
let redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
let redisClient = redis.createClient();

class SessionController {

    static getAllSessions(req, res) {
        console.log("Get all Sessions.");

        SessionModel.getAll().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Get all sessions failed.", error));
        });
    }

    static enableScenarios(req, res) {
        // let name = req.swagger.params.name.value;
        // let changes = req.swagger.params.changes.value;

        // SessionModel.enableScenarios(name, changes.enable, changes.disable).then((result) => {
        //     res.status(200).json(result);
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Enable sessions failed.", error));
        // });
    }

    static fakeIncoming(req, res) {
        let sessionName = req.swagger.params.name.value;

        for (let i = 0; i < 10; i++) {
            setTimeout(o => {
                console.log("Fake some incoming messages for " + sessionName);
                let transaction = `{"message":{"header":[{"Tag":8,"Name":"BeginString","Value":"FIX.4.2"},{"Tag":9,"Name":"BodyLength","Value":"154"},{"Tag":34,"Name":"MsgSeqNum","Value":"69"},{"Tag":35,"Name":"MsgType","Value":"D"},{"Tag":49,"Name":"SenderCompID","Value":"BAXA1"},{"Tag":50,"Name":"SenderSubID","Value":"APP"},{"Tag":52,"Name":"SendingTime","Value":"20170626-13:56:24.000"},{"Tag":56,"Name":"TargetCompID","Value":"BAXA"},{"Tag":129,"Name":"DeliverToSubID","Value":"NULL"}],"body":[{"Tag":11,"Name":"ClOrdID","Value":"2017062600E0"},{"Tag":21,"Name":"HandlInst","Value":"3"},{"Tag":38,"Name":"OrderQty","Value":"300"},{"Tag":40,"Name":"OrdType","Value":"1"},{"Tag":44,"Name":"Price","Value":"0"},{"Tag":54,"Name":"Side","Value":"1"},{"Tag":55,"Name":"Symbol","Value":"UPS"},{"Tag":59,"Name":"TimeInForce","Value":"0"},{"Tag":60,"Name":"TransactTime","Value":"20170626-13:56:24.000"},{"Tag":207,"Name":"SecurityExchange","Value":"New York"}],"trailer":[{"Tag":10,"Name":"CheckSum","Value":"185"}]},"direction":false,"session":"${sessionName}"}`;
                redisClient.rpush(`fix-svr-${sessionName}-${global.argv.subscriber}`, transaction);
            }, i * 5000);
        }

        res.status(200).json("Fake messages started");
    }
}

module.exports = {
    getAllSessions: SessionController.getAllSessions,
    fakeIncoming: SessionController.fakeIncoming,
    enableScenarios: SessionController.enableScenarios
}