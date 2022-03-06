var mapboxAtt = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow';

var Light = L.tileLayer(mapboxUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),
    Dark = L.tileLayer(mapboxUrl, {id: 'mapbox/dark-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),    
    Streets = L.tileLayer(mapboxUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt});

var map = L.map('map', {
      zoomControl: false
  });
  
  map.setView([36.2924374, -114.7190577], 10);
  L.tileLayer(mapboxUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}).addTo(map);
  
  //Custom zoom bar control that includes a Zoom Home function
  L.Control.zoomHome = L.Control.extend({
      options: {
          position: 'topleft',
          zoomInText: '+',
          zoomInTitle: 'Zoom In',
          zoomOutText: '-',
          zoomOutTitle: 'Zoom Out',
          zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
          zoomHomeTitle: 'Return Home'
      },
  
      onAdd: function (map) {
          var controlName = 'gin-control-zoom',
              container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
              options = this.options;
  
          this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
          controlName + '-in', container, this._zoomIn);
          this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
          controlName + '-out', container, this._zoomOut);
          this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
          controlName + '-home', container, this._zoomHome);
  
          this._updateDisabled();
          map.on('zoomend zoomlevelschange', this._updateDisabled, this);
  
          return container;
      },
  
      onRemove: function (map) {
          map.off('zoomend zoomlevelschange', this._updateDisabled, this);
      },
  
      _zoomIn: function (e) {
          this._map.zoomIn(e.shiftKey ? 3 : 1);
      },
  
      _zoomOut: function (e) {
          this._map.zoomOut(e.shiftKey ? 3 : 1);
      },
  
      _zoomHome: function (e) {
          map.setView([36.2924374, -114.7190577], 10);
      },
  
      _createButton: function (html, title, className, container, fn) {
          var link = L.DomUtil.create('a', className, container);
          link.innerHTML = html;
          link.href = '#';
          link.title = title;
  
          L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
              .on(link, 'click', L.DomEvent.stop)
              .on(link, 'click', fn, this)
              .on(link, 'click', this._refocusOnMap, this);
  
          return link;
      },
  
      _updateDisabled: function () {
          var map = this._map,
              className = 'leaflet-disabled';
  
          L.DomUtil.removeClass(this._zoomInButton, className);
          L.DomUtil.removeClass(this._zoomOutButton, className);
  
          if (map._zoom === map.getMinZoom()) {
              L.DomUtil.addClass(this._zoomOutButton, className);
          }
          if (map._zoom === map.getMaxZoom()) {
              L.DomUtil.addClass(this._zoomInButton, className);
          }
      }
  });
  // Add the new control to the map
  var zoomHome = new L.Control.zoomHome();
  zoomHome.addTo(map);

var baseLayers = {
  "Light": Light,
  "Dark": Dark,
  "Streets": Streets};

L.control.layers(baseLayers).addTo(map);
  
//Call getData function
  getData(map);
    
//Import GeoJSON data
function getData(map) {
  //Load the data
  $.ajax('data/unemployed_sw_year.geojson', {
    dataType: 'json',
    success: function (response) {
      //Create an attributes array
      var attributes = processData(response);

      createPropSymbols(response, map, attributes);
      createSequenceControls(map, attributes);
      createLegend(map, attributes);

    },
  });
}


//Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  //Scale factor to adjust symbol size evenly
  var scaleFactor = 0.015;

  //Area based on attribute value and scale factor
  var area = attValue * scaleFactor;

  //Radius calculated based on area
  var radius = Math.sqrt(area / Math.PI);

  return radius;
}

function Popup(properties, attribute, layer, radius) {
  this.properties = properties;
  this.attribute = attribute;
  this.layer = layer;
  this.year = attribute.split(' ')[1];
  this.unemployment = this.properties[attribute];
  this.content = '<p><h4>' + this.properties.name + '</h4></p><p><b>Water Level by ft. ' + this.unemployment;

  this.bindToLayer = function () {
    this.layer.bindPopup(this.content, {
      offset: new L.Point(0, -radius),
    });
  };
}

function pointToLayer(feature, latlng, attributes) {
  //Assign the current attribute based on the first index of the attributes array
  var attribute = attributes[0];

  //create marker options
  var options = {
    fillColor: '#ffcb00',
    color: '#687be6',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  };

  //For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  //Give each feature's circle marker a radius based on its attribute value
  options.radius = calcPropRadius(attValue);

  //Create circle marker layer
  var layer = L.circleMarker(latlng, options);

  var popup = new Popup(feature.properties, attribute, layer, options.radius);

  //Formatted attributeto content string
  popup.bindToLayer();

  //Event listeners to open popup on hover and fill panel on click
  layer.on({
    mouseover: function () {
        this.openPopup();
        this.setStyle({ color: '#00ff37' });
      },

    mouseout: function () {
        this.closePopup();
        this.setStyle({ color: '#687be6' });
      },
  });
  return layer;
}

//Build an attributes array from the data
function processData(data) {
  //Empty array to hold attributes
  var attributes = [];

  //Properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //Push each attribute name into attributes array
  for (var attribute in properties) {
    //Only take attributes with unemployment values
    if (attribute.indexOf("_") > -1) {
      attributes.push(attribute);
    }
  }

  return attributes;
}

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes) {
  //Create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    },
  }).addTo(map);
}

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute) {
  map.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties[attribute]) {

      //Access feature properties
      var props = layer.feature.properties;

      //Update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      var popup = new Popup(props, attribute, layer, radius);

      //Add popup to circle marker
      popup.bindToLayer();
    }
  });

  updateLegend(map, attribute);
}

function createLegend(map, attributes) {
  var LegendControl = L.Control.extend({
    options: {
      position: 'bottomleft',
    },

    onAdd: function (map) {
          //Create the control container with a particular class name
          var container = L.DomUtil.create('div', 'legend-control-container');

          //Add temporal legend div to container
          $(container).append('<div id = "temporal-legend">');

          //Start attribute legend svg String
          var svg = '<svg id="attribute-legend" width="225px" height="200px">';

          //Array of cicle names to base loop on
          var circles = {
            max: 90,
            mean: 135,
            min: 180,
          };

          //Loop to add each cicle and text to svg string
          for (var circle in circles) {

            //Circle string
            svg += '<circle class="legend-circle" id="' + circle +
            '" fill="#ffcb00" fill-opacity="0.9" stroke="#687be6" cx="70"/>';
            //Text string
            svg += '<text id="' + circle + '-text" x="160" y="' + circles[circle] + '"></text>';
          }

          // Close svg string
          svg += '</svg>';
          //Add attribute legend svg String
          $(container).append(svg);
          return container;
        },
  });

  map.addControl(new LegendControl());
  updateLegend(map, attributes[0]);
}

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute) {
  var min = Infinity;
  var max = -Infinity;

  map.eachLayer(function (layer) {
      //Get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);

        //Test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
        //Test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });

  //Set mean
  var mean = (max + min) / 2;

  //Return values as an object
  return {
      max: max,
      mean: mean,
      min: min,
    };
}

//Update the legend with the new attribute
function updateLegend(map, attribute) {

  //Create content for legend
  var year = attribute.split("_")[1];
  var content = '<h5>Water level in ' + year + '</h5>' &
  '<h5>(Drag slider left to right)</h5>';


  //Replace legend content
  $('#temporal-legend').html(content);

  //Get the max, mean, and min values as an object
  var circleValues = getCircleValues(map, attribute);

  for (var key in circleValues) {
    //Get the radius
    var radius = calcPropRadius(circleValues[key]);

    //Assign the cy and r attributes
    $('#' + key).attr({
      cy: 190 - radius,
      r: radius,
    });

    //Add legend text
    $('#' + key + '-text').text(Math.round(circleValues[key] / 1000) * 1000);
  }
}

//Create new Leaflet control
function createSequenceControls(map, attributes) {
  var SequenceControl = L.Control.extend({
    options: {
      position: 'bottomleft',
    },

    onAdd: function (map) {
      //Create the control container div with a particular class name
      var container = L.DomUtil.create('div', 'sequence-control-container');

      //Create range input element (slider)
      $(container).append('<input class="range-slider" type="range">');

      //Kill any mouse event listeners on the map
      $(container).on('mousedown dblclick', function (e) {
        L.DomEvent.stopPropagation(e);
      });

      return container;
    },
  });

  map.addControl(new SequenceControl());

  //Set slider attributes
  $('.range-slider').attr({
    max: 5,
    min: 0,
    value: 0,
    step: 1,
  });

  //Click listener for buttons
  $('.skip').click(function () {
    //get the old index value
    var index = $('.range-slider').val();

    //Increment or decriment depending on button clicked
    if ($(this).attr('id') == 'forward') {
      index++;

      //If past the last attribute, wrap around to first attribute
      index = index > 5 ? 0 : index;
    } else if ($(this).attr('id') == 'reverse') {
      index--;

      //If past the first attribute, wrap around to last attribute
      index = index < 0 ? 5 : index;
    }

    //Update slider
    $('.range-slider').val(index);

    //Pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });

  //Input listener for slider
  $('.range-slider').on('input', function () {
    //Step 6: get the new index value
    var index = $(this).val();

    //Pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });
}
