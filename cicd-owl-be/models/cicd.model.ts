import mongoose from 'mongoose';
// const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const CicdSchema = new Schema({
    itemName: String,
    status: String,
    cicdStages: [{stageName: String, remoteHost: String, command: String}],
    cicdStagesOutput: [{buildNumber: Number, startTime: String, endTime: String, status: String, cicdStageOutput: [{stageName: String, startTime: String, endTime: String, status: String, code: Number, logs:[]}]}]
}, {
    // http://mongoosejs.com/docs/guide.html#timestamps
    timestamps: true
});

const cicdData = mongoose.model('cicd', CicdSchema);

module.exports = {cicdData}