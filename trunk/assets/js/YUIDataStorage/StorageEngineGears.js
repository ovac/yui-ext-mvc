/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 0.2.00
 */

// todo: prevent against sql injections (keys and values need to be evaluated)
// todo: fragmenting
// todo: add a keyLocation value as an index
// todo: what are the limitation of gears, is it per DB, per table, per user

/*
 * Gears limitation:
 * 	- the user must approve before gears can be used
 *  - each SQL query has a limited number of characters, data will need to be spread across rows
 *
 * Thoughts:
 *  - we may want to implement additional functions for the gears only implementation
 *  - how can we not use cookies to handle session location
 */
(function() {
		// internal shorthand
    var Y = YAHOO.util,
		YL = YAHOO.lang,

		// local variables
		_engine = null;

	/**
	 * The StorageEngineGears class implements the Google Gears storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineGears
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {String} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	Y.StorageEngineGears = function(location, conf) {
		Y.StorageEngineGears.superclass.constructor.call(this, location, Y.StorageEngineGears.ENGINE_NAME, conf);

		if (! _engine) {

			// create the database
			_engine = google.gears.factory.create('beta.database');
			_engine.open(window.location.host + '-database');
			_engine.execute('CREATE TABLE IF NOT EXISTS YUIStorageEngine' +
							' (key TEXT, location TEXT, value TEXT, keyLocation TEXT PRIMARY KEY")');
		}

		var isSessionStorage = Y.StorageManager.LOCATION_SESSION === this._location,
			sessionKey = Y.Cookie.get('sessionKey' + Y.StorageEngineGears.ENGINE_NAME);

		if (! sessionKey) {
			_engine.execute('BEGIN');
			_engine.execute('DELETE FROM StorageEngine WHERE location="' + Y.StorageManager.LOCATION_SESSION + '"');
			_engine.execute('COMMIT');
		}

		var rs = _engine.execute('SELECT key FROM StorageEngine WHERE location="' + this._location + '"');

		while (rs.isValidRow()) {
			this._keys.push(rs.field(0));
			rs.next();
		}

		// this is session storage, ensure that the session key is set
		if (isSessionStorage) {
			Y.Cookie.set('sessionKey' + Y.StorageEngineGears.ENGINE_NAME, true);
		}

		this.length = this._keys.length;
	};


	YL.extend(Y.StorageEngineGears, Y.Storage, {

		/**
		 * The a collectinon of key applicable to the current location. This should never be edited by the developer.
		 * @property _keys
		 * @type {Array}
		 * @public
		 */
		_keys: [],

		/*
		 * Implentation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			_engine.execute('BEGIN');
			_engine.execute('DELETE FROM StorageEngine WHERE location="' + this._location + '"');
			_engine.execute('COMMIT');
			this._keys = [];
			this.length = 0;
		},

		/*
		 * Implentation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			var rs = _engine.execute('SELECT value FROM StorageEngine WHERE key="' + key + '" AND location="' + this._location + '"'),
				value = null;

			if (rs.isValidRow()) {
				value = decodeURIComponent(rs.field(0));
			}

			rs.close();
			return value;
		},

		/*
		 * Implentation to fetch a key from the storage engine.
		 * @see YAHOO.util.Storage.key
		 */
		_key: function(index) {return this._keys[index];},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			YAHOO.log("removing " + key);
			_engine.execute('BEGIN');
			_engine.execute('DELETE FROM StorageEngine WHERE key="' + key + '" AND location="' + this._location + '"');
			_engine.execute('COMMIT');
			this.removeKey(key);
		},

		/*
		 * Implentation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, data) {
			YAHOO.log("SETTING " + data + " to " + key);

			if (! this.hasKey(key)) {
				this._keys.push(key);
				this.length = this._keys.length;
			}
			
			_engine.execute('BEGIN');
			_engine.execute('DELETE FROM StorageEngine WHERE key="' + key + '" AND location="' + this._location + '"');
			_engine.execute('INSERT INTO StorageEngine VALUES ("' + key + '", "' + this._location + '", "' + encodeURIComponent(this._createValue(data)) + '")');
			_engine.execute('COMMIT');
			
			return true;
		}
	});

	Y.StorageEngineGears.ENGINE_NAME = 'gears';
    Y.StorageManager.register(Y.StorageEngineGears.ENGINE_NAME, function() {return (window.google && window.google.gears);}, Y.StorageEngineGears);
}());