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
export class DetailPane implements OnInit {
    @Input() detail: ITransaction;
    @Input() collapsed: boolean = true;
    @Input() session: ISession;

    private transaction: ITransaction;
    private isValid: boolean;
    private sourceFixObj = {};
    private fixToSend = {};
    private isConfiguring = false;
    private customActions = [];
    private selectedAction = null;
    private fixFields = ["OrderID", "ClOrdID", "Symbol", "ExecID", "ExecType"];

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService) {
        this.isValid = true;

        this.apiService.getTemplates().subscribe(o => {
            this.customActions = o;
            if (this.customActions.length > 0) {
                this.activateTemplate(this.customActions[0], false);
            }
        });

        this.selectedAction = {
            label: "", isEditing: true, pairs: []
        };
    }

    ngOnInit() {
        this.collapsed = localStorage.getItem("detail-pane-collapsed") === "true";
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                this.transaction = changedProp.currentValue;
                this.sourceFixObj = JSON.parse(this.transaction.message);
                this.isValid = true;

                if (this.selectedAction) {
                    this.activateTemplate(this.selectedAction, false);
                }
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.collapsed = changedProp.currentValue;
            }
        }
    }

    private toggleExpanded() {
        this.collapsed = !this.collapsed;
        localStorage.setItem("detail-pane-collapsed", this.collapsed.toString());
    }

    private addAction() {
        if (this.selectedAction.invalid) {
            return;
        }
        let newAction = {
            label: "", isEditing: true, pairs: [
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

    private activateTemplate(action, autoSend: boolean) {
        if (this.selectedAction.invalid) {
            return;
        }
        if (this.isConfiguring) {
            //finalize and save changes
            this.configureTemplate();
        }

        this.selectedAction = action;

        this.fixToSend = {};
        action.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
            this.fixToSend[element.key] = { value: resolved, formula: element.formula };
        });

        this.displayFixMessage();
        if (autoSend && this.collapsed) {
            this.send();
        }
    }

    private send() {
        let fixObj = this.fixParserService.generateFix(this.selectedAction.pairs);
        this.apiService.createTransaction(this.session.session, fixObj);

        if (!this.collapsed) {
            this.displayFixMessage();
        }
    }

    private deleteTemplate() {
        this.apiService.deleteTemplate(this.selectedAction)
            .subscribe(success => {
                let index = this.customActions.indexOf(this.selectedAction);
                _.pull(this.customActions, this.selectedAction);
                if (index > 0) {
                    this.selectedAction = this.customActions[index - 1];
                } else if (index < this.customActions.length) {
                    this.selectedAction = this.customActions[index];
                }
                this.activateTemplate(this.selectedAction, false);
            }, error => {
                console.error("Failed to delete template: " + error);
            });
    }

    private configureTemplate() {
        if (this.isConfiguring) {
            _.pullAt(this.selectedAction.pairs, this.selectedAction.pairs.length - 1);
            this.apiService.createTemplate(this.selectedAction).subscribe(o => {
                console.log("Template saved");
            });
        } else {
            this.selectedAction.pairs.push({
                key: "",
                formula: "",
                value: "",
                isNewItem: true
            });
        }
        this.isConfiguring = !this.isConfiguring;
        this.displayFixMessage();
    }

    private displayFixMessage() {
        this.selectedAction.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
        });
    }

    private doneEditingPair(pair) {
        let lastPair = this.selectedAction.pairs[this.selectedAction.pairs.length - 1];
        if (lastPair.key.trim() !== "") {
            pair.isNewItem = false;
            this.selectedAction.pairs.push({
                key: "",
                formula: "",
                value: "",
                isNewItem: true
            });
        } else {
            _.pull(this.selectedAction.pairs, pair);
        }
    }

    private deletePair(pair) {
        _.pull(this.selectedAction.pairs, pair);
    }

    private makeRepeating(pair) {
        let idx = this.selectedAction.pairs.indexOf(pair);
        pair.isGroup = true;
        this.selectedAction.pairs.splice(idx+1, 0, {
            key: "",
            formula: "",
            level: (pair.level || 0) + 1
        });
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
            this.activateTemplate(newAction, false);
            newAction.isConfiguring = true;
        });
    }
}
