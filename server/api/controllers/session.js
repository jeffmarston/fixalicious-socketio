'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ScenarioModel = require('../../models/scenario-model');
let TransactionModel = require('../../models/transaction-model');
let ErrorResource = require('../../resources/error-resource');
const util = require('util');
const vm = require('vm');
const { spawn } = require('child_process');

class SessionController {

    static getAllSessions(req, res) {
        console.log("Request received to get all Sessions.");

        SessionModel.getAll().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }

    static executeCode1(session, code, fix) {
        let cons = {
            log: console.log,
            error: console.error
        };

        let sandbox = {
            setInterval: setInterval,
            setTimeout: setTimeout,
            console: cons,
            send: (o) => {
                console.log("This is what we do: " + JSON.stringify(o));
                return TransactionModel.create(session, o);
            },
            incomingFix: fix,
            outgoingFix: ""
        };
        let script = new vm.Script(code);
        //let context = new vm.createContext(sandbox);
        //script.runInContext(context);

        console.log("-- run this: " + code);
        script.runInNewContext(sandbox);

        // console.log(util.inspect(sandbox));
    }

    static enableScenarios(req, res) {
        let name = req.swagger.params.name.value;
        let changes = req.swagger.params.changes.value;
        let msg = "Edit session: " + name;
        msg += "\n - Enable  : " + changes.enable.join();
        msg += "\n - Disable : " + changes.disable.join();
        console.log(msg);

        SessionModel.enableScenarios(name, changes.enable, changes.disable).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }

    static postSession(req, res) {
        let sessionName = req.swagger.params.name.value;

        setInterval(o => {
            let transaction = `{"message":{"header":[{"Tag":8,"Name":"BeginString","Value":"FIX.4.2"},{"Tag":9,"Name":"BodyLength","Value":"154"},{"Tag":34,"Name":"MsgSeqNum","Value":"69"},{"Tag":35,"Name":"MsgType","Value":"D"},{"Tag":49,"Name":"SenderCompID","Value":"BAXA1"},{"Tag":50,"Name":"SenderSubID","Value":"APP"},{"Tag":52,"Name":"SendingTime","Value":"20170626-13:56:24.000"},{"Tag":56,"Name":"TargetCompID","Value":"BAXA"},{"Tag":129,"Name":"DeliverToSubID","Value":"NULL"}],"body":[{"Tag":11,"Name":"ClOrdID","Value":"2017062600E0"},{"Tag":21,"Name":"HandlInst","Value":"3"},{"Tag":38,"Name":"OrderQty","Value":"300"},{"Tag":40,"Name":"OrdType","Value":"1"},{"Tag":44,"Name":"Price","Value":"0"},{"Tag":54,"Name":"Side","Value":"1"},{"Tag":55,"Name":"Symbol","Value":"UPS"},{"Tag":59,"Name":"TimeInForce","Value":"0"},{"Tag":60,"Name":"TransactTime","Value":"20170626-13:56:24.000"},{"Tag":207,"Name":"SecurityExchange","Value":"New York"}],"trailer":[{"Tag":10,"Name":"CheckSum","Value":"185"}]},"direction":false,"session":"BAXA"}`;
            global.io.emit("transaction", transaction);
            ScenarioModel.getById(sessionName).then(code => {

                SessionController.executeCode1(sessionName, code, transaction);



            });



        }, 3000);

        console.log("Request received to create Session: " + sessionName);
        res.status(400).json("Not supported");

        // SessionModel.create(sessionName).then((result) => {
        //     res.status(200).json(result);
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Request to create session failed.", error));
        // });
    }

    static deleteSession(req, res) {
        let sessionName = req.swagger.params.name.value;
        console.log("Request received to delete Session: " + sessionName);
        res.status(400).json("Not supported");

        // SessionModel.delete(sessionName).then((result) => {
        //     if (result > 0) {
        //         res.status(200).json(result);
        //     } else {
        //         res.status(404).json(new ErrorResource(404, req.url, "Request to delete session failed.", ""));
        //     }
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Request to delete session failed.", error));
        // });
    }
}

module.exports = {
    getAllSessions: SessionController.getAllSessions,
    postSession: SessionController.postSession,
    deleteSession: SessionController.deleteSession,
    enableScenarios: SessionController.enableScenarios
}