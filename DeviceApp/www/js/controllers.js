angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, Credentials) {
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
    // try to authenticate
    Credentials.login(device).then(function(device) {
      // authentication success - continue to tabs
      $state.go('tab.dash');
    }, function() {
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

.controller('DashCtrl', function($scope) {
})

.controller('SettingsCtrl', function($scope) {
});
