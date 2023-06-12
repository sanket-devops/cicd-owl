import mongoose from 'mongoose';
// const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const HostSchema = new Schema({
    hostName: String,
    hostAdd: String,
    hostPort: Number,
    hostUser: String,
    hostPass: String,
    hostPath: String,
    executors: Number,
    buildItems: [{cicdId: String, stageName: String, remoteHost: String, command: String}],
    currentBuilds: [{cicdId: String, stageName: String, remoteHost: String, command: String, cicdName: String}]
}, {
    // http://mongoosejs.com/docs/guide.html#timestamps
    timestamps: true
});

const hostData = mongoose.model('host', HostSchema);

module.exports = {hostData}