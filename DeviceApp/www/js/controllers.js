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

  // setup a lookup table to map circuit names to a constant index
  $scope.deviceLookup = {};
  // initialize lookup table
  for (var circuit = 0; circuit < device.circuits.length; circuit++) {
    $scope.deviceLookup[device.circuits[circuit].name] = circuit;
  }
  
  // initiaize chart data 
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
  var paletteLive = new Rickshaw.Color.Palette();
  $scope.seriesLive = [];
  for(var circuit in device.circuits) { 
    $scope.seriesLive[circuit] = {
      name : device.circuits[circuit].name, 
      color: paletteLive.color(),
      data : []
    };
  }
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
    console.log("updating charts");
    // query the usage
    DeviceService.hourlyusage().then(function(data) {
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
