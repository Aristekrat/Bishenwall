var mongoose = require('../node_modules/mongoose'),
    db = mongoose.connection,
    dbURL = 'mongodb://localhost/bishenwall';

mongoose.connect(dbURL);
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = db;

/*  Prod Config    
    username = process.env.MONGO_USERNAME, 
    password = process.env.MONGO_PASSWORD, 
    dbURL = 'mongodb://' + username + ':' + password + '@ds053708.mongolab.com:53708/heroku_app20090225'; */   