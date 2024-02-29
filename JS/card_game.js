// VARIABLES GENERALES
var nick_user;
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
        if (imagePaths.length < 6) {
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
    
    
    var backImages = []; // Array que contiene las imágenes de respaldo para cada carta
    var frontImages = []; // Array que contiene las imágenes frontales de cada carta


    function initializeCardGame(imagePaths) {
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var cardWidth = 130;
        var cardHeight = 190;
        var startX = 50;
        var startY = 50;
    
        var cards = [];
        var frontImages = [];
        var backImage = "./IMGs/necessary_images/back_of_a_letter.png";
    
        // Verificar si hay suficientes imágenes para las cartas frontales
        if (!imagePaths || imagePaths.length < 5) {
            console.error("No hay suficientes imágenes para inicializar el juego.");
            return;
        }
    
        // Seleccionar imágenes aleatorias para las cartas frontales
        var randomImagePaths = shuffleArray(imagePaths.slice()); 
        for (let i = 0; i < 5; i++) {
            frontImages.push(randomImagePaths[i]);
        }
    
        // Obtener tres imágenes aleatorias diferentes
        const uniqueImages = shuffleArray(imagePaths).slice(0, 3);
        // Obtener tres copias de cada una de las imágenes únicas
        const pairedImages = [].concat(uniqueImages, uniqueImages, uniqueImages);
    
        // Mezclar el array de imágenes emparejadas
        const shuffledPairedImages = shuffleArray(pairedImages);
    
        for (let i = 0; i < 9; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            var x = startX + col * (cardWidth + 20);
            var y = startY + row * (cardHeight + 20);
            drawCard(ctx, backImage, x, y, cardWidth, cardHeight);
            cards.push({ x: x, y: y, width: cardWidth, height: cardHeight, flipped: false, id: i, frontImage: frontImages[i % 5], backImage: backImage });
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
        let timeFlip = 1000; // Tiempo en milisegundos
    
        function flipCard(card) {
            if (!canFlipMoreCards || flippedCards.length >= 2) return;
    
            card.flipped = true;
            flippedCards.push(card);
            redrawCard(card);
    
            if (flippedCards.length === 2) {
                canFlipMoreCards = false;
                setTimeout(compareCards, timeFlip);
            }
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
                showGameOverScreen(); // Llama a showGameOverScreen después de comparar las cartas
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
            drawCard(ctx, card.flipped ? card.frontImage : card.backImage, card.x, card.y, card.width, card.height);
        }
    
        function drawCard(ctx, imagePath, x, y, width, height) {
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, x, y, width, height);
            };
            img.src = imagePath;
        }
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
            console.log("Puntos actualizados:", pointsMarker.textContent); // Verificar en la consola
        }
    }
    
    
    
    

    function rest_time() {
        countdown_rest--;
        countdownElement.value = countdown_rest;
        if (countdown_rest === 0) {
            countdownElement = 0;
            showGameOverScreen(); // Llama a showGameOverScreen cuando el tiempo se agota
            return true;
        }
        return false;
    }
    

    function showGameOverScreen() {
        const gameOverScreen = document.getElementById("game-over-screen");
        if (countdown_rest === 0) {
            gameOverScreen.style.display = "block";
            guardarPuntos();
        }
    }

    function startGame() {
        game_events();
        switch (difficulty) {
            case "easy":
                countdown_rest = 60;
                break;
            case "half":
                countdown_rest = 50;
                break;
            case "difficult":
                countdown_rest = 7;
                break;
            default:
                countdown_rest = 60;
        }
        countdownElement.value = countdown_rest;

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
        var user = sessionStorage.getItem('nick_name');
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
        var username = sessionStorage.getItem('nick_name');
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
