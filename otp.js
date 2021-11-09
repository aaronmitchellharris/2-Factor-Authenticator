const crypto = require('crypto')


// create new secret
const createSecret = () => {
    return crypto.randomBytes(20).toString('hex');
}

// create authentication code given a secret and counter
const createAuth = (secret, counter) => {
    const hash = crypto.createHmac('sha256', secret);
    hash.update(String(counter))
    let num = parseInt(hash.digest('hex'), 16) % 10**6
    while (String(num).length < 6) {
        num *= 10
    }
    return num
}

module.exports = {
    createSecret,
    createAuth
};