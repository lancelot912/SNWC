
function queryObservation(event) {
    event.preventDefault(); // stop form from submitting normally
    console.log(event);

    var a = $("#query_observation_form").serializeArray();
    a.push({ name: "tab_id", value: "1" });
    a = a.filter(function(item){
        console.log(item);
        return item.value != '';});
    $.ajax({
        url: 'HttpServlet',
        type: 'POST',
        data: a,
        success: function(observations) {
            mapInitialization(observations);
            console.log(observations);
        },
        error: function(xhr, status, error) {
            alert("Status: " + status + "\nError: " + error);
        }
    });
}


function createObservation(event) {
    event.preventDefault(); // stop form from submitting normally
    console.log("In loadform, Create observation")
    longitude = place.geometry.location.lng();
    latitude= place.geometry.location.lat();
    console.log("In loadform, Create observation, after lat and lon" + "print lat: " + latitude + "long: " + longitude)

    var a = $("#create_observation_form").serializeArray();
    a.push({ name: "tab_id", value: "0" });
    a.push({name: "longitude", value: longitude});
    a.push({name: "latitude", value: latitude});
    a = a.filter(function(item){
        console.log(" item: " + item);
        return item.value != '';});
    $.ajax({
        url: 'HttpServlet',
        type: 'POST',
        data: a,
        success: function(observations) {
            mapInitialization(observations);
            //create a pop-up window when a observation has been submitted
            alert("A water waste has been successfully reported!");
            //reset the observation form after submission and hide additional message div
            document.getElementById("create_observation_form").reset();
            // call showAllObservations() to add a marker for the most observation created
            showAllObservations();

            //re-center the map on the new marker
            // onPlaceChanged();
            map.setCenter(new google.maps.LatLng(latitude, longitude));
        },
        error: function(xhr, status, error) {
            alert("Thank you for reporting water waste.");
        }
    });
}



$("#create_observation_form").on("submit",createObservation);

$("#query_observation_form").on("submit",queryObservation);