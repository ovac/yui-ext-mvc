/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

/*
 * Cookie limitations:
 *  - 4000 bytes (browser detection could be used to increase this)
 *  - each character should be encoded, so it may take up to 3 bytes
 *  - each site can have up to 20 cookies
 *  - the server header size needs to be large enough to support this as well
 *  - requires YAHOO.util.Cookie
 *
 * Thoughts:
 *  - character compression will be helpful for increasing cookie size
 *  - will use 1 cookie for localStorage and 1 for sessionStorage (max size of 4b each), unless configured otherwise
 *  - need to detect how many cookies are available
 */
(function() {
	// internal shorthand
var Y = YAHOO.util,
	YC = Y.Cookie,
	YL = YAHOO.lang,

	// constants
	COOKIE_PREFIX = 'SEC_',
	MAX_BYTE_SIZE = 4000,
	MAX_COOKIE_SIZE = 20,

	// local variables
	_driver = document.cookie;

	/**
	 * The StorageEngineCookie class implements a Cookie based storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineCookie
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {String} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	Y.StorageEngineCookie = function(location, conf) {
		var _this = this, cookies;
		Y.StorageEngineCookie.superclass.constructor.call(_this, location, Y.StorageEngineCookie.ENGINE_NAME, conf);

		cookies = YC.getSubs(COOKIE_PREFIX + location);

		if (cookies) {
			for (var k in cookies) {
				if (YL.isString(cookies[k])) {
					_this._addKey(k);
				}
			}
		}

		_this.length = _this._keys.length;
		YL.later(250, _this, function() { // temporary solution so that CE_READY can be subscribed to after this object is created
			_this.fireEvent(_this.CE_READY);
		});
	};

	YL.extend(Y.StorageEngineCookie, Y.StorageEngineKeyed, {

		/*
		 * Implementation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			YC.setSubs(COOKIE_PREFIX + this._location, {});
			this._keys = [];
			this.length = 0;
		},

		/*
		 * Implementation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			var value = YC.getSub(COOKIE_PREFIX + this._location, key);
			return value ? decodeURIComponent(value) : null;
		},

		/*
		 * Implementation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		_key: function(index) {return this._keys[index];},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			YC.removeSub(COOKIE_PREFIX + this._location, key);
			this._removeKey(key);
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, data) {
			if (! this.hasKey(key)) {
				this._addKey(key);
			}

			if (MAX_BYTE_SIZE < (encodeURIComponent('&' + key + '=' + data) + YC.get(COOKIE_PREFIX + this._location)).length) {
				return false;
			}

			var options = {};
			// ensures the non-session data remains stored for up to 10 years
			if (Y.StorageManager.LOCATION_LOCAL === this._location) {
				var date = new Date();
				date.setFullYear(date.getFullYear() + 10);
				options.expires=date;
			}
			
			YC.setSub(COOKIE_PREFIX + this._location, key, data, options);
			return true;
		}
	});

	Y.StorageEngineCookie.ENGINE_NAME = 'cookie';
	Y.StorageEngineCookie.isAvailable = function() {
		var testName = 'YAHOO.util.Cookie',
			testValue = 'test',
			numberOfCookies;

		if (navigator && ! navigator.cookieEnabled) {return false;} // navigator tells us no
		numberOfCookies = ('' + _driver).split(';').length;
		if (numberOfCookies) {return numberOfCookies < MAX_COOKIE_SIZE;} // cookies exists, assume enabled

		YC.set(testName, testValue);

		// evaluate that we can write a cookie, will fail if their are no more cookies as well
		if (testValue === YC.get(testName)) {
			YC.remove(testName);
			return true;
		}

		return false;
	};

    Y.StorageManager.register(Y.StorageEngineCookie);
}());