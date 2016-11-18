angular.module('starter.controllers', [])

.controller('RestaurantesCtrl', function($scope, Restaurantes, $ionicLoading, $state, $cordovaGeolocation, $ionicPopup, userRef) {
  $scope.$on('$ionicView.enter', function() {
    if(typeof userRef.lista != null){
      var difference = new Date().getTime() - 600000;
      if(difference > userRef.lista){
        getRestaurantes();
      }
    }else{
      getRestaurantes();
    }
  });
  $scope.restaurantes =[];
  getRestaurantes();
  function calculateDistance(user, local) {
      var rad = function(x) { return x * Math.PI / 180;};
      var R = 6378137;
      var dLat = rad(local.lat - user.lat);
      var dLong = rad(local.long - user.long);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(user.lat)) * Math.cos(rad(local.lat)) *  Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      if(d > 999){return (Math.round(d)/1000).toFixed(2) + " km";}
      return d.toFixed(0) + " m";
  }
  $ionicLoading.show({
    template: "<ion-spinner icon='spiral'></ion-spinner>"
  });


  function getRestaurantes(){
    userRef["lista"] = new Date().getTime();
    Restaurantes.getListaRestaurantes().then(function successCallback(data){
      if(data != null){
        $scope.restaurantes =[];
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
            console.error("error geolocation ");
            //TODO: trocar a cor dos botoes do popup
            for(x in data.data){
              data.data[x].avaliacao = 0;
              data.data[x].comentarios = 0;
              data.data[x].distancia = 0;
              $scope.restaurantes.push(data.data[x]);
            }
            if(err.code == 1){
              $scope.showAlert = function() {
               var alertPopup = $ionicPopup.alert({
                 template: 'É necessário permitir que Hestia acesse sua localização em ajustes.'
               });
             };
             $scope.showAlert();
           }else{
             $scope.showAlert = function() {
              var alertPopup = $ionicPopup.alert({
                template: 'Ocorreu um error. Por favor, tente mais tarde.'
              });
            };
            $scope.showAlert();
          }
          $ionicLoading.hide();
         });
       }else{
         console.error("error service restaurante");
         $scope.showAlert = function() {
          var alertPopup = $ionicPopup.alert({
            template: 'Ocorreu um error. Por favor, tente mais tarde.'
          });
        };
        $scope.showAlert();
        $ionicLoading.hide();

       }
    });
  }
  $scope.loadRestaurante = function(restaurante){
    $state.go('restauranteDetail',{'restaurante': restaurante});
  }
})

.controller('RestauranteDetailCtrl', function($scope, $ionicLoading, $stateParams, $state, $cordovaGeolocation, $ionicLoading){

  $scope.$on('$ionicView.enter', function() {
    if($stateParams.restaurante == null){
      $state.go('restaurantes');
    }else{
      $scope.restaurante = $stateParams.restaurante;
      //Sobre
      var myLatLng = {lat: Number($scope.restaurante.local.lat), lng: Number($scope.restaurante.local.long)};
      var map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        draggable:false
      });
      var marker = new google.maps.Marker({
        map: map,
        position: myLatLng
      });
      //Fim sobre
      //Cardapio
      //TODO: Trocar para escolher cardapio do dia e hora
      $scope.cardapio = $scope.restaurante.cardapios[0];
      //fim cardapio
      //Avaliacoes
      $scope.avaliacoes = 0;
      //Fim Avaliacoes
    }
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
      $state.go("restaurantes");
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
          $state.go('restaurantes');
      }).catch(function(error) {
          console.error("Error: ", error);
          alert(error);
      });
  }
})

.controller('LeitorCtrl', function($scope, $state, $cordovaBarcodeScanner, userRef, Restaurantes, $ionicLoading) {
  $scope.user = userRef;
  $scope.cardapio = null;
  $scope.$on('$ionicView.enter', function() {
    if($scope.cardapio == null){
      $scope.readQRCode();
    }
    Restaurantes.getCardapios("58124c9f2eb1451704739b46").then(function(data){
      //TODO: TIRAR ESSA PARTE COLOCAR ALERTA
      $scope.cardapio = data[0];
      $ionicLoading.hide();
    })
  });
  $scope.readQRCode = function(){
      document.addEventListener("deviceready", function () {
       $cordovaBarcodeScanner
         .scan()
         .then(function(barcodeData) {
           // Success! Barcode data is here

           $ionicLoading.show({
             template: "<ion-spinner icon='spiral'></ion-spinner>"
           });
           var resultado = JSON.parse(barcodeData.text);
           Restaurantes.getCardapios(resultado.id).then(function(data){
             //TODO: Trocar para cardapio de dia e hora corretos
             $scope.cardapio = data[0];
             $ionicLoading.hide();
           })
         }, function(error) {
           // An error occurred
           Document.getElementById("alert").text("Escaneie o QRCode da Mesa");
         });
     },
      {
          "preferFrontCamera" : true,
          "showFlipCameraButton" : true,
          "prompt" : "Scanneie o QRCode",
          "formats" : "QR_CODE"
      });
  }

  //adicionar pratos
  $scope.prepareAddPrato = function(categoria, prato){
    //TODO: popup para escolher categorias e adicionar elas
    $scope.addPrato(categoria,prato);
  }
  $scope.prepareRmvPrato = function(categoria,prato){
    console.log("prato: " + JSON.stringify(prato));
    //TODO: Verificar se soh tem um, se for mais de 1 abrir popup para selecionar qual acompanhamento tirar; removePrato;
  }

  $scope.addPrato = function(categoria,prato){
    var foundCategoria = false;
    for(x in $scope.conta.categorias){
      if($scope.conta.categorias[x].nome == categoria){
        for(y in $scope.conta.categorias[x].pratos){
          if($scope.conta.categorias[x].pratos[y].nome == prato.nome){
            $scope.conta.categorias[x].pratos[y].quantidade = $scope.conta.categorias[x].pratos[y].quantidade++;
            for(z in prato.acompanhamentos){
              $scope.conta.categorias[x].pratos[y].acompanhamentos.push(prato.acompanhamentos[z]);
            }
          }
        }
        foundCategoria = true;
        break;
      }
    }
    if(!foundCategoria){
      var categoria= {
        "nome": categoria,
        "pratos": []
      };
      categoria.pratos.push(prato);
      $scope.conta.categorias.push(categoria);
    }
    $scope.conta = calculateTotal($scope.conta);
  }

   /*
      Metodos para mostrar e ocultar pratos
    */
   $scope.toggleGroup = function(cardapio) {
     cardapio["show"] = !cardapio["show"];
   };
   $scope.isGroupShown = function(cardapio) {
     return cardapio["show"];
   };

  //TODO: Fazer metodos para adicionar pratos e categorias novos e deixar essa scope dinamica
  $scope.conta = {
    "categorias": []
  };

  function calculateTotal(conta){
    conta.total = 0.0;
    for(x in conta.categorias){
      for(y in conta.categorias[x].pratos){
        conta.total = conta.total + ( parseFloat(conta.categorias[x].pratos[y].preco) * conta.categorias[x].pratos[y].quantidade);
      }
    }
    conta.total = parseFloat(0.0 + conta.total).toFixed(2);
    return conta;
  }
  $scope.conta = calculateTotal($scope.conta);



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
    $state.go('perfiledit');
  }
})

.controller('PerfilEdtCtrl', function($scope, $state, Users, userRef) {
  $scope.user = userRef;
  $scope.atualizar = function(user){
    Users.updateUser(user.email, user.nome, user.sobrenome, $scope.user.$id);
    $state.go('perfil');
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
  Restaurantes.getCardapio(restaurante,cardapio).then(function(error,data){
    if(error){
      console.log("error: " + error);
      $ionicLoading.hide();
      alert("Falha ao carregar. Tente novamente mais tarde !");
    }
    $scope.cardapio = data.data;
    $ionicLoading.hide();
  });

})

.controller('CartaoCtrl', function($scope, $state, Users, userRef) {
  $scope.registrar = function(cartao){
    Users.addCard(cartao.numero, cartao.nome, cartao.mes, cartao.ano, userRef.$id);
    $state.go('perfil');
  }
});
