import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ModalService } from "../../services/modal.service"

@Component({
    selector: 'modal-placeholder',
    template: `
    <div class="modal-form"
        [style.opacity]="formOpacity">
        <header>
            <h1>FIX Message Detail</h1>
        </header>
        <section>
            <textarea readonly [ngModel]="displayText"></textarea>
        </section>
        <footer>
            <button (click)="close()">Close</button>
        </footer>
    </div>
    `,
    styles: [` 
    :host {
        position: fixed;
        width: 100%;
        height: 0;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 200;
        overflow: hidden;
        user-select: none;
    }

    div.modal-form {
        transition: opacity .2s linear;
        width: 70%;
        height: 50%;
        background: #fff;
        margin: 40px auto auto auto;
        display: flex;
        flex-direction: column;
    }

    section {
        flex: 1 1 auto;
        display: flex;
    }

    textarea {
        flex: 1 1 auto;
        border: none;
        outline: none;
        resize: none;
        padding: 6px;
    }

    header {
        padding: 6px;
        justify-content: center;
        display: flex;
        border-bottom: 1px solid gray;
    }
    footer {
        padding: 6px;
        justify-content: flex-end;
        display: flex;
    }
    footer button {
        padding: 4px;
        width: 70px;
    }
    `],
    providers: []
})
export class ModalComponent implements AfterViewInit {
    private hostStyle;
    private formOpacity: number;
    private displayText: string;

    constructor($element: ElementRef,
        modalService: ModalService) {
        this.hostStyle = $element.nativeElement.style;

        modalService.onShow.subscribe(o => {
            this.hostStyle.height = "100%";
            this.formOpacity = 1;
            this.displayText = o;
        });
    }

    private close() {
        this.hostStyle.height = "0";
        this.formOpacity = 0;
    }

    ngAfterViewInit() {

    }
}
