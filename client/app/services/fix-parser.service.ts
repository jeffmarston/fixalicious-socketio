import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable()
export class FixParserService {

    public mapToSend(array) {
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

    // returns an array indexed by FIX tag name
    private mapToValue(obj, mapProp): any[] {
        let header = _.keyBy(obj.header, o => o[mapProp]);
        let body = _.keyBy(obj.body, o => o[mapProp]);
        let trailer = _.keyBy(obj.trailer, o => o[mapProp]);
        let combined = [];
        _.merge(combined, header, body, trailer);

        // return object with the property=Tag, and value=Value
        for (var property in combined) {
            combined[property.toString()] = combined[property].Value;
        }
        return combined;
    }

    private generateId(length): string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < (length || 10); i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    private generateTimestamp(input): string {
    var temp = "fix-parser";
        return temp;
    }

    public eval(field, sourceFix) {

        const regex_newId = /\$\{newId\((\d*)\)\}/g;
        const regex_newTime = /\$\{timestamp\((\d*)\)\}/g;
        const regex_tag = /\$\{tag\((\d+)\)\}/g;
        const regex_name = /\$\{name\(\"([a-zA-Z]+)\"\)\}/g;

        field.value = field.formula;
        if (Array.isArray(field.formula)) {
            field.formula.forEach(element => {
                this.eval(element, sourceFix);
            });
        } else if (typeof field.formula == "string") {

            let tagLookup = this.mapToValue(sourceFix, "Tag");
            let nameLookup = this.mapToValue(sourceFix, "Name");

            field.value = field.formula;
            field.value = field.value.replace(regex_newId, (a, b) => this.generateId(b));
            field.value = field.value.replace(regex_newTime, (a, b) => this.generateTimestamp(b));
            field.value = field.value.replace(regex_tag, (a, b) => (tagLookup[b] || ""));
            field.value = field.value.replace(regex_name, (a, b) => (nameLookup[b] || ""));

        }
    }
}