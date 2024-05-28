// ENTRY FORM

var nick_user;
var chosen_difficulty;
var chosen_size;
var geo_location;
var avatar;
var checkform;
var itemImg;
var score;
// Event functions
function checkForm(event) {
    // Get values from form fields
    var nick_user = document.getElementById('nick_name').value.trim();  // Elimina espacios en blanco al principio y al final

    // Check length
    if (nick_user.length < 4 || nick_user.length > 10) {
        event.preventDefault();
        document.getElementById('nick_name').focus();
        error.innerText = "El nombre de usuario debe tener entre 4 y 10 caracteres";
        return false;
    }

    // Check for spaces
    if (nick_user.includes(' ')) {
        event.preventDefault();
        document.getElementById('nick_name').focus();
        error.innerText = "El campo de nick no puede contener espacios";
        return false;
    }


    // Information is correct
    Recover_data();
    userHistory();
    error.innerText = "";  // Reset error message
    return true;
}



/**
 * Load DOM objects, check form, and add events
 */
function loadedDOM() {
    // Capture all elements after DOM has loaded
    nick_user = document.getElementById("nick_name");
    chosen_difficulty = document.getElementById("set_difficulty").value;
    chosen_size = document.getElementById("number_of_cards").value;
    geo_location = document.getElementById("geolocationSearch");
    error = document.getElementById('error');
    checkform = document.getElementById('formEntry');
    avatar = document.getElementById('major_avatar');
    // Check for any shop.html errors
    if (sessionStorage.getItem('error') != null) {
        error.innerText = sessionStorage.getItem('error');
        sessionStorage.removeItem('error');  

    // Add submit event to the form
    checkform.addEventListener('submit', checkForm);
    avatarItems = document.getElementsByClassName("avatar");
    for (let item of avatarItems) {
        item.addEventListener('dragstart', move_img)
    }
    avatar.addEventListener('dragover', e => { e.preventDefault() })
    avatar.addEventListener('drop', cambiarImg)

    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadedDOM();
    locationData();
});

function move_img(event) {
    itemImg = event.target;
}

function cambiarImg() {
    avatar.src = itemImg.src;
}
