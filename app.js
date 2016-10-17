angular.module('StickerTracking', [])
  .filter('delimit', function() {
    return function(input, splitChar, splitIndex) {
      return input.split(splitChar)[splitIndex];
    }
  })
  .controller('VehicleStatus', ['$scope', VehicleStatus]);
    
function VehicleStatus($scope){
  $scope.status = {
    ERROR:     0,
    NOT_FOUND: 1,
    PENDING:   2,
    PROCESS:   3,
    MAILED:    4,
    RETURNED:  5 
  };
  
  // record retrieval will be handled by PHP
  // a form POST will send plate + last 4 of VIN (and CAPTCHA data)
  // assuming it can verify the CAPTCHA, it will then do the lookup, and
  // populate JS variables in the page
  // each webservice can:
  // * time out
  // * return a non-200 HTTP status code
  // * return a response that contains a non-zero error code
  // * return a response that indicates "not found"
  // * return a response that contains registration / status info
  
  // $scope.xerox = {
  //   httpStatusCode: 200,
  //   reponseErrorCode: 0,
  //   recordFound: true,
  //   response: {
  //     // ...
  //   }
  // };
  
  $scope.vehicleQuery = {
    status: $scope.status.PROCESS,
    regInfo: {
      plateNo: 'ABC123',
      vin: '12345678901234567',
      make: 'CHEV',
      model: 'IMPALA',
      expirationDt: 'May 18',
      county: 'Travis'
    },
    uspsReceivedDt: new Date()
  };
  
  // ---
  
  $scope.demo = {
    plateNo: '',
    vin: '',
    screens: {
      INPUT: 0,
      RESULTS: 1
    },
    scenarios: {
      '_base': {
        vin: '12345678901234567',
        make: 'CHEV',
        model: 'IMPALA',
        expirationDt: 'MAY 2018',
        county: 'TRAVIS'
      },
      'BROKEN+1234': {
        status: $scope.status.ERROR,
        plateNo: 'BROKEN'
      },
      'MISSING+1234': {
        status: $scope.status.NOT_FOUND,
        plateNo: 'MISSING'
      },
      'PENDING+1234': {
        status: $scope.status.PENDING,
        plateNo: 'PENDING'
      },
      'PROCESS+1234': {
        status: $scope.status.PROCESS,
        plateNo: 'PROCESS'
      },
      'MAILED+1234': {
        status: $scope.status.MAILED,
        plateNo: 'MAILED'
      },
      'RETURN+1234': {
        status: $scope.status.RETURNED,
        plateNo: 'RETURN'
      }
    }
  };
  $scope.demo.screen = $scope.demo.screens.INPUT;
  
  // copy shared scenario attribs to the individual scenarios
  angular.forEach($scope.demo.scenarios, function(scenario, scenarioName, scenarios){
    if(scenarioName === '_base') return;
    
    scenario.vin          = scenarios['_base'].vin;
    scenario.make         = scenarios['_base'].make;
    scenario.model        = scenarios['_base'].model;
    scenario.expirationDt = scenarios['_base'].expirationDt;
    scenario.county       = scenarios['_base'].county;
  });
  
  $scope.demo.onQuery = (function(){
    this.screen = this.screens.RESULTS;
  
    this.plateNo = this.plateNo.trim().toUpperCase();
    this.plateNo = this.plateNo.replace(/[^A-Z0-9]/g, '');
    
    this.vin = this.vin.trim();
    this.vin = this.vin.replace(/[^0-9]/g, '');
    
    var scenario = this.scenarios[this.plateNo+'+'+this.vin];
    if(!scenario)
      scenario = this.scenarios['BROKEN+1234'];
      
    $scope.vehicleQuery.status               = scenario.status;
    $scope.vehicleQuery.regInfo.plateNo      = scenario.plateNo;
    $scope.vehicleQuery.regInfo.vin          = scenario.vin;
    $scope.vehicleQuery.regInfo.make         = scenario.make;
    $scope.vehicleQuery.regInfo.model        = scenario.model;
    $scope.vehicleQuery.regInfo.expirationDt = scenario.expirationDt;
    $scope.vehicleQuery.regInfo.county       = scenario.county;
    
  }).bind($scope.demo);
  
  $scope.demo.reset = function(){
    $scope.demo.screen = $scope.demo.screens.INPUT;
    $scope.demo.plateNo = '';
    $scope.demo.vin = '';
  };
}