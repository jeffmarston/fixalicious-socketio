'use strict';

let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

let _ = require('lodash');
let SessionModel = require('../../models/template-model');
let ErrorResource = require('../../resources/error-resource');

class TemplateController {

    static getAllTemplates(req, res) {
        console.log("Get all Templates.");

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
        redisClient.lrangeAsync("templates", 0, 300).then((labels) => {
            if (labels.indexOf(label) > -1) {
                // update
                console.log("Update existing template: " + label);
                redisClient.msetAsync("template:" + label, templateJson).then(p => {
                    res.status(200).json("{ status: '" + p + "' }");
                });
            } else {
                // create
                console.log("Create new template: " + label);
                redisClient.rpushAsync("templates", label).then(o => {
                    redisClient.msetAsync("template:" + label, templateJson).then(p => {
                        res.status(200).json("{ status: '" + p + "' }");
                    });
                });
            }
        });
    }

    static deleteTemplate(req, res) {
        let label = req.swagger.params.label.value;
        console.log("Delete template: " + label);
        redisClient.delAsync("template:" + label).then(n => {
            redisClient.lremAsync("templates", 100, label).then(o => {
                console.log("Deleted " + o + " template(s)");
                res.status(200).json("{ message: 'Deleted " + o + " template(s)'");
            });
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