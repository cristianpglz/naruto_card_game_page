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

    
    

    cargarRutasDeImagenes('IMGs/game_characters')
    .then(function (imagePaths) {
        if (imagePaths.length < 24) {
            console.error("No hay suficientes imágenes para inicializar el juego.");
            return;
        }
        
        initializeCardGame(imagePaths);
    })
    .catch(function (error) {
        console.error("Error al cargar rutas de imágenes:", error);
    });




    function cargarRutasDeImagenes(carpeta) {
        const folderPath = `./${carpeta}/`;
    
        return fetch(folderPath)
            .then(response => response.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const files = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href'));
                const imagePaths = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                const pathsWithDot = imagePaths.map(path => `.${path}`);
    
                return pathsWithDot;
            })
            .catch(error => {
                console.error("Error al obtener la lista de imágenes:", error);
                return [];
            });
    }

    // Definir variables para el tamaño de las cartas y la cantidad total de cartas
    var cardWidth;
    var cardHeight;
    var cardsOnBoard;
    // Definir función para determinar el tamaño de las cartas y la cantidad total de cartas
    function calculateBoardSize(size) {
        var size = chosen_size;
        switch (size) {
            case "nine":
                cardWidth = 130;
                cardHeight = 190;
                cardsOnBoard = 9;
                break;
            case "sixteen":
                cardWidth = 90;
                cardHeight = 130;
                cardsOnBoard = 16;
                break;
            case "twenty-five":
                cardWidth = 70;
                cardHeight = 100;
                cardsOnBoard = 25;
                break;
            default:
                cardWidth = 130;
                cardHeight = 190;
                cardsOnBoard = 9;
                break;
        }
        return { cardWidth, cardHeight, cardsOnBoard };
    }
    

    function initializeCardGame(imagePaths, startX, startY) {
        
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Llamada a calculateBoardSize para establecer el tamaño de las cartas y la cantidad total de cartas
        var { cardWidth, cardHeight, cardsOnBoard } = calculateBoardSize();
        
        // Definir la imagen de respaldo de la carta
        var backImage = "./IMGs/necessary_images/back_of_a_letter.png";
        
        // Inicializar el array cards
        var cards = [];
        
        // Lógica para dibujar las cartas en el canvas
        for (let i = 0; i < cardsOnBoard; i++) {
            const col = i % Math.sqrt(cardsOnBoard);
            const row = Math.floor(i / Math.sqrt(cardsOnBoard));
            var x = startX + col * (cardWidth + 20);
            var y = startY + row * (cardHeight + 20);
            drawCard(ctx, backImage, x, y, cardWidth, cardHeight);
        }
        
        
        // Lógica para inicializar las imágenes frontales de las cartas
        var randomFrontImages = shuffleArray(imagePaths.slice()).slice(0, Math.round(cardsOnBoard / 2));
        console.log(cardsOnBoard);
        console.log(randomFrontImages);
        for (let i = 0; i < cards.length; i++) {
            const randomIndex = Math.floor(Math.random() * randomFrontImages.length);
            const randomFrontImage = randomFrontImages.splice(randomIndex, 1)[0];
            cards[i].frontImage = randomFrontImage;
        }
        
    
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
        
        let flippedCards = [];
        let canFlipMoreCards = true;
        let timeFlip; // Tiempo en milisegundos
        timer_flip();
        function timer_flip(){
            switch(difficulty){
                case "easy":
                    timeFlip = 1000;
                    break;
                case "half":
                    timeFlip = 500;
                    break;
                case "difficult":
                    timeFlip = 100;
                    break;
                default:
                    timeFlip = 1000;
                    break;
            }
        }
    
        function flipCard(card) {
            if (!canFlipMoreCards || flippedCards.length >= 2) return;
    
            card.flipped = true;
            flippedCards.push(card);
            redrawCard(card);
    
            if (flippedCards.length === 2) {
                canFlipMoreCards = false;
                setTimeout(function() {
                    compareCards();
                    attempts_rest();
                }, timeFlip);
            }
        }
    
        function compareCards() {
            const [card1, card2] = flippedCards;
    
            if (card1.frontImage === card2.frontImage) {
                // Cartas iguales
                openGift();
                // Restar 2 al número de cartas restantes
                cards_number -= 2;
            } else {
                // Cartas diferentes
                flipBackCard(card1);
                flipBackCard(card2);
            }
    
            flippedCards = [];
            canFlipMoreCards = true;
        }
    
        function flipBackCard(card) {
            card.flipped = false;
            redrawCard(card);
        }
    
        function redrawCard(card) {
            ctx.clearRect(card.x, card.y, card.width, card.height);
            drawCard(ctx, card.flipped ? card.frontImage : backImage, card.x, card.y, card.width, card.height);
        }
    
        function drawCard(ctx, imagePath, x, y, width, height, startX, startY) {
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, x + startX, y + startY, width, height);
            };
            img.src = imagePath;
        }
        console.log("Cartas inicializadas:", cards);
        
    }
    
    
    
    
    
    
    
    // Función para mezclar el array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
    
    var cards_number;
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
        switch (difficulty) {
            case "easy":
                countdown_rest = 60;
                attempts = 6;
                break;
            case "half":
                countdown_rest = 50;
                attempts = 5;
                break;
            case "difficult":
                countdown_rest = 7;
                attempts = 4;
                break;
            default:
                countdown_rest = 60;
                attempts = 6;
                break;
        }
        countdownElement.value = countdown_rest;
        attemptsElement.value = attempts;
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();
    
            if (timerReachedZero) {
                clearInterval(idInterval);
                showGameOverScreen();
            }
            if (attempts === 0) {
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
        var username = nick_user;
        var score = parseInt(document.getElementById('points').value);
        
        if (!username || isNaN(score) || score <= 5) {
            return;
        }

        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        var existingUser = users.find(user => user.username === username);
        if (existingUser) {
            existingUser.score += score;
            saveTopUsers();
        } else if (score > 5) {
            users.push({ username: username, score: score });
            saveTopUsers();
        }
    }

    function saveTopUsers() {
        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        users.sort((a, b) => b.score - a.score);
        users = users.slice(0, 10);
        localStorage.setItem(`topUsers_${difficulty}`, JSON.stringify(users));
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
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startButton = document.getElementById("start-button");
        startButton.addEventListener("click", function () {
            // Aquí puedes agregar cualquier lógica adicional que necesites al hacer clic en el botón de inicio
            hideStartScreen();
            startGame(); // Iniciar el juego cuando se hace clic en el botón de inicio
        });
        
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