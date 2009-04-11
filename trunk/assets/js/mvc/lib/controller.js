/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Controller class handles communication between JavaScript services, other media, and the server.
 * @namespace Core
 * @class Controller
 * @static
 */
Core.Controller = (function() {
    // constants
    var _DEFAULT_TIMEOUT = 30000,
        _ED = Core.Util.EventDispatcher,
        _YD = YAHOO.util.Dom,
        _YL = YAHOO.lang,
		_YUC = YAHOO.util.Connect;


	// local namespace
	var _F = function () {},
		_that = null,
        _registeredConfigurationMap = {};

    /**
     * Asserts that the current type is the same as the static type and that isType evaluates to true.
     * @method _assertType
     * @param type {String} Required. The expected response type.
     * @param sType {String} Required. The static type to compare to.
     * @param isType {Boolean} Required. The found response type.
     * @private
     */
    var _assertType = function(type, sType, isType) {
        if (isType && type !== sType) {
            _YL.throwError('Assertion Failed - type="' + type + '" does not equal staticType="' + sType + '"');
        }
    };

	/**
	 * Updates the configuration object to the right value: call-time configuration, then cached, then default.
	 * @method _configureRequest
	 * @param vFx {String} Required. The YAHOO.lang validation function name.
	 * @param cfg {Object} Required. The current configuration object.
	 * @param cached {Object} Required. The cached configuration object.
	 * @param key {String} Required. The key on the configuration object.
	 * @param dflt {Object} Requried. The default value.
	 * @private
	 */
	var _configureRequest = function(vFx, cfg, cached, key, dflt) {
		if (! _YL[vFx](cfg[key])) {
			cfg[key] = _YL[vFx](cached[key]) ? cached[key] : dflt;
		}
	};

    /**
     * Evaluates if the provided type is valid.
     * @method _getValidType
     * @param type {String} Required. The type to evaluate.
     * @private
     */
    var _getValidType = function(type) {
        return (_YL.isString(type) && (_that.TYPE_TEXT === type || _that.TYPE_JSON === type || _that.TYPE_XML === type)) ? type : _that.TYPE_UNKNOWN;
    };


	// dom namespace
	var _D = {
		body: _YD.getBodyElement(),
		layer: _YD.get('layer'),
        search: 'query'
    };


	// event namespace
	var _E = {

	};


	// request namespace
	var _R = {

		/**
		 * _YUC callback function for aborted transactions.
		 * @method onAbort
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onAbort: function(eventType, YUIObj) {
			// todo: log error
		},

		/**
		 * _YUC callback function for complete transactions.
		 * @method onComplete
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onComplete: function(eventType, YUIObj) {
			// todo: stop showing the AJAX loading effect
		},


		/**
		 * _YUC callback function for failed transactions.
		 * @method onFailure
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onFailure: function(eventType, YUIObj) {
			var data = YUIObj[0],
                cfg = data.argument;

            if (_YL.isFunction(cfg.failure)) {
                cfg.failure.call(this, data, cfg);
            }
		},

		/**
		 * _YUC callback function before starting transactions.
		 * @method onStart
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onStart: function(eventType, YUIObj) {
			// todo: start showing the AJAX loading effect
		},

		/**
		 * _YUC callback function for successful transactions.
		 * @method onSuccess
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onSuccess: function(eventType, YUIObj) {
			var data = YUIObj[0],
                cfg = data.argument;

			// retrieve response values, test response type, and initialize local variables
			var doc = (data.responseXML), // parens are necessary for certain browsers
				txt = (data.responseText),
				hdr = (data.getResponseHeader),
				contentType = (hdr && hdr['Content-Type']) ? hdr['Content-Type'] : '',
				isJSON = _YL.isDefined(txt) && (contentType.has(_that.TYPE_JSON, 'application/json') || '{' === txt.charAt(0)),
				isXML = _YL.isDefined(doc) && contentType.has(_that.TYPE_XML, 'application/xml'),
                type = cfg.type,
                response = null;

            _assertType(type, _that.TYPE_JSON, isJSON);
            _assertType(type, _that.TYPE_XML, isXML);

            // is this a JSON response?
            if (isJSON) {
                response = txt.toJsonObject();
            }
            // is this an XML repsonse?
            else if (isXML) {
                response = doc;
            }
            // default to text
            else {
                response = txt;
            }

            if (_YL.isFunction(cfg.success)) {
				_registeredConfigurationMap[cfg.requestId].isSending = false;
				_registeredConfigurationMap[cfg.requestId].response = response;
                cfg.success.call(this, response, cfg.argument, cfg);
            }
		},

		/**
		 * _YUC callback function for uploaded transactions.
		 * @method onUpload
		 * @param eventType {String} Required. The YUI event name.
		 * @param YUIObj {Object} Required. The YUI wrapped response.
		 * @private
		 */
		onUpload: function() {
			// do nothing for now
		},

		/**
		 * Make an asynchronous requests.
		 * @method send
		 * @param m {String} Required. The request method.
		 * @param url {String} Required. The request URL.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
		 * @param args {Object} Optional. The argument object.
		 * @param data {String} Optional. The post data as a query string.
		 * @public
		 */
		send: function(m, url, cb, args, data) {
            var cfg = _YL.isObject(cb) ? cb : {},
				cachedCfg = _registeredConfigurationMap[cfg.requestId] || {};

            // configure request object; will be placed into the YUIObject.argument value
            if (_YL.isFunction(cb)) {cfg.success = cb;} // the callback object is a success function
            if (! _YL.isString(cfg.requestId)) {cfg.requestId = 'ajaxRequest' + _YL.getUniqueId();}
            if (! cachedCfg.success) { // success function declares at call-time; register it
                _that.registerAjaxCallback(cfg.requestId, cfg.type, cfg.success, cfg.failure);
				cachedCfg = _registeredConfigurationMap[cfg.requestId];
            }
			
			_configureRequest('isFunction', cfg, cachedCfg, 'failure', Core.emptyFunction);
			_configureRequest('isFunction', cfg, cachedCfg, 'success', Core.emptyFunction);
			_configureRequest('isObject', cfg, cachedCfg, 'scope', _that);
			_configureRequest('isNumber', cfg, cachedCfg, 'timeout', _DEFAULT_TIMEOUT);
			_configureRequest('isString', cfg, cachedCfg, 'type', _that.TYPE_UNKNOWN);
			_configureRequest('isDefined', cfg, cachedCfg, 'argument', args);

			if (url) {
				cfg.url = url;
				if (data) {cfg.url += '?' + data;}
			}

			_registeredConfigurationMap[cfg.requestId].isSending = true;
			_registeredConfigurationMap[cfg.requestId].response = null;
			_registeredConfigurationMap[cfg.requestId].url = cfg.url;

			_YUC.asyncRequest(m, url || cfg.url, {argument: cfg, timeout: cfg.timeout}, data);
		}
	};

    /**
     * Inner function to handle 'post' and 'pget' requests as they need the same validation.
     * @method _postGet
     * @param functionName {String} Required. The function that called this method.
     * @param url {String} Required. The request URL w/ query parameters.
     * @param data {String|Array} Required. The post data as a query string or array of key/value pairs.
     * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
     * @param a {Object} Optional. The argument object.
     * @private
     */
    var _postGet = function(functionName, url, data, cb, a) {
        var qData = _YL.isString(data) ? data : '';

        if (_YL.isArray(data)) {
            qData = data.join('&');
        }

        if (! _YL.isString(url)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'Core.Controller', functionName, 'String', url);}
        if (! qData) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'Core.Controller', functionName, 'String', data);}

        _R.send('post' === functionName ? 'POST' : 'GET', url, cb, a, qData);
    };


	// public namespace
	_F.prototype = {

        /**
         * The JSON type definition.
         * @property TYPE_JSON
         * @type {String}
         * @static
         * @final
         * @readonly Do not change this variable.
         */
        TYPE_JSON: 'text/json',

        /**
         * The text type definition.
         * @property TYPE_TEXT
         * @type {String}
         * @static
         * @final
         * @readonly Do not change this variable.
         */
        TYPE_TEXT: 'text/text',

        /**
         * The xml type definition.
         * @property TYPE_XML
         * @type {String}
         * @static
         * @final
         * @readonly Do not change this variable.
         */
        TYPE_XML: 'text/xml',

        /**
         * The unknown type definition.
         * @property TYPE_UNKNOWN
         * @type {String}
         * @static
         * @final
         * @readonly Do not change this variable.
         */
        TYPE_UNKNOWN: '',

		/**
		 * Command pattern method for fetching data from the backend.
		 * @method call
         * @param rId {String} Required. The id of the request.
		 * @param fx {String} Required. The callback function.
		 * @param url {String} Required. The request URL w/ query parameters; only use this for requests with dynamic variables.
		 * @static
		 */
		call: function(rId, fx, url) {
			var cfg = _registeredConfigurationMap[rId];

			if (! cfg) {
				_YL.throwError('Core.Controlller.call - the provided requestId=' + rId + ' is not yet registered');
			}

			var callback = _YL.isFunction(fx) ? fx : cfg.success; // execute provided function, default to success function

			// data is cached, go ahead an immediately execute the callback function
			if (cfg.response) {
				callback.call(this, cfg.response, cfg.argument, cfg);
			}
			// data is invalid or is being requested
			else {
				// date is not yet being fetched, fetch it
				if (! cfg.isSending) {
					_R.send('get', url || cfg.url, cfg);
				}

				// a new callback was provided; Wait until until the request has finished to execute.
				if (callback === fx) {
					_YL.callLazy(function() {
						_that.call(rId, fx, url);
					}, function() {return ! _registeredConfigurationMap[rId].isSending;});
				}
			}
		},

		/**
		 * Make an asynchronous GET requests.
		 * @method get
		 * @param url {String} Required. The request URL w/ query parameters.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
		 * @param a {Object} Optional. The argument object.
		 * @static
		 */
		get: function(url, cb, a) {
            if (! _YL.isString(url)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'Core.Controller', 'get', 'String', url);}
			_R.send('GET', url, cb, a, null);
		},

		/**
		 * Invalidates an object, so the next time it is requested, it is retrieved from the server.
		 * @method invalidate
         * @param rId {String} Required. The id of the request.
		 * @static
		 */
		invalidate: function(rId) {
			if (_registeredConfigurationMap[rId]) {
				_registeredConfigurationMap[rId].response = null;
			}
		},

		/**
		 * Make an asynchronous GET requests.
		 * @method pget
		 * @param url {String} Required. The request URL w/ query parameters.
		 * @param data {String|Array} Required. The query string or an array of query parameters, needing to be separated by '&'.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
		 * @param a {Object} Optional. The argument object.
		 * @static
		 */
		pget: function(url, data, cb, a) {
            _postGet('pget', url, data, cb, a);
		},

		/**
		 * Make an asynchronous POST requests.
		 * @method post
		 * @param url {String} Required. The request URL.
		 * @param data {String|Array} Required. The query string or an array of query parameters, needing to be separated by '&'.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
		 * @param a {Object} Optional. The argument object.
		 * @static
		 */
		post: function(url, data, cb, a) {
            _postGet('post', url, data, cb, a);
		},

        /**
         * Registers the provided function to execute when an AJAX request returns of the provided type and id.
         * @method registerAjaxCallback
         * @param rId {String} Required. The id of the request.
         * @param type {String} Required. The type of response expected.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
         * @static
         */
        registerAjaxCallback: function(rId, type, cb) {
            if (! _YL.isString(rId)) {return null;}
			var callback = _YL.isObject(cb) ? cb : {};
			if (_YL.isFunction(cb)) {callback.success = cb;}
			if (! _YL.isFunction(callback.success)) {callback.success = Core.emptyFunction;} // this request has no static callback
			callback.type = _getValidType(type);
			callback.requestId = rId;
            _registeredConfigurationMap[rId] = callback;
        }
	};


	_that = new _F();
//
//	// Subscribe to all custom events fired by Connection Manager.
//	_YUC.startEvent.subscribe(evt.onStart, _that);
	_YUC.completeEvent.subscribe(_R.onComplete, _that);

	// This event will not fire for file upload transactions.  Instead,
	// subscribe to the uploadEvent.
	_YUC.successEvent.subscribe(_R.onSuccess, _that);

	// This event will not fire for file upload transactions.  Instead,
	// subscribe to the uploadEvent.
	_YUC.failureEvent.subscribe(_R.onFailure, _that);

	// This event is fired only for file upload transactions in place of
	// successEvent and failureEvent
	_YUC.uploadEvent.subscribe(_R.onUpload, _that);
	_YUC.abortEvent.subscribe(_R.onAbort, _that);

    return _that;
})();