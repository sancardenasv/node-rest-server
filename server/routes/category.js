const express = require('express');

const Category = require('../models/category');
const { validateToken, isUserAdmin } = require('../middlewares/auth');

/** REQUIRE THIS LAST OR IT WILL NOT LET YOU IMPORT OTHERS */
const _ = require = require('underscore');

const app = express();

/** 
 * List Categories
 */
app.get('/category', validateToken, (req, res) => {
    let pagination = {
        fromPage: Number(req.query.fromPage) || 0,
        fetch: Number(req.query.fetch) || 5
    }

    let filters = {}
    Category.find(filters)
        .sort('description')
        .populate('user', 'name email')
        .skip(pagination.fromPage)
        .limit(pagination.fetch)
        .exec((err, categoryList) => {
            if (err) {
                return res.status(400).json({
                    ststus: false,
                    reason: err
                });
            };

            Category.countDocuments(filters, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        ststus: false,
                        reason: err
                    });
                };
                res.json({
                    status: true,
                    categoryList,
                    total: count
                });
            })

        })
});

/**
 * Get Category by ID
 */
app.get('/category/:id', validateToken, function(req, res) {
    let id = req.params.id;

    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            });
        };

        res.json({
            status: true,
            category: categoryDB
        });
    });
});

/**
 * Create Category
 */
app.post('/category', [validateToken], function(req, res) {
    let body = req.body;
    let user = req.user;

    let category = new Category({
        description: body.description,
        user: user
    });

    category.save((err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ststus: false,
                reason: err
            });
        };

        res.json({
            status: true,
            category: categoryDB
        });
    });
});

/**
 * Update Category
 */
app.put('/category/:id', [validateToken, isUserAdmin], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['description']);

    let category = {
        description: body.description
    }
    Category.findByIdAndUpdate(id, category, { new: true, runValidators: true }, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        res.json({
            status: true,
            category: categoryDB
        });
    });
});

/** 
 * Delete Category
 */
app.delete('/category/:id', [validateToken, isUserAdmin], function(req, res) {
    let id = req.params.id;
    // Delete fron DB
    Category.findByIdAndRemove(id, (err, deletedCategory) => {
        if (err) {
            return res.status(500).json({
                ststus: false,
                reason: err
            })
        };

        if (!deletedCategory) {
            return res.status(400).json({
                ststus: false,
                reason: `Category with id ${id} does not exist`
            })
        };

        res.json({
            status: true,
            reason: `Category with id ${deletedCategory.id} succesfully deleted`
        });

    })

});

module.exports = app;