'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ErrorResource = require('../../resources/error-resource');

class SessionController {

    static getAllTemplates(req, res) {
        console.log("FIXALICIOUS: Request received to get all Templates.");

        res.status(200).json([
            {
                id: 35, label: "---", pairs: [
                    { key: "MsgType", formula: "'D'" },
                    { key: "CliOrdId", formula: "takeValue('cliOrdId')" },
                    { key: "OrigAmt", formula: "500" }]
            },
            { id: 11, label: "Ack2", pairs: SessionController.createAck() },
        ]
        );
        // SessionModel.getAll().then((result) => {
        //     res.status(200).json(result);
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        // });
    }

    static createAck() {
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();

        return [
            { key: "OrderID", formula: "sim-" + 'this.sourceFixObj["ClOrdID (11)"]' },
            { key: "ClOrdID", formula: 'this.sourceFixObj["ClOrdID (11)"]' },
            { key: "ExecID", formula: execID },
            { key: "ExecTransType", formula: 0 },
            { key: "ExecType", formula: 0 },
            { key: "OrdStatus", formula: 0 },
            { key: "Symbol", formula: 'this.sourceFixObj["Symbol (55)"]' },
            { key: "SecurityExchange", formula: "New York" },
            { key: "Side", formula: 1 },
            { key: "OrderQty", formula: 'this.sourceFixObj["OrderQty (38)"]' },
            { key: "OrdType", formula: 1 },
            { key: "Price", formula: 4.6 },
            { key: "TimeInForce", formula: 0 },
            { key: "LastShares", formula: 0 },
            { key: "LastPx", formula: 4.4 },
            { key: "LeavesQty", formula: 0 },
            { key: "CumQty", formula: 0 },
            { key: "AvgPx", formula: 4.5 },
            { key: "TransactTime", formula: "now" },
            { key: "HandlInst", formula: 3 }
        ];
    }
}

module.exports = {
    getAllTemplates: SessionController.getAllTemplates
}