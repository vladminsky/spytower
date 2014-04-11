'use strict';

angular
    .module('spytowerApp')
    .factory('d3', function () {

        var x = d3;
        delete window.d3;
        return x;

    });
