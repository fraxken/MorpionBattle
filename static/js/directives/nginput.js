(function() {
    var form = angular.module("ngForm",['ngAnimate']);

    form.directive('equals', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elem, attrs, ngModel) {
                if (!ngModel) return;

                scope.$watch(attrs.ngModel, function () {
                    validate();
                });

                attrs.$observe('equals', function (val) {
                    validate();
                });

                var validate = function () {
                    var val1 = ngModel.$viewValue;
                    var val2 = attrs.equals;
                    ngModel.$setValidity('equals', !val1 || !val2 || val1 === val2);
                };
            }
        };
    });

    form.directive('removeValidation', function(){
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ngModel) {
                ngModel.$validators["password"] = function () {
                    return true;
                };
            }
        }
    });

    form.directive("nginput", function($compile){
        return {
            require: "ngModel",
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                name: '@',
                form: "=",
                placeholder: '@',
                type: '@',
                max: '@',
                min: '@'
            },
            templateUrl: "/static/js/templates/nginput.html",
            controller: function($scope) {
                $scope.type = $scope.type || 'text';
                $scope.focus = false;
                $scope.has_label = false;

                $scope.focusIn = function() {
                    $scope.focus = true;
                    $scope.has_label = true;
                }

                $scope.focusOut = function() {
                    if($scope.value == '' || $scope.value == undefined) {
                        $scope.has_label = false;
                    }
                    $scope.focus = false;
                }
            },
            link: function(scope, element, attrs, ngModel){
                if (!ngModel) return;
                scope.count = "0";

                scope.onChange = function(){
                    scope.count = scope.value.length;
                    ngModel.$setViewValue(scope.value);
                };

                ngModel.$render = function(){
                    scope.value = ngModel.$modelValue;
                };

            }
        };
    });
})();
