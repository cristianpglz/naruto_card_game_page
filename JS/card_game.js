

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
    song.volume = 0.10;
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
})




document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('all_the_cards');

    cargarRutasDeImagenes('IMGs/game_characters')
        .then(imagePaths => {
            // Recupera el tamaño del localStorage
            const chosenSize = sessionStorage.getItem('number_of_cards'); // valor predeterminado si no se encuentra en el localStorage
            // Por ejemplo, podrías usar este array en la inicialización del juego
            initializeCardGame(imagePaths, chosenSize);
        })
        .catch(error => {
            console.error("Error al cargar rutas de imágenes:", error);
        });

    function cargarRutasDeImagenes(carpeta) {
        const folderPath = `./${carpeta}/`;

        return fetch(folderPath)
            .then(response => response.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const files = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href'));

                // Filtra solo las rutas de las imágenes
                const imagePaths = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

                // Agrega un punto al inicio de cada ruta
                const pathsWithDot = imagePaths.map(path => `.${path}`);

                return pathsWithDot;
            })
            .catch(error => {
                console.error("Error al obtener la lista de imágenes:", error);
                return []; // Devuelve un array vacío en caso de error
            });
    }

    function initializeCardGame(imagePaths, chosenSize) {
        // Calcular el tamaño del tablero según el número de cartas almacenado
        let boardSize;
        let totalCards;

        if (chosenSize === "nine") {
            boardSize = 3; // 3x3
            totalCards = 9;
        } else if (chosenSize === "sixteen") {
            boardSize = 4; // 4x4
            totalCards = 16;
        } else if (chosenSize === "twenty-five") {
            boardSize = 5; // 5x5
            totalCards = 25;
        } else {
            console.error("Número de cartas no válido");
            return;
        }
                // Modificar las columnas del contenedor all_the_cards
            const allTheCardsContainer = document.getElementById('all_the_cards');
            allTheCardsContainer.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

            // Crear un array de elementos img
            const cards = imagePaths.slice(0, totalCards).map((path, index) => {
            const card = document.createElement('img');
            card.classList.add("cards");
            card.src = "./IMGs/necessary_images/back_of_a_letter.png"; // Imagen de respaldo por defecto
            card.setAttribute("data-front-image", path);
            card.addEventListener("click", function () {
                flipCard(this);
            });

            return card;
        });

        // Barajar las cartas aleatoriamente
        const shuffledCards = shuffleArray(cards);

        // Limpiar el contenedor
        container.innerHTML = '';

        // Agregar las cartas al contenedor sin borrar el contenido anterior
        for (let i = 0; i < totalCards; i++) {
            const row = Math.floor(i / boardSize);
            const col = i % boardSize;

            // Configurar la ruta de la imagen de respaldo y el atributo data-front-image
            shuffledCards[i].setAttribute("src", "./IMGs/necessary_images/back_of_a_letter.png");
            shuffledCards[i].setAttribute("data-front-image", shuffledCards[i].getAttribute("data-front-image"));

            // Crear el contenedor de la carta
            const cardContainer = document.createElement("div");
            cardContainer.classList.add("card-container");

            // Agregar la carta al contenedor
            cardContainer.appendChild(shuffledCards[i]);

            if (col === 0) {
                // Nueva fila
                const rowContainer = document.createElement("div");
                rowContainer.classList.add("row-container");
                container.appendChild(rowContainer);
            }

            // Agregar el contenedor de la carta a la fila actual
            container.lastChild.appendChild(cardContainer);
        }
    }

    function shuffleArray(array) {
        const shuffled = array.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function flipCard(card) {
        const currentSrc = card.src;
        const frontImage = card.getAttribute("data-front-image");

        // Verifica si la carta está boca abajo (es la imagen de respaldo)
        if (currentSrc.includes("back_of_a_letter.png")) {
            // Cambia la imagen a la parte frontal de la carta
            card.src = frontImage;
        } else {
            // Cambia la imagen a la parte posterior de la carta
            card.src = "./IMGs/necessary_images/back_of_a_letter.png"; // Ruta de la imagen de respaldo
        }
    }
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