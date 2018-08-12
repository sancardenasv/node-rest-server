const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let roleList = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is nor a valid role'
};

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'The username is mandatory']
    },
    email: {
        type: String,
        required: [true, 'email is mandatory'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is mandatory']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: roleList
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

userSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique in the DB'
})

module.exports = mongoose.model('User', userSchema);