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
          var pedidoPush = firebase.database().ref('users/' + userID).child('historico').push();
          var date = new Date();
          var data = date.getTime();
          pedidoPush.set({
           "restaurante": restauranteID,
           "data": data
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
              var pratoPush = firebase.database().ref('users/' + userID+'/historico/'+pedidoKey).child('prato').push();
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
                var acompPush = firebase.database().ref('users/' + userID+'/historico/'+pedidoKey+'/prato/'+pratoKey).child('acompanhamento').push();
                acompPush.set({
                 "nome": acompnome,
                 "preco": acomppreco
                });
              }
            }
          }
        },
        addConta: function (restauranteID,userID)
        {
          var contaPush = firebase.database().ref('restaurantes/'+restauranteID).child('contas').push();
          var date = new Date();
          var data = date.getTime();
          contaPush.set({
           "userID": userID,
           "aberto":true,
           "data": data,
           "total": "0.0"
          });
          return contaPush.key;
        },
        addPedido: function(pedido, restauranteID, mesa, userID,contaID, total)
        {
          debugger;
          var contaPush = firebase.database().ref('restaurantes/'+restauranteID+'/contas/'+contaID);
          contaPush.update({"total": total});
          var pedidoPush = firebase.database().ref('restaurantes/'+restauranteID+"/contas/"+contaID).child('pedidos').push();
          var date = new Date();
          var data = date.getTime();
          pedidoPush.set({
           "userID": userID,
           "mesa": mesa,
           "ativo":true,
           "data":data
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
              var pratoPush = firebase.database().ref('restaurantes/'+restauranteID+"/contas/"+contaID+'/pedidos/'+pedidoKey).child('prato').push();
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
                var acompPush = firebase.database().ref('restaurantes/'+restauranteID+"/contas/"+contaID+'/pedidos/'+pedidoKey+'/prato/'+pratoKey).child('acompanhamento').push();
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
