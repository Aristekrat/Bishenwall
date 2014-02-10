describe("mainCtrl test suite", function () {
    var $scope, $rootScope, createController;
    beforeEach(module('Bishenwall'));
    beforeEach(inject(function($injector, $controller, $rootScope) {
        $scope = $rootScope.$new();
        (createController = function() {
            return $controller('mainCtrl', {
                $scope: $scope
            });
        })();
    })); 

    it('should have variable text = "Hello World!"', function() {
        expect($scope.text).toBe('Hello World!');
    });
})

describe("HelloWorld", function() {
    it("should pass equal numbers", function() {
        expect(1).toEqual(1);
    });
})

// TO-DO: Both pass, need to move on to actual testing after this. 
// //$scope.text = 'Hello World!';  Used for testing of the test suite. Not currently necessary. Formerly in mainCtrl