'use strict';

describe('Service: reportView', function () {

  // load the service's module
  beforeEach(module('spytowerApp'));

  // instantiate service
  var reportView;
  beforeEach(inject(function (_reportView_) {
    reportView = _reportView_;
  }));

  it('should do something', function () {
    expect(!!reportView).toBe(true);
  });

});
