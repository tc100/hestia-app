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

.controller('LoginCtrl', function($scope, $state, $firebaseAuth, Users, $ionicHistory) {
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
      $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
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

.controller('LeitorCtrl', function($scope, $state, $cordovaBarcodeScanner, userRef, Restaurantes, $ionicLoading, $ionicPopup, $ionicModal) {
  $scope.user = userRef;
  $scope.cardapio = null;
  $scope.conta = {
    "categorias": []
  };
  $scope.$on('$ionicView.enter', function() {
    if($scope.cardapio == null){
      $scope.readQRCode();
    }
    Restaurantes.getCardapios("582f972278751e9c2342be83").then(function(data){
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
           $ionicLoading.show({
             template: "<ion-spinner icon='spiral'></ion-spinner>"
           });
           var resultado = JSON.parse(barcodeData.text);
           if(typeof resultado.id != "undefined"){
             Restaurantes.getCardapios(resultado.id).then(function(data){
               //TODO: Trocar para cardapio de dia e hora corretos
               $scope.cardapio = data[0];
               $ionicLoading.hide();
             })
           }else{
             $ionicLoading.hide();
             $scope.alertText = "Escaneie o QRCode da Mesa";
           }
         }, function(error) {
           $ionicLoading.hide();
           $scope.alertText = "Erro ao scannear: " + JSON.stringify(error);
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
    $scope.quantidadeAcompanhamento = 0;
    $scope.acompanhamentos = [];
    $scope.numeroDeAcompanhamentos = prato.numeroDeAcompanhamentos;
    $scope.botaoText = "Não quero Acompanhamentos";
    var textModal = '<ion-modal-view>' +
                      '<ion-header-bar>' +
                        '<h1 class="title">Acompanhamentos</h1>' +
                      '</ion-header-bar>' +
                      '<ion-content class="teste">' +
                      //TODO: ADD DIVIDER COM numeroDeAcompanhamentos incluidos
                      '<ion-list>'+
                      '<div class="item-divider" type="item-text-wrap" style="text-align:center;" >' +
                        "Acompanhamentos incluídos: {{numeroDeAcompanhamentos}}" +
                      '</div>';
    for(x in prato.acompanhamentos){
      textModal = textModal + '<ion-item item="item">' +
                                '<label class="checkbox">' +
                                  '<input type="checkbox" ng-model="acompanhamento'+x+'" ng-true-value="'+x+'" ng-false-value=null ng-change="checkAcompanhamento(acompanhamento'+x+')">' +
                                '</label>' +
                                //TODO: Trocar para aparecer nome e preco com a atualizacao da API e WEB
                                prato.acompanhamentos[x].nome  +
                                '<span class="pull-right" ng-show="numeroDeAcompanhamentos==0 ? true : false">' + prato.acompanhamentos[x].preco +
                              '</span></ion-item>';
    }
    textModal = textModal+ '</ion-list>' +
                      '</ion-content>' +
                      '<div class="footer-pedido">' +
                      '<button class="button button-full btn-footer" ng-click="savePrato()">{{botaoText}}</button></div>' +
                    '</ion-modal-view>';

    //Add acompanhamentos na variavel e tira
    $scope.checkAcompanhamento = function(check){
      if(check == null){
        if($scope.quantidadeAcompanhamento != 0){
          if($scope.quantidadeAcompanhamento == 1){
            $scope.acompanhamentos = [];
          }else{
            //retirando da variavel de acompanhamentos
            for(x in $scope.acompanhamentos){
              //TODO: TROCAR PARA NOME
              if($scope.acompanhamentos[x].nome == prato.acompanhamentos[x].nome){
                $scope.acompanhamentos.splice(x,1);
              }
            }
          }
          $scope.quantidadeAcompanhamento = $scope.quantidadeAcompanhamento -1
        }else
          $scope.quantidadeAcompanhamento = 0;
      }else{
        //adiciona no array de acompanhamentos
        if($scope.acompanhamentos.length != 0)
          $scope.acompanhamentos.push(prato.acompanhamentos[check]);
        else{
          $scope.acompanhamentos.push({
            "nome": prato.acompanhamentos[check].nome,
            "preco": "0.00"
          });
        }
        $scope.quantidadeAcompanhamento++;
      }
      if($scope.quantidadeAcompanhamento != 0){
        $scope.botaoText = "Selecionado(s): " + $scope.quantidadeAcompanhamento;
      }else{
        $scope.botaoText = "Não quero Acompanhamentos";
      }
      var diferenca = prato.numeroDeAcompanhamentos - $scope.quantidadeAcompanhamento;
      $scope.numeroDeAcompanhamentos = (diferenca >= 0 ) ? diferenca : 0;
    }

    $scope.savePrato = function(){
      var pratoAux = JSON.parse(JSON.stringify(prato));
      pratoAux.acompanhamentos = $scope.acompanhamentos;
      $scope.addPrato(categoria,pratoAux);
      $scope.closeModal();
    }

    $scope.modal =  $ionicModal.fromTemplate(textModal, {
      scope: $scope,
      animation: 'slide-in-up'
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.openModal();

    $scope.closeModal = function() {
      $scope.modal.hide();
    };
  }

  $scope.prepareRmvPrato = function(categoria,prato){
    var auxAcompanhamento = false;

    for(x in $scope.conta.categorias){
      if($scope.conta.categorias[x].nome == categoria){
        for(y in $scope.conta.categorias[x].pratos){
          if($scope.conta.categorias[x].pratos[y].nome == prato.nome){
            if($scope.conta.categorias[x].pratos[y].quantidade > 1){
                var textModal = '<ion-modal-view>' +
                                  '<ion-header-bar>' +
                                    '<h1 class="title">Acompanhamentos</h1>' +
                                  '</ion-header-bar>' +
                                  '<ion-content >' +
                                  '<ion-list >';
                for(z in $scope.conta.categorias[x].pratos[y].acompanhamentos){
                  textModal = textModal + '<ion-radio ng-model="acompanhamento" ng-value='+z+'>' + $scope.conta.categorias[x].pratos[y].acompanhamentos[z].nome +'</ion-radio>' ;
                }
                textModal = textModal+ '</ion-list>' +
                                    '</ion-content>' +
                                    '<div class="footer-tira-acompanhamento">' +
                                    '<button class="button button-full btn-footer" ng-click="deletePrato('+x+','+y+',acompanhamento)">Confirmar</button></div>' +
                                '</ion-modal-view>';


                $scope.modal =  $ionicModal.fromTemplate(textModal, {
                  scope: $scope,
                  animation: 'slide-in-up'
                });
                $scope.openModal = function() {
                  $scope.modal.show();
                };
                $scope.openModal();

                $scope.closeModal = function() {
                  $scope.modal.hide();
                };
            }else{
              $scope.conta.categorias[x].pratos.splice(y,1);
              $scope.conta = calculateTotal($scope.conta);
            }
            //Apagando categoria se não tiver prato na categoria
            if($scope.conta.categorias[x].pratos.length  == 0){
              $scope.conta.categorias.splice(x,1);
              $scope.conta = calculateTotal($scope.conta);
            }
          }
        }
        break;
      }
    }
    $scope.deletePrato = function(catNum,pratoNum,acomp){
      $scope.conta.categorias[catNum].pratos[pratoNum].acompanhamentos.splice(acomp,1);
      $scope.conta.categorias[catNum].pratos[pratoNum].quantidade--;
      $scope.closeModal();
      $scope.conta = calculateTotal($scope.conta);
    }

  }

  $scope.addPrato = function(categoria,prato){
    var foundCategoria = false;
    for(x in $scope.conta.categorias){
      if($scope.conta.categorias[x].nome == categoria){
        for(y in $scope.conta.categorias[x].pratos){
          if($scope.conta.categorias[x].pratos[y].nome == prato.nome){
            $scope.conta.categorias[x].pratos[y].quantidade = $scope.conta.categorias[x].pratos[y].quantidade + 1;
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


  function calculateTotal(conta){
    conta.total = 0.0;
    for(x in conta.categorias){
      for(y in conta.categorias[x].pratos){
        conta.total = conta.total + ( parseFloat(conta.categorias[x].pratos[y].preco) * conta.categorias[x].pratos[y].quantidade);
        for(z in conta.categorias[x].pratos[y].acompanhamentos){
          conta.total = conta.total + parseFloat(conta.categorias[x].pratos[y].acompanhamentos[z].preco);
        }
      }
    }
    conta.total = parseFloat(0.0 + conta.total).toFixed(2);
    return conta;
  }
  $scope.conta = calculateTotal($scope.conta);



})

.controller('MenuCtrl', function($scope, $firebaseAuth, $ionicLoading, Users, $firebaseObject, userRef, $state){
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
      $state.go('login');
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
