// initialize the map
var lat= 41.10167;
var lng= -72.93400;
var zoom= 9;

//Load a tile layer base map from USGS ESRI tile server https://viewer.nationalmap.gov/help/HowTo.htm
var hydro = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}',{
    attribution: 'USGS The National Map: National Hydrography Dataset',
    maxZoom:16}),
    topo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',{
        attribution: 'USGS The National Map: National Boundaries Dataset',
        maxZoom:16
    });
    Thunderforest_Landscape = L.tileLayer('https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=e4e0f2bcb8a749f4a9b355b5fca1d913', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: '<your apikey>',
	maxZoom: 22
});

var baseMaps = {
    "Hydro": hydro,
    "Topo": topo,
    "Landscape": Thunderforest_Landscape
  };

var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    layers:[hydro]
});

map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;

L.control.attribution({position: 'bottomleft'}).addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);


var customOptions =
    {
        'maxWidth': '500',
        'className' : 'custom'
    };

var ctsites = "https://www.waterqualitydata.us/data/Station/search?organization=CT_DEP01_WQX&project=LIS&startDateLo=01-01-2020&minactivities=1&mimeType=geojson&zip=no&providers=STORET"

// load GeoJSON from an external file and display circle markers
$.getJSON(ctsites,function(data){
    console.log(data);
  var marker = L.geoJson(data, {
    pointToLayer: function(feature,latlng){
      var markerStyle = {
        fillColor:'#FDB515',
        radius: 9,
        color: "#0D2D6C",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.7,
        pane: 'top'
      };
      return L.circleMarker(latlng, markerStyle);
    },
    onEachFeature: function (feature,marker) {
      var href = "https://www.waterqualitydata.us/data/Result/search?siteid="+
          feature.properties.MonitoringLocationIdentifier+"&project=LIS&startDateLo=01-01-2020&mimeType=csv&zip=yes"
      marker.bindPopup('<b>Station: </b>'+
          feature.properties.MonitoringLocationName+'</br>'
          +"<b>SID: </b>"+feature.properties.MonitoringLocationIdentifier+'</br>'+
      '<a href="'+href+'" </a> Link to Data',customOptions);
      marker.on('click', function(){
        addDataPlt(feature.properties.MonitoringLocationIdentifier,'Conductivity','#testPlt')
        addDataPlt(feature.properties.MonitoringLocationIdentifier,'pH','#testPlt2')
        addDataPlt(feature.properties.MonitoringLocationIdentifier,'Dissolved oxygen (DO)','#testPlt3')
        addDataPlt(feature.properties.MonitoringLocationIdentifier,'Salinity','#testPlt4')
      })
    }

    }).addTo(map);
  });

//add legend
var legend = L.control({position: 'topleft'});

//     // Function that runs when legend is added to map
    legend.onAdd = function (map) {
      var days = ['Sun','Mon','Tues','Wed','Thur','Fri','Sat'];
      var date = new Date();
      var year = date.getFullYear().toString();
      var month = (date.getMonth()+1).toString();
      var day = date.getDate().toString();
      // Create Div Element and Populate it with HTML
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<p class="title">Data Collected by the <a href = "https://portal.ct.gov/DEEP/Water/LIS-Monitoring/LIS-Water-Quality-and-Hypoxia-Monitoring-Program-Overview">CT DEEP LIS Monitoring and Assessement Program</a> and retrieved from the <a href = "https://www.waterqualitydata.us/" target="_blank">WQP</a> on '+days[date.getDay()]+' '+month+'/'+day+'/'+year+'</p><br>';
      div.innerHTML += '<i class="circle"></i><p> Water Quality Site - Click to select a site and plot data for that monitoring station</p><br>';

      // Return the Legend div containing the HTML content
      return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    L.control.layers(baseMaps).addTo(map);

site = 'CT_DEP01_WQX-17265'
cdir = 'reports/' + site + '_Conductivity.json'
pdir = 'reports/' + site + '_pH.json'
ddir = 'reports/' + site + '_Dissolved oxygen (DO).json'
sdir = 'reports/' + site + '_Salinity.json'


// addDataPlt('CT_DEP01_WQX-17265','Conductivity','#testPlt')
// addDataPlt('CT_DEP01_WQX-17265','pH','#testPlt2')
// addDataPlt('CT_DEP01_WQX-17265','Dissolved oxygen (DO)','#testPlt3')
// addDataPlt('CT_DEP01_WQX-17265','Salinity','#testPlt4')

function addDataPlt(site,parameter,plt){
    sdir = 'reports/' + site + '_' + parameter + '.json'
    unit = getUnits(parameter)
    document.getElementById('sid').innerText = `Station ID:  ${site}`
    console.log(sdir)
    vegaEmbed(
        plt,
        {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "description": "A basic bar chart example, with LIS Data in WQX.",
            "width": 450,
            "height": 200,
            "padding": 5,
            "autosize": "fit",
            "title": {
              "text": parameter + ' ' + unit,
              "frame": "group",
              "anchor": "start",
              "offset": 10,
              "color": "#0D2D6C"
            },
            "data": [
              {
                "name": "table",
                "url": sdir
              }
            ],
            "signals": [
              {
                "name": "tooltip",
                "value": {},
                "on": [
                  {"events": "rect:mouseover", "update": "datum"},
                  {"events": "rect:mouseout", "update": "{}"}
                ]
              }
            ],
            "scales": [
              {
                "name": "xscale",
                "type": "band",
                "domain": {"data": "table", "field": "ActivityStartDate"},
                "range": "width",
                "padding": 0.05,
                "round": true
              },
              {
                "name": "yscale",
                "domain": {"data": "table", "field": "ResultMeasureValue"},
                "nice": true,
                "range": "height"
              }
            ],
            "axes": [
              {"orient": "bottom", "scale": "xscale"},
              {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
              {
                "type": "rect",
                "from": {"data": "table"},
                "encode": {
                  "enter": {
                    "x": {"scale": "xscale", "field": "ActivityStartDate"},
                    "width": {"scale": "xscale", "band": 1},
                    "y": {"scale": "yscale", "field": "ResultMeasureValue"},
                    "y2": {"scale": "yscale", "value": 0}
                  },
                  "update": {"fill": {"value": "#00AAE7"}},
                  "hover": {"fill": {"value": "#FDB515"}}
                }
              },
              {
                "type": "text",
                "encode": {
                  "enter": {
                    "align": {"value": "center"},
                    "baseline": {"value": "bottom"},
                    "fill": {"value": "white"},
                  },
                  "update": {
                    "x": {"scale": "xscale", "signal": "tooltip.ActivityStartDate", "band": 0.5},
                    "y": {"scale": "yscale", "signal": "tooltip.ResultMeasureValue", "offset": -2},
                    "text": {"signal": "tooltip.ResultMeasureValue"},
                    "fillOpacity": [
                      {"test": "datum === tooltip", "value": 0},
                      {"value": 1}
                    ]
                  }
                }
              }
            ]
          }
      );

}

function getUnits(parameter){
  if(parameter == 'Conductivity'){
    return 'uS/cm'
  }
  if(parameter == 'Dissolved oxygen (DO)'){
    return 'mg/L'
  }
  if(parameter == 'Temperature'){
    return 'deg C'
  }
  if(parameter == 'Salinity'){
    return 'PSU'
  }
  if(parameter == 'Phycocyanin (probe)'){
    return 'ug/L'
  }
  if(parameter == 'Chlorophyll'){
    return 'ug/L'
  }
  if(parameter == 'Turbidity'){
    return 'FNU'
  }
  else{
    return ''
  }
}

