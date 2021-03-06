// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'ngCordova', 'ngCordovaOauth'])
.constant('ApiEndpoint', {
  url: 'https://hestia-api2.mybluemix.net/apihestia'
  //url:'http://www.localhost:6001/apihestia'
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
  .state('restaurantes', {
    url: '/restaurantes',
    templateUrl: 'templates/tab-restaurantes.html',
    controller: 'RestaurantesCtrl'
  })
  .state('restauranteDetail', {
    url: '/restaurantesDetail',
    templateUrl: 'templates/restauranteDetail.html',
    controller: "RestauranteDetailCtrl",
    params: {
      restaurante: null
    }
  })
  .state('perfil', {
    url: '/perfil',
    templateUrl: 'templates/perfil.html',
    controller: 'PerfilCtrl'
  })
  .state('perfiledit', {
    url: '/perfiledit',
    templateUrl: 'templates/perfil-editar.html',
    controller: 'PerfilEdtCtrl'
  })
  .state('pagamento', {
    url: '/pagamento',
    templateUrl: 'templates/pagamento.html',
    controller: 'PagamentoCtrl'
  })
  .state('historico', {
    url: '/historico',
    templateUrl: 'templates/historico.html',
    controller: 'HistoricoCtrl'
  })
  .state('historicoDetail', {
    url: '/historicoDetail',
    templateUrl: 'templates/historicoDetalhes.html',
    controller: "HistoricoDtlCtrl",
    params: {
      historico: null
    }
  })
  .state('cartao', {
    url: '/cartao',
    templateUrl: 'templates/cartao.html',
    controller: 'CartaoCtrl'
  })
  .state('leitor', {
    url: '/leitor',
    templateUrl: 'templates/leitor.html',
    controller: 'LeitorCtrl'
  })
  .state('cardapio', {
    url: '/cardapio',
    templateUrl: 'templates/cardapio.html',
    controller: 'CardapioCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/restaurantes');

});
