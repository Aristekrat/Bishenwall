'use strict';

var Bishenwall = angular.module('Bishenwall', ['ngRoute']); 
Bishenwall.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '../_show-comments.html',
      controller: 'mainCtrl'
    }).
    when('/add-comment', {
      templateUrl: '../_comment-form.html',
      controller: 'commentCtrl'
    }).
    when('/privacy-policy', {
      templateUrl: '../_privacy-policy.html'
    }).
    when('/error', {
      templateUrl: '../_error.html'
    }).
    otherwise({
      redirectTo: '../_show-comments.html'
    });
  $locationProvider.html5Mode(true);
});

Bishenwall.factory('mainData', ['$http', function ($http) {
    return {
        getFirstPage: function () {
            return $http.get('/getcomments');
        },
        getNextPage: function () {

        }
    }
}]);

Bishenwall.factory('spamData', ['$http', function ($http) {
    return {
        getReportedComments: function() {
            return $http.get('/getusers').then(function (response) {
                return response;
            });
        }
    }
}]);

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
    $timeout(function () {
        spamData.getReportedComments().then(function (response) {
            dataWrapper.reportedComments = response.data;
            if(dataWrapper.reportedComments.length > 0) {
                dataWrapper.pageIDs = [];
                var matchedIDs = [];
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
                            matchedIDs.push(dataWrapper.reportedComments[o]);
                        }
                    }
                }
                $scope.$broadcast('dataReady', matchedIDs);
            }
        });
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

Bishenwall.directive("notice", [ '$timeout', function ($timeout) {
    return {
        restrict:"A",
        template:'<h3>{{outcome}}</h3>',
        scope: true,
        link: function ($scope, $element, $attrs) {
            $scope.$on('commentPosted', function(event){
                $scope.recentOutcome = true;
                $scope.outcome = "Comment Posted Successfully"; // Could be hardcoded, left this way for extensibility.
                $timeout(removeNotification, 4000);
            });
            function removeNotification () { $scope.recentOutcome = false; }
        }
    }
}]);

// Spam directive - sets the front end behavior for the spam button. Some additional behavior relevant to this directive located in the mainCtrl controller. 
Bishenwall.directive("spam", ['$http', '$location', '$timeout', 'spamData', function ($http, $location, $timeout, spamData) {
    return {
        restrict:"A",
        template: '{{buttonText}}',
        scope: true,
        link: function ($scope, $element, $attrs) {
            $scope.reported = false; // This variable disables the button after reporting
            $scope.buttonText = "Report Spam";
            //  setReported - this function disables the spam button, changes the button text to Reported, and adds the reported CSS class.
            $scope.setReported = function() {
                $element.addClass("bwSpamClicked");
                $scope.buttonText = "Reported";
                $scope.reported = true;
            }
            /*  ReportSpam 
            *   1 - Send comment id to backend, test whether the comment is a reply or parent comment and append boolean.
            *   2 - Send http post request and then set button state on front-end.
            */
            $scope.reportSpam = function(comment) {
                var payload = { "id": comment._id }
                if (comment.reply) payload.reply = false;
                else payload.reply = true;
                $http.post('/spam', payload).
                    success(function (data) {
                        $scope.setReported();
                    }).
                    error(function (data) {
                        $location.path('/error');
                    });
            }
            $scope.$on('dataReady', function (event, matchedIDs) {
                for (var i = 0; i < matchedIDs.length; i++) {
                    if(matchedIDs[i] === $attrs.id) {
                        $scope.setReported();
                    }
                }
            });
            /*
                        $scope.$on('gotReportedComments', function(event, reportedCommentsOnPage) {
                for (var i = 0; i < reportedCommentsOnPage.length; i++) {
                    if(reportedCommentsOnPage[i] === $attrs.id) {
                        $scope.setReported();
                    }
                }
            });
            */
        }
    } 
}]);
$(document).ready(function () {

$(".bwNeed").click(function (e) {
    e.preventDefault();
    $(".bwTheWall p").toggleClass("bwHide");
});
/*
$(window).scroll(function () { 
   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 30) {
      //Add something at the end of the page
      alert("OMG! You at the bottom");
   }
});
*/
});