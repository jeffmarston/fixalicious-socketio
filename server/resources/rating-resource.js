'use strict';

class RatingResource {

    constructor(ratingModel) {
        this.ratingAgencyCode = ratingModel.ratings.RatingAgencyCD;
        this.ratingAgencyDescription = ratingModel.ratings.RatingAgencyDesc;
        this.termLength = ratingModel.ratings.TermLength;
        this.ratings = ratingModel.ratings.ratings;
        this.href = this.getHref();
    }

    static get baseUri() { return "/api/library/v1/ratings/"; }
    
    getHref() {
        return RatingResource.baseUri + this.ratingAgencyCode;
    }

    static getHref(ratingAgencyCD) {
        return RatingResource.baseUri + ratingAgencyCD;
    }
}
module.exports = RatingResource;