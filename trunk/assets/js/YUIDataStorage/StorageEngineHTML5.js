/*
 * HTML limitations:
 *  - 5MB in FF and Safari, 10MB in IE 8
 *  - only FF 3.5 recovers session storage after a browser crash
 *
 * Thoughts:
 *  - how can we not use cookies to handle session
 */
(function() {
	// internal shorthand
var Y = YAHOO.util,
	YL = YAHOO.lang,

	/*
	 * Required for IE 8 to make synchronous.
	 */
	_beginTransaction = function(driver) {
		driver.begin();
	},

	/*
	 * Required for IE 8 to make synchronous.
	 */
	_commitTransaction = function(driver) {
		driver.commit();
	},

	/**
	 * The StorageEngineHTML5 class implements the HTML5 storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineHTML5
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {String} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_F = function(location, conf) {
		var _this = this;
		_F.superclass.constructor.call(_this, location, _F.ENGINE_NAME, conf);// not set, are cookies available
		_this._driver = window[location];

		// simplifieds the begin/commit functions, if not using IE; this provides a massive performance boost
		if (! _this._driver.begin) {_beginTransaction = function() {}; }
		if (! _this._driver.commit) {_commitTransaction = function() {}; }

		_this.length = _this._driver.length;
		YL.later(250, _this, function() { // temporary solution so that CE_READY can be subscribed to after this object is created
			_this.fireEvent(_this.CE_READY);
		});
	};

	YAHOO.lang.extend(_F, Y.Storage, {

		_driver: null,

		/*
		 * Implementation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			var _this = this;
			if (_this._driver.clear) {
				_this._driver.clear();
			}
			// for FF 3, fixed in FF 3.5
			else {
				for (var i = _this.length, key; 0 <= i; i -= 1) {
					key = _this._key(i);
					_this._removeItem(key);
				}
			}
		},

		/*
		 * Implementation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			var o = this._driver.getItem(key);
			return YL.isObject(o) ? o.value : o; // for FF 3, fixed in FF 3.5
		},

		/*
		 * Implementation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage._key
		 */
		_key: function(index) {return this._driver.key(index);},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			var _this = this;
			_beginTransaction(_this._driver);
			_this._driver.removeItem(key);
			_commitTransaction(_this._driver);
			_this.length = _this._driver.length;
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, value) {
			var _this = this;

			try {
				_beginTransaction(_this._driver);
				_this._driver.setItem(key, value);
				_commitTransaction(_this._driver);
				_this.length = _this._driver.length;
				return true;
			}
			catch (e) {
				return false;
			}
		}
	}, true);

	_F.ENGINE_NAME = 'html5';
	_F.isAvailable = function() {
		return window.localStorage;
	};
    Y.StorageManager.register(_F);
	Y.StorageEngineHTML5 = _F;
}());