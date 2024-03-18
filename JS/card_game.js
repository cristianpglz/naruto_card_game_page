// VARIABLES GENERALES
var idInterval;
var points = 0;

document.addEventListener("DOMContentLoaded", function () {
    const historyFromLocalStorage = localStorage.getItem('history');
    const historyArray = JSON.parse(historyFromLocalStorage);
    const difficulty = historyArray.length > 0 ? historyArray[0].difficulty : 'easy';
    const menu_song = document.getElementById("img_menu");
    const button_pause = document.getElementById("img_music");
    const song = document.getElementById("music");
    song.volume = 0.03;
    var cardImages = []; // Define cardImages en el mismo ámbito donde se llama a flipCard
    var imagePaths; // Define imagePaths en el mismo ámbito donde se llama a flipCard
    var cards_number; // Define cards_number en el mismo ámbito donde se llama a flipCard
    button_pause.addEventListener("click", function () {
        song.muted = !song.muted;
        updateButtonState();
    });

    function updateButtonState() {
        button_pause.src = song.muted ? "./IMGs/necessary_images/muted.png" : "./IMGs/necessary_images/play_audio.png";
    }

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

    function cardsRest() {
        var size = chosen_size;
        switch(size){
            case "nine":
                cards_number = 9;
                break;
            case "sixteen":
                cards_number = 16;
                break;
            case "twenty-five":
                cards_number = 25;
                break;
            default:
                cards_number = 9;
                break;
        }
        return cards_number;
    }
    // Llamar a cardsRest() para inicializar cards_number
    cards_number = cardsRest();
    function timerFlip(){
        var timeFlip;
        switch (difficulty){
            case "easy":
                timeFlip = 2000;
                break;
            case "medium": 
                timeFlip = 1500;
                break;
            case "difficult": 
                timeFlip = 1000;
                break;
            default: 
                timeFlip = 2000;
                break;
        }
        return timeFlip;
    }
    function boardsize(cardWidth, cardHeight, startX, startY,cards_number) {
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        var cols, rows;

        switch (cards_number) {
            case 9:
                cols = 3;
                rows = 3;
                break;
            case 16:
                cols = 4;
                rows = 4;
                break;
            case 25:
                cols = 5;
                rows = 5;
                break;
            // Agrega más casos según sea necesario para otras cantidades de cartas
            default:
                cols = 3;
                rows = 3;
                break;
        }
        
    
        // Calcula el ancho y alto del panel en función del número de columnas y filas
        var panelWidth = cols * (cardWidth + 20) + startX;
        var panelHeight = rows * (cardHeight + 20) + startY;
    
        // Ajusta el tamaño del canvas al tamaño del panel
        canvas.width = panelWidth;
        canvas.height = panelHeight;
    }
    cargarRutasDeImagenes('IMGs/game_characters')
    .then(function (selectedImages) {
        // Aquí puedes continuar con el proceso de inicialización del juego usando las imágenes seleccionadas
        imagePaths = selectedImages;
        if (!imagePaths || imagePaths.length < cards_number / 2) {
            console.error("No hay suficientes imágenes para inicializar el juego.");
            return;
        }
        
        initializeCardGame(); // Initialize cards array and shuffle
    })
    .catch(function (error) {
        console.error("Error al cargar rutas de imágenes:", error);
    });


    function cargarRutasDeImagenes(carpeta) {
        const folderPath = `./${carpeta}/`;

        return fetch(folderPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener la lista de imágenes');
                }
                return response.text();
            })
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const files = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href'));
                const validImageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                const pathsWithDot = validImageFiles.map(path => `.${path}`);
                // Devuelve la mitad de las imágenes disponibles en imagePaths
                return pathsWithDot.slice(0, Math.ceil(cards_number / 2));
                
            })
            .catch(error => {
                console.error("Error al obtener la lista de imágenes:", error);
                return [];
            });
    }

        
        
        
        

    
    
    
    function initializeCardGame() {
    
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        var cardWidth = 130;
        var cardHeight = 190;
        var startX = 50;
        var startY = 50;
        var cards = [];
        var backImage = "./IMGs/necessary_images/back_of_a_letter.png";
        console.log(cards_number);
        console.log(imagePaths);
        // Verificar si hay suficientes imágenes para las cartas frontales
        if (!imagePaths || imagePaths.length < cards_number / 2) {
            console.error("No hay suficientes imágenes para inicializar el juego.");
            return;
        }
        // Llama a la función boardsize para ajustar el tamaño del panel
        boardsize(cardWidth, cardHeight, startX, startY,cards_number);
    
        // Mezclar las rutas de las imágenes
        var shuffledImages = shuffleArray(imagePaths.slice());

        // Duplicar las imágenes seleccionadas
        var duplicatedImages = shuffledImages.concat(shuffledImages);

        // Mezclar el orden de las cartas
        var shuffledCards = shuffleArray(Array.from({ length: cards_number }, (_, i) => i));

        // Crear las cartas en el tablero con la parte trasera y las imágenes aleatorias
        for (let i = 0; i < cards_number; i++) {
            const col = i % Math.sqrt(cards_number);
            const row = Math.floor(i / Math.sqrt(cards_number));
            var x = startX + col * (cardWidth + 20);
            var y = startY + row * (cardHeight + 20);
            drawCard(ctx, backImage, x, y, cardWidth, cardHeight); // Dibujar la parte trasera de las cartas
            cards.push({ 
                x: x, 
                y: y, 
                width: cardWidth, 
                height: cardHeight, 
                flipped: false, // Inicialmente, las cartas no están volteadas
                id: i, 
                frontImage: duplicatedImages[shuffledCards[i]], // Asignar imágenes aleatorias
                backImage: backImage 
            });
        }
        // Variable global para controlar si se pueden voltear más cartas
        var canFlipMoreCards = true;
        // Variable para almacenar las cartas volteadas
        let flippedCards = [];
        canvas.addEventListener('click', function(event) {
            if (!canFlipMoreCards) return;
        
            var rect = canvas.getBoundingClientRect();
            var mouseX = event.clientX - rect.left;
            var mouseY = event.clientY - rect.top;
        
            for (let i = 0; i < cards.length; i++) {
                var card = cards[i];
                if (!card.flipped && mouseX >= card.x && mouseX <= card.x + card.width &&
                    mouseY >= card.y && mouseY <= card.y + card.height) {
                    flipCard(card);
                    break;
                }
            }
        });

        // Función para voltear una carta
        function flipCard(card) {
            if (!canFlipMoreCards || flippedCards.length >= 2) return;

            card.flipped = true; // Voltear la carta
            redrawCard(card);
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                canFlipMoreCards = false;
                setTimeout(compareCards, timerFlip());
            }
        }

        function flipBackCard(card) {
            card.flipped = false;
            redrawCard(card);
        }

        
        // Redibujar una carta
        function redrawCard(card) {
            ctx.clearRect(card.x, card.y, card.width, card.height);
            drawCard(ctx, card.flipped ? card.frontImage : card.backImage, card.x, card.y, card.width, card.height);
        }

        // Dibujar una carta en el lienzo
        function drawCard(ctx, imagePath, x, y, width, height) {
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, x, y, width, height);
            };
            img.src = imagePath;
        }

        function compareCards() {
            const [card1, card2] = flippedCards;
        
            if (card1.frontImage === card2.frontImage) {
                // Cartas iguales
                openGift();
            } else {
                // Cartas diferentes
                flipBackCard(card1);
                flipBackCard(card2);
                attempts_rest();
            }
        
            flippedCards = [];
            canFlipMoreCards = true;
        }
        
    
        // Función para mezclar el array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    }
    
    
    
    
    
    
    
    
    
    function openGift() {
        let pointsToAdd = 0;
        let giftPath;
        switch (difficulty) {
            case 'easy':
                giftPath = 'GIFTs/5_points.gif';
                pointsToAdd = 5;
                break;
            case 'half':
                giftPath = 'GIFTs/7_points.gif';
                pointsToAdd = 7;
                break;
            case 'difficult':
                giftPath = 'GIFTs/10_points.gif';
                pointsToAdd = 10;
                break;
            default:
                console.error("Dificultad no reconocida");
                return;
        }
        
        const giftImage = document.getElementById("points_alert");
        giftImage.src = giftPath;
    
        // Hacer visible el elemento
        giftImage.style.visibility = "visible";
    
        // Ocultar el elemento después de 3 segundos (3000 milisegundos)
        setTimeout(function() {
            giftImage.style.visibility = "hidden";
        }, 1500); // Cambia este valor según el tiempo que desees que el elemento sea visible
    
        // Actualizar el marcador de puntos
        updatePointsMarker(pointsToAdd);
    }


    function updatePointsMarker(pointsToAdd) {
        const pointsMarker = document.getElementById("points");
        if (pointsMarker) {
            // Suma los puntos actuales al valor pasado como argumento
            pointsMarker.value  = parseInt(pointsMarker.value) + pointsToAdd;
            console.log("Puntos actualizados:", pointsMarker.value); // Verificar en la consola
        }
    }
    
    
    function cardsRest() {
        var size = chosen_size;
        switch(size){
            case "nine":
                cards_number = 9;
                break;
            case "sixteen":
                cards_number = 16;
                break;
            case "twenty-five":
                cards_number = 25;
                break;
            default:
                cards_number = 9;
                break;
        }
        return cards_number;
    }
    // Llamar a cardsRest() para inicializar cards_number
    cards_number = cardsRest();
    
    function rest_time() {
        countdown_rest--;
        countdownElement.value = countdown_rest;
        // Verificar si se ha agotado el tiempo
        if (countdown_rest === 0 || cards_number === 1) {
            countdownElement = 0;
            showGameOverScreen();
            return true;
        }
    return false;
    }
    
    
    

    function showGameOverScreen() {
        const gameOverScreen = document.getElementById("game-over-screen");
        if (countdown_rest === 0 || cardImages.length === 1 || attempts_rest() === false) {
            gameOverScreen.style.display = "flex";
            gameOverScreen.style.visibility = "visible";
            countdownElement = 0;
            startGame();
        }

    }
    var attemptsElement = document.getElementById("attempts");
    var attempts;

    function attempts_rest() {
        attempts--;
        attemptsElement.value = attempts;
        if (attempts === 0) {
            attemptsElement = 0;
            showGameOverScreen(); // Llama a showGameOverScreen cuando el tiempo se agota
            return true;
        }
        return false;
    }
    
    function startGame() {
        game_events();
        var size = chosen_size;
        switch(size||difficulty){
            case "nine"||"easy":
                countdown_rest = 60;
                attempts = 9;
                break;
            case "nine"||"half":
                countdown_rest = 50;
                attempts = 7;
                break;
            case "nine"||"difficult":
                countdown_rest = 40;
                attempts = 5;
                break;
            case "sixteen"||"easy":
                countdown_rest = 120;
                attempts = 12;
                break;
            case "sixteen"||"half":
                countdown_rest = 100;
                attempts = 10;
                break;
            case "sixteen"||"difficult":
                countdown_rest = 80;
                attempts = 8;
                break;
            case "twenty-five"||"easy":
                countdown_rest = 150;
                attempts = 15;
                break;
            case "twenty-five"||"half":
                countdown_rest = 120;
                attempts = 13;
                break;
            case "twenty-five"||"difficult":
                countdown_rest = 100;
                attempts = 11;
                break;
            default:
                countdown_rest = 100;
                attempts = 9;
                break;
                        
        }
        countdownElement.value = countdown_rest;
        attemptsElement.value = attempts;
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();
    
            if (timerReachedZero) {
                clearInterval(idInterval);
                guardarPuntos();
                showGameOverScreen();
            }
            if (attempts === 0) {
                guardarPuntos();
                clearInterval(idInterval);
                showGameOverScreen();
            }
        }, 1000);
    }

    const startButton = document.getElementById("start-button");
    const overlay = document.getElementById("overlay");
    const restartButton = document.getElementById("restart_button");

    startButton.addEventListener("click", function () {
        hideStartScreen();
        startGame();
    });

    restartButton.addEventListener("click", function () {
        hideGameOverScreen();
        location.reload();
    });

    function hideStartScreen() {
        overlay.style.display = "none";
    }

    function hideGameOverScreen() {
        const gameOverScreen = document.getElementById("game-over-screen");
        gameOverScreen.style.display = "none";
    }

    function information_user() {
        var user = nick_user;
        var game_user = document.getElementById('nick_name');
    
        if (user && game_user) {
            if (game_user.value !== user) {
                game_user.value = user;
            }
        }

        var majorAvatar = document.getElementById('major_avatar');
        if (majorAvatar) {
            majorAvatar.src = avatar || "";
        }

        var status_difficulty = document.getElementById("set_difficulty");
        status_difficulty.value = difficulty;
    }    
    information_user();

    let countdownElement = document.getElementById("countdown");
    let countdown_rest;
    
    function guardarPuntos() {
        
        var username = document.getElementById('nick_name').value;
        var score = parseInt(document.getElementById('points').value);
        
        
        if (!username || isNaN(score) || score <= 5) {
            return;
        }
    
        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        
        var existingUserIndex = users.findIndex(user => user.username === username); // Cambiado de find a findIndex para obtener el índice
        if (existingUserIndex !== -1) { // Verificar si se encontró el usuario
            users[existingUserIndex].score += score;
        } else if (score > 5) {
            users.push({ username: username, score: score });
        }
        saveTopUsers(users); // Pasar la lista de usuarios como argumento
    }
    

    function saveTopUsers(users) {
        users.sort((a, b) => b.score - a.score);
        users = users.slice(0, 10);
        console.log("Usuarios antes de guardar:", users); // Verificar los datos antes de guardarlos
        localStorage.setItem(`topUsers_${difficulty}`, JSON.stringify(users));
        console.log("Usuarios guardados:", JSON.parse(localStorage.getItem(`topUsers_${difficulty}`))); // Verificar los datos después de guardarlos
    }
    

    function mostrarTopUsers() {
        var content_top = document.getElementById("content_top_user");
        var container_top = document.getElementById("container_top_user");
        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        
        if(users.length < 1 || content_top === undefined){
            container_top.style.visibility = "hidden";
        }
        else if (users.length >= 1 && content_top !== undefined) {
            container_top.style.visibility = "visible";
        }
        content_top.innerHTML = '';
    
        users.forEach((user, index) => {
            var li = document.createElement('li');
            li.textContent = `${index + 1}. ${user.username} - ${user.score}`;
            content_top.appendChild(li);
        });
    }

    mostrarTopUsers();

    function game_events() {
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();
    
            if (timerReachedZero) {
                clearInterval(idInterval);
                showGameOverScreen();
                guardarPuntos();
            }
        }, 1000);
    }
    

    console.log("Calling get_Recover_data");    
});
get_Recover_data();

// Check the Data
console.log("Calling checkUserData");
if (!checkUserData()) {
    // If user data is not valid, redirect to "entry_form.html"
    console.log("Redirecting to entry_form.html");
    location = "entry_form.html";
}