'use strict';

var Bishenwall = angular.module('Bishenwall', []);
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
      templateUrl: '../_privacy-policy.html',
      controller: 'privacyCtrl'
    }).
    when('/questions-and-suggestions', {
      templateUrl: '../_questions.html',
      controller: 'questionsCtrl'
    }).
    otherwise({
      redirectTo: '../_show-comments.html'
    });
  $locationProvider.html5Mode(true);
});

Bishenwall.controller('mainCtrl', ['$http', '$scope', function ($http, $scope) {
  $http.get('/getcomments').
    success(function (data, status) {
      $scope.comments = data;
    }).
    error(function (data, status) {
      // Need to add proper error handling. 
    });
    // This highly repetitive code ensures the reply form appears below just one comment. Currently necessary, I will need to refactor this later. 

    $scope.reply = {};
    $scope.state = { selected: null };
    $scope.createForm = function(comment) {
        $scope.state.selected = comment; 
    };
    $scope.showReplyForm = function(comment) {
        return $scope.state.selected === comment; 
    };
    $scope.submitReply = function(comment) {
      var replyMessage = {
        "id": comment._id,
        "replyTitle": $scope.reply.replyTitle,
        "replyText": $scope.reply.replyText
      };
      $http.post('/reply', replyMessage).
        success(function( ) {
          $scope.state.selected = null; // This instantly kills the reply form but otherwise doesn't give the use useful feedback.
        }); // Need to intelligently push the new comment to user's browser. That should be right up Angular's alley.
    }
    $scope.hideReplyForm = function(comment) {
        $scope.state.selected = null;   
    }
}]);

Bishenwall.controller('commentCtrl', function ($scope) {
  $scope.canSave = function () {
    return $scope.commentForm.$dirty && $scope.commentForm.$valid;
  };
});

Bishenwall.controller('privacyCtrl', function ($scope) {

});

Bishenwall.controller('questionsCtrl', function ($scope) {

});

/*
      for (var i = 0; i < data.length; i++) {
        if(data[i].reply.length !== 0) {
            var parentComment = i;
            var replyContainer = data[i].reply;
          }
      }
      $scope.replies = (data[parentComment].reply);
      //$scope.comments[parentComment] += replyContainer; This kills the correct comment, for what this is worth.
      console.log(parentComment); // returns the correct value.
      //$scope.replies = replyContainer;
*/