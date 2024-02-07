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
        const cards = imagePaths.slice(0, totalCards / 2).flatMap((path, index) => {
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
            const row = Math.floor(i / boardSize);
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
    function setTime() {
        switch (difficulty) {
            case "easy":
                timeFlip = 4000; // 4 segundos
                countdown_rest = 60; // 60 segundos para easy
                break;
            case "half":
                timeFlip = 3000; // 3 segundos
                countdown_rest = 50;
                break;
            case "difficult":
                timeFlip = 2000; // 2 segundos
                countdown_rest = 40;
                break;
            default:
                timeFlip = 4000; // Valor predeterminado, 1 segundo
                countdown_rest = 60; // 60 segundos para easy

        }
        console.log(difficulty);
    }
    function flipCard(card) {
        setTime(difficulty);
        const currentSrc = card.src;
        const frontImage = card.getAttribute("data-front-image");
        // Verifica si la carta está boca abajo (es la imagen de respaldo)
        if (currentSrc.includes("back_of_a_letter.png")) {
            // Aplica la rotación manualmente usando la clase flipped
            card.classList.add("flipped");
    
            // Espera un breve período antes de cambiar la imagen
            setTimeout(() => {
                // Cambia la imagen a la parte frontal de la carta
                card.src = frontImage;
                // Agrega la carta a la lista de cartas levantadas
                flippedCards.push(card);
                
                console.log(flippedCards.length);
                console.log(flippedCards[2]);
                setTimeout(() => {
                    if (flippedCards.length === 2){
                        setTimeout(() => {
                            comprobate();
                        },timeFlip)
                    }else if (flippedCards.length === 1 && flippedCards[2] === undefined) {
                        console.log("Comprobando");
                        // Realiza la comprobación después de un tiempo de espera
                        setTimeout(() => {

                            handleDiferentCards();
                            
                        }, timeFlip);
                }
                },1000)//Aumenta el tiempo de espera para que se pueda leer la cantidad de cartas levantadas
                if(flippedCards.length > 2 ){
                    if (flippedCards[0].getAttribute("data-front-image") === flippedCards[1].getAttribute("data-front-image")) {
                        // Cartas iguales, realiza alguna animación o mensaje
                        handleEqualCards();

                    }else {

                        handleDiferentCards();

                    }
                }
            });
        }
    }
    function comprobate() {
        // Verifica si las dos cartas levantadas son iguales
        if (flippedCards[0].getAttribute("data-front-image") === flippedCards[1].getAttribute("data-front-image")) {
            // Cartas iguales, realiza alguna animación o mensaje
            handleEqualCards();
            console.log("¡Cartas iguales!");
        } else {
            // Cartas diferentes, voltea ambas cartas después de un tiempo de espera
            handleDiferentCards();
            console.log("¡Cartas diferentes!");
        }
    }
       function handleDiferentCards() {
               // Baja las cartas que estén levantadas sin animación
               for (const flippedCard of flippedCards) {
                   flippedCard.src = "./IMGs/necessary_images/back_of_a_letter.png";
                   flippedCard.classList.remove("flipped");
                }
               // Limpia la lista de cartas levantadas
               flippedCards = [];
               card.classList.add("flipped");
               // Cambia la imagen a la parte frontal de la carta
               card.src = frontImage;
    
               // Agrega la carta a la lista de cartas levantadas
               flippedCards.push(card); 
               flippedCards = [];  
       }
        // Declarar un array para almacenar las cartas adivinadas
        let guessedCards = [];
    
        function handleEqualCards() {
            
            // Agrega las cartas adivinadas al array de cartas adivinadas
            guessedCards.push(flippedCards[0]);
            guessedCards.push(flippedCards[1]);
            if(flippedCards[2] !== undefined){
                flippedCards[2].src = "./IMGs/necessary_images/back_of_a_letter.png";
                flippedCards[2].classList.remove("flipped");  
            }
            // Muestra las cartas adivinadas todo el tiempo
            for (const card of guessedCards) {
                card.classList.add("guessed");
            }
            console.log(difficulty);
                // Cartas iguales, realiza alguna animación o mensaje
                // Incrementa los puntos según la dificultad
                let pointsIncrement;
                let gifPath;
                switch (difficulty) {
                    case "easy":
                        pointsIncrement = 5;
                        gifPath = "./GIFTs/5_points.gif";
                        break;
                    case "half":
                        pointsIncrement = 7;
                        gifPath = "./GIFTs/7_points.gif";
                        break;
                    case "difficult":
                        pointsIncrement = 10;
                        gifPath = "./GIFTs/10_points.gif";
                        break;
                    default:
                        pointsIncrement = 5;
                        gifPath = "./GIFTs/5_points.gif";
                }
                // Cambia el src de la imagen
                const gifAlertElement = document.getElementById("points_alert");
                gifAlertElement.src = gifPath;
            
                // Hacer visible el elemento
                const alertPointsElement = document.getElementById("alert_points");
                alertPointsElement.style.visibility = "visible";
            
                // Agrega un temporizador para ocultar el elemento después de cierto tiempo (por ejemplo, 1.5 segundos)
                setTimeout(() => {
                    alertPointsElement.style.visibility = "hidden";
                    // Incrementa los puntos y actualiza el marcador
                    points += pointsIncrement;
                    updatePointsMarker();
                    // Limpia la lista de cartas dadas vuelta
                    flippedCards = [];
                }, 1500);
                flippedCards = [];
    
            }
    
    
    
    

    // Función para actualizar los puntos en el marcador
    function updatePointsMarker() {
        const pointsMarker = document.getElementById("points");
        if (pointsMarker) {
            pointsMarker.value = points;
            console.log(points);
        }
    }

    const startButton = document.getElementById("start-button");
    const overlay = document.getElementById("overlay");

    startButton.addEventListener("click", function () {
        hideStartScreen();
        startGame(); // Puedes pasar la dificultad deseada aquí
    });
 
    function hideStartScreen() {
        overlay.style.display = "none";
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
                countdown_rest = 40;
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
        
    const gameOverScreen = document.getElementById("game-over-screen");
    
    function showGameOverScreen(success) {
    
        if(countdown_rest){
            gameOverScreen.style.hidden = true;
        }
        else if(!countdown_rest){
            gameOverScreen.style.visibility = "visible";
            restartButton.addEventListener("click", function () {
                console.log("¡El temporizador ha llegado a cero!");
                hideGameOverScreen();
                // Restablecer el estado del juego
                startGame();
            })
        }
    
    }
    
    function hideGameOverScreen() {
    
        gameOverScreen.style.display = "none";
    }
    
    function game_events() {
        showGameOverScreen();
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();
    
            if (timerReachedZero) {
                console.log("¡El temporizador ha llegado a cero!");
                clearInterval(idInterval); // Detener el temporizador una vez que llegue a cero
                showGameOverScreen();
            }
        }, 1000); // Ejecutar cada segundo
    }
    
    game_events();
    
    const restartButton = document.getElementById("restart-button");
    
    restartButton.addEventListener("click", function () {
        hideGameOverScreen();
        // Restablecer el estado del juego
        countdown_rest = 60; // Restablecer la cuenta regresiva para la dificultad fácil
        countdownElement.value = countdown_rest; // Actualizar la visualización de la cuenta regresiva
        game_events(); // Comenzar el juego de nuevo
    });}},)


console.log("Calling get_Recover_data");

get_Recover_data();
// Check the Data
console.log("Calling checkUserData");
if (!checkUserData()) {
    // If user data is not valid, redirect to "entry_form.html"
    console.log("Redirecting to entry_form.html");
    location = "entry_form.html";
}