/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

/**
 * Cookie limitations:
 *  - 4000 bytes (browser detection could be used to increase this)
 *  - each character can take up to 3 bytes (because of encoding, most characters will take 1 byte)
 *  - so, cookie character limit is 1,333; without separators or other special characters
 *  - each site can have up to 20 cookies
 *  - are cookies
 *  - the server header size needs to be large enough to support this as well
 *
 * Thoughts:
 *  - character compression will be helpful for increasing cookie size
 *  - some cookies will be used for localStorage and some fore sessionStorage, unless configured otherwise
 *  - need to detect how many cookies are already in use
 */
(function() {
    var _YU = YAHOO.util,
		_YC = _YU.Cookie,
		_YL = YAHOO.lang,
        _that = {

        /**
         * Returns the number of cookies currently used.
         * @method getNumberOfCookies
         * @return {Number} The number of cookies.
         * @private
         */
        getNumberOfCookies: function() {
            return ('' + document.cookie).split(';').length;
        },

        /**
         * Estimates the size of the cookie using 1 byte for each alpha-numeric character and 3 for each non-alpha-numeric character.
         * @method getCookieSize
         * @param key {String} Required. The cookie key to test.
         * @return {Number} The estimated cookie size.
         * @private
         */
        getCookieSize: function(key) {
            return _YL.getByteSize('' + _YC.get(key));
        },

        /**
         * Tests if cookies are enabled.
         * @method isCookiesEnabled
         * @return {Boolean} True when cookies enabled;
         * @private
         */
        isCookiesEnabled: function() {
            var testName = 'YAHOO.util.Cookie',
                testValue = 'test';

            if (navigator && ! navigator.cookieEnabled) {return false;} // navigator tells us no
            if (('' + document.cookie).length) {return true;} // cookies exists, assume enabled

            _YC.set(testName, testValue);

            if (testValue === _YC.get(testName)) {
                _YC.remove(testName);
                return true;
            }
            else {
                return false;
            }
        }
    };

    _YL.augmentObject(_YC, _that);

	// constants
	var _ERROR_NO_AVAILABLE_COOKIES = 'EXCEPTION - CookieStorage - No available cookies; to use this storage technique, you must delete some cookies first',
		_MAX_BYTE_SIZE = 4000,
		_MAX_COOKIES = 20; // maximum number of cookies available

	// local namespace
	var _data = {},
		_keys = [],
		_lastCookie = '',
		_storageCookieSize = 0;

	/**
	 * Builds the local cookie object.
	 * @method _buildCookieObject
	 * @param l {String} Required. The location.
	 * @private
	 */
	var _buildCookieObject = function(l) {
		// iterate through possible cookies
		for (var i = 0; i < _MAX_COOKIES; i += 1) {
			var o = _YC.get(l + i);

			// session storage exists, create map
			if (o) {
				_YL.arrayWalk(o.split('&'), function(o) {
					var p = o.split('='),
						name = ('' + p[0]);

					// this concatenates a previous value
					if (_data[name]) {
						_data[name] += ('' + p[1]);
					}
					// this is a new value
					else {
						_keys.push(name);
						_data[name] = ('' + p[1]);
					}
				});
			}
			// session storage does not exists yet
			else {
				break;
			}
		}
	};

	/**
	 * Clears all possible cookies related to this session.
	 * @method _clearLocationCookies
	 * @param l {String} Required. The location.
	 * @private
	 */
	var _clearLocationCookies = function(l) {
		// iterate through possible cookies and delete
		for (var i = 0; i < _MAX_COOKIES; i += 1) {
			_YC.remove(l + i);
		}
	};

	/**
	 * Tests if the cookie has changed.
	 * @method _hasCookiesChanged
	 * @return {Boolean} True when cookie changed.
	 * @private
	 */
	var _hasCookiesChanged = function() {
		var s = ('' + document.cookie);
		if (_lastCookie === s) {return false;}
		_lastCookie = s;
		return true;
	};

	/**
	 * Trims the provided string to the available space.
	 * @method _str_trimToSize
	 * @param s {String} Required. A string to trim.
	 * @param availableSpace {Number} Required. The maximum space for string.
	 * @private
	 */
	var _str_trimToSize = function(s, availableSpace) {
		var rs = [],
			str = '' + s,
			size = _YL.getByteSize(str),
			m = Math.ceil(s.length * (availableSpace / size)),
			i = 0;

		while (size !== availableSpace) {
			if (10 < i ) {throw('EXCEPTION - Too much recursion inside _str_trimToSize');}
			var nstr = str.substr(0, m),
				newsize = _YL.getByteSize(nstr),
				n = availableSpace - newsize,
				z = Math.abs(n);

			// todo: rewrite this logic, there has to be a better way
			// newsize is larger than available; reduce size OR newsize is smaller than available
			if (0 > n || _YL.SPECIAL_CHAR_BYTE_SIZE <= z) {
				if (_YL.SPECIAL_CHAR_BYTE_SIZE * 2 <= z) {m += Math.ceil(n * 2 / 3);}
				else {m += 0 > n ? -1 : 1;}
			}
			else  {
				rs = [nstr, str.substr(m)];
				break;
			}

			i += 1;
		}

		return rs;
	};

	/**
	 * Actually writes the cookie object into the cookies.
	 * @method _writeCookieObject
	 * @param l {String} Required. The location.
	 * @private
	 */
	var _writeCookieObject = function(l) {
		var i = 0,
			currentSize = _YL.getByteSize(_YC.get(l + i));

		_clearLocationCookies(l);
        var __setSubCookie = _YU.StorageManager.LOCATION_SESSION === l ?
			function(key, skey, value) {_YC.setSub.call(_YC, key, skey, value);} :
			function(key, skey, value) {
				var expires = new Date();
				expires.setYear(expires.getFullYear() + 100);
				_YC.setSub.call(_YC, key, skey, value, {expires: expires});
			};

		// note: possible code paths
		//  I am short enough to fit on the current cookie
		//  I am too long for current cookie, but fit on second cookie
		//  I take up many cookies
		//  I require additional cookies that are not available

		// iterate on the data to insert into cookies
		for (var key in _data) {
			// this is a valid key to store
			if (_YL.isString(key)) {
				var value = _data[key],
					keySize = _YL.getByteSize('&' + key + '='),
					valueSize = _YL.getByteSize(value),
					newCurrentSize = currentSize + keySize + valueSize;

				// value is large than current cookie, find space for it
				while (_MAX_BYTE_SIZE < newCurrentSize) {
					// the keysize exceeds the available byte size in current cookie, move to next cookie
					if (_MAX_BYTE_SIZE < currentSize + keySize) {
					}
					// it is the cookie value that exceeds the current cookie size
					else {
						var bytesAvailable = _MAX_BYTE_SIZE - (keySize + currentSize),
							o = _str_trimToSize(value, bytesAvailable);

						if ('' === l) {
                            __setSubCookie(l + i, key, o[0]);
                        }
                        else {

                        }

						value = o[1];
						valueSize = _YL.getByteSize(value);
					}

					i += 1;
					currentSize = 0;
					newCurrentSize = _YL.getByteSize(l + i + '=') + keySize + valueSize;
				}

				// enough in current cookie space
				__setSubCookie(l + i, key, value);
				currentSize = newCurrentSize;
			}
		}

		_storageCookieSize = i + 1;
		_hasCookiesChanged(); // update the last cookie pointer
	};

	/**
	 * The StorageEngineCookie class implements the Cookie storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineCookie
	 * @uses YAHOO.util.Cookie
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {Object} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_YU.StorageEngineCookie = function(location, conf) {
		_YU.StorageEngineCookie.superclass.constructor.apply(this, arguments);// not set, are cookies available

		if (_YL.isNull(_YC.get(this._location + '0'))) {
			if (0 < _MAX_COOKIES) {
				// don't need to do anything
			}
			// out of cookies, cannot continue
			else {
				throw(_ERROR_NO_AVAILABLE_COOKIES);
			}
		}
		// already set
		else {
			this._sync();
		}
	};

	_YL.extend(_YU.StorageEngineCookie, _YU.Storage, {

		/*
		 * Implentation to calculate the current size of the storage engine.
		 * @see YAHOO.util.Storage.calculateSize
		 */
		calculateSize: function() {},

		/*
		 * Implentation to calculate the remaining size in the storage engine.
		 * @see YAHOO.util.Storage.calculateSizeRemaining
		 */
		calculateSizeRemaining: function() {
			var availableCookies = _MAX_COOKIES - _YC.getNumberOfCookies();
			return (availableCookies + _storageCookieSize) * _MAX_BYTE_SIZE;
		},

		/*
		 * Implentation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			_clearLocationCookies(this._location);
			_data = {};
			_keys = [];
			_lastCookie = '';
			this.length = _keys.length;
		},

		/*
		 * Implentation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			this._sync();
			return this._getValue(_data[key]);
		},

		/*
		 * Implentation to fetch the name of the storage engine.
		 * @see YAHOO.util.Storage.getName
		 */
		getName: function() {return _YU.StorageEngineCookie.TYPE_NAME;},

		/*
		 * Implentation to evaluate key existence in storage engine.
		 * @see YAHOO.util.Storage.hasKey
		 */
		hasKey: function(key) {
			this._sync();
			return ! _YL.isUndefined(_data[key]);
		},

		/*
		 * Implentation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		key: function(index) {
			this._sync();
			return _keys[index];
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			this._sync();
			delete _data[key];
			var newKeys = [];

			_YL.arrayWalk(_keys, function(_key) {
				if (key !== _key) {
					newKeys.push(_key);
				}
			});

			_keys = newKeys;
			this.length = _keys.length;
			_writeCookieObject(this._location);
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, value) {
			this._sync();
			if (! this.hasKey(key)) {
				_keys.push(key);
				this.length = _keys.length;
			}

			// cookies are available to store data into
			if (_YC.getNumberOfCookies() < _MAX_COOKIES) {
				var availableCookies = _MAX_COOKIES - _YC.getNumberOfCookies(),
					sizeNeeded = _YL.getByteSize(value),
					sizePerCookie = sizeNeeded / availableCookies;

				if (_MAX_BYTE_SIZE < sizePerCookie) {
					var availableSizeLastCookieA = _MAX_BYTE_SIZE - _YC.getCookieSize(this._location + (_storageCookieSize - 1));
					// the data is too large for remaining space
					if (availableSizeLastCookieA + _MAX_BYTE_SIZE * availableCookies < sizeNeeded) {
						return false;
					}
				}
			}
			// out of cookies
			else {
				var availableSizeLastCookieB = _MAX_BYTE_SIZE - _YC.getCookieSize(this._location + (_storageCookieSize - 1));
				if (availableSizeLastCookieB < sizeNeeded) {return false;} // todo: check last cookie
			}

			_data[key] = this._createValue(value);
			_writeCookieObject(this._location);
			return true;
		},

		/**
		 * Synchronizes data engine with the underlying cookie structure; should be called before any operation.
		 * @method _sync
		 * @public
		 */
		_sync: function() {
			if (_hasCookiesChanged()) {_buildCookieObject(this._location);}
			this.length = _keys.length;
		}
	}, true);

	_YU.StorageEngineCookie.TYPE_NAME = 'cookie';
    _YU.StorageManager.register(_YU.StorageEngineCookie.TYPE_NAME, _YC.isCookiesEnabled, _YU.StorageEngineCookie);
})();