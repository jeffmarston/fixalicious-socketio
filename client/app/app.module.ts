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
import { ModalComponent } from "./components/modal/modal.component";
import { SessionService } from "./services/session.service";
import { FixParserService } from "./services/fix-parser.service";
import { SetFocusDirective } from "./directives/set-focus";
// import { IFixParserService } from "./types";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        AppComponent,
        SimpleGridComponent,
        SessionNavComponent,
        ModalComponent,
        DetailPane,
        SessionConfigComponent,
        SetFocusDirective
    ],
    providers: [
        SessionService,
        FixParserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
