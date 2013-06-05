
var geo = (function () {
"use strict";

	var geo = {
	VERSION: '0.0.1'
	};
	
	// function to run on success or failure, new instance should be passed into geo.locate()
	var callBack; 

	geo.locate = function(pCallBack)
	{
		callBack = pCallBack;
		
		// modernizr should pick this up, but just in case...
		if (navigator.geolocation)
		{
			// Request a position whose age is not greater than 10 minutes old. 
			navigator.geolocation.getCurrentPosition(_success,_error,{maximumAge:600000});
		}
		else{
			callBack.error({message:"Geolocation is not supported."});
		}
	}
	
	
	// location successfully found
	function _success(position)
	{
		callBack.success(position);
	}
	
	// error retrieving location
	function _error(error)
	{
		switch(error.code) 
		{
			case error.PERMISSION_DENIED:
				 error.message = "User denied the request for Geolocation.";
			break;
			case error.POSITION_UNAVAILABLE:
				error.message = "Location information is unavailable.";
			break;
			case error.TIMEOUT:
				error.message = "The request to get user location timed out.";
			break;
			case error.UNKNOWN_ERROR:
				error.message = "An unknown error occurred.";
			break;
		}
		
		callBack.error(error);
	}

// return internally scoped geo var as value of globally scoped geo object
return geo;

})();