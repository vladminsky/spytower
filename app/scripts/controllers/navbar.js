'use strict';

angular
    .module('spytowerApp')
    .controller('NavbarCtrl', function ($scope, $location, $stateParams) {

        $scope.menuItems = [
            {
                'title': $stateParams.id,
                'link': '/'
            }
        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    }
);