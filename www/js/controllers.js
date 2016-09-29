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

.controller('LoginCtrl', function($scope, $state, $firebaseAuth) {
  $scope.authObj = $firebaseAuth();
  $scope.login = function(email,password){
    $scope.authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
      console.log("Signed in as:", JSON.stringify(firebaseUser));
      $state.go('tab.restaurantes');
    }).catch(function(error) {
      console.error("Authentication failed:", error);
    });
  }

  $scope.registrar = function(){
    $state.go('registrar');
  }
})

.controller('RegisterCtrl', function($scope, $state, $firebaseAuth) {
  $scope.authObj = $firebaseAuth();
  $scope.registrar = function(name, lastname,email,password){
    console.log("Email: " + $scope.email);
    console.log("Senha: " + $scope.password);
    $scope.authObj.$createUserWithEmailAndPassword(email,password)
      .then(function(firebaseUser) {
          console.log("User " + firebaseUser.uid + " created successfully!");
          $state.go('tab.restaurantes');
      }).catch(function(error) {
          console.error("Error: ", error);
      });
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
