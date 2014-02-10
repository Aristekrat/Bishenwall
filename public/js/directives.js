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
            $timeout(function () {
                for (var i = 0; i < $scope.commentData.matchedIDs.length; i++) {
                    if($scope.commentData.matchedIDs[i] === $attrs.id) {
                        $scope.setReported();
                    }
                }
            }, 30);
        }
    } 
}]);