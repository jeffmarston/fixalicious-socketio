'use strict'

class PostResponseResource {
    constructor(urlPosted, numberRequested, numberCreated, numberUpdated) {
        this.urlPosted = urlPosted;
        if (numberRequested) this.numberRequested = numberRequested;
        if (numberCreated) this.numberCreated = numberCreated;
        if (numberUpdated) this.numberUpdated = numberUpdated;
    }
};
module.exports = PostResponseResource;