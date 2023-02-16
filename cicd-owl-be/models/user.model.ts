import mongoose from 'mongoose';
// const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: String,
    userPass: String,
    isAdmin: Boolean,
    role: String
}, {
    // http://mongoosejs.com/docs/guide.html#timestamps
    timestamps: true
});

const userData = mongoose.model('user', UserSchema);

module.exports = {userData}