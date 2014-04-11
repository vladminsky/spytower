'use strict';

angular
    .module('spytowerApp')
    .factory('reportView', function (_, jquery, d3/*, science*/, loess) {

        var $ = jquery;
        var loessFn = loess;

        var strategies = {

            bar: {
                draw: function (config) {

                    if ($('#tooltip').length === 0) {
                        $('body').append('<div id="tooltip" class="alert alert-info"></div>');
                    }

                    var $reportContent = config.element || $('#content');

                    var margin = {top: 15, right: 20, bottom: 50, left: 60};
                    var width = $reportContent.width() * 0.95 - margin.left - margin.right;
                    var height = $(document).height() * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('class', 'time-line')
                        .attr('width', width + margin.right + margin.left)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);

                }
            },



            lines: {

                draw: function (config) {

                    if ($('#tooltip').length === 0) {
                        $('body').append('<div id="tooltip" class="alert alert-info"></div>');
                    }

                    var $reportContent = config.element || $('#content');

                    var margin = {top: 15, right: 20, bottom: 50, left: 60};
                    var width = $reportContent.width() * 0.95 - margin.left - margin.right;
                    var height = $(document).height() * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;

                    var minDate = null;
                    var maxDate = null;
                    var maxYValue = 0;
                    var minYValue = -1;
                    var dates = [];
                    var values = [];
                    var minCount = -1;
                    var maxCount = 0;
                    var totals = {};

                    var data = config.data.map(function (series) {
                        series.values = series.values.map(function (d) {

                            var date = new Date(d[0]);

                            dates.push(date);

                            if (!minDate || date < minDate) {
                                minDate = date;
                            }

                            if (!maxDate || date > maxDate) {
                                maxDate = date;
                            }

                            var yValue = d[1];

                            if (yValue > maxYValue) {
                                maxYValue = yValue;
                            }

                            if (minYValue < 0 || yValue < minYValue) {
                                minYValue = yValue;
                            }

                            var count = d[2] || 0;

                            if (count > maxCount) {
                                maxCount = count;
                            }

                            if (minCount < 0 || count < minCount) {
                                minCount = count;
                            }

                            var v = {x: date, y: yValue, name: series.key, count: count, data: d };

                            if (!totals[series.key]) {
                                totals[series.key] = 0;
                            }

                            totals[series.key] += (count || 0);

                            values.push(v);
                            return v;
                        });

                        return series;
                    });

                    var x = d3.time.scale()
                        .domain([minDate || new Date(), maxDate || new Date()])
                        .rangeRound([ 0, width ]);

                    var y = d3.scale.linear()
                        .domain([0, maxYValue])
                        .range([ height, 0 ]);

                    var r = d3.scale.linear()
                        .domain([minCount, maxCount]).range([1, 8]);

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('class', 'time-line')
                        .attr('width', width + margin.right + margin.left)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);

                    var color = d3.scale.category10();
                    var seriesNames = _.pluck(data, 'key');
                    color.domain(seriesNames);


                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var leftYAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    main.append("g")
                        .attr("class", "y axis")
                        .call(leftYAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(config.yTitle || "Time (ms)");


                    main.append("g")
                        .attr("class", "x axis")
                        .attr('transform', 'translate(0,' + (height + 20) + ')')
                        .call(xAxis);


                    if (config.baselines && _.isArray(config.baselines.y)) {
                        _.each(config.baselines.y, function (baseline) {
                            var point = Math.round(y(baseline.value));

                            var level = (' ' + (baseline.level || ''));
                            main.append('svg:line')
                                .attr('class', 'baseline' + level)
                                .style("stroke-dasharray", ("15, 18"))// <== This line here!!
                                .attr("x1", -5)
                                .attr("y1", point)
                                .attr("x2", -5)
                                .attr("y2", point)
                                .transition()
                                .duration(1500)
                                .attr("x2", width + 20)
                            ;

                            main.append("svg:text")
                                .attr("x", width + 20)
                                .attr("class", "baseline-label" + level)
                                .attr("y", point - 10)
                                .attr("dy", ".35em")
                                .style("text-anchor", "end")
                                .text(baseline.label || '');
                        });
                    }

                    if (config.baselines && _.isArray(config.baselines.x)) {

                        var baseX = {};

                        _.each(config.baselines.x, function (baseline) {

                            var date = new Date(baseline.value);
                            date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                            if (baseX[date.getTime().toString()] || baseX[baseline.label]) {
                                return;
                            }

                            baseX[date.getTime().toString()] = true;
                            baseX[baseline.label] = true;

                            var point = Math.round(x(date));

                            var dateFormatString = config.dateFormat || "%d %b %Y";
                            var format = d3.time.format(dateFormatString);

                            main.append('svg:line')
                                .attr('class', 'x-baseline')
                                .attr("x1", point)
                                .attr("y1", 0)
                                .attr("x2", point)
                                .attr("y2", 0)
                                .on("mouseover", function() {
                                    d3.select("#tooltip")
                                        .style("top", (event.pageY - 65) + "px")
                                        .style("left", (event.pageX + 2) + "px")
                                        .style("display", "block")
                                        .html("<b>" + baseline.label + "</b><br/>" + format(date));

                                })
                                .on("mouseout", function() {
                                    d3.select("#tooltip").style("display", "none");
                                })
                                .transition()
                                .duration(1500)
                                .attr("y2", height + 20);
                        });
                    }

                    if (!config.hideLines) {
                        var line = d3.svg.line()
                            .interpolate('basis')
                            .y(function (d) {
                                return d[1];
                            })
                            .x(function (d) {
                                return d[0];
                            });

                        var category = main.selectAll(".category")
                            .data(data)
                            .enter().append("g")
                            .attr("class", "category");

                        category.append("path")
                            .attr("class", "line trend-lines-line")
                            .attr("d", function (d) {
                                var sortBy = _.sortBy(d.values, function (v) {
                                    return v.x;
                                });

                                var xD = [];
                                var yD = [];

                                _.each(sortBy, function(v, index) {

                                    if (!config.countLast && sortBy.length > 10 && index === sortBy.length - 1) {
                                        return;
                                    }

                                    xD.push(x(v.x));
                                    yD.push(y(v.y));
                                });

                                return line(d3.zip(xD, loessFn(xD, yD, 0.5)));
                            })
                            .style("stroke", function (d) {
                                return color(d.key);
                            });
                    }

                    var onScatterHover = function (d) {
                        if (!config.tooltip) {
                            return;
                        }

                        var template = _.template(config.tooltip);

                        var event = d3.event;

                        d3.select(event.target).attr('r', 10).classed("highlight", true);


                        var data = _.extend({}, d);
                        var dateFormatString = config.dateFormat || "%d %b %Y";
                        var format = d3.time.format(dateFormatString);

                        data.x = _.escape(format(d.x));
                        data.y = _.escape(d.y);

                        var html = template(data);

                        d3.select("#tooltip")
                            .style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px")
                            .style("display", "block")
                            .html(html);
                    };

                    var onScatterHoverEnd = function (d) {

                        d3.select(d3.event.target).attr('r', r(d.count)).classed("highlight", false);
                        d3.select("#tooltip")
                            .style("display", "none");
                    };

                    if (!config.hideBubbles) {
                        var bubbles = main.selectAll(".time-line-data-point")
                                .data(values)
                                .enter().append("circle")
                                .attr("class", "data-point")
                                .attr("class", "time-line-data-point")
                                .attr("r", function (d) {
                                    return r(d.count);
                                })
                                .on("mouseover", onScatterHover)
                                .on("mouseout", onScatterHoverEnd)
                                .style("stroke",function (d) {
                                    return color(d.name);
                                }).attr("cx", function (d) {
                                    return x(d.x);
                                })
                                .attr("cy", function (d) {
                                    return y(0);
                                })
                                .transition()
                                .attr("cy", function (d) {
                                    return y(d.y);
                                })
                            ;

                        if (config.fillBubbles) {
                            bubbles.style("fill",function (d) {
                                return color(d.name);
                            }).style("opacity",function (d) {
                                    return 0.7;
                                }).transition();
                        }
                    }

                    if (!config.hideLegend) {

                        var legend = main.selectAll(".legend")
                            .data(color.domain())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function (d, i) {
                                return "translate(0," + i * 20 + ")";
                            })
                            .on('click', function (d) {
                                var $el = this;
                                var group = d;
                                var legend = d3.select($el);

                                var isSwitchedOff = legend.classed('highlight');

                                legend.classed('highlight', !isSwitchedOff);
                                legend.style('opacity', !isSwitchedOff ? 0.2 : 1);

                                d3.selectAll('.category').filter(function (v) {
                                    return v.key == group;
                                }).style('opacity', !isSwitchedOff ? 0.05 : 1);

                                d3.selectAll('.time-line-data-point').filter(function (v) {
                                    return v.name == group;
                                }).style('opacity', !isSwitchedOff ? 0.05 : 1);
                            });


                        legend.append("circle")
                            .attr("cx", 40)
                            .attr("cy", 9)
                            .attr("r", 8)
                            .style("fill", color)
                            .style("stroke", color);

                        legend.append("text")
                            .attr("x", 52)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "right")
                            .text(function (d) {
                                return  config.hideTotalForLegend ? d : d + " (" + d3.format(",f")(totals[d]) + ")";
                            });
                    }

                }

            },



            plot: {

                draw: function (config) {
                    var R = 5;
                    config = config || {  data: { x: [], y: [] } };

                    var xdata = config.data.x,
                        ydata = config.data.y;


                    var $reportContent = config.element || $('#content');

                    var margin = {top: 15, right: 40, bottom: 50, left: 30}
                        , width = $reportContent.width() * 0.95 - margin.left - margin.right
                        , height = $(document).height() * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;

                    var x = d3.scale.linear()
                        .domain([0, d3.max(xdata)])
                        .range([ 0, width ]);

                    var y = d3.scale.linear()
                        .domain([0, d3.max(ydata)])
                        .range([ height, 0 ]);

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('width', width + margin.right + margin.left)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);

                    var getLabels = function (data) {
                        return [d3.max(data), d3.min(data)];
                    };

                    var getFormatLabelsFn = function (data) {
                        var labels = getLabels(data);

                        return function (markValue) {
                            return labels.indexOf(markValue) >= 0 ? markValue : '';
                        };
                    };

                    // draw the x axis
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickValues(xdata)
                        .tickSize(7)
                        .tickFormat(getFormatLabelsFn(xdata))
                        .orient('bottom');

                    main.append('g')
                        .attr('transform', 'translate(0,' + (height + 20) + ')')
                        .attr("class", "x axis")
                        .call(xAxis);


                    // draw the y axis
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .tickValues(ydata)
                        .tickSize(7)
                        .tickFormat(getFormatLabelsFn(ydata))
                        .orient('left');

                    main.append('g')
                        .attr('transform', 'translate(0, 0)')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    var dataPoints = main.append("svg:g");

                    var points = [];

                    var currentPoint = null;

                    var drawProjectionLabel = function (point, text) {

                        main.append('svg:rect').attr('class', 'projection')
                            .style("background-color", "white")
                            .attr('x', point[0] - 3)
                            .attr('y', point[1] - 12)
                            .attr('height', 15)
                            .attr('width', text.toString().length * 7.5 + 3);

                        main.append('svg:text').attr('class', 'projection')
                            .style("background-color", "white")
                            .attr('x', point[0])
                            .attr('y', point[1])
                            .text(text);
                    };


                    var highlightPointFn = function (point) {
                        if (currentPoint == point) {
                            return;
                        }

                        resetCurrentPointSelection();
                        currentPoint = point;
                        d3.select(point).attr('class', 'data-dot-selected');

                        var x = point.xValue;
                        var y = point.yValue;

                        drawProjectionLabel([3, y - 3], ydata[point.dataIndex]);
                        drawProjectionLabel([x + 3, height + 17], xdata[point.dataIndex]);
                    };


                    var resetCurrentPointSelection = function () {
                        if (currentPoint) {
                            d3.select(currentPoint).attr('class', 'data-dot');
                            currentPoint = null;
                            main.selectAll('.projection').remove();
                        }
                    };

                    dataPoints.selectAll("scatter-dots")
                        .data(ydata)
                        .enter().append("svg:circle")
                        .attr("cy", function (d, i) {
                            this.dataIndex = i;
                            var yValue = y(d);
                            this.yValue = parseFloat(yValue);
                            return yValue;
                        })
                        .attr("cx", function (d, i) {
                            var xValue = x(xdata[i]);
                            this.xValue = parseFloat(xValue);
                            points.push(this);
                            return xValue;
                        })
                        .attr("r", R)
                        .attr('class', 'data-dot');


                    d3.selectAll(points).on('mouseover',function () {
                        highlightPointFn(this);
                    }).on('mouseout', function () {
                            resetCurrentPointSelection();
                        });
                }
            },



            scatterplot: {

                draw: function (config) {

                    var $reportContent = config.element || $('#content');

                    var documentWidth = $reportContent.width();
                    var documentHeight = $(document).height();

                    var xData = config.data.x;
                    var yData = config.data.y;

                    if (documentHeight < yData.length * 20) {
                        documentHeight = yData.length * 20;
                    }


                    if (documentWidth < xData.length * 150) {
                        documentWidth = xData.length * 150;
                    }


                    var margin = {top: 15, right: 50, bottom: 50, left: 150}
                        , width = documentWidth * 0.95 - margin.left - margin.right
                        , height = documentHeight * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;


                    var x = d3.scale.linear()
                        .domain([0, xData.length])
                        .range([ 0, width ]);

                    var y = d3.scale.linear()
                        .domain([0, yData.length])
                        .rangeRound([ height, 0 ]);

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('class', 'scatter-plot')
                        .attr('width', width + margin.right + margin.left)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);

                    // draw the x axis
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .ticks(xData.length + 1)
                        .tickFormat(function (d, i) {
                            if (d === 0) {
                                return "";
                            }
                            return xData[d - 1];
                        })
                        .tickSize(7)
                        .orient('bottom');

                    main.append('g')
                        .attr('transform', 'translate(0, ' + (height) + ')')
                        .attr("class", "x axis")
                        .call(xAxis);


                    // draw the y axis
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(yData.length + 1)
                        .tickFormat(function (d, i) {
                            if (d === 0) {
                                return "";
                            }
                            return yData[d - 1];
                        })
                        .tickSize(7)
                        .orient('left');

                    main.append('g')
                        .attr('transform', 'translate(0, 0)')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    var dataPoints = main.append("svg:g");

                    var data = config.data.data;

                    var max_r = d3.min([height / yData.length, width / xData.length]);

                    var r = d3.scale.linear()
                        .domain([0, d3.max(data, function (d) {
                        return d.value;
                    })])
                        .range([ 1, max_r]);

                    var onScatterHover = function (d) {

                        if (!config.tooltip) {
                            return;
                        }

                        var template = _.template(config.tooltip);

                        var event = d3.event;

                        d3.select(event.target).classed("highlight", true);

                        if ($('#tooltip').length === 0) {
                            $('body').append('<div id="tooltip"  class="alert alert-info"></div>');
                        }

                        var data = _.extend({}, d);

                        data.x = _.escape(xData[d.x]);
                        data.y = _.escape(yData[d.y]);

                        var html = template(data);

                        d3.select("#tooltip")
                            .style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px")
                            .style("display", "block")
                            .html(html);
                    };

                    var onScatterHoverEnd = function (d) {
                        d3.select(d3.event.target).classed("highlight", false);
                        d3.select("#tooltip")
                            .style("display", "none");
                    };

                    var scatterDots = dataPoints.selectAll("scatter-dots");

                    scatterDots.data(data)
                        .enter().append("svg:circle")
                        .attr("cy", function (d) {
                            return y(d.y + 1);
                        })
                        .attr("cx", function (d) {
                            return x(d.x + 1);
                        })
                        .on("mouseover", onScatterHover)
                        .on("mouseout", onScatterHoverEnd)
                        .transition()
                        .duration(1000)
                        .attr("r", function (d) {
                            return r(d.value);
                        })
                        .attr('class', 'data-dot');
                }
            },



            timescatterplot: {

                draw: function (config) {

                    var $reportContent = config.element || $('#content');

                    var data = config.data;

                    var xDataStr = _.unique(_.pluck(data, 'x'));
                    var xData = [];
                    var parse = d3.time.format(config.timeformat || "%Y-%m-%d").parse;
                    _.each(xDataStr, function (v) {
                        var date = parse(v);
                        xData.push(date);
                    });

                    var yData = _.unique(_.pluck(data, 'y'));

                    var documentHeight = $(document).height();

                    if (documentHeight < yData.length * 50) {
                        documentHeight = yData.length * 50;
                    }

                    var margin = {top: 50, right: 50, bottom: 100, left: 150}
                        , width = $reportContent.width() * 0.95 - margin.left - margin.right
                        , height = documentHeight * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;


                    var x = d3.time.scale()
                        .domain([d3.min(xData), d3.max(xData)])
                        .rangeRound([ 0, width ]);

                    var y = d3.scale.linear()
                        .domain([0, yData.length - 1])
                        .range([ height, 0 ]);

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('class', 'scatter-plot')
                        .attr('width', width + margin.right + margin.left)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);

                    var max_r = d3.min([height / yData.length, width / xData.length]) * (3 / 4) - 1;

                    var r = d3.scale.linear()
                        .domain([0, d3.max(data, function (d) {
                        return d.value;
                    })]).range([1, max_r]);

                    // draw the x axis
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(7)
                        .orient('bottom');

                    main.append('g')
                        .attr('transform', 'translate(0, ' + (height + max_r *1.2) + ')')
                        .attr("class", "x axis")
                        .call(xAxis);


                    // draw the y axis
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(yData.length)
                        .tickFormat(function (d, i) {
                            return yData[d];
                        })
                        .tickSize(7)
                        .orient('left');

                    main.append('g')
                        .attr('transform', 'translate(-' + (max_r * 1.2) + ', 0)')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    var dataPoints = main.append("svg:g");


                    var onScatterHover = function (d) {

                        if (!config.tooltip) {
                            return;
                        }

                        var template = _.template(config.tooltip);

                        var event = d3.event;

                        d3.select(event.target).classed("highlight", true);

                        if ($('#tooltip').length === 0) {
                            $('body').append('<div id="tooltip"  class="alert alert-info"></div>');
                        }

                        var data = _.extend({}, d);

                        data.x = _.escape(d.x);
                        data.y = _.escape(d.y);

                        var html = template(data);

                        d3.select("#tooltip")
                            .style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px")
                            .style("display", "block")
                            .html(html);
                    };

                    var onScatterHoverEnd = function (d) {
                        d3.select(d3.event.target).classed("highlight", false);
                        d3.select("#tooltip")
                            .style("display", "none");
                    };

                    var scatterDots = dataPoints.selectAll("scatter-dots");

                    scatterDots.data(data)
                        .enter().append("svg:circle")
                        .attr("cy", function (d) {
                            return y(yData.indexOf(d.y));
                        })
                        .attr("cx", function (d) {
                            return x(parse(d.x));
                        })
                        .on("mouseover", onScatterHover)
                        .on("mouseout", onScatterHoverEnd)
                        .transition()
                        .duration(1000)
                        .attr("r", function (d) {
                            return r(d.value);
                        })
                        .attr('class', 'data-dot');
                }

            },



            'users.plot': {
                draw: function (config, caller) {
                    var $reportContent = config.element || $('#content');

                    var margin = {top: 15, right: 20, bottom: 55, left: 60};
                    var width = $reportContent.width() * 0.95 - margin.left - margin.right;
                    var height = $(document).height() * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;
                    var max = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };

                    var usage = config.data.usage;

                    var days = _.pluck(usage, 'days');
                    var actions = _.pluck(usage, 'actions');


                    if (days.length > 0) {
                        max.y.min = d3.min(days);
                        max.y.max = d3.max(days);
                    }

                    if (actions.length > 0) {
                        max.x.min = d3.min(actions);
                        max.x.max = d3.max(actions);
                    }


                    var x = d3.scale.log()
                        .domain([max.x.min, max.x.max])
                        .range([ 0, width]);

                    var y = d3.scale.linear()
                        .domain([max.y.min, max.y.max])
                        .range([ height, 0 ]);

                    var chart = d3.select('#content')
                        .append('svg:svg')
                        .attr('width', width + margin.right + margin.left + 40)
                        .attr('height', height + margin.top + margin.bottom);

                    var main = chart.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('width', width)
                        .attr('height', height);


                    var getLabels = function (data) {
                        return [d3.max(data), d3.min(data)];
                    };

                    var getFormatLabelsFn = function (data) {
                        var labels = getLabels(data);

                        return function (markValue) {
                            return labels.indexOf(markValue) >= 0 ? markValue : '';
                        };
                    };

                    // draw the x axis
                    var xAxis = d3.svg.axis()
                        .tickValues(actions)
                        .tickFormat(getFormatLabelsFn(actions))
                        .scale(x)
                        .orient('bottom');

                    main.append('g')
                        .attr('transform', 'translate(0,' + (height + 20) + ')')
                        .attr("class", "x axis")
                        .call(xAxis);


                    // draw the y axis
                    var yAxis = d3.svg.axis()
                        .tickValues(days)
                        .tickFormat(getFormatLabelsFn(days))
                        .scale(y)
                        .orient('left');

                    main.append('g')
                        .attr('transform', 'translate(-20, 0)')
                        .attr('class', 'y axis')
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("use days");

                    var points = {};

                    _.each(usage, function(d) {
                        var key = x(d.actions) + "_" + y(d.days);
                        var delta = { x: 0, y: 0 };

                        if (points[key]) {
                            delta.x = d3.random.normal()()*10;
                            delta.y = d3.random.normal()()*10;
                        }

                        points[(x(d.actions) + delta.x) + "_" + (y(d.days) + delta.y)] = true;
                        d.host = d._id.split('/user/')[0].replace('.tpondemand.com', '');
                        d.id = d._id.split('/user/')[1];

                        d.delta = delta;
                    });

                    var onScatterHover = function (d) {

                        var template = _.template("<b><%= days%></b> day(s) <br/> <b><%= actions %></b> action(s) <br/> #<%= id%> from <b><%= host %></b>");

                        var event = d3.event;

                        d3.selectAll('.user-circle').classed('dont-make-me-think', true);
                        d3.selectAll('.host-' + d.host).classed('dont-make-me-think', false);

                        d3.select(event.target).attr('r', 20).classed("highlight", true);

                        if ($('#tooltip').length === 0) {
                            $('body').append('<div id="tooltip" class="alert alert-info"></div>');
                        }

                        var data = _.extend({}, d);
                        var html = template(data);

                        d3.select("#tooltip")
                            .style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px")
                            .style("display", "block")
                            .html(html);
                    };

                    var onScatterHoverEnd = function (d) {
                        d3.selectAll('.user-circle').classed('dont-make-me-think', false);
                        d3.select(d3.event.target).attr('r', 10).classed("highlight", false);
                        d3.select("#tooltip").style("display", "none");
                    };

                    var onScatterClick = function (d) {
                        caller.fire('show.user.actions', { id: d._id });
                    };

                    var hosts = _.pluck(_.pluck(config.data.users, 'host'), 'id');
                    var color = d3.scale.category20();
                    color.domain(hosts);


                    var bubbles = main.selectAll(".user-data-point")
                            .data(usage)
                            .enter().append("circle")
                            .attr('user-actions-target', "true")
                            .attr("class", function(d) {
                                return 'user-circle host-' + d.host;
                            })
                            .attr("r", function (d) {
                                return 10;
                            })
                            .on("mouseover", onScatterHover)
                            .on("click", onScatterClick)
                            .on("mouseout", onScatterHoverEnd)
                            .style("stroke", function (d) {
                                return color(d._id.split('/user/')[0]);
                            })
                            .attr("cx", function () {
                                return x(max.x.min);
                            })
                            .attr("cy", function () {
                                return y(max.y.min);
                            })
                            .transition()
                            .attr("cy", function (d) {
                                return y(d.days) + d.delta.y;
                            })
                            .attr("cx", function (d) {
                                return x(d.actions) + d.delta.x;
                            });


                    if (config.fillBubbles) {
                        bubbles.style("fill",function (d) {
                            return color(d._id.split('/user/')[0]);
                        }).style("stroke", function (d) {
                                return '#000';
                            })
                        ;
                    }
                }
            },



            polar: {
                draw: function (config) {

                    var $reportContent = config.element || $('#content');

                    var margin = {top: 15, right: 20, bottom: 50, left: 60};
                    var width = $reportContent.width() * 0.95 - margin.left - margin.right;
                    var height = $(document).height() * 0.9 - $reportContent.position().top - 20 - margin.top - margin.bottom;
                }
            }


        };

        return {
            get: function (viewType) {
                return strategies[viewType];
            }
        };
    });
