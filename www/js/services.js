angular.module('starter.services', [])

.factory('Restaurantes', function($http, ApiEndpoint){
    return {
      getListaRestaurantes: function(){
        return $http.get(ApiEndpoint.url+"/estabelecimentos").then(function( data){
          console.log("Data: " + data);
            return data;
        },function(error){
            return null;
        })
      },
      getCardapios: function (idRestaurante){
        return $http.get(ApiEndpoint.url+'/cardapios?restaurante='+idRestaurante)
        .then(function(data){
          console.log("data: " + JSON.stringify(data));
            return data.data;
        })
      }
    }
})

.factory('Users', function($firebaseObject){
    return {
        addNewUser: function(email, nome, sobrenome, userId){
            firebase.database().ref('users/' + userId).set({
                "email": email,
                "nome": nome,
                "sobrenome": sobrenome
            });
        },
        updateUser: function(email, nome, sobrenome, userId){
          var obj = $firebaseObject(firebase.database().ref('users/' + userId));
          obj.email = email;
          obj.nome = nome;
          obj.sobrenome = sobrenome;
          obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
          },function(error) {
             console.log("Error:", error);
          });
        },
        addCard: function(numero, nome, mes, ano, userId){
           var childPush = firebase.database().ref('users/' + userId).child('cards').push();
           childPush.set({
                "numero": numero,
                "nome": nome,
                "mes": mes,
                "ano": ano,
                "ativo": true
            });
        },
        addPedidoUSER: function(pedido, restauranteID, mesa, userID)
        {
          debugger;
          var pedidoPush = firebase.database().ref('users/' + userID+'/pedidos/'+restauranteID).child('pedido').push();
          pedidoPush.set({
           "userID": userID,
           "mesa": mesa
          });
          var pedidoKey = pedidoPush.key;
          for (var x = 0; x < pedido.length; x++)
          {
            var p = pedido[x];
            for(var i= 0 ; i  < p.pratos.length; i++)
            {
              var prato = p.pratos[i];
              var nome = prato.nome;
              var preco = prato.preco;
              var pratoPush = firebase.database().ref('users/' + userID+'/pedidos/'+restauranteID+'/pedido/'+pedidoKey).child('prato').push();
              pratoPush.set({
               "nome": nome,
               "preco": preco
              });
              var pratoKey = pratoPush.key;
              for (var j = 0; j < prato.acompanhamentos.length; j++)
              {
                var acomp = prato.acompanhamentos[j];
                var acompnome = acomp.nome;
                var acomppreco = acomp.preco;
                var acompPush = firebase.database().ref('users/' + userID+'/pedidos/'+restauranteID+'/pedido/'+pedidoKey+'/prato/'+pratoKey).child('acompanhamento').push();
                acompPush.set({
                 "nome": acompnome,
                 "preco": acomppreco
                });
              }
            }
          }
        },
        addPedido: function(pedido, restauranteID, mesa, userID)
        {
          debugger;
          var pedidoPush = firebase.database().ref('pedidos/'+restauranteID).child('pedido').push();
          pedidoPush.set({
           "userID": userID,
           "mesa": mesa,
           "ativo":true,
          });
          var pedidoKey = pedidoPush.key;
          for (var x = 0; x < pedido.length; x++)
          {
            var p = pedido[x];
            for(var i= 0 ; i  < p.pratos.length; i++)
            {
              var prato = p.pratos[i];
              var nome = prato.nome;
              var preco = prato.preco;
              var pratoPush = firebase.database().ref('pedidos/'+restauranteID+'/pedido/'+pedidoKey).child('prato').push();
              pratoPush.set({
               "nome": nome,
               "preco": preco
              });
              var pratoKey = pratoPush.key;
              for (var j = 0; j < prato.acompanhamentos.length; j++)
              {
                var acomp = prato.acompanhamentos[j];
                var acompnome = acomp.nome;
                var acomppreco = acomp.preco;
                var acompPush = firebase.database().ref('pedidos/'+restauranteID+'/pedido/'+pedidoKey+'/prato/'+pratoKey).child('acompanhamento').push();
                acompPush.set({
                 "nome": acompnome,
                 "preco": acomppreco
                });
              }
            }
          }
        }
    }
});
