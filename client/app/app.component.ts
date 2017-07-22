import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";

@Component({
    selector: 'my-app',
    template: `
    
    <div class="app-container">

        <div class="header-bar">
            <div class="collapse-button" (click)="toggleNavBar()">
                <i class="fa fa-glass" style="display:none"></i>
                <i class="fa fa-fort-awesome" style="font-size: 25px"></i>
            </div>
            <h1>FIXalicious</h1>
        </div>

        <session-nav
            [collapsed]="isNavCollapsed"
            (onSelected)="onSelected($event)"
        ></session-nav>

        <div class="app-content">
            <div class="flex-row">
                <message-grid 
                    style="flex: 1 1 auto;"
                    [session]="session">
                </message-grid>
            </div>

            <!-- <detail-pane></detail-pane> -->

        </div>
    </div>

    <modal-placeholder></modal-placeholder>

    `,
    styles: [` 
        .app-container { 
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .app-content { 
            display: flex;
            flex-direction: row;
            flex: 1 1 auto;
        }
        h1 {
            display: inline;
        }
        .collapse-button {
            font-size: 16px;
            display: inline;
            cursor: pointer;
            margin-right: 10px;
        }
        .flex-row {
            display:flex;
            flex-direction: row;
            flex: 1 1 auto;
        }
    `]
})
export class AppComponent {
    private connectionState$: Observable<string>;
    private session = null;
    private isNavCollapsed: boolean;
    private showModal: boolean;

    ngOnInit() {
    }

    toggleNavBar(){
        this.isNavCollapsed = !this.isNavCollapsed;
        this.showModal = !this.showModal;
    }

    onSelected($event) {
        if ($event) {
            this.session = $event;        
        }
    }
}
