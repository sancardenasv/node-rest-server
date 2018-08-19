const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const { validateToken, isUserAdmin } = require('../middlewares/auth');

/** REQUIRE THIS LAST OR IT WILL NOT LET YOU IMPORT OTHERS */
const _ = require = require('underscore');

const app = express();

/** List Users */
app.get('/user', validateToken, (req, res) => {
    let pagination = {
        fromPage: Number(req.query.fromPage) || 0,
        fetch: Number(req.query.fetch) || 5
    }

    let filters = { status: true }
    User.find(filters, 'name email role status google img')
        .skip(pagination.fromPage)
        .limit(pagination.fetch)
        .exec((err, userList) => {
            if (err) {
                return res.status(400).json({
                    ststus: false,
                    reason: err
                })
            };

            User.count(filters, (err, count) => {
                res.json({
                    status: true,
                    userList,
                    total: count
                })
            })

        })
});

/** Create User */
app.post('/user', [validateToken, isUserAdmin], function(req, res) {
    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        res.json({
            status: true,
            user: userDB
        })
    });

});

/** Update User */
app.put('/user/:id', [validateToken, isUserAdmin], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'status']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        res.json({
            status: true,
            user: userDB
        });
    });
});

/** Delete User Logically */
app.delete('/user/:id', [validateToken, isUserAdmin], function(req, res) {
    let id = req.params.id;
    // Delete fron DB
    /*User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        if (!deletedUser) {
            return res.status(400).json({
                ststus: false,
                reason: `User with id ${id} does not exist`
            })
        };

        res.json({
            status: true,
            reason: `User with id ${deletedUser.id} succesfully deleted`
        })

    })*/

    // Logic delete
    User.findByIdAndUpdate(id, { status: false }, { new: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        res.json({
            status: true,
            user: userDB
        });
    });
});

module.exports = app;