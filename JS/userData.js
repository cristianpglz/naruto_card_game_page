// USER DATA

const list_users = [];
var nick_user;
var chosen_difficulty;
var chosen_size;
var geo_location;
var avatar;
var score; 

/**
 * Recovers user data from the browser's session storage and updates the corresponding UI elements.
 * This function is responsible for retrieving the user's saved preferences, such as their nickname,
 * chosen difficulty level, number of cards, geolocation search, and avatar, and updating the
 * relevant HTML elements on the page.
 */
function Recover_data() {
    nick_user = document.getElementById("nick_name");
    chosen_difficulty = document.getElementById("set_difficulty");
    chosen_size = document.getElementById("number_of_cards");
    geo_location = document.getElementById("geolocationSearch");
    avatar = document.getElementById("major_avatar");

    sessionStorage.setItem('nick_name', nick_user.value);
    sessionStorage.setItem('set_difficulty', chosen_difficulty.value);
    sessionStorage.setItem('number_of_cards', chosen_size.value);
    sessionStorage.setItem('geolocationSearch', geo_location);
    sessionStorage.setItem("major_avatar", avatar.src);
}




/**
 * Retrieves user data from the session storage and returns it as an object.
 * 
 * @returns {Object} An object containing the user's nickname, chosen difficulty, chosen card size, avatar, and geolocation.
 */
function get_Recover_data() {
    nick_user = sessionStorage.getItem('nick_name');
    chosen_difficulty = sessionStorage.getItem('set_difficulty');
    chosen_size = sessionStorage.getItem('number_of_cards');
    avatar = sessionStorage.getItem('major_avatar');
    geo_location = sessionStorage.getItem('geolocationSearch');

    return { nick_user, chosen_difficulty, chosen_size, avatar, geo_location };
}




/**
 * Checks if the user's data has been properly filled out.
 * @returns {boolean} - True if the user's data is valid, false otherwise.
 */
function checkUserData() {
    var { nick_user } = get_Recover_data();
    if (nick_user == null) {
        sessionStorage.setItem('error', 'No se ha rellenado correctamente el formulario');
        return false;
    }

    return true;
}


/**
 * Retrieves the user's current geographic location using the browser's Geolocation API.
 * 
 * If the browser does not support the Geolocation API, the function will set the `geo_location` variable to a default message indicating that the browser is not compatible.
 * 
 * If the browser supports the Geolocation API, the function will attempt to retrieve the user's current latitude and longitude coordinates. If the retrieval is successful, the `geo_location` variable will be set to a string containing the latitude and longitude. If the retrieval fails, the `geo_location` variable will be set to a default error message.
 */
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


/**
 * Saves the user's history data to local storage.
 * 
 * This function retrieves the user's data, such as their nickname, chosen difficulty, chosen size, avatar, and geographic location, and creates a user record object. It then pushes this record to the list of users and saves it to the user's history in local storage.
 * 
 * @function
 * @returns {void}
 */
function userHistory() {
    var { nick_user, chosen_difficulty, chosen_size, avatar, geo_location } = get_Recover_data();

    var userRecord = {
        user: nick_user,
        difficulty: chosen_difficulty,
        size: chosen_size,
        avatar: avatar,
        location: geo_location,
        date: Date.now(),
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
