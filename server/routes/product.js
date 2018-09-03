const express = require('express');

const Category = require('../models/category');
const Product = require('../models/product');
const { validateToken } = require('../middlewares/auth');

/** REQUIRE THIS LAST OR IT WILL NOT LET YOU IMPORT OTHERS */
const _ = require = require('underscore');

const app = express();

/**
 * Get all product list
 */
app.get('/product', validateToken, (req, res) => {
    let pagination = {
        fromPage: Number(req.query.fromPage) || 0,
        fetch: Number(req.query.fetch) || 5
    }

    let filters = { status: true }
    Product.find(filters)
        .sort('name')
        .populate('category', 'description')
        .populate('user', 'name email')
        .skip(pagination.fromPage)
        .limit(pagination.fetch)
        .exec((err, productList) => {
            if (err) {
                return res.status(400).json({
                    ststus: false,
                    reason: err
                });
            };

            Product.countDocuments(filters, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        ststus: false,
                        reason: err
                    });
                };
                res.json({
                    status: true,
                    productList,
                    total: count
                });
            })

        })
});

/**
 * Get product by ID
 */
app.get('/product/:id', validateToken, (req, res) => {
    let id = req.params.id;

    Product.findById(id)
        .populate('category', 'description')
        .populate('user', 'name email')
        .exec((err, productDB) => {
            if (err) {
                return res.status(500).json({
                    ststus: false,
                    reason: err
                });
            };
            if (!productDB) {
                return res.status(400).json({
                    ststus: false,
                    reason: 'No product found'
                });
            };

            res.json({
                status: true,
                product: productDB
            });
        });
});

/**
 * Create product
 */
app.post('/product', validateToken, (req, res) => {
    let body = req.body;
    let user = req.user;

    // Get category by description
    let filters = { description: body.category }
    Category.findOne(filters)
        .exec((err, categoryDB) => {
            if (err) {
                return res.status(400).json({
                    ststus: false,
                    reason: err
                });
            };
            if (!categoryDB) {
                return res.status(400).json({
                    ststus: false,
                    reason: 'No Category found'
                });
            };

            let product = new Product({
                name: body.name,
                unitCost: body.unitCost,
                description: body.description,
                status: body.status,
                category: categoryDB,
                user: user
            });

            product.save((err, productDB) => {
                if (err) {
                    return res.status(500).json({
                        ststus: false,
                        reason: err
                    });
                };

                res.json({
                    status: true,
                    product: productDB
                });
            });
        });

});

/**
 * Update product by ID
 */
app.put('/product/:id', validateToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'unitCost', 'description', 'status', 'category']);

    // Get product by ID
    Product.findById(id, (err, productDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            });
        };

        if (!productDB) {
            return res.status(400).json({
                ststus: false,
                reason: `No product found by ID: ${id}`
            });
        };
        // Get category by description
        let filters = { description: body.category }
        Category.findOne(filters)
            .exec((err, categoryDB) => {
                if (err) {
                    return res.status(400).json({
                        ststus: false,
                        reason: err
                    });
                };
                if (!categoryDB) {
                    return res.status(400).json({
                        ststus: false,
                        reason: 'No Category found'
                    });
                };

                body.category = categoryDB;
                body.user = productDB.user;
                Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, updatedProductDB) => {
                    if (err) {
                        return res.status(400).json({
                            ststus: false,
                            reason: err
                        })
                    };

                    res.json({
                        status: true,
                        product: updatedProductDB
                    });
                });
            });
    });

});

/**
 * Delete product by ID (logic delete)
 */
app.delete('/product/:id', validateToken, (req, res) => {
    let id = req.params.id;
    // Logic delete
    Product.findByIdAndUpdate(id, { status: false }, { new: true }, (err, productDB) => {
        if (err) {
            return res.status(400).json({
                ststus: false,
                reason: err
            })
        };

        res.json({
            status: true,
            product: productDB
        });
    });
});

/**
 * Search Products
 */
app.get('/Product/search/:by', validateToken, (req, res) => {
    let by = req.params.by;
    let regex = new RegExp(by, 'i');

    Product.find({ name: regex })
        .populate('category', 'description')
        .exec((err, productList) => {
            if (err) {
                return res.status(400).json({
                    ststus: false,
                    reason: err
                })
            };

            res.json({
                status: true,
                productList
            });
        })
});

module.exports = app;