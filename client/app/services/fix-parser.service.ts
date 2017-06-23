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

    public eval(formula, sourceFix) {
        if (typeof formula == "string" && formula.startsWith("=")) {
            let param = formula.substring(1, formula.length);
            let returnVal = sourceFix[param];
            return returnVal || "ERR";
        } else {
            return formula;
        }
    }
}