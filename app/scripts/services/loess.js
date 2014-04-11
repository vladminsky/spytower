'use strict';

angular
    .module('spytowerApp')
    .factory('loess', function () {

        return function (xval, yval, bandwidth) {

            function tricube(x) {
                var tmp = 1 - x * x * x;
                return tmp * tmp * tmp;
            }

            var res = [];

            var left = 0;
            var right = Math.floor(bandwidth * xval.length) - 1;

            for (var i in xval) {
                var x = xval[i];

                if (i > 0) {
                    if (right < xval.length - 1 &&
                        xval[right + 1] - xval[i] < xval[i] - xval[left]) {
                        left++;
                        right++;
                    }
                }

                var edge;
                if (xval[i] - xval[left] > xval[right] - xval[i])
                    edge = left;
                else
                    edge = right;

                var denom = Math.abs(1.0 / (xval[edge] - x));

                var sumWeights = 0;
                var sumX = 0, sumXSquared = 0, sumY = 0, sumXY = 0;

                var k = left;
                while (k <= right) {
                    var xk = xval[k];
                    var yk = yval[k];
                    var dist;
                    if (k < i) {
                        dist = (x - xk);
                    } else {
                        dist = (xk - x);
                    }
                    var w = tricube(dist * denom);
                    var xkw = xk * w;
                    sumWeights += w;
                    sumX += xkw;
                    sumXSquared += xk * xkw;
                    sumY += yk * w;
                    sumXY += yk * xkw;
                    k++;
                }

                var meanX = sumX / sumWeights;
                var meanY = sumY / sumWeights;
                var meanXY = sumXY / sumWeights;
                var meanXSquared = sumXSquared / sumWeights;

                var beta;
                if (meanXSquared == meanX * meanX)
                    beta = 0;
                else
                    beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

                var alpha = meanY - beta * meanX;

                res[i] = beta * x + alpha;
            }

            return res;
        }

    });
