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
/*  This is nascent code for image upload.
Bishenwall.service('uploadService', function($http) {   
    var code = '';
    var fileName = '';
    this.uploadFile = function(files) {
        var fd = new FormData();
        //Take the first selected file
        fd.append("image", files[0]);
        var promise =  $http.post('/image', fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function(response) {
            code = response.data.code;
            fileName = response.data.fileName;
            return{
                code: function() {
                    return code;
                },
                fileName: function() {
                    return fileName;
                }
            }; 
        });
        return promise;
    };
});*/
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
                var reportedComment = { "id": comment._id }
                if (comment.reply) reportedComment.reply = false;
                else reportedComment.reply = true;
                $http.post('/spam', reportedComment).
                    success(function (data) {
                        $scope.setReported();
                    }).
                    error(function (data) {
                        $location.path('/error');
                    });
            }
            /*  dataReady listener
            *   This function takes the matchedIDs array processed in the controller and sets the reported state on the right buttons.
            */
            $scope.$on('dataReady', function (event, matchedIDs) {
                for (var i = 0; i < matchedIDs.length; i++) {
                    if(matchedIDs[i] === $attrs.id) {
                        $scope.setReported();
                    }
                }
            });
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