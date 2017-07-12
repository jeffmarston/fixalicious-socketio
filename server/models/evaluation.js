
let _ = require('lodash');
let actionModel = require('./action-model');

class Evaluation {

    // take the name of a template and return fixOut object
    static evaluateTemplate(templateName, sourceFix) {

        // returns an array indexed by FIX tag 
        function mapIdToValue(obj) {
            let header = _.keyBy(obj.header, o => o.Tag);
            let body = _.keyBy(obj.body, o => o.Tag);
            let trailer = _.keyBy(obj.trailer, o => o.Tag);
            let everything = [];
            _.merge(everything, header, body, trailer);

            // return object with the property=Tag, and value=Value
            for (var property in everything) {
                everything[property] = everything[property].Value;
            }
            return everything;
        }

        function generateId() {
            return (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        }

        function evaluate(field, sourceFix) {
            field.value = field.formula;
            if (Array.isArray(field.formula)) {
                field.formula.forEach(element => {
                    evaluate(element, sourceFix);
                    //element.value = resolved;
                });
            } else if (typeof field.formula == "string") {
                field.value = field.formula.replace("{{newid}}", generateId());

                let lookupMatches = field.formula.match(/\{\{\d+\}\}/g);  // matches {{num}} pattern
                if (lookupMatches) {
                    let lookup = mapIdToValue(sourceFix);
                    lookupMatches.forEach(match => {
                        let num = parseInt(match.substring(2, match.length - 2));
                        field.value = field.formula.replace("{{" + num + "}}", (lookup[num] || ""));
                    });
                }
            }
        }

        return actionModel.getById(templateName).then(action => {
            if (!action || action.type !== "template") {
                throw templateName + " is not a template.";
            }
            let targetFix = JSON.parse(JSON.stringify(sourceFix));;
            action.template.forEach(pair => {
                evaluate(pair, targetFix);
            }, this);
            return targetFix;
        });
    }
}

module.exports = Evaluation