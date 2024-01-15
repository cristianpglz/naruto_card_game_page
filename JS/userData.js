

var nick_user;
var chosen_difficulty;
var chosen_size;
var geo_location;
var selected_avatar;



function Recover_data(){
    nick_user = document.getElementById("nick_name");
    chosen_difficulty = document.getElementById("set_difficulty").value;
    chosen_size = document.getElementById("number_of_cards").value;
    selected_avatar = document.getElementById("avatar_select");
    geo_location = document.getElementById("geolocationSearch")


    sessionStorage.setItem('nick_name', nick_user);
    sessionStorage.setItem('set_difficulty', chosen_difficulty);
    sessionStorage.setItem('number_of_cards', chosen_size);
    sessionStorage.setItem('avatar_select', selected_avatar);
    sessionStorage.setItem('geolocationSearch', geo_location);
    
}


function get_Recover_data(){
    nick_user = sessionStorage.getItem('nick_name');
    chosen_difficulty = sessionStorage.getItem('set_difficulty');
    chosen_size = sessionStorage.getItem('number_of_cards');
    selected_avatar = sessionStorage.getItem('avatar_select');
    geo_location = sessionStorage.getItem('geolocationSearch');
    
    return { nick_user, chosen_difficulty, chosen_size, selected_avatar, geo_location };
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
    var { nick_user, chosen_difficulty, chosen_size, selected_avatar, geolocationSearch } = get_Recover_data();

    var historyStorage = localStorage.getItem('save_history');
    var save_history;

    if (historyStorage == null) {
        save_history = [];
    } else {
        save_history = JSON.parse(historyStorage);
    }

    var userRecord = {
        user: nick_user,
        difficulty: chosen_difficulty,
        size: chosen_size,
        avatar: selected_avatar,
        location: geolocationSearch,
        date: Date.now()
    };

    save_history.push(userRecord);
    localStorage.setItem('history', JSON.stringify(save_history));
}
