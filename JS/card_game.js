

var song;
var cards;
var menu_song;
var button_pause;
var nick_user;
var idInterval;

document.addEventListener("DOMContentLoaded", function () {
    const menu_song = document.getElementById("img_menu");
    const button_pause = document.getElementById("img_music");
    const song = document.getElementById("music");

    // Cambiar la imagen y mutear/desmutear el audio al hacer clic en la imagen
    button_pause.addEventListener("click", function () {
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
    song.addEventListener("volumechange", function () {
        updateButtonState();
    });

    menu_song.addEventListener("click", function () {
        if (menu_song.getAttribute("src") === "./IMGs/necessary_images/song_menu.png") {
            song.controls = true;
            menu_song.setAttribute("src", "./IMGs/necessary_images/song_menu_open.png");
        } else {
            song.controls = false;
            menu_song.setAttribute("src", "./IMGs/necessary_images/song_menu.png");
        }
    });

  // Inicializar el juego de cartas
  initializeCardGame();
});

function initializeCardGame(imagePaths) {
    // Seleccionar todas las imágenes en el contenedor
    const allImages = document.querySelectorAll('#container_cards img');

    // Convertir la NodeList a un array
    const imageArray = Array.from(allImages);

    // Duplicar la lista para emparejar las cartas
    const pairedImages = [...imageArray, ...imageArray];

    // Barajar las cartas aleatoriamente
    const shuffledCards = shuffleArray(pairedImages);

    // Modificar los atributos src de las imágenes de las cartas
    for (let i = 0; i < shuffledCards.length; i++) {
        // Usa las rutas proporcionadas desde la función cargarRutasDeImagenes
        const imagePath = i < imagePaths.length ? imagePaths[i] : "./IMGs/game_characters/back_of_a_letter.png";
        shuffledCards[i].setAttribute("src", imagePath);
        // Usa un atributo personalizado para almacenar la ruta de la imagen frontal
        shuffledCards[i].setAttribute("data-front-image", imagePath);
    }

    // Agregar el evento de clic a todas las cartas con la clase 'cards'
    shuffledCards.forEach(card => {
        card.addEventListener("click", function () {
            flipCard(this);
        });
    });
}

// Llama a la función para cargar las rutas de las imágenes y almacénalas en una variable
cargarRutasDeImagenes('IMGs/game_characters')
    .then(imagePaths => {
        // Aquí puedes usar el array 'imagePaths' como sea necesario en tu aplicación
        console.log(imagePaths);

        // Por ejemplo, podrías usar este array en la inicialización del juego
        initializeCardGame(imagePaths);
    });



// Función para cargar rutas de imágenes desde una carpeta
function cargarRutasDeImagenes(carpeta) {
    const folderPath = `./${carpeta}/`;

    // Array con las rutas de las imágenes
    const imagePaths = [
        "./IMGs/game_characters/neji.png",
        "./IMGs/game_characters/sakura.png",
        "./IMGs/game_characters/sasuke.png",
        "./IMGs/game_characters/shino.png",
        "./IMGs/game_characters/shizune.png",
        "./IMGs/game_characters/sikamaru.png",
        "./IMGs/game_characters/temari.png",
        "./IMGs/game_characters/yamato.png",
        "./IMGs/game_characters/young_naruto.png",
        "./IMGs/game_characters/anko.png",
        "./IMGs/game_characters/choji.png",
        "./IMGs/game_characters/dosu.png",
        "./IMGs/game_characters/gaara.png",
        "./IMGs/game_characters/gamatatsu.png",
        "./IMGs/game_characters/hayate.png",
        "./IMGs/game_characters/hinata.png",
        "./IMGs/game_characters/ino.png",
        "./IMGs/game_characters/iruka.png",
        "./IMGs/game_characters/kakashi.png",
        "./IMGs/game_characters/kankuro.png",
        "./IMGs/game_characters/kiba.png",
        "./IMGs/game_characters/kotetsu.png",
        "./IMGs/game_characters/lee.png",
        "./IMGs/game_characters/naruto.png"
    ];

    // Devuelve el array con las rutas de las imágenes
    return Promise.resolve(imagePaths);
}


// Función para voltear la carta
function flipCard(card) {
    const currentSrc = card.getAttribute("src");

    // Verifica si la carta está boca abajo (es la imagen de respaldo)
    if (currentSrc.includes("back_of_a_letter.png")) {
        // Cambia la imagen a la parte frontal de la carta
        const frontImage = card.getAttribute("data-front-image"); // Usa un atributo personalizado
        card.setAttribute("src", frontImage);
    }
}


// Función para barajar un array
function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}















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
function rest_time() {
    let countdownElement = document.getElementById("countdown");
    let countdown_rest = parseInt(countdownElement.value) - 1;

    countdownElement.value = countdown_rest;

    if (countdown_rest === 0) {
        clearInterval(idInterval);
        console.log("¡Contador ha llegado a cero!");
    }
}

function game_events() {
    idInterval = setInterval(rest_time, 1000);
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
game_events();