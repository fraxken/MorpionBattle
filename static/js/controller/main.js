(function () {
    var APP = angular.module("morpionbattle", [
        'angular-loading-bar',
        'ngAnimate',
        'ngSocket',
        'ngForm',
        'Router',
        'authentification'
    ]);

    APP.value('user',{
        username: "fraxken",
        win: 50,
        loose: 10,
        elo: 0
    });

    APP.directive('head', ['$rootScope','$compile',function($rootScope, $compile){
        return {
            restrict: 'E',
            link: function(scope, elem){
                var html = '<link rel="stylesheet" ng-repeat="(routeCtrl, cssUrl) in routeStyles" ng-href="{{cssUrl}}" />';
                elem.append($compile(html)(scope));
                scope.routeStyles = {};
                $rootScope.$on('$routeChangeStart', function (e, next, current) {
                    if(current && current.$$route && current.$$route.css){
                        if(!angular.isArray(current.$$route.css)){
                            current.$$route.css = [current.$$route.css];
                        }
                        angular.forEach(current.$$route.css, function(sheet){
                            delete scope.routeStyles[sheet];
                        });
                    }
                    if(next && next.$$route && next.$$route.css){
                        if(!angular.isArray(next.$$route.css)){
                            next.$$route.css = [next.$$route.css];
                        }
                        angular.forEach(next.$$route.css, function(sheet){
                            scope.routeStyles[sheet] = sheet;
                        });
                    }
                });
            }
        };
    }]);

    APP.controller("layoutController",function($scope,$timeout,$location) {
        console.log("layoutController loaded!");

        $scope.popupOpen = false;
        $scope.popupTemplate = "popups/creategame";
        this.changePopup = function(name) {
            $scope.popupTemplate = "popups/"+name;
            $scope.popupOpen = true;
        }
        $scope.popupState = function(value) {
            if(value != undefined && typeof value != "boolean") return;
            $scope.popupOpen = value ? value : ($scope.popupOpen ? false : true);
        }
        $scope.getPopup = function() {
            return $scope.popupTemplate;
        }

    });

    APP.controller("lobby",function($scope,$location) {
        if($location.path() != "/lobby") $location.path("/lobby",false);
        $scope.logout = () => $location.path('logout',true);
    });

    APP.controller("game",function($scope,$location) {
        if($location.path() != "/game") $location.path("/game",false);
        $scope.leave = () => $location.path('leave',true);
    });

    APP.controller("serversList",function($scope,socket) {

        $scope.serversList = [];

        // Get serversList !
        socket.emit('getServers');

        socket.on('serversList',serversList => {
            if(serversList === "undefined") {

            }
            else {
                $scope.serversList = serversList;
            }
        });
    });

    APP.controller("Form_creategame",function($scope,$location,$http) {
        $scope.formData = {};
        $scope.submit = function() {
            $http.post('/creategame', {
                formData: $scope.formData
            }).success(function (data, status, headers, config) {
                console.log(data);
                if (data.errCode == 1) {
                    $location.path("game");
                }
                else {
                    //$scope.showFlash(data.errorMessage);
                }
            });
        }
    });

})();
