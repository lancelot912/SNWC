(function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow";


  ("use strict");
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );

  var geocoded = false;

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }

  today = yyyy + "-" + mm + "-" + dd;
  document.getElementById("obs_date").setAttribute("max", today);

  

  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
  });

 
  var lat, lng;
  var coord = [0, 0];

  function getLocation() {
    var lat = 36.143243;
    var lng = -115.150001;
    var coord = [lng, lat];

    // If geolocation is an option - use it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        geocoded = true;
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        coord = [lng, lat];
        addMap(coord);
      });
    }
    addMap(coord);
  }

  $(document).ready(function () {
    getLocation();
  });

  function updateCoordinates(coords) {
    $("#longitude").val(coords[0].toFixed(5));
    $("#latitude").val(coords[1].toFixed(5));
  }

  function addMap(coord) {
    const map = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: coord,
      zoom: 15.0,
      attributionControl: false,
    });

    map.on("click", function (e) {
      var coord = {
        type: "Point",
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      };
      updateCoordinates(coord.coordinates);

      map.getSource("single-point").setData(coord);
    });
    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    map.addControl(geocoder, "top-left");

    map.on("load", function () {
      // After the map style has loaded on the page, add a source layer and default
      // styling for a single point.
      map.addSource("single-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "point",
        source: "single-point",
        type: "circle",
        paint: {
          "circle-radius": 8,
          "circle-color": "dark violet",
          "circle-stroke-width": 2,
          "circle-stroke-color": "white",
        },
      });

      // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
      // makes a selection and add a symbol that matches the result.
      geocoder.on("result", function (ev) {
        map.getSource("single-point").setData(ev.result.geometry);
        updateCoordinates(ev.result.geometry.coordinates);
      });
    });
  }
})();

// Note that the name "myDropzone" is the camelized
// id of the form.
Dropzone.autoDiscover = false;
Dropzone.options.reportForm = {
  // Configuration options go here
  autoProcessQueue: false,
  uploadMultiple: true,
  parallelUploads: 10,
  maxFiles: 10,
  addRemoveLinks: true,
  renameFile: null,
  previewsContainer: "div.dz-file-preview",
  dictDefaultMessage: "Drop photo files here to upload",
  // The setting up of the dropzone
  init: function () {
    var attachments = [];
    var myDropzone = this;
    this.on("addedfile", (file) => {
      // console.log(file.name + " has been added");
      // console.log(file);
      attachments.push(file.name);
      $("#images").val(attachments);
      console.log(attachments);
    });
    this.on("removedfile", (file) => {
      idx = attachments.indexOf(file.name);
      attachments.splice(idx, 1);
      $("#images").val(attachments);
      console.log(attachments);
    });
    // First change the button to actually tell Dropzone to process the queue.
    this.element
      .querySelector("button[type=submit]")
      .addEventListener("click", function (e) {
        if ($("#images").val() != "") {
          console.log("click");
          // Make sure that the form isn't actually being sent.
          e.preventDefault();
          e.stopPropagation();
          myDropzone.processQueue();
        }
      });
    // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
    // of the sending event because uploadMultiple is set to true.
    this.on("sendingmultiple", function () {
      // Gets triggered when the form is actually being sent.
      // Hide the success button or the complete form.
      console.log("sent");
    });
    this.on("successmultiple", function (files, response) {
      // Gets triggered when the files have successfully been sent.
      // Redirect user or notify of success.
      console.log("success");
      window.open("static/report-complete.html", "_self");
    });
    this.on("errormultiple", function (files, response) {
      // Gets triggered when there was an error sending the files.
      // Maybe show form again, and notify user of error
      console.log(response);
    });
  },
};