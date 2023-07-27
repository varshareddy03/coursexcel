const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({

    submi_id: String,
    s_id: String,
    ass_id: String,
    file: String,
    sub_id: String,
    unit: String,
    marks_obtained: Number,
    date_submitted : Date
});

module.exports = mongoose.model('Submission',SubmissionSchema)