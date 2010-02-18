/*
 * SWF limitation:
 * 	- only 100,000 bytes of data may be stored this way
 *  - data is publicly available on user machine
 *
 * Thoughts:
 *  - data can be shared across browsers
 *  - how can we not use cookies to handle session location
 */
(function() {
	// internal shorthand
var Y = YAHOO.util,
	YL = YAHOO.lang,
	YD = Y.Dom,
	
	/*
	 * The minimum width required to be able to display the settings panel within the SWF.
	 */	
	MINIMUM_WIDTH = 215,

	/*
	 * The minimum height required to be able to display the settings panel within the SWF.
	 */	
	MINIMUM_HEIGHT = 138,

	// local variables
	_driver = null,

	/*
	 * Creates a location bound key.
	 */
	_getKey = function(that, key) {
		return that._location + that.DELIMITER + key;
	},

	/*
	 * Initializes the engine, if it isn't already initialized.
	 */
	_initDriver = function(cfg) {
		if (! _driver) {
			if (! YL.isString(cfg.swfURL)) {cfg.swfURL = _F.SWFURL;}
			if (! cfg.containerID) {
				var bd = document.getElementsByTagName('body')[0],
					container = bd.appendChild(document.createElement('div'));
				cfg.containerID = YD.generateId(container);
			}

			if (! cfg.attributes) {cfg.attributes  = {};}
			if (! cfg.attributes.flashVars) {cfg.attributes.flashVars = {};}
			cfg.attributes.flashVars.useCompression = 'true';
			cfg.attributes.version = 9.115;
			_driver = new YAHOO.widget.SWF(cfg.containerID, cfg.swfURL, cfg.attributes);

			// subscribe to save for info
			_driver.subscribe('save', function(o) {
				YAHOO.log(o.message, 'info');
			});

			// subscribe to errors
			_driver.subscribe('quotaExceededError', function(o) {
				YAHOO.log(o.message, 'error');
			});
			_driver.subscribe('inadequateDimensions', function(o) {
				YAHOO.log(o.message, 'error');
			});
			_driver.subscribe('error', function(o) {
				YAHOO.log(o.message, 'error');
			});
			_driver.subscribe('securityError', function(o) {
				YAHOO.log(o.message, 'error');
			});
		}
	},

	/**
	 * The StorageEngineSWF class implements the SWF storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineSWF
	 * @uses YAHOO.widget.SWF
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {String} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_F = function(location, conf) {
		var _this = this;
		_F.superclass.constructor.call(_this, location, _F.ENGINE_NAME, conf);
		
		_initDriver(_this._cfg);
		
		var _onContentReady = function() {
			_this._swf = _driver._swf;
			_driver.initialized = true;
			
			var isSessionStorage = Y.StorageManager.LOCATION_SESSION === _this._location,
				sessionKey = Y.Cookie.get('sessionKey' + _F.ENGINE_NAME);

			for (var i = _driver.callSWF("getLength", []) - 1; 0 <= i; i -= 1) {
				var key = _driver.callSWF("getNameAt", [i]),
					isKeySessionStorage = -1 < key.indexOf(Y.StorageManager.LOCATION_SESSION + _this.DELIMITER);

				// this is session storage, but the session key is not set, so remove item
				if (isSessionStorage && ! sessionKey) {
					_driver.callSWF("removeItem", [key]);
				}
				// the key matches the storage type, add to key collection
				else if (isSessionStorage === isKeySessionStorage) {
					_this._addKey(key);
				}
			}

			// this is session storage, ensure that the session key is set
			if (isSessionStorage) {
				Y.Cookie.set('sessionKey' + _F.ENGINE_NAME, true);
			}

			_this.fireEvent(_this.CE_READY);
		};
		
		// evaluate immediately, SWF is already loaded
		if (_driver.initialized) {
			YL.later(250, _this, _onContentReady);
		}
		// evaluates when the SWF is loaded
		else {
			_driver.addListener("contentReady", _onContentReady);
		}
	};

	YL.extend(_F, Y.StorageEngineKeyed, {
		/**
		 * The underlying SWF of the engine, exposed so developers can modify the adapter behavior.
		 * @property _swf
		 * @type {Object}
		 * @protected
		 */
		_swf: null,

		/*
		 * Implementation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			for (var i = this._keys.length - 1; 0 <= i; i -= 1) {
				var key = this._keys[i];
				_driver.callSWF("removeItem", [key]);
			}
			// since keys are used to clear, we call the super function second
			_F.superclass._clear.call(this);
		},

		/*
		 * Implementation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			var _key = _getKey(this, key);
			return _driver.callSWF("getValueOf", [_key]);
		},

		/*
		 * Implementation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		_key: function(index) {
			return _F.superclass._key.call(this, index).replace(/^.*?__/, '');
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			YAHOO.log("removing SWF key: " + key);
			var _key = _getKey(this, key);
			_F.superclass._removeItem.call(this, _key);
			_driver.callSWF("removeItem", [_key]);
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, data) {
			var _key = _getKey(this, key), swfNode;

			if (! _driver.callSWF("getValueOf", [_key])) {
				this._addKey(_key);
			}

			if (_driver.callSWF("setItem", [_key, data])) {
				return true;
			}
			else {
				swfNode = YD.get(_driver._id);
				if (MINIMUM_WIDTH > YD.getStyle(swfNode, 'width').replace(/\D+/g, '')) {YD.setStyle(swfNode, 'width', MINIMUM_WIDTH + 'px');}
				if (MINIMUM_HEIGHT > YD.getStyle(swfNode, 'height').replace(/\D+/g, '')) {YD.setStyle(swfNode, 'height', MINIMUM_HEIGHT + 'px');}
				YAHOO.log("attempting to show settings. are dimensions adequate? " + _driver.callSWF("hasAdequateDimensions"));
				return _driver.callSWF("displaySettings", []);
			}
		}
	});

	_F.SWFURL = "swfstore.swf";
	_F.ENGINE_NAME = 'swf';
	_F.isAvailable = function() {
		return (6 <= YAHOO.env.ua.flash && YAHOO.widget.SWF);
	};
    Y.StorageManager.register(_F);
	Y.StorageEngineSWF = _F;
}());