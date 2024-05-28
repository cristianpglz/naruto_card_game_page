// GENERAL VARIABLES
var idInterval;
var cards = [];
var matchedCards = [];
var flippedCards = [];
var canFlipMoreCards = true;
var savedpoints = false; // Flag to control if points have already been saved
var currentUser = "user"; // Define the username here or retrieve it from an entry

/**
 * Retrieves the game history from the browser's local storage.
 * This function is called when the DOM content has finished loading.
 */
document.addEventListener("DOMContentLoaded", function () {
    const historyFromLocalStorage = localStorage.getItem('history');
     const historyArray = JSON.parse(historyFromLocalStorage);
     const difficulty = historyArray.length > 0 ? historyArray[0].difficulty : 'easy';
     const menu_song = document.getElementById("img_menu");
     const button_pause = document.getElementById("img_music");
     const song = document.getElementById("music");
     const cardWidth = 200;
     const cardHeight = 200;
     const startX = 10;
     const startY = 10;
     
     // Retrieve panel dimensions from localStorage at script start
     const startButton = document.getElementById("start-button");
     const overlay = document.getElementById("overlay");
     const restartButton = document.getElementById("restart_button");
     const difficult = document.getElementById("change-difficulty");
     const size = document.getElementById("change-cards");
     const select_difficulty = document.getElementById("difficulty-select");
     const select_size = document.getElementById("card-number-select");
     const button_difficulty = document.getElementById("difficulty_select_button");
     const button_size = document.getElementById("size_select_button");
     const result_difficulty = document.getElementById("difficulty");
     const result_size = document.getElementById("number_of_cards");
     var attemptsfixed;
     // Get the selected size stored in sessionStorage
     var chosen_size = sessionStorage.getItem('number_of_cards');
     // Get the selected difficulty level stored in sessionStorage
     var chosen_difficulty = sessionStorage.getItem('set_difficulty');
     var back_to_game_Button = document.getElementById("back-to-game");
     var exit_Button = document.getElementById("exit");
     var cards_view_Button = document.getElementById("cards_view");
     var buy_Button = document.getElementById("buy");
    /**
    * Sets the volume of the game's background music to a low level.
    */
    song.volume = 0.03;
     var imagePaths; // Defines imagePaths in the same scope where flipCard is called
     var cards_number; // Define cards_number in the same scope where flipCard is called
     var cost_see_letters;
     var cost_discard_letters;
     var cost_add_attempts;
    /**
    * Toggles the mute state of the song audio element.
    */
    button_pause.addEventListener("click", function () {
        song.muted = !song.muted;
         updateButtonState();
     });

    /**
        /**
     * Updates the state of the pause button based on whether the audio is muted or not.
     * If the audio is muted, the button will display the muted icon. Otherwise, it will display the play audio icon.
     */

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

    /**
    * Determines the number of cards to be used in the game based on the chosen game size.
    * @returns {number} The number of cards to be used in the game.
    */
    function cardsRest() {
        var size = chosen_size;
        switch (size) {
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
     // Call cardsRest() to initialize cards_number
     cards_number = cardsRest();
    /**
    * Calculates the time delay for flipping cards based on the current difficulty setting.
    * 
    * @returns {number} The time delay in milliseconds for flipping cards.
    */
    function timerFlip() {
        var timeFlip;
        switch (difficulty) {
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
    /**
     * Calculates the size of the game board based on the number of cards.
     *
     * @param {number} cardWidth - The width of each card.
     * @param {number} cardHeight - The height of each card.
     * @param {number} startX - The starting X coordinate of the board.
     * @param {number} startY - The starting Y coordinate of the board.
     * @param {number} cards_number - The total number of cards in the game.
     * @returns {void}
     */
    function boardsize(cardWidth, cardHeight, startX, startY, cards_number) {
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
            default:
                cols = 3;
                rows = 3;
                break;
        }

        // Calculates the width and height of the panel based on the number of columns and rows        
        var panelWidth = cols * (cardWidth + 20) + startX;
        var panelHeight = rows * (cardHeight + 20) + startY;
        // Adjust the canvas size to the panel size       
        canvas.width = panelWidth;
        canvas.height = panelHeight;
    }
    
    /**
    * Loads the image routes for the game characters.
    */
    cargarRutasDeImagenes('IMGs/game_characters')
        .then(function (selectedImages) {
            // Here you can continue the game initialization process using the selected images        
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


    /**
     * Loads the file paths of images from a specified folder.
     * 
     * @param {string} carpeta - The name of the folder containing the images.
     * @returns {Promise<string[]>} - An array of file paths for the images in the folder.
     */
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

                // Randomly shuffle image paths
                const shuffledPaths = shuffleArray(pathsWithDot);

                // Select half of the images to use as pairs
                const selectedPaths = shuffledPaths.slice(0, Math.ceil(cards_number / 2));

                // Duplicate selected routes to match them
                const pairedPaths = [...selectedPaths, ...selectedPaths];

                // Shuffle the paired routes so that the pairs are randomized
                const shuffledPairs = shuffleArray(pairedPaths);

                return shuffledPairs;
            })
            .catch(error => {
                console.error("Error al obtener la lista de imágenes:", error);
                return [];
            });
    }

        
        
        
    /**
     * Shuffles the elements of the provided array in-place.
     * @param {Array} array - The array to be shuffled.
     * @returns {Array} The shuffled array.
     */
    function shuffleArray(array) {
        for (let card = array.length - 1; card > 0; card--) {
            const cards = Math.floor(Math.random() * (card + 1));
            [array[card], array[cards]] = [array[cards], array[card]];
        }
        return array;
    }
        

    
    
    
    /**
     * Initializes the card game by setting up the canvas, shuffling and displaying the cards, and handling user interactions.
     * 
     * This function sets up the initial state of the card game, including:
     * - Verifying that there are enough images for the cards
     * - Adjusting the size of the game board
     * - Shuffling and duplicating the card images
     * - Creating the card objects and drawing them on the canvas
     * - Adding a click event listener to the canvas to handle card flipping
     * - Defining functions to flip, redraw, and compare cards
     * - Handling additional game mechanics like discarding cards and buying more attempts
     */
    /**
     * Initializes the card game by setting up the canvas, shuffling and displaying the cards, and handling user interactions.
     * 
     * This function sets up the game board, including the size of the cards, the starting position, and the background image. It then shuffles the images and assigns them to the cards. The function also sets up event listeners to handle user clicks on the cards, and manages the flipping and comparison of the cards.
     * 
     * Additionally, this function includes functionality for allowing the user to view the unmatched cards for a limited time, and to discard a pair of cards in exchange for points.
     */
    function initializeCardGame() {
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        var cardWidth = 130;
        var cardHeight = 190;
        var startX = 50;
        var startY = 50;
        var backImage = "./IMGs/necessary_images/back_of_a_letter.png";
        // Check if there are enough images for the front cards
        if (!imagePaths || imagePaths.length < cards_number / 2) {
            console.error("No hay suficientes imágenes para inicializar el juego.");
            return;
        }
        // Call the boardsize function to adjust the size of the panel
        boardsize(cardWidth, cardHeight, startX, startY, cards_number);

        // Mix image paths
        var shuffledImages = shuffleArray(imagePaths.slice());

        // Duplicate selected images
        var duplicatedImages = shuffledImages.concat(shuffledImages);

        // Mix the order of the cards
        var shuffledCards = shuffleArray(Array.from({ length: cards_number }, (_, couple) => couple));

        // Create cards on the board with backs and random images
        for (let couple = 0; couple < cards_number; couple++) {
            const col = couple % Math.sqrt(cards_number);
            const row = Math.floor(couple / Math.sqrt(cards_number));
            var x = startX + col * (cardWidth + 20);
            var y = startY + row * (cardHeight + 20);
            drawCard(ctx, backImage, x, y, cardWidth, cardHeight); // Draw the back of the cards
            cards.push({
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                flipped: false, // Initially, the cards are not turned over
                id: couple,
                frontImage: duplicatedImages[shuffledCards[couple]], // Assign random images
                backImage: backImage
            });
        }
        // Global variable to control whether more cards can be flipped
        var canFlipMoreCards = true;
        // Variable to store the flipped cards
        let flippedCards = [];
        canvas.addEventListener('click', function (event) {
            if (!canFlipMoreCards) return;

            var rect = canvas.getBoundingClientRect();
            var mouseX = event.clientX - rect.left;
            var mouseY = event.clientY - rect.top;

            for (let container = 0; container < cards.length; container++) {
                var card = cards[container];
                if (!card.flipped && mouseX >= card.x && mouseX <= card.x + card.width &&
                    mouseY >= card.y && mouseY <= card.y + card.height) {
                    flipCard(card);
                    break;
                }
            }
        });

        
        /**
         * Flips a card in the game and handles the logic for comparing cards.
         *
         * @param {Object} card - The card object to be flipped.
         * @returns {void}
         */
        function flipCard(card) {
            if (!canFlipMoreCards || flippedCards.length >= 2) return;

            card.flipped = true;
            redrawCard(card);
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                canFlipMoreCards = false;
                setTimeout(compareCards, timerFlip());
            }
        }

        /**
         * Flips a card back to its original state, hiding the card's face.
         * @param {Object} card - The card object to be flipped back.
         */
        function flipBackCard(card) {
            card.flipped = false;
            redrawCard(card);
        }


        /**
         * Redraws a card on the canvas.
         * @param {Object} card - The card object to redraw.
         * @param {number} card.x - The x-coordinate of the card.
         * @param {number} card.y - The y-coordinate of the card.
         * @param {number} card.width - The width of the card.
         * @param {number} card.height - The height of the card.
         * @param {HTMLImageElement} card.frontImage - The image to use for the front of the card.
         * @param {HTMLImageElement} card.backImage - The image to use for the back of the card.
         * @param {boolean} card.flipped - Whether the card is flipped or not.
         */
        function redrawCard(card) {
            ctx.clearRect(card.x, card.y, card.width, card.height);
            drawCard(ctx, card.flipped ? card.frontImage : card.backImage, card.x, card.y, card.width, card.height);
        }

        /**
         * Draws a card image on the provided canvas context.
         *
         * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw the card on.
         * @param {string} imagePath - The file path to the card image.
         * @param {number} x - The x-coordinate to draw the card at.
         * @param {number} y - The y-coordinate to draw the card at.
         * @param {number} width - The width to draw the card at.
         * @param {number} height - The height to draw the card at.
         */
        function drawCard(ctx, imagePath, x, y, width, height) {
            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, x, y, width, height);
            };
            img.src = imagePath;
        }

        /**
         * Compares the two flipped cards and performs the appropriate actions based on whether they match or not.
         * 
         * If the cards match, it opens a gift and decrements the remaining card count. If there are no more cards left,
         * the card count is set to 0.
         * 
         * If the cards do not match, it flips the cards back over and decrements the remaining attempts.
         * 
         * Finally, it resets the flipped cards array and allows more cards to be flipped.
         */
        function compareCards() {
            const [card1, card2] = flippedCards;

            if (card1.frontImage === card2.frontImage) {
                // Matching cards
                openGift();
                if (cards_number > 0) {
                    cards_number -= 2;

                }

                else {
                    cards_number = 0;
                }
            } else {
                // Different cards
                flipBackCard(card1);
                flipBackCard(card2);
                attempts_rest();
            }

            flippedCards = [];
            canFlipMoreCards = true;
        }


        var cardsToFlip = [];
        var matchedCards = [];
        const discard_Button = document.getElementById("discard");
        const pointsInput = document.getElementById("points");
        const alert_not_points = document.getElementById("not_points");
        

        /**
         * Handles the click event on the "View Cards" button. If the user has at least the required number of points, it reveals all unpaired cards for a short period of time, and then hides them again. If the user does not have enough points, it displays an alert message.
         */
        cards_view_Button.addEventListener("click", function () {
            // Check if the user has at least 60 points
            if (pointsInput.value >= cost_see_letters && cards_number > 0) {
                // Deduct 60 points
                updatePointsMarker(-cost_see_letters);
                
                // Filter unmatched cards
                const unpairedCards = cards.filter(card => !matchedCards.includes(card) && !card.flipped);

                // Flip unmatched cards
                unpairedCards.forEach(card => {
                    card.flipped = true;
                    redrawCard(card);
                });

                // Return to its initial state after a while
                setTimeout(() => {
                    unpairedCards.forEach(card => {
                        card.flipped = false;
                        redrawCard(card);
                    });
                }, 2000); // Here you can set the wait time in milliseconds (2000ms = 2s)
            } else {
                // Show alert if you don't have enough points
                alert_not_points.style.visibility = "visible";

                // Hide alert after 2 seconds
                setTimeout(() => {
                    alert_not_points.style.visibility = "hidden";
                }, 5000);
            }
        });







        /**
         *Handles the click event on the discard button. If the user has at least 60 points and there are cards remaining, it will deduct 60 points, find a matching pair of cards, and flip . If no matching pair is found, it will display a message. If the user does not have enough points, it will display an alert.
         */
        discard_Button.addEventListener("click", function () {
            // Check if the user has at least 60 points
            if (pointsInput.value >= cost_discard_letters && cards_number > 0) {
                // Clear cardsToFlip at start of search to avoid repetition
                cardsToFlip = [];
                // Deduct 60 points
                updatePointsMarker(-cost_discard_letters);
                // Find a new pair of matching cards
                cardsToFlip = findMatchingPair(cards);

                // Check if a match was found
                if (cardsToFlip.length === 2) {
                    // Flip selected cards temporarily
                    cardsToFlip.forEach(card => flipCarddiscard(card));
                    cardsToDiscard = cardsToFlip;
                    cards_number -= 2;
                } else {
                }
            } else if (flippedCards.length === 1) {
                return;
            } else {
                // Show alert if you don't have enough points
                alert_not_points_using();
            }
        });
        /**
         * Displays an alert message if the user does not have enough points, and hides the alert after 5 seconds.
         */
        function alert_not_points_using() {
            // Show alert if you don't have enough points
            alert_not_points.style.visibility = "visible";

            // Hide alert after 2 seconds
            setTimeout(() => {
                alert_not_points.style.visibility = "hidden";
            }, 5000);
        }

        
        /**
         * Finds a matching pair of cards from the given array of cards.
         *
         * @param {Object[]} cards - An array of card objects, each with `frontImage` and `id` properties.
         * @returns {Object[]} - An array containing the two matching cards, or an empty array if no match is found.
         */
        function findMatchingPair(cards) {
            const unpairedCards = cards.filter(card => !matchedCards.includes(card));
            const selectedPair = [];

            for (let couples = 0; couples < unpairedCards.length; couples++) {
                const currentCard = unpairedCards[couples];
                const matchingCard = unpairedCards.find(card => card.frontImage === currentCard.frontImage && card.id !== currentCard.id);

                if (matchingCard && !selectedPair.includes(currentCard) && !selectedPair.includes(matchingCard)) {
                    selectedPair.push(currentCard);
                    selectedPair.push(matchingCard);
                    matchedCards.push(currentCard);
                    matchedCards.push(matchingCard);
                    break;
                }
            }

            return selectedPair;
        }

        /**
         * Flips a card and discards it.
         * @param {Object} card - The card object to be flipped and discarded.
         */
        function flipCarddiscard(card) {

            card.flipped = true;
            redrawCard(card);
        }











        /**
         * Handles the click event on the "buy" button, allowing the user to purchase additional attempts for the game.
         * If the user has enough points and has not reached the maximum number of attempts, the function will deduct the cost of the additional attempts from the user's points and increment the number of attempts.
         * If the user does not have enough points, an alert will be displayed indicating that they do not have enough points.
         * If the user has reached the maximum number of attempts, an alert will be displayed for 5 seconds indicating that the user has reached the limit of attempts.
         */
        buy_Button.addEventListener("click", function () {
            let attemptsElement = document.getElementById("attempts");
            if (attempts <= attemptsfixed - 1) {
                if (pointsInput.value >= cost_add_attempts) {
                    // Deduct 60 points
                    updatePointsMarker(-cost_add_attempts);
                    attemptsElement.value++ + 1;
                    attempts++;
                } else {
                    alert_not_points_using();
                }
            }
            else {
                let alert_limit_attempts = document.getElementById("limit_attepts");
                // Show alert if you don't have enough points
                alert_limit_attempts.style.visibility = "visible";

                // Hide alert after 2 seconds
                setTimeout(() => {
                    alert_limit_attempts.style.visibility = "hidden";
                }, 5000);

            }

        })


    }
    
    
    
    
     
    
    
    
    
    /**
     * Opens a gift and updates the player's score based on the difficulty level.
     * 
     * The function first determines the path to the gift image and the number of points to add based on the current difficulty level. It then displays the gift image for a short duration and updates the player's score accordingly.
     */
    function openGift() {
        let pointsToAdd;
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

        // Make the element visible
        giftImage.style.visibility = "visible";

        // Hide element after 3 seconds (3000 milliseconds)
        setTimeout(function () {
            giftImage.style.visibility = "hidden";
        }, 1500); // Change this value depending on how long you want the element to be visible
        // Update the scoreboard
        updatePointsMarker(pointsToAdd);
    }


    /**
     * Updates the points marker on the page and persists the updated score in localStorage.
     *
     * @param {number} pointsToAdd - The number of points to add to the current score.
     */
    function updatePointsMarker(pointsToAdd) {
        const pointsMarker = document.getElementById("points");

        if (pointsMarker) {
            // Adds current points to value passed as argument
            points = parseInt(pointsMarker.value) + pointsToAdd;
            pointsMarker.value = points;

            // Update points in localStorage
            var username = document.getElementById('nick_name').value;
            var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
            var existingUserIndex = users.findIndex(user => user.username === username);
            if (existingUserIndex !== -1) {
                users[existingUserIndex].score = points;
                localStorage.setItem(`topUsers_${difficulty}`, JSON.stringify(users));
            }
        }
    }
    
    
    
    
    
    
    /**
     * Determines the number of cards to be used in the game based on the chosen game size.
     * 
     * @returns {number} The number of cards to be used in the game.
     */
    function cardsRest() {
        switch (chosen_size) {
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
    /**
     * Retrieves the number of cards remaining in the game.
     * @returns {number} The number of cards remaining.
     */
    cards_number = cardsRest();
    
    /**
     * Decrements the countdown timer and checks if the time has elapsed.
     * @returns {boolean} - True if the countdown has reached zero, false otherwise.
     */
    function rest_time() {
        countdown_rest--;
        countdownElement.value = countdown_rest;
        // Check if time has expired
        if (countdown_rest === 0) {
            countdownElement = 0;
            return true;
        }
        return false;
    }
    
    
    

    /**
     * Indicates whether the game has reached a savepoint.
     */
    var savepoint = false;

    /**
     * Displays the game over screen when the countdown reaches 0 or the player has no more attempts.
     * Saves the player's points if they haven't been saved before, and starts a new game.
     */
    function showGameOverScreen() {
        const gameOverScreen = document.getElementById("game-over-screen");
        if (countdown_rest === 0 || attempts_rest() === false) {
            gameOverScreen.style.display = "flex";
            gameOverScreen.style.visibility = "visible";
            countdownElement = 0;
            startGame();

            // Checks if points have already been saved before calling savepoints()
            if (!savepoint) {
                savepoints();
                savepoint = true;
            }
        }
    }
    /**
     * Displays the menu screen and sets up the necessary elements.
     * This function is responsible for showing the menu interaction screen and the main menu screen.
     * It also checks if any savepoints have been set and calls the `savepoints()` function if not.
     */
    function showMenuScreen() {
        if (!savepoint) {
            savepoints();
            savepoint = true;
        }
        const menu_interaction = document.getElementById("menu_interaction_screen");
        menu_interaction.style.display = "flex";
        menu_interaction.style.visibility = "visible";
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "flex";
        menuScreen.style.visibility = "visible";
        countdownElement = 0;
    }
    
    /**
     * Represents the number of attempts the user has made in the card game.
     * This variable is used to track the user's progress and display it on the game interface.
     */
    var attemptsElement = document.getElementById("attempts");
    /**
     * Represents the number of attempts made by the user in the card game.
     */
    var attempts;

    /**
     * Decrements the remaining attempts and updates the UI. If the attempts reach 0, it calls the `showGameOverScreen` function and returns `true` to indicate the game is over. Otherwise, it returns `false`.
     * @returns {boolean} `true` if the game is over, `false` otherwise.
     */
    function attempts_rest() {
        attempts--;
        attemptsElement.value = attempts;
        if (attempts === 0) {
            attemptsElement = 0;
            showGameOverScreen(); // Call showGameOverScreen when time runs out
            return true;
        }
        return false;
    }
    
    /**
     * Initializes the game state and sets up the game parameters based on the chosen size and difficulty.
     * This function is called to start a new game.
     */
    function startGame() {
        game_events();

        switch (chosen_size + difficulty) {
            case "nine" + "easy":
                countdown_rest = 60;
                attemptsfixed = 9;
                cost_add_attempts = 40;
                cost_discard_letters = 50;
                cost_see_letters = 50;
                break;
            case "nine" + "half":
                countdown_rest = 50;
                attemptsfixed = 7;
                cost_add_attempts = 50;
                cost_discard_letters = 60;
                cost_see_letters = 60;
                break;
            case "nine" + "difficult":
                countdown_rest = 40;
                attemptsfixed = 5;
                cost_add_attempts = 60;
                cost_discard_letters = 70;
                cost_see_letters = 70;
                break;
            case "sixteen" + "easy":
                countdown_rest = 120;
                attemptsfixed = 12;
                cost_add_attempts = 60;
                cost_discard_letters = 70;
                cost_see_letters = 70;
                break;
            case "sixteen" + "half":
                countdown_rest = 100;
                attemptsfixed = 10;
                cost_add_attempts = 70;
                cost_discard_letters = 80;
                cost_see_letters = 80;
                break;
            case "sixteen" + "difficult":
                countdown_rest = 80;
                attemptsfixed = 8;
                cost_add_attempts = 80;
                cost_discard_letters = 90;
                cost_see_letters = 90;
                break;
            case "twenty-five" + "easy":
                countdown_rest = 150;
                attemptsfixed = 15;
                cost_add_attempts = 80;
                cost_discard_letters = 90;
                cost_see_letters = 90;
                break;
            case "twenty-five" + "half":
                countdown_rest = 120;
                attemptsfixed = 13;
                cost_add_attempts = 100;
                cost_discard_letters = 120;
                cost_see_letters = 120;
                break;
            case "twenty-five" + "difficult":
                countdown_rest = 100;
                attemptsfixed = 11;
                cost_add_attempts = 120;
                cost_discard_letters = 150;
                cost_see_letters = 150;
                break;
            default:
                countdown_rest = 100;
                attemptsfixed = 9;
                cost_add_attempts = 40;
                cost_discard_letters = 50;
                cost_see_letters = 50;
                break;

        }

        attempts = attemptsfixed;
        countdownElement.value = countdown_rest;
        attemptsElement.value = attempts;

        var buy_br = document.getElementById("buy_br");
        var discard_br = document.getElementById("discard_br");
        var cards_view_br = document.getElementById("cards_view_br");

        if (buy_br) {
            buy_br.innerText = "" + cost_add_attempts + " pts";
        }

        if (discard_br) {
            discard_br.innerText = "" + cost_discard_letters + " pts";
        }

        if (cards_view_br) {
            cards_view_br.innerText = "" + cost_see_letters + " pts";
        }

    }
    
   

    /**
     * Handles the logic for the "Difficulty" button and the difficulty selection dropdown.
     * - Hides the "Difficulty" button and shows the difficulty selection dropdown after a 1-second delay.
     * - Listens for a click event on the "Difficulty" button to update the chosen difficulty in the user's data.
     * - Updates the chosen difficulty in the user's session storage and local storage history.
     * - Reloads the page after the difficulty has been updated.
     */
    difficult.addEventListener("click", function () {
        // Hide difficulty button
        difficult.style.visibility = "hidden";

        // Show difficulty selector after one second
        setInterval(() => {
            select_difficulty.style.visibility = "visible";
            select_difficulty.style.display = "flex";
            select_difficulty.style.flexDirection = "column";
        }, 1000);

        button_difficulty.addEventListener("click", function () {
            // Get selected value from difficulty selector
            var newDifficulty = result_difficulty.value;

            // Check if the difficulty has been changed
            if (chosen_difficulty !== newDifficulty) {
                // Update chosen_difficulty in userdata
                chosen_difficulty = newDifficulty;

                // Save updated value to sessionStorage
                sessionStorage.setItem('set_difficulty', chosen_difficulty);

                // Get user history from localStorage
                var history = JSON.parse(localStorage.getItem('history')) || [];

                // Update difficulty in user history
                history.forEach(userRecord => {
                    if (userRecord.user === nick_user) {
                        userRecord.difficulty = chosen_difficulty;
                    }
                });

                // Save updated history to localStorage
                localStorage.setItem('history', JSON.stringify(history));
            }
            location.reload();
        });
    });
    


    /**
     * Handles the functionality for the size selection button in the card game.
     * When the size button is clicked, it hides the button and shows the size selection dropdown.
     * When a new size is selected, it updates the chosen size, saves it to sessionStorage,
     * recalculates the number of cards, loads the new image paths, updates the board size,
     * saves the panel dimensions to localStorage, and then reinitializes the card game.
     */
    size.addEventListener("click", function () {
        let size_modifier = document.getElementById("number_of_cards");
        // Hide size selection button
        size.style.visibility = "hidden";
        // Show size selector immediately
        select_size.style.visibility = "visible";
        select_size.style.display = "flex";
        select_size.style.flexDirection = "column";
    
        button_size.addEventListener("click", function () {
            chosen_size = size_modifier.value;
            sessionStorage.setItem('number_of_cards', chosen_size);

            // Get user history from localStorage
            var history = JSON.parse(localStorage.getItem('history')) || [];
            history.forEach(userRecord => {
                if (userRecord.user === nick_user) {
                    userRecord.size = chosen_size;
                }
            });
             // Save updated history to localStorage
             localStorage.setItem('history', JSON.stringify(history));
             location.reload();
        });
        

    });
    
    
    /**
     * Handles the click event on the "back to game" button. Reloads the page, saves the player's points, and starts a new game.
     */
    back_to_game_Button.addEventListener("click", function () {
        location.reload();
        savepoints();
        startGame();
    });
    
    /**
     * Handles the click event on the start button, hiding the start screen, starting the game, and viewing the top users.
     */
    startButton.addEventListener("click", function () {
        hideStartScreen();
        startGame();
        viewTopUsers();
    });

    /**
     * Handles the click event of the restart button. Hides the game over screen, reloads the page, and calls the `viewTopUsers` function.
     */
    restartButton.addEventListener("click", function () {
        hideGameOverScreen();
        location.reload();
        viewTopUsers();
    });
    
    /**
     * Handles the click event of the exit button, saving the player's points and navigating to the entry form page.
     */
    exit_Button.addEventListener("click", function () {
        console.log("le he dado");
        savepoints();
        location = "entry_form.html";
    })
    
 
    /**
     * Hides the start screen overlay.
     */
    function hideStartScreen() {
        overlay.style.display = "none";
    }

    /**
     * Hides the game over screen by setting its display property to "none".
     */
    function hideGameOverScreen() {
        const gameOverScreen = document.getElementById("game-over-screen");
        gameOverScreen.style.display = "none";
    }
   
    
    
    /**
     * Updates the user's information in the game interface, including the user's name, avatar, and difficulty level.
     * It also retrieves the user's score from the local storage and updates the score display.
     */
    function information_user() {
        var user = nick_user;
        var game_user = document.getElementById('nick_name');

        // Update username in interface
        if (user && game_user) {
            if (game_user.value !== user) {
                game_user.value = user;
            }
        }

        // Update avatar in the interface
        var majorAvatar = document.getElementById('major_avatar');
        if (majorAvatar) {
            majorAvatar.src = avatar || "";
        }

        // Update difficulty in interface
        var status_difficulty = document.getElementById("set_difficulty");
        status_difficulty.value = difficulty;  // Asegúrate de que `difficulty` esté definido en tu código

        // Retrieve user points from topUsers_{difficulty} and assign to points marker
        var topUsers = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];
        var userEntry = topUsers.find(entry => entry.username === user);

        if (userEntry) {
            points = userEntry.score;  // Assign to global variable
        } else {
            points = 0;  // If there is no input, set points to 0
        }

        // Update the points marker in the interface
        var pointsMarker = document.getElementById('points');
        if (pointsMarker) {
            pointsMarker.value = points;
        }
    }
    
    
    
    
    
    /**
     * Retrieves information about the current user.
     */
    information_user();
    

    /**
     * Retrieves the HTML element with the ID "countdown" and stores it in the `countdownElement` variable.
     */
    let countdownElement = document.getElementById("countdown");
    /**
     * Represents the time remaining for a countdown.
     */
    let countdown_rest;
    
    /**
     * Saves the user's score to the top users list in local storage.
     *
     * @param {string} username - The username of the player.
     * @param {number} score - The score of the player.
     * @param {string} difficulty - The difficulty level of the game.
     */
    function savepoints() {
        var username = document.getElementById('nick_name').value;
        var score = parseInt(document.getElementById('points').value);

        if (!username || isNaN(score) || score <= 5) {
            return;
        }

        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];

        var existingUserIndex = users.findIndex(user => user.username === username);
        if (existingUserIndex !== -1) {
            users[existingUserIndex].score = score;  // Replace points instead of adding them
        } else {
            users.push({ username: username, score: score });
        }

        saveTopUsers(users);
    }
    /**
     * Saves the top 10 users based on their score for the current difficulty level.
     *
     * @param {Object[]} users - An array of user objects, each with a 'score' property.
     * @returns {void}
     */
    function saveTopUsers(users) {
        users.sort((a, b) => b.score - a.score);
        users = users.slice(0, 10);
        localStorage.setItem(`topUsers_${difficulty}`, JSON.stringify(users));
    }
    

    /**
     * Displays the top users based on their scores in the game.
     * This function retrieves the top users from the local storage and displays them in a list.
     * If there are no top users or the necessary elements are not found, the container is hidden.
     */
    function viewTopUsers() {
        var content_top = document.getElementById("content_top_user");
        var container_top = document.getElementById("container_top_user");
        var users = JSON.parse(localStorage.getItem(`topUsers_${difficulty}`)) || [];

        if (users.length < 1 || content_top === undefined) {
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

    /**
     * Displays the top users in the card game.
     */
    viewTopUsers();

    /**
     * Manages the game events, including the timer and game over/menu screen handling.
     * This function is responsible for the following:
     * - Checking if the timer has reached zero and displaying the game over screen if so.
     * - Checking if the number of cards is 1 or 0 and displaying the menu screen if so.
     * - Saving the player's points only once when the game ends or the menu screen is shown.
     */
    function game_events() {
        let timerReachedZero = false;
        let idInterval = setInterval(function () {
            timerReachedZero = rest_time();

            if (timerReachedZero) {
                clearInterval(idInterval);
                showGameOverScreen();
            }
            if (cards_number === 1 || cards_number === 0) {
                clearInterval(idInterval);
                showMenuScreen();
            }
        }, 1000);
        // Add a check to save points only once
        if (!savepoint && (timerReachedZero || cards_number === 1 || cards_number === 0)) {
            if (!savepoint) {
                savedpoints();
                savepoint = true;
            }
            savepoint = true;
        }

    }
    /**
     * Adjusts the width of all elements with the class "width_panel" to a new calculated width.
     */
    function adjustPanelWidth() {
        let panels = document.getElementsByClassName("width_panel");
        let newWidth = calculateNewWidth();

        for (let panel = 0; panel < panels.length; panel++) {
            panels[panel].style.width = newWidth;
        }
    }
    
    /**
     * Calculates the new width for the card container based on the number of cards.
     * @returns {string} The new width as a CSS value (e.g. '100%', '120%').
     */
    /**
     * Calculates the new width for the card container based on the number of cards.
     * 
     * If there are less than 16 cards, the width is set to 100%. If there are more than 16 cards, the width is set to 120%.
     * 
     * @returns {string} The new width for the card container.
     */
    function calculateNewWidth() {
        let viewportWidth = window.innerWidth;
        if (cards_number < 16) {
            return '100%';
        } else if (cards_number > 16) {
            return '120%';
        }

    }
    
    /**
     * Adjusts the width of a panel element when the window is loaded or resized.
     * This function is called when the 'load' and 'resize' events are triggered on the window object.
     */
    window.addEventListener('load', adjustPanelWidth);
    /**
     * Adjusts the width of a panel element when the window is resized.
     * This event listener is attached to the global `window` object.
     */
    window.addEventListener('resize', adjustPanelWidth);    
});
/**
 * Retrieves recovery data from the server.
 */
get_Recover_data();


/**
 * Redirects the user to the "entry_form.html" page if the user data is not valid.
 * This function is called when the user data check fails, and is used to handle the case where the user's data is not in the expected format or state.
 */
if (!checkUserData()) {
    // If user data is not valid, redirect to "entry_form.html"
    location = "entry_form.html";
}