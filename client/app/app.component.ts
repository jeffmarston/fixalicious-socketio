import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { ChannelService, ConnectionState } from "./services/channel.service";

@Component({
    selector: 'my-app',
    template: `
    <div class="app-container">
        <session-nav
            [collapsed]="isNavCollapsed"
            (onSelected)="onSelected($event)"
            ></session-nav>
        <div class="app-content">
            <div class="header-bar">
                <div class="collapse-button" (click)="toggleNavBar()">
                    <i class="fa fa-glass" aria-hidden="true"></i>
                </div>
                <h1>FIXalicious</h1>
            </div>
            <message-grid 
                style="flex: 1 1 auto; height: 100%;"
                [session]="session"
                ></message-grid>
        </div>
    </div>
    `,
    styles: [` 
        .app-container { 
            display: flex;
            height: 100%;
        }
        .app-content { 
            display: flex;
            flex-direction: column;
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
    `]
})
export class AppComponent {
    private connectionState$: Observable<string>;
    private session: string = "BAX";
    private isNavCollapsed: boolean;

    constructor(
            private channelService: ChannelService
        ) {
        // Let's wire up to the signalr observables
        this.connectionState$ = this.channelService.connectionState$
            .map((state: ConnectionState) => { return ConnectionState[state]; });

        this.channelService.error$.subscribe(
            (error: any) => { console.warn(error); },
            (error: any) => { console.error("errors$ error", error); }
        );

        // Wire up a handler for the starting$ observable to log the
        //  success/fail result
        this.channelService.starting$.subscribe(
            () => { console.log("signalr service has been started"); },
            () => { console.warn("signalr service failed to start!"); }
        );
    }

    ngOnInit() {
        // Start the signalR connection
        this.channelService.start();
    }

    toggleNavBar(){
        this.isNavCollapsed = !this.isNavCollapsed;
    }

    onSelected($event) {
        this.session = $event;        
    }
}
