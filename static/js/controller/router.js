(function() {
    var router = angular.module('Router',['ngRoute']);

    router.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var cb = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    cb();
                });
            }
            return original.apply($location, [path]);
        };
    }]);

    router.config(function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'main/authentification'
        })
        .when('/logout', {
            templateUrl: 'authentification/logout',
        })
        .otherwise({
            redirectTo: '/'
        });
    });

})();
