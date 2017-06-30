'use strict';

let _ = require('lodash');
let ScenarioModel = require('../../models/scenario-model');
let ErrorResource = require('../../resources/error-resource');

class ScenarioController {

    static getAll(req, res) {
        console.log("Request received to get all Scenarios.");
        
        ScenarioModel.getAll().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }

    static create(req, res) {        
        let session = req.swagger.params.session.value;
        let code = req.swagger.params.code.value;
        ScenarioModel.create(session, code).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }

    static delete(req, res) {
        let session = req.swagger.params.session.value;
        ScenarioModel.delete(session).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }
}

module.exports = {
    getAll: ScenarioController.getAll,
    create: ScenarioController.create,
    delete: ScenarioController.delete
}