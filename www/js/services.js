angular.module('starter.services', [])

.factory('Restaurantes', function($http, ApiEndpoint){
    return {
      getListaRestaurantes: function(){
        return $http.get(ApiEndpoint.url+"/estabelecimentos").then(function(data){
            return data;
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
        }
    }
});
