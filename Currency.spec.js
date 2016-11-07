// Per. https://scotch.io/tutorials/testing-angularjs-with-jasmine-and-karma-part-1

describe('Currency factory', function(){
  var Currency;
  
  beforeEach(angular.mock.module('CartCostApp'));
  
  // Before each test set our injected Currency factory (_Currency_) to our local Currency variable
  beforeEach(inject(function(_Currency_){
    Currency = _Currency_;
  }));
  
  it('should exist', function(){
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

  // CurrencyType.prototype.formatCents = function(minWidth)
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

  // CurrencyType.prototype.format = function(sep)
  describe('.format()', function(){
    it('is a string', function(){
      var c = new Currency(12.5);
      expect(typeof c.format()).toEqual('string');
    });

    it('is separated by \'.\' by default', function(){
      var c = new Currency(0.99);
      expect(c.format()).toEqual('0.99');
    });

    it('is separated by the provided decimal separator', function(){
      var c = new Currency(12.75);
      expect(c.format(',')).toEqual('12,75');
    });
  });
  
  describe('.dollarsAddMultipleOfTen()', function(){
    it('leaves the number unchanged when given 0', function(){
      var a = new Currency(12.5);
      var aBefore = a.format();
      
      a.dollarsAddMultipleOfTen(0);
      var aAfter = a.format();
      
      expect(aBefore).toEqual(aAfter);
    });
    
    it('truncates multiples >= 10', function(){
      var a = new Currency(12.5);
      a.dollarsAddMultipleOfTen(10);
      
      expect(a.format()).toEqual('12.50');
      
      var b = new Currency(12.5);
      b.dollarsAddMultipleOfTen(25);
      
      expect(b.format()).toEqual('62.50');
    });
    
    it('wraps the 10\'s digit to the remainder on overflow when `wrap` is undefined or false', function(){
      var a = new Currency(99.99);
      a.dollarsAddMultipleOfTen(2, true);
      
      expect(a.format()).toEqual('19.99');
    });
    
    it('wraps the 10\'s digit to 0 on overflow when `wrap` is true', function(){
      var a = new Currency(99.99);
      a.dollarsAddMultipleOfTen(2, true);
      
      expect(a.format()).toEqual('9.99');
    });
    
    // it('only modifies the 10\'s digit', function(){ });
  });
});