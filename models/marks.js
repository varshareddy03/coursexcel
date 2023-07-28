const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MarkSchema = new Schema({

    s_id: String,
    ass_id: String,
    sub_id: String,
    unit: String,
    marks: Number,
});

module.exports = mongoose.model('Mark',MarkSchema)