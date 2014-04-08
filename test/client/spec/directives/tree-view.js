'use strict';

describe('Directive: treeView', function () {

  // load the directive's module
  beforeEach(module('spytowerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tree-view></tree-view>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the treeView directive');
  }));
});
