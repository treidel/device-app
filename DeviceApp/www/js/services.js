angular.module('starter.services', [])

/**
 * A service to manage login credentials
 */
.factory('Credentials', function(Restangular, $q, $http, $rootScope) {

  return {
    // method to test login credentials
    login: function(device) {
      // create a deferred response
      var defer = $q.defer();

      // configure the authentication
      var encoded = Base64.encode(device.id + ':' + device.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;

      // do a REST call
      Restangular.one('device').get().then(function(response) {
        console.log('queried device', device, response);
        // success, store credentials in local storage
        window.localStorage['device'] = JSON.stringify(device);
        // store in the service
        credentials = device;
        // send back the device
        defer.resolve();
      }, function() {
        console.log('error querying device', device);
        // clear existing credentials
        window.localStorage['device'] = undefined;
        // tell them it failed
        defer.reject();
      });
      // return the promise
      return defer.promise
    },
    // method to return login credentials
    get: function() {
      // fetch from local storage, might be undefined
      var deviceJSON = window.localStorage['device'];
      if (deviceJSON) {
        try {
          return JSON.parse(deviceJSON);
        } catch (err) { 
          console.log('invalid device in local storage, ignoring', deviceJSON);
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  };
})

/**
 * A service to query device information
 */
.factory('Device', function(Restangular, Credentials, $q, $http) {

  return {
    // method to query usage 
    hourlyusage: function() {
      // create a deferred response
      var defer = $q.defer();
      // get the device from the credential manager
      var device = Credentials.get();
      // configure the authentication
      var encoded = Base64.encode(device.id + ':' + device.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;

      // do a REST call
      Restangular.all('usage/hourly').getList().then(function(response) {
        console.log('queried hourly usage', device, response);
        // send back success
        defer.resolve();
      }, function() {
        console.log('error querying hourly usage', device);
        // tell them it failed
        defer.reject();
      });
      // return the promise
      return defer.promise
    },
  };
});
