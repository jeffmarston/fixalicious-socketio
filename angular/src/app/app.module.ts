import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AgGridModule } from 'ag-grid-angular/main';

import { AppComponent } from './app.component';
import { SessionNavComponent } from './session-nav/session-nav.component';
import { MessageGridComponent } from './message-grid/message-grid.component';

import { ApiService } from './api.service';

@NgModule({
  declarations: [
    AppComponent,
    SessionNavComponent,
    MessageGridComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgGridModule.withComponents([])
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
