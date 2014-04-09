'use strict';

angular
    .module('spytowerApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'underscore'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('root', {
                url: '^/',
                templateUrl: 'partials/main.html'
            })
            .state('root.report', {
                url: '^/report/{id}',
                views: {
                    'viewContent': {
                        templateUrl: 'partials/report.html'
                    }
                }
            })
    });