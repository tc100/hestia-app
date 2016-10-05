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

.controller('LeitorCtrl', function($scope, $state, $cookies, $cordovaBarcodeScanner) {
  $scope.user = {
    'nome': $cookies.get('nome'),
    'sobrenome': $cookies.get('sobrenome'),
    'email':$cookies.get('email')
  };

  document.addEventListener("deviceready", function () {
   $cordovaBarcodeScanner
     .scan()
     .then(function(barcodeData) {
       // Success! Barcode data is here
       alert("JSON: " + barcodeData.text);
     }, function(error) {
       // An error occurred
     });
 },
  {
      "preferFrontCamera" : true, // iOS and Android
      "showFlipCameraButton" : true, // iOS and Android
      "prompt" : "Scanneie o QRCode", // supported on Android only
      "formats" : "QR_CODE" // default: all but PDF_417 and RSS_EXPANDED
    //  "orientation" : "landscape"  Android only (portrait|landscape), default unset so it rotates with the device
  });
})

.controller('MenuCtrl', function($scope, $firebaseAuth, $ionicLoading, Users, $firebaseObject, $cookies){
  $scope.authObj = $firebaseAuth();
  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      var ref = firebase.database().ref('users/'+ firebaseUser.uid)
      var userObj = $firebaseObject(ref);
      $cookies.put("id",firebaseUser.uid);
      userObj.$loaded().then(function() {
        $scope.user = {};
        angular.forEach(userObj, function(value, key) {
          $scope.user[key] = value;
          $cookies.put(key,value);
        });


      });
    } else {
      console.log("Signed out");
    }
  });

})

.controller('PerfilCtrl', function($scope, $stateParams, $cookies) {
  $scope.user = {
    'nome': $cookies.get('nome'),
    'sobrenome': $cookies.get('sobrenome'),
    'email':$cookies.get('email')
  };
})

.controller('PerfilEdtCtrl', function($scope, $stateParams, $state, $cookies, Users) {
  $scope.user = {
    'nome': $cookies.get('nome'),
    'sobrenome': $cookies.get('sobrenome'),
    'email':$cookies.get('email')
  };
  $scope.atualizar = function(user){
    Users.updateUser(user.email, user.nome, user.sobrenome, $cookies.get('id'));
    angular.forEach(user, function(value, key) {
      $cookies.put(key,value);
    });
    $state.go('app.perfil');
  }
})

.controller('PagamentoCtrl', function($scope, $firebaseAuth,$firebaseObject, $cookies){
  var ref = firebase.database().ref('users/'+$cookies.get('id')+'/cartoes')
  var userObj = $firebaseObject(ref);
  userObj.$loaded().then(function() {
    $scope.cartao = {};
    angular.forEach(userObj, function(value, key) {
      $scope.cartao[key] = value;
      console.log(key+":"+value);
    });
  });
})

.controller('CartaoCtrl', function($scope, $stateParams, $state, Users, $cookies) {
  $scope.registrar = function(cartao){
    Users.addCard(cartao.numero, cartao.nome, cartao.mes, cartao.ano, $cookies.get('id'));
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
