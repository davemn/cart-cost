var app = angular.module('CartCostApp', []);

app.filter('dollars', DollarsFilter);
app.filter('cents', CentsFilter);
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
    var cents = Math.floor(Number(parts[1]+'e2')); // truncate to whole cents
    return String('00' + cents).slice(-2); // left pad to 2 digits
  }
}

function roundToCents(num){
  var cents = Math.round(Number(num+'e2'));
  return Number(cents+'e-2');
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
    var sum = 0;
    var tax = 0;

    for(var i=0; i < newLedger.length; i++){
      sum += newLedger[i].amount
      if(newLedger[i].taxRate)
        tax += roundToCents(newLedger[i].amount * Number(newLedger[i].taxRate+'e-2'));
      else
        tax += roundToCents(newLedger[i].amount * Number($scope.taxRate+'e-2'));
    }
    $scope.total = sum + tax;
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