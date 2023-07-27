const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({

    ass_id: String,
    name: String,
    sub_id: String,
    file: String,
    unit: String,
    marks: Number,
    date_posted : Date,
    date_submission : Date
});

module.exports = mongoose.model('Assignment',AssignmentSchema)