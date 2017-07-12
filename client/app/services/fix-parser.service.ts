import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable()
export class FixParserService {

    public mapToSend(array) {
        let obj = {};
        array.forEach(element => {
            if (!obj[element.key]) {
                // if element has children, recurse into them
                if (Array.isArray(element.value)) {
                    obj[element.key] = this.mapToSend(element.value);
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

    // returns an array indexed by FIX tag 
    private mapIdToValue(obj): any[] {
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

    private generateId(): string {
        return (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
    }

    public eval(field, sourceFix) {
        field.value = field.formula;
        if (Array.isArray(field.formula)) {
            field.formula.forEach(element => {
                this.eval(element, sourceFix);
                //element.value = resolved;
            });
        } else if (typeof field.formula == "string") {
            field.value = field.formula.replace("{{newid}}", this.generateId());

            let lookupMatches = field.formula.match(/\{\{\d+\}\}/g);  // matches {{num}} pattern
            if (lookupMatches) {
                let lookup = this.mapIdToValue(sourceFix);
                lookupMatches.forEach(match => {
                    let num = parseInt(match.substring(2, match.length - 2));
                    field.value = field.formula.replace("{{" + num + "}}", (lookup[num] || ""));
                });
            }
        }
    }
}