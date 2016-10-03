// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase'])
.constant('ApiEndpoint', {
  url: 'http://hestia-api.mybluemix.net/apihestia'
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.defaults.useXDomain = true;
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('registrar', {
    url: '/registrar',
    templateUrl: 'templates/registrar.html',
    controller: 'RegisterCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  })
  .state('app.perfil', {
    url: '/perfil',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    }
  })
  .state('app.perfiledit', {
    url: '/perfiledit',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil-editar.html',
        controller: 'PerfilEdtCtrl'
      }
    }
  })

  .state('app.restaurantes', {
    url: '/restaurantes',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-restaurantes.html',
        controller: 'RestaurantesCtrl'
      }
    }
  })


  // setup an abstract state for the tabs directive
/*  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.restaurantes', {
      url: '/restaurantes',
      views: {
        'tab-restaurantes': {
          templateUrl: 'templates/tab-restaurantes.html',
          controller: 'RestaurantesCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('lista', {
    url: '/lista',
    views: {
      'lista-restaurantes': {
        templateUrl: 'templates/lista-restaurantes.html',
        controller: 'ListaRestaurantesCtrl'
      }
    }
  })*/;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

});
