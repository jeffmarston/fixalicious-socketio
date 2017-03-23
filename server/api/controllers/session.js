'use strict';

let _ = require('lodash');
let RatingAgencyModel = require('../../models/rating-agency-model');
let ErrorResource = require('../../resources/error-resource');
let RatingAgencyResource = require('../../resources/rating-agency-resource');

class SessionController {

    static getAllSessions(req, res) {
        console.log("OMS.API.GATEWAY: Request received to get all Rating Agencies.");

        RatingAgencyModel.getAll().then((ratingAgencyModels) => {
            res.status(200).json(_.map(ratingAgencyModels, (agencyModel) => new RatingAgencyResource(agencyModel)));
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all Rating Agencies failed.", error));
        });
    }
}

module.exports = {
    getAllSessions: RatingAgencyController.getAllSessions
}