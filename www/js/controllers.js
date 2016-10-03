angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('RestaurantesCtrl', function($scope, Restaurantes, $ionicLoading, $firebaseAuth, $firebaseObject) {
  $scope.restaurantes =[];
  $ionicLoading.show({
    template: "<ion-spinner icon='spiral'></ion-spinner>"
  });
  Restaurantes.getListaRestaurantes().then(function successCallback(data){
    for(x in data.data){
      $scope.restaurantes.push(data.data[x]);
    }
    $ionicLoading.hide();
  });

})

.controller('LoginCtrl', function($scope, $state, $firebaseAuth, Users) {
  $scope.authObj = $firebaseAuth();
  $scope.login = function(email,password){
    $scope.authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
    }).catch(function(error) {
      console.error("Authentication failed:", error);
      alert(error);
    });
  }

  $scope.registrar = function(){
    $state.go('registrar');
  }

  $scope.loginFacebook = function(){
    $scope.authObj.$signInWithRedirect("facebook").then(function() {
      // Never called because of page redirect
    }).catch(function(error) {
      console.error("Authentication failed:", error);
      alert(error);
    });
  }

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      $state.go("app.restaurantes");
    } else {
      console.log("Signed out");
    }
  });
})

.controller('RegisterCtrl', function($scope, $state, $firebaseAuth, Users) {
  $scope.authObj = $firebaseAuth();
  $scope.registrar = function(name, lastname,email,password){
    $scope.authObj.$createUserWithEmailAndPassword(email,password)
      .then(function(firebaseUser) {
          console.log("User " + firebaseUser.uid + " created successfully!");
          Users.addNewUser(email, name, lastname, firebaseUser.uid);
          $state.go('app.restaurantes');
      }).catch(function(error) {
          console.error("Error: ", error);
          alert(error);
      });
  }
})

.controller('MenuCtrl', function($scope, $firebaseAuth, $ionicLoading, Users, $firebaseObject){
  $scope.authObj = $firebaseAuth();
  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      var ref = firebase.database().ref('users/'+ firebaseUser.uid)
      var userObj = $firebaseObject(ref);
      userObj.$loaded().then(function() {
        $scope.user = userObj;
        sessionStorage.user = $scope.user;
      });
    } else {
      sessionStorage.user = null;
      console.log("Signed out");
    }
  });

  console.log("user: " + sessionStorage.user);
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
