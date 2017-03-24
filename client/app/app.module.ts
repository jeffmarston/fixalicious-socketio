import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AgGridModule } from 'ag-grid-angular/main';

import { AppComponent } from "./app.component";
import { SimpleGridComponent } from "./components/message-grid/message-grid.component";
import { SessionNavComponent } from "./components/session-nav/session-nav.component";
import { DetailPane } from "./components/detail-pane/detail-pane.component";
import { SessionConfigComponent } from "./components/session-config/session-config.component";
import { SessionService } from "./services/session.service";
import { ChannelService, ChannelConfig, SignalrWindow } from "./services/channel.service";

let channelConfig = new ChannelConfig();
channelConfig.url = "/signalr";
channelConfig.hubName = "EventHub";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        AgGridModule.forRoot()
    ],
    declarations: [
        AppComponent,
        SimpleGridComponent,
        SessionNavComponent,
        DetailPane,
        SessionConfigComponent
    ],
    providers: [ 
        SessionService,
        ChannelService,
        { provide: SignalrWindow, useValue: window },
        { provide: "channel.config", useValue: channelConfig }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
