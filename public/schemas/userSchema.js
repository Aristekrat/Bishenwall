var mongoose = require('../../node_modules/mongoose'),
    Schema = mongoose.Schema, 
    ObjectId = Schema.ObjectId; 

var userSchema = new mongoose.Schema({
    IP: {
        type: String,
        required: true
    },
    reportedComments: [{
        type: String
    }]
});

var userModel = mongoose.model('user', userSchema);
module.exports = userModel; 