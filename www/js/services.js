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
           var nomeCard = numero+nome;
           var childPush = firebase.database().ref('users/' + userId).child('cards').push();
           childPush.set({
                "numero": numero,
                "nome": nome,
                "mes": mes,
                "ano": ano,
                "ativo": true
            });
        }
    }
});
