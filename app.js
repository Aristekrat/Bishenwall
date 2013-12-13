
/***
 * Module dependencies.
***/

var express = require('express'), 
    app = express(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    commentModel = require('./public/schemas/comments.js'),
    req = express.ServerRequest, 
    mongo = require('./config/mongo_config.js');

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

app.post('/', function (req, res) {
  var newComment = new commentModel({
    title: req.body.comment.title,
    text: req.body.comment.text
  });
  req.checkBody('comment.title', 'Title required', 'comment.text', 'Comment required').notEmpty();
  req.sanitize('comment').xss(); 
    newComment.save(function (err) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else { 
        res.redirect('/');
      }
    });
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