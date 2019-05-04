// Initialize Firebase
/*var config = {
    apiKey: "AIzaSyARWRUwxYZGlySDKaxJJWtWmiizCnRY1n8",
    authDomain: "thisisalbertocantu.firebaseapp.com",
    databaseURL: "https://thisisalbertocantu.firebaseio.com",
    projectId: "thisisalbertocantu",
    storageBucket: "thisisalbertocantu.appspot.com",
    messagingSenderId: "971795188818"
};*/
var config = {
    apiKey: "AIzaSyBWL9dN_Lhu---5hYFxcD0GhjYKMuiiJqs",
    authDomain: "travel-studio-eeb16.firebaseapp.com",
    databaseURL: "https://travel-studio-eeb16.firebaseio.com",
    projectId: "travel-studio-eeb16",
    storageBucket: "travel-studio-eeb16.appspot.com",
    messagingSenderId: "987837392805"
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

    /** DATABASE **/
    // Mailboxlayout API URl
    var queryURL = "https://apilayer.net/api/check?access_key=db5b19ad7744f0ff75ec67c569062ca5&email="
        + email +"&smtp=1&format=1";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(validation){
        if (validation.format_valid){
            // Valid format response
            // Obtaining push ID
            var pushid = database.ref('messages').push().key;
            // Uploads employee data to the database
            database.ref('messages').child(pushid).set(contactForm).then(function(){
                // On Succes
                console.log('message registered')
                // Clears all of the text-boxes
                $("#name-input").val("");
                $("#surname-input").val("");
                $("#email-input").val("");
                $("#message-input").val("");
            }).catch(function (error) {
                // OnFailure todo handle error
                console.log(error)
            })
        } else{
            // Invalid format response
            alert("Enter a valid email")
        }
    });

    //   database.ref().set({
    //     name: name,
    //     destination: dest,
    //     firstTrain: firstTrain,
    //     frequency: freq
    //   })

    return false
});

$('#send-offer-disscount').click(function () {// ID added to html element
    // User email input
    var email = $("#email-subscriptions").val().trim(); // ID added to html element
    // Mailboxlayout API URl
    var queryURL = "https://apilayer.net/api/check?access_key=db5b19ad7744f0ff75ec67c569062ca5&email="
        + email +"&smtp=1&format=1";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(validation){
        if (validation.format_valid){
            // Valid format response
            // Obtaining push ID
            var pushid = database.ref('subscriptions').push().key;
            var object = {
                email: email,
                push_id: pushid
            }
            console.log(pushid)
            console.log(object)
            // DB transaction
            database.ref('subscriptions')
                .child(pushid)
                .set(object)
                .then(function () {
                    // On Succes
                    $("#email-subscriptions").val("");
                })
                .catch(function (error) {
                    // On Failure todo hadle error
                });
        } else{
            // Invalid format response
            alert("Enter a valid email")
        }
    }).catch(function (errror) {
        console.log(error)
    })

})

