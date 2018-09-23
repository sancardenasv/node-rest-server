const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:type/:id', function(req, res) {
    let type = req.params.type;
    let id = req.params.id;
    /** File exist */
    if (!req.files) {
        return res.status(400).json({
            ststus: false,
            reason: 'No files were uploaded.'
        });
    }
    /** Valid types */
    let validTypes = ['products', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ststus: false,
            reason: `Invalid type '${type}' selected; allowed types: ${validTypes.join(', ')}`
        });
    }

    let uploadedFile = req.files.file;
    let fileNameValues = uploadedFile.name.split('.');
    let fileExtention = fileNameValues[fileNameValues.length - 1];
    /** Allowed file types */
    let validExtentions = ['png', 'jpg', 'gif', 'jpeg'];
    if (validExtentions.indexOf(fileExtention) < 0) {
        return res.status(400).json({
            ststus: false,
            reason: `File with extention '${fileExtention}' is not allowed; allowed extentions: ${validExtentions.join(', ')}`
        });
    }

    /** Save file and maque filename uniq */
    let newFileName = `${id}-${new Date().getMilliseconds()}.${fileExtention}`;
    uploadedFile.mv(`uploads/${type}/${newFileName}`, (err) => {
        if (err) {
            return res.status(500).json({
                ststus: false,
                reason: err
            })
        }
        /** Save image in DB based on type */
        if (type === 'users') {
            saveUserImage(id, res, newFileName);
        } else {
            saveProductImage(id, res, newFileName);
        }
    });
});

function saveUserImage(userId, res, fileName) {
    User.findById(userId, (err, userDB) => {
        if (err) {
            deleteFile(fileName, 'users');
            return res.status(500).json({
                ststus: false,
                reason: err
            })
        }
        if (!userDB) {
            deleteFile(fileName, 'users');
            return res.status(500).json({
                ststus: false,
                reason: `User with ID ${userId} does not exist`
            })
        }
        // Delete old file
        deleteFile(userDB.img, 'users');

        userDB.img = fileName;
        userDB.save((err, savedUser) => {
            if (err) {
                deleteFile(fileName, 'users');
                return res.status(500).json({
                    ststus: false,
                    reason: err
                })
            }
            res.json({
                ststus: true,
                savedUser,
                imageSaved: fileName
            })
        })
    });
}

function saveProductImage(productId, res, fileName) {
    Product.findById(productId, (err, productDB) => {
        if (err) {
            deleteFile(fileName, 'products');
            return res.status(500).json({
                ststus: false,
                reason: err
            })
        }
        if (!productDB) {
            deleteFile(fileName, 'products');
            return res.status(500).json({
                ststus: false,
                reason: `Product with ID ${productId} does not exist`
            })
        }
        // Delete old file
        deleteFile(productDB.img, 'products');

        productDB.img = fileName;
        productDB.save((err, savedProduct) => {
            if (err) {
                deleteFile(fileName, 'products');
                return res.status(500).json({
                    ststus: false,
                    reason: err
                })
            }
            res.json({
                ststus: true,
                savedProduct,
                imageSaved: fileName
            })
        })
    });
}

function deleteFile(imageName, type) {
    let imagePath = path.resolve(__dirname, `../../uploads/${type}/${imageName}`);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}

module.exports = app;