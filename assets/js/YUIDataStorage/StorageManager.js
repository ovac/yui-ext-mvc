/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

(function() {
    var _YL = YAHOO.lang;

    _YL.augmentObject(_YL, {

        /*
         * The escaped length of a special character.
         * @property SPECIAL_CHAR_BYTE_SIZE
         * @type {Number}
         * @public
         * @final Constant bytesize of an encoded special character.
         * @static
         * @depreciated I don't want to use this anymore
         */
        SPECIAL_CHAR_BYTE_SIZE: 3,

        /*
         * Estimates the size of the string using 1 byte for each alpha-numeric character and 3 for each non-alpha-numeric character.
         * @method getByteSize
         * @param s {String} Required. The string to evaulate.
         * @return {Number} The estimated string size.
         * @private
         */
        getByteSize: function(s) {
			return encodeURIComponent('' + s).length;
        }
    });
})();

/**
 * The Storage module manages client-side data storage.
 * @module Storage
 */

/**
 * The StorageManager class is a singleton that registers DataStorage objects and returns instances of those objects.
 * @class StorageManager
 * @namespace YAHOO.util
 * @static
 */
YAHOO.util.StorageManager = (function() {
	// constants
	var _YL = YAHOO.lang;

	// local namespace
	var _F = function() {},
		_locationSourceMap = {},
		_registeredSet = [],
		_registeredMap = {},
		_that = null;

	/**
	 * Fetches the data source type from the cache, or creates and caches it.
	 * @method _getDataStorageType
	 * @param location {String} Required. The location to store.
	 * @param klass {Function} Required. A pointer to the dataSource Class.
	 * @param conf {Object} Optional. Additional configuration for the data source engine.
	 * @private
	 */
	var _getDataStorageType = function(location, klass, conf) {
		var o = _locationSourceMap[location + klass.TYPE_NAME];

		if (! o) {
			o = new klass(location, conf);
			_locationSourceMap[location + klass.TYPE_NAME] = o;
		}

		return o;
	};

	/**
	 * Ensures that the location is valid before returning it or a default value.
	 * @method _getValidLocation
	 * @param location {String} Required. The location to evaluate.
	 * @private
	 */
	var _getValidLocation = function(location) {
		var _location = _YL.isString(location) ? location : null;
		return _location && (_location === _that.LOCATION_SESSION || _location === _that.LOCATION_LOCAL) ? _location : _that.LOCATION_SESSION;
	};

	// public namespace
	_F.prototype = {

        /**
         * The storage location - session; data cleared at the end of a user's session.
         * @property LOCATION_SESSION
         * @type {String}
         * @static
         */
		LOCATION_SESSION: 'sessionStorage',

        /**
         * The storage location - local; data cleared on demand.
         * @property LOCATION_LOCAL
         * @type {String}
         * @static
         */
		LOCATION_LOCAL: 'localStorage',

		/**
		 * Fetches the desired dataSource or first available dataSource.
		 * @method get
		 * @param dataSource {String} Required. The dataSourceType, see dataSources.
		 * @param location {String} Optional. The storage location - LOCATION_SESSION & LOCATION_LOCAL; default is LOCAL.
		 * @param conf {Object} Optional. Additional configuration for the getting the storage engine.
		 * {
		 * 	engine: {Object} configuration parameters for the desired engine
		 * 	order: {Array} an array of storage engine names; the desired order to try engines}
		 * }
		 * @static
		 */
		get: function(dataSource, location, conf) {
			var _cfg = _YL.isObject(conf) ? conf : {},
				_location = _getValidLocation(location),
				klass = _registeredMap[dataSource];

			if (! klass) {
				var i, j;

				if (_cfg.order) {
					j = _cfg.order.length;

					for (i = 0; i < j && ! klass; i += 1) {
						klass = _registeredMap[_cfg.order[i]];
					}
				}

				if (! klass) {
					j = _registeredSet.length;

					for (i = 0; i < j && ! klass; i += 1) {
						klass = _registeredSet[i];
					}
				}
			}

			if (klass) {
				return _getDataStorageType(_location, klass, _cfg.engine);
			}

			throw('YAHOO.util.StorageManager.get - No DataSource available, please include a DataSource before calling this function.');
		},

		/**
		 * Registers a dataSource Class with the StorageManager singleton; first in is the first out.
		 * @method register
		 * @param dataSource {String} Required. The dataSourceType, see dataSources.
		 * @param validationFx {Function} Required. The evaluation function to test if dataSource is available.
		 * @param klass {Function} Required. A pointer to the dataSource Class.
		 * @return {Boolean} When successfully registered.
		 * @static
		 */
		register: function(dataSource, validationFx, klass) {
			if (_YL.isString(dataSource) && _YL.isFunction(validationFx) && _YL.isFunction(klass) && validationFx()) {
				_registeredMap[dataSource] = klass;
				_registeredSet.push(klass);
			}

			return false;
		}
	};

	_that = new _F();
	return _that;
})();