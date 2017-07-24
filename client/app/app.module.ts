import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular/main';
import { AngularSplitModule } from 'angular-split';
import { AceEditorComponent } from 'ng2-ace-editor'; 

import { AppComponent } from "./app.component";
import { MessageGridComponent } from "./components/message-grid/message-grid.component";
import { SessionNavComponent } from "./components/session-nav/session-nav.component";
import { DetailPaneComponent } from "./components/detail-pane/detail-pane.component";
import { FieldEditorComponent } from "./components/editors/field-editor.component";
import { AceComponent } from "./components/editors/ace.component";
import { ApiService } from "./services/api.service";
import { FixParserService } from "./services/fix-parser.service";
import { ModalService, ModalComponent } from "./services/modal.service";
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
        AceComponent,
        ModalComponent,
        SetFocusDirective,
        AceEditorComponent
    ],
    providers: [
        ApiService,
        FixParserService,
        ModalService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
