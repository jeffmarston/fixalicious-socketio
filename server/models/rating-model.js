'use strict';

let _ = require('lodash');
let RatingSchema = require('../dal/rating-schema');
let DataError = require('../dal/data-error');

class RatingModel {

    constructor(ratingsInfo) {
        this.ratings = ratingsInfo;
    }

    static getAll() {
        let schema = new RatingSchema();
        return schema.agencySchema.findAll({
            include: [{ model: schema.ratingSchema, as: 'ratings' }]
        }).then((records) => {
            return _.map(records, (record) => new RatingModel(record.dataValues));
        }).catch((error) => {
            console.log("OMS.API.GATEWAY: Failed Getting All Rating Agencies and Codes.");
            console.log(error);
            throw new DataError(700, "Failed DB Fetch for All Agencies and Codes.", error);
        });
    }

    static saveRatingAgencyChanges(ratingAgencyName, ratings) {
        let schema = new RatingSchema();
        return schema.ratingSchema.saveAll(ratingAgencyName, ratings).catch((error) => {
            console.log("OMS.API.GATEWAY: Failed Updating Ratings for " + ratingAgencyName);
            console.log(error);
            throw new DataError(800, "Database Transaction Rollback for " + ratingAgencyName, error);
        });
    }
}
module.exports = RatingModel;