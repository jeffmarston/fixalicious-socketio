import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
import { FixParserService } from "../../services/fix-parser.service"
import { ISession, IFixMessage, ITransaction } from "../../types.d";
import { SetFocusDirective } from "../../directives/set-focus";
import * as io from 'socket.io-client';
import * as _ from "lodash";

@Component({
    selector: 'detail-pane',
    templateUrl: "app/components/detail-pane/detail-pane.component.html",
    styleUrls: ["app/components/detail-pane/detail-pane.component.css"],
    providers: [ApiService]
})
export class DetailPaneComponent implements OnInit {
    @Input() detail: ITransaction;
    @Input() session: ISession;
    @Input() collapsed: boolean;
    @Output() onCollapse = new EventEmitter<boolean>();

    private sourceFixObj = {};
    private isConfiguring = false;
    private customActions = [];
    private selectedAction = null;
    private editor = "template";
    private hideScenario = false;
    private autoSend: boolean = false;

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService) {

        this.apiService.getActions().subscribe(o => {
            // sort alphabetically
            this.customActions = o.sort(this.sortAction);
            if (this.customActions.length > 0) {
                this.prepareTemplate(this.customActions[0]);
            }
        });

        this.selectedAction = {
            label: "", isEditing: true, template: []
        };
    }

    ngOnInit() {
        this.collapsed = localStorage.getItem("detail-pane-collapsed") === "true";
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                let transaction = changedProp.currentValue;
                this.sourceFixObj = JSON.parse(transaction.message);
                if (this.selectedAction && !this.collapsed) {
                    this.prepareTemplate(this.selectedAction);
                }
            }
        }
        this.customActions.forEach(o => {
            o.enabled = o.enabledSessions
                && (o.enabledSessions.indexOf(this.session.session) > -1);
        });
    }

    private toggleEnabled($event) {
        this.selectedAction.enabled = $event;
    }

    private toggleExpanded() {
        this.collapsed = !this.collapsed;
        localStorage.setItem("detail-pane-collapsed", this.collapsed.toString());
        this.onCollapse.emit(this.collapsed);
    }

    private addAction(type) {
        if (this.selectedAction.invalid) {
            this.pullAction(this.selectedAction);
        }
        if (type === "template") {
            this.selectedAction = {
                label: "Template",
                type: type,
                isEditing: true,
                template: [
                    { key: "", formula: "" }
                ]
            };
        } else if (type === "scenario") {
            this.selectedAction = {
                label: "Scenario",
                type: type,
                isEditing: true,
                code: "// Language = JavaScript ",
                enabledSessions: []
            };
        }
        this.customActions.push(this.selectedAction);
        this.prepareTemplate(this.selectedAction);
    }

    private sortAction(a, b) {
        var nameA = a.label;
        var nameB = b.label;
        if (nameA < nameB) {
            return -1;
        } else if (nameA > nameB) {
            return 1;
        } else {
            return 0;
        }
    }

    private doneEditingActionLabel($event, action) {
        if (action.isEditing) {
            action.isEditing = false;
            action.invalid = null;

            action.label = this.uniquify(_.map(this.customActions, o => o.label), action.label);

            if (action.label.trim() === "") {
                action.invalid = "Label cannot be empty";
            }

            if (action.invalid) {
                action.isEditing = true;
            } else {
                // save to server
                this.apiService.saveAction(action).subscribe(o => {
                    this.selectedAction = action;
                    this.isConfiguring = true;
                    this.customActions.sort(this.sortAction);
                });
            }
        }
    }

    private prepareTemplate(action) {
        if (this.selectedAction && this.selectedAction.invalid) {
            return;
        }
        this.selectedAction = action;

        if (action.type == "scenario") {
            this.editor = "scenario";
        } else {
            this.editor = "template";
        }
        
        if (this.collapsed) {
            this.selectedAction = null;
        } 
        

        // [JWM] - Implement onLeave?

        // if (this.isConfiguring) {
        //     //finalize and save changes
        //     this.configureTemplate();
        // }

        // this.selectedAction = action;
        // action.processedFix = {};
        // action.template.forEach(element => {
        //     let resolved = this.fixParserService.eval(element, this.sourceFixObj);
        //     action.processedFix[element.key] = { value: resolved, formula: element.formula };
        // });

        // this.displayFixMessage();
        // if (autoSend && this.collapsed) {
        //     this.send = true;
        // }
    }

    private pullAction(action) {
        let index = this.customActions.indexOf(action);
        _.pull(this.customActions, action);
        if (index > 0) {
            this.selectedAction = this.customActions[index - 1];
        } else if (index < this.customActions.length) {
            this.selectedAction = this.customActions[index];
        }
        this.prepareTemplate(this.selectedAction, false);
    }

    private deleteAction() {
        this.apiService.deleteAction(this.selectedAction)
            .subscribe(success => {
                this.pullAction(this.selectedAction);
            }, error => {
                console.error("Failed to delete template: " + error);
            });
    }

    private uniquify(allNames: string[], origName: string): string {
        // if it's already unique, return it
        if (_.countBy(allNames, o => o === origName).true === 1) {
            return origName;
        }

        let newName = origName;
        while (_.find(this.customActions, o => o.label === newName)) {
            let regex = /\(\d+\)$/;
            let matches = newName.match(regex);
            if (matches) { // this already exists, incremenet the number
                let num = matches[0].substring(1, matches[0].length - 1);
                let incNum = parseInt(num) + 1;
                newName = newName.replace(regex, "(" + incNum + ")");
            } else {
                newName += " (1)";
            }
        }
        return newName;
    }

    private copyAction() {
        let json = JSON.stringify(this.selectedAction);
        let newAction = JSON.parse(json);

        newAction.label = this.uniquify(
            _.map(this.customActions, o => o.label),
            newAction.label);

        this.customActions.push(newAction);
        this.apiService.saveAction(newAction).subscribe(o => {
            console.log("Template saved");
            this.prepareTemplate(newAction, false);
            newAction.isConfiguring = true;
        });
    }
}
