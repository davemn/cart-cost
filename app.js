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
    if(parts.length < minWidth)
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
  // CurrencyType.prototype.dollarsAddModulo100 = function(arg){
  //   var dollars = this.formatDollars();
  //   var cents = this.formatCents();
  //   
  //   dollars = parseInt(dollars):
  //   
  //   
  //   this.num = parseFloat(dollars+'.'+cents);
  // };
  
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
  return function(input) {
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

  $scope.curInput = 12.5;
  $scope.curInputFmt = '12.50';
  $scope.taxRate = 6.25;
  $scope.ledger = [
    { amount: 12.7 },
    { amount: 0.99 },
    { amount: 13, taxRate: 2.9 }
  ];

  $scope.total = 0;

  // update total as lines get added to ledger
  $scope.$watchCollection('ledger', function(newLedger, oldLedger) {
    // See http://money.stackexchange.com/questions/15051/sales-tax-rounded-then-totaled-or-totaled-then-rounded
    var sum = 0;
    var line = 0;

    for(var i=0; i < newLedger.length; i++){
      line = newLedger[i].amount;
      
      if(newLedger[i].taxRate) // individual items may have a different tax rate
        line += line * Number(newLedger[i].taxRate+'e-2');
      else
        line += line * Number($scope.taxRate+'e-2');
      
      line = roundToCents(line);
      
      sum += line;
      line = 0;
    }
    $scope.total = sum;
  });

  // add line to ledger
  $scope.add = function(){
    if($scope.curInput <= 0)
      return;

    $scope.ledger.push({
      amount: $scope.curInput
    });
    $scope.clear();
  };

  $scope.clear = function(){
    $scope.curInput = 0;
  }
  
  $scope.inputAddDollars = function(amt){
    $scope.curInput += amt;
  };
  $scope.inputAddCents = function(){
    $scope.curInput += Number(amt+'e-2');
  };
}