const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const app = express();

app.post('/login', (req, res) => {
    let body = req.body;
    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ststus: false,
                reason: err
            });
        };

        if (!userDB) {
            return res.status(400).json({
                ststus: false,
                reason: 'User or password invalid'
            });
        };

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ststus: false,
                reason: 'User or password invalid'
            });
        };

        let token = jwt.sign({
            user: userDB
        }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION_TIME })

        res.json({
            status: true,
            user: userDB,
            token
        });
    });
});


module.exports = app;