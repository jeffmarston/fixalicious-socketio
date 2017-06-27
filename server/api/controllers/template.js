'use strict';

let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let _ = require('lodash');
let TemplateModel = require('../../models/template-model');
let ErrorResource = require('../../resources/error-resource');

class TemplateController {
    static getSeedActions() {
        return [
            { label: "Ack", pairs: TemplateController.createAck() },
            { label: "Partial", pairs: TemplateController.createPartial() },
            { label: "Fill", pairs: TemplateController.createFill() },
            { label: "Reject", pairs: TemplateController.createReject() }
        ];
    }

    static getAllTemplates(req, res) {
        console.log("Get all Templates.");

        TemplateModel.getAll().then((result) => {
            if (result.length === 0) {
                TemplateModel.seedInitial(TemplateController.getSeedActions()).then(seeded => {
                    res.status(200).json(seeded);
                });
            } else {
                res.status(200).json(result);
            }
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all templates failed.", error));
        });
    }

    static createTemplate(req, res) {
        let label = req.swagger.params.label.value;
        let template = req.swagger.params.template.value;

        TemplateModel.create(label, template).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create template failed.", error));
        });
    }

    static deleteTemplate(req, res) {
        let label = req.swagger.params.label.value;
        console.log("Delete template: " + label);
               
        TemplateModel.delete(label).then((result) => {
            res.status(200).json("{ message: 'Deleted " + result + " template(s)'");
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create template failed.", error));
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
    getAllTemplates: TemplateController.getAllTemplates,
    createTemplate: TemplateController.createTemplate,
    deleteTemplate: TemplateController.deleteTemplate
}