// Initialize Firebase
var config = {
    apiKey: "AIzaSyARWRUwxYZGlySDKaxJJWtWmiizCnRY1n8",
    authDomain: "thisisalbertocantu.firebaseapp.com",
    databaseURL: "https://thisisalbertocantu.firebaseio.com",
    projectId: "thisisalbertocantu",
    storageBucket: "thisisalbertocantu.appspot.com",
    messagingSenderId: "971795188818"
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

// Capture Button Click
$("#send-message").on("click", function (event) {
    event.preventDefault();

    // Capture User Inputs and store into variables
    var name = $("#name-input").val().trim();
    var surname = $("#surname-input").val().trim();
    var email = $("#email-input").val().trim();
    var message = $("#message-input").val().trim();


    // Console log each of the user inputs to confirm we are receiving them
    console.log(name);
    console.log(surname);
    console.log(email);
    console.log(message);

    // Creates local "temporary" object for holding employee data
    var contactForm = {
        name: name,
        surname: surname,
        email: email,
        message: message,
    };

    // Uploads employee data to the database
    database.ref().push(contactForm);

    // Clears all of the text-boxes
    $("#name-input").val("");
    $("#surname-input").val("");
    $("#email-input").val("");
    $("#message-input").val("");

    //   database.ref().set({
    //     name: name,
    //     destination: dest,
    //     firstTrain: firstTrain,
    //     frequency: freq
    //   })

    return false
});


