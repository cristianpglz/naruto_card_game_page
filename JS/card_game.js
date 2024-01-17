

var muted_song;
var song;
var cards;
var a;
var song_muted_img;

song = document.getElementById("song");

function play() {
    if (song.muted == "muted"){
                
    }
}





// Capture User Data
get_Recover_data();

// Check the Data
if (!checkUserData()) {
    // If user data is not valid, redirect to "entryForm.html"
    location = "entry_form.html";
}