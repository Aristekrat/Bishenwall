'use strict';
/***
 * Module dependencies.
***/

var express = require('express'),
    app = express(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    CommentModel = require('./public/schemas/comments.js'),
    db = mongoose.connection,
    RedisStore = require('connect-redis')(express),
    req = express.ServerRequest;

// Configuration

var port = process.env.PORT || 3000;

app.configure(function () {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(expressValidator());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    /*app.use(express.cookieParser('ske1eta1CANNONS'));
    app.use(express.session({
        secret: 'ske1eta1CANNONS',
        store: new MongoStore({
            db: 'bishenwall',
            host: '127.0.0.1',
            port: 28017
        })
    }));*/
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/public'));
});

app.configure('production', function () {
    app.use(express.errorHandler());
    app.use(express.static(__dirname + '/public', { maxAge: 9874567}));
});

(function () {
    var dbURL;
    if (app.settings.env === "development") {
        dbURL = 'mongodb://localhost/bishenwall';
    } else if(app.settings.env === "production") {
        var username = process.env.MONGO_USERNAME,
            password = process.env.MONGO_PASSWORD;
        dbURL = 'mongodb://' + username + ':' + password + '@ds053708.mongolab.com:53708/heroku_app20090225';
    }
    mongoose.connect(dbURL);
})();

function getIP(req, res) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip;
}

// Routes

app.get('/getcomments', function (req, res) {
    CommentModel.find(function (err, CommentModel) { 
        if (err) { 
            return next(err); 
        } else {
            res.json(CommentModel);
        }});
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
        commentID = req.body.id, //This variable is only defined in a reply. Thus, I used it in the code below to test whether I'm dealing with a new comment or a reply to a comment.
        commentIP = getIP(req, res),
        newComment = new CommentModel({
            'title': req.body.commentTitle,
            'text': req.body.commentText,
            'ip': commentIP
        });    
    if(!errors && !commentID) {
        newComment.save(function (err) {
            if (err) {
                res.send(err);
            } else { 
                res.send('success');
            }   // Refactoring this repeated code unsuccessful on first attempts. When defined elsewhere, this function throws error: 'err undefined'.
        });     // The res.send data is currently not used by the front-end code, but available if necessary.
    } else if(!errors && commentID) {
        CommentModel.findByIdAndUpdate(commentID, { '$push': { 'reply': newComment }
            }, function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(req.body);
                }
            }
        );
    } else {
        res.redirect('/error');
    }
});

app.post('/spam', function (req, res) {
    var commentID = req.body.id,
        commentIP = getIP(req, res);
    CommentModel.findByIdAndUpdate(commentID, { '$inc': { 'spamCount': 1 }
        }, function () {
            res.send("done");
        }
    );
});

app.listen(port, function () {
    console.log("Express server listening on port 3000");
});