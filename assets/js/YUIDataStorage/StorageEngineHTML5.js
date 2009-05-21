/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

/*
 * HTML limitations:
 */
(function() {
    var _YU = YAHOO.util,
		_YL = YAHOO.lang;

	/**
	 * The StorageEngineHTML5 class implements the HTML5 storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineHTML5
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {Object} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_YU.StorageEngineHTML5 = function(location, conf) {
		_YU.StorageEngineHTML5.superclass.constructor.apply(this, arguments);// not set, are cookies available
		this._engine = window[location];
	};

	_YL.extend(_YU.StorageEngineHTML5, _YU.Storage, {

		/*
		 * Implentation to calculate the current size of the storage engine.
		 * @see YAHOO.util.Storage.calculateSize
		 */
		calculateSize: function() {
			var sb = [];

			for (var i = 0; i < this.length; i += 1) {
				var key = this.key(i),
					value = this.getItem(key);
				sb[i] = key + '=' + value;
			}

			return _YL.getByteSize(sb.join('&'));
		},

		/*
		 * Implentation to calculate the remaining size in the storage engine.
		 * @see YAHOO.util.Storage.calculateSizeRemaining
		 */
		calculateSizeRemaining: function() {},

		/*
		 * Implentation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			this._engine.clear();
		},

		/*
		 * Implentation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			return this._engine.getItem(key);
		},

		/*
		 * Implentation to fetch the name of the storage engine.
		 * @see YAHOO.util.Storage.getName
		 */
		getName: function() {return _YU.StorageEngineHTML5.TYPE_NAME;},

		/*
		 * Implentation to evaluate key existence in storage engine.
		 * @see YAHOO.util.Storage.hasKey
		 */
		hasKey: function(key) {
			return this._getValue(this._getItem(key));
		},

		/*
		 * Implentation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		key: function(index) {
			return this._engine.key(index);
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			this._engine.removeItem(key);
			this.length = this._engine.length;
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, value) {
			this._engine.setItem(key, this._createValue(value));N
			this.length = this._engine.length;
		}
	}, true);

	_YU.StorageEngineHTML5.TYPE_NAME = 'HTML5';
    _YU.StorageManager.register(_YU.StorageEngineHTML5.TYPE_NAME, function() {return window.localStorage;}, _YU.StorageEngineHTML5);
})();