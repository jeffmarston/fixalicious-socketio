'use strict';

let _ = require('lodash');
let fs = require('fs')
let xml2js = require('xml2js');
let ErrorResource = require('../../resources/error-resource');
let requiredFields = [];

let fix42xml = fs.readFileSync("./schema/fix42.xml", "utf8");

xml2js.parseString(fix42xml, function (err, result) {
    let headerFields = result.fix.header[0].field;
    headerFields.forEach(function (field) {
        if (field.$.required === "Y") {
            requiredFields.push({ name: field.$.name});
        }
    }, this);
});

class FixFieldController {

    static getAllFields(req, res) {
        console.log("FIXALICIOUS: Request received to get all Sessions.");

        res.status(200).json(requiredFields);
        
    }
}

module.exports = {
    getAllFields: FixFieldController.getAllFields
}