'use strict';

let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ErrorResource = require('../../resources/error-resource');

class TemplateController {

    static getAllTemplates(req, res) {
        console.log("FIXALICIOUS: Request received to get all Templates.");

        redisClient.lrangeAsync("templates", 0, 300).then((labels) => {
            let keys = _.map(labels, o => "template:" + o);

            if (keys.length == 0) {
                TemplateController.writeToRedis("Ack", { label: "Ack", pairs: TemplateController.createAck() });
                TemplateController.writeToRedis("Partial", { label: "Partial", pairs: TemplateController.createPartial() });
                TemplateController.writeToRedis("Fill", { label: "Fill", pairs: TemplateController.createFill() });
            } else {

                // Get from Redis
                redisClient.mgetAsync(keys).then(items => {
                    res.status(200).json(_.map(items, str => JSON.parse(str)));
                });
            }
        });
    }

    static writeToRedis(label, template) {
        let templateJson = JSON.stringify(template);

        redisClient.rpushAsync("templates", label).then(o => {
            redisClient.msetAsync("template:" + label, templateJson).then(p => {
                console.log("{ status: '" + p + "' }");
            });
        });
    }

    static createTemplate(req, res) {
        let label = req.swagger.params.label.value;
        let template = req.swagger.params.template.value;

        let templateJson = JSON.stringify(template);

        console.log("FIXALICIOUS: Request received to create template: " + templateJson);

        redisClient.rpushAsync("templates", label).then(o => {
            redisClient.msetAsync("template:" + label, templateJson).then(p => {
                res.status(200).json("{ status: '" + p + "' }");
            });
        });
    }

    static deleteTemplate(req, res) {
        let label = req.swagger.params.label.value;
        console.log("FIXALICIOUS: Request received to delete template: " + label);

        redisClient.delAsync("template:"+label).then(n => {
            redisClient.lremAsync("templates", 1, label).then(o => {
                res.status(200).json("{ status: '" + o + "' }");
            });
        });
    }

    static createAck() {
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        return [
            { key: "OrderID", formula: "=CliOrdId (11)" },
            { key: "ClOrdID", formula: "=CliOrdId (11)" },
            { key: "ExecID", formula: execID },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "0" },
            { key: "OrdStatus", formula: "0" },
            { key: "Symbol", formula: "=Symbol (55)" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "=OrderQty (38)" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "=OrderQty (38)" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createPartial() {
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        return [
            { key: "OrderID", formula: "=CliOrdId (11)" },
            { key: "ClOrdID", formula: "=CliOrdId (11)" },
            { key: "ExecID", formula: execID },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "1" },
            { key: "OrdStatus", formula: "1" },
            { key: "Symbol", formula: "=Symbol (55)" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "=OrderQty (38)" },
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
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        return [
            { key: "OrderID", formula: "=CliOrdId (11)" },
            { key: "ClOrdID", formula: "=CliOrdId (11)" },
            { key: "ExecID", formula: execID },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "2" },
            { key: "OrdStatus", formula: "2" },
            { key: "Symbol", formula: "=Symbol (55)" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "=OrderQty (38)" },
            { key: "OrdType", formula: "1" },
            { key: "Price", formula: "4.6" },
            { key: "TimeInForce", formula: "0" },
            { key: "LastShares", formula: "0" },
            { key: "LastPx", formula: "4.4" },
            { key: "LeavesQty", formula: "0" },
            { key: "CumQty", formula: "=OrderQty (38)" },
            { key: "AvgPx", formula: "4.5" },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: "3" }
        ];
    }
    static createReject() {
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        return [
            { key: "OrderID", formula: "=CliOrdId (11)" },
            { key: "ClOrdID", formula: "=CliOrdId (11)" },
            { key: "ExecID", formula: execID },
            { key: "ExecTransType", formula: "0" },
            { key: "ExecType", formula: "8" },
            { key: "OrdStatus", formula: "8" },
            { key: "Symbol", formula: "=Symbol (55)" },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: "1" },
            { key: "OrderQty", formula: "=OrderQty (38)" },
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