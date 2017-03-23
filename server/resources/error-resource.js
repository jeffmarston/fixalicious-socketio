'use strict'

class ErrorResponse {
    constructor(httpStatusCode, urlPosted, friendlyError, error) {
        this.httpStatusCode = httpStatusCode;
        this.urlPosted = urlPosted;
        this.code = error.dataErrorCode;
        this.errorMessage = friendlyError;
        this.errorDetail = error.dataErrorMessage;
        // TODO: Make this switch between devmode and prod
        this.technicalDetail = error.message;
    }
};
module.exports = ErrorResponse;
