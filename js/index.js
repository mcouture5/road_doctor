var panelOpen = true;
var trafficAreaRoads = [];
var stateOutlines = [];
var map, directionsService, directionsDisplay, startMarker, endMarker, start, end, geocoder;
var timerRunning = false;
var infos = {};

(function(){

	$('.close-button').click(function (){
		if(panelOpen) {
			closePanel();
		} else {
			openPanel();
		}
	});

	$('#stateHealth').click(function (){
		$('.info-panel').hide();
		$('.link').removeClass('active-link');
		closePanel(function (){
			$('#stateHealthPnl').fadeIn();
			showStates();
			hideRoads();
			destroyRouteService();
			map.setCenter({"lat":38.839707613545144,"lng":-78.11279296875});
			map.setZoom(7);
		});
		$('#stateHealth').addClass('active-link');
	});

	$('#highestTraffic').click(function (){
		$('.info-panel').hide();
		$('.link').removeClass('active-link');
		closePanel(function (){
			$('#highestTrafficPnl').fadeIn();
			showRoads();
			hideStates();
			destroyRouteService();
			map.setCenter({"lat":39.12153746241925,"lng":-77.23663330078125});
			map.setZoom(9);
		});
		$('#highestTraffic').addClass('active-link');
	});

	$('#whosDriving').click(function (){
		$('.info-panel').hide();
		$('.link').removeClass('active-link');
		closePanel(function (){
			$('#whosDrivingPnl').fadeIn();
			hideRoads();
			hideStates();
			initializeRouteService();
			map.setCenter({"lat":39.120738398950564,"lng":-76.89674377441406});
			map.setZoom(12);
		});
		$('#whosDriving').addClass('active-link');
	});

	$('#requestRerouting').click(function (){
		$('.info-panel').hide();
		$('.link').removeClass('active-link');
		closePanel(function (){
			$('#requestReroutingPnl').fadeIn();
			hideRoads();
			hideStates();
			destroyRouteService();
		});
		$('#requestRerouting').addClass('active-link');
	});

	function showStates (){
		stateOutlines.forEach(function (state){
			state.setMap(map);
		});
	};

	function showRoads (){
		trafficAreaRoads.forEach(function (road){
			road.setMap(map);
		});
	};

	function hideStates (){
		stateOutlines.forEach(function (state){
			state.setMap(null);
		});
	};

	function hideRoads (){
		trafficAreaRoads.forEach(function (road){
			road.setMap(null);
		});
	};

	function closePanel(callback){
		panelOpen = false;
		$('.close-button').addClass('invert');
		$('.header-info').slideUp(400, function (){
			if(callback){
				callback();
			}
		});
		$('.header-label').addClass('small');
	};

	function openPanel(){
		panelOpen = true;
		hideStates();
		hideRoads();
		destroyRouteService();
		$('.close-button').removeClass('invert');
		$('.header-info').slideDown();
		$('.header-label').removeClass('small');
		$('.info-panel').hide();
		$('.link').removeClass('active-link');
	};

	$('.send-request').click(function (){
        $('#confirmModal').modal({
            backdrop: 'static'
        });
	});
}())

function initializeRouteService(){
    directionsDisplay.setMap(map);
    startMarker.setMap(map);
    endMarker.setMap(map);
    calcRoute();
    getFrequencies();
};

function destroyRouteService(){
    directionsDisplay.setMap(null);
    startMarker.setMap(null);
    endMarker.setMap(null);
};

function calcRoute() {
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
    	var startRoute, endRoute;
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
        timerRunning = false;
    });
};

function getFrequencies(){
	// Random amounts for each calculation.
	var htmlToSet = '';
	var vehicles = [];
	for(var i = 0; i < 6; i++){
		var vehNumber = Math.floor(Math.random() * 5000) + 1;
		var vehCount = Math.floor(Math.random() * 15) + 1;
		vehicles.push({id: vehNumber, count: vehCount});
	}
	vehicles.sort(function (a,b){
		if(a.count < b.count){
			return 1
		}
		if(a.count > b.count){
			return -1
		}
		return 0;
	});
	for(var j = 0; j < vehicles.length; j++){
		var vehicle = vehicles[j];
		htmlToSet += '<li><div><strong>Vehicle #' + vehicle.id + '</strong><div>' + vehicle.count + ' trips</div></div></li>';
	}
	$('.vehicles').html(htmlToSet);
};

function drawMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		minZoom: 4,
		maxZoom: 16,
		center: new google.maps.LatLng(39.201165, -77.224011),
		disableDefaultUI: true,
		disableDoubleClickZoom: true
	});

	geocoder = new google.maps.Geocoder;

	start = new google.maps.LatLng(39.07964100697691, -76.9009494781494);
	end = new google.maps.LatLng(39.15595517271457, -76.83228492736816);

	directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
    	preserveViewport: true,
    	markerOptions: {visible: false},
    	polylineOptions: {
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 4
		}
    });

	startMarker = new google.maps.Marker({
        position: start,
        draggable: true
    });

    startMarker.addListener('drag', function(event){
        start = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        if(!timerRunning){
        	timerRunning = true;
	        setTimeout(calcRoute, 500);
	    }
    });

    endMarker = new google.maps.Marker({
        position: end,
        draggable: true
    });

    endMarker.addListener('drag', function(event){
        end = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        if(!timerRunning){
        	timerRunning = true;
	        setTimeout(calcRoute, 500);
	    }
    });

    startMarker.addListener('dragend', function(event){
        getFrequencies();
    });
    endMarker.addListener('dragend', function(event){
        getFrequencies();
    });

	var lineSymbol = {
	    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
	    scale: 1,
	    strokeColor: '#000'
	  };

	$.getJSON( "/assets/roads/roads.json", function( data ) {
		trafficAreaRoads = [];
		$.each( data, function( key, val ) {
			var path = data[key].path;
			if(data[key].road == 'i270nb') {
				path = path.concat().reverse();
			}
			var route = new google.maps.Polyline({
				path: path,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 4,
				icons: [{
			      icon: lineSymbol,
			      offset: '100%'
			    }]
			});
			trafficAreaRoads.push(route);
		    var count = 0, max = path.length;
			window.setInterval(function() {
				count = (count + 1) % max;
				var icons = route.get('icons');
				icons[0].offset = (count / (max / 100)) + '%';
				route.set('icons', icons);
			}, 100 - (data[key].health * 15));
		});
	});

	$.getJSON( "/assets/roads/states.json", function( data ) {
		stateOutlines = [];
		$.each( data, function( key, val ) {
			var state = new google.maps.Polygon({
				path: data[key].path,
				strokeColor: '#eb1d2a',
			    strokeOpacity: 0.8,
			    strokeWeight: 2,
			    fillColor: '#eb1d2a',
			    fillOpacity: 0.35
			});
			stateOutlines.push(state);
		});
	});
/*
	  poly = new google.maps.Polyline({
	    strokeColor: '#000000',
	    strokeOpacity: 1.0,
	    strokeWeight: 3
	  });
	  poly.setMap(map);

	  // Add a listener for the click event
	  map.addListener('click', addLatLng);
	// Handles click events on a map, and adds a new point to the Polyline.
	function addLatLng(event) {
	  var path = poly.getPath();
var myPath = [];

	  // Because path is an MVCArray, we can simply append a new coordinate
	  // and it will automatically appear.
	  path.push(event.latLng);
	  for(var i = 0; i < path.length; i++){
	  	var latlon = path.getAt(i);
	  	myPath.push({lat: latlon.lat(), lng: latlon.lng()});
	  }
	  console.log(JSON.stringify(myPath));

	  // Add a new marker at the new plotted point on the polyline.
	  var marker = new google.maps.Marker({
	    position: event.latLng,
	    title: '#' + path.getLength(),
	    map: map
	  });
	}*/

	/*
	getMapPoints(function(coordinates){
	    heatmap = new google.maps.visualization.HeatmapLayer({
			data: coordinates,
			map: map,
			gradient: gradient,
			radius: 20,
			opacity: 1,
			dissipating: true
	    });
	});
*/
};

function getMapPoints(callback){
	var param = getParameterByName('timelineID'), coordinates = [];
	$.getJSON( '/tweets/coordinates/' + param, function( result ){
		result.forEach(function(coordinate){
			coordinates.push(new google.maps.LatLng(coordinate.coordinates[1], coordinate.coordinates[0]));
		});
		callback(coordinates);
    });
};