var app = angular.module('CartCostApp', ['ngRoute']);

app.run(['$rootScope', '$location', function($rootScope, $location){
  'use strict';
  $rootScope.$on('$routeChangeError', function() {
    $location.path('/calculator');
  });
}]);

app.factory('Big', ['$window', function($window){
  // TODO load async instead of via <script> tag, ala http://www.ng-newsletter.com/posts/d3-on-angular.html
  return $window.Big;
}]);

app.service('IdGenerator', function(){
  this._linearSeed = 0;
  this.getNextLinear = function(){
    return this._linearSeed++;
  };
});

// ---

app.factory('Currency', function(){
  function CurrencyType(n){
    this.num = parseFloat(n);
  }
  CurrencyType.prototype.formatDollars = function(){
    return Math.floor(this.num).toString();
  };
  CurrencyType.prototype.formatCents = function(minWidth){
    minWidth = minWidth || 2;
    var zeroes = Array(minWidth+1).join('0'); // default '00', string of zeroes of length `minWidth`
    
    var parts = this.num.toString().split('.');
    if(parts.length < 2)
      return zeroes;
    
    var cents = parts[1];
    // right pad, to (a minimum of) `minWidth` digits
    cents = String(cents + zeroes).substring(0, Math.max(cents.length, minWidth));
    return cents.substring(0,minWidth); // truncate to whole cents (default), or fractional matching `minWidth`
  };
  CurrencyType.prototype.format = function(sep){
    sep = sep || '.';
    return this.formatDollars() + sep + this.formatCents();
  };
  CurrencyType.prototype.dollarsAddMultipleOfTen = function(arg, wrap){
    var multiple = String(arg).slice(-1);
    multiple = Number(multiple+'e1');
    
    if(multiple === 0)
      return;
    
    var dollars = this.formatDollars();
    dollars = String('00' + dollars).slice(-1 * Math.max(dollars.length, 2));
    var cents = this.formatCents();
    
    // E.g. '231' (dollars) + 90
    var hundreds = dollars.slice(0,-2); // '2'
    var tens = Number(dollars.slice(-2)); // 31
    
    if(wrap)
      tens = (tens + multiple) % 100; // 21
    else {
      tens = String(tens + multiple);
      if(tens.length >= 3)
        tens = '0' + tens.slice(-1);
    }
    tens = String('00' + tens).slice(-2); // '01'
    
    this.num = parseFloat(hundreds+tens+'.'+cents);
  };
  /*
  CurrencyType.prototype.dollarsAddTen = function(wrap){ };
  CurrencyType.prototype.dollarsAddOne = function(wrap){ };
  */
  
  return CurrencyType;
});

app.service('Settings', function(){
  this.generalSalesTaxRate = 6.25;
});

app.factory('Ledger', function(Big, IdGenerator, Settings, Tax){
  var ledger = [
    { amount: 12.7, isTaxExempt: true },
    { amount: 0.99, isTaxExempt: true },
    { amount: 13 }
  ];
  
  var total = 0;
  var tax = 0;
  
  // populate `tax` property of each ledger item - needed in case of rate change in settings
  for(let line of ledger){
    line.id = IdGenerator.getNextLinear();
    if(line.isTaxExempt)
      line.tax = 0;
    else
      line.tax = Tax.fromRate(Settings.generalSalesTaxRate, line.amount);
  }
  
   // add line to ledger
  function addToLedger(input, isTaxExempt){
    if(input === 0)
      return;
    
    // E.g. 32.63 @ 6.25% tax rate. Formula: tax = roundToCents(amount*(1+rate) - amount)
    var tax;
    if(isTaxExempt)
      tax = 0;
    else
      tax = Tax.fromRate(Settings.generalSalesTaxRate, input);
    
    // TODO assign IDs via service that guarantees no overlap
    
    ledger.push({
      id: IdGenerator.getNextLinear(),
      amount: input,
      tax: tax
    });
  }
  
  function removeFromLedger(id){
    for(var i=0; i < ledger.length; i++){
      if(ledger[i].id === id){
        ledger.splice(i,1);
        return;
      }
    }
  }
  
  function getTotal(){
    // See http://money.stackexchange.com/questions/15051/sales-tax-rounded-then-totaled-or-totaled-then-rounded
    var sum = new Big(0);
    var line;
    
    for(var i=0; i < ledger.length; i++){
      line = new Big(ledger[i].amount).plus(ledger[i].tax);
      
      sum = sum.plus(line);
    }
    return Number(sum.toString());
  }
  
  function getTax(){
    // See http://money.stackexchange.com/questions/15051/sales-tax-rounded-then-totaled-or-totaled-then-rounded
    var taxSum = new Big(0);
    
    for(var i=0; i < ledger.length; i++){
      taxSum = taxSum.plus(ledger[i].tax);
    }
    return Number(taxSum.toString());
  }
  
  return {
    collection: ledger,
    add: addToLedger,
    remove: removeFromLedger,
    getTotal: getTotal,
    getTax: getTax
  };
});

app.service('Tax', ['Big', function(Big){
  this.fromRate = function(taxRate, input){
    // E.g. 32.63 @ 6.25% tax rate. Formula: tax = roundToCents(amount*(1+rate) - amount)
    // TODO is `tax = roundToCents(amount*rate)` equivalent?

    var input = new Big(input); // 32.63
    var taxRate = new Big(taxRate+'e-2'); // 0.0625
    var roundedTotal = input.times(taxRate.plus(1)).round(2); // 34.669375 -> 34.67

    var tax = roundedTotal.minus(input).toString(); // 2.04
    tax = Number(tax);
    
    return tax;
  };
}]);

app.filter('dollars', ['Currency', DollarsFilter]);
app.filter('cents', ['Currency', CentsFilter]);
app.filter('reverseCollection', ReverseCollectionFilter);
app.controller('calculatorController', ['$scope', '$location', 'Settings', 'Ledger', calculatorController]);
app.controller('settingsController', ['$scope', '$location', 'Settings', settingsController]);

// --- 

function DollarsFilter(Currency){
  return function(input) {
    return new Currency(input).formatDollars();
  }
};
function CentsFilter(Currency){
  return function(input,width) {
    if(width)
      return new Currency(input).formatCents(width);
    else
      return new Currency(input).formatCents();
  }
}
function ReverseCollectionFilter(){
  return function(coll) {
    return coll.slice().reverse();
  };
}

// ---

function calculatorController($scope, $location, Settings, Ledger){
  $scope.pageClass = 'page-calculator';
  
  $scope.Modes = {
    INPUT:0,
    EDIT:1,
    SETTINGS:2,
  };
  
  $scope.isEditMode = false;
  $scope.mode = $scope.Modes.INPUT;
  
  $scope.ledger = Ledger;
  
  $scope.inputDigits = [0,0,0,0,0];
  $scope.input = 0;
  $scope.inputIsTaxExempt = true;
  
  $scope.taxRate = Settings.generalSalesTaxRate;
  
  // update `input` as digits are changed
  $scope.$watchCollection('inputDigits', function(newDigits, oldDigits) {
    var dollars = newDigits.slice(0,3).join('');
    var cents = newDigits.slice(-2).join('');
    $scope.input = Number(dollars+'.'+cents);
  });

  $scope.clear = function(){
    $scope.inputDigits = [0,0,0,0,0];
    $scope.inputIsTaxExempt = true;
  }
  
  $scope.dollarsPush = function(digit){
    $scope.inputDigits[0] = $scope.inputDigits[1];
    $scope.inputDigits[1] = $scope.inputDigits[2];
    $scope.inputDigits[2] = digit;
  };
  $scope.centsPush = function(digit){
    $scope.inputDigits[3] = $scope.inputDigits[4];
    $scope.inputDigits[4] = digit;
  };
  
  $scope.toggleEditMode = function(){
    if($scope.mode === $scope.Modes.EDIT)
      $scope.mode = $scope.Modes.INPUT;
    else
      $scope.mode = $scope.Modes.EDIT;
  }
  $scope.toggleIsTaxExempt = function(){
    $scope.inputIsTaxExempt = !$scope.inputIsTaxExempt;
  };
  
  $scope.goSettings = function(){
    $location.path('/calculator/settings');
  };
}

function settingsController($scope, $location, Settings){
  $scope.pageClass = 'page-settings';
  $scope.taxRate = Settings.generalSalesTaxRate;
  
  $scope.$watch('taxRate', function(newRate){
    Settings.generalSalesTaxRate = newRate;
  });
  
  $scope.goBack = function(){
    $location.path('/calculator');
  };
}
// ---

app.config(['$locationProvider', '$routeProvider', function config($locationProvider, $routeProvider){
  $locationProvider.hashPrefix('!');

  // TODO visual feedback while waiting on route resolve
  $routeProvider.
    when('/calculator', {
      controller: 'calculatorController',
      // controllerAs: 'vm',
      templateUrl: 'views/calculatorView.html'
      // resolve: {
      //   
      // }
    }).
    when('/calculator/settings', {
      controller: 'settingsController',
      templateUrl: 'views/settingsView.html'
    }).
    otherwise({ redirectTo : '/calculator' });
}]);