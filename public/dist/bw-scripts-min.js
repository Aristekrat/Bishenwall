/*! DonateWare 10-02-2014 */
"use strict";var Bishenwall=angular.module("Bishenwall",["ngRoute"]);Bishenwall.config(function($routeProvider,$locationProvider){$routeProvider.when("/",{templateUrl:"../_show-comments.html",controller:"mainCtrl"}).when("/add-comment",{templateUrl:"../_comment-form.html",controller:"commentCtrl"}).when("/privacy-policy",{templateUrl:"../_privacy-policy.html"}).when("/error",{templateUrl:"../_error.html"}).otherwise({redirectTo:"../_show-comments.html"}),$locationProvider.html5Mode(!0)}),Bishenwall.factory("mainData",["$http",function($http){return{getFirstPage:function(){return $http.get("/getcomments")},getNextPage:function(){}}}]),Bishenwall.factory("spamData",["$http",function($http){return{getReportedComments:function(){return $http.get("/getusers").then(function(response){return response})}}}]),Bishenwall.controller("mainCtrl",["$http","$scope","$timeout","$location","mainData","spamData",function($http,$scope,$timeout,$location,mainData,spamData){var dataWrapper={};mainData.getFirstPage().success(function(response){$scope.comments=response,dataWrapper.comments=response}).error(function(){$location.path("/error")}),$timeout(function(){spamData.getReportedComments().then(function(response){if(dataWrapper.reportedComments=response.data,dataWrapper.reportedComments.length>0){dataWrapper.pageIDs=[];for(var matchedIDs=[],i=0;i<dataWrapper.comments.length;i++)if(dataWrapper.pageIDs.push(dataWrapper.comments[i]._id),dataWrapper.comments[i].reply.length>0)for(var e=0;e<dataWrapper.comments[i].reply.length;e++)dataWrapper.pageIDs.push(dataWrapper.comments[i].reply[e]._id);for(var o=0;o<dataWrapper.reportedComments.length;o++)for(var a=0,idLength=dataWrapper.pageIDs.length;idLength>a;a++)dataWrapper.reportedComments[o]===dataWrapper.pageIDs[a]&&matchedIDs.push(dataWrapper.reportedComments[o]);$scope.$broadcast("dataReady",matchedIDs)}})},25),$scope.commentData=dataWrapper,$scope.state={selected:null},$scope.createForm=function(comment){$scope.state.selected=comment},$scope.showReplyForm=function(comment){return $scope.state.selected===comment},$scope.hideReplyForm=function(){$scope.state.selected=null},$scope.reply={},$scope.submitReply=function(comment){var replyMessage={id:comment._id,commentTitle:$scope.reply.replyTitle,commentText:$scope.reply.replyText};$http.post("/comment",replyMessage).success(function(data){comment.reply.push(data),$scope.reply={},$scope.hideReplyForm(),$scope.$broadcast("commentPosted")}).error(function(){$location.path("/error")})}}]),Bishenwall.controller("commentCtrl",["$http","$scope","$location",function($http,$scope,$location){$scope.canSave=function(){return $scope.commentForm.$dirty&&$scope.commentForm.$valid},$scope.postComment=function(){var comment={commentTitle:$scope.comment.title,commentText:$scope.comment.text};$http.post("/comment",comment).success(function(){$location.path("/")}).error(function(){$location.path("/error")})}}]),Bishenwall.directive("notice",["$timeout",function($timeout){return{restrict:"A",template:"<h3>{{outcome}}</h3>",scope:!0,link:function($scope){function removeNotification(){$scope.recentOutcome=!1}$scope.$on("commentPosted",function(){$scope.recentOutcome=!0,$scope.outcome="Comment Posted Successfully",$timeout(removeNotification,4e3)})}}}]),Bishenwall.directive("spam",["$http","$location","$timeout","spamData",function($http,$location){return{restrict:"A",template:"{{buttonText}}",scope:!0,link:function($scope,$element,$attrs){$scope.reported=!1,$scope.buttonText="Report Spam",$scope.setReported=function(){$element.addClass("bwSpamClicked"),$scope.buttonText="Reported",$scope.reported=!0},$scope.reportSpam=function(comment){var payload={id:comment._id};payload.reply=comment.reply?!1:!0,$http.post("/spam",payload).success(function(){$scope.setReported()}).error(function(){$location.path("/error")})},$scope.$on("dataReady",function(event,matchedIDs){for(var i=0;i<matchedIDs.length;i++)matchedIDs[i]===$attrs.id&&$scope.setReported()})}}}]),$(document).ready(function(){$(".bwNeed").click(function(e){e.preventDefault(),$(".bwTheWall p").toggleClass("bwHide")})});