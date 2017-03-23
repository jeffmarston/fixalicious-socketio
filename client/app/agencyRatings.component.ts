import { Component } from 'angular2/core';
import { AgencyRatingsService } from "./agencyRatings.service"
import { HTTP_PROVIDERS, Http } from 'angular2/http';
import { Observable }  from 'rxjs/Rx';
import { IAgency, IRating } from "./types";

enum DataStatus {
    CLEAN,
    DIRTY,
    BUSY_LOADING,
    BUSY_SAVING,
    ERROR
}

@Component({
    selector: 'agency-ratings',
    templateUrl: './app/agencyRatings.template.html',
    styleUrls: ['app/agencyRatings.style.css'],
    providers: [HTTP_PROVIDERS, AgencyRatingsService]
})

export class AppComponent {    
    private agencies: IAgency[];
    private ratings: IRating[];
    public selectedAgency: IAgency;
    public uiSelectedAgencyCode: string;
    public dataStatus: DataStatus;
    public dataMessages = {};

    constructor(private arService: AgencyRatingsService) {
        this.uiSelectedAgencyCode = "";
        this.selectedAgency = { ratingAgencyCode: "",  ratingAgencyDescription: "", termLength: "",  ratings: [] }; 
        this.setupDataMessages();
        this.reloadData();
    }

    public changeUISelectedAgency() {
        console.log("considering changing selection to " + this.uiSelectedAgencyCode);
        if(this.dataStatus == DataStatus.DIRTY)
        {
            let popup = confirm("You have unsaved changes!\n\nAbandon changes?");
            if(popup == true)
            {
                this.reloadData();
                this.changeToUISelectedAgency();
            }
            else
            {
                console.log("Rejecting change, reverting to " + this.selectedAgency.ratingAgencyCode);
                setTimeout(() => {
                    this.uiSelectedAgencyCode = this.selectedAgency.ratingAgencyCode;
                }, 0);
            }
        }
        else 
        {
            this.changeToUISelectedAgency();
        }        
    }

    private changeToUISelectedAgency() {
        let agency = this.agencies.find(o => o.ratingAgencyCode === this.uiSelectedAgencyCode);
        console.log("applying change of selection from " + this.selectedAgency.ratingAgencyCode + " to " + agency.ratingAgencyCode);
        if (agency){
            this.selectedAgency = agency;
            this.ratings = agency.ratings;
        }
    }

    public reloadData() {

        this.dataStatus = DataStatus.BUSY_LOADING;

        var src = this.arService.getAllAgencyRatings();
        src.subscribe(o => {
                    this.agencies = o;
                    if(this.agencies.length > 0)
                    {
                        this.dataStatus = DataStatus.CLEAN;
                        console.log("reloading focus check: uiSelectedAgencyCode is " + this.uiSelectedAgencyCode);
                        if(this.uiSelectedAgencyCode == "")  // preserve focus on reload, but why doesn't it get used by html select?
                        {
                            console.log("  reloading is assigning a focus because one doesn't exist!");
                            this.uiSelectedAgencyCode = this.agencies[0].ratingAgencyCode;
                        }
                        this.changeToUISelectedAgency();
                    }
                }, error => {
                    this.dataStatus = DataStatus.ERROR;
                    console.error(error);
                });
    }

    public addNewRatingCode() {
        console.log("running addNewRatingCode");
        this.selectedAgency.ratings.push( {  RatingAgencyCD: this.selectedAgency.ratingAgencyCode, RatingCD: "", RatingDesc: "", RatingValue: 0 });
        this.dataStatus = DataStatus.DIRTY;
    }

    public saveChanges() {
        console.log("running saveChanges");

        var post = this.arService.saveAgencyRatings(this.selectedAgency.ratingAgencyCode, this.selectedAgency.ratings);
        post.subscribe( 
            o => this.dataStatus = DataStatus.CLEAN,
            error => {
                    this.dataStatus = DataStatus.ERROR;
                    console.error(error);
                });

    }

    public removeRating(rating: IRating) {
        let index = this.ratings.indexOf(rating);
        if (index > -1) {
            this.ratings.splice(index, 1);
            this.dataStatus = DataStatus.DIRTY;
        }
    }

    public markDirty() {
        this.dataStatus = DataStatus.DIRTY;
    }

    private setupDataMessages() {
        this.dataMessages[DataStatus.CLEAN] = "";
        this.dataMessages[DataStatus.DIRTY] = "You have unsaved changes";
        this.dataMessages[DataStatus.BUSY_LOADING] = "Loading data...";
        this.dataMessages[DataStatus.BUSY_SAVING] = "Saving your changes...";
        this.dataMessages[DataStatus.ERROR] = "Error loading/saving data!";
    }
} 