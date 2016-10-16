// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'ngCordova'])
.constant('ApiEndpoint', {
  url: 'http://hestia-api.mybluemix.net/apihestia'
})
.value('userRef', {})
.config(function($ionicConfigProvider) {
    $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back');
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
    templateUrl: 'templates/menu.html',
    controller: 'MenuCtrl'
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
  .state('app.restauranteDetail', {
    url: '/restaurantesDetail',
    views: {
      'menuContent': {
        templateUrl: 'templates/restauranteDetail.html',
        controller: 'RestauranteDetailCtrl'
      }
    },
    params: {
      restaurante: null
    }
  })
  .state('app.restauranteDetail.cardapio', {
    url: '/cardapio',
    views: {
      'tabsContent': {
        templateUrl: 'templates/cardapio.html',
        controller: 'CardapioCtrl'
      }
    }
  })
  .state('app.restauranteDetail.mapa', {
    url: '/mapa',
    views: {
      'tabsContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })
  .state('app.restauranteDetail.avaliacoes', {
    url: '/avaliacoes',
    views: {
      'tabsContent': {
        templateUrl: 'templates/avaliacoes.html',
        controller: 'AvaliacoesCtrl'
      }
    }
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
  .state('app.pagamento', {
    url: '/pagamento',
    views: {
      'menuContent': {
        templateUrl: 'templates/pagamento.html',
        controller: 'PagamentoCtrl'
      }
    }
  })
  .state('app.cartao', {
    url: '/cartao',
    views: {
      'menuContent': {
        templateUrl: 'templates/cartao.html',
        controller: 'CartaoCtrl'
      }
    }
  })
  .state('app.leitor', {
    url: '/leitor',
    views: {
      'menuContent': {
        templateUrl: 'templates/leitor.html',
        controller: 'LeitorCtrl'
      }
    }
  })
  .state('app.cardapio', {
    url: '/cardapio',
    views: {
      'menuContent': {
        templateUrl: 'templates/cardapio.html',
        controller: 'CardapioCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

});
