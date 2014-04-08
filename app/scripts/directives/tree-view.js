'use strict';

angular
    .module('spytowerApp')
    .directive(
        'treeView',
        [
            'jquery',
            function ($) {
                return {
                    template: '<div></div>',
                    restrict: 'E',
                    link: function postLink(scope, element, attr1s) {

                        var items = [
                            {
                                id: "2",
                                parent: "#",
                                text: "Second",
                                state: {
                                    opened: true,
                                    selected: true
                                }
                            },
                            {
                                id: '21',
                                parent: '2',
                                text: 'Report 21R'
                            },
                            {
                                id: '31',
                                parent: '2',
                                text: 'Report 31R'
                            },
                            {
                                id: '212',
                                parent: '2',
                                text: 'Report 212R'
                            }
                        ];

                        var $el = $(element);
                        $el.jstree({
                            plugins: ['wholerow', 'search', 'state'],
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
                                    setTimeout(function() {

                                        callback.call(this, items);

                                    }, 1000);
                                }
                            }
                        });

                        var $input = $('<input type="text" value="" style="width:100%;" />');
                        $el.prepend($input);

                        var to = false;
                        $input.keyup(function () {
                            if (to) {
                                clearTimeout(to);
                            }
                            to = setTimeout(function () {
                                var v = $input.val();
                                $el.jstree(true).search(v);
                            }, 250);
                        });
                    }
                };
            }
        ]);
