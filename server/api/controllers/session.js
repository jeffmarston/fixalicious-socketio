'use strict';

let _ = require('lodash');
let SessionModel = require('../../models/session-model');
let ErrorResource = require('../../resources/error-resource');
let RatingAgencyResource = require('../../resources/rating-agency-resource');

class SessionController {

    static getAllSessions(req, res) {
        console.log("OMS.API.GATEWAY: Request received to get all Rating Agencies.");

        res.status(200).json(SessionModel.getAll());

        // SessionModel.getAll().then((session) => {
        //     res.status(200).json(_.map(session, (agencyModel) => new RatingAgencyResource(agencyModel)));
        // }).catch((error) => {
        //     res.status(500).json(new ErrorResource(500, req.url, "Request to get all Rating Agencies failed.", error));
        // });

        //res.status(200).json("{ 'status':'not bad' } ");
    }
}

module.exports = {
    getAllSessions: SessionController.getAllSessions
}