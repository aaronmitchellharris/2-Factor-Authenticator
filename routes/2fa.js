const express = require('express');
const model = require('../models');
const v = require('..validate');
const otp = require('../otp');

const router = express.Router();

router.post('/', (req, res) => {

    v.validateRequest(req).then(validate => {
        
        if (validate.status != 200) {
            res.status(validate.status).send(validate.error);
        } else {

            const data = {
                "secret": otp.createSecret(),
                "email": req.body.email,
                "counter": 0
            }

            model.create('Account', data).then(() => {
                const response = {
                    "secret": data.secret,
                    "email": data.email
                };
                res.set('content-type', 'application/json');
                res.status(201).json(response);
            });
        }
    })
});

router.post('/flow', (req, res) => {

    model.create('Flow', req.body).then(key => {
        const flow_id = parsInt(key.id);
        const response = {
            "flow_id": flow_id
        }

        res.status(201).json(response);
    });
});

module.exports = router;