angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, CredentialsService, ConnectionService) {
  // fetch the data for the form
  $scope.device = CredentialsService.get();

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
    CredentialsService.set(device);
    // try to connect
    ConnectionService.connect().then(function() {
      console.log("connected", device);
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

.controller('DashCtrl', function($scope, $state, $ionicLoading, device, DeviceService, ConnectionService) {

  // prepare the live chart 
  $scope.optionsLive = {renderer: 'area'};
  $scope.featuresLive = {
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
  $scope.seriesLive = [];
  for(var circuit in device.circuits) { 
    $scope.seriesLive[circuit] = {
      name : device.circuits[circuit].name, 
      data : [{x : 143408800, y: 100000}, {x : 14308500, y: 2000000}]
    };
  }
 
  // prepare the hourly chart 
  $scope.optionsHourly = {renderer: 'line'};
  $scope.featuresHourly = {
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
  $scope.seriesHourly = [];
  for(var circuit in device.circuits) { 
    $scope.seriesHourly[circuit] = {
      name : device.circuits[circuit].name, 
      data : [{x : 143408800, y: 100000}, {x : 14308500, y: 2000000}]
    };
  }

  $scope.dataDaily = [
    {label: "one", value: 12.2, color: "red"}, 
    {label: "two", value: 45, color: "#00ff00"},
    {label: "three", value: 10, color: "rgb(0, 0, 255)"}
  ];
  $scope.optionsDaily = {};

  // method called to update usage
  function update() {
    console.log("updating charts");
    // query the usage
    DeviceService.hourlyusage().then(function(data) {
      console.log('queried usage', data);
      // iterate through each record
      for (var j = 0; j < data.length; j++) {
      // parse the date
        var timestamp = Date.parse(data[j].record.date) / 1000;
        // get the measurements
        measurements = data[j].record.measurements;
        // fill in an entry for each circuit
        for (var i = 0; i < measurements.length; i++) {
          // map the circuit 
          var index = device.lookup[measurements[i].circuit];
          // extract the value
          var value = measurements[i]["power-in-kwh"];
          // fill in the data
          $scope.seriesHourly[i].data[j] = { 
            x: timestamp, 
            y: value
          }
        }
      }
      console.log(JSON.stringify($scope.seriesHourly));
      console.log('finished populating chart');
    });
  };

  // function called when live data is receifed
  function live(data) {
     console.log("handling data", data);
  };

  // register for notifications when data is received
  ConnectionService.subscribe(live);

  // do the initial update
  update();
})

.controller('SettingsCtrl', function($scope) {
});
