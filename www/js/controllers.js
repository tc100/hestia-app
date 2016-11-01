angular.module('starter.controllers', [])

.controller('RestaurantesCtrl', function($scope, Restaurantes, $ionicLoading, $state, $cordovaGeolocation) {
  $scope.restaurantes =[];
  var geocoder = new google.maps.Geocoder();

  function calculateDistance(user, local) {
      var rad = function(x) {
        return x * Math.PI / 180;
      };

      var R = 6378137;
      var dLat = rad(local.lat - user.lat);
      var dLong = rad(local.long - user.long);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(user.lat)) * Math.cos(rad(local.lat)) *  Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      if(d > 999){
        return (Math.round(d)/1000).toFixed(2) + " km";
      }
      return d.toFixed(0) + " m";

  }
  $ionicLoading.show({
    template: "<ion-spinner icon='spiral'></ion-spinner>"
  });
  Restaurantes.getListaRestaurantes().then(function successCallback(data){
    var posOptions = {timeout: 5000, enableHighAccuracy: false};
    var userLocation={};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        userLocation = {
          'lat': position.coords.latitude,
          'long': position.coords.longitude
        }
        for(x in data.data){
          data.data[x].avaliacao = 0;
          data.data[x].comentarios = 0;
          data.data[x].distancia = calculateDistance(userLocation,data.data[x].local);
          $scope.restaurantes.push(data.data[x]);
        }
        $ionicLoading.hide();
      }, function(err) {
        //TODO: COLOCAR MENSAGEM DE ERRO
      });
  });

  $scope.loadRestaurante = function(restaurante){
    $state.go('app.restauranteDetail',{'restaurante': restaurante});
  }
})

.controller('RestauranteDetailCtrl', function($scope, Restaurantes, $ionicLoading, $stateParams, $state){
  if($stateParams.restaurante == null){
    $state.go('app.restaurantes');
  }else{
    console.log("restaurante: " + JSON.stringify($stateParams.restaurante));
    $scope.restaurante = $stateParams.restaurante;
  }
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

.controller('LeitorCtrl', function($scope, $state, $cordovaBarcodeScanner, userRef) {
  $scope.user = userRef;
  $scope.$on('$ionicView.enter', function() {
    initializateCamera();
  });

  function initializateCamera(){
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
  }

})

.controller('MenuCtrl', function($scope, $firebaseAuth, $ionicLoading, Users, $firebaseObject, userRef){
  $scope.authObj = $firebaseAuth();
  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      var ref = firebase.database().ref('users/'+ firebaseUser.uid)
      var userObj = $firebaseObject(ref);
      userObj.$bindTo($scope, "user").then(function() {
        angular.forEach($scope.user, function(value, key) {
          userRef[key] = value;
        });
      });
    } else {
      userRef = {};
      console.log("Signed out");
    }
  });

})

.controller('PerfilCtrl', function($scope, userRef,  $state) {
  $scope.user = userRef;
  $scope.editarCadastro = function(){
    $state.go('app.perfiledit');
  }
})

.controller('PerfilEdtCtrl', function($scope, $state, Users, userRef) {
  $scope.user = userRef;
  $scope.atualizar = function(user){
    Users.updateUser(user.email, user.nome, user.sobrenome, $scope.user.$id);
    $state.go('app.perfil');
  }
})

.controller('PagamentoCtrl', function($scope, userRef){
  $scope.cartoes = userRef.cards;
})

.controller('CardapioCtrl', function($scope, $state, Restaurantes, $ionicLoading){
  var restaurante='57ba4c654eb63d4ba8a21367';
  var cardapio='domingo';
  $scope.cardapio ={};
  $ionicLoading.show({
    template: "<ion-spinner icon='spiral'></ion-spinner>"
  });
  Restaurantes.getCardapio(restaurante,cardapio).then(function successCallback(data){
    $scope.cardapio = data.data;
    console.log(data.data);
    $ionicLoading.hide();
  });

})

.controller('CartaoCtrl', function($scope, $state, Users, userRef) {
  $scope.registrar = function(cartao){
    Users.addCard(cartao.numero, cartao.nome, cartao.mes, cartao.ano, userRef.$id);
    $state.go('app.perfil');
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});
