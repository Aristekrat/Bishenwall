var mongoose = require('../node_modules/mongoose'),
    db = mongoose.connection,
    dbURL = 'mongodb://localhost/bishenwall';

mongoose.connect(dbURL);
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = db; 

/*
The Model:
mongodb://<dbuser>:<dbpassword>@ds053168.mongolab.com:53168/donateware

The Prod Config (Inaccurate for BW):
    username = process.env.MONGO_USERNAME, 
    password = process.env.MONGO_PASSWORD, 
    dbURL = 'mongodb://' + username + ':' + password + '@ds053838.mongolab.com:53838/heroku_app17845741';
*/