'use strict';

angular
    .module('spytowerApp')
    .directive(
        'treeView',
        [
            '$location',
            '$http',
            'jquery',
            '_',
            function ($location, $http, $, _) {
                return {
                    template: '<div></div>',
                    restrict: 'E',
                    link: function postLink(scope, element, attrs) {

                        var $input = $('<input type="text" value="" style="width:100%;" />');

                        var $el = $(element);

                        $el.jstree({
                            plugins: ['wholerow', 'search'],
                            search: {
                                show_only_matches: true,
                                fuzzy: false
                            },
                            core: {
                                themes: {
                                    dots: false,
                                    icons: false
                                },
                                data: function (node, callback) {

                                    $http({method: 'GET', url: '/api/reports'})
                                        .success(function(reportItems) {

                                            var treeData = [
                                                {
                                                    id: '-1',
                                                    text: 'Saved Reports',
                                                    parent: '#',
                                                    isLeaf: false,
                                                    state: {
                                                        opened: true,
                                                        selected: true
                                                    }
                                                }
                                            ];

                                            var savedReports = _(reportItems).map(function(rawReport) {
                                                return {
                                                    id: rawReport._id,
                                                    text: rawReport._id,
                                                    parent: '-1',
                                                    isLeaf: true,
                                                    a_attr: {
                                                        'href': '/report/' + rawReport._id
                                                    }
                                                };
                                            });

                                            var items = treeData.concat(savedReports);

                                            callback.call(this, items);

                                            $el.prepend($input);
                                        })
                                        .error(function(data) {

                                            $el.html('Error during loading...');

                                        });
                                }
                            }
                        });

                        $input.keyup(_.throttle(function () {
                                $el
                                    .jstree(true)
                                    .search($input.val());
                            },
                            250)
                        );

                        $el.bind('select_node.jstree', function (e, data) {
                            var orig = data.node.original;
                            if (orig.isLeaf) {
                                $location.path(orig.a_attr.href);
                                scope.$apply();
                            }
                        });
                    }
                };
            }
        ]);
