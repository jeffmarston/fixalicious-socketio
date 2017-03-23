'use strict';

let _ = require('lodash');
let RatingSchema = require('../dal/rating-schema');
let DataError = require('../dal/data-error');

class RatingCodeModel {

    constructor(ratingCodes) {
        this.ratings = ratingCodes;
    }

    static getAll() {
        let schema = new RatingSchema();
        return schema.ratingSchema.findAll().then((records) => {
            return _.map(records, (record) => new RatingCodeModel(record.dataValues));
        }).catch((error) => {
            console.log("OMS.API.GATEWAY: Failed getting All Rating Codes.");
            console.log(error);
            throw new DataError(700, "Failed DB Fetch for All Rating Codes.", error);
        });
    }
}
module.exports = RatingCodeModel;