var markers = [];
var bounds;
var infoWindow;

// Declares Foursquare credentials as global variables.
var clientID = "2MZAR14ZUTJG1TSXZVK5ISFD1SGA3RYBYXMGNW5JLWIMG0ZO";
var clientSecret = "WKYOJSUBY1BNC3MJRPXADYN5X1VDRWVOPMFTF0LWLTR1Z2OB";


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

var Location = function(data) {
	var self = this;
	this.title = data.title;
	this.lat = data.lat;
	this.lng = data.lng;
	self.street = '';
    self.city = '';
    self.category = '';
    self.id = '';
    self.imgSrc = '';
    self.imgPrefix = '';
    self.imgSuffix = '';
    self.result = '';

   	self.imgURL = '';

	this.active = ko.observable(true);

	//set display property to null as default
	// Create markers here to avoid for-loop spaghetti
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.lat, data.lng),
		map: map,
		title: data.title,
		icon: self.defaultIcon,
		animation: google.maps.Animation.DROP,
	});
	markers.push(this.marker);

	//If active state set to true, markers will be displayed
	this.display = ko.computed( function() {
		if(self.active() === true) {
			self.marker.setMap(map);
			bounds.extend(self.marker.position);
			map.fitBounds(bounds)
		} else {
			self.marker.setMap(null);
		}
	});

	// URL for Foursquare API
	var rawURL = 'https://api.foursquare.com/v2/venues/search?ll=' + 
		self.lat + ',' + self.lng + '&client_id=' + clientID +
	    '&client_secret=' + clientSecret + '&query=' + self.marker.title +
	    '&v=20171223' + '&m=foursquare';

	var URL = rawURL.replace(/\s/g, "%20");

	$.getJSON(URL).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.category = response.categories[0].shortName;
                self.id = response.id;
                self.imgLink = '';

               	self.imgURL = 'https://api.foursquare.com/v2/venues/' + self.id + '/photos?limit=1&client_id='
                + clientID + '&client_secret=' + clientSecret + '&v=20171224';

                $.get(self.imgURL).done(function(img) {
                	self.imgPrefix = img.response.photos.items[0].prefix;
                	self.imgSuffix = img.response.photos.items[0].suffix;
                	self.imgSrc = self.imgPrefix.toString() + '100x75' + self.imgSuffix.toString();
                	self.imgLink = '<img src="' + self.imgSrc + '">'
                	self.result += self.imgLink;
                }).fail(function() {
                	self.result += '<h5>No photo available</h5>';
                });

                self.result +=
                    '<h3>' + self.title +
                    '</h3>' + '<div>' +
                    '<h6> Address: </h6>' +
                    '<p>' + self.street + '</p>' +
                    '<p>' + self.city + '</p>' +
                    '<h6> Category: ' + self.category +
                    '</h6>' + '</div>';
    }).fail(function() {
    	self.result = '<h3>Something went wrong gathering Foursquare data.</h3>';
    });

	// Declares the variable and gives inherited functionality
	this.marker.addListener('click', function() {
		self.marker.setAnimation(google.maps.Animation.BOUNCE)
		setTimeout(function() {
			self.marker.setAnimation(null);
		}, 1400);
	});

	this.marker.addListener('click', function() {
	  infowindow.setContent(self.result);
	  infowindow.open(map, this);
	  infowindow.addListener('closerclick', function() {
	  	infowindow.setMarker(null);
	  });
	});
};



				//=======================================//
//========================= V I E W  M O D E L =========================//
		//========================================================//

function initMap() {
// Defines map variable as the new google map with parameters.
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 41.096743, lng: -85.114917},
	  zoom: 13,
	  styles: styles,
	});

	infowindow = new google.maps.InfoWindow();

	// Declares the variable and gives inherited functionality
	bounds = new google.maps.LatLngBounds();
	ko.applyBindings(new ViewModel());
};

function mapError() {
	document.getElementById("map").innerHTML = "<h2>An error occured while loading your map. Please refresh the page to try again.</h2>";
};

var ViewModel = function() {
	var self = this;

	//Create an observabelt array to fill with Locations
	this.placeList = ko.observableArray([]);

	//loop over each place and push them into the placeList array
	locations.forEach(function(locItem) {
		self.placeList.push( new Location(locItem) );
	});
	this.currentMarker = ko.observable( this.placeList()[0] );

	this.listClick = function(place) {
	      google.maps.event.trigger(place.marker, 'click');
	};

	this.showPlaces = function() {
		self.placeList().forEach(function(place) {
			place.active(true);
		})
	};
	this.hidePlaces = function() {
		self.placeList().forEach(function(place) {
			place.active(false);
		})
	};

	// Query search results in the sidebar using the ko utils array Filter
	//function.
	this.query = ko.observable('');
	this.filteredPlaces = ko.computed(function() {
		self.hidePlaces();
		var search = self.query().toLowerCase();
		var these = ko.utils.arrayFilter(self.placeList(), function(place) {
			return place.title.toLowerCase().indexOf(search) >= 0;
		});
		if (these) {
			for (var i = 0; i < these.length; i++) {
				these[i].active(true);
			}
		return these;
		}
	});

	// Toggles sidebar //
	$('#sidebarCollapse').on('click', function () {
	    $('#sidebar').toggleClass('active');
	    $(this).toggleClass('active');
	});
};