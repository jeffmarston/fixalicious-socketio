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

    private collapsed: boolean;
    private sourceFixObj = {};
    private isConfiguring = false;
    private customActions = [];
    private selectedAction = null;
    private width = 400;
    private editor = "field";
    private hideScenario = true;

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService) {

        this.apiService.getActions().subscribe(o => {
            this.customActions = o;
            if (this.customActions.length > 0) {
                this.prepareTemplate(this.customActions[0], false);
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
                if (this.selectedAction) {
                    this.prepareTemplate(this.selectedAction, false);
                }
            }
        }
    }

    private toggleExpanded() {
        this.collapsed = !this.collapsed;
        localStorage.setItem("detail-pane-collapsed", this.collapsed.toString());
    }

    private addAction() {
        if (this.selectedAction.invalid) {
            this.pullAction(this.selectedAction);
        }
        let newAction = {
            label: "Action", isEditing: true, pairs: [
                { key: "", formula: "" }
            ]
        };
        this.customActions.push(newAction);
    }

    private doneEditingActionLabel($event, action) {
        if (action.isEditing) {
            action.isEditing = false;
            action.invalid = null;

            if (_.countBy(this.customActions, o => o.label.toUpperCase() === action.label.toUpperCase()).true > 1) {
                action.label = this.uniquify(_.map(this.customActions, o => o.label), action.label);
            }

            if (action.label.trim() === "") {
                action.invalid = "Label cannot be empty";
            }

            if (action.invalid) {
                action.isEditing = true;
            } else {
                // save to server
                this.apiService.createTemplate(action).subscribe(o => {
                    this.selectedAction = action;
                    this.isConfiguring = true;
                });
            }
        }
    }

    private prepareTemplate(action, autoSend: boolean) {
        if (this.selectedAction.invalid) {
            return;
        }
        this.selectedAction = action;

        if (action.label == "Fill") {
            this.editor = "scenario";
            this.width = 700;
        } else {
            this.editor = "field";
            this.width = 400;
        }

        if (this.isConfiguring) {
            //finalize and save changes
            this.configureTemplate();
        }

        this.selectedAction = action;
        action.processedFix = {};
        action.template.forEach(element => {
            let resolved = this.fixParserService.eval(element, this.sourceFixObj);
            action.processedFix[element.key] = { value: resolved, formula: element.formula };
        });

        this.displayFixMessage();
        if (autoSend && this.collapsed) {
            this.send();
        }
    }

    private send() {
        this.apiService.createTransaction(this.session.session, this.selectedAction.processedFix);

        if (!this.collapsed) {
            this.displayFixMessage();
        }
    }

    private pullAction(action) {
        let index = this.customActions.indexOf(action);
        _.pull(this.customActions, action);
        if (index > 0) {
            this.selectedAction = this.customActions[index - 1];
        } else if (index < this.customActions.length) {
            this.selectedAction = this.customActions[index];
        }
        this.prepareTemplate(action, false);
    }

    private deleteTemplate() {
        this.apiService.deleteTemplate(this.selectedAction)
            .subscribe(success => {
                this.pullAction(this.selectedAction);
            }, error => {
                console.error("Failed to delete template: " + error);
            });
    }

    private configureTemplate() {
        if (this.isConfiguring) {
            this.apiService.createTemplate(this.selectedAction).subscribe(o => {
                console.log("Template saved");
            });
        }
        this.isConfiguring = !this.isConfiguring;
        this.displayFixMessage();
    }

    private displayFixMessage() {
        this.selectedAction.template.forEach(element => {
            this.fixParserService.eval(element, this.sourceFixObj);
        });

        console.log(this.selectedAction);
    }

    private uniquify(allNames: string[], origName: string): string {
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

    private copyTemplate() {
        let json = JSON.stringify(this.selectedAction);
        let newAction = JSON.parse(json);

        newAction.label = this.uniquify(
            _.map(this.customActions, o => o.label),
            newAction.label);

        this.customActions.push(newAction);
        this.apiService.createTemplate(newAction).subscribe(o => {
            console.log("Template saved");
            this.prepareTemplate(newAction, false);
            newAction.isConfiguring = true;
        });
    }
}
