/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Core object manages the MVC architecture of the pages and namespacing.
 * @module mvc
 * @class Core
 * @dependencies YAHOO.lang, YAHOO.util.event, YAHOO.util.dom, YAHOO.util.connection
 * @static
 */
(function() {
    // the log severity level constants, used to determine if a debug statmenet should be logged or not
    var _LOG_LEVEL = {
		ALL: 1, // developer environments
		DEBUG: 2,
		INFO: 3, // production environments should be set to 3 or higher
		WARN: 4,
		SEVERE: 5
    };

    // private namespace
	var _logLevel = _LOG_LEVEL.INFO,
        _WL = window.location;

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
         * The view object namespace.
         * @property View
         * @type Object
		 * @static
         */
        View: {},

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
            return ('' + _WL.hash);
        },

        /**
		 * Retrieves the host from the location object; ensures is a string.
		 * @method getHost
		 * @return {String} The page host.
		 * @static
		 */
        getHost: function() {
            return ('' + _WL.host);
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
            return ('' + _WL.port);
        },

        /**
		 * Retrieves the protocol from the location object; ensures is a string.
		 * @method getProtocol
		 * @return {String} The page protocol.
		 * @static
		 */
        getProtocol: function() {
            return ('' + _WL.protocol);
        },

        /**
		 * Retrieves the search from the location object; ensures is a string.
		 * @method getSearch
		 * @return {String} The page query string.
		 * @static
		 */
        getSearch: function() {
            return ('' + _WL.search);
        },

		/**
		 * Retrieves the value of XSRF token from the DOM, or throws an exception when not found.
		 * @method getToken
		 * @return {String} The XSRF token.
		 * @static
		 */
		getToken: function() {
			var token = YAHOO.util.Form.Element.getValue('javascript-token');

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
            return ('' + _WL.href);
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
            _WL.reload();
        },

        /**
         * Replaces the page by calling window.location.replace(DOMString URL); does not call create a browser history node.
         * @method replace
         * @param url {String} Optional. The URL.
         * @static
         */
        replace: function(url) {
            if (! url) {url = window.location.href;}
            _WL.replace('' + url);
        }
    };
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.00
 */

/**
 * The console pacakge extends the "mvc/core.js" package with additional console logging capabilities. This package
 *  first attempts to use the FireBug console logger, and then, when that is not available will open a new browser window
 *  and log there.
 * @class Core
 * @dependencies YAHOO.lang, YAHOO.util.dom, mvc/core.js
 * @static
 */
(function() {
    var _YD = YAHOO.util.Dom,
        _YL = YAHOO.lang;

    var _consoleBody,
        _consoleDoc,
        _consoleObject = {},
        _consoleWindow,
        _countTimerMap = {},
        _countNameMap = {},
        _nextLogType = null,
        _timeNameMap = {};

    var _HTML = '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title>Mint Console Logger</title><style type="text/css">p{margin:0; padding: 0.25em;}div.log{font-family: console, arial, san-serif; font-size: 12px; border: 1px solid #EEE;color: #333; margin: 0; padding: 0.25em;}span.label{color:#009; font-weight:bold; padding-right: 0.25em;}</style></head><body><div>&nbsp;</div></body></html>';

    /**
     * Prepends the time onto the message.
     * @method _prependTime
     * @param message {String} Required. The value to prepend.
     * @private
     */
    var _prependTime = function(message) {
        return ('@' + (new Date()).formatTime() + ': ') + message;
    };

    /**
     * Evaluates if the FireBug console object is available.
     * @method _hasConsole
     * @return {Boolean} The console exists.
     * @private
     */
    var _hasConsole = function() {
        return window.console && window.console.firebug;
    };

    /**
     * Create a new one and pointers to interal document.
     * @method _setWindow
     * @private
     */
    var _setWindow = function() {
        if (! _consoleWindow) {
            _consoleWindow = window.open("","_consoleWindow","width=500,height=300,scrollbars=1,resizable=1");
            _consoleDoc = _consoleWindow.window.document;
            _consoleDoc.open();
            _consoleDoc.write(_HTML);
            _consoleDoc.close();
        }

        if (! _consoleBody) {
            _consoleBody = _YD.getBodyElement(_consoleDoc);
        }

        return (_consoleWindow && _consoleBody && _consoleDoc);
    };

    /**
     * Inserts a log statement into the logging window.
     * @method _log
     * @param message {String} Required. The message.
     * @param objectX {Object} Optional. Objects to substitue in message.
     * @private
     */
    var _log = function(message, objectX) {
        var args = arguments;

        _YL.callLazy(function() {
            var p = _consoleBody.insertBefore(_consoleDoc.createElement('div'), _YD.getFirstChild(_consoleBody)),
                j = args.length;

            message = _prependTime(message);
            p.className = 'log';

            if (_nextLogType) {
                var color = '#333',
                    symbol = '';

                switch (_nextLogType) {
                    case 'error':
                        color = '#900';
                        symbol = '(X)';
                    break;

                    case 'info':
                        symbol = '(i)';
                    break;

                    case 'warn':
                        _YD.setStyle(p, 'backgroundColor', '#0FF');
                        symbol = '(!)';
                    break;

                    default: // do nothing
                }

                _YD.setStyle(p, 'color', color);

                if (symbol) {
                    message = '<strong>' + symbol + ' </strong>' + message;
                }

                _nextLogType = null;
            }

            for (var i = 1; i < j; i += 1) {
                var arg = args[i], rx;

                if (_YL.isString(arg)) {
                    rx = /\%s/;
                }
                else if (_YL.isNumber(arg)) {
                    if (parseInt(arg) === arg) {
                        rx = /\%d|\%i/;
                    }
                    else {
                        rx = /\%f/;
                    }
                }
                else {
                    rx = /\%o/;
                }

                message = message.replace(rx, arg);
            }

            _YD.replace(p, message);
        }, _setWindow);
    };

    /**
     * Fetches the console object for logging; emulates console in non-FF browsers.
     * @method getConsole
     * @return {Object} The console object.
     * @static
     */
    Core.getConsole = function() {
        if (_hasConsole()) {
            /*
                note: the FireBug implementation of string substitution patterns does not check type, it simply
                    finds the first instance of a substitution pattern and replaces it with the agument in that position.
                    this means that console.log('test - %d %s', 's1', 's2') will produce the message "test - s1 s2" not "test - %d s1"
             */

			_consoleObject = window.console;
        }
        else {

            _YL.augmentObject(_consoleObject, {

                /**
                 * Tests an expression, inserting an error message, when false.
                 * @method assert
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                assert: function(message, objectX, fileName, lineNumber) {
                    var args = arguments;

                    if (! args[0]) {
                        args[0] = 'assertion <span class="label">false</span>';
                        _consoleObject.error.apply(this, args);
                    }
                },

                /**
                 * Writes the number of times that the line of code where count was called was executed.
                 * @method count
                 * @param name {String} Required. The name of this event.
                 * @param fileName {String} Required. The JavaScript filename.
                 * @param lineNumber {Number} Required. The line number.
                 * @public
                 */
                count: function(name, fileName, lineNumber) {
                    if (! _countNameMap[name]) {_countNameMap[name] = 0;}
                    _countNameMap[name] += 1;

                    // attempt to emulate the count logic logging that fires after codeblock is done in FireBug
                    clearTimeout(_countTimerMap[name]);
                    _countTimerMap[name] = setTimeout(function() {
                        _consoleObject.debug.call(this, '%s %i', name, _countNameMap[name], fileName, lineNumber);
                    }, 1000);
                },

                /**
                 * Inserts a debug statement into the logging window with a line number.
                 * @method debug
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                debug: function(message, objectX, fileName, lineNumber) {
                    var args = arguments;
                    args[0] += '; %s (line %d)';
                    _log.apply(this, args);
                },

                /**
                 * Prints a listing of all properties of the object.
                 * @method dir
                 * @param o {Object} Required. The evaluation object.
                 * @public
                 */
                dir: function(o) {
                    var sb = [];

                    for (var k in o) {
                        var obj = o[k],
                            s = '<p><span class="label">' + k + '</span>';

                        if (_YL.isFunction(obj)) {
                            s += 'function()';
                        }
                        else if (_YL.isObject(obj)) {
                            s += 'Object';
                        }
                        else if (_YL.isArray(obj)) {
                            s += 'Array';
                        }
                        else if (_YL.isString(obj)) {
                            s += '"' + obj + '"';
                        }
                        else if (_YL.isNumber(obj)) {
                            s += obj;
                        }
                        else if (_YL.isUndefined(obj)) {
                            s += 'Undefined';
                        }
                        else if (_YL.isNull(obj)) {
                            s += 'Null';
                        }
                        else if (_YL.isDate(obj)) {
                            s += obj.formatTime();
                        }

                        s += '</p>';
                        sb.push(s);
                    }

                    // sorts the functions to the end, everything else alphabetically
                    sb.sort(function(a, b) {
                        var aIsFunction = -1 < a.indexOf('function()');
                        var bIsFunction = -1 < b.indexOf('function()');

                        if (aIsFunction && ! bIsFunction) {
                            return 1;
                        }
                        else if (bIsFunction && ! aIsFunction) {
                            return -1;
                        }
                        // sort alpha
                        else {
                            var rx = /.*?\"\>(.*)?\<\/span\>.*/,
                                nameA = a.replace(rx, '$1'),
                                temp = [nameA, b.replace(rx, '$1')];

                            temp.sort();
                            return nameA === temp[0] ? -1 : 1;
                        }
                    });

                    _log(sb.join(''));
                },

                /**
                 * Prints the XML source tree of an HTML or XML element.
                 * @method dirxml
                 * @param node {Element} Required. The evaluation element.
                 * @public
                 */
                dirxml: function(node) {
                    // todo: implement
                },

                /**
                 * Inserts an error statement into the logging window with a line number.
                 * @method error
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                error: function(message, objectX, fileName, lineNumber) {
                    _nextLogType = 'error';
                    _consoleObject.debug.apply(this, arguments);
                },

                /**
                 * Writes a message to the console and opens a nested block to indent all future messages sent to the console; filename and linenumber required.
                 * @method group
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                group: function(message, objectX, fileName, lineNumber) {
                    // todo: implement
                },

                /**
                 * Closes the most recently opened block created by a call to console.group.
                 * @method groupEnd
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                groupEnd: function(message, objectX, fileName, lineNumber) {
                    // todo: implement
                },

                /**
                 * Inserts an info statement into the logging window with a line number.
                 * @method info
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                info: function(message, objectX, fileName, lineNumber) {
                    _nextLogType = 'info';
                    _consoleObject.debug.apply(this, arguments);
                },

                /**
                 * Inserts a log statement into the logging window.
                 * @method log
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @public
                 */
                log: _log,

                /**
                 * Prevents the profile call from throwing an exception in non-FireBug enabled browsers.
                 * @method profile
                 * @public
                 */
                profile: function() {
                    _log('profile unimplemented');
                },

                /**
                 * Prevents the profileEnd call from throwing an exception in non-FireBug enabled browsers.
                 * @method profileEnd
                 * @public
                 */
                profileEnd: function() {
                    _log('profileEnd unimplemented');
                },

                /**
                 * Creates a new timer under the given name. Call console.timeEnd(name) with the same name to stop the timer and print the time elapsed.
                 * @method time
                 * @param name {String} Required. The name of this event.
                 * @public
                 */
                time: function(name) {
                    _timeNameMap['' + name] = new Date();
                },

                /**
                 * Stops a timer created by a call to console.time(name) and writes the time elapsed.
                 * @method timeEnd
                 * @param name {String} Required. The name of this event.
                 * @param fileName {String} Required. The JavaScript filename.
                 * @param lineNumber {Number} Required. The line number.
                 * @public
                 */
                timeEnd: function(name) {
                    if (_timeNameMap['' + name]) {
                        var args = arguments;
                        args[0] = name + ': ' + Date.diff(null, _timeNameMap['' + name], Date.MILLISECOND) + 'ms';
                        _consoleObject.debug.apply(this, args);
                    }
                },

                /**
                 * Prevents the trace call from throwing an exception in non-FireBug enabled browsers.
                 * @method trace
                 * @public
                 */
                trace: function() {
                    _log('Trace unimplemented');
                },

                /**
                 * Inserts a warn statement into the logging window with a line number.
                 * @method warn
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                warn: function() {
                    _nextLogType = 'warn';
                    _consoleObject.debug.apply(this, arguments);
                }
            });
        }

        Core.getConsole = function() {return _consoleObject;};
        return _consoleObject;
    };
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The EventDispatcher class dispatches events for an entire page, using .
 * @namespace Core.Util
 * @class EventDispatcher
 * @dependencies yahoo-dom-event.js
 * @static
 */
Core.Util.EventDispatcher = (function() {
    // local variables
    var _callbackMap = {},
        _DOC = document,
        _F = function() {},
        _rx = /\bcom_\w+\b/g,
        _that = null,
        _YE = YAHOO.util.Event;

    // event namespace
    var _E = {

        /**
         * The generic event dispatcher callback; passes these parameters into callback(event, targetNode, flattenedArguments...).
         * @method dispatcher
         * @param e {Event} Required. The triggered JavaScript event.
         * @private
         */
        dispatcher: function(e) {
            var node = _YE.getTarget(e);

            // simulate bubbling
            while (node && node !== _DOC) {
                var coms = node.className.match(_rx);

                // not matched
                if (null === coms) {
                    // not found, do nothing for now
                }
                // command class exists
                else {
                    var i = 0, j = 0;

                    // iterate on matching commands
                    for (; i < coms.length; i += 1) {
                        var id = coms[i].replace(/com_/, ''),
                            carr = _callbackMap[e.type][id];

                        // object for command exists, command could be for another event
                        if (carr && carr.length) {
                            // iterate on command callbacks
                            for (j = 0; j < carr.length; j += 1) {
                                var o = carr[j],
                                    args = [e, node];

                                if (o.eventFx) {o.eventFx.call(_YE, e);} // event stop events
                                o.callback.apply(o.scope, args.concat(o.arguments));
                            }
                        }
                    }
                }

                node = node.parentNode;
            }
        }
    };

   // public interface
    _F.prototype = {

        /**
         * Method to register an event on the document.
         * @method register
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        register: function(type, o) {
            // check for required
            if (! (type && o && o.id && o.callback)) {
                alert('Invalid regristration to EventDispatcher - missing required value, see source code.');
            }

            // allows for lazy-loading of events
            if (! _callbackMap[type]) {
                _callbackMap[type] = {};
                _YE.on(_DOC, type, _E.dispatcher);
            }

            if (! _callbackMap[type][o.id]) {_callbackMap[type][o.id] = [];}
            if (! o.scope) {o.scope = window;}
            if (! o.arguments) {o.arguments = [];}
            if (! YAHOO.lang.isArray(o.arguments)) {o.arguments = [o.arguments];} // support arguments _that are non arrays
            _callbackMap[type][o.id].push(o);
        },

        /**
         * Call this method to register an event the first time _that ID is provided, and not subsequent times.
         * @method registerOnce
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        registerOnce: function(type, o) {
            if (! (_callbackMap[type] || _callbackMap[type][o.id])) {
                register(type, o);
            }
        }
    };

    _that = new _F();
    return _that;
})();