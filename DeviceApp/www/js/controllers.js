angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, Credentials, Connection) {
  // fetch the data for the form
  $scope.device = Credentials.get();

  $scope.signIn = function(device) {
    console.log('Log-In', device);
    // check if they've provided anything
    if((!device.id) || (!device.serialnumber)) {
      var popup = $ionicPopup.alert({ 
                    title: 'Need Device ID and serial number'
      });
      popup.then(function(res) {
        console.log('Alert complete')
      });
      return;
    } 
    // pop up the loading dialog
    $ionicLoading.show({
      tempate: 'Loading'
    });
    // store credentials
    Credentials.set(device);
    // try to connect
    Connection.connect().then(function() {
      // hide the loading dialog
      $ionicLoading.hide();
      // authentication success - continue to tabs
      $state.go('tab.dash');
    }, function() {
      // hide the loading dialog
      $ionicLoading.hide();
      // error, warn
      var popup = $ionicPopup.alert({ 
                    title: 'Invalid Device ID or serial number'
      });
      popup.then(function(res) {
        console.log('Alert complete')
      });
    });

  };
})

.controller('DashCtrl', function($scope, $ionicLoading, Device, Connection) {

  // initiaize chart data 
  $scope.optionsLive = {renderer: 'area'};
  $scope.featuresLive = {};
  $scope.seriesLive = [{
                        name: 'Series 1',
                        color: 'steelblue',
                        data: [{x: 0, y: 23}, {x: 1, y: 15}, {x: 2, y: 79}, {x: 3, y: 31}, {x: 4, y: 60}]
                    }, {
                        name: 'Series 2',
                        color: 'lightblue',
                        data: [{x: 0, y: 30}, {x: 1, y: 20}, {x: 2, y: 64}, {x: 3, y: 50}, {x: 4, y: 15}]
                    }];
  $scope.optionsHourly = {renderer: 'bar'};
  $scope.featuresHourly = {};
  $scope.seriesHourly = [{
                        name: 'Series 1',
                        color: 'steelblue',
                        data: [{x: 0, y: 23}, {x: 1, y: 15}, {x: 2, y: 79}, {x: 3, y: 31}, {x: 4, y: 60}]
                    }, {
                        name: 'Series 2',
                        color: 'lightblue',
                        data: [{x: 0, y: 30}, {x: 1, y: 20}, {x: 2, y: 64}, {x: 3, y: 50}, {x: 4, y: 15}]
                    }];

  $scope.dataDaily = [
    {label: "one", value: 12.2, color: "red"}, 
    {label: "two", value: 45, color: "#00ff00"},
    {label: "three", value: 10, color: "rgb(0, 0, 255)"}
  ];
  $scope.optionsDaily = {};

  // method called to update usage
  function update() {
    // query the usage
    Device.hourlyusage().then(function(data) {
      console.log('queried usage', data);
      // iterate through each record
      for (var j = 0; j < data.length; j++) {
      // parse the date
        var timestamp = Date.parse(data[j].record.date) / 1000;
        console.log('timestamp', timestamp);
        // get the measurements
        measurements = data[j].record.measurements;
        // fill in an entry for each circuit
        for (var i = 0; i < measurements.length; i++) {
          // map the circuit 
          var index = lookup[measurements[i].circuit];
          // extract the value
          var value = measurements[i]["power-in-kwh"];
          console.log('populating data', index, j, timestamp, value);
        }
      }
      console.log('finished populating chart');
    });
  }

  // pop up the loading dialog
  $ionicLoading.show({
    tempate: 'Loading'
  });
  // query device info
  Device.device().then(
    function(device) {
      console.log("queried device", device);
      // hide the loading dialog
      $ionicLoading.hide();
      // store the device
      $scope.device = device;
     // setup a lookup table to map circuit names to a constant index
     $scope.deviceLookup = {};
     // initialize lookup table
     for (var circuit = 0; circuit < $scope.device.circuits.length; circuit++) {
       $scope.deviceLookup[$scope.device.circuits[circuit].name] = circuit;
     }
    }, 
    function() {
      console.log('error querying device');
    });
})

.controller('SettingsCtrl', function($scope) {
});
