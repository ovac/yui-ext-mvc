/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

/**
 * Creates a store, which can be used to set and get information on a user's local machine. This is similar to a
 * browser cookie, except the allowed store is larger and can be shared across browsers.
 *
 * @module datastore
 * @title DataStore Util
 * @beta
 */
(function() {
	// yahoo namespace
    var _YU = YAHOO.util,
		_YL = YAHOO.lang,
		_YD = _YU.Dom;

	// local variables
	var _engine = null,
		_isReady = false;

	/**
	 * The StorageEngineSWF class implements the SWF storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineSWF
	 * @uses YAHOO.widget.FlashAdapter
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {Object} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_YU.StorageEngineSWF = function(location, conf) {
		_YU.StorageEngineSWF.superclass.constructor.apply(this, arguments);// not set, are cookies available

		if (! _engine) {
			// setup configuration
			var _cfg = _YL.isObject(conf) ? conf : {};
			if (! _YL.isString(_cfg.swfURL)) {_cfg.swfURL = _YU.StorageEngineSWF.SWFURL;}
			if (! _cfg.containerID) {
				var bd = document.getElementsByTagName('body')[0],
					container = bd.appendChild(document.createElement('div'));
				_cfg.containerID = _YD.generateId(container);
			}

			_engine = new YAHOO.widget.FlashAdapter(_cfg.swfURL, _cfg.containerID, _cfg.attributes);
			var _that = this; // this will cause issue, when instantiating many engines

			// evaluates when the SWF is loaded
			var intervalId = setInterval(function() {
				if (_engine._swf && _YL.isValue(_engine._swf.displaySettings)) {
					clearInterval(intervalId);
					_isReady = true;
					_that.length = _engine._swf.getLength();
				}
			}, 100);

			/**
			 * Fires when an error occurs
			 * @event error
			 * @param event.type {String} The event type
			 * @param event.message {String} The data
			 */
			_engine.createEvent("error");

			/**
			 * Fires when a store is saved successfully
			 * @event success
			 * @param event.type {String} The event type
			 */
			_engine.createEvent("success");

			/**
			 * Fires when the save is pending, due to a request for additional storage
			 * @event error
			 * @param event.type {String} The event type
			 */
			_engine.createEvent("pending");

			/**
			 * Fires as the settings dialog displays
			 * @event error
			 * @param event.type {String} The event type
			 */
			_engine.createEvent("openDialog");

			/**
			 * Fires when a settings dialog is not able to be displayed due to
			 * the SWF not being large enough to show it. In this case, the developer
			 * needs to resize the SWF to width of 215px and height of 138px or above,
			 * or display an external settings page.
			 * @event openExternalDialog
			 * @param event.type {String} The event type
			 */
			_engine.createEvent("openExternalDialog");
		}
	};


	_YL.extend(_YU.StorageEngineSWF, _YU.Storage, {

		/*
		 * Implentation to calculate the current size of the storage engine.
		 * @see YAHOO.util.Storage.calculateSize
		 */
		calculateSize: function() {
			return _engine._swf.calculateSize();
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
			return _engine._swf.clear();
		},

		/**
		 * Displays the settings dialog to allow the user to configure storage settings manually. If the SWF height
		 * and width are smaller than what is allowable to display the local settings panel,
		 * an openExternalDialog message will be sent to JavaScript.
		 * @method displaySettings
		 * @public
		 */
		displaySettings: function() {
			return _engine._swf.displaySettings();
		},

		/*
		 * Implentation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			return this._getValue(_engine._swf.getItem(key));
		},

		/**
		 * Returns the item in storage at a particular index, if any.
		 * @method getItemAt
		 * @param index {Number} Required. The index where data is stored.
		 * @return {Object} The data.
		 * @public
		 */
		getItemAt: function(index) {
			return this._getValue(_engine._swf.getItemAt(index));
		},
		/**
		 * Gets the timestamp of the last store. This value is automatically set when data is stored.
		 * @method getLastModified
		 * @return A Date object
		 * @public
		 */
		getLastModified: function() {
			return _engine._swf.getLastModified();
		},

		/*
		 * Implentation to fetch the name of the storage engine.
		 * @see YAHOO.util.Storage.getName
		 */
		getName: function() {return _YU.StorageEngineSWF.TYPE_NAME;},

		/*
		 * Implentation to evaluate key existence in storage engine.
		 * @see YAHOO.util.Storage.hasKey
		 */
		hasKey: function(key) {
			return null !== this._getItem(key);
		},

		/**
		 * Evaluate if the swf is loaded and functions are available.
		 * @method isReady
		 * @return {Boolean} The SWF is loaded.
		 * @public
		 */
		isReady: function() {
			return _isReady;
		},

		/*
		 * Implentation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		key: function(index) {
			return _engine._swf.getKeyNameAt(index);
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			YAHOO.log("removing " + key);
			_engine._swf.removeItem(key);
			this.length = _engine._swf.getLength();
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, data) {
			YAHOO.log("SETTING " + data + " to " + key);
			var fl = _engine._swf.setItem(this._createValue(data), key);
			this.length = _engine._swf.getLength();
			return fl;
		},

		/**
		 * This method requests more storage if the amount is above 100KB. (e.g., if the <code>store()</code> method
		 * returns "pending". The request dialog has to be displayed within the Flash player itself
		 * so the SWF it is called from must be visible and at least 215px x 138px in size.
		 * @method setSize
		 * @param value The size, in KB
		 * @public
		 */
		setSize: function(value) {
			return _engine._swf.setSize(value);
		},

		/**
		 * Public accessor to the unique name of the DataStore instance.
		 * @method toString
		 * @return {String} Unique name of the DataStore instance.
		 * @public
		 */
		toString: function() {
			return "DataStore " + _engine._id;
		}
	});

	_YU.StorageEngineSWF.SWFURL = "datastore.swf";
	_YU.StorageEngineSWF.TYPE_NAME = 'SWF';
    _YU.StorageManager.register(_YU.StorageEngineSWF.TYPE_NAME, function() {return true;}, _YU.StorageEngineSWF);
})();