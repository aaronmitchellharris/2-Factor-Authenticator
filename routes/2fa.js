const express = require('express');
const model = require('../models');
const v = require('../validate');
const m = require('../mail');
const otp = require('../otp');

const router = express.Router();

router.post('/', (req, res) => {

    v.validateAccountRequest(req).then(validate => {
        
        if (validate.status != 200) {
            res.status(validate.status).send(validate.error);
        } else {

            const data = {
                "secret": otp.createSecret(),
                "email": req.body.email,
                "counter": 0
            }

            model.create('Account', data).then(key => {
                const account_id = parseInt(key.id)
                const response = {
                    "email": data.email,
                    "account_id": account_id
                };
                res.set('content-type', 'application/json');
                res.status(201).json(response);
            });
        }
    })
});

router.get('/:account_id', (req, res) => {

    const account_id = parseInt(req.params.account_id, 10);
    const accepts = req.accepts('json');

    if (accepts == false) {
        res.status(406).send({"Error": "Cannot send accepted media type"});
    } else {

        model.read('Account', account_id).then(account => {
            if (account == null) {
                res.status(404).send({"Error": "No account with this account_id exists"});
            } else {
                const response = {
                    "account_id": account_id,
                    "email": account.email
                };
                res.status(200).json(response);
            }
        })
    }
});

router.delete('/:account_id', (req, res) => {

    const account_id = parseInt(req.params.account_id, 10);

    model.read('Account', account_id).then(account => {

        if (account == null) {
            res.status(404).send({"Error": "No account with this account_id exists"});
        } else {
            model.delete('Account', account_id).then(() => {
                res.status(204).send();
            })
        }
    });
});

router.post('/flow', (req, res) => {

    v.validateFlowRequest(req).then(validate => {

        if (validate.status != 200) {
            res.status(validate.status).send(validate.error);
        } else {

            model.read('Account', req.body.account_id).then(account => {

                if (account == null) {
                    res.status(404).send({"Error": "No account with this account_id exists"})
                } else {
                    console.log('account: ', account)
                    console.log('creating code...')
                    const code = otp.createAuth(account.secret, account.counter);

                    req.body.code = code;

                    console.log('sending email...')
                    m.sendEmail(account.email, code)

                    account.counter += 1
                    console.log('req.body.account_id: ', req.body.account_id)
                    console.log('updating account...')
                    model.update('Account', req.body.account_id, account).then(() => {

                        console.log('creating flow...')
                        model.create('Flow', req.body).then(key => {
                            console.log('parsing flow_id...')
                            const flow_id = parseInt(key.id, 10);

                            console.log('constructing response...')
                            const response = {
                                "account_id": req.body.account_id,
                                "flow_id": flow_id
                            }
                            res.status(201).json(response);
                        });

                    })

                }

            });
 
        }
    })
});

router.put('/flow/:flow_id', (req, res) => {

    const flow_id = parseInt(req.params.flow_id, 10);

    v.validateFlowPut(req).then(validate => {
        if (validate.status != 200) {
            res.status(validate.status).send(validate.error)
        } else {

            model.read('Flow', flow_id).then(flow => {

                if (flow == null) {
                    res.status(404).send({"Error": "No flow with this flow_id exists"})
                } else {

                    const response = {
                        "flow_id": flow_id,
                        "account_id": flow.account_id,
                        "authenticated": false
                    };

                    if (req.body.code != flow.code) { 
                        res.status(200).json(response);
                    } else {
                        response.authenticated = true;

                        model.delete('Flow', flow_id).then(() => {

                            res.status(200).json(response);
                        })
                    }
                }

            })
        }
    })
});



module.exports = router;