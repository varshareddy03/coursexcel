const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({

    post_id: String,
    name: String,
    file: String,
    sub_id: String,
    unit: String,
});

module.exports = mongoose.model('Post',PostSchema)