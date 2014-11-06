angular.module('starter.services', [])

/**
 * A service to manage login credentials
 */
.factory('Credentials', function(Restangular, $q, $http) {

  return {
    // method to test login credentials
    login: function(device) {
      // create a deferred response
      var defer = $q.defer();

      // configure the authentication
      var encoded = Base64.encode(device.id + ':' + device.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;

      // do a REST call
      Restangular.one('device').get().then(function(device) {
        console.log('queried device', device);
        // success, store credentials
        window.localStorage['device.id'] = device.id;
        window.localStorage['device.serialnumber'] = device.serialnumber;
        // send back the device
        defer.confirm(device);
      }, function() {
        console.log('error querying device', device);
        // clear existing credentials
        window.localStorage['device.id'] = '';
        window.localStorage['device.serialnumber'];
        defer.reject();
      });
      // return the promise
      return defer.promise
    },
    // method to return login credentials
    get: function() {
      // fetch from local storage
      var id = window.localStorage['device.id'];
      var serialnumber = window.localStorage['device.serialnumber'];
      var device = { id : id, serialnumber : serialnumber };
      return device;
    }
  };
});
