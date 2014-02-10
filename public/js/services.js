
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