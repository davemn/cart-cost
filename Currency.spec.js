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

  describe('.formatDollars()', function(){
    it('is a string', function(){
      var c = new Currency(12.5);
      expect(typeof c.formatDollars()).toEqual('string');
    });

    it('is \'0\' when the Currency is only cents', function(){
      var c = new Currency(0.99);
      expect(c.formatDollars()).toEqual('0');
    });

    it('does *not* include a currency symbol', function(){
      var c = new Currency(12.5);
      var formatted = c.formatDollars();

      expect(formatted.search(/^[0-9]/)).not.toEqual(-1);
    });
  });

  // CurrencyType.prototype.formatCents = function(minWidth){

  // CurrencyType.prototype.format = function(sep){
});