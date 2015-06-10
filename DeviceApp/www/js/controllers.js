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

.controller('DashCtrl', function($scope, Device) {
  // setup the rickshaw data
  $scope.options1 = { renderer: 'line' };
  $scope.series1 = [];
  $scope.features1 = {
    palette: 'colorwheel',
    xAxis: {
      timeUnit: true
    },
    yAxis: {
      tickFormat: 'formatKMBT'
    },
    directive: {
      watchAllSeries: true
    }
  };

  // fetch device info
  Device.device().then(function(response) {
    console.log('found device', response);
    // store the device
    $scope.device = response.device;
    // setup a lookup table to map circuit names to a constant index
    var lookup = {};
    // initialize the rickshaw series and lookup table
    for (var circuit = 0; circuit < $scope.device.circuits.length; circuit++) {
       $scope.series1[circuit] = { 
          name : $scope.device.circuits[circuit].name,
          color: 'steelblue',
          data : []  
       };
       lookup[$scope.device.circuits[circuit].name] = circuit;
    }
    // query the usage
    Device.hourlyusage().then(function(data) {
      console.log('received usage', data);
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
          // fill in the data
          $scope.series1[index].data[j] = { 
            x: timestamp, 
            y: value
          };
        }
      }
      console.log('finished populating chart');
    });
  });
})

.controller('SettingsCtrl', function($scope) {
});
