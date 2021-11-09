const model = require('./models');

const isUnique = async (email) => {
    list = await model.list('Account')
    let output = true
    list.results.forEach(account => {
        if (account.email == email) {
            output = false
        }
    });
    return output
};

const validString = (str) => {
    if (typeof str == "string") {
        return true;
    } else {
        return false;
    }
};

const validNumber = (num) => {
    if (typeof num == "number") {
        return true;
    } else {
        return false;
    }
};

const validateAccountRequest = async (req) => {
    let status = 200;
    let error = null;
    const unique = await isUnique(req.body.email);
    if (req.get('Content-Type') != 'application/json') {
        status = 415;
        error = {"Error": "Received an unsupported media type"}
    } else if (!req.body.hasOwnProperty("email") || Object.keys(req.body).length != 1) {
        status = 400;
        error = {"Error": "The request object is missing at least one of the required attributes or an unexpected attribute was sent"}
    } else if (req.accepts('json') != 'json') {
        status = 406;
        error = {"Error": "Cannot send accepted media type"};
    } else if (!validString(req.body.email)) {
        status = 400;
        error = {"Error": "At least one of the attributes is an incorrect type"};
    } else if (!unique) {
        status = 403;
        error = {"Error": "An account with that email already exists"};
    }
    return {"status": status, "error": error}
};

const validateFlowRequest = async (req) => {
    let status = 200;
    let error = null;
    if (req.get('Content-Type') != 'application/json') {
        status = 415;
        error = {"Error": "Received an unsupported media type"}
    } else if (!req.body.hasOwnProperty("account_id") || Object.keys(req.body).length != 1) {
        status = 400;
        error = {"Error": "The request object is missing at least one of the required attributes or an unexpected attribute was sent"}
    } else if (req.accepts('json') != 'json') {
        status = 406;
        error = {"Error": "Cannot send accepted media type"};
    } else if (!validNumber(req.body.account_id)) {
        status = 400;
        error = {"Error": "At least one of the attributes is an incorrect type"};
    }

    return {"status": status, "error": error}
};

const validateFlowPut = async (req) => {
    let status = 200;
    let error = null;
    if (req.get('Content-Type') != 'application/json') {
        status = 415;
        error = {"Error": "Received an unsupported media type"}
    } else if (!req.body.hasOwnProperty("code") || Object.keys(req.body).length != 1) {
        status = 400;
        error = {"Error": "The request object is missing at least one of the required attributes or an unexpected attribute was sent"}
    } else if (req.accepts('json') != 'json') {
        status = 406;
        error = {"Error": "Cannot send accepted media type"};
    } else if (!validNumber(req.body.code)) {
        status = 400;
        error = {"Error": "At least one of the attributes is an incorrect type"};
    }

    return {"status": status, "error": error}
};

module.exports = {
    validateAccountRequest,
    validateFlowRequest,
    validateFlowPut,
    isUnique
};