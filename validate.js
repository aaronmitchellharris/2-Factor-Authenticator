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

const validateRequest = async (req) => {
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

const validatePatch = async (req) => {

    let status = 200;
    let error = null;
    const attributes = ['name', 'type', 'length'];
    const attList = [];
    let validAttributes = true;

    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            attList.push(key)
            if (!attributes.includes(key)) {
                validAttributes = false;
            }
        }
    }

    if (req.get('Content-Type') != 'application/json') {
        status = 415;
        error = {"Error": "Received an unsupported media type"}
    } else if (req.accepts('json') != 'json') {
        status = 406;
        error = {"Error": "Cannot send accepted media type"};
    } else if (!validAttributes) {
        status = 400;
        error = {"Error": "The request object contains an unexpected attribute"}
    }

    if (attList.includes('name')) {
        const unique = await isUnique(req.body.name);
        if (!validString(req.body.name)) {
            status = 400;
            error = {"Error": "At least one of the attributes is an incorrect type"};
        } else if (!unique) {
            status = 403;
            error = {"Error": "A boat with that name already exists"};
        } else if (!validChar(req.body.name)) {
            status = 400;
            error = {"Error": "An attribute contains an invalid character"}
        } else if (!validStringLength(req.body.name)) {
            status = 400;
            error = {"Error": "An attribute's length is either too long or too short"}
        }
    }
    
    if (attList.includes('type')) {
        if (!validStringLength(req.body.type)) {
            status = 400;
            error = {"Error": "An attribute's length is either too long or too short"}
        } else if (!validString(req.body.type)) {
            status = 400;
            error = {"Error": "At least one of the attributes is an incorrect type"};
        } else if (!validChar(req.body.type)) {
            status = 400;
            error = {"Error": "An attribute contains an invalid character"}
        }
    }
    
    if (attList.includes('length')) {
        if (!validNumber(req.body.length)) {
            status = 400;
            error = {"Error": "At least one of the attributes is an incorrect type"};
        } else if (!validLength(req.body.length)) {
            status = 400;
            error = {"Error": "An attribute's value is too small or too large"}
        }
    }

    return {"status": status, "error": error}

};

module.exports = {
    validateRequest,
    validatePatch,
    isUnique
};