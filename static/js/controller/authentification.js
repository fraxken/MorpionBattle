(function () {
    var Authentification = angular.module("authentification", [
        'ngAnimate',
        'ngSocket'
    ]);

    Authentification.controller("Auth_root",function($scope,$location) {
        if($location.path() != "/") {
            $location.path("",false);
        }
    });

    Authentification.controller("Auth_login",function($scope,$http,$location,$timeout) {
        $scope.formData = {};
        $scope.show = false;
        $scope.flashMsg = "";
        $scope.showFlash = (msg) => {
            $scope.show = true;
            $scope.flashMsg = msg;
            $timeout( _ => {
                $scope.show = false;
            },4500);
        }

        $scope.submit = function() {
            $http.post('/authentification/login', {
                formData: $scope.formData
            }).success(function (data, status, headers, config) {
                console.log(data);
                if (data.errCode == 1) {
                    $location.path("lobby");
                }
                else {
                    $scope.showFlash(data.errorMessage);
                }
            });
        }
    });
    Authentification.controller("Auth_register",function($scope,$http,$location,$timeout) {
        $scope.formData = {};
        $scope.show = false;
        $scope.flashMsg = "";
        $scope.showFlash = (msg) => {
            $scope.show = true;
            $scope.flashMsg = msg;
            $timeout( _ => {
                $scope.show = false;
            },4500);
        }

        $scope.submit = function() {
            $http.post('/authentification/register', {
                formData: $scope.formData
            }).success(function (data, status, headers, config) {
                console.log(data);
                if (data.errCode == 1) {
                    $location.path("lobby");
                }
                else {
                    $scope.showFlash(data.errorMessage);
                }
            });
        }
    });
})();
