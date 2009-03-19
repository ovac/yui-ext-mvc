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
        _idCache = {};

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
	var R = {

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
			var doc = (data.responseXML), // parens are necessary for FF3
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
            // configure request object; will be placed into the YUIObject.argument value
            var cfg = _YL.isObject(cb) ? cb : {};
            if (_YL.isFunction(cb)) {cfg.success = cb;}
            if (! _YL.isString(cfg.requestId)) {cfg.requestId = 'ajaxRequest' + Number.getUnique();}
            if (_YL.isFunction(cfg.success)) { // defining success at calltime
                _that.registerAjaxCallback(cfg.requestId, cfg.type, cfg.success, cfg.failure);
            }
            if (! _YL.isObject(cfg.scope)) {cfg.scope = _that;}
            if (! _YL.isNumber(cfg.timeout)) {cfg.scope = _DEFAULT_TIMEOUT;}
            if (_YL.isDefined(cfg.argument)) {
                if (args) {cfg.argument = [cfg.argument, args];} // arguments defined twice; attempt to correct
            }
            else {
                cfg.argument = args;
            }

            // this request has callbacks
            if (_idCache[cfg.requestId]) {
                cfg.failure = _idCache[cfg.requestId].failure;
                cfg.success = _idCache[cfg.requestId].success;
                cfg.type = _idCache[cfg.requestId].type;
                cfg.url = url;
                if (data) {cfg.url += '?' + data;}
            }
            else {
                // todo: this should be logged as a warning - no success or failure callback defined for requestId
            }
            
			_YUC.asyncRequest(m, url, {argument: cfg, timeout: cfg.timeout}, data);
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

        R.send('post' === functionName ? 'POST' : 'GET', url, cb, a, qData);
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
		 * Make an asynchronous GET requests.
		 * @method get
		 * @param url {String} Required. The request URL w/ query parameters.
		 * @param cb {Object|Function} Optional. The YUI callback object or success callback function.
		 * @param a {Object} Optional. The argument object.
		 * @static
		 */
		get: function(url, cb, a) {
            if (! _YL.isString(url)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'Core.Controller', 'get', 'String', url);}
			R.send('GET', url, cb, a, null);
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
         * @param sfx {Function} Required. The success callback function.
         * @param ffx {Function} Optional. The failure callback function.
         * @static
         */
        registerAjaxCallback: function(rId, type, sfx, ffx) {
            if (! (_YL.isString(rId) && _YL.isFunction(sfx))) {return null;}
            if (_YL.isDefined(ffx) && ! _YL.isFunction(ffx)) {ffx = null;}
            _idCache[rId] = {failure: ffx, success: sfx, type: _getValidType(type)};
        }
	};


	_that = new _F();
//
//	// Subscribe to all custom events fired by Connection Manager.
//	_YUC.startEvent.subscribe(evt.onStart, _that);
	_YUC.completeEvent.subscribe(R.onComplete, _that);

	// This event will not fire for file upload transactions.  Instead,
	// subscribe to the uploadEvent.
	_YUC.successEvent.subscribe(R.onSuccess, _that);

	// This event will not fire for file upload transactions.  Instead,
	// subscribe to the uploadEvent.
	_YUC.failureEvent.subscribe(R.onFailure, _that);

	// This event is fired only for file upload transactions in place of
	// successEvent and failureEvent
	_YUC.uploadEvent.subscribe(R.onUpload, _that);
	_YUC.abortEvent.subscribe(R.onAbort, _that);

    return _that;
})();