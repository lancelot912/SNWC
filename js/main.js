var mapboxAtt = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow';

var Light = L.tileLayer(mapboxUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),
    Dark = L.tileLayer(mapboxUrl, {id: 'mapbox/dark-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt}),    
    Streets = L.tileLayer(mapboxUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAtt});


var lm2012 = 
    {
    name: "2012",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2012.js"
};

var lm2013 =
    {
    name: "2013",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2013.js"
};

var lm2014 =
    {
    name: "2014",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2014.js"
};

var lm2015 = 
    {
    name: "2015",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2015.js"
};

var lm2016 =
    {
    name: "2016",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2016.js"
};

var lm2017 = 
    {
    name: "2017",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2017.js"
};

var lm2018 =
    {
    name: "2018",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2018.js"
};

var lm2019 =
    {
    name: "2019",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2019.js"
};

var lm2020 = 
    {
    name: "2020",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2020.js"
};

var lm2021 = 
    {
    name: "2021",
    layer: L.geoJson(),
    url: "https://raw.githubusercontent.com/lancelot912/SNWC/main/data/2021.js"
};

var map = L.map('map', {
      zoomControl: false
  });
  
  map.setView([36.25824, -114.51417], 10);
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

var baseLayers = {
  "Streets": Streets,
  "Light": Light,
  "Dark": Dark};

var overlays = {
  lm2012, lm2013, lm2014, lm2015, lm2016, lm2017, lm2018, lm2019, lm2020, lm2021
}

var layerControl = L.control.layers(baseLayers, overlays).addTo(map);
map.addControl(layerControl);
  
