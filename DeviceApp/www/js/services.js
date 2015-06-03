angular.module('starter.services', [])

/**
 * A service to manage login credentials
 */
.factory('Credentials', function(Restangular, $q, $http, $rootScope) {

  return {
    // method to test login credentials
    login: function(credential) {
      // create a deferred response
      var defer = $q.defer();

      // configure authentication
      this.configure(credential);

      // do a REST call
      Restangular.one('device').get().then(function(response) {
        console.log('authenticated', credential, response);
        // success, store credentials in local storage
        window.localStorage['device'] = JSON.stringify(credential);
        // send back success
        defer.resolve();
      }, function() {
        console.log('error authenticating', credential);
        // clear existing credentials
        window.localStorage['device'] = undefined;
        // tell them it failed
        defer.reject();
      });
      // return the promise
      return defer.promise
    },

    // method to configure HTTP authentication
    configure: function (credential) {
      var encoded = Base64.encode(credential.id + ':' + credential.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
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
    device: function() {
      // create a deferred response
      var defer = $q.defer();
      // get the credential 
      var credential = Credentials.get();
      // configure the authentication
      Credentials.configure(credential);
      // do a REST call  
      Restangular.one('device').get().then(function(response) {
        console.log('queried device', credential, response);
        // send back success
        defer.resolve(response);
      }, function() {
        console.log('error querying device', credential);
        // tell them it failed
        defer.reject();
      });
      // return the promise
      return defer.promise
    },

    // method to query usage 
    hourlyusage: function() {
      // create a deferred response
      var defer = $q.defer();
      // get the credential 
      var credential = Credentials.get();
      // configure the authentication
      Credentials.configure(credential);
      // do a REST call
      Restangular.all('usage/hourly').getList().then(function(response) {
        console.log('queried hourly usage', response);
        // send back success
        defer.resolve(response);
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
