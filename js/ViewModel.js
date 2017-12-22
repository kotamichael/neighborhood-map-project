


				//==================================//
//===========================  M O D E L ============================//
		//=====================================================//
var locations = [
    {title: 'Cannon Beach!', lat: 45.8917, lng: -123.961527},
    {title: 'Cape Kiwanda', lat: 45.2191, lng: -123.9754},
    {title: 'Cape Falcon', lat: 45.7676, lng: -123.9824},
  
    {title: 'Mount Hood', lat: 45.3736, lng: -121.6960},
    {title: 'Mount Jefferson', lat: 44.6743, lng: -121.7995},
    {title: 'Chinidere Mountain', lat: 45.5862, lng: -121.8115},
    {title: 'Multnomah Falls', lat: 45.5762, lng: -122.1158},
    
    {title: 'Rimsky-Korsakoffee House', lat: 45.5193, lng: -122.6536},
    {title: 'Either/Or Coffee', lat: 45.4630, lng: -122.6532},
    {title: 'Heart Coffee Roasters', lat: 45.52302359999999, lng: -122.6431899}
    ];
var map;
var markers = [];

var Location = function(data) {
	var self = this;
	//this.bounds = data.bounds;
	this.title = data.title;
	this.lat = data.lat;
	this.lng = data.lng;

	// Create markers here to avoid for-loop spaghetti
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.lat, data.lng),
		map: map,
		title: data.title,
		icon: self.defaultIcon,
		animation: google.maps.Animation.DROP,
	});

	markers.push(this.marker);

	//this.bounds.extend(this.marker.position);

	// Declares the variable and gives inherited functionality
	this.infowindow = new google.maps.InfoWindow();

	this.marker.addListener('click', function() {
	  self.infowindow.setContent('<div>' + self.title + '</div>');
	  self.infowindow.open(map, this);
	  self.infowindow.addListener('closerclick', function() {
	  	self.infowindow.setMarker(null);
	  });
	  self.marker.setAnimation(google.maps.Animation.BOUNCE)
	  setTimeout(function() {
	  	self.marker.setAnimation(null);
	  }, 1400);
	});
};



				//=======================================//
//========================= V I E W  M O D E L =========================//
		//========================================================//

var ViewModel = function() {
	var self = this;

	//Create an observabelt array to fill with Locations
	this.placeList = ko.observableArray([]);

	// Query search results in the sidebar using the ko utils array Filter
	//function.
	this.query = ko.observable('');
	this.filteredPlaces = ko.computed(function() {
		if (this.query()) {
			var search = this.query().toLowerCase();
			return ko.utils.arrayFilter(this.placeList(), function(place) {
				return place.title.toLowerCase().indexOf(search) >= 0;
			});
		} else {
			return self.placeList();
		}}, this);

	//loop over each place and push them into the placeList array
	locations.forEach(function(locItem) {
		self.placeList.push( new Location(locItem) );
	});

	//this.currentPlace = ko.observable( this.placeList()[0] );


	// Toggles sidebar //
	$('#sidebarCollapse').on('click', function () {
	    $('#sidebar').toggleClass('active');
	    $(this).toggleClass('active');
	});

                //============================================
   //========================   M   A    P   ============================
   		//==========================================================z

	  // Defines map variable as the new google map with parameters.
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 41.096743, lng: -85.114917},
	    zoom: 13,
	    styles: styles,
	  });

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

	  // Declares the variable and gives inherited functionality
	  var bounds = new google.maps.LatLngBounds();

	  document.getElementById('show-places').addEventListener('click', showPlaces);
	  document.getElementById('hide-places').addEventListener('click', hidePlaces);
};

function initMap() {
	ko.applyBindings(new ViewModel())
}