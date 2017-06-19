import { Injectable } from '@angular/core';
import { IFixParserService } from "../types.d";


@Injectable()
export class FixParserService implements IFixParserService {

    public parseFix(fix: string): any {
        let obj: any = {};
        let lines: string[] = fix.split("\n");

        lines.forEach((line: string) => {
            if (line.startsWith(" ")) {
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
            obj[each.key] = each.value;
        }
        return obj;
    }
}