var markers = [];
var bounds;
var infoWindow;

// Declares Foursquare credentials as global variables.
var clientID = "XW3ZIK11U4HBLUHFMCLNR12Y1A2SFM3T1PRSJCIICMBAPAUM";
var clientSecret = "BDFDKCZ4GAN2I5ZR1JX0RNOXCBY3VUE0VUOOCORYQH4YMRCP";


				//==================================//
//===========================  M O D E L ============================//
		//=====================================================//
var locations = [
    {title: "Pearly's Beach Eats", lat: 27.9799535, lng: -82.8276398},
    {title: "Another Broken Egg", lat: 27.9811759, lng: -82.8273802},
  
    {title: "The Ordinary Pub", lat: 32.0796435, lng: -81.0970687},

    {title: 'Country Heritage Winery & Vineyard', lat: 41.2808261, lng: -85.1869129},
    {title: "Cerulean Restaurant", lat: 41.224774, lng: -85.82446},
    {title: "The Hoppy Gnome", lat: 41.0798617, lng: -85.1400626},

    {title: "Baltimore Coffee & Tea", lat: 39.182849, lng: -76.7348054},
    
    {title: "Bertucci's Italian Restaurant", lat: 42.1404999, lng: -71.1492204},
    {title: "The Farmer's Daughter (AKA Twisted Sister)", lat: 42.066151, lng: -71.10367},
    {title: "Legal C Bar", lat: 42.2308999, lng: -71.1800526},
    {title: "Ward's Berry Farm", lat: 42.098936, lng: -71.21899},

    {title: "Bridger Brewing", lat: 45.6626992, lng: -111.0548371},
    {title: "Last Chance | Pub & Cider Mill", lat: 45.7847702, lng: -108.5004206},
    
    {title: "Rough Draft", lat: 41.9239418, lng: -84.6332216},
    {title: "Checker Records", lat: 41.9191518, lng: -84.6346659},

    {title: "Laughlin's Slice Of Spice", lat: 42.2080113, lng: -84.5399307},
    {title: "Meckley's Flavor Fruit Farm", lat: 42.0588913, lng: -84.4081752},
    {title: "Grand River Brewery", lat: 42.2491175, lng: -84.4093752},
    {title: "Common Grill", lat: 42.3175779, lng: -84.0229587},

    {title: "Zingerman's Delicatessen", lat: 42.2846861, lng: -83.74726},
    {title: "Mani Osteria and Bar", lat: 42.2797177, lng: -83.7464692},
    {title: "The Songbird Cafe", lat: 42.303628, lng: -83.7067514},

    {title: "Crane's Pie Pantry Restaurant & Winery", lat: 42.5936296, lng: -86.1390823},
    {title: "Blue Heron 2", lat: 44.7602018, lng: -85.6262129},
    {title: "Grand Hotel", lat: 45.851135, lng: -84.628399},

    {title: "Village Bakery & Cafe - Armory", lat: 43.1421958, lng: -77.5790016},

    {title: "SIP Coffee", lat: 41.6767919, lng: -83.6230942},

    {title: "Pasquale's Pizzeria Napoletana", lat: 41.4556308, lng: -71.4731648},

    {title: "Rappahannock Restaurant", lat: 38.1942324, lng: -77.7527466},

    {title: "Old Ebbitt Grill", lat: 38.897954, lng: -77.0355335},
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

    $.getJSON(self.imgURL).done(function(img) {
    	if (typeof img.response.photos.items[0] === 'undefined') {
    		self.result += '<h5>No photo available</h5>';
    	} else {
      	self.imgPrefix = img.response.photos.items[0].prefix;
      	self.imgSuffix = img.response.photos.items[0].suffix;
      	self.imgSrc = self.imgPrefix.toString() + '100x75' + self.imgSuffix.toString();
      	self.imgLink = '<img src="' + self.imgSrc + '">'
      	self.result += self.imgLink;
      }
    }).fail(function( jqxhr, textStatus, error ) {
    	var err = textStatus + ", " + error;
    	console.log("Request Failed: " + err );
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