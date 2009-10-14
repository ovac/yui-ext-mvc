/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.00
 */

/**
 * The AjaxManager manages all instances of AjaxObject and global events.
 * @namespace YAHOO.util
 * @class AjaxManager
 * @static
 */
(function() {
	// constants
var YU = YAHOO.util,
	CONN = YU.Connect,

	// local namespace
	_ajaxObjectHash = {},
	_ajaxObjectList = [],

	AM = YU.AjaxManager = {
		/**
		 * Fetches the AjaxObject with the provided ID.
		 * @method get
		 * @param id {String} Required. The AjaxObject ID.
		 * @static
		 */
		get: function(id) {
			return _ajaxObjectHash[id];
		},

		/**
		 * Attempts to find the AjaxObject by its last YUI request object.
		 * @method getAjaxObjectByRequest
		 * @param request {Object} Required. YUI Connection request object.
		 * @static
		 */
		getAjaxObjectByRequest: function(request) {
			return _ajaxObjectList.walk(function(ajaxObject) {
				if (ajaxObject._lastRequest && ajaxObject._lastRequest.tId === request.tId) {
					return ajaxObject;
				}
			});
		},

		/**
		 * Register the AjaxObject with the global object manager.
		 * @method register
		 * @param ajaxObject {Object} Required. The newly instantiated AjaxObject.
		 * @static
		 */
		register: function(ajaxObject) {
			var id = ajaxObject.get('rId');

			if (_ajaxObjectHash[id]) {
				throw('Mint.Util.AjaxManager is declaring a duplicate AJAX ID.');
			}
			else {
				_ajaxObjectHash[id] = ajaxObject;
				_ajaxObjectList.push(ajaxObject);
			}
		},

		/**
		 * Subscribe to global AJAX events.
		 * @method subscribe
		 * @param eventName {String} Required. The event name to subscribe to.
		 * @param callback {Function} Required. The callback function.
		 * @param scope {Object} Optional. The execution scope of callback.
		 * @static
		 */
		subscribe: function(eventName, callback, scope) {
			if (CONN[eventName]) {
				CONN[eventName].subscribe(callback, scope);
			}
		}
	};

	AM.subscribe('abortEvent', function(evt, o) {
		var ajaxObject = AM.getAjaxObjectByRequest(o[0]);
		
		if (ajaxObject && ! ajaxObject._lastRequest.doNotLog) {
			ajaxObject._lastRequest.status = -1;
			ajaxObject._handleFailure(ajaxObject._lastRequest);
		}
	});
}());

/**
 * The AjaxObject wraps AJAX requests in an object to handle the request and response.
 * @namespace YAHOO.Util
 * @class AjaxObject
 * @static
 */
(function() {
	// constants
var Y = YAHOO,
	YU = YAHOO.util,
	CONN = YU.Connect,
	LANG = Y.lang,
	YD = YU.Dom,
	YE = YU.Event,
	LOGOUT_URL = 'logout.event?' + C.PARAM_NAME_NEXT_PAGE + '=',

	// define known error codes
	ERROR_ABORTED = -1,
	ERROR_CODE_SESSION_TIMED_OUT = 1,
	ERROR_CODE_INVALID_PARAMETER = 2,
	ERROR_PAGE_NOT_FOUND = 404,

	// local variables
	_isUnloading = false,

	/**
	 * Removes invalid chunks from a string, where an invalid chunk is more than one '&' in a row, ending with '&', or '?&'.
	 * @method cleanInvalidChunks
	 * @param s {String|Object} Required. A String (usually a uri or post data) or a json object.
	 * @return {String} The String chunk-free.
	 * @private
	 */
	_cleanInvalidChunks = function(s) {
        var str = ('' + s).replace(/&+/g, '&').replace(/\?&/, '?');
		return '&' === str.charAt(str.length - 1) ? str.slice(0, -1) : str;
	},

	/**
	 * Stops the provided timer.
	 * @method _haltTimer
	 * @param timer {Object} Required. A YUI timer object.
	 * @private 
	 */
	_haltTimer = function(timer) {
		if (timer) {timer.cancel();}
	},

	/**
	 * Handles error logging.
	 * @method _logError
	 * @param name {String} Required. The error name.
	 * @param error {String} Required. The error explanation.
	 * @private
	 */
	_logError = function(name, error) {
		if (! _isUnloading) {
			Y.log(name + ": " + error);
		}
	},

	/**
	 * Sets the status to unloading, so additional requests aren't made while the page is unloading.
	 * @method _unloadingCallback
	 * @private
	 */
	_unloadingCallback = function() {_isUnloading = true;},

	/**
	 * Instantiates an AjaxObject.
	 * @param conf {Object} Optional. The configuraion object.
	 * @constructor
	 */
	_F = function(conf) {
		var cfg = {};
		LANG.augmentObject(cfg, _F.ATTR, true);
		LANG.augmentObject(cfg, conf || {}, true);
		if (! cfg.rId) {cfg.rId = 'yui-gen' + YAHOO.env._id_counter++;}
		this._cfg = cfg;
		YU.AjaxManager.register(this);
	};
	
// this prevents AJAX requests from being made after the user leaves the current page
YE.on(window, 'unload', _unloadingCallback);
YE.on(window, 'beforeunload', _unloadingCallback);

// the acceptable types of responses from the server
LANG.augmentObject(_F, {
	TYPE_JSON: 'text/json',
	TYPE_XML: 'text/xml',
	TYPE_XML_APP: 'application/xml'
});

// a constant of default configuration parameters
_F.ATTR = {
	abortOnDuplicate: true,
	argument: null,
	cache: false,
	callback: null,
	data: null,
	failure: null,
	method: 'get',
	pollTimeout: 0,
	rId: null,
	rollback: null,
	scope: null,
	timeout: 10000,
	requestDelay: 0, // note: using this timer prevents 'startRequest' from returning last request object returned by CONN.asyncRequest
	type: null,
	url: null
};

_F.prototype = {

	/**
	 * The configuration of this AjaxObject instance.
	 * @property _cfg
	 * @type {Object}
	 * @const
	 * @protected
	 */
	_cfg: {},

	/**
	 * The timeout id for the request delay timer.
	 * @property _delayTimer
	 * @type {Object}
	 * @const
	 * @protected
	 */
	_delayTimer: null,

	/**
	 * The timeout id for the request poll timer.
	 * @property _pollTimer
	 * @type {Object}
	 * @const
	 * @protected
	 */
	_pollTimer: null,

	/**
	 * The last ajax request.
	 * @property _lastRequest
	 * @type {Object}
	 * @const
	 * @protected
	 */
	_lastRequest: null,

	/**
	 * Abstract method that handles an AJAX failure.
	 * @method _handleFailure
	 * @param o {Object} Required. The Yahoo AJAX response.
	 * @protected
	 */
	_handleFailure: function(o) {
		if (_isUnloading) {return;}
		var args = o.argument,
			msg;

		switch (o.status) {
			case ERROR_CODE_SESSION_TIMED_OUT: // session timed out code
				window.location.href = LOGOUT_URL + encodeURIComponent(window.location.href);
				return;

			case ERROR_CODE_INVALID_PARAMETER: msg = o.ajaxDescription; break;
			case ERROR_PAGE_NOT_FOUND: _logError(ERROR_PAGE_NOT_FOUND, Object.toJsonString(args)); break;
			case ERROR_ABORTED: _logError('Request Aborted: ', Object.toJsonString(args)); break;
			default:
				_logError(o.status || 'unknown', Object.toJsonString(args));
				msg = 'An unknown error occurred on our servers. We recommend refreshing the page and before trying again.';
				break;
		}

		if (msg) {
			alert('Your last request failed, because:\n' + msg);
		}
		if (isType(args.failure, 'function')) {args.failure(o);}
		if (isType(args.rollback, 'function')) {args.rollback(o);}
	},

	/**
	 * Abstract method that handles an AJAX success.
	 * @method _handleSuccess
	 * @param o {Object} Required. The Yahoo AJAX response.
	 * @protected
	 */
	_handleSuccess: function(o) {
		// retrieve response values, test response type, and initialize local variables
		var args = o.argument,
			doc = (o.responseXML), // parenthesis are necessary for FF3
			txt = 'unknown' == o.responseText ? '' : o.responseText,
			hdr = (o.getResponseHeader),
			contentType = (hdr && hdr['Content-Type']) ? hdr['Content-Type'] : '',
			isJSON = LANG.isValue(txt) && (-1 !== contentType.indexOf(_F.TYPE_JSON)),
			isXML = LANG.isValue(doc) && (-1 !== contentType.indexOf(_F.TYPE_XML) || -1 !== contentType.indexOf(_F.TYPE_XML_APP)),
			response = null,
			error = null;

		// this is an XML response, retrieve nodes
		if (isXML) {
			response = doc.getElementsByTagName('response')[0];
			error = doc.getElementsByTagName('error')[0];
		}
		// this is a JSON response, convert to JSON
		else if (isJSON) {
			response = LANG.JSON.parse(o.responseText);
		}
		// this is an unknown response, assume error
		else {
			error = txt || 'unknown error';

			// better error message on AJAX failure
			if (-1 < error.indexOf('Page Not Found')) {
				error = args.method + ' request failed: ' + args.uri;
			}
		}

		o.response = response;

		// response has error
		if (error) {
			var code = '',
				desc = '';

			// process XML error
			if (isXML) {
				code = YD.getContentAsString(error.getElementsByTagName('code')[0]);

				if (code) {
					desc = YD.getContentAsString(error.getElementsByTagName('description')[0]);
				}
				else {
					desc = YD.getContentAsString(error);
				}
			}
			// process general error
			else {
				desc = error;
			}

			o.status = code;
			o.ajaxDescription = desc;
			this._handleFailure(o);
		}
		// successful response
		else if (response) {
			o.argument = args.argument;
			if (this.processResults.call(args.scope, o) && args.pollTimeout) {
				this._pollTimer = LANG.later(args.pollTimeout, this, function() {
					this.startRequest(args);
				});
			}
		}
	},

	/**
	 * Aborts the request.
	 * @method abort
	 * @param doNotLog {Boolean} Optional. Do not log this abort.
	 * @public
	 */
	abort: function(doNotLog) {
		if (this._lastRequest) {
			_haltTimer(this._delayTimer);
			_haltTimer(this._pollTimer);
			this._lastRequest.doNotLog = doNotLog;
			CONN.abort(this._lastRequest);
		}
	},

	/**
	 * Fetches a configuration value.
	 * @method get
	 * @return {String} A configuration value.
	 * @public
	 */
	get: function(key) {
		return this._cfg[key];
	},

	/**
	 * Abstract method that will be overwritten by the callback passed into the constructor.
	 * @method processResults
	 * @param o {Object} Required. The Yahoo AJAX response.
	 * @public
	 */
	processResults: function(o) {},

	/**
	 * Initiates the AJAX request.
	 * @method startRequest
	 * @param conf {Object} Required. Overloading configuration object.
	 * @public
	 */
	startRequest: function(conf) {
		var cfg = {}, str, url, _this = this, fx;

		LANG.augmentObject(cfg, _this._cfg, true);
		LANG.augmentObject(cfg, conf || {}, true);
		if (! cfg.url) {throw('Your AjaxObject.startRequest is missing a URL.');}
		if (LANG.isFunction(cfg.callback)) {_this.processResults = cfg.callback;}
		url = cfg.url;

		// data is an array, join it (expects "key=value")
		if (LANG.isArray(cfg.data)) {
			str = cfg.data.join('&');
		}
		// data is an object, join it (expects "key:value")
		else if (LANG.isObject(cfg.data)) {
			str = Object.toQueryString(cfg.data);
		}
		// data is a string, just sent it
		else {
			str = (cfg.data ? '' + cfg.data : '');
		}

		// GET requests need the data appended to the URL
		if ('get' === cfg.method) {
			if (-1 === url.indexOf('?')) {url += '?';}
			url += str;
		}
		else {
			cfg.data = str;
		}

		// abort any outstanding previous requests when a new one is made
		if (cfg.abortOnDuplicate) {_this.abort(true);}
		
		fx = function() {
			// actually send the request
			_this._lastRequest = CONN.asyncRequest(cfg.method, _cleanInvalidChunks(url), {
				abort: _this._handleFailure,
				argument: cfg,
				cache: cfg.cache,
				failure: _this._handleFailure,
				scope: _this,
				success: _this._handleSuccess,
				timeout: cfg.timeout
			}, cfg.data);

			_this._lastRequest.argument = cfg; // required for global callbacks.
			return _this._lastRequest;
		};

		if (cfg.requestDelay) {
			_this._delayTimer = LANG.later(cfg.requestDelay, _this, fx);
		}
		else {
			return fx();
		}
	},

	/**
	 * Updates a configuration value.
	 * @method set
	 * @param key {String} Required. The key to update.
	 * @param value {String} Required. The value to update to.
	 * @public
	 */
	set: function(key, value) {
		this._cfg[key] = value;
	}
};

YU.AjaxObject = _F;

}());