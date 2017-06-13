import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../services/session.service"
import { ISession } from "../../types.d"

@Component({
    selector: 'session-nav',
    template: `
    <div class="container" [style.height]="isCollapsed ? '0' : '40px'" >
        <ul>     
            <li *ngFor="let session of sessions"
                    (click)="onClick(session)"
                    (dblclick)="enterEdit(session)"
                    class="navbar-item"
                    [class.active]="session.selected">
                    
                    <input 
                        (blur)="doneEditingSession(session)"
                        [readonly]="!session.isEditing"
                        [(value)]="session.name"
                        [ngClass]="session.isEditing ? 'editable-input' : 'readonly-input' "/>

            </li>
            <li>
                <span class="add-session-button navbar-item" 
                    (click)="addSession($event, newSessionInput)"
                    *ngIf="!isAddingSession" 
                    title="Add new session">+</span>
                <input 
                    #newSessionInput
                    name="newSessionInput"
                    class="editable-input hidden"
                    [ngClass]="{'visible': isAddingSession }"
                    [(ngModel)]="newSessionName" 
                    (blur)="doneEditingSession()"/>

            </li>
        </ul>
    </div>
    `,
    styles: [` 
        input {
            outline: none;
        }

        .container {
            flex-direction: column;
            height: 100%;
            background-color: #234;
            color: #88959E;
            overflow: hidden;
            transition: height .25s ease;
        }

        input {
            width: 100%;
            height: 30px;
            border: none;
            font-size: 14px;
            text-align:center
        }

        .editable-input {
            transition: height .1s ease;
            background: #88959E;
        }

        .editable-input.hidden {
            width: 0;
            height: 0;
            opacity: 0;
        }

        .editable-input.visible {
            opacity: 1;
            width: 100%;
            height: 30px;
        }

        .readonly-input {
            background: transparent;
            color: #88959E;
            cursor: pointer;
        }

        .add-session-button {
            display: none;
            border-radius: 15px;
            margin-left: 10px;
            padding-left: 9px;
            padding-right: 9px;
            cursor: pointer;
            border: none;
            outline: none;
            background: transparent;
            font-size: 24px;
        }

        .add-session-button:hover {
            color: white;
            background: #36424B;
        }

        ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }

        li.navbar-item { 
            width: 100px;
            float: left;
            padding: 4px;
            border-radius: 6px 6px 0 0;
        }

        li.navbar-item:hover:not(.active) {
            background-color: #25404E;
        }

        li.active {
            background-color: #fff;
            color: white;
        }

    `],
    providers: [SessionService]
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
        private sessionService: SessionService) {
    }    

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.isCollapsed = changedProp.currentValue;
            }
        }
    }

    ngOnInit() {
        this.sessions = [];
        this.sessionService.getSessions();
        var src = this.sessionService.getSessions();
        src.subscribe(data => {
            this.sessions = data;
            if (data.length > 0) {
                this.selectedSession = data[0];
                this.onClick(this.selectedSession);
            }
        }, error => {
            console.error("ERROR: " + error);
        });
    }

    private enterEdit(session) {
        session.isEditing = true;
    }

    private doneEditingSession(session) {
        if (this.newSessionName ) {
            let newSession = {name: this.newSessionName, path: ""};
            this.sessions.push(newSession);
            this.isAddingSession = false;
            this.newSessionName="";
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
        this.debugMessage = session.name;
        if (this.selectedSession) {
            this.selectedSession.selected = false;
        }
        this.selectedSession = session;
        this.selectedSession.selected = true;
        this.onSelected.emit(session);
    }
}
