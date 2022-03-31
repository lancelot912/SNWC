var imagery = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.satellite',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.light',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.outdoors',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});


var map = L.map('map', {
    zoomControl: false,
    center: [36.25824, -114.51417],
    zoom: 10,
    minZoom: 3,
    maxZoom: 18,
    layers: [light]
    });
   
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
          map.setView([36.25824, -114.51417], 10);
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

var baseMaps = {
    "Color": outdoors,
    "Light": light,
    "Satellite": imagery
}

  var sqlQuery = "SELECT * FROM mlazarte.lakemead_2012 WHERE lm_elev = '1120'";
   
  var high = $.getJSON("https://raw.githubusercontent.com/lancelot912/SNWC/main/data/lakemeadhigh.geojson", function (data) {
      high = L.geoJson(data, {
          onEachFeature: function (feature, layer) {
              layer.bindPopup('<p><b> Year: 1983 </b><br/><em><br/> '+ '<b> Depth: 1220 ft.</b><br/><em>');
              layer.on({
                  mouseover: function (e) {
                      layer.setStyle({
                          weight: 1,
                          color: "#00FFFF",
                          opacity: 1,
                      });
                      },
                  mouseout: function (e) {
                      high.resetStyle(e.target);
                  },
              });
          },
          style: stylehigh,
      }).addTo(map);
  });
  
  
  function stylehigh(feature) {
      return {
          "color": 'blue',
          "fillColor": 'blue',
          "weight": 2
      };
  }
  
  /* var medium = $.getJSON("https://mlazarte.carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery, function (data) {
      medium = L.geoJson(data, {
          onEachFeature: function (feature, layer) {
              layer.bindPopup('<p><b> Year: 2012 </b><br/><em><br/> '+ '<b> Depth: 1120 ft.</b><br/><em>');
              layer.on({
                  mouseover: function (e) {
                      layer.setStyle({
                          weight: 1,
                          color: "#00FFFF",
                          opacity: 1,
                      });
                      },
                  mouseout: function (e) {
                      medium.resetStyle(e.target);
                  },
              });
          },
          style: stylemedium,
      });
  });
  
  
   function stylemedium(feature) {
      return {
          "color": 'orange',
          "fillColor": 'orange',
          "weight": 2
      };
  } */
  
  
  var low = $.getJSON("https://raw.githubusercontent.com/lancelot912/SNWC/main/data/lakemeadlow.geojson", function (data) {
      low = L.geoJson(data, {
          onEachFeature: function (feature, layer) {
              layer.bindPopup('<p><b> Year: 2021 </b><br/><em><br/> '+ '<b> Depth: 1066 ft.</b><br/><em>');
              layer.on({
                  mouseover: function (e) {
                      layer.setStyle({
                          weight: 1,
                          color: "#00FFFF",
                          opacity: 1,
                      });
                      },
                  mouseout: function (e) {
                      low.resetStyle(e.target);
                  },
              });
          },
          style: stylelow,
      }).addTo(map);
  });
  
  
  function stylelow(feature) {
      return {
          "color": 'red',
          "fillColor": 'red',
          "weight": 2
      };
  }
  
  var overlays = {
          "Full Depth": high,
          "Current": low
  }; 
  

L.control.layers(baseMaps).addTo(map);

  
