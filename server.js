'use strict';
/***
 * Module dependencies.
***/

var express = require('express'),
    app = express(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    CommentModel = require('./public/schemas/commentSchema.js'),
    UserModel = require('./public/schemas/userSchema.js'),
    db = mongoose.connection,
    mongoStore = require('connect-mongo')(express),
    req = express.ServerRequest,
    dbURL;

// Configuration

var port = process.env.PORT || 3000;

app.configure(function () {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(expressValidator());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    dbURL = 'mongodb://localhost/bishenwall';
    mongoose.connect(dbURL);
    //mongoose.set('debug', true);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
});

app.configure('production', function () {
    var username = process.env.MONGO_USERNAME,
        password = process.env.MONGO_PASSWORD;
    dbURL = 'mongodb://' + username + ':' + password + '@ds053708.mongolab.com:53708/heroku_app20090225';
    mongoose.connect(dbURL);
    app.use(express.errorHandler());
    app.use(express.static(__dirname + '/public', { maxAge: 9874567}));
});

function getIP(req, res) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip;
}

/*** Utility functions for Development - DELETE IN PROD ***/

function blockingTest(testSize) {
    for(var i = 0; i < testSize; i++) {
        console.log(i);
    }
}

function generateDummyData(model, newEntries) {
    for(var i = 1; i < newEntries; i++) {
        var dummyComment = new model({
            'title': i,
            'text': i
        });
        dummyComment.save();
    }
};
//generateDummyData(CommentModel, 1000);

// Routes

app.get('/getcomments', function (req, res) {
    CommentModel.find({}, null, { limit: 50, sort: {date: -1} }, function (err, CommentModel) { 
        if (err) {
            res.send(err);
        } else {
            res.json(CommentModel);
        }
    });
    // Need to write functionality that pops the next 50 when scrolled to the bottom. 
});

app.get('/getusers', function (req ,res) {
    var user = getIP(req, res),
        newUser = new UserModel({
            'IP': user
        });
    UserModel.findOne({ "IP" : user }, (function (err, user) {
        if (err) {
            res.send(err);
        } 
        else if(user) {
            res.send(user.reportedComments);
        } 
        else {
            newUser.save(function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send('success');
            }}); // TO-DO: In need of siginficant refactoring.
        }
    }));
});

app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
}); // Routes are executed in the order they are defined, so the /getcomments route overrides this catch-all. 

function validator(req, res) {
    var errors = req.validationErrors();
    req.checkBody('commentTitle').notEmpty(); // A commanding majority of node-validator examples used only one line per check. Thus, I used the same method to be safe.
    req.checkBody('commentText').notEmpty();
    req.sanitize('commentTitle').escape();
    req.sanitize('commentText').escape();
    return errors; 
}

app.post('/comment', function (req, res) {
    var errors = validator(req, res),
        commentID = req.body.id, //This variable is only necessary in a reply. Thus, I used it in the code below to test whether I'm dealing with a new comment or a reply to a comment.
        newComment = new CommentModel({
            'title': req.body.commentTitle,
            'text': req.body.commentText,
        });    
    if(!errors && !commentID) {
        newComment.save(function (err) {
            if (err) {
                res.send(err);
            } else { 
                res.send('success');
            }   // The res.send data is currently not used by the front-end code, but available if necessary.
        });
    } else if(!errors && commentID) {
        CommentModel.findByIdAndUpdate(commentID, { '$push': { 'reply': newComment }
            }, function (err, doc) {
                if (err) {
                    res.send(err);
                } else {
                    var lastReply = doc.reply.pop();
                    res.send(lastReply);
                }
            }
        );
    } else {
        res.redirect('/error');
    }
});

//The damn object custom Indexof function 
function arrayObjectIndexOf(myArray, property, searchTerm) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] >= searchTerm) return i;
    }
    return -1;
}
//arrayObjectIndexOf(arr, "stevie", "hello"); // 1



// Ugly as hell, but functional. Obviously in need of attention during the refactor stage. 
app.post('/spam', function (req, res) {
    var commentID = req.body.id,
        userIP = getIP(req, res),
        userIPQuery = { "IP" : userIP },
        replyID = {"reply._id": commentID};
    UserModel.findOne(userIPQuery, function (err, user) {
        if (user) {
            var commentPresence = user.reportedComments.indexOf(commentID),
                id = user._id;
            if (req.body.reply === false && commentPresence === -1) {
                CommentModel.findByIdAndUpdate(commentID, { '$inc': { 'spamCount': 1 }}, 
                    function (err, doc) { 
                        if (err) {
                            res.send(err);
                        }
                        else if(doc.spamCount >= 5) { // This integer sets how many spam votes get a comment removed.
                            CommentModel.update({ _id: doc.id }, { $set: { text: 'Die, foul spam.', title: 'Spam Deleted' }}).exec();
                            // There are not easy ways to operate on a document without first querying it. Definitely needs to be optimized. 
                        }
                    }
                );
                UserModel.findByIdAndUpdate(id, { '$push': { 'reportedComments': commentID }},  // Difficult to refactor due to the user of user id variable. Need to fix / rewrite.
                    function (err) {
                        if (err) {
                            res.send(err);
                        } 
                        else {
                            res.send("Accept spam report");
                        }
                    }
                );
            }
            else if (req.body.reply === true && commentPresence === -1) {
                CommentModel.findOneAndUpdate(replyID, { '$inc': { "reply.$.spamCount": 1 }}, 
                    function (err, doc) {
                        var replyIndex = arrayObjectIndexOf(doc.reply, "spamCount", 5)
                        if (err) {
                            res.send(err);
                        }
                        else if(replyIndex !== -1) {
                            var correctReply = doc.reply[replyIndex];
                            CommentModel.findOneAndUpdate({ "reply._id": correctReply.id }, { '$set': { "reply.$.text": 'Die, foul spam.', "reply.$.title": 'Spam Deleted' }}).exec();
                        }
                    }
                );
                UserModel.findByIdAndUpdate(id, { '$push': { 'reportedComments': commentID }}, 
                    function (err) {
                        if (err) {
                            res.send(err); // Need far better responses.
                        } 
                        else {
                            res.send("Accept spam report");
                        }
                    }
                ); 
            }
            else {
                res.send("Reject spam report"); 
            }
        }
        else {
            res.send(err);
        }
    });
});

app.listen(port, function () {
    console.log("Express server listening on port 3000");
});