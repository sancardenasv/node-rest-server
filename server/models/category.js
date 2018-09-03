const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categorySchema = new Schema({
    description: {
        type: String,
        unique: false,
        required: [true, 'Description is mandatory']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

categorySchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique in the DB'
})

module.exports = mongoose.model('Category', categorySchema);