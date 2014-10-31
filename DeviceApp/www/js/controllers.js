angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup) {
  $scope.signIn = function(device) {
    console.log('Log-In', device);
    if(!device) {
      var popup = $ionicPopup.alert({ 
                    title: 'Need Device ID and serial number'
      });
      alertPopup.then(function(res) {
        console.log('Alert complete')
      });
    } else {
      $state.go('tab.dash');
    }
  };
  
})

.controller('DashCtrl', function($scope) {
})

.controller('SettingsCtrl', function($scope) {
});
