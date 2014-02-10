'use strict';

/*** Angular.js code ***/
// TO-DO - unclear if this code is minification safe.
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

/* Notice directive
*  1 - This directive gives the user a success notification after they post a comment or reply 
*/
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
Bishenwall.directive("spam", ['$http', '$location', function ($http, $location) {
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
            /*  gotReportedComments listener 
            *   1 - listen for the gotReportedComments even, when it arrives iterate through the reportedCommentsOnPage, passed with the event broadcast.
            *   2 - if the array value matches the attributes id, set Reported state on that comment on front end to discourage attempts at double spam reporting.
            */
            $scope.$on('gotReportedComments', function(event, reportedCommentsOnPage) {
                for (var i = 0; i < reportedCommentsOnPage.length; i++) {
                    if(reportedCommentsOnPage[i] === $attrs.id) {
                        $scope.setReported();
                    }
                }
            });
        }
    } 
}]);

Bishenwall.controller('mainCtrl', ['$http', '$scope', '$rootScope', '$timeout', '$location', function ($http, $scope, $rootScope, $timeout, $location) {
/*  $http.get comments
*   1 - This function makes the http request that populates the entire page. Most of the function's code performs ancillary operations after the Ajax request returns
*   Note - Initial attempt at long polling failed. Each new GET request smacked the UI in a disruptive manner.
*/  $http.get('/getcomments').
        success(function (data) {
            $scope.comments = data;
            /* timeout getUsers 
            *  1 - This one line of code initiates all of the code that gets the user and then disables the spam buttons on any previously reported comments.
            *  Note - Wrapped in timeout to throw it to the button of the event queue, so it doesn't block more important DOM rendering and I/O.
            */
            $timeout(getUsers, 0);
            /* gotUsers event listener 
            *  1 - Iterates through the user's previously reported comments. Then compares that value to the comments returned from the http.get.
            *  2 - If there is a match, create the matched array. Then broadcast the done event out, passing the array with it.
            *  Note - this function cannot easily be moved out of this block because it needs access to the data array returned by the get request. 
            */
            $scope.$on('gotUsers', function(event, reportedComments) {
                var reportedCommentsOnPage = [];
                for (var e = 0; e < reportedComments.length; e++) {
                    for (var i = 0; i < data.length; i++) {
                        if(reportedComments[e] === data[i]._id) {
                            reportedCommentsOnPage.push(reportedComments[e]);
                        } 
                    };
                };
                $scope.$broadcast('gotReportedComments', reportedCommentsOnPage);
            });
        }).
        error(function () {
            $location.path('/error');
        })  
    ;
    function getUsers() {
        $http.get('/getusers').
            success(function (data) {
                $scope.$broadcast('gotUsers', data);
            }
        );
    };
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

/*** jQuery / vanilla JS ***/

$(document).ready(function () {

$(".bwNeed").click(function (e) {
    e.preventDefault();
    $(".bwTheWall p").toggleClass("bwHide");
});

$(window).scroll(function () { 
   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 30) {
      //Add something at the end of the page
      alert("OMG! You at the bottom");
   }
});

});

