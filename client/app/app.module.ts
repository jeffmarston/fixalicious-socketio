import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular/main';
import { AngularSplitModule } from 'angular-split';

import { AppComponent } from "./app.component";
import { MessageGridComponent } from "./components/message-grid/message-grid.component";
import { SessionNavComponent } from "./components/session-nav/session-nav.component";
import { DetailPaneComponent } from "./components/detail-pane/detail-pane.component";
import { FieldEditorComponent } from "./components/field-editor/field-editor.component";
import { SessionConfigComponent } from "./components/session-config/session-config.component";
import { ScenarioComponent } from "./components/scenario/scenario.component";
import { ApiService } from "./services/api.service";
import { FixParserService } from "./services/fix-parser.service";
import { ScenarioService } from "./services/scenario.service";
import { SetFocusDirective } from "./directives/set-focus";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        AngularSplitModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        AppComponent,
        MessageGridComponent,
        SessionNavComponent,
        DetailPaneComponent,
        FieldEditorComponent,
        SessionConfigComponent,
        ScenarioComponent,
        SetFocusDirective
    ],
    providers: [
        ApiService,
        FixParserService,
        ScenarioService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
