'use strict';

let bluebird = require('bluebird');
let redis = require('redis');
let config = require('./../../config');
let redisClient = redis.createClient(config.redis.port, config.redis.host);
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
            { label: "Reject", type: "template", template: ActionController.createReject() },
            { label: "AmendFill", type: "template", template: ActionController.createAmendFill() },
            { label: "CancelFill", type: "template", template: ActionController.createCancelFill() }
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
    
    static run(req, res) {
        let label = req.swagger.params.label.value;
        let fixIn = req.swagger.params.fixIn.value;

        ScenarioModel.run(label, fixIn).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Run scenario failed.", error));
        });
    }

    static createAck() {
        return [
            { key: "OrderID", formula: "fix-${tag(11)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "0" },
            { key: "OrdStatus", formula: "0" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },
            { key: "LastCapacity", formula: "1" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "${tag(38)}" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createPartial() {
        return [
            { key: "OrderID", formula: "fix-${tag(11)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "1" },
            { key: "OrdStatus", formula: "1" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },
            { key: "LastCapacity", formula: "1" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "25" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "25" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createFill() {
        return [
            { key: "OrderID", formula: "fix-${tag(11)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "2" },
            { key: "OrdStatus", formula: "2" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },
            { key: "LastCapacity", formula: "1" },            
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "${tag(38)}" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createReject() {
        return [
            { key: "OrderID", formula: "fix-${tag(11)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "8" },
            { key: "OrdStatus", formula: "8" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },     
            { key: "LastCapacity", formula: "1" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "0" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "0" },
            { key: "AvgPx", formula: "0" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "3" }
        ];
    }

    static createCancelFill() {
        return [
            { key: "OrderID", formula: "${tag(37)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecRefID", formula: "${tag(17)}" },            
            { key: "ExecTransType", formula: "1" },
            { key: "ExecType", formula: "4" },
            { key: "OrdStatus", formula: "4" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "${tag(207)}" },
            { key: "Side", formula: "${tag(54)}" },            
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },     
            { key: "LastCapacity", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "${tag(40)}" },
            { key: "Price", formula: "${tag(44)}" },
            { key: "TimeInForce", formula: "${tag(59)}" },
            { key: "LastShares", formula: "${tag(32)}" },
            { key: "LastPx", formula: "${tag(31)}" },
            { key: "LeavesQty", formula: "${tag(151)}" },
            { key: "CumQty", formula: "${tag(14)}" },
            { key: "AvgPx", formula: "${tag(6)}" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "${tag(21)}" }
        ];
    }

    static createAmendFill() {
        return [
            { key: "OrderID", formula: "${tag(37)}" },
            { key: "ClOrdID", formula: "${tag(11)}" },
            { key: "ExecID", formula: "${newId()}" },
            { key: "ExecRefID", formula: "${tag(17)}" },            
            { key: "ExecTransType", formula: "2" },
            { key: "ExecType", formula: "5" },
            { key: "OrdStatus", formula: "5" },
            { key: "Symbol", formula: "${tag(55)}" },
            { key: "SecurityExchange", formula: "${tag(207)}" },
            { key: "Side", formula: "${tag(54)}" },            
            { key: "Currency", formula: "EUR" },
            { key: "LastMkt", formula: "XOFF" },     
            { key: "LastCapacity", formula: "1" },
            { key: "OrderQty", formula: "${tag(38)}" },
            { key: "OrdType", formula: "${tag(40)}" },
            { key: "Price", formula: "${tag(44)}" },
            { key: "TimeInForce", formula: "${tag(59)}" },
            { key: "LastShares", formula: "${tag(32)}" },
            { key: "LastPx", formula: "${tag(31)}" },
            { key: "LeavesQty", formula: "${tag(151)}" },
            { key: "CumQty", formula: "${tag(14)}" },
            { key: "AvgPx", formula: "${tag(6)}" },
            { key: "TransactTime", formula: "${timestamp()}" },
            { key: "HandlInst", formula: "${tag(21)}" }
        ];
    }
}

module.exports = {
    getAllActions: ActionController.getAllActions,
    createAction: ActionController.createAction,
    deleteAction: ActionController.deleteAction,
    run: ActionController.run
}