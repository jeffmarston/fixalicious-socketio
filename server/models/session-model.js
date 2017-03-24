'use strict';

let _ = require('lodash');
let RatingSchema = require('../dal/rating-schema');
let DataError = require('../dal/data-error');
var client = require('redis').createClient();

class RatingAgencyModel {
    
    constructor(ratingAgencies) {
    }

    static getAll() {

        client.on("connect", function () {
            console.log("===================--=============-===========");
            client.set("foo", "some fantastic value", redis.print);
            client.get("foo", redis.print);
        });

        let values = client.lrange("testlist", 0, 5);
        console.log(values);
        return values;

        //return [
        //    { name: "BAX" },
        //    { name: "BAXA" }
        //];


        // let schema = new RatingSchema();
        // return schema.agencySchema.findAll().then((records) => {
        //     return _.map(records, (record) => new RatingAgencyModel(record.dataValues));
        // }).catch((error) => {
        //     console.log("OMS.API.GATEWAY: Failed getting All Rating Agencies.");
        //     console.log(error);
        //     throw new DataError(700, "Failed DB Fetch for All Rating Agencies.", error);
        // });
    }
}

module.exports = RatingAgencyModel;