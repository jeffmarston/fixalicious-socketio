'use strict';

let _ = require('lodash');
let ScenarioModel = require('../../models/scenario-model');
let ErrorResource = require('../../resources/error-resource');

class ScenarioController {

    static getAll(req, res) {
        console.log("Get all Scenarios");

        ScenarioModel.getAll().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Get all scenarios failed.", error));
        });
    }

    static create(req, res) {
        let label = req.swagger.params.label.value;
        let scenario = req.swagger.params.scenario.value;
        console.log("Create scenario: " + label);

        ScenarioModel.create(label, scenario).then((res) => {
            ScenarioModel.refreshAll();
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Create scenario failed.", error));
        });
    }

    static run(req, res) {
        let label = req.swagger.params.label.value;
        let fixIn = req.swagger.params.fixIn.value;

        ScenarioModel.run(label, fixIn).then((res) => {
            //ScenarioModel.refreshAll();
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Run scenario failed.", error));
        });
    }

    static delete(req, res) {
        let label = req.swagger.params.label.value;
        console.log("Delete scenario: " + label);

        ScenarioModel.delete(label).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Delete scenario failed.", error));
        });
    }
}

module.exports = {
    getAll: ScenarioController.getAll,
    create: ScenarioController.create,
    delete: ScenarioController.delete,
    run: ScenarioController.run
}