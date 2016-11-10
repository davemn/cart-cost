var app = angular.module('CartCostApp', []);

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

app.filter('dollars', ['Currency', DollarsFilter]);
app.filter('cents', ['Currency', CentsFilter]);
app.filter('reverseCollection', ReverseCollectionFilter);
app.controller('CartCost', ['$scope', CartCost]);

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

function roundToCents(num){
  var cents = Math.round(Number(num+'e2'));
  var out = Number(cents+'e-2');
  console.log('Rounding ' + num + ' to ' + out);
  return out;
}

function CartCost($scope){
  $scope.Modes = {
    INPUT:0,
    EDIT:1,
    SETTINGS:2,
  };
  
  $scope.isEditMode = false;
  $scope.mode = $scope.Modes.INPUT;
  
  $scope.inputDigits = [0,0,0,0,0];
  $scope.input = 0;
  
  $scope.taxRate = 6.25;
  $scope.ledger = [
    { amount: 12.7, tax: 0.79 },
    { amount: 0.99, tax: 0.06 },
    { amount: 13, tax: 0.38, taxRate: 2.9 } // individual items may have a different tax rate
  ];

  $scope.total = 0;

  // update total as lines get added to ledger
  $scope.$watchCollection('ledger', function(newLedger, oldLedger) {
    // See http://money.stackexchange.com/questions/15051/sales-tax-rounded-then-totaled-or-totaled-then-rounded
    var sum = 0;
    var line;

    for(var i=0; i < newLedger.length; i++){
      line = newLedger[i].amount + newLedger[i].tax;
      line = roundToCents(line);
      
      sum += line;
    }
    $scope.total = sum;
  });
  
  // update `input` as digits are changed
  $scope.$watchCollection('inputDigits', function(newDigits, oldDigits) {
    var dollars = newDigits.slice(0,3).join('');
    var cents = newDigits.slice(-2).join('');
    $scope.input = Number(dollars+'.'+cents);
  });

  // add line to ledger
  $scope.addToLedger = function(){
    if($scope.input === 0)
      return;
    
    // E.g. 0.99 @ 6.25% tax rate. TODO rounding will fail on $32.63, use decimal lib instead
    var tax = $scope.input * Number($scope.taxRate+'e-2'); // 0.061875
    var roundedTotal = roundToCents($scope.input + tax); // 1.05
    tax = roundedTotal - $scope.input; // 0.06
    
    $scope.ledger.push({
      amount: $scope.input,
      tax: tax
    });
    $scope.clear();
  };
  
  $scope.removeFromLedger = function(i){
    $scope.ledger.splice(i,1);
  };

  $scope.clear = function(){
    $scope.inputDigits = [0,0,0,0,0];
  }
  
  // input = input + amt * 10^toExp, but wraps to 0 on overflow, with no carry
  $scope.inputAdd = function(amt, toExp){
    var i = 2 - toExp;
    $scope.inputDigits[i] += amt;
    if($scope.inputDigits[i] >= 10)
      $scope.inputDigits[i] = 0;
  };
  
  $scope.toggleEditMode = function(){
    if($scope.mode === $scope.Modes.EDIT)
      $scope.mode = $scope.Modes.INPUT;
    else
      $scope.mode = $scope.Modes.EDIT;
  }
}