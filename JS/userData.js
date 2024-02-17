
const list_users = [];
var nick_user;
var chosen_difficulty;
var chosen_size;
var geo_location;
var avatar;
var points;

function Recover_data(){
    nick_user = document.getElementById("nick_name");
    chosen_difficulty = document.getElementById("set_difficulty");
    chosen_size = document.getElementById("number_of_cards");
    geo_location = document.getElementById("geolocationSearch");
    avatar = document.getElementById("major_avatar");
    console.log("Recovered data:", { nick_user, chosen_difficulty, chosen_size, avatar, geo_location });

    sessionStorage.setItem('nick_name', nick_user.value);
    sessionStorage.setItem('set_difficulty', chosen_difficulty.value);
    sessionStorage.setItem('number_of_cards', chosen_size.value);
    sessionStorage.setItem('geolocationSearch', geo_location);
    sessionStorage.setItem("major_avatar", avatar.src);
}



function get_Recover_data(){
    nick_user = sessionStorage.getItem('nick_name');
    chosen_difficulty = sessionStorage.getItem('set_difficulty');
    chosen_size = sessionStorage.getItem('number_of_cards');
    avatar = sessionStorage.getItem('major_avatar');
    geo_location = sessionStorage.getItem('geolocationSearch');
    
    console.log("Recovered data:", nick_user, chosen_difficulty, chosen_size, avatar, geo_location);
    
    return { nick_user, chosen_difficulty, chosen_size, avatar, geo_location};
}




function checkUserData() {
    var { nick_user } = get_Recover_data();

    if (nick_user == null) {
        sessionStorage.setItem('error', 'No se ha rellenado correctamente el formulario');
        return false;
    }
    console.log("Estoy aquí");
    return true;
}


function locationData() {
    if (!navigator.geolocation) {
        geo_location = "El navegador no es compatible con la API de Geolocalización";
    } else {
        navigator.geolocation.getCurrentPosition(
            // Success
            (position) => { geo_location = 'Latitud:' + position.coords.latitude + ', Longitud:' + position.coords.longitude },
            // Error
            () => { geo_location = "La geolocalización no se ha podido realizar"; }
        );
    }
}


function userHistory() {
    var { nick_user, chosen_difficulty, chosen_size, avatar, geo_location} = get_Recover_data();
    
    var userRecord = {
     user: nick_user,
     difficulty: chosen_difficulty,
     size: chosen_size,
     avatar: avatar,
     location: geo_location,
     date: Date.now()
     };
    
     list_users.push(userRecord);
    
     var historyStorage = localStorage.getItem('save_history');
     var save_history;
    
     if (historyStorage == null) {
      save_history = [];
      } else {
     save_history = JSON.parse(historyStorage);
     }
    
     save_history.push(userRecord);
     localStorage.setItem('history', JSON.stringify(save_history));
    }
