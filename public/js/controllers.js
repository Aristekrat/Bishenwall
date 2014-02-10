
Bishenwall.controller('mainCtrl', ['$http', '$scope', '$timeout', '$location', 'mainData', 'spamData', function ($http, $scope, $timeout, $location, mainData, spamData) {
    var dataWrapper = {}
    mainData.getFirstPage()
        .success(function (response) {
            $scope.comments = response;
            dataWrapper.comments = response;
        })
        .error(function ( ) {
            $location.path('/error');
        }
    );
    spamData.getReportedComments().then(function (response) {
        dataWrapper.reportedComments = response.data;
    });
    $timeout(function() {
        if(dataWrapper.reportedComments.length > 0) {
            dataWrapper.pageIDs = [];
            dataWrapper.matchedIDs = [];
            for (var i = 0; i < dataWrapper.comments.length; i++) {
                dataWrapper.pageIDs.push(dataWrapper.comments[i]._id);
                if (dataWrapper.comments[i].reply.length > 0) {
                    for (var e = 0; e < dataWrapper.comments[i].reply.length; e++) {
                        dataWrapper.pageIDs.push(dataWrapper.comments[i].reply[e]._id);
                    }
                }
            }
            for (var o = 0; o < dataWrapper.reportedComments.length; o++) {
                for(var a = 0, idLength = dataWrapper.pageIDs.length; a < idLength; a++) {
                    if(dataWrapper.reportedComments[o] === dataWrapper.pageIDs[a]) {
                        dataWrapper.matchedIDs.push(dataWrapper.reportedComments[o]);
                    }
                }
            } 
        }
        $scope.$broadcast('dataReady')
    }, 50);
    $scope.commentData = dataWrapper;
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
      "commentText": $scope.comment.text
    }
    $http.post('/comment', comment).
      success(function () {
        $location.path('/');
      }).
      error(function ( ) {
        $location.path('/error');
      });
  };
}]);
