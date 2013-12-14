
/***
 * Module dependencies.
***/

var express = require('express'), 
    app = express(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    commentModel = require('./public/schemas/comments.js'),
    db = mongoose.connection,
    req = express.ServerRequest;
//    mongo = require('./config/mongo_config.js');

// Configuration

var port = process.env.PORT || 3000; 

app.configure(function(){
  app.use(express.compress()); 
  app.use(express.bodyParser());
  app.use(expressValidator());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(express.static(__dirname + '/public', { maxAge: oneDay}));
});

(function() {
    var dbURL;
    if(app.settings.env === "development") {
        var dbURL = 'mongodb://localhost/bishenwall';
    } else if(app.settings.env === "production") {
        var username = process.env.MONGO_USERNAME, 
            password = process.env.MONGO_PASSWORD, 
            dbURL = 'mongodb://' + username + ':' + password + '@ds053708.mongolab.com:53708/heroku_app20090225';
    }
    mongoose.connect(dbURL);
})();

// Routes

app.get('/getcomments', function(req, res) {
  commentModel.find(function(err, commentModel) { 
    if(err) { 
      return next(err); 
    } 
    res.json(commentModel); 
    });
});

app.get('*', function(req, res) {
    res.sendfile('./public/index.html');

}); // Routes are executed in the order they are defined, so the /getcomments route overrides the catch-all. 
 
// Database
/* IP Checking code, requires access to the req object 
    var ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
      console.log(ip);
*/

app.post('/', function (req, res) {
    req.checkBody('req.body.comment.title', 'Title Required', 'req.body.comment.text', 'Comment Required').notEmpty();
    var errors = req.validationErrors();
    if(!errors) {
        var newComment = new commentModel({
            title: req.body.comment.title,
            text: req.body.comment.text
        });
        req.sanitize('newComment').xss();
        newComment.save(function (err) {
            if (err) {
                console.log(err);
                res.redirect('/');
            } else { 
                res.redirect('/');
            }
        });
    } else {
        console.log("Err");
        res.redirect('/error');
    }
});

app.post('/reply', function (req, res) {
  var commentId = req.body.id;
  var updatedComment = commentModel.findById(commentId);
  commentModel.findByIdAndUpdate(commentId, { '$push': { 'reply': {
    'title': req.body.replyTitle,
    'text': req.body.replyText
  }}}, function (err, updatedComment) {
    if (err) {
      console.log(err)
    } else {
      //res.send(updatedComment);
      //console.log(updatedComment); // This successfully returns the comment + it's update. So I can res.send the comment back to the application. 
      res.redirect('/get-comments'); // TO DO: add proper applicaiton handling for this shit.
    }
  });
});

app.listen(port, function(){
  console.log("Express server listening on port 3000");
});