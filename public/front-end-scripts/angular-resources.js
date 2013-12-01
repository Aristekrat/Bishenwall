'use strict';

angular.module('Bishenwall', []) // Normally you would put your controllers, filters, services, and directives here
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '../_show-comments.html',
        controller: 'mainCtrl'
      }). // Most of the templates are bullshit. TO-DO: write the templates. 
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
        redirectTo: '../s_how-comments.html'
      });
      $locationProvider.html5Mode(true);
  });

Bishenwall.controller('mainCtrl', function ($scope) {

});

Bishenwall.controller('commentCtrl', function ($scope) {

});

Bishenwall.controller('privacyCtrl', function ($scope) {

});

Bishenwall.controller('questionsCtrl', function ($scope) {

});