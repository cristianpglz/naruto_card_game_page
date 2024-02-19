// VARIABLES GENERALES
var song;
var cards;
var menu_song;
var button_pause;
var nick_user;
var idInterval;
var points = 0;

document.addEventListener("DOMContentLoaded", function () {
    // Obtener el historial del localStorage
    const historyFromLocalStorage = localStorage.getItem('history');
    // Convertir la cadena JSON a un array de objetos
    const historyArray = JSON.parse(historyFromLocalStorage);
    // Verificar si hay algún elemento en el historial y obtener el valor de 'difficulty'
    const difficulty = historyArray.length > 0 ? historyArray[0].difficulty : 'easy';    
    const menu_song = document.getElementById("img_menu");
    const button_pause = document.getElementById("img_music");
    const song = document.getElementById("music");
    song.volume = 0.03;

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


    cargarRutasDeImagenes('IMGs/game_characters')
        .then(imagePaths => {
            // Recupera el tamaño del localStorage
            const chosenSize = sessionStorage.getItem('number_of_cards'); // valor predeterminado si no se encuentra en el localStorage
            // array en la inicialización del juego
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
            totalCards = 8;
        } else if (chosenSize === "sixteen") {
            boardSize = 4; // 4x4
            totalCards = 16;
        } else if (chosenSize === "twenty-five") {
            boardSize = 5; // 5x5
            totalCards = 24;
        } else {
            console.error("Número de cartas no válido");
            return;
        }

        // Modificar las columnas del contenedor all_the_cards
        const allTheCardsContainer = document.getElementById('all_the_cards');
        allTheCardsContainer.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

        // Crear un array de elementos img
        const cards = imagePaths.slice(0, totalCards / 2).flatMap((path) => {
            const card1 = document.createElement('img');
            card1.classList.add("cards");
            card1.src = "./IMGs/necessary_images/back_of_a_letter.png"; // Imagen de respaldo por defecto
            card1.setAttribute("data-front-image", path);
            card1.addEventListener("click", function () {
                flipCard(this);
            });

            const card2 = document.createElement('img');
            card2.classList.add("cards");
            card2.src = "./IMGs/necessary_images/back_of_a_letter.png"; // Imagen de respaldo por defecto
            card2.setAttribute("data-front-image", path);
            card2.addEventListener("click", function () {
                flipCard(this);
            });

            return [card1, card2];
        });

        // Barajar las cartas aleatoriamente
        const shuffledCards = shuffleArray(cards);

        // Limpiar el contenedor
        allTheCardsContainer.innerHTML = '';

        // Agregar las cartas al contenedor sin borrar el contenido anterior
        for (let i = 0; i < totalCards; i++) {
            const col = i % boardSize;

            // Configurar la ruta de la imagen de respaldo y el atributo data-front-image
            shuffledCards[i].setAttribute("src", "./IMGs/necessary_images/back_of_a_letter.png");
            shuffledCards[i].setAttribute("data-front-image", shuffledCards[i].getAttribute("data-front-image"));

            // Inicialmente, todas las cartas son visibles
            shuffledCards[i].style.visibility = "visible";

            // Crear el contenedor de la carta
            const cardContainer = document.createElement("div");
            cardContainer.classList.add("card-container");

            // Agregar la carta al contenedor
            cardContainer.appendChild(shuffledCards[i]);

            if (col === 0) {
                // Nueva fila
                const rowContainer = document.createElement("div");
                rowContainer.classList.add("row-container");
                allTheCardsContainer.appendChild(rowContainer);
            }

            // Agregar el contenedor de la carta a la fila actual
            allTheCardsContainer.lastChild.appendChild(cardContainer);
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

    let flippedCards = [];
    let waitingForComparison = false;
    let timeFlip; // Definimos la variable timeFlip
    
    function setTime() {
        switch (difficulty) {
            case "easy":
                timeFlip = 4000; // 4 segundos
                break;
            case "half":
                timeFlip = 3000; // 3 segundos
                break;
            case "difficult":
                timeFlip = 2000; // 2 segundos
                break;
            default:
                timeFlip = 4000; // Valor predeterminado, 4 segundos
        }
    }
    
    function flipCard(card) {
        const currentSrc = card.src;
        const frontImage = card.getAttribute("data-front-image");
        
        // Verificar si ya hay 2 cartas volteadas o si se está esperando una comparación
        if (waitingForComparison || flippedCards.length === 2) {
            return;
        }
    
        // Si la carta ya está volteada, no hacer nada
        if (currentSrc.includes("back_of_a_letter.png")) {
            card.classList.add("flipped");
            card.src = frontImage;
            flippedCards.push(card);
    
            // Si hay 2 cartas volteadas, iniciar la comparación
            if (flippedCards.length === 1 && flippedCards.length === 2) {
                waitingForComparison = true;
                setTimeout(compareCards, timeFlip);
            }
        } else {
            // Si la carta ya está volteada, no hacer nada
            return;
        }
    }
    
    
    
    
    
    
    function compareCards() {
        if (flippedCards.length === 2) {
            if (flippedCards[0].getAttribute("data-front-image") === flippedCards[1].getAttribute("data-front-image")) {
                handleEqualCards();
            } else {
                handleDifferentCards();
            }
        }
    }
    
    function handleDifferentCards() {
        // Voltear las cartas después de un tiempo determinado
        setTimeout(() => {
            for (const flippedCard of flippedCards) {
                flippedCard.src = "./IMGs/necessary_images/back_of_a_letter.png";
                flippedCard.classList.remove("flipped");
            }
            // Restaurar la capacidad de voltear cartas después de la comparación
            flippedCards = [];
            waitingForComparison = false;
        }, timeFlip);
    }
    
    function handleEqualCards() {
        // Agrega las cartas adivinadas al array de cartas adivinadas
        for (const card of flippedCards) {
            card.classList.add("guessed");
        }
        // Incrementar los puntos según la dificultad
        let pointsIncrement;
        switch (difficulty) {
            case "easy":
                pointsIncrement = 5;
                break;
            case "half":
                pointsIncrement = 7;
                break;
            case "difficult":
                pointsIncrement = 10;
                break;
            default:
                pointsIncrement = 5;
        }
        points += pointsIncrement;
        updatePointsMarker();
        // Mostrar mensaje de puntos y ocultarlo después de un tiempo
        const gifAlertElement = document.getElementById("points_alert");
        gifAlertElement.src = `./GIFTs/${pointsIncrement}_points.gif`;
        const alertPointsElement = document.getElementById("alert_points");
        alertPointsElement.style.visibility = "visible";
        setTimeout(() => {
            alertPointsElement.style.visibility = "hidden";
            // Restaurar la capacidad de voltear cartas después de la comparación
            flippedCards = [];
            waitingForComparison = false;
        }, 1500);
    }
    
    




    
    
    
    

    // Función para actualizar los puntos en el marcador
    function updatePointsMarker() {
        const pointsMarker = document.getElementById("points");
        if (pointsMarker) {
            pointsMarker.value = points;
            console.log(points);
        }
        points.push;
    }

    const startButton = document.getElementById("start-button");
    const overlay = document.getElementById("overlay");
    const restartButton = document.getElementById("restart_button");
    const gameOverScreen = document.getElementById("game-over-screen");
    startButton.addEventListener("click", function () {
        hideStartScreen();
        startGame(); // Puedes pasar la dificultad deseada aquí
    });
    restartButton.addEventListener("click", function () {
        console.log("¡has dado a rerestar!");
        hideGameOverScreen();
        location.reload();
    });
    function hideStartScreen() {
        overlay.style.display = "none";
    }
    function hideGameOverScreen() {
        gameOverScreen.style.display = "none";
    }
    function information_user() {
        // Obtén el nombre de usuario del sessionStorage
        var user = sessionStorage.getItem('nick_name');
        var game_user = document.getElementById('nick_name');
    
        if (user && game_user) {
            // Si hay un nombre de usuario en el sessionStorage y se encuentra el elemento del juego
            if (game_user.value !== user) {
                // Si hay una diferencia, actualiza el valor del elemento del juego con el valor del sessionStorage
                game_user.value = user;
            } else {
                console.error("User is the same.");
            }
        } else {
            console.error("User or game_user element not found.");
        }
    
        // Verifica si existe el elemento major_avatar (asumo que 'avatar' debería ser una variable definida en algún lugar de tu código)
        var majorAvatar = document.getElementById('major_avatar');
        if (majorAvatar) {
            // Asigna la fuente del avatar o una cadena vacía si no hay fuente
            majorAvatar.src = avatar || "";
        } else {
            console.error("Major Avatar element not found.");
        }

        var status_difficulty= document.getElementById("set_difficulty");
        status_difficulty.value = difficulty;

    }    
    information_user(); // Llamada a la función para mostrar la información del usuario

    function startGame() {
        let countdownElement = document.getElementById("countdown");
        let countdown_rest;

        // Configurar la dificultad una sola vez
        switch (difficulty) {
            case "easy":
                countdown_rest = 60; // 60 segundos para easy
                break;
            case "half":
                countdown_rest = 50;
                break;
            case "difficult":
                countdown_rest = 7;
                break;
            default:
                countdown_rest = 60; // 60 segundos para easy
        }
        countdownElement.value = countdown_rest;
        
    
    function rest_time() {
        countdown_rest--;
        
        countdownElement.value = countdown_rest;
        
        console.log(countdown_rest);
        
        if (countdown_rest === 0) {
            console.log("¡Contador ha llegado a cero!");
            countdownElement = 0;
            return true; // Indica que el temporizador ha llegado a cero
        }
        return false; // Indica que el temporizador aún no ha llegado a cero
    }
    
    function showGameOverScreen() {
    
        if(countdown_rest){
            gameOverScreen.style.hidden = false;
        }
        else if(!countdown_rest){
            gameOverScreen.style.visibility = "visible";
        }

    }
    var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
    // Función para guardar los datos del usuario al finalizar la partida
    function guardarPuntos() {
        // Obtener el nombre de usuario y los puntos del sessionStorage
        var username = sessionStorage.getItem('nick_name');
        var score = parseInt(document.getElementById('points').value); // Parsear el puntaje a un número entero
        
        // Verificar si el nombre de usuario y el puntaje son válidos
        if (!username || isNaN(score) || score <= 5) {
            return;
        }
        
    

    
        // Verificar si el usuario ya existe en la lista de mejores usuarios
        var existingUser = users.find(user => user.username === username);
        if (existingUser) {
            // Si el usuario ya existe, actualizamos sus puntos
            existingUser.score += score;
            saveTopUsers();
        } else if (score > 5) {
            // Si el usuario no existe, lo agregamos a la lista
            users.push({ username: username, score: score });
            saveTopUsers();
        }
    
    }
    function saveTopUsers() {
        // Ordenar los usuarios por puntuación de mayor a menor
        users.sort((a, b) => b.score - a.score);
        
        // Limitar la lista a los 10 mejores usuarios
        users = users.slice(0, 10);
    
        // Guardar la lista actualizada en el localStorage para la dificultad actual
        localStorage.setItem(`topUsers_${difficulty}`, JSON.stringify(users));
    }
    
    // Función para mostrar los mejores usuarios de la dificultad actual
    function mostrarTopUsers() {
        // Obtener el contenedor donde se mostrarán los datos
        var content_top = document.getElementById("content_top_user");
        var container_top = document.getElementById("container_top_user");
    
        // Obtener la lista de los mejores usuarios del localStorage para la dificultad actual
        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        
        if(users.length < 1 || content_top === undefined){
            console.log("dentro");
            container_top.style.visibility = "hidden";
            console.log(container_top.style.visibility);

        }
        else if (users.length >= 1 && content_top !== undefined) {
            container_top.style.visibility = "visible";
            console.log("afuera");
        }
        // Limpiar el contenido del contenedor antes de agregar los nuevos datos
        content_top.innerHTML = '';
    
        // Iterar sobre los usuarios y agregarlos al contenedor como elementos de lista
        users.forEach((user, index) => {
            var li = document.createElement('li');
            li.textContent = `${index + 1}. ${user.username} - ${user.score}`;
            content_top.appendChild(li);
        });
    }
    

    
    
    
    function game_events() {
        mostrarTopUsers();
        showGameOverScreen();
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();
    
            if (timerReachedZero) {
                console.log("¡El temporizador ha llegado a cero!");
                clearInterval(idInterval); // Detener el temporizador una vez que llegue a cero
                showGameOverScreen();
                guardarPuntos();
            }
        }, 1000); // Ejecutar cada segundo
    }
    game_events();
    }},)


console.log("Calling get_Recover_data");

get_Recover_data();
// Check the Data
console.log("Calling checkUserData");
if (!checkUserData()) {
    // If user data is not valid, redirect to "entry_form.html"
    console.log("Redirecting to entry_form.html");
    location = "entry_form.html";
}