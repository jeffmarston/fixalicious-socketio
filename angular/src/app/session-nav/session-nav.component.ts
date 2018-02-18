import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Http, Response } from '@angular/http';
import { ApiService } from '../api.service';
import * as io from 'socket.io-client';
import * as _ from 'lodash';
import { ISession } from '../types';

@Component({
  selector: 'app-session-nav',
  templateUrl: './session-nav.component.html',
  styleUrls: ['./session-nav.component.scss'],
  providers: [ApiService]
})
export class SessionNavComponent implements OnInit {
    @Output() onSelected = new EventEmitter<ISession>();
    @Input() collapsed: boolean;

    private debugMessage: string;
    private selectedSession: ISession;
    private sessions: ISession[];
    private isCollapsed: boolean;
    private isAddingSession: boolean;
    private newSessionName: string;

    constructor(
        private apiService: ApiService) {
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName === 'collapsed' && changedProp.currentValue !== undefined) {
                this.isCollapsed = changedProp.currentValue;
            }
        }
    }

    ngOnInit() {
        // this.sessions = [];
        // this.apiService.getSessions();
        // var src = this.apiService.getSessions();
        // src.subscribe(data => {
        //     this.sessions = data;
        //     if (data.length > 0) {
        //         this.selectedSession = data[0];
        //         this.onClick(this.selectedSession);
        //     }
        // }, error => {
        //     console.error("ERROR: " + error);
        // });

        // let socket = io();
        // socket.on('session', session => {
        //     let found = _.find(this.sessions, o => (o.session == session.session));
        //     if (found) {
        //         found.disconnected = session.status == "down";
        //     } else {
        //         this.sessions.push(session);
        //     }
        // });
    }

    private enterEdit(session) {
        session.isEditing = true;
    }

    private doneEditingSession(session) {
        if (this.newSessionName) {
            const newSession = { session: this.newSessionName, path: '' };
            this.sessions.push(newSession);
            this.isAddingSession = false;
            this.newSessionName = '';
            this.onClick(newSession);
        }
        this.isAddingSession = false;
        if (session) {
            session.isEditing = false;
        }
    }

    private addSession(e, newSessionInput) {
        this.isAddingSession = true;
        newSessionInput.focus();
    }

    private onClick(session) {
        this.debugMessage = session.session;
        if (this.selectedSession) {
            this.selectedSession.selected = false;
        }
        this.selectedSession = session;
        this.selectedSession.selected = true;
        this.onSelected.emit(session);
    }
}
