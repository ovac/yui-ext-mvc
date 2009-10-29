/*
 * Gears limitation:
 *  - SQLite limitations - http://www.sqlite.org/limits.html
 *  - DB Best Practices - http://code.google.com/apis/gears/gears_faq.html#bestPracticeDB
 * 	- the user must approve before gears can be used
 *  - each SQL query has a limited number of characters (9948 bytes), data will need to be spread across rows
 *  - no query should insert or update more than 9948 bytes of data in a single statement or GEARs will throw:
 *  	[Exception... "'Error: SQL statement is too long.' when calling method: [nsIDOMEventListener::handleEvent]" nsresult: "0x8057001c (NS_ERROR_XPC_JS_THREW_JS_OBJECT)" location: "<unknown>" data: no]
 *
 * Thoughts:
 *  - we may want to implement additional functions for the gears only implementation
 *  - how can we not use cookies to handle session location
 */
(function() {
	// internal shorthand
var Y = YAHOO.util,
	YL = YAHOO.lang,
	_SQL_STMT_LIMIT = 9948,
	_TABLE_NAME = 'YUIStorageEngine',

	// local variables
	_driver = null,

	eURI = encodeURIComponent,
	dURI = decodeURIComponent,

	/**
	 * The StorageEngineGears class implements the Google Gears storage engine.
	 * @namespace YAHOO.util
	 * @class StorageEngineGears
	 * @constructor
	 * @extend YAHOO.util.Storage
	 * @param location {String} Required. The storage location.
	 * @param conf {Object} Required. A configuration object.
	 */
	_F = function(location, conf) {
		var _this = this;
		_F.superclass.constructor.call(_this, location, _F.ENGINE_NAME, conf);

		if (! _driver) {
			// create the database
			_driver = google.gears.factory.create(_F.GEARS);
			_driver.open(window.location.host + '-' + _F.DATABASE);
			_driver.execute('CREATE TABLE IF NOT EXISTS ' + _TABLE_NAME + ' (key TEXT, location TEXT, value TEXT)');
		}

		var isSessionStorage = Y.StorageManager.LOCATION_SESSION === _this._location,
			sessionKey = Y.Cookie.get('sessionKey' + _F.ENGINE_NAME);

		if (! sessionKey) {
			_driver.execute('BEGIN');
			_driver.execute('DELETE FROM ' + _TABLE_NAME + ' WHERE location="' + eURI(Y.StorageManager.LOCATION_SESSION) + '"');
			_driver.execute('COMMIT');
		}

		var rs = _driver.execute('SELECT key FROM ' + _TABLE_NAME + ' WHERE location="' + eURI(_this._location) + '"'),
			keyMap = {};
	
		try {
			// iterate on the rows and map the keys
			while (rs.isValidRow()) {
				var fld = dURI(rs.field(0));

				if (! keyMap[fld]) {
					keyMap[fld] = true;
					_this._addKey(fld);
				}

				rs.next();
			}
		}
		finally {
			rs.close();
		}

		// this is session storage, ensure that the session key is set
		if (isSessionStorage) {
			Y.Cookie.set('sessionKey' + _F.ENGINE_NAME, true);
		}

		YL.later(250, _this, function() { // temporary solution so that CE_READY can be subscribed to after this object is created
			_this.fireEvent(_this.CE_READY);
		});
	};

	YL.extend(_F, Y.StorageEngineKeyed, {

		/*
		 * Implementation to clear the values from the storage engine.
		 * @see YAHOO.util.Storage._clear
		 */
		_clear: function() {
			_F.superclass._clear.call(this);
			_driver.execute('BEGIN');
			_driver.execute('DELETE FROM ' + _TABLE_NAME + ' WHERE location="' + eURI(this._location) + '"');
			_driver.execute('COMMIT');
		},

		/*
		 * Implementation to fetch an item from the storage engine.
		 * @see YAHOO.util.Storage._getItem
		 */
		_getItem: function(key) {
			var rs = _driver.execute('SELECT value FROM ' + _TABLE_NAME + ' WHERE key="' + eURI(key) + '" AND location="' + eURI(this._location) + '"'),
				value = '';

			try {
				while (rs.isValidRow()) {
					value += rs.field(0);
					rs.next();
				}
			}
			finally {
				rs.close();
			}

			return value ? dURI(value) : null;
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._removeItem
		 */
		_removeItem: function(key) {
			YAHOO.log("removing gears key: " + key);
			_F.superclass._removeItem.call(this, key);
			_driver.execute('BEGIN');
			_driver.execute('DELETE FROM ' + _TABLE_NAME + ' WHERE key="' + eURI(key) + '" AND location="' + eURI(this._location) + '"');
			_driver.execute('COMMIT');
		},

		/*
		 * Implementation to remove an item from the storage engine.
		 * @see YAHOO.util.Storage._setItem
		 */
		_setItem: function(key, data) {
			YAHOO.log("SETTING " + data + " to " + key);

			if (! this.hasKey(key)) {
				this._addKey(key);
			}

			var _key = eURI(key),
				_location = eURI(this._location),
				_value = eURI(data),
				_values = [],
				_len = _SQL_STMT_LIMIT - (_key + _location).length;

			// the length of the value exceeds the available space
			if (_len < _value.length) {
				for (var i = 0, j = _value.length; i < j; i += _len) {
					_values.push(_value.substr(i, _len));
				}
			}
			else {
				_values.push(_value);
			}

			// Google recommends using INSERT instead of update, because it is faster
			_driver.execute('BEGIN');
			_driver.execute('DELETE FROM ' + _TABLE_NAME + ' WHERE key="' + eURI(key) + '" AND location="' + eURI(this._location) + '"');
			for (var m = 0, n = _values.length; m < n; m += 1) {
				_driver.execute('INSERT INTO ' + _TABLE_NAME + ' VALUES ("' + _key + '", "' + _location + '", "' + _values[m] + '")');
			}
			_driver.execute('COMMIT');
			
			return true;
		}
	});

	// releases the engine when the page unloads
	Y.Event.on('unload', function() {
		if (_driver) {_driver.close();}
	});
	_F.ENGINE_NAME = 'gears';
	_F.GEARS = 'beta.database';
	_F.DATABASE = 'yui.database';
	_F.isAvailable = function() {
		if (window.google && window.google.gears) {
			try {
				// this will throw an exception if the user denies gears
				google.gears.factory.create(_F.GEARS);
				return true;
			}
			catch (e) {
				// no need to do anything
			}
		}

		return false;
	};
    Y.StorageManager.register(_F);
	Y.StorageEngineGears = _F;
}());