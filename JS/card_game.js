// Capture User Data
get_Recover_data();

// Check the Data
if (!checkUserData()) {
    // If user data is not valid, redirect to "entryForm.html"
    location = "entry_form.html";
}