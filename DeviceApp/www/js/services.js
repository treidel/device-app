angular.module('starter.services', [])

/**
 * A service to manage login credentials
 */
.factory('Credentials', function($q, $rootScope) {

  return {
    // method to clear credentials
    clear: function() {
      console.log('clearing credentials');
      window.localStorage['device'] = undefined;
    },

    // method to store credentials
    set: function(credential) {
      console.log('storing credentials', credential);
      // store credentials in local storage
      window.localStorage['device'] = JSON.stringify(credential);
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
 * A service to manage connections to the central service
 */
.factory('Connection', function($q, $rootScope, $http, Credentials, websocketUrl) {

  // module variable that holds the client 
  var client = undefined;

  // module variable that holds the subscription state
  var subscription = undefined;

  return {
    // method to initiate a connection to the central server, returns a deferred response
    connect: function() {
      // create a deferred response
      var defer = $q.defer();
      // if we're already connected just return
      if (client) {
         console.log('already connected');
         // we're already good
         defer.resolve();
         // return the promise
         return defer.promise();
      }
      console.log('connecting to ' + websocketUrl);
      // setup HTTP authentication
      var credential = Credentials.get();
      // create the connection url
      var connectUrl = websocketUrl + '?device=' + credential.id + '&serialnumber=' + credential.serialnumber;
      try {
        // create the client
        client = Stomp.client(connectUrl);
        // connect
        client.connect({}, function() {
          console.log('connected');
          // send back success
          defer.resolve();
        }, function(error) {
          console.log('error connecting', error);
          // clear the client
          client = undefined;
          // tell them it failed
          defer.reject('stomp connection failed', error);
        });
      } catch (err) {
        console.log('websocket connection failed', error);
        // fail the promise
        defer.reject('unable to connect', error); 
      }
      // return the promise
      return defer.promise;
    },

    // method to disconnect from remote server
    disconnect: function () {
      console.log('disconnecting'); 
      // trigger a disconnect
      client.disconnect();
      // clear the clinet
      client = undefined; 
    },
    
    // method to subscribe to notifications
    subscribe: function(handler) {
      console.log('subscribing to notifications');
      // subscribe to be notified 
      subscription = client.subscribe('/topic/device/notifications', function(notification) {
        console.log('notification', notification);
        // invoke the notification handler
        handler.call(notification);
      });
    }, 

    // method to unsubscribe from notifications
    unsubscribe: function() {
      console.log('unsubscribing from notifications');
      subscription.unsubscribe();
      subscription = undefined;
    }
  };
})

/**
 * A service to query device information
 */
.factory('Device', function(Restangular, Credentials, restUrl, $q, $http) {
 
  // set the URL for the REST library 
  Restangular.setBaseUrl(restUrl);

  return {
    device: function() {
      // create a deferred response
      var defer = $q.defer();
      // setup HTTP authentication
      var credential = Credentials.get();
      var encoded = Base64.encode(credential.id + ':' + credential.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
      // do a REST call  
      Restangular.one('device').get().then(function(response) {
        console.log('queried device', response);
        // send back success
        defer.resolve(response.device);
      }, function(response) {
        console.log('error querying device', response);
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
      // setup HTTP authentication
      var credential = Credentials.get();
      var encoded = Base64.encode(credential.id + ':' + credential.serialnumber);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
      // do a REST call
      Restangular.all('usage/hourly').getList().then(function(response) {
        console.log('queried hourly usage', response);
        // send back success
        defer.resolve(response);
      }, function(response) {
        console.log('error querying hourly usage', response);
        // tell them it failed
        defer.reject();
      });
      // return the promise
      return defer.promise
    },
  };
});
