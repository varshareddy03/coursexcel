const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({

    s_id: String,
    name: String,
    email: String,
    password: String,
    class_id: String,
});

module.exports = mongoose.model('Student',StudentSchema)