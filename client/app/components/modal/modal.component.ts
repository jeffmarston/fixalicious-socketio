import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ISession } from "../../types.d"

@Component({
    selector: 'modal-placeholder',
    template: `
    <div class="modal-form">
    </div>
    `,
    styles: [` 
    div.modal-form {
        width: 70%;
        height: 50%;
        background: #fff;
        margin: 40px auto auto auto;
    }
    `],
    providers: []
})
export class ModalComponent implements OnInit {
    constructor() {
    }    

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    }

    ngOnInit() {
    }
}
