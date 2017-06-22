'use strict';

let _ = require('lodash');
let TransactionModel = require('../../models/transaction-model');
let ErrorResource = require('../../resources/error-resource');
let PostResponse = require('../../resources/post-response-resource');

class TransactionController {

    static getAllTransactions(req, res) {
        let sessionName = req.swagger.params.session.value;
        console.log("FIXALICIOUS: Request received to get all transactions for session: " + sessionName);

        res.status(200).json([{
            direction: "north",
            session: sessionName,
            msg: `
   CliOrdId (11): 000010
   Symbol (55): DELL`
        }, {
            direction: "south",
            session: sessionName,
            msg: `
   CliOrdId (11): 123456
   Symbol (55): IBM`
        },
        {
            direction: "east",
            session: sessionName,
            msg: `
   CliOrdId (11): 81878
   Symbol (55): UPS
   OrderQty (38): 300
   `
        }]);


        // TransactionModel.getAll(sessionName).then((result) => {
        //     res.status(200).json(result);
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Request to get all transactions failed.", error));
        // });
    }


    static createTransaction(req, res) {
        let sessionName = req.swagger.params.session.value;
        let transaction = req.swagger.params.transaction.value;
        console.log("FIXALICIOUS: Request received to create transaction: " + sessionName);

        TransactionModel.create(sessionName, transaction).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create transaction failed.", error));
        });
    }

    static deleteTransaction(req, res) {
        let sessionName = req.swagger.params.session.value;
        console.log("FIXALICIOUS: Request received to delete transaction: " + sessionName);

        TransactionModel.delete(sessionName).then((result) => {
            if (result > 0) {
                res.status(200).json(result);
            } else {
                res.status(404).json(new ErrorResource(404, req.url, "Request to delete transaction failed.", ""));
            }
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to delete transaction failed.", error));
        });
    }
}

module.exports = {
    getAllTransactions: TransactionController.getAllTransactions,
    createTransaction: TransactionController.createTransaction,
    deleteTransaction: TransactionController.deleteTransaction
} 