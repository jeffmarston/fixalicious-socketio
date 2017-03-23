'use strict';

let _ = require('lodash');
let RatingModel = require('../../models/rating-model');
let RatingResource = require('../../resources/rating-resource');
let ErrorResource = require('../../resources/error-resource');
let PostResponse = require('../../resources/post-response-resource');

class RatingController {

    static getAllTransactions(req, res) {
        console.log("OMS.API.GATEWAY: Request received to get all Rating Agencies and Rating Codes.");

        RatingModel.getAll().then((ratingModels) => {
            res.status(200).json(_.map(ratingModels, (ratingModel) => new RatingResource(ratingModel)));
        }).catch((error) => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to get all agencies and codes failed.", error));
        });
    }

    static createTransaction(req, res) {
        let ratingAgencyName = req.swagger.params.agency.value;
        let ratings = req.swagger.params.ratingCodes.value;
        let numberOfChangesRequested = ratings.length;
        
        console.log("OMS.API.GATEWAY: Request received to Save Rating Agency Changes for [ " + ratingAgencyName + " ]");
        RatingModel.saveRatingAgencyChanges(ratingAgencyName, ratings).then((numberOfAgencyChanges) => {
            res.status(201).json(new PostResponse(req.url, numberOfChangesRequested, null, numberOfAgencyChanges));
        }).catch((error => {
            res.status(500).json(new ErrorResource(500, req.url, "Request to save rating agencies failed.", error));
        }));
    }

    static deleteTransaction(req, res) {
        let sessionName = req.swagger.params.session.value;
        
        console.log("FIXALICIOUS: Request received to Delete all Transactions for [ " + sessionName + " ]");
    }
}

module.exports = {
    getAllTransactions: RatingController.getAllTransactions,
    createTransaction: RatingController.createTransaction,
    deleteTransaction: RatingController.deleteTransaction
} 