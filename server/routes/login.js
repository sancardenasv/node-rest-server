const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Google config
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                status: false,
                reason: err
            })
        });

    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ststus: false,
                reason: err
            });
        };

        if (userDB) {
            if (!userDB.google) {
                return res.status(400).json({
                    status: false,
                    reason: 'User login must use username and password'
                });
            } else {
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION_TIME })

                res.json({
                    status: true,
                    user: userDB,
                    token
                });
            }
        } else {
            // TODO: User does not exist in DB
            let user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = '=)';

            user.save((err, userDB) => {
                if (err) {
                    return res.status(500).json({
                        ststus: false,
                        reason: err
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
        }
    });

});


module.exports = app;