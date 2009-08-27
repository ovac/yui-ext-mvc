/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Core object manages the MVC architecture of the pages and namespacing.
 * @module mvc
 */

/**
 * This file setups the Core MVC namespace.
 * @class Core
 * @static
 */
(function() {
	// constants
var _LOG_LEVEL = { // the log severity level constants, used to determine if a debug statmenet should be logged or not
		ALL: 1, // developer environments
		DEBUG: 2,
		INFO: 3, // production environments should be set to 3 or higher
		WARN: 4,
		SEVERE: 5
	},
	WL = window.location,

    // local namespace
	_logLevel = _LOG_LEVEL.INFO;

    // static namespace
    window.Core = {

		/**
		 * The current project version #.
		 * @property Version
		 * @type String
		 * @static
		 * @final
		 */
		VERSION: '1.0',

        /**
         * The controller namespace.
         * @property Controller
         * @type Object
		 * @static
         */
        Controller: {},

        /**
         * Object namespace placeholder for attaching global constants; inner Function to create Client Singleton.
         * @property Constants
         * @type Object
		 * @static
         */
        Constants: {},

        /**
         * The model object namespace.
         * @property Model
         * @type Object
         */
        Model: {},

        /**
         * The utility namespaces.
         * @property Util
         * @type Object
		 * @static
         */
        Util: {},

        /**
         * The widget namespaces.
         * @property Widget
         * @type Object
		 * @static
         */
        Widget: {},

        /**
         * The view object namespace.
         * @property View
         * @type Object
		 * @static
         */
        View: {},

        /**
         * This is a generic method to use instead of an anonymous function, allows for better debugging.
         * @method emptyFunction
         * @static
         */
        emptyFunction: function() {
            var args = arguments,
				pause = '';
        },

		/**
		 * Returns the log level of the application.
		 * @method getLogLevel
		 * @return {Number} The current log level.
		 * @static
		 */
		getLogLevel: function() {return _logLevel;},

        /**
		 * Retrieves the hash from the location object; ensures is a string.
		 * @method getHash
		 * @return {String} The page hash.
		 * @static
		 */
        getHash: function() {
            return ('' + WL.hash);
        },

        /**
		 * Retrieves the host from the location object; ensures is a string.
		 * @method getHost
		 * @return {String} The page host.
		 * @static
		 */
        getHost: function() {
            return ('' + WL.host);
        },

        /**
		 * Retrieves the page name from the URL.
		 * @method getPageName
		 * @return {String} The page name.
		 * @static
		 */
		getPageName: function() {
			return Core.getUrl().replace(/.*\/(.*)(\.|\?|\/).*/, '$1');
		},

        /**
		 * Retrieves the port from the location object; ensures is a string.
		 * @method getPort
		 * @return {String} The page port.
		 * @static
		 */
        getPort: function() {
            return ('' + WL.port);
        },

        /**
		 * Retrieves the protocol from the location object; ensures is a string.
		 * @method getProtocol
		 * @return {String} The page protocol.
		 * @static
		 */
        getProtocol: function() {
            return ('' + WL.protocol);
        },

        /**
		 * Retrieves the search from the location object; ensures is a string.
		 * @method getSearch
		 * @return {String} The page query string.
		 * @static
		 */
        getSearch: function() {
            return ('' + WL.search);
        },

		/**
		 * Retrieves the value of XSRF token from the DOM, or throws an exception when not found.
		 * @method getToken
		 * @return {String} The XSRF token.
		 * @static
		 */
		getToken: function() {
			var token = YAHOO.util.Dom.get('javascript-token').value;

			if (! token) {
				throw ('Token Node requested before DOM INPUT node "javascript-token" was made available.');
			}

			Core.getToken = function() {
				return token;
			};

			return Core.getToken();
		},

        /**
		 * Retrieves the URL from the location object; ensures is a string.
		 * @method getUrl
		 * @return {String} The page URL.
		 * @static
		 */
        getUrl: function() {
            return ('' + WL.href);
        },

		/**
		 * Sets the log level of the application.
		 * @method setLogLevel
		 * @param lvl {Number} Required. The new log level.
		 * @static
		 */
		setLogLevel: function(lvl) {_logLevel = lvl;},

        /**
         * Refreshes the page by calling window.location.reload.
         * @method reload
         * @static
         */
        reload: function() {
            WL.reload();
        },

        /**
         * Replaces the page by calling window.location.replace(DOMString URL); does not call create a browser history node.
         * @method replace
         * @param url {String} Optional. The URL.
         * @static
         */
        replace: function(url) {
            if (! url) {url = WL.href;}
            WL.replace('' + url);
        }
    };
}());