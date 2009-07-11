/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */
(function() {
	// constants
var Y = YAHOO,
	YC = Y.util.Connect,
	YJSON = Y.lang.JSON,
	URL_GEOCODE = 'http://freegeoip.appspot.com/json/',
	URL_IP = '../proxy.php?url=' + encodeURIComponent('http://jsonip.appspot.com/?callback=getip'),
	URL_PROXY = '../proxy.php?url=',
	URL_POSTAL = 'http://ws.geonames.org/findNearbyPostalCodesJSON?lat={0}&lng={1}',
	WATCH_TIMEOUT = 10000, // poll IP every 10 seconds, this could get expensive if called to frequently as it requires an AJAX request

	// local variables
	_engine,
	_lastIP = document.getElementById('geolocation.ip') ? document.getElementById('geolocation.ip').value : null,
	_ipToGeoCache = {},

	/**
	 * Handle the geo location request failure callback.
	 * @method _reqHandleGeoCodeFailure
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandleGeoCodeFailure = function() {
		Y.log('GeoCode request failed');
		// add desired failure code
	},

	/**
	 * Handle the geo location request success callback.
	 * @method _reqHandleGeoCodeSuccess
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandleGeoCodeSuccess = function(response) {
		var geoCodeObj = {coords: YJSON.parse(response.responseText)};
		_ipToGeoCache[_lastIP] = geoCodeObj;
		response.argument(geoCodeObj);
	},

	/**
	 * Handle the ip request failure callback.
	 * @method _reqHandleIPFailure
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandleIPFailure = function() {
		Y.log('IP request failed');
		// add desired failure code
	},

	/**
	 * Handle the ip request failure callback.
	 * @method _reqHandleIPSuccess
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandleIPSuccess = function(response) {
		_lastIP = response.responseText.replace(/.*?"ip": "([0-9\.]+)".*/, '$1');
//		_lastIP = '255.255.255.' + parseInt(255 * Math.random(), 10);
		response.argument(_lastIP);
	},

	/**
	 * Handle the postal code request failure callback.
	 * @method _reqHandlePostalFailure
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandlePostalFailure = function() {
		Y.log('Postal request failed');
		// add desired failure code
	},

	/**
	 * Handle the postal code request success callback.
	 * @method _reqHandlePostalSuccess
	 * @param response {Object} Required. The YUI provided AJAX response.
	 * @private
	 */
	_reqHandlePostalSuccess = function(response) {
		var postalCodes = YJSON.parse(response.responseText);
		response.argument(postalCodes && postalCodes.postalCodes ? postalCodes.postalCodes : []);
	},

	/**
	 * Makes a remote request to fetch the user's IP.
	 * @method _reqReadGeoCodeFromIp
	 * @param ip {String} Required. The IP address geolocate.
	 * @param callback {Function} Required. The callback function.
	 * @private
	 */
	_reqReadGeoCodeFromIp = function(ip, callback) {
		if (_ipToGeoCache[ip]) {
			callback(_ipToGeoCache[ip]);
		}
		else {
			var url = URL_PROXY + encodeURIComponent(URL_GEOCODE + ip);
			YC.asyncRequest('get', url, {failure: _reqHandleGeoCodeFailure, success: _reqHandleGeoCodeSuccess, argument: callback, cache: false});
		}
	},

	/**
	 * Makes a remote request to fetch the user's IP.
	 * @method _reqReadIP
	 * @param callback {Function} Required. The callback function.
	 * @param force {Boolean} Optional. Do not use the cached value.
	 * @private
	 */
	_reqReadIP = function(callback, force) {
		if (_lastIP && ! force) {
			callback(_lastIP);
		}
		else {
			YC.asyncRequest('get', URL_IP, {failure: _reqHandleIPFailure, success: _reqHandleIPSuccess, argument: callback, cache: false});
		}
	};
	
	if (false && navigator.geolocation) {
		_engine = navigator.geolocation;
	}
	else {
		// implement non-FF geolocation
		_engine = {
			/**
			 * Clears the interval used by watch.
			 * @method clearWatch
			 * @param watchId {Number} Required. The interval id.
			 * @static
			 */
			clearWatch: function(watchId) {
				clearInterval(watchId);
			},

			/**
			 * Fetches the current geolocation of the user.
			 * @method getCurrentPosition
			 * @param callback {Function} Required. The callback function.
			 * @static
			 */
			getCurrentPosition: function(callback) {
				_reqReadIP(function(ip) {
					_reqReadGeoCodeFromIp(ip, callback);
				});
			},

			/**
			 * Watches the geolocation for changes; executes the callback right away, then not again until it changes.
			 * @method watchPosition
			 * @param callback {Function} Required. The callback function.
			 * @static
			 */
			watchPosition: function(callback) {
				var fx = function() {
					var lastIP = _lastIP;
					_reqReadIP(function(ip) {
						if (ip !== lastIP) {
							lastIP = ip;
							_reqReadGeoCodeFromIp(ip, callback);
						}
					}, true);
				};

				setInterval(fx, WATCH_TIMEOUT);
				fx();
			}
		};
	}

	/**
	 * Fetches an array of nearby postal codes, by using the geolocation of user.
	 * @method getNearbyPostalCodes
	 * @param callback {Function} Required. The callback function.
	 * @static
	 */
	_engine.getNearbyPostalCodes = function(callback) {
		_engine.getCurrentPosition(function(o) {
			var coords = o.coords,
				url = URL_PROXY + encodeURIComponent(URL_POSTAL.replace(/\{0\}/, coords.latitude).replace(/\{1\}/, coords.longitude));
			YC.asyncRequest('get', url, {failure: _reqHandlePostalFailure, success: _reqHandlePostalSuccess, argument: callback});
		});
	};

	Core.Util.Geolocation = _engine;
}());