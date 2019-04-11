var service = new google.maps.places.PlacesService($('#tag-id').get(0));

function placeQuery(){
    var location = new google.maps.LatLng(22.154248,-100.979476)
    var request = {
        keyword: "pizza",
        radius: 1500,
        type: "restaurant",
        location: location
    }

    service.nearbySearch(request, function(results, status){
        console.log(status)
        if (status === google.maps.places.PlacesServiceStatus.OK){
            for(var i = 0; i < results.length; i++){
                var item = $('<h1 class="item">');
                var p = $("<p>").text(results[i].name);
                item.append(p);

                $("#tag-id").append(item)

            }
            console.log(results)
            $("#header1").text(results[0].geometry.location.lat)

            var placeID = results[0].place_id;

            var request2 = {
                placeId: placeID
            }

            service.getDetails(request2, function(place, status){
                if (status === google.maps.places.PlacesServiceStatus.OK){
                    console.log(place)
                }
            })
        }
    })
}

placeQuery()


function testData(){
    var queryURL = "https://maps.googleapis.com/maps/api/directions/json?origin=22.133541,-101.011290&destination=22.153591,-100.999651 &key=AIzaSyDheI0c_l_JaucbcUTP3nsDxYu2il8f1dM";
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'jsonp',
        cache: false
    }).done(function (data) {
        console.log(JSON.stringify(data))
    })
}

//testData()