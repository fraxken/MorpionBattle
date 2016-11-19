(function () {
    var APP = angular.module("morpionbattle", [
        'angular-loading-bar',
        'ngAnimate',
        'ngSocket',
        'ngPopup',
        'ngForm',
        'Router',
        'popupsControllers',
        'authentification'
    ]);

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

    APP.controller("ControllerLayout",function($scope,$timeout,$location,popup) {
        console.log("layoutController loaded!");
        this.popup = popup;
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
        $scope.serverSelected = false;
        $scope.gameid = null;

        // Get serversList !
        socket.emit('getServers');

        socket.on('serversList',serversList => {
            if(serversList === "undefined") {

            }
            else {
                $scope.serversList = serversList;
            }
        });

        $scope.selectGame = function(gameId) {
            $scope.serverSelected = true;
            $scope.gameid = gameId;
            console.log(gameId);
        }

        $scope.joinGame = function() {
            if($scope.gameid) {
                console.log($scope.gameid);
                socket.emit('joinGame',{id: $scope.gameid});
            }
        }
    });

})();
