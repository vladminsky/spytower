'use strict';

angular
    .module('spytowerApp')
    .controller(
        'NavbarCtrl',
        [
            '$scope',
            '$location',
            function ($scope, $location) {
                $scope.menuItems = [
                    {
                        'title': 'Reports',
                        'link': '/'
                    }
                ];

                $scope.isActive = function (route) {
                    return route === $location.path();
                };
            }
        ]
    );