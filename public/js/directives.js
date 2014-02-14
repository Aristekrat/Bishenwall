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