

var nick_user;
var chosen_difficulty;
var chosen_size;
var geo_location;
var selected_avatar;
var checkform;
// Event functions
/**
 * Check correct data in the entry form
 * @param  {EventObject} event Event triggered on submit
 */
function checkForm(event) {
    console.log("Checking form...");
    // Get values from form fields
    var nick_user = document.getElementById('nick_name').value;
    console.log("nick_name:", nick_user);
    // Check changes
    if (nick_user.includes(' ')) {
        event.preventDefault();
        document.getElementById('nick_name').focus();
        error.innerText = "El campo de nick no puede contener espacios";
        return false;
    }
    
    
    
    console.log("After checks...");

    // Information is correct
    Recover_data();
    userHistory();
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
    selected_avatar = document.getElementById("avatar_select");
    geo_location = document.getElementById("geolocationSearch");
    error = document.getElementById('error');
    checkform = document.getElementById('formEntry');

    // Check for any shop.html errors
    if(sessionStorage.getItem('error') != null) {
        error.innerText = sessionStorage.getItem('error');
        sessionStorage.removeItem('error');
    }

    // Add submit event to the form
    checkform.addEventListener('submit', checkForm);
}

document.addEventListener('DOMContentLoaded', function() {
    loadedDOM();
    locationData();
});
