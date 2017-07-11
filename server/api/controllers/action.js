'use strict';

let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let _ = require('lodash');
let ActionModel = require('../../models/action-model');
let ScenarioModel = require('../../models/scenario-model');
let ErrorResource = require('../../resources/error-resource');

class ActionController {
    static getSeedActions() {
        return [
            { label: "Ack", type: "template", template: ActionController.createAck() },
            { label: "Partial", type: "template", template: ActionController.createPartial() },
            { label: "Fill", type: "template", template: ActionController.createFill() },
            { label: "Reject", type: "template", template: ActionController.createReject() }
        ];
    }

    static getAllActions(req, res) {
        console.log("Get all Actions.");

        ActionModel.getAll().then((result) => {
            if (result.length === 0) {
                ActionModel.seedInitial(ActionController.getSeedActions()).then(seeded => {
                    res.status(200).json(seeded);
                });
            } else {
                res.status(200).json(result);
            }
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Get all actions failed.", error));
        });
    }

    static createAction(req, res) {
        let label = req.swagger.params.label.value;
        let action = req.swagger.params.action.value;

        if (action.type=="scenario") {
            ScenarioModel.enable(label, action.enabledSessions);
        } 

        ActionModel.save(label, action).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Create action failed.", error));
        });
    }

    static deleteAction(req, res) {
        let label = req.swagger.params.label.value;
        console.log("Delete action: " + label);
               
        ActionModel.delete(label).then((result) => {
            res.status(200).json("{ message: 'Deleted " + result + " action(s)'");
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Delete action failed.", error));
        });
    }

    static createAck() {
        return [
            { key: "OrderID", formula: "fix-{{11}}" },
            { key: "ClOrdID", formula: "{{11}}" },
            { key: "ExecID", formula: "{{newid}}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "0" },
            { key: "OrdStatus", formula: "0" },
            { key: "Symbol", formula: "{{55}}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "{{38}}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "{{38}}" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createPartial() {
        return [
            { key: "OrderID", formula: "fix-{{11}}" },
            { key: "ClOrdID", formula: "{{11}}" },
            { key: "ExecID", formula: "{{newid}}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "1" },
            { key: "OrdStatus", formula: "1" },
            { key: "Symbol", formula: "{{55}}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "{{38}}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "25" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "25" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createFill() {
        return [
            { key: "OrderID", formula: "fix-{{11}}" },
            { key: "ClOrdID", formula: "{{11}}" },
            { key: "ExecID", formula: "{{newid}}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "2" },
            { key: "OrdStatus", formula: "2" },
            { key: "Symbol", formula: "{{55}}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "{{38}}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "{{38}}" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createReject() {
        return [
            { key: "OrderID", formula: "fix-{{11}}" },
            { key: "ClOrdID", formula: "{{11}}" },
            { key: "ExecID", formula: "{{newid}}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "8" },
            { key: "OrdStatus", formula: "8" },
            { key: "Symbol", formula: "{{55}}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "{{38}}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "0" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "0" },
            { key: "AvgPx", formula: "0" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
}

module.exports = {
    getAllActions: ActionController.getAllActions,
    createAction: ActionController.createAction,
    deleteAction: ActionController.deleteAction
}