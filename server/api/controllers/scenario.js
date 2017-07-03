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
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all scenarios failed.", error));
        });
    }

    static create(req, res) {      
        let label = req.swagger.params.label.value;
        let scenario = req.swagger.params.scenario.value;
        console.log("Create scenario: "+ label);

        ScenarioModel.create(label, scenario).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create scenario failed.", error));
        });
    }

    static delete(req, res) {
        let label = req.swagger.params.label.value;
        console.log("Delete scenario: "+ label);

        ScenarioModel.delete(label).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to delete scenario failed.", error));
        });
    }
}

module.exports = {
    getAll: ScenarioController.getAll,
    create: ScenarioController.create,
    delete: ScenarioController.delete
}