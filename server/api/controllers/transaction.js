'use strict';

let _ = require('lodash');
let TransactionModel = require('../../models/transaction-model');
let ErrorResource = require('../../resources/error-resource');
let PostResponse = require('../../resources/post-response-resource');

let dummy=`[
    {"message":{"header":[{"Tag":8,"Name":"BeginString","Value":"FIX.4.2"},{"Tag":9,"Name":"BodyLength","Value":"154"},{"Tag":34,"Name":"MsgSeqNum","Value":"69"},{"Tag":35,"Name":"MsgType","Value":"D"},{"Tag":49,"Name":"SenderCompID","Value":"BAXA1"},{"Tag":50,"Name":"SenderSubID","Value":"APP"},{"Tag":52,"Name":"SendingTime","Value":"20170626-13:56:24.000"},{"Tag":56,"Name":"TargetCompID","Value":"BAXA"},{"Tag":129,"Name":"DeliverToSubID","Value":"NULL"}],"body":[{"Tag":11,"Name":"ClOrdID","Value":"2017062600E0"},{"Tag":21,"Name":"HandlInst","Value":"3"},{"Tag":38,"Name":"OrderQty","Value":"300"},{"Tag":40,"Name":"OrdType","Value":"1"},{"Tag":44,"Name":"Price","Value":"0"},{"Tag":54,"Name":"Side","Value":"1"},{"Tag":55,"Name":"Symbol","Value":"UPS"},{"Tag":59,"Name":"TimeInForce","Value":"0"},{"Tag":60,"Name":"TransactTime","Value":"20170626-13:56:24.000"},{"Tag":207,"Name":"SecurityExchange","Value":"New York"}],"trailer":[{"Tag":10,"Name":"CheckSum","Value":"185"}]},"direction":false,"session":"BAXA"},
    {"message":{"header":[{"Tag":8,"Name":"BeginString","Value":"FIX.4.2"},{"Tag":9,"Name":"BodyLength","Value":"0"},{"Tag":35,"Name":"MsgType","Value":"0"}],"body":[],"trailer":[{"Tag":10,"Name":"CheckSum","Value":""}]},"direction":true,"session":"BAXA"},
    {"message":{"header":[{"Tag":8,"Name":"BeginString","Value":"FIX.4.2"},{"Tag":9,"Name":"BodyLength","Value":"49"},{"Tag":34,"Name":"MsgSeqNum","Value":"68"},{"Tag":35,"Name":"MsgType","Value":"0"},{"Tag":49,"Name":"SenderCompID","Value":"BAXA1"},{"Tag":52,"Name":"SendingTime","Value":"20170626-13:56:09.000"},{"Tag":56,"Name":"TargetCompID","Value":"BAXA"}],"body":[],"trailer":[{"Tag":10,"Name":"CheckSum","Value":"031"}]},"direction":false,"session":"BAXA"}]`;

class TransactionController {

    static getAllTransactions(req, res) {
        let sessionName = req.swagger.params.session.value;
        console.log("Request received to get all transactions for session: " + sessionName);

//         res.status(200).json(JSON.parse(dummy));

        TransactionModel.getAll(sessionName).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all transactions failed.", error));
        });
    }


    static createTransaction(req, res) {
        let sessionName = req.swagger.params.session.value;
        let transaction = req.swagger.params.transaction.value;
        console.log("Request received to create transaction: " + sessionName);

        TransactionModel.create(sessionName, transaction).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create transaction failed.", error));
        });
    }

    static deleteTransaction(req, res) {
        let sessionName = req.swagger.params.session.value;
        console.log("Request received to delete transaction: " + sessionName);

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