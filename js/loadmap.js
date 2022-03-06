var map;
var place;
var autocomplete;
var infowindow = new google.maps.InfoWindow();

function initialization() {
    showAllObservations();
    initAutocomplete();
}

function showAllObservations() {
    $.ajax({
        url: 'HttpServlet',
        type: 'POST',
        data: { "tab_id": "1"},
        success: function(observations) {
            mapInitialization(observations);
        },
        error: function(xhr, status, error) {
            alert("An AJAX error occured: " + status + "\nError:  " + error);
        }
    });
}

function mapInitialization(observations) {
    var mapOptions = {
        mapTypeId : google.maps.MapTypeId.ROADMAP, // Set the type of Map
    };
    console.log(observations);
    console.log("inside mapInitialization")

    // Render the map within the empty div
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    map.setMapTypeId('terrain');

    var bounds = new google.maps.LatLngBounds();

    $.each(observations, function(i, e) {
        var long = Number(e['longitude']);
        var lat = Number(e['latitude']);
        var latlng = new google.maps.LatLng(lat, long);

        bounds.extend(latlng);

        // Create the infoWindow content
        var item = e['item'];

        var contentStr = '<h4>Report Water Waste</h4><hr>';
        contentStr += '<p><b>' + 'Water Waste' + ':</b>&nbsp' + e['item'] + '</p>';
        contentStr += '<p><b>' + 'Report' + ':</b>&nbsp' + e['report'] + '</p>';
        contentStr += '<p><b>' + 'Details' + ':</b>&nbsp' + e['details'] + '</p>';
        contentStr += '<p><b>' + 'Recorded by' + ':</b>&nbsp' + e['recorded_by'] + '</p>';
        contentStr += '<p><b>' + 'Date' + ':</b>&nbsp' + e['date'] + '</p>';

        //add custom icons for each item
        var icon;
        var item = e['item'];

        console.log(">>>>> ITEM: ", item);

        if (item=='Hydrant') {
            icon = {
                url: 'assets/img/icon/hydrant.png',
                scaledSize: new google.maps.Size(25, 30),}
        } else if (item == 'Meter') {
            icon = {
                url: 'assets/img/icon/meter.png',
                scaledSize: new google.maps.Size(30, 30), // scaled size
            }
        } else if (item == 'Pipe') {
            icon = {
                url: 'assets/img/icon/pipe.png',
                scaledSize: new google.maps.Size(30, 30), // scaled size
            }
        } else if (item == 'Valve') {
            icon = {
                url: 'assets/img/icon/valve.png',
                scaledSize: new google.maps.Size(20, 30), // scaled size
            }
        } else if (item == 'Sprinkler') {
            icon = {
                url: 'assets/img/icon/sprinkler.png',
                scaledSize: new google.maps.Size(30, 30), // scaled size
            }
        } else if (item == 'Contaminated') {
            icon = {
                url: 'assets/img/icon/contaminated.png',
                scaledSize: new google.maps.Size(20, 30), // scaled size
            }
        } else if (item == 'Other'){
            icon = {
                url: 'assets/img/icon/other.png',
                scaledSize: new google.maps.Size(30, 25), // scaled size
            }
        }

        var marker = new google.maps.Marker({ // Set the marker
            position : latlng, // Position marker to coordinates
            map : map, // assign the market to our map variable
            customInfo: contentStr,
            icon: icon,
        });

        // Add a Click Listener to the marker (creates infowindow content using contentStr (customInfo)
        google.maps.event.addListener(marker, 'click', function() {
            // use 'customInfo' to customize infoWindow
            infowindow.setContent(marker['customInfo']);
            infowindow.open(map, marker); // Open InfoWindow
        });
        markers.push(marker); //inside the jQuery $.each
    });
    //The MarkerClusterer needs to be below the Jquery $.each
    var clusterOptions = {
        imagePath:"img/m",
        zoomOnClick: true,
        maxZoom: 9
    };
    var markerCluster = new MarkerClusterer(map, markers, clusterOptions);
    markerCluster.addMarker(marker);

    map.fitBounds (bounds);

}

function initAutocomplete() {
    // Create the autocomplete object
    autocomplete = new google.maps.places.Autocomplete(document
        .getElementById('autocomplete'));

    // When the user selects an address from the dropdown, show the place selected
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
    place = autocomplete.getPlace();
    //QUESTION #3: Re-center the map using the autocompleted place
    if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
    } else {
    map.setCenter(place.geometry.location);
    map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
}



//Execute our 'initialization' function once the page has loaded.
google.maps.event.addDomListener(window, 'load', initialization);