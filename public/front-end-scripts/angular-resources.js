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
    success(function(data, status) {
      $scope.comments = data;  
    }).
    error(function(data, status) {
      // Need to add proper error handling. 
    }); 
}]);  /* This function is successfully pushing data from mongo as JSON. Now I just need to use ng-repeat to make the comments on the show comments function. */ 

Bishenwall.controller('commentCtrl', function ($scope) {
  $scope.canSave = function() {
    return $scope.commentForm.$dirty && $scope.commentForm.$valid; 
  }
}); // Remove the form's action property and create an http.post outcome in this controller instead so we can do default processing. 

Bishenwall.controller('privacyCtrl', function ($scope) {

});

Bishenwall.controller('questionsCtrl', function ($scope) {

});