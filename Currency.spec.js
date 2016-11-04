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
  describe('.formatCents()', function(){
    it('is a string', function(){
      var c = new Currency(12.5);
      expect(typeof c.formatCents()).toEqual('string');
    });

    // default '00', string of zeroes of length `minWidth`
    it('is \'00\' when the Currency is whole dollars, and no width given', function(){
      var c = new Currency(5);
      expect(c.formatCents()).toEqual('00');
    });

    it('is \'000\' when the Currency is whole dollars, and a width of 3 given', function(){
      var c = new Currency(5);
      expect(c.formatCents(3)).toEqual('000');
    });

    // right pad, to (a minimum of) `minWidth` digits
    it('pads to 2 decimal places no `minWidth` is given', function(){
      var c = new Currency(12.5);
      expect(c.formatCents()).toEqual('50');
    });
    it('pads to `minWidth` decimal places when `minWidth` is given', function(){
      var c = new Currency(12.5);
      expect(c.formatCents(3)).toEqual('500');
    });

    // truncate to whole cents (default), or fractional matching `minWidth`
    it('truncates to whole cents by default', function(){
      var c = new Currency(12.005);
      expect(c.formatCents()).toEqual('00');
    });

    it('truncates to `minWidth` decimal places, when `minWidth` is given', function(){
      var c = new Currency(12.0005);
      expect(c.formatCents(3)).toEqual('000');
    });
  });

  // CurrencyType.prototype.format = function(sep){
});