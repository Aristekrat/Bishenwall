var mongoose = require('../../node_modules/mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var commentSchema = new Schema({
    comment: ObjectId,
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    spamCount: {
        type: Number,
        default: 0
    },
    image: {
        type: Buffer
    },
    reply: String
});

var commentModel = mongoose.model('comment', commentSchema);
module.exports = commentModel;