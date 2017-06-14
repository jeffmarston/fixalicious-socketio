import { Injectable } from '@angular/core';
import { IFixParserService } from "../types.d";


@Injectable()
export class FixParserService implements IFixParserService {

    public parseFix(fix: string){
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

    public parseFix2(fix: string){
        // console.log(fix);
        // let obj: any = {};
        // let lines: string[] = fix.split("\n");
        // lines = _.filter(lines, o => o.trim() != "");
        // let lastKey = "";

        // lines.forEach(line => {            
        //     if (!line.startsWith(" ")) {
        //         let parts = line.split(" ");
        //         lastKey = parts[0];
        //         obj[lastKey] = {};
        //     }            
        //     if (line.startsWith(" ")) {
        //         let parts = line.split(":");
        //         let key = parts[0].trim();
                
        //         obj[lastKey][key] = parts[1].trim();
        //     }
        // });
        // console.log(obj);
        // return obj;
    }
}