'use strict';

describe('Service: jstree', function () {

  // load the service's module
  beforeEach(module('spytowerApp'));

  // instantiate service
  var jstree;
  beforeEach(inject(function (_jstree_) {
    jstree = _jstree_;
  }));

  it('should do something', function () {
    expect(!!jstree).toBe(true);
  });

});
