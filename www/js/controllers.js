angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('RestaurantesCtrl', function($scope, Restaurantes, $ionicLoading) {
  $scope.restaurantes =[];
  $ionicLoading.show({
    template: "<ion-spinner icon='spiral'></ion-spinner>"
  });
  Restaurantes.getListaRestaurantes().then(function successCallback(data){
    for(x in data.data){
      $scope.restaurantes.push(data.data[x]);
    }
    $ionicLoading.hide();
  })
})

.controller('LoginCtrl', function($scope, $state) {
  $scope.login = function(){
    $state.go('tab.restaurantes');
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
