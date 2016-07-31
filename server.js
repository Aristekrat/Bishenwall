'use strict';
/***
 * Module dependencies.
 ***/

var express = require('express'),
    app = express(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    db = mongoose.connection,
    mongoStore = require('connect-mongo')(express),
    req = express.ServerRequest,
    index = require('./server/routes.js'),
    dbURL;

// Configuration

var port = process.env.PORT || 3000;

app.configure(function() {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(expressValidator());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    dbURL = 'mongodb://localhost/bishenwall';
    mongoose.connect(dbURL);
    //mongoose.set('debug', true);
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
});

app.configure('production', function() {
    var username = process.env.MONGO_USERNAME,
        password = process.env.MONGO_PASSWORD;
    dbURL = 'mongodb://' + username + ':' + password + '@ds053708.mlab.com:53708/heroku_app20090225';
    mongoose.connect(dbURL);
    app.use(express.errorHandler());
    app.use(express.static(__dirname + '/public', {
        maxAge: 9874567
    }));
});

// Routes

app.get('/getcomments', index.getcomments);
app.get('/getusers', index.getusers);
app.get('*', index.getDefault);

app.post('/comment', index.addComment);
app.post('/spam', index.reportSpam);

app.listen(port, function() {
    console.log("Express server listening on port 3000");
});