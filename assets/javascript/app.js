// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCuAnrF-SWPMrbAPVUjtNg9urdaaneF08c&libraries=places">
var map;
var infowindow;
var service;
var lattitude = 0;
var longitude = 0;
var autoComplete;
var directionsService;
var directionsDisplay;
var inResultScreen = false;
// FIREBASE
var auth = firebase.auth();
var database = firebase.database();

$(document).ready(function () {

    $("#location").val("");
    $("#place").val("");

    // Geolocate();
    ActivateAutoComplete();

    $(document.body).on("click", ".header-logo", function () {
        $("#location").val("");
        $("#place").val("");
        location.reload();
        inResultScreen = false;
    });

    $(document.body).on("click", "#search", function (event) {
        // Prevent default action of button
        event.preventDefault();
        var search = "";
        if (lattitude == 0 || longitude == 0) {
            $("#no-location-modal").modal();
            return;
        }

        // Clear card content for new refill
        $("#cards").empty();

        // Check if we are in the home screen or in the result screen
        if (!inResultScreen) {
            // Save search word in a variable
            search = $("#place").val().trim();
            $("#place-result").val(search);
        } else {
            search = $("#place-result").val().trim();
        }

        if (search == "") {
            $("#no-search-modal").modal();
            return;
        }

        $(".main-content").removeAttr("hidden");
        $(".full-width").attr("hidden", "true");
        $(".carousel").attr("hidden", "true");
        inResultScreen = true;

        // Service and render for route calculation
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        // Set location
        console.log("coordinates: " + lattitude + " " + longitude);
        var location = new google.maps.LatLng(lattitude, longitude);

        infowindow = new google.maps.InfoWindow();

        // Init google map && set the map to the display route service
        map = new google.maps.Map(document.getElementById('map'), { center: location, zoom: 15 });
        directionsDisplay.setMap(map);

        // Create Location Marker
        var myLatLng = { lat: lattitude, lng: longitude };
        var homeIcon = {
            url: "assets/images/location.png", // url
            scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        var markerHome = new google.maps.Marker({
            position: myLatLng,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: homeIcon,
            title: "Current Location"
        });

        // Add listener for clicking the marker
        google.maps.event.addListener(markerHome, 'click', function () {
            infowindow.setContent(markerHome.title);
            infowindow.open(map, this);
        });

        // Set up of request for google places
        var request = {
            location: location,
            radius: 8000,
            keyword: search,
            fields: ['name', 'formatted_address', 'url', 'rating']
        };

        service = new google.maps.places.PlacesService(document.createElement('div'));

        service.nearbySearch(request, function (results, status) {
            console.log("Number of results: " + results.length);
            if (results.length == 0) {
                var noResultsDiv = $("<div>");
                var noResultsText = $("<h2>");
                noResultsText.text("No Results Found, try again with a different parameter");
                noResultsDiv.append(noResultsText);
                $("#cards").append(noResultsDiv);
            }
            for (var i = 0; i < results.length; i++) {
                // console.log(results[i]);
                CreateMarker(results[i]);
                CreateCard(results[i]);
            }
        });
    });

    $("#get-location").on("click", function (event) {
        // Prevent default action of button
        event.preventDefault();
        Geolocate();
    });


    /**
     * FIREBASE
     */

    // Auth state listener
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

            // Handling visibility
            $('#bt_sign_out').css('visibility', 'visible');
            $('#bt_register').css('visibility', 'hidden');
            $('#login-container').css('visibility', 'hidden');
            // Check if the user has a last location registered
            database.ref('users').child(uid).once('value').then(function (snapshot) {
                const userData = snapshot.val();
                $('#display-name').text(userData.user);
                if (userData.lat && userData.lng) {
                    lattitude = userData.lat;
                    longitude = userData.lng;
                    var latLng = new google.maps.LatLng(userData.lat, userData.lng);
                    var geocoder = new google.maps.Geocoder();
                    var address;
                    geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                        console.log(results[0].formatted_address);
                        address = results[0].formatted_address;
                        $("#location").val(address);
                    });
                } else {
                    // No last location saved for the user
                    console.log("No last location");
                }
            });
        } else {
            // User is signed out.
            // ...
        }
    });

    // Registration Modal
    $('#bt_register').click(function () {
        $('#registration-modal').modal({
            fadeDuration: 100
        });
    })

    $('#bt_login').on("click", function () {
        const email = $('#email').val();
        const password = $('#password').val();
        auth.signInWithEmailAndPassword(email, password).then(function (result) {
            //LOGIN OK
            //$('#login-container').css('visibility', 'hidden');
        }).catch(function(error) {
            alert(error.message);
            console.log("errorCode", error.code);
            console.log("errorMessage", error.message);
        });
    });

    // Sign out button click
    $('#bt_sign_out').click(function () {
        auth.signOut();
        alert("Signed Out!");
        // Clearing fields
        $("#location").val("");
        $("#email").val("");
        $("#password").val();
        // Handling visibility
        $('#bt_sign_out').css('visibility', 'hidden');
        $('#bt_register').css('visibility', 'visible');
        $('#login-container').css('visibility', 'visible');
        $('#display-name').text("")
    })

    /**
     *
     */


    // Create each card with the information from the request
});

// Register user in Firebase Auth and Database
function registerUser() {
    const email = $('#email-form').val();
    const password = $('#password-form').val();
    var queryURL = "http://apilayer.net/api/check?access_key=db5b19ad7744f0ff75ec67c569062ca5&email="
        + email +"&smtp=1&format=1";
    // Mailboxlayer API consumption
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(validation){
        if (validation.format_valid){
            auth.createUserWithEmailAndPassword(email, password).then(function (result) {
                // Clear fields
                $('#email-form').val("");
                $('#password-form').val("");
                console.log("USER CREATED IN AUTH");
                // Data
                const usuario = {
                    uid: result.user.uid,
                    email: result.user.email,
                    user: validation.user
                };
                // Database registration
                database.ref('users').child(result.user.uid).set(usuario).then(function () {
                    console.log("USER CREATED IN DB")
                }).catch(function (error) {
                    console.log("ERROR", error);
                });
            }).catch(function (error) {
                console.log("errorCode", error.code);
                console.log("Registration: errorMessage", error.message);
                alert(error.message);
            });
        }else{
            alert("The email is badly formatted")
        }
    })
}

function CreateCard(data) {
    // Creates the main div where we append everything
    var mainDiv = $("<div>");
    mainDiv.addClass("col-sm-6 col-md-4 col-lg-3 mb-3");

    // Card div
    var cardDiv = $("<div>");
    cardDiv.addClass("card .z-depth-1-half");

    // Image of the card
    var img = $("<img>");
    img.addClass("card-img-top");
    img.attr("style", "height: 250px; object-fit: cover;");

    // If the data doesn't have image, we use a placeholder of no image
    if (data.photos != undefined) {
        img.attr("src", data.photos[0].getUrl({ maxWidth: 250, maxHeight: 250 }));
    } else {
        img.attr("src", "assets/images/no-image.jpg");
    }

    // Card body div
    var cardBodyDiv = $("<div>");
    cardBodyDiv.addClass("card-body");

    // Card Name
    var name = $("<h4>");
    name.text(data.name);

    //Card address and icon
    var address = $("<p>");
    var addressIcon = $("<i class='fas fa-map-marker-alt'></i>");
    address.text(data.vicinity);
    address.prepend(addressIcon);

    // Card rating and icon
    var rate = $("<p>");
    var rateIcon = $("<i class='fas fa-star'></i>");
    rate.text(data.rating);
    rate.prepend(rateIcon);

    //Card button with function of get route and icon
    var button = $("<button>");
    var buttonIcon = $("<i class='fas fa-car icon-white'></i>");
    button.addClass("btn btn-lg btn-rounded btn-floating purple-gradient btn-block text-white");
    button.attr("onclick", "CalcRoute(" +
        lattitude + "," +
        longitude + "," +
        data.geometry.location.lat() + "," +
        data.geometry.location.lng() + ");return false;");
    button.text("Get route");
    button.prepend(buttonIcon);

    // Appending of the card information
    cardBodyDiv.append(name);
    cardBodyDiv.append(address);
    cardBodyDiv.append(rate);
    cardBodyDiv.append(button);

    // Appending of the image and the body
    cardDiv.append(img);
    cardDiv.append(cardBodyDiv);

    // Appending of everything to the main card
    mainDiv.append(cardDiv);

    // Appending of each card to the main div
    $("#cards").append(mainDiv);
}

// Geolocalization that asking user if want to share location and if geolocation is not enabled/available we create the location form
function Geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(GetPosition);
    } else {
        CreateLocationForm();
    }
}

// Save the lattitude and longitude from the geolocalization
function GetPosition(position) {
    lattitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("coordinates: " + lattitude + " " + longitude);
    var latLng = new google.maps.LatLng(lattitude, longitude);
    var geocoder = new google.maps.Geocoder();
    var address;
    geocoder.geocode({ 'latLng': latLng }, function (results, status) {
        console.log(results[0].formatted_address);
        address = results[0].formatted_address;
        $("#location").val(address);
    });

    /**
     * FIREBASE AUTH
     */
    if(firebase.auth().currentUser){
        // Saves the location in database
        const usuario = {
            uid: firebase.auth().currentUser.uid,
            email: firebase.auth().currentUser.email,
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        database.ref('users').child(firebase.auth().currentUser.uid).update(usuario).then(function () {
            console.log("REGISTRO USER LOCATION OK");
        }).catch(function (error) {
            console.log("ERROR SAVING USER LOCATION", error);
        });
    }else{
        console.log("No hay sesion")
    }
    /**
     *
     */
}

// Enables auto-complete
function ActivateAutoComplete() {
    var input = document.getElementById('location');
    autoComplete = new google.maps.places.Autocomplete(input);
    autoComplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);

    autoComplete.addListener('place_changed', function () {
        var place = autoComplete.getPlace();
        console.log(place);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        lattitude = place.geometry.location.lat();
        longitude = place.geometry.location.lng();

    });
}

// Create marker
function CreateMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location
    });
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

// Calculate route
function CalcRoute(startLat, startLon, endLat, endLong) {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    var startMap = new google.maps.LatLng(startLat, startLon);
    var endMap = new google.maps.LatLng(endLat, endLong);
    var request = {
        origin: startMap,
        destination: endMap,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}
