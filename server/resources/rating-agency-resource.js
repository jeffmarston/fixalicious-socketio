'use strict';

class RatingAgencyResource {

    constructor(ratingAgencyModel) {
        this.ratingAgencyCode = ratingAgencyModel.agencies.RatingAgencyCD;
        this.ratingAgencyDescription = ratingAgencyModel.agencies.RatingAgencDesc;
        this.termLength = ratingAgencyModel.agencies.TermLength;
        this.ratings = ratingAgencyModel.agencies.ratings;
        this.href = this.getHref();
    }

    static get baseUri() { return "/api/library/v1/ratingagency/"; }
    
    getHref() {
        return RatingAgencyResource.baseUri + this.ratingAgencyCode;
    }

    static getHref(ratingAgencyCD) {
        return RatingAgencyResource.baseUri + ratingAgencyCD;
    }
}
module.exports = RatingAgencyResource;