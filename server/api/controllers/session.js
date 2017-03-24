'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ErrorResource = require('../../resources/error-resource');

class SessionController {

    static getAllSessions(req, res) {
        console.log("FIXALICIOUS: Request received to get all Sessions.");

        SessionModel.getAll().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all sessions failed.", error));
        });
    }

    static postSession(req, res) {
        let sessionName = req.swagger.params.name.value;       
        console.log("FIXALICIOUS: Request received to create Session: " + sessionName);

        SessionModel.create(sessionName).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to create session failed.", error));
        });
    }

    static deleteSession(req, res) {
        let sessionName = req.swagger.params.name.value;     
        console.log("FIXALICIOUS: Request received to delete Session: " + sessionName);  
        
        SessionModel.delete(sessionName).then((result) => {
            if (result > 0) {
                res.status(200).json(result);
            } else {
                res.status(404).json(new ErrorResource(404, req.url, "Request to delete session failed.", ""));
            }
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to delete session failed.", error));
        });
    }
}

module.exports = {
    getAllSessions: SessionController.getAllSessions,
    postSession: SessionController.postSession,
    deleteSession: SessionController.deleteSession
}