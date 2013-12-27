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
      templateUrl: '../_privacy-policy.html'
    }).
    when('/questions-and-suggestions', {
      templateUrl: '../_questions.html'
    }).
    when('/error', {
      templateUrl: '../_error.html'
    }).
    otherwise({
      redirectTo: '../_show-comments.html'
    });
  $locationProvider.html5Mode(true);
});

Bishenwall.directive("notice", function($rootScope) {
    return {
        restrict:"A",
        template:'<h3>{{outcome}}</h3>',
        scope: true,
        link: function ($scope, $element, $attrs) {
            $rootScope.$on('commentPosted', function(event){
                $scope.recentOutcome = true;
                $scope.outcome = "Comment Posted Successfully";
            });
            $rootScope.$on('removeNotification', function(event) {
                $scope.recentOutcome = false;
            });
        }
    }   // Root scope still doesn't produce the right results even though it runs through the full function.
})

Bishenwall.controller('mainCtrl', ['$http', '$scope', '$rootScope', '$timeout', '$location', function ($http, $scope, $rootScope, $timeout, $location) {
    function getComments() {
        $http.get('/getcomments').
            success(function (data, status) {
                $scope.comments = data;
            }).
            error(function (data, status) {
                $location.path('/error');
            });
    }; getComments(); // Self invoking function intentionally not used.
    $scope.state = { selected: null };
    $scope.createForm = function(comment) {
        $scope.state.selected = comment; 
    };
    $scope.showReplyForm = function(comment) {
        return $scope.state.selected === comment; 
    };
    $scope.hideReplyForm = function(comment) {
        $scope.state.selected = null;   
    };
    $scope.reply = {}; // Necessary for the function below.
    $scope.submitReply = function(comment) {
      var replyMessage = {
        "id": comment._id,
        "commentTitle": $scope.reply.replyTitle,
        "commentText": $scope.reply.replyText
      };
      $http.post('/comment', replyMessage).
        success(function () {
          $scope.state.selected = null; // Removes reply form.
          getComments(); //Unfortunately necessary. Because the replies are nested in an array within a comment object $scope.$watch wasn't seeing it.
          $rootScope.$broadcast('commentPosted');
          function removeNotification() {
            $rootScope.$broadcast('removeNotification');
          }
          $timeout(removeNotification, 4000);
        }). 
        error(function ( ) {
            $location.path('/error');
        });
    };
}]);
// Refactor notes: the object declaration is similar, the broadcast event can / should be the same. The error outcome is the same. 
// Main two differences are the object being sent and the redirect for comments. 
Bishenwall.controller('commentCtrl', ['$http', '$scope', '$rootScope', '$timeout', '$location', function ($http, $scope, $rootScope, $timeout, $location) {
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
        $rootScope.$broadcast('commentPosted');
        function removeNotification() {
          $rootScope.$broadcast('removeNotification');
        }
        $timeout(removeNotification, 7000);
        console.log("Hay!")
      }).
      error(function ( ) {
        $location.path('/error');
      });
  };
}]);

Bishenwall.controller('questionsCtrl', function ($scope) {

});