// Per. https://scotch.io/tutorials/testing-angularjs-with-jasmine-and-karma-part-1

describe('Currency factory', function(){
  var Currency;
  
  beforeEach(angular.mock.module('CartCostApp'));
  
  // Before each test set our injected Currency factory (_Currency_) to our local Currency variable
  beforeEach(inject(function(_Currency_){
    Currency = _Currency_;
  }));
  
  it('should exist', function(){
    // expect(Number('10e-1')).toEqual(1); // an intentionally failing test
    expect(Currency).toBeDefined();
  });
});