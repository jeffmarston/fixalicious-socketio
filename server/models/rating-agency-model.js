'use strict';

let _ = require('lodash');
let RatingSchema = require('../dal/rating-schema');
let DataError = require('../dal/data-error');

class RatingAgencyModel {
    
    constructor(ratingAgencies) {
        this.agencies = ratingAgencies;
    }

    static getAll() {
        let schema = new RatingSchema();
        return schema.agencySchema.findAll().then((records) => {
            return _.map(records, (record) => new RatingAgencyModel(record.dataValues));
        }).catch((error) => {
            console.log("OMS.API.GATEWAY: Failed getting All Rating Agencies.");
            console.log(error);
            throw new DataError(700, "Failed DB Fetch for All Rating Agencies.", error);
        });
    }
}

module.exports = RatingAgencyModel;