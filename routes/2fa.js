const express = require('express');
const model = require('../models');
const v = require('..validate');
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
                    "secret": data.secret,
                    "email": data.email,
                    "account_id": account_id
                };
                res.set('content-type', 'application/json');
                res.status(201).json(response);
            });
        }
    })
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
                    const code = otp.createAuth(account.secret, account.counter);

                    m.sendEmail(account.email, code);

                    account.counter += 1

                    model.update('Account', account.id, account).then(() => {

                        model.create('Flow', req.body).then(key => {
                            const flow_id = parseInt(key.id);
                            const response = {
                                "account_id": req.body.account_id,
                                "flow_id": flow_id,
                                "code": code
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
                }

                

            })
        }
    })
});



module.exports = router;