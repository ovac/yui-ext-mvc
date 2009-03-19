/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * Extending YAHOO.lang.
 * @class YAHOO.lang
 * @static
 */
(function() {    
    var _YL = YAHOO.lang,
        _YUA = YAHOO.env.ua;

	var _that = {

        /**
         * The error text to throw when a method is not implemetented.
         * @property ERROR_NOT_IMPLEMENTED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_IMPLEMENTED: 'Method "??.??" not available without including "??" in your library.',

        /**
         * The error text to throw when invalid parameters are passed into a method.
         * @property ERROR_INVALID_PARAMETERS
         * @type String
         * @static
         * @final
         */
        ERROR_INVALID_PARAMETERS: 'Method "??.??" is missing required parameter of (??) "??".',

        /**
         * The error text to throw when a required value is not defined.
         * @property ERROR_NOT_DEFINED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_DEFINED: '?? - "??" not defined, unable to ?? "??"',

        /**
         * The error text to throw when an object is missing a required key.
         * @property ERROR_MALFORMED_OBJECT
         * @type String
         * @static
         * @final
         */
        ERROR_MALFORMED_OBJECT: '?? - Object "??" does not contain required parameter (??) "??"',

        /**
		 * Iterates on the provided array and calls provided function with the value of each index.
		 * @method arrayWalk
		 * @param arr {Array} Required. The array or array-like object to iterate on (must have a length).
		 * @param fx {Function} Required. The function to execute.
		 * @param scope {Object} Optional. The execution scope.
		 * @static
		 */
		arrayWalk: function(arr, fx, scope) {
			if (! (arr || arr.length)) {return;}
			var n = arr.length;
			for (var i = 0; i < n; i+= 1) {
				var o = fx.call(scope || window, arr[i], i);
				if (_YL.isDefined(o)) {return o;}
			}
		},

		/**
		 * Wrapper for simple lazy-loading functions.
		 * @method callLazy
		 * @param callback {Function} Required. The callback method.
		 * @param isReady {Function} Required. The is ready test function.
		 * @param conf {Object} Optional. Configuration options for execution.
		 *          failure: {Function} The method to call if max iteration is reached.
		 *          maxExec: {Number} The maximum number of time to execute; default is 25.
		 *          timeout: {Number} The number of milliseconds to wait before checking 'isReady'; default is 100ms.
		 *          params: {Object} An object to pass through to callback function.
		 * @static
		 */
		callLazy: function(callback, isReady, conf) {
            // define cfg and set default values
            var cfg = _YL.isObject(conf) ? conf : {};
            if (! (0 < cfg.maxExec)) {cfg.maxExec = 25;}
            if (! (0 < cfg.timeout)) {cfg.timeout = 100;}
            if (! _YL.isFunction(callback)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', 'Function', callback);}
            if (! _YL.isFunction(isReady)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', 'Function', isReady);}

            var fx = function(index) {
                // index does not yet exceed maxExec
                if (cfg.maxExec > index) {
                    if (isReady()) {
                        callback(cfg.params);
                    }
                    else {
					    setTimeout(function() {fx.call(this, index + 1);}, cfg.timeout);
                    }
                }
                // exceeding maxExec; terminate
                else {
                    // was a failutre function provided
                    if (_YL.isFunction(cfg.failure)) {
                        cfg.failure(fx, cfg, i);
                    }
                }
            };

            fx(0);
		},

        /**
         * Provides a safe method for executing a for ... in" loop on the provided object, calling the function with the object and key.
         * @method forEach
         * @param obj {Object} Required. The object to loop through.
         * @param fx {Function} Required. The callback function.
         * @static
         */
        forEach: function(obj, fx) {
            if (! (_YL.isDefined(obj) && _YL.isFunction(fx))) {return;}
    
            // iterate on the keys in data
            for (var k in obj) {
                var o = obj[k];

                if (! _YL.isFunction(o)) { // ignore functions
                    fx(o, k);
                }
            }
        },

        /**
         * Evaluates if the provided object is an arguments object or not.
         * @method isArgument
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is an argument.
         * @static
         */
        isArgument: function(o) {
            return _YL.isObject(o) && o.callee;
        },

        /**
         * Evaluates if the provided object is an Date object or not; the special "o.length" check is for Array-Like object that may not have 'constructor'.
         * @method isDate
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a Date.
         * @static
         */
        isDate: function(o) {
            return _YL.isObject(o) && _YL.isUndefined(o.length) && Date === o.constructor;
        },

        /**
         * Evaluates if the provided object is defined or not; defined means not NULL and not UNDEFINED. Slightly more performance than YAHOO.lang.isValue.
         * @see YAHOO.lang.isValue
         * @method isDefined
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a defined.
         * @static
         */
        isDefined: function(o) {
		    return o || ! (undefined === o || null === o);
        },

        /**
         * Test if the client browser is firefox.
         * @method isFireFox
         * @return {Boolean} The client is firefox.
         * @static
         */
        isFireFox: function() {
            return 0 < _YUA.firefox;
        },

        /**
         * Test if the client browser is IE.
         * @method isIE
         * @return {Boolean} The client is IE.
         * @static
         */
        isIE: function() {
            return 0 < _YUA.ie;
        },

        /**
         * Test if the client browser is IE 6.
         * @method isIE6
         * @return {Boolean} The client is IE 6.
         * @static
         */
        isIE6: function() {
            return 7 > _YUA.ie;
        },

        /**
         * Test if the client browser is IE 7.
         * @method isIE7
         * @return {Boolean} The client is IE 7.
         * @static
         */
        isIE7: function() {
            return 7 <= _YUA.ie || 8 >= _YUA.ie;
        },

        /**
         * Test if the client browser is opera.
         * @method isOpera
         * @return {Boolean} The client is opera.
         * @static
         */
        isOpera: function() {
            return 7 > _YUA.opera;
        },

        /**
         * Evaluates if the provided object is a regular expression object or not.
         * @method isRegExp
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a RegExp.
         * @static
         */
        isRegExp: function(o) {
            return _YL.isObject(o) && o.match;
        },

        /**
         * Test if the client browser is safari.
         * @method isSafari
         * @return {Boolean} The client is safari.
         * @static
         */
        isSafari: function() {
            return 0 < _YUA.webkit;
        },

        /**
         * Throws the provided error text after performing text replacement.
         * @method throwError
         * @param text {String} Required. The error text.
         * @param arg1 {String} Optional. A value to replace the first '??' with.
         * @param argX {String} Optional. Addtional values to replace the corresponding '??' with.
         * @static
         */
        throwError: function(text, arg1, argX) {
			var params = [];
			
			var fx = function() {
				_YL.arrayWalk(arguments, function(o) {
					if (_YL.isArray(o) || _YL.isArgument(o)) {
						fx.apply(this, o);
					}
					else {
						params.push(o);
					}
				});
			};
			
			_YL.throwError = function() {
				params = [];
				fx.apply(this, arguments);
				
				var str = '' + params[0];
				_YL.arrayWalk(params.slice(1), function(o) {
					str = str.replace(/\?\?/, o);
				});
				
				throw(str);
			};
			
			_YL.throwError.apply(this, arguments);
        }
    };

    // fixing IE; index of is assumed to be available
    if (! Array.prototype.indexOf) {

        // this is not to be JavaDoc'ed as it will confuse the compiler
        /*
         * The last index of value in the array.
         * @namespace window
         * @method indexOf
         * @param val {Object} Required. Any non-Object, object.
         * @param strict {Boolean} Optional. True when also comparing type.
         * @return {Number} The index of value or -1 when object is not in array.
         * @public
         */
        Array.prototype.indexOf = function(val, strict) {
            var t1 = _YL.arrayWalk(this, function(o, i) {
                return (o === val) || (! strict && o == val) ? i : false;
            });
            return _YL.isNumber(t1) ? t1 : -1;
        };
    }
	
    _YL.augmentObject(_YL, _that);
})();