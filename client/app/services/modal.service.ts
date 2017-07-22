import { Injectable, EventEmitter } from '@angular/core';
import * as _ from "lodash";

@Injectable()
export class ModalService {
    public onShow = new EventEmitter<string>();

    public show(displayText) {
        this.onShow.emit(displayText);
    };
}