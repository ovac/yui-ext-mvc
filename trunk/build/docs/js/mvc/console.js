/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.00
 */

/**
 * The console pacakge extends the "mvc/core.js" package with additional console logging capabilities. This package
 *  first attempts to use the FireBug console logger, and then, when that is not available will open a new browser window
 *  and log there.
 * @class Core
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
})();