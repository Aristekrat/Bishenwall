'use strict'

module.exports = {  
    getIP: function (req, res) {
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        return ip;
    },
    objectIndexOf: function (myArray, property, searchTerm) {
        for(var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] >= searchTerm) return i;
        }
        return -1;
    },
    validator: function (req, res) {
        var errors = req.validationErrors();
        req.checkBody('commentTitle').notEmpty(); // A commanding majority of node-validator examples used only one line per check. Thus, I used the same method to be safe.
        req.checkBody('commentText').notEmpty();
        req.sanitize('commentTitle').escape();
        req.sanitize('commentText').escape();
        return errors; 
    },
    /*** Development Utility Functions ***/
    blockingTest: function (testSize) {
        for(var i = 0; i < testSize; i++) {
            console.log(i);
        }
    },  
    generateDummyData: function (model, newEntries) {
        for(var i = 1; i < newEntries; i++) {
            var dummyComment = new model({
                'title': i,
                'text': i
            });
            dummyComment.save();
        }
    }
}