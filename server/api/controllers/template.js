'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ErrorResource = require('../../resources/error-resource');

class SessionController {

    static getAllTemplates(req, res) {
        console.log("FIXALICIOUS: Request received to get all Templates.");

        res.status(200).json([
            { id: 1, label: "Ack", pairs: SessionController.createAck() },
            { id: 2, label: "Partial", pairs: SessionController.createPartial() },
            { id: 3, label: "Fill", pairs: SessionController.createFill() },
            { id: 4, label: "Reject", pairs: SessionController.createReject() }
        ]
        );
    }

    static createAck() {
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        return [
            { key: "OrderID", formula: "=CliOrdId (11)"},
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
            { key: "OrderID", formula: "=CliOrdId (11)"},
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
            { key: "OrderID", formula: "=CliOrdId (11)"},
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
            { key: "OrderID", formula: "=CliOrdId (11)"},
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
    
        // this.fixToSend = {
        //     "OrderID": "sim-" + this.sourceFixObj["ClOrdID (11)"],
        //     "ClOrdID": this.sourceFixObj["ClOrdID (11)"],
        //     "ExecID": execID,
        //     "ExecTransType": 0,
        //     "ExecType": 8,
        //     "OrdStatus": 8,
        //     "OrdRejReason": 0,
        //     "Symbol": this.sourceFixObj["Symbol (55)"],
        //     "SecurityExchange": "NASDAQ",
        //     "Side": "1",
        //     "OrderQty": this.sourceFixObj["OrderQty (38)"],
        //     "OrdType": 1,
        //     "Price": 0,
        //     "TimeInForce": 0,
        //     "LastShares": 0,
        //     "LeavesQty": 0,
        //     "CumQty": 0,
        //     "AvgPx": 0,
        //     "TransactTime": "now",
        //     "HandlInst": 3
        // }
}

module.exports = {
    getAllTemplates: SessionController.getAllTemplates
}