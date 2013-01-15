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
	
	// Google maps settings
	// lat/long settings
	var latitude;
	var longitude;
	var defaultLat = 37.485215;
	var defaultLng = -122.236355;
	
	var locationMarker = null;
	var Circle = null;
	var Map;

	
	snaprmain.init = function()
	{
		// init HTML references
		overlay = document.getElementById("overlay");
		message = document.getElementById("message");
		location = document.getElementById("location");
		mapWrapper = document.getElementById("map-wrapper");
		addressButton = document.getElementById("address-button");
		
		_onResize();
		window.addEventListener("resize", _onResize );
		
		// callback object to hand off to geo locator object
		var callBack = {
			success:function(position)
			{
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				_locationFound();
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
		
		_initMap();
		_initButtons();
	}
	
	function _initMap()
	{
		// Render the map
		Map = new TkMap({
			domid:'map-canvas',
			init:true,
			lat:defaultLat,
			lng:defaultLng,
			styles:'grey',
			zoom:11
		});
		
		// Render the Flu shot clinic locations on the map
		var spotLayer = new TkMapFusionLayer({
			geo:'Location',
			map:Map.Map,
			tableid:'5313521'/*,
			where:defaultWhere*/
		});
		var RendererOptions = {
			suppressInfoWindows: true,
			polylineOptions: {
				strokeColor:'#0954cf',
				strokeWeight:'5',
				strokeOpacity: '0.85'
			}
		};
	}
	
	function _initButtons()
	{
		addressButton.addEventListener( "mousedown" , _setLocationQuery );
	}
	
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
							_placeMarker(results[0].geometry.location);
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
	
	function _locationFound()
	{
		var geocoder = new google.maps.Geocoder();
		var map;
		var marker;
		
		var latlng = new google.maps.LatLng(latitude, longitude);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
		  if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				overlay.style.display = "none";
			
				location.value = results[0].formatted_address;
				_placeMarker(latlng);
			}
		  } else {
			console.log("Geocoder failed due to: " + status);
		  }
		});
	}
	
	/**
	 * Put the marker on the map
	 */
	function _placeMarker(latlng)
	{
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
		}
		if(Circle !== null)
		{
			Circle.setMap(null);
			Circle = null;
		}
		locationMarker = new google.maps.Marker({
			position:latlng,
			map: Map.Map
		});
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
		//spotLayer.showLayer({where:defaultWhere});
		_spotLayerListener();
		
		/*$('#grp-find').show(750);
		$('#grp-reset').show();
		if(eventSelected === true)
		{
			$('#grp-cta').show(750);
		}*/
	}
	
	// listen for clicks on the spots of interest
	function _spotLayerListener()
	{
		
	}
	
	function _onResize()
	{
		mapWrapper.style.height = window.innerHeight-120+"px";
		if (Map)
		{
			Map.Map.panToBounds(Circle.getBounds());
			Map.Map.fitBounds(Circle.getBounds());
		}
	}

// return internally scoped snaprmain var as value of globally scoped snaprmain object
return snaprmain;

})();