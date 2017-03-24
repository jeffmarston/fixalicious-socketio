import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ISession } from "../../types.d"

@Component({
    selector: 'session-config',
    templateUrl: "app/components/session-config/session-config.component.html",
    styleUrls: ["app/components/session-config/session-config.component.css"]
})
export class SessionConfigComponent {
    @Output() onSave = new EventEmitter<ISession>();
    @Input() session: ISession;

    private debugMessage: string;
    private hideForm: boolean = true;

    constructor() {
        this.session = {name:""};
    }

    private onClick() {
        this.onSave.emit(this.session);
    }

    private toggleCollapsed() {
        this.hideForm = !this.hideForm;
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "session" && changedProp.currentValue != undefined) {
                this.session = changedProp.currentValue;
                
            }
        }
    }

}
