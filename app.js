var app = angular.module('CartCostApp', []);

app.filter('dollars', DollarsFilter);
app.filter('cents', CentsFilter);
app.filter('reverseCollection', ReverseCollectionFilter);
app.controller('CartCost', ['$scope', CartCost]);

// --- 

function DollarsFilter(){
  return function(input) {
    return Math.floor(input);
  }
};
function CentsFilter(){
  return function(input) {
    var parts = input.toString().split('.');
    if(parts.length < 2)
      return '00';
    
    var cents = parts[1];
    // right pad, to (a minimum of) 2 digits
    cents = String(cents + '00').substring(0, Math.max(cents.length, 2));
    return cents.substring(0,2); // truncate to whole cents
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
}