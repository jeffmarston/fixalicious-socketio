'use strict'

class DataError extends Error {
    constructor(code, dataMessage, error) {
        super(error.message);
        this.dataErrorCode = code;
        this.dataErrorMessage = dataMessage;
    }
};

module.exports = DataError;