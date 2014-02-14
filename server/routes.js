'use strict';

var CommentModel = require('./schemas/commentSchema.js'),
    UserModel = require('./schemas/userSchema.js'),
    utility = require('./utility.js');

exports.getcomments = function (req, res) {
    CommentModel.find({}, null, { limit: 50, sort: {date: -1} }, function (err, CommentModel) { 
        if (err) {
            res.send(err);
        } else {
            res.json(CommentModel);
        }
    });
    // Need to write functionality that pops the next 50 when scrolled to the bottom. 
};

exports.getusers = function (req, res) {
    var user = utility.getIP(req, res),
        userQuery = { 'IP': user },
        newUser; 
    UserModel.findOne(userQuery, (function (err, user) {
        if (err) {
            res.send(err);
        } 
        else if (user) {
            res.send(user.reportedComments);
        } 
        else {
            newUser = new UserModel(userQuery);
            newUser.save();
        }
    }));
}

exports.getDefault = function (req, res) {
    res.sendfile('./public/index.html');
}

exports.addComment = function (req, res) {
    var errors = utility.validator(req, res),
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
    } 
    else if(!errors && commentID) {
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
    } 
    else {
        res.redirect('/error');
    }
}

exports.reportSpam = function (req, res) {
    var commentID = req.body.id,
        userIP = utility.getIP(req, res),
        userIPQuery = { "IP" : userIP },
        replyID = {"reply._id": commentID},
        updateUserSpamReport = function (userID, reportedComment) {
            UserModel.findByIdAndUpdate(userID, { '$push': { 'reportedComments': reportedComment }},
                function (err) {
                    if (err) {
                        res.send(err);
                    } 
                    else {
                        res.send("Accept spam report");
                    }
                }
            );
        };
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
                            CommentModel.update({ _id: doc.id }, { $set: { text: 'Die, foul spam.', title: 'Spam Deleted' }}).exec(); // There are not easy ways to operate on a document without first querying it. Definitely needs to be optimized. 
                        }
                    }
                );
                updateUserSpamReport(id, commentID);
            }
            else if (req.body.reply === true && commentPresence === -1) {
                CommentModel.findOneAndUpdate(replyID, { '$inc': { "reply.$.spamCount": 1 }},
                    function (err, doc) {
                        var replyIndex = utility.objectIndexOf(doc.reply, "spamCount", 5)
                        if (err) {
                            res.send(err);
                        }
                        else if(replyIndex !== -1) {
                            var correctReply = doc.reply[replyIndex];
                            CommentModel.findOneAndUpdate({ "reply._id": correctReply.id }, { '$set': { "reply.$.text": 'Die, foul spam.', "reply.$.title": 'Spam Deleted' }}).exec();
                        }
                    }
                );
                updateUserSpamReport(id, commentID);
            }
            else {
                res.send("Reject spam report"); 
            }
        }
        else {
            res.send(err);
        }
    });
}