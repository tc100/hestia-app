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
        getUserProfile: function(auth_user){
            var ref = firebase.database().ref('users/'+auth_user.uid);
            //console.log("UID: " + userObj);
            var userObj = $firebaseObject(ref);


             // to take an action after the data loads, use the $loaded() promise
             userObj.$loaded().then(function() {
                console.log("loaded record:", userObj.$id, userObj.email);

               // To iterate the key/value pairs of the object, use angular.forEach()
               angular.forEach(userObj, function(value, key) {
                  console.log(key, value);
               });
             });
        },
        addNewUser: function(email, nome, sobrenome, userId){
            firebase.database().ref('users/' + userId).set({
                "email": email,
                "nome": nome,
                "sobrenome": sobrenome
            });
        }
    }
});
