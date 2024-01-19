


var song;
var cards;
var menu_song;
var button_pause;
var nick_user;
menu_song = document.getElementById("img_menu");
button_pause = document.getElementById("img_music");
song = document.getElementById("music");

document.addEventListener("DOMContentLoaded", function() {
    // Cambiar la imagen y mutear/desmutear el audio al hacer clic en la imagen
    button_pause.addEventListener("click", function() {
        if (song.muted) {
            // Si el audio está muteado, desmutearlo y cambiar la imagen
            song.muted = false;
            updateButtonState();
        } else {
            // Si el audio no está muteado, mutearlo y cambiar la imagen
            song.muted = true;
            updateButtonState();
        }
    });

    // Función para actualizar el estado del botón según el estado actual del audio
    function updateButtonState() {
        if (song.muted) {
            // Si el audio está muteado, establecer la imagen de muteado
            button_pause.src = "./IMGs/necessary_images/muted.png";
        } else {
            // Si el audio no está muteado, establecer la imagen de reproducción
            button_pause.src = "./IMGs/necessary_images/play_audio.png";
        }
    }

    // Escuchar el evento de cambio de estado del audio (por ejemplo, desde el menú)
    song.addEventListener("volumechange", function() {
        updateButtonState();
    });
});

document.addEventListener("DOMContentLoaded", function() {
    menu_song.addEventListener("click", function() {
        if (menu_song.getAttribute("src") === "./IMGs/necessary_images/song_menu.png") {
            song.controls = true;
            menu_song.setAttribute("src", "./IMGs/necessary_images/song_menu_open.png");
        } else {
            song.controls = false;
            menu_song.setAttribute("src", "./IMGs/necessary_images/song_menu.png");
        }
    });
});








function iformation_user() {
    // Obtén el nombre de usuario del almacenamiento local
    var user = sessionStorage.getItem('nick_name');
    var game_user = document.getElementById('nick_name');

    if (user && game_user) {
        // Si hay un nombre de usuario en el almacenamiento local y se encuentra el elemento del juego
        if (game_user.value !== user) {
            // Si hay una diferencia, actualiza el valor del elemento del juego con el valor del almacenamiento local
            game_user.value = user;
        } else {
            console.error("User is the same.");
        }
    } else {
        console.error("User or game_user element not found.");
    }

    // Verifica si existe el elemento major_avatar
    var majorAvatar = document.getElementById('major_avatar');
    if (majorAvatar) {
        // Asigna la fuente del avatar o una cadena vacía si no hay fuente
        majorAvatar.src = avatar || "";
    } else {
        console.error("Major Avatar element not found.");
    }
}

console.log("Calling get_Recover_data");
get_Recover_data();

// Check the Data
console.log("Calling checkUserData");
if (!checkUserData()) {
    // If user data is not valid, redirect to "entry_form.html"
    console.log("Redirecting to entry_form.html");
    location = "entry_form.html";
}
iformation_user()
