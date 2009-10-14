/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Object utility extends the native JavaScript Object Object with additional methods and objects.
 * @class Object
 */
// !IMPORTANT! Do not put anything on the Object.prototype as this can cause issues.
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Object', arguments);
	}: function(text) {throw(text);};

    var _that = {

	    /**
	     * Determines the appropriate JSON representation for object.
	     * @method convertToJsonString
	     * @param o {Object} Required. An object.
	     * @static
	     */
	    convertToJsonString: function(o) {
			// this is a String
			if (_YL.isString(o)) {
				// this is actually a number cast as a string, convert back to number
				if ('' !== o && o === o.stripNonNumeric()) {
					return parseFloat(o);
				}
				else {
					return ('"' + o + '"').replace(/^""(.*?)""$/, '"$1"');
				}
			}
			else {
				// Number
				if (_YL.isNumber(o)) {
					return parseFloat(o);
				}
				// Array
				else if (_YL.isArray(o)) {
					return o.toJsonString();
				}
				// Objects should be parsed
				else if (_YL.isObject(o)) {
					return Object.toJsonString(o);
				}

				return ('"' + o + '"'); // some unknown object, just use native 'toString' method of object
			}
	    },

        /* defined below */
        forEach: function() {_throwNotImplemented('forEach', 'yahoo.ext/lang.js');},

        /**
         * Tests if the passed parameter is an Object.
         * @param o {Object} Required. An Object that want to ensure is an Object.
         * @return {Boolean} True when parameter is an Object.
         * @static
         */
        is: function(o) {
            return _YL.isObject(o);
        },

        /* defined below */
        toJsonString: function() {_throwNotImplemented('toJsonString', 'yahoo.ext/lang.js');},

        /* defined below */
        toQueryString: function() {_throwNotImplemented('toQueryString', 'yahoo.ext/lang.js');}
    };

	_YL.augmentObject(Object, _that);

    // YAHOO.lang extensions are included
    if (_YL.forEach) {
        var _thatIfLangExtended = {

            /**
             * Alias for YAHOO.lang.forEach.
             * @method forEach
             * @see YAHOO.lang.forEach
             * @static
             */
            forEach: _YL.forEach,

            /**
             * Static method for converting the object to a JSON string.
             * @method toJsonString
             * @param data {Object} Required. The object to loop through.
             * @return {String} The object as a JSON string.
             * @static
             */
            toJsonString: function(data) {
                var sb = [];

                Object.forEach(data, function(o, k) {
                    sb.push(('"' + k + '":') + Object.convertToJsonString(o));
                });

                return '{' + sb.join(',') + '}';
            },

            /**
             * Static method for converting the object to a query string.
             * @method toQueryString
             * @param data {Object} Required. The object to loop through.
             * @param encode {Boolean} Optional. True when you want to escape the string; default is falsy.
             * @return {String} The object as a query string.
             * @static
             */
            toQueryString: function(data, encode) {
                var sb = [],
                    i = 0;

                _YL.forEach(data, function(v, k) {
					// only care about strings and numbers
					if (_YL.isString(v) || _YL.isNumber(v)) {
						sb[i] = (k + '=' + v);
						i += 1;
					}
                });

                return encode ? encodeURIComponent(sb.join('&')) : sb.join('&');
            }
        };

		_YL.augmentObject(Object, _thatIfLangExtended, true);
    }
})();