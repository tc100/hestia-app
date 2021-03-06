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
              if (typeof data.data[x].avaliacao == "undefined"){
                data.data[x].avaliacao = 0;
                data.data[x].comentario = 0;
              }
              data.data[x].distancia = calculateDistance(userLocation,data.data[x].local);
              $scope.restaurantes.push(data.data[x]);
            }
            $ionicLoading.hide();
          }, function(err) {
            console.error("error geolocation ");
            //TODO: trocar a cor dos botoes do popup
            for(x in data.data){
              if (typeof data.data[x].avaliacao == "undefined"){
                data.data[x].avaliacao = 0;
                data.data[x].comentario = 0;
              }
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
      if(typeof $scope.restaurante.cardapios != 'undefined')
        $scope.cardapio = $scope.restaurante.cardapios[0];
      //fim cardapio
      //Avaliacoes
      $scope.avaliacoes = 0;
      //Fim Avaliacoes
      // comentarios

    if(typeof $scope.restaurante.comentarios != 'undefined')
      $scope.comentarios = $scope.restaurante.comentarios;
      // fim comentarios
    }
  });
})

.controller('LoginCtrl', function($scope, $state, $firebaseAuth, Users, $ionicHistory, $ionicPopup, $cordovaOauth, userRef, $firebaseObject) {
  $scope.authObj = $firebaseAuth();
  $scope.login = function(email,password){
    $scope.authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
    }).catch(function(error) {
      $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         template: 'Usuario ou senha incorretos.'
       });
      };
      $scope.showAlert();
    });
  }

  $scope.registrar = function(){
    $state.go('registrar');
  }

  $scope.loginFacebook = function(){
    $cordovaOauth.facebook("1698619603791510", ["email"]).then(function(result) {
        //implementar
      }, function(error) {
      alert("error: " + error)

    });
  /*  $scope.authObj.$authWithOAuthPopup("facebook").then(function(authData) {
      // Never called because of page redirect
    }).catch(function(error) {
      console.error("Authentication failed:", error);
      $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         template: 'Erro ao conectar com o facebook.'
       });
      };
      alert(JSON.stringify(error));
      $scope.showAlert();
    });*/
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

.controller('RegisterCtrl', function($scope, $state, $firebaseAuth, Users, $ionicHistory) {
  $scope.authObj = $firebaseAuth();
  $scope.registrar = function(name, lastname,email,password){
    $scope.authObj.$createUserWithEmailAndPassword(email,password)
      .then(function(firebaseUser) {
          console.log("User " + firebaseUser.uid + " created successfully!");
          Users.addNewUser(email, name, lastname, firebaseUser.uid);
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $state.go('restaurantes');
      }).catch(function(error) {
          console.error("Error: ", error);
          alert(error);
      });
  }
})

.controller('LeitorCtrl', function($scope, Restaurantes, $ionicTabsDelegate, $state, $cordovaBarcodeScanner, userRef, Users, Restaurantes, $ionicLoading, $ionicPopup, $ionicModal) {
  $scope.user = userRef;
  $scope.cartoes = $scope.user.cards;
  $scope.cardapio = null;
  $scope.restauranteId = "";
  $scope.restauranteNome = "";
  $scope.mesa = 0;
  $scope.ContaID = null;
  $scope.showPagarTab = false;
  $scope.pedido = {
    "categorias": [],
    "total": 0
  };
  $scope.conta = {
    "categorias": [],
    "total": 0
  };
  $scope.$on('$ionicView.enter', function() {
    if($scope.cardapio == null){
      $scope.readQRCode();
    }
  });

  $scope.readQRCode = function(){
      document.addEventListener("deviceready", function () {
       $cordovaBarcodeScanner
         .scan()
         .then(function(barcodeData) {
           $ionicLoading.show({
             template: "<ion-spinner icon='spiral'></ion-spinner>"
           });
           if(barcodeData.text != ""){
             var resultado = JSON.parse(barcodeData.text);
             $scope.restauranteId = resultado.id;
             $scope.mesa = resultado.mesa;
             $scope.restauranteNome = resultado.nomerestaurante;
             Restaurantes.getCardapios($scope.restauranteId).then(function(data){
               $scope.cardapio = data;
               $ionicLoading.hide();
             }, function(err){
               console.erro("erro ao pegar cardapio");
               $ionicLoading.hide();
            });

            }else{
              $ionicLoading.hide();
            }
         }, function(error) {
           $ionicLoading.hide();
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
                      '<ion-list>'+
                      '<div class="item-divider" type="item-text-wrap" style="text-align:center;" >' +
                        "Acompanhamentos incluídos: {{numeroDeAcompanhamentos}}" +
                      '</div>';
    for(x in prato.acompanhamentos){
      textModal = textModal + '<ion-item item="item">' +
                                '<label class="checkbox">' +
                                  '<input type="checkbox" ng-model="acompanhamento'+x+'" ng-true-value="'+x+'" ng-false-value=null ng-change="checkAcompanhamento(acompanhamento'+x+')">' +
                                '</label>' +
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
        if($scope.numeroDeAcompanhamentos == 0)
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
    for(x in $scope.pedido.categorias){
      if($scope.pedido.categorias[x].nome == categoria){
        for(y in $scope.pedido.categorias[x].pratos){
          if($scope.pedido.categorias[x].pratos[y] == prato){
            $scope.pedido.categorias[x].pratos.splice(y,1);
            if($scope.pedido.categorias[x].pratos.length  == 0){
              $scope.pedido.categorias.splice(x,1);
            }
            $scope.pedido = calculateTotal($scope.pedido);
            break;
          }
        }
      }
    }
  }

  $scope.addPrato = function(categoria,prato){
    var foundCategoria = false;
    for(x in $scope.pedido.categorias){
      if($scope.pedido.categorias[x].nome == categoria){
        $scope.pedido.categorias[x].pratos.push(prato);
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
      $scope.pedido.categorias.push(categoria);
    }
    $scope.pedido = calculateTotal($scope.pedido);
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

   $scope.showAvaliacao = function()
   {
     //Setting the default values, if they are not passed
     $scope.rating = 0;
     $scope.minRating = 0;

     //Setting the rating
     $scope.rating = ($scope.rating > $scope.minRating) ? $scope.rating : $scope.minRating;
     var textModal = '<ion-modal-view>' +
                       '<ion-header-bar>' +
                         '<h1 class="title">Avaliação</h1>' +
                       '</ion-header-bar>' +
                       '<ion-content class="avaliacao">' +
                       '<ion-item class="item text-center ionic_ratings">'+
                         '<span class="icon ion-ios-star-outline ionic_rating_icon_off" ng-click="ratingsClicked(1)" ng-if="rating < 1" ></span>' +
                         '<span class="icon ion-ios-star ionic_rating_icon_on"  ng-click="ratingsUnClicked(1)" ng-if="rating > 0" ></span>' +
                         '<span class="icon ion-ios-star-outline ionic_rating_icon_off"  ng-click="ratingsClicked(2)" ng-if="rating < 2" ></span>' +
                         '<span class="icon ion-ios-star ionic_rating_icon_on"  ng-click="ratingsUnClicked(2)" ng-if="rating > 1" ></span>' +
                         '<span class="icon ion-ios-star-outline ionic_rating_icon_off"  ng-click="ratingsClicked(3)" ng-if="rating < 3" ></span>' +
                         '<span class="icon ion-ios-star ionic_rating_icon_on"  ng-click="ratingsUnClicked(3)" ng-if="rating > 2" ></span>' +
                         '<span class="icon ion-ios-star-outline ionic_rating_icon_off"  ng-click="ratingsClicked(4)" ng-if="rating < 4" ></span>' +
                         '<span class="icon ion-ios-star ionic_rating_icon_on"  ng-click="ratingsUnClicked(4)" ng-if="rating > 3" ></span>' +
                         '<span class="icon ion-ios-star-outline ionic_rating_icon_off"  ng-click="ratingsClicked(5)" ng-if="rating < 5" ></span>' +
                         '<span class="icon ion-ios-star ionic_rating_icon_on"  ng-click="ratingsUnClicked(5)" ng-if="rating > 4" ></span>' +
                       '</ion-item>'+
                         '<ion-item class="item item-input-inset">'+
                          '<label class="item-input-wrapper">'+
                           '<input type ="text" placeholder="Comentário" id="comentario">'+
                          '</label>'+
                         '</ion-item>'+
                        '</ion-content>' +
                       '<div class="footer-pedido">' +
                       '<button class="button button-full btn-footer" ng-click="avaliar()">Enviar Avaliação</button></div>' +
                     '</ion-modal-view>';

       $scope.modal =  $ionicModal.fromTemplate(textModal, {
         scope: $scope,
         animation: 'slide-in-up'
       });
       //Setting the previously selected rating
       $scope.prevRating = 0;

       $scope.avaliar = function() {
         var comentario = document.getElementById("comentario").value;
         var userEmail = userRef.email;
         var nota = Number($scope.rating);
         Restaurantes.postComentarios($scope.restauranteId,nota,comentario,userEmail);
         $scope.closeModal();
       }
       function setRating(val, uiEvent) {
         if ($scope.minRating !== 0 && val < $scope.minRating) {
           $scope.rating = $scope.minRating;
         } else {
           $scope.rating = val;
         }
         $scope.prevRating = val;
      }

       //Called when he user clicks on the rating
       $scope.ratingsClicked = function(val) {
         setRating(val, true);
       };

       //Called when he user un clicks on the rating
       $scope.ratingsUnClicked = function(val) {
         if ($scope.minRating !== 0 && val < $scope.minRating) {
           $scope.rating = $scope.minRating;
         } else {
           $scope.rating = val;
         }
         if ($scope.prevRating == val) {
           if ($scope.minRating !== 0) {
             $scope.rating = $scope.minRating;
           } else {
             $scope.rating = 0;
           }
         }
         $scope.prevRating = val;
       };

       $scope.openModal = function() {
         $scope.modal.show();
       };

       $scope.openModal();

       $scope.closeModal = function() {
         $scope.modal.hide();
         $scope.showPagarTab = false;
       };
   }
   $scope.showPagamento = function()
   {
     $scope.cartoes = $scope.user.cards;
     var textModal = '<ion-modal-view>' +
                       '<ion-header-bar>' +
                         '<h1 class="title">Forma de Pagamento</h1>' +
                       '</ion-header-bar>' +
                       '<ion-content class="pagamento">' +
                       '<ion-list>'+
                       '<div class="item-divider" type="item-text-wrap" style="text-align:center;" >' +
                         "<b>Cartão</b>" +
                       '</div>'+
                       '<button ng-click = "selectCard({{cartao}})" class="item item-icon-right" ng-repeat="cartao in cartoes">'+
                         '<i class="icon ion-card"></i>'+
                         '<label><b>{{cartao.nome}} ...</b><label class= "pull-right">{{cartao.numero}}</label></label>'+
                       '</button>'+
                       '<div class="item-divider" type="item-text-wrap" style="text-align:center;" >' +
                         "<b>Dinheiro</b>" +
                       '</div>'+
                       '<button class="item item-icon-right" >'+
                         '<i class="icon ion-cash"></i>'+
                         '<label><b>Pagar em Dinheiro</b><label class= "pull-right">Chamar Gaçon</label></label>'+
                       '</button>'+
                       '</ion-list>' +
                       '</ion-content>' +
                       '<div class="footer-pedido">' +
                       '<button class="button button-full btn-footer" ng-click="closeModal()">Cancelar</button></div>' +
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

       $scope.selectCard = function(cartao)
       {
         //fazer validação com o cartão depois fechar conta fechar modall e abrir outra
         Users.closeConta($scope.restauranteId, $scope.ContaID);
         $scope.cardapio = null;
         $scope.ContaID = null;
         $ionicTabsDelegate.select(0);
         $scope.pedido = {
           "categorias": [],
           "total": 0
         };
         $scope.conta = {
           "categorias": [],
           "total": 0
         };
         $scope.closeModal();
         $scope.showAvaliacao();

       }
   }

  $scope.sendPedido = function(){
    if($scope.pedido.categorias.length>0){
      $scope.showPagarTab = true;
      if($scope.ContaID == null)
      {
        $scope.ContaID = Users.addConta($scope.restauranteId, $scope.user.$id);
      }
      if($scope.ContaID != null)
      {
        var total = 0;
        if($scope.conta.categorias.length == 0)
        {
          total = Number($scope.pedido.total);
        }
        else
        {
          total = Number($scope.pedido.total) + Number($scope.conta.total);
        }
        Users.addPedido($scope.pedido.categorias, $scope.restauranteId, $scope.mesa, $scope.user.$id, $scope.ContaID, total);
        Users.addHistorico($scope.pedido.categorias, $scope.restauranteNome, $scope.mesa, $scope.user.$id, $scope.ContaID, total);
      }
      if($scope.conta.categorias.length == 0){
        $scope.conta = $scope.pedido;
      }
      else
      {
        for(x in $scope.pedido.categorias){
          for(x2 in $scope.conta.categorias){
            if($scope.pedido.categorias[x].nome == $scope.conta.categorias[x2].nome){
              for(y in $scope.pedido.categorias[x].pratos){
                $scope.conta.categorias[x2].pratos.push($scope.pedido.categorias[x].pratos[y]);
                $scope.pedido.categorias[x].pratos.splice(y,1);
                if($scope.pedido.categorias[x].pratos.length == 0){
                  $scope.pedido.categorias.splice(x,1);
                }
              }
            }
          }
        }
        if($scope.pedido.categorias.length > 0 ){
          for(x in $scope.pedido.categorias){
            $scope.conta.categorias.push($scope.pedido.categorias[x]);
          }
        }

      }
      $scope.conta = calculateTotal($scope.conta);
      $scope.pedido = {
        "categorias": []
      };
      $scope.pedido = calculateTotal($scope.pedido);
    }
  }

  function calculateTotal(conta){
    conta.total = 0.0;
    for(x in conta.categorias){
      for(y in conta.categorias[x].pratos){
        conta.total = conta.total + parseFloat(conta.categorias[x].pratos[y].preco);
        for(z in conta.categorias[x].pratos[y].acompanhamentos){
          conta.total = conta.total + parseFloat(conta.categorias[x].pratos[y].acompanhamentos[z].preco);
        }
      }
    }
    conta.total = parseFloat(0.0 + conta.total).toFixed(2);
    return conta;
  }
  $scope.pedido = calculateTotal($scope.pedido);



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
  $scope.$on('$ionicView.enter', function() {
      $scope.user = userRef;
  });
  $scope.editarCadastro = function(){
    $state.go('perfiledit');
  }
})

.controller('PerfilEdtCtrl', function($scope, $state, Users, userRef) {
  $scope.$on('$ionicView.enter', function() {
      $scope.user = userRef;
  });
  $scope.atualizar = function(user){
    Users.updateUser(user.email, user.nome, user.sobrenome, $scope.user.$id);
    $state.go('perfil');
  }
})

.controller('PagamentoCtrl', function($scope, userRef){
  $scope.$on('$ionicView.enter', function() {
    $scope.cartoes = userRef.cards;
  });
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
})

.controller('HistoricoCtrl', function($scope, userRef, $state){
  $scope.$on('$ionicView.enter', function() {
    $scope.historicos = userRef.historicos;
  });
  for(x in $scope.historicos)
  {
    var time = new Date($scope.historicos[x].data);
    var data = ""+time.getDay()+"/"+time.getMonth()+"/"+time.getYear()+" "+time.getHours()+":"+time.getMinutes();
    $scope.historicos[x].dataformat = data;
  }
  $scope.loadHistorico = function(historico){
    $state.go('historicoDetail',{'historico': historico});
  }
})

.controller('HistoricoDtlCtrl', function($scope, $ionicLoading, $stateParams, $state, $cordovaGeolocation, $ionicLoading){
  $scope.$on('$ionicView.enter', function() {
    if($stateParams.historico == null){
      $state.go('historico');
    }else{
      $scope.historico = $stateParams.historico;
    }
  })
});
