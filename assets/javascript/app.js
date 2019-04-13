// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCuAnrF-SWPMrbAPVUjtNg9urdaaneF08c&libraries=places">
var map;
var infowindow;
var service;
var lattitude;
var longitude;
var autoComplete;
var directionsService;
var directionsDisplay;

Geolocate();


$("#search").on("click", function (event) {

    // Prevent default action of button
    event.preventDefault();

    // Clear card content for new refill
    $("#cards").empty();

    // Save search word in a variable
    var search = $("#place").val().trim();

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
        // console.log(results);

        for (var i = 0; i < results.length; i++) {
            // console.log(results[i]);
            CreateMarker(results[i]);
            CreateCard(results[i]);
        }

    });


});


// Create each card with the information from the request
function CreateCard(data) {

    // Creates the main div where we append everything
    var mainDiv = $("<div>");
    mainDiv.addClass("col-sm-4 col-md-4 col-lg-3 mb-3");

    // Card div
    var cardDiv = $("<div>");
    cardDiv.addClass("card");

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
    var name = $("<h5>");
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
    var buttonIcon = $("<i class='fas fa-car'></i>");
    button.addClass("btn btn-primary btn-block");
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
        navigator.geolocation.getCurrentPosition(GetPosition, HandleGeoError);
    } else {
        CreateLocationForm();
    }
}

// Save the lattitude and longitude from the geolocalization
function GetPosition(position) {
    lattitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("coordinates: " + lattitude + " " + longitude);
}

// Enable location form if the user deny the sharing the location
function HandleGeoError(err) {
    if (err.code == 1) {
        CreateLocationForm();
    }
}

// Creates a form for user to input location manually with auto-complete
function CreateLocationForm() {
    var newForm = $("<label>");
    newForm.attr("for", "location");
    newForm.text("Location");

    var newInput = $("<input>");
    newInput.attr("type", "text");
    newInput.attr("id", "location");
    newInput.addClass("form-control");
    newInput.attr("placeholder", "Enter your location");

    $(".form-group").prepend(newInput);
    $(".form-group").prepend(newForm);
    ActivateAutoComplete();
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
