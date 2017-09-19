
let _ = require('lodash');
let actionModel = require('./action-model');

class Evaluation {

    static mapToSend(array) {
        let obj = {};
        array.forEach(element => {
            if (!obj[element.key]) {
                // if element has children, recurse into them
                if (Array.isArray(element.formula)) {
                    obj[element.key] = [this.mapToSend(element.formula)];
                } else {
                    obj[element.key] = element.value;
                }
            } else {
                // element already exists, transform element into an array
                if (Array.isArray(obj[element.key])) {
                    obj[element.key].push(this.mapToSend(element.value));
                } else {
                    obj[element.key] = [obj[element.key], this.mapToSend(element.value)];
                }
            }
        });
        return obj;
    };

    // take the name of a template and return fixOut object
    static evaluateTemplate(templateName, sourceFix) {

        // returns an array indexed by FIX tag or name 
        function mapToValue(obj, mapProp) {
            let header = _.keyBy(obj.header, o => o[mapProp]);
            let body = _.keyBy(obj.body, o => o[mapProp]);
            let trailer = _.keyBy(obj.trailer, o => o[mapProp]);
            let everything = [];
            _.merge(everything, header, body, trailer);

            // return object with the property=Tag, and value=Value
            for (var property in everything) {
                everything[property] = everything[property].Value;
            }
            return everything;
        }

        function generateId(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < (length || 10); i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return possible;
        }

        function generateTimestamp(input) {
            var temp = new Date().toISOString().replace(/-/g,'').replace('T','-').replace('Z','');
            return temp;
        }

        function evaluate(field, sourceFix) {

            const regex_newId = /\$\{newId\((\d*)\)\}/g;
            const regex_newTime = /\$\{timestamp\((\d*)\)\}/g;
            const regex_tag = /\$\{tag\((\d+)\)\}/g;
            const regex_name = /\$\{name\(\"([a-zA-Z]+)\"\)\}/g;

            field.value = field.formula;
            if (Array.isArray(field.formula)) {
                field.formula.forEach(element => {
                    evaluate(element, sourceFix);
                });
            } else if (typeof field.formula == "string") {

                let tagLookup = mapToValue(sourceFix, "Tag");
                let nameLookup = mapToValue(sourceFix, "Name");

                field.value = field.formula;
                field.value = field.value.replace(regex_newId, (a, b) => generateId(b));
                field.value = field.value.replace(regex_newTime, (a, b) => generateTimestamp(b));
                field.value = field.value.replace(regex_tag, (a, b) => (tagLookup[b] || ""));
                field.value = field.value.replace(regex_name, (a, b) => (nameLookup[b] || ""));
            }
        }

        return actionModel.getById(templateName).then(action => {
            if (!action || action.type !== "template") {
                throw templateName + " is not a template.";
            }

            action.template.forEach(pair => {
                evaluate(pair, sourceFix);
            }, this);
            let targetFix = Evaluation.mapToSend(action.template);
            return targetFix;
        });
    }
}

module.exports = Evaluation