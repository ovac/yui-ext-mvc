/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

(function() {

	var _YU = YAHOO.util;

if (! _YU.Storage) {

	var _YL = YAHOO.lang,
		_ERROR_OVERWRITTEN = 'Exception in YAHOO.util.Storage.?? - must be extended by a storage engine';

	/**
	 * The Storage class is an HTML 5 storage API clone, used to wrap individual storage implementations with a common API.
	 * @class Storage
	 * @namespace YAHOO.util
	 * @constructor
	 * @param location {Object} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_YU.Storage = function(location, conf) {
		YAHOO.env._id_counter += 1;
		this.onChange = new _YU.CustomEvent('StorageEvent' + YAHOO.env._id_counter, this, false, _YU.CustomEvent.FLAT);
		this.length = this.length;
		this._location = location;
	};

	_YU.Storage.prototype = {

		/**
		 * The event to fire when adding or removing an item.
		 * @event onChange
		 * @public
		 */
		onChange: null,

		/**
		 * The location for this instance.
		 * @property _location
		 * @type {String}
		 * @public
		 */
		_location: '',

		/**
		 * The current length of the keys.
		 * @property length
		 * @type {Number}
		 * @public
		 */
		length: 0,

		/**
		 * Fetches the remaining size this object can store in bytes; should be overwritten by storage engine.
		 * @method calculateSize
		 * @return {Number} The remaining size.
		 * @public
		 */
		calculateSize: function() {throw(_ERROR_OVERWRITTEN.replace('??', 'calculateSize'));},

		/**
		 * Fetches the maximum size remaining to store a value in bytes; should be overwritten by storage engine.
		 * @method calculateSizeRemaining
		 * @return {Number} The maximum size.
		 * @public
		 */
		calculateSizeRemaining: function() {throw(_ERROR_OVERWRITTEN.replace('??', 'calculateSizeRemaining'));},

		/**
		 * Clears any existing key/value pairs.
		 * @method clear
		 * @public
		 */
		clear: function() {
			this._clear();
			this.length = 0;
		},

		/**
		 * Converts the object into a string, with meta data (type), so it can be restored later.
		 * @method _createValue
		 * @param s {Object} Required. An object to store.
		 * @public
		 */
		_createValue: function(s) {
			var type = typeof s;
			return 'string' === type ? s : type + '||' + s;
		},

		/**
		 * Fetches the data stored and the provided key.
		 * @method getItem
		 * @param key {String} Required. The key used to reference this value (DOMString in HTML 5 spec).
		 * @return {String|NULL} The value stored at the provided key (DOMString in HTML 5 spec).
		 * @public
		 */
		getItem: function(key) {
			return this.hasKey(key) ? this._getItem(key) : null; // required by HTML 5 spec
		},

		/**
		 * Fetches the storage object's name; should be overwritten by storage engine.
		 * @method getName
		 * @return {String} The name of the data storage object.
		 * @public
		 */
		getName: function() {throw(_ERROR_OVERWRITTEN.replace('??', 'getName'));},

		/**
		 * Tests if the key has been set (not in HTML 5 spec); should be overwritten by storage engine.
		 * @method hasKey
		 * @param key {String} Required. The key to search for.
		 * @return {Boolean} True when key has been set.
		 * @public
		 */
		hasKey: function(key) {throw(_ERROR_OVERWRITTEN.replace('??', 'hasKey'));},

		/**
		 * Evaluate if the engine is loaded and functions are available; true by default, should be overridden by subclass if needed.
		 * @method isReady
		 * @return {Boolean} The engine is loaded.
		 * @public
		 */
		isReady: function() {
			return true;
		},

		/**
		 * Retrieve the key stored at the provided index; should be overwritten by storage engine.
		 * @method key
		 * @param index {Number} Required. The index to retrieve (unsigned long in HTML 5 spec).
		 * @return {String} Required. The key at the provided index (DOMString in HTML 5 spec).
		 * @public
		 */
		key: function(index) {throw(_ERROR_OVERWRITTEN.replace('??', 'key'));},

		/**
		 * Remove an item from the data storage.
		 * @method setItem
		 * @param key {String} Required. The key to remove (DOMString in HTML 5 spec).
		 * @public
		 */
		removeItem: function(key) {
			if (this.hasKey(key)) {
                var oldValue = this._getItem(key);
                if (! oldValue) {oldValue = null;}
                this._removeItem(key);
				this.onChange.fire(new _YU.StorageEvent(this, key, oldValue, null));
				return oldValue;
			}
			else {
				// HTML 5 spec says to do nothing
				// throw('Error - YUIDataStorge.removeItem - The provided \'key\' does not exist');
				return null;
			}
		},

		/**
		 * Adds an item to the data storage.
		 * @method setItem
		 * @param key {String} Required. The key used to reference this value (DOMString in HTML 5 spec).
		 * @param data {Object} Required. The data to store at key (DOMString in HTML 5 spec).
		 * @public
		 */
		setItem: function(key, data) {
			if (_YL.isString(key)) {
				var oldValue = this._getItem(key);
				if (! oldValue) {oldValue = null;}

				if (this._setItem(key, data)) {
					this.onChange.fire(new _YU.StorageEvent(this, key, oldValue, data));
				}
				else {
					throw('QUOTA_EXCEEDED_ERROR - YUIDataStorge.setItem - The choosen storage method (' +
						  this.getName() + ') has exceeded capacity of ' +
						  this.getMaxSize() + 'kb');
				}
			}
			else {
				// HTML 5 spec says to do nothing
				// throw('Error - YUIDataStorge.setItem - The provided \'key\' was not a \'string\'');
			}
		},

		/**
		 * Clears any existing key/value pairs.
		 * @method _clear
		 * @public
		 */
		_clear: function() {},

		/**
		 * Fetches the data stored and the provided key.
		 * @method _getItem
		 * @param key {String} Required. The key used to reference this value.
		 * @return {String|Undefined} The value stored at the provided key.
		 * @public
		 */
		_getItem: function(key) {},

		/**
		 * Converts the stored value into its appropriate type.
		 * @method _getValue
		 * @param s {String} Required. The stored value.
		 * @public
		 */
		_getValue: function(s) {
			var a = s ? s.split('||') : [];
			if (1 == a.length) {return s;}

			switch (a[0]) {
				case 'boolean': return 'true' === a[1];
				case 'number': return parseFloat(a[1]);
				default: return a[1];
			}
		},

		/**
		 * Adds an item to the data storage.
		 * @method _removeItem
		 * @param key {String} Required. The key to remove.
		 * @public
		 */
		_removeItem: function(key) {},

		/**
		 * Adds an item to the data storage.
		 * @method _setItem
		 * @param key {String} Required. The key used to reference this value.
		 * @param data {Object} Required. The data to storage at key.
		 * @return {Boolean} True when successful, false when size QUOTA exceeded.
		 * @public
		 */
		_setItem: function(key, data) {}
	};
};

})();