var imagery = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.satellite',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});

var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.outdoors',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});


// Initialize global variables for the feature groups that will be included in the layer list
var waterWasteReportLayerGroup = L.featureGroup();


// Initialize global variables for data layers
var waterWasteReport;


// Initialize global variables for the layer list and overlays
var layerList;


// Initialize a global variable to hold the current location
var myLocation = null;


// Initialize a global variable that will hold the marker at the current location
var locationMarker = null;

// Initialize the default bounds of the map
var bounds = [[36.407637787357274, -115.47903305183634],
              [35.833990165829476, -114.54862840707085]];


// Initialize list of water features
var waterfeatureList = {
    
    "Hydrant" : 
    [
        {"features" : ""},
        {"features" : "Yellow - Public"},
        {"features" : "Red - Private"},
           
    ],
    "Meter" : 
    [
        {"features" : ""},
        {"features" : "Residential"},
        {"features" : "Commercial"}
             
    ],
    "Pipe" : 
    [
        {"features" : ""},
        {"features" : "Road"},
        {"features" : "Street"},
        {"features" : "Yard"}
    ],
    "Sprinkler" : 
    [
        {"features" : ""},
        {"features" : "Residential"},
        {"features" : "Commercial"}
    ],
    "Valve" : 
    [
        {"features" : ""},
        {"features" : "Road"},
        {"features" : "Street"},
        {"features" : "Yard"}
    ],
    "Contaminated" : 
    [
        {"features" : ""},
        {"features" : "Lake"},
        {"features" : "Pool"},
        {"features" : "Other"}
    ], 
    "Other" : 
    [
        {"features" : ""},
        {"features" : "Other"}
    ]   
};


// Create variables to store the species family and species dropdowns
var waterFeaturesDropdown = $("#waterFeaturesDropdown");
var waterDropdown = $("#waterDropdown");


// Initialize global variables to hold the selected species family and species
var selectedwaterFeatures,
    selectedWater;


// Update the species dropdown when the user selects a species family
waterFeaturesDropdown.on('change', function () {
    
    // Create a variable to store the selected species family
    selectedwaterFeatures = $("#waterFeaturesDropdown option:selected").text();
    
    // Update the species dropdown based on the selected species family
    updatewaterDropdown(selectedwaterFeatures);
    
    // Enable the Submit button if the required fields are populated
    checkForRequiredFields();
    
});


// Function to update the species dropdown based on the selected species family
var updatewaterDropdown = function (waterFeatures) {
    
    // Initialize a variable to store the species list
    var listItems = "";
    
    // If a species family is selected (excluding default value)
    if (selectedwaterFeatures !== "") {
        
        // Loop through the list of species for the selected species family
        for (var i = 0; i < waterfeatureList[waterFeatures].length; i++) {

            // Add a new <option> value for the current species
            listItems += "<option value='" + waterfeatureList[waterFeatures][i].species + "'>" + waterfeatureList[waterFeatures][i].species + "</option>";
        }        
    }

    // Add the species list to the species dropdown
    $("#ui-controls #waterDropdown").html(listItems);
};


// When the user selects a species, check to enable the Submit button 
waterDropdown.on('change', function () {
    
    // Enable the Submit button if the required fields are populated
    checkForRequiredFields();
    
});


// Create a variable to store the filter by theme dropdown
var filterByThemeDropdown = $("#filterDropdown");


// Update the species dropdown when the user selects a species family
filterByThemeDropdown.on('change', function () {
    
    // Create a variable to store the value of the selected theme
    var selectedTheme = $("#filterDropdown option:selected").val();
    
    // Update the points of interest based on the selected theme
    filterPointsOfInterest(selectedTheme);
    
});


// Set a global variable for the CARTO username
var cartoUserName = "mlazarte";


// Set global variables for the CARTO database queries

// SQL queries to get all features from each layer
var sqlQueryWaterWasteReport = "SELECT * from water_waste_report";

// Set the basemap for the layer list
// If only one basemap is included, it is not part of the layer list
var baseMaps = {
    "Streets": outdoors,
    "Imagery": imagery
};


// Set the overlays to include in the layer list
var overlays = {
    "Water Waste Areas": waterWasteReportLayerGroup
};


// Set the map options
var mapOptions = {
    center: [36.143243, -115.150001],
    zoom: 10,
    minZoom: 1,
    maxZoom: 50,
    zoomControl: false, // do not add a zoom control by default (it will be added based on screen width)
    maxBounds: L.latLngBounds([36.407637, -115.479033],[35.833990, -114.548628]), // panning bounds so the user doesn't pan too far away from the refuge
    bounceAtZoomLimits: true, // Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming
    layers: [imagery, waterWasteReportLayerGroup] // Set the layers to build into the layer control
};


// Create a new Leaflet map with the map options
var map = L.map('map', mapOptions);


// Initialize a zoom control that will show in the top right corner based on the detected screen width
var zoomControl = L.control.zoom({
    position: 'topleft'
});


// Initialize global variables for icons

// Create the bird marker
// Plugin Source: https://github.com/lvoogdt/Leaflet.awesome-markers
// Font Awesome Markers: https://fontawesome.com/icons?from=io

// Create a marker for the user's current location
var myLocationIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', // font awesome
    icon: 'location-arrow',
    markerColor: 'blue', // background color
    iconColor: 'white', // foreground color
});

// Create a marker to report hydrant leak
var hydrantIcon = L.icon({
    iconUrl: "icons/hydrant.png",
    iconSize: getIconSize()
});

// Create a marker to report meter leak
var meterIcon = L.icon({
    iconUrl: "icons/meter.png",
    iconSize: getIconSize()    
});

// Create a marker to report pipe leak
var pipeIcon = L.icon({
    iconUrl: "icons/pipe.png",
    iconSize: getIconSize()    
});

// Create a marker to report sprinkler leak
var sprinklerIcon = L.icon({
    iconUrl: "icons/sprinkler.png",
    iconSize: getIconSize()    
});

// Create a marker to report valve leak
var valveIcon = L.icon({
    iconUrl: "icons/valve.png",
    iconSize: getIconSize()    
});

// Create a marker to report contamination
var contaminatedIcon = L.icon({
    iconUrl: "icons/contaminated.png",
    iconSize: getIconSize()    
});

// Create a marker to report other leak
var otherIcon = L.icon({
    iconUrl: "icons/other.png",
    iconSize: getIconSize()    
});



// Add the layer control to the map
layerList = L.control.layers(baseMaps, overlays, {
    collapsed: false, // Keep the layer list open
    autoZIndex: true, // Assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off
    // hideSingleBase: true // Hide the base layers section when there is only one layer
}).addTo(map);

// Create Leaflet Draw Control for the draw tools and toolbox
var drawControl = new L.Control.Draw({

    // Disable drawing of polygons, polylines, rectangles, and circles
    // Users will only be able to draw markers (points)
    draw: {
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false
    },

    // Disable editing and deleting points
    edit: false,
    remove: false,
    position: 'topright'
});


// Boolean global variable used to control visibility
// Do not show the draw control on the map initially
// It will be displayed once the user clicks Start Editing
var controlOnMap = false;


// Create variable for Leaflet.draw features
var drawnItems = new L.FeatureGroup();


// Add the basemap
map.addLayer(imagery);


// Build the sidebar and add it to the map
// Source: https://github.com/nickpeihl/leaflet-sidebar-v2
var sidebar = L.control.sidebar({
    autopan: true, // whether to maintain the centered map point when opening the sidebar
    closeButton: true, // whether to add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'left', // left or right
}).addTo(map);


// Run the load data functions automatically when document loads
$(document).ready(function () {

    // Load all of the data
    loadWaterWasteReport();
    
    // Get the user's current location
    locateUser();

    // Detect the screen size and get the appropriate sidebar and zoom display
    getResponsiveDisplay();

});


// Function that locates the user
function locateUser() {
    map.locate({
        setView: true,
        maxZoom: 25
    });
}


// When the window is resized
$(window).resize(function () {

    // Detect the screen size and get the appropriate sidebar and zoom display
    getResponsiveDisplay();

});


// Map Event Listener listening for when the user location is found
// When the location is found, run the locationFound(e) function
map.on('locationfound', locationFound);


// Map Event Listener listening for when the user location is not found
// If the location is not found, run the locationNotFound(e) function
map.on('locationerror', locationNotFound);


// When the user zooms in or out
map.on('zoom', function (e) {;
    
});


// Function that gets the screen width and customizes the display
function getResponsiveDisplay() {

    // Get the screen width
    var screenWidth = screen.width;
    //console.log("Screen Width: " + screenWidth);

    // Get the header text
    var headerText = $('#home h1');
    
    // Get the header text
    var submitHeaderText = $('#submitTab h1');

    // If the screen width is less than or equal to 850 pixels
    if (screenWidth <= 850) {

        // Collapse the sidebar
        sidebar.close();

        // Remove the zoom control
        zoomControl.remove();

        // Abbreviate the header text
        headerText.text('Water Waste Reporter');
        submitHeaderText.text('Submit Observations');

        // Zoom out to show the extent of the refuge at this scale
        map.setMinZoom(11);
        map.setZoom(11);

        // Fit the map to the refuge bounds
        map.fitBounds(bounds);

    }

    // If the screen width is greater than 850 pixels
    else if (screenWidth > 850) {

        // Expand the sidebar and show the home tab
        sidebar.open('home');

        // Add the zoom control
        zoomControl.addTo(map);

        // If the screen width is less than 1200 pixels, show the abbreviated header text
        // Otherwise, show the full header text
        if (screenWidth < 1200) {
            headerText.text('Water Waste Reporter');
            submitHeaderText.text('Submit Observations');
        } else {
            headerText.text('Southern Nevada Water Waste Reporter');
        }

        // Show the extent of the refuge at its original scale
        map.setMinZoom(11);
        map.setZoom(11);

        // Fit the map to the refuge bounds
        map.fitBounds(bounds);

    }
}



// Function to load the refuge roads onto the map
function loadwaterFeatures() {

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlwaterFeatures, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        waterFeatures = L.geoJson(data, {

            // Create an initial style for each feature
            style: function (feature) {
                return {
                    color: '#9e559c', // set stroke color
                    weight: 2.5, // set stroke weight
                    opacity: 1 // set stroke opacity
                };
            },

            // Loop through each feature
            onEachFeature: function (feature, layer) {
                
                // Get the length from the GeoJSON and round it to 2 decimal places
                var length = parseFloat(feature.properties.route_leng).toFixed(2).toLocaleString();

                // Bind the name and length to a popup
                layer.bindPopup(feature.properties.water_feature + feature.properties.reason);                

            }

        }).addTo(map);

        // Bring the layer to the back of the layer order
        roads.bringToBack();
    });
}





// Function to get the icon size based on the zoom level
function getIconSize() {
    
    // Set the default icon size (height and width) in pixels
    var iconSize = [21, 22];

    // If the map is zoomed out to the extent of the refuge, set a smaller icon size
    if (map.getZoom() < 13) {
        iconSize = [10, 11];
    }

    // Return the icon size
    return iconSize;
} 


// Function to load the user-submitted water waste features onto the map
function loadWaterWasteReport() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(waterWasteReport)) {
        map.removeLayer(waterWasteReport);
    }

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryWaterWasteReport, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        waterWasteReport = L.geoJson(data, {

            // Create a style for the points
            pointToLayer: function (feature, latlng) {
                
                // Get the water feature to use to set its marker color
                var waterFeatures = feature.properties.water_feature;
                
                // Show the points as circle markers with a fill color based on the water feature
                return L.circleMarker(latlng, {
                    fillColor: getWildlifeObservationMarkerColor(waterFeatures),
                    fillOpacity: 1,
                    color: '#3d3d3d',
                    weight: 0.25,
                    opacity: 1,
                    radius: 5
                });
            },

            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the name to a popup
                layer.bindPopup(feature.properties.feature);

            }

        }).addTo(waterWasteReportLayerGroup);

    });

}


// Function to get the color for each wildlife observation marker based on its species family
function getWildlifeObservationMarkerColor(waterFeatures) {

    if (waterFeatures == "") {
        return '#ff69b4';
    } else if (waterFeatures == "Hydrant") {
        return '#e31a1c';
    } else if (waterFeatures == "Meter") {
        return '#ffff99';
    } else if (waterFeatures == "Pipe") {
        return '#33a02c';
    } else if (waterFeatures == "Sprinkler") {
        return '#3d3d3d';
    } else if (waterFeatures == "Valve") {
        return '#1f78b4';
    } else if (waterFeatures == "Contaminated") {
        return '#1f78b4';
    } else if (waterFeatures == "Other") {
        return '#1f78b4';
    } else {
        return 'white'; // default option if there is no valid species family, should not be used
    }

}





// Function that will run when the location of the user is found
function locationFound(e) {

    // Get the current location
    myLocation = e.latlng;

    // If the current location is outside the bounds of the map, reset the map to the refuge bounds
    if (myLocation.lat < bounds[0][0] || myLocation.lat > bounds[1][0] ||
        myLocation.long < bounds[0][1] || myLocation.long > bounds[1][1]) {

        alert("You are outside of the area of interest");

        // Reset the map to the refuge bounds
        map.fitBounds(bounds);

        // Disable the Use Current Location button, so observations can only be submitted by clicking a point
        $('#ui-controls #currentLocationButton').attr("disabled", true);

    
    // The current location is within the bounds of the map
    } else {

        // Remove the locationMarker if it's already on the map
        if (map.hasLayer(locationMarker)) {
            map.removeLayer(locationMarker);
        }

        // Add the locationMarker layer to the map at the current location
        locationMarker = L.marker(e.latlng, {
            icon: myLocationIcon
        });

        // Bind a popup
        locationMarker.bindPopup("You are here");

        // Add the location marker to the map
        locationMarker.addTo(map);

        // Initialize a variable to store an array of filter dropdown values
        var filterDropdownArray = [];

        // Loop through the existing filter dropdown values
        $('#filterDropdown > option').each(function () {
            
            // Get the current value
            var value = $(this).val();
            
            // Push it into the filter dropdown array
            filterDropdownArray.push(value);

        });

        // Initialize a new dropdown value for the nearby filter value
        var nearbyTheme = $('<option value="nearby">Within 1/2 mile of my location</option>');

        // If the filter dropdown array does not yet include the nearby filter, add it
        if (!filterDropdownArray.includes("nearby")) {
            $('#filterDropdown').append(nearbyTheme);
        }
        
        // Create a variable to store the value of the selected theme
        var selectedTheme = $("#filterDropdown option:selected").val();
        
        // If the selected theme is features within 0.5 miles from the current location update the points of interest based on the new current location
        if (selectedTheme == "nearby") {
            
            // Update the points of interest based on the selected theme
            filterPointsOfInterest(selectedTheme);
            
        }
    
    }
}


// Function that will run if the location of the user is not found
function locationNotFound(e) {

    // Display the default error message from Leaflet
    alert(e.message);
    
    // Disable the Use Current Location button, so observations can only be submitted by clicking a point
    $('#ui-controls #currentLocationButton').attr("disabled", true);    

}


// Function to add the draw control to the map to start editing
function startEdits() {

    // Remove the drawnItems layer from the map
    map.removeLayer(drawnItems);
    
    // Create a new empty drawnItems feature group to capture the next user-drawn data
    drawnItems = new L.FeatureGroup();  
    
    // Clear the latitude and longitude textboxes and species family and species dropdowns
    $('#ui-controls #latitude').val("");
    $('#ui-controls #longitude').val("");
    $('#waterFeaturesDropdown').val('default').attr('selected');
    $('#waterDropdown').val('default').attr('selected');    

    // If the draw control is already on the map remove it and set the controlOnMap flag back to false
    if (controlOnMap === true) {
        map.removeControl(drawControl);
        controlOnMap = false;
    }

    // Add the draw control to the map and set the controlOnMap flag to true
    map.addControl(drawControl);
    controlOnMap = true;
    
    // If the screen width is less than or equal to 850 pixels
    if (screen.width <= 850) {
        
        // Collapse the sidebar
        sidebar.close();        
    }

}


// Function to remove the draw control from the map
function stopEdits() {

    // Remove the draw control from the map and set the controlOnMap flag back to false
    map.removeControl(drawControl);
    controlOnMap = false;
}


// Function to run when the Current Location button is clicked
function addPointAtCurrentLocation() {

    // Get the user's current location
    locateUser();
    
    // Remove the drawnItems layer from the map
    map.removeLayer(drawnItems);
    
    // Create a new empty drawnItems feature group to capture the next user-drawn data
    drawnItems = new L.FeatureGroup();    

    // When a feature is created on the map, a layer on which it sits is also created.
    // Create the locationMarker layer from the current location
    locationMarker = L.marker(myLocation, {
        icon: myLocationIcon
    });
    
    // Get the latitude and longitude
    var latitude = myLocation.lat;
    var longitude = myLocation.lng;   
    
    // Populate the latitude and longitude textboxes with the coordinates of the current location
    $('#ui-controls #latitude').val(latitude);
    $('#ui-controls #longitude').val(longitude);
    
    // Add the new layer to the drawnItems feature group
    drawnItems.addLayer(locationMarker);

    // Add the drawnItems feature group to the map
    map.addLayer(drawnItems)

}


// Function to run when a feature is drawn on the map
// Add the feature to the drawnItems layer and get its coordinates
map.on('draw:created', function (e) {

    // Remove the point tool
    stopEdits();

    // When a feature is created on the map, a layer on which it sits is also created. Create a new layer from this automatically created layer.
    var layer = e.layer;

    // Get the latitude and longitude
    var latitude = layer.getLatLng().lat;
    var longitude = layer.getLatLng().lng;

    // Add the new layer to the drawnItems feature group
    drawnItems.addLayer(layer);

    // Add the drawnItems feature group to the map
    map.addLayer(drawnItems);
    
    // Populate the latitude and longitude textboxes with the coordinates of the clicked point
    $('#ui-controls #latitude').val(latitude);
    $('#ui-controls #longitude').val(longitude);
    
    // Enable the Submit button if the required fields are populated
    checkForRequiredFields();

});

// Function to check for required fields
function checkForRequiredFields() {
    
    // Create variables to store the latitude and longitude
    var latitude = $('#ui-controls #latitude').val();
    var longitude = $('#ui-controls #longitude').val();
    
    // Create a variable to store the selected species family
    selectedwaterFeatures = $("#waterFeaturesDropdown option:selected").text();

    // Create a variable to store the selected species family
    selectedWater = $("#waterDropdown option:selected").text();

    // If the latitude, longitude, species family, and species are all populated
    if (latitude !== "" && longitude !== "" && selectedwaterFeatures !== "" && selectedWater !== "") {
        // Enable the Submit button
        $('#submitButton').attr("disabled", false);
    }
    else {
        // Disable the Submit button
        $('#submitButton').attr("disabled", true);
    }
}

// Function to create variables for the location and attributes of the point just drawn and run a SQL query to insert the point into the data_collector layer in CARTO
function setData() {
    
    // Get the name and description submitted by the user
    selectedwaterFeatures = $("#waterFeaturesDropdown option:selected").text();
    selectedWater = $("#waterDropdown option:selected").text();

    // Loop through each of the drawn items
    drawnItems.eachLayer(function (layer) {

        // Write a SQL/PostGIS query to insert the geometry, name, and description for the drawn item into the data_collector table
        // Set the spatial reference based on the GeoJSON
        var sql = "INSERT INTO water_waste_report (the_geom, water_feature, reason, latitude, longitude) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";

        // Get the coordinates of the drawn point and add them to the SQL statement
        var a = layer.getLatLng();
        var sql2 = '{"type":"Point","coordinates":[' + a.lng + "," + a.lat + "]}'),4326),'" + selectedwaterFeatures + "','" + selectedWater + "','" + parseFloat(a.lat) + "','" + parseFloat(a.lng) + "')";

        // Combine the two parts of the SQL statement
        var pURL = sql + sql2;
        
        //console.log(pURL);

       // Submit the SQL statement to the PHP proxy, so it can be added to the database without exposing the CARTO API key
        submitToProxy(pURL);
       
    });

    // Remove the drawn items layer from the map
    map.removeLayer(drawnItems);

    // Create a new empty drawnItems feature group to capture the next user-drawn data
    drawnItems = new L.FeatureGroup();
    
    // Clear the latitude and longitude textboxes and species family and species dropdowns
    $('#ui-controls #latitude').val("");
    $('#ui-controls #longitude').val("");
    $('#waterFeaturesDropdown').val('default').attr('selected');
    $('#waterDropdown').val('default').attr('selected');      

}


// Function to cancel the newly drawn points
function cancelData() {
    
    // Remove the drawnItems layer from the map
    map.removeLayer(drawnItems);
    
    // Create a new empty drawnItems feature group to capture the next user-drawn data
    drawnItems = new L.FeatureGroup();
    
    // Clear the latitude and longitude textboxes and species family and species dropdowns
    $('#ui-controls #latitude').val('');
    $('#ui-controls #longitude').val('');
    $('#waterFeaturesDropdown').val('default').attr('selected');
    $('#waterDropdown').val('default').attr('selected');
    
    // Disable the Submit button
    $('#submitButton').attr("disabled", true);
}


// Function to submit data to the PHP proxy using the jQuery post() method
var submitToProxy = function (q) {
    $.post("php/callProxy.php", { // <--- Enter the path to your callProxy.php file here
        qurl: q,
        cache: false,
        timeStamp: new Date().getTime()
    }, function (data) {
        //console.log(data); // Command returned by the post submission

        // Refresh the layer to show the updated data
        refreshLayer();
    });
};


// Function to refresh the layers to show the updated dataset
function refreshLayer() {
    
    // Remove the existing wildlife observations layer
    if (map.hasLayer(waterWasteReport)) {
        map.removeLayer(waterWasteReport);
    }
    
    // Reload the wildlife observations layer with the new point
    loadWaterWasteReport();
    
    // If the screen width is less than or equal to 850 pixels
    if (screen.width <= 850) {
        
        // Collapse the sidebar
        sidebar.close();        
    }
}