
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