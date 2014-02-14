Bishenwall.controller('mainCtrl', ['$http', '$scope', '$timeout', '$location', 'mainData', 'spamData', function ($http, $scope, $timeout, $location, mainData, spamData) {
    var dataWrapper = {}
    mainData.getFirstPage()
        .success(function (response) {
            $scope.comments = response;
            dataWrapper.comments = response;
            // This code initiates the code that lets the front end know if a comment has been reported. Placed in a timeout block because it isn't application critical.
            $timeout(function () {
                spamData.getReportedComments().then(function (response) {
                    dataWrapper.reportedComments = response.data;
                    if (dataWrapper.reportedComments.length > 0) {
                        $scope.findPageIDs(dataWrapper.comments);
                        $scope.findReportedCommentsOnPage(dataWrapper.pageIDs, dataWrapper.reportedComments);
                    }
                });
            }, 0);
        })
        .error(function ( ) {
            $location.path('/error');
        }
    );
    //  Report Spam Functions
    $scope.findPageIDs = function(testedArray) {
        dataWrapper.pageIDs = [];
        if(testedArray.length > 0) {
            for (var i = 0; i < testedArray.length; i++) {
                dataWrapper.pageIDs.push(testedArray[i]._id);
                if (testedArray[i].reply.length > 0) {
                    for (var e = 0; e < testedArray[i].reply.length; e++) {
                        dataWrapper.pageIDs.push(testedArray[i].reply[e]._id);
                    }
                }
            }
        }
    }
    $scope.findReportedCommentsOnPage = function(arrayOne, arrayTwo) {
        var matchedIDs = [];
        for (var i = 0, lFirst = arrayOne.length; i < lFirst; i++) {
            for(var e = 0, lSecond = arrayTwo.length; e < lSecond; e++) {
                if(arrayOne[i] === arrayTwo[e]) {
                    matchedIDs.push(arrayOne[i]);
                }
            }
        }
        $scope.$broadcast('dataReady', matchedIDs);
    } 
    // $scope.commentData = dataWrapper; re-enable this to make the commentData available to the directives. Not currently necessary.
    // Reply Form Mechanics
    $scope.state = { selected: null };
    $scope.createForm = function(comment) {
        $scope.state.selected = comment; 
    };
    $scope.showReplyForm = function(comment) {
        return $scope.state.selected === comment; 
    };
    $scope.hideReplyForm = function() {
        $scope.state.selected = null;   
    };
    // Reply Submission
    $scope.reply = {}; // Necessary for the function below.
    $scope.submitReply = function(comment) {
        var replyMessage = {
            "id": comment._id,
            "commentTitle": $scope.reply.replyTitle,
            "commentText": $scope.reply.replyText
        };
        $http.post('/comment', replyMessage).
            success(function (data) {
                comment.reply.push(data);
                $scope.reply = {}; // setPristine not cooperative with a repeated form, even when passing in form object.
                $scope.hideReplyForm();
                $scope.$broadcast('commentPosted');
            }). 
            error(function ( ) {
                $location.path('/error');
            });
    };
}]);

Bishenwall.controller('commentCtrl', ['$http', '$scope', '$location', function ($http, $scope, $location) {
    $scope.canSave = function () {
        return $scope.commentForm.$dirty && $scope.commentForm.$valid;
    };
    $scope.postComment = function() {
        var comment = {
            "commentTitle": $scope.comment.title,
            "commentText": $scope.comment.text,
        };
        $http.post('/comment', comment).
            success(function () {
                $location.path('/');
            }).
            error(function ( ) {
                $location.path('/error');
            });
        };
    /*$scope.uploadFile = function(files) {
        uploadService.uploadFile(files).then(function(promise){
            $scope.code = promise.code();
            $scope.fileName = promise.fileName();
        });
    }; Need to add uploadService back to the dependencies when I get around to this again */
}]);