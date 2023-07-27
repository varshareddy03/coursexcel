const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({

    t_id: String,
    name: String,
    email: String,
    password: String,
});

module.exports = mongoose.model('Teacher',TeacherSchema)