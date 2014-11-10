angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, Credentials) {
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
    // try to authenticate
    Credentials.login(device).then(function() {
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
  // fetch the data for the form
  $scope.usage = Device.hourlyusage();

  // setup the rickshaw data
  $scope.options1 = { renderer: 'area' };
  $scope.series1 = [{
    name: 'Series 1',
    color: 'steelblue',
    data: [{x: 0, y: 23}, {x: 1, y: 15}, {x: 2, y: 79}, {x: 3, y: 31}, {x: 4, y: 60}]
  }, {
    name: 'Series 2',
    color: 'lightblue',
    data: [{x: 0, y: 30}, {x: 1, y: 20}, {x: 2, y: 64}, {x: 3, y: 50}, {x: 4, y: 15}]
  }];
})

.controller('SettingsCtrl', function($scope) {
});
