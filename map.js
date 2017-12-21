var map;

var markers = [];

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });
});

function initMap() {
  // Create a styles array to use with the map

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.096743, lng: -85.114917},
    zoom: 13,
    styles: styles,
  });

  var locations = [
  {title: 'Cannon Beach!', location: {lat: 45.891774, lng: -123.961527}},
  {title: 'Cape Kiwanda', location: {lat: 45.2191, lng: -123.9754}},
  {title: 'Cape Falcon', location: {lat: 45.7676, lng: -123.9824}},
  
  {title: 'Mount Hood', location: {lat: 45.3736, lng: -121.6960}},
  {title: 'Mount Jefferson', location: {lat: 44.6743, lng: -121.7995}},
  {title: 'Chinidere Mountain', location: {lat: 45.5862, lng: -121.8115}},
  {title: 'Multnomah Falls', location: {lat: 45.5762, lng: -122.1158}},
  
  {title: 'Rimsky-Korsakoffee House', location: {lat: 45.5193, lng: -122.6536}},
  {title: 'Either/Or Coffee', location: {"lat" : 45.4630, "lng" : -122.6532}},
  {title: 'Heart Coffee Roasters', location: {"lat" : 45.52302359999999, "lng" : -122.6431899}}
  ];
  
  var infowindow = new google.maps.InfoWindow();

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  var bounds = new google.maps.LatLngBounds();
  // The following group uses the location array to create an array on intitialize
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i
    });
  markers.push(marker);
  bounds.extend(marker.position);
  marker.addListener('click', function() {
    populateInfoWindow(this, infowindow);
  });
  // Two event listeners to control mouse-over/out color change.
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  })
  }
  document.getElementById('show-places').addEventListener('click', showPlaces);
  document.getElementById('hide-places').addEventListener('click', hidePlaces);
}

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    infowindow.addListener('closerclick', function(){
      infowindow.setMarker(null);
    });
  }
}


function showPlaces() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function hidePlaces() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

//This funcion takes in a color and then creates a new marker icon of that color. The icon will be 21 px wide by 34 high, have and origin of 0,0 and be anchored at 10, 34.
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Point(21, 34));
  return markerImage;
}