import { Injectable } from '@angular/core';
import { IFixParserService } from "../types.d";
import * as _ from "lodash";

@Injectable()
export class FixParserService implements IFixParserService {

    public parseFix(fix: string): any {
        let obj: any = {};
        let lines: string[] = fix.split("\n");

        lines.forEach((line: string) => {
            if (line.startsWith(" ") && line.trim() != "") {
                let parts = line.split(":");
                let key = parts[0].trim();
                obj[key] = parts[1].trim();
            }
        });
        return obj;
    }

    public generateFix(fix: any[]) {
        let obj = {};
        for (let i in fix) {
            let each = fix[i];
            obj[each.key] = each.value.value;
        }
        return obj;
    }

    // returns an array indexed by FIX tag 
    private mapIdToValue(obj): any[] {
        let arr = [];
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                let regex = /\(\d+\)$/; // matches (num) at end of string
                let matches = property.match(regex);
                if (matches) {
                    let trimmed = matches[0].substring(1, matches[0].length - 1);
                    arr[trimmed] = obj[property];
                }
            }
        }
        return arr;
    }

    private generateId(): string {
        return (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
    }

    public eval(formula, sourceFix): string {
        if (typeof formula == "string") {
            formula = formula.replace("{{newid}}", this.generateId());

            let lookupMatches = formula.match(/\{\{\d+\}\}/g);  // matches {{num}} pattern
            if (lookupMatches) {
                let lookup = this.mapIdToValue(sourceFix);
                lookupMatches.forEach(match => {
                    let num = parseInt(match.substring(2, match.length - 2));
                    formula = formula.replace("{{" + num + "}}", (lookup[num] || ""));
                });
            }
        }
        return formula;
    }
}