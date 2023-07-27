const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({

    sub_id: String,
    name: String,
    t_id: String,
    class_id: String,
});

module.exports = mongoose.model('Subject',SubjectSchema)