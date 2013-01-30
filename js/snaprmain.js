// depends on Modernizr.js
var snaprmain = (function () {
"use strict";

	var snaprmain = {
	VERSION: '0.0.1'
	};

	// html entities
	var overlay;
	var message;
	var location;
	var mapWrapper;
	var addressButton;
	var foodbankcheck;
	var hsacheck;
	var libcheck;
	var currLocation;
	var infoWindow;
	
	var LOCATION_TYPES = [
		{type: "library" , icon: "yellow"},
		{type: "hsa" , icon: "red"},
		{type: "food_bank" , icon: "green"}
	];
	
	// Google maps settings
	// lat/long settings
	var latitude;
	var longitude;
	var defaultLat = 37.485215;
	var defaultLng = -122.236355;
	
	// routing variables
	var directionsDisplay;
	
	// arrays of markers
	var libraryMarkers = [];
	var hsaMarkers = [];
	var foodbankMarkers = [];
	
	var infoWindow;
	var locationMarker = null;
	var Circle = null;
	var Map;
	var libraryLayer;
	var hsaLayer;
	var foodBankLayer;

	
	snaprmain.init = function()
	{	
		// init HTML references
		overlay = document.getElementById("overlay");
		message = document.getElementById("message");
		location = document.getElementById("location");
		mapWrapper = document.getElementById("map-wrapper");
		addressButton = document.getElementById("address-button");
		foodbankcheck = document.getElementById( "foodbankcheck" );
		hsacheck = document.getElementById( "hsacheck" );
		libcheck = document.getElementById( "libcheck" );
		currLocation = document.getElementById( "find-current" );
		
		_initMap();
		_initDataSources();
		_locateUser();
		_initButtons();
		
		_onResize();
		window.addEventListener("resize", _onResize );
	}
	
	// initialize the Google map
	function _initMap()
	{
		infoWindow = new google.maps.InfoWindow();
		// Render the map
		Map = new TkMap({
			domid:'map-canvas',
			init:true,
			lat:defaultLat,
			lng:defaultLng,
			styles:'grey',
			zoom:11
		});
		
		google.maps.event.addListener(Map.Map , "click" , _moveOrigin , false);
	}
	
	// move the origin address
	function _moveOrigin(event)
	{
		_reverseGeocodeLocation( event.latLng.lat() , event.latLng.lng() );
	}
	
	// initialize the markers
	function _initDataSources()
	{
        // Send query to Google Chart Tools to get data from table.
        // Note: the Chart Tools API returns up to 500 rows.
        var libquery = "SELECT "+
        			"name, "+
        			"address, "+
        			"phone, location,"+
        			"'Sunday opens at',"+
        			"'Sunday closes at',"+
        			"'Monday opens at',"+
        			"'Monday closes at',"+
        			"'Tuesday opens at',"+
        			"'Tuesday closes at',"+
        			"'Wednesday opens at',"+
        			"'Wednesday closes at',"+
        			"'Thursday opens at',"+
        			"'Thursday closes at',"+
        			"'Friday opens at',"+
        			"'Friday closes at',"+
        			"'Saturday opens at',"+
        			"'Saturday closes at',"+
        			"Source"+
        			" FROM 16Hgjofi6dES5QLc3S1FVgdQ-f4eu0EMDhzqnEmM"+
        			" WHERE Source='Library'";
        libquery = encodeURIComponent(libquery);
        var libgvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + libquery);
        libgvizQuery.send(_parseData);
        
        
        var hsaquery = "SELECT "+
        			"name, "+
        			"address, "+
        			"phone, location,source"+
        			" FROM 1ytGQ-GWvjvSdT1uX7HsRRK9szs84YZBL5i73E7U"+
        			" WHERE source='HSA'";
        hsaquery = encodeURIComponent(hsaquery);
        var hsagvizQuery = new google.visualization.Query(
            'http://www.google.com/fusiontables/gvizdata?tq=' + hsaquery);
        hsagvizQuery.send(_parseData);
        
        
        var foodbankquery = "SELECT "+
        			"name, "+
        			"address, "+
        			"phone, location,source"+
        			" FROM 1ytGQ-GWvjvSdT1uX7HsRRK9szs84YZBL5i73E7U"+
        			" WHERE source='Second Harvest Food Bank'";
        foodbankquery = encodeURIComponent(foodbankquery);
        var foodbankgvizQuery = new google.visualization.Query(
            'http://www.google.com/fusiontables/gvizdata?tq=' + foodbankquery);
        foodbankgvizQuery.send(_parseData);
	}
	
	// use geolocation to locate the user
	function _locateUser()
	{
		overlay.style.display = "table";
				
		// callback object to hand off to geo locator object
		var callBack = {
			success:function(position)
			{
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				_reverseGeocodeLocation(latitude,longitude);
			}
			,
			error:function(error)
			{
				overlay.style.display = "none";
				message.innerHTML = "error! "+error.message;
			}
		}
		
		if (Modernizr.geolocation) 
		{
			var geo = window.geo.locate(callBack);
			
		}
		else{
			callBack.error({message:"Geolocation is not supported."});
		}
	}
	
	
	function _initButtons()
	{
		location.addEventListener( "keypress" , _submitWithReturnKey , false ); // hit return in location field
		addressButton.addEventListener( "mousedown" , _setLocationQuery , false ); // hit search button
		
		foodbankcheck.addEventListener( "click" , _checkFoodBankCheck , false );
		hsacheck.addEventListener( "click" , _checkHSACheck , false );
		libcheck.addEventListener( "click" , _checkLibCheck , false );
		currLocation.addEventListener( "click" , _currLocationClicked , false );
	}
	
	// 'use current location' link clicked
	function _currLocationClicked(e)
	{
		e.preventDefault();
		_locateUser();
	}
	
	function _submitWithReturnKey(event) 
	{
		if( event.keyCode == 13 )
		{
		  _setLocationQuery();
		  location.blur();
		}
	}
	
	// reverse geocode the location based on lat/long and place in address field 
	function _reverseGeocodeLocation(lat,lng)
	{
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat,lng);
		
		geocoder.geocode({'latLng': latlng}, function(results, status) 
		{
		  if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) 
			{
				overlay.style.display = "none";
				location.value = results[0].formatted_address;
				updateLocation(lat,lng);
			}
		  } 
		  else 
		  {
			console.log("Geocoder failed due to: " + status);
		  }
		});
	}
	
	function updateLocation(lat,lng)
	{
		latitude = lat;
		longitude = lng;
		_placeMarker(lat,lng);
		_findClosestMarker(locationMarker);
	}
	
	function _placeMarker(lat,lng)
	{
		var latlng = new google.maps.LatLng(lat,lng);
		
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
		}
		
		locationMarker = new google.maps.Marker({
			position:latlng,
			map: Map.Map,
		});
		
		/*
		if(Circle !== null)
		{
			Circle.setMap(null);
			Circle = null;
		}
		
		Circle = new google.maps.Circle({
			center:latlng,
			clickable:false,
			fillOpacity:0.075,
			map:Map.Map,
			radius:3000,
			strokeWeight:1
		});
		Map.Map.panToBounds(Circle.getBounds());
		Map.Map.fitBounds(Circle.getBounds());
		*/
	}
	
	// convert degrees to radians
	function _degreeToRadian(x) {return x*Math.PI/180;}
	
	// find the closest marker to the passed marker
	function _findClosestMarker( toMarker ) {
		var lat = toMarker.position.lat();
		var lng = toMarker.position.lng();
				
		var R = 6371; // radius of earth in km
		var distances = [];
		var closest = -1;
		
		var markers = [];
		
		// don't include markers that are unchecked in the calculation
		if (libcheck.checked) markers = markers.concat(libraryMarkers);
		if (hsacheck.checked) markers = markers.concat(hsaMarkers);
		if (foodbankcheck.checked) markers = markers.concat(foodbankMarkers);
		
		var markerLen = markers.length;
		
		if (markerLen >0)
		{
			for( i=0;i<markerLen; i++ ) {
				var mlat = markers[i].position.lat();
				var mlng = markers[i].position.lng();
				var dLat  = _degreeToRadian(mlat - lat);
				var dLong = _degreeToRadian(mlng - lng);
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(_degreeToRadian(lat)) * Math.cos(_degreeToRadian(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var d = R * c;
				distances[i] = d;
				if ( closest == -1 || d < distances[closest] ) {
					closest = i;
				}
			}
				
			_routeDirections(locationMarker,markers[closest]);
		}
		else
		{
			directionsDisplay.setMap(null);
			infoWindow.close();
		}
	}
	
	// find the route between two markers
	function _routeDirections(fromMarker,toMarker)
	{
		if (directionsDisplay != null) 
		{
			directionsDisplay.setMap(null);
		}
		
		var directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer({suppressInfoWindows:true,suppressMarkers:true});
		
		directionsDisplay.setMap(Map.Map);
		//directionsDisplay.setPanel(document.getElementById('panel'));
		
		var request = {
			origin: fromMarker.position, 
			destination: toMarker.position,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};
		
		infoWindow.setPosition(toMarker.position);
        infoWindow.setContent(_formatInfoWindow(toMarker.info));
    	infoWindow.open(Map.Map);
		
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			}
		});
	}
	
     
	function _createMarker(coordinate, iwdata, iconURL) {
    	
    	  var marker = new google.maps.Marker({
            map: Map.Map,
            position: coordinate,
            title: name,
            icon: new google.maps.MarkerImage(iconURL),
            info: iwdata
          });
          
          google.maps.event.addListener(marker, 'click', function(event) {
            infoWindow.setPosition(coordinate);
            infoWindow.setContent(_formatInfoWindow(iwdata));
            infoWindow.open(Map.Map);
            _routeDirections(locationMarker,marker);
          });
          
          return marker;
    }
	
	// set the html formatting of the info window
	function _formatInfoWindow(rows)
	{	
		var html = "";
		for (var row in rows)
		{
			html += "<div><b>" + row + ":</b> " + rows[row] + "</div>";
		}
		
		return html;
	}


    function _parseData(response) {
	  var numRows = response.getDataTable().getNumberOfRows();

	  // For each row in the table, create a marker
	  for (var i = 0; i < numRows; i++) {
	  
		var stringCoordinates = response.getDataTable().getValue(i, 3);
		
		var splitCoordinates = stringCoordinates.split(',');
		var lat = splitCoordinates[1];
		var lng = splitCoordinates[0];
		
		var coordinate = new google.maps.LatLng(lat, lng);
		var name = response.getDataTable().getValue(i, 0);
		var address = response.getDataTable().getValue(i, 1);
		var phone = response.getDataTable().getValue(i, 2);
		
		var iwdata = {Name:name,Address:address,Phone:phone}; // data for the marker's infowindow
		
		var type = response.getDataTable().getValue(i, response.getDataTable().getNumberOfColumns()-1);
			
		if (type == "Library")
		{		
			libraryMarkers.push( _createMarker(coordinate, iwdata, 'http://google-maps-icons.googlecode.com/files/museum-historical.png') );
		}
		else if (type == "HSA")
		{
			hsaMarkers.push( _createMarker(coordinate, iwdata, 'http://google-maps-icons.googlecode.com/files/family.png') );
		}
		else if (type == "Second Harvest Food Bank")
		{
			foodbankMarkers.push( _createMarker(coordinate, iwdata, 'http://google-maps-icons.googlecode.com/files/grocery.png') );
		}
	  
	  }
	}
	
	
	// location changed
	function _setLocationQuery()
	{	
		if(location.value.length > 0)
		{
			if(locationMarker !== null)
			{
				locationMarker.setMap(null);
			}
			if(Circle !== null)
			{
				Circle.setMap(null);
			}
			//$('#grp-day').hide(750);
			//$('.day').removeClass('marked active');
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode(
				{address:location.value},
				function(results, status)
				{
					if (status == google.maps.GeocoderStatus.OK)
					{
						if (results[0])
						{
							Map.Map.panTo(results[0].geometry.location);
							var lat = results[0].geometry.location.lat();
							var lng = results[0].geometry.location.lng();
							_placeMarker(lat,lng);
							_findClosestMarker(locationMarker);
						}
						else
						{
							_addressError();
						}
					}
					else
					{
						_addressError();
					}
				}
			);
		}
	}

	
	
	function _addressError()
	{
		message.innerHTML = 'We\'re sorry. We could not locate this address. Please doublecheck you\'ve entered your address correctly.';
	}
	
	
	function _onResize()
	{
		mapWrapper.style.height = window.innerHeight-120+"px";
		if (Map && Circle)
		{
			Map.Map.panToBounds(Circle.getBounds());
			Map.Map.fitBounds(Circle.getBounds());
		}
	}
	
	function _checkLibCheck()
	{
		 libcheck.checked ? snaprmain.showLayer(LOCATION_TYPES[0]) : snaprmain.hideLayer(LOCATION_TYPES[0]);
	}
	
	function _checkHSACheck()
	{
		hsacheck.checked ? snaprmain.showLayer(LOCATION_TYPES[1]) : snaprmain.hideLayer(LOCATION_TYPES[1]);
	}

	function _checkFoodBankCheck()
	{
		foodbankcheck.checked ? snaprmain.showLayer(LOCATION_TYPES[2]) : snaprmain.hideLayer(LOCATION_TYPES[2]);
	}
	
	snaprmain.showLayer = function(type)
	{
		//console.log( "showing type..." , type );
		switch(type)
		{
			case LOCATION_TYPES[0]:
    			//libraryLayer.showLayer();
    			for (var m in libraryMarkers)
    			{
    				libraryMarkers[m].setMap(Map.Map);
    			}
    		break;
  			case LOCATION_TYPES[1]:
				//hsaLayer.showLayer();
				for (var m in hsaMarkers)
    			{
    				hsaMarkers[m].setMap(Map.Map);
    			}
			break;
  			case LOCATION_TYPES[2]:
				//foodBankLayer.showLayer();
				for (var m in foodbankMarkers)
    			{
    				foodbankMarkers[m].setMap(Map.Map);
    			}
			break;
		}
		
		updateLocation(latitude, longitude);
	}
	
	snaprmain.hideLayer = function(type)
	{
		//console.log( "hiding type..." , type );
		switch(type)
		{
			case LOCATION_TYPES[0]:
    			//libraryLayer.hideLayer();
    			for (var m in libraryMarkers)
    			{
    				libraryMarkers[m].setMap(null);
    			}
    		break;
  			case LOCATION_TYPES[1]:
				//hsaLayer.hideLayer();
				for (var m in hsaMarkers)
    			{
    				hsaMarkers[m].setMap(null);
    			}
			break;
  			case LOCATION_TYPES[2]:
				//foodBankLayer.hideLayer();
				for (var m in foodbankMarkers)
    			{
    				foodbankMarkers[m].setMap(null);
    			}
			break;
		}
		
		updateLocation(latitude, longitude);
	}

// return internally scoped snaprmain var as value of globally scoped snaprmain object
return snaprmain;

})();