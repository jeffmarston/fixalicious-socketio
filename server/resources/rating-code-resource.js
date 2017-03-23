'use strict';

class RatingCodeResource {

    constructor(ratingCodeModel) {
        this.ratingAgencyCode = ratingCodeModel.ratings.RatingAgencyCD;
        this.ratingCode = ratingCodeModel.ratings.RatingCD;
        this.ratingDescription = ratingCodeModel.ratings.RatingDesc;
        this.ratingValue = ratingCodeModel.ratings.RatingValue;
        this.href = this.getHref();
    }

    static get baseUri() { return "/api/library/v1/ratingcode/"; }
    
    getHref() {
        return RatingCodeResource.baseUri + this.ratingAgencyCode;
    }

    static getHref(ratingAgencyCD) {
        return RatingCodeResource.baseUri + ratingAgencyCD;
    }
}
module.exports = RatingCodeResource;