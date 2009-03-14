/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The RegExp utility extends the native JavaScript RegExp Object with additional methods and objects.
 * @class RegExp
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'RegExp', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * Static method to escape regex literals.
         * @method esc
         * @param text {String} Required. The literal to search.
         * @return {String} The text escaped.
         * @static
         */
        esc: function(text) {
          if (! arguments.callee.sRE) {
            var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ];
            arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
          }

          return text.replace(arguments.callee.sRE, '\\$1');
        },

        /* defined below */
        is: function() {_throwNotImplemented('is', 'yahoo.ext/lang.js');}

    };

	_YL.augmentObject(RegExp, _that);

    if (_YL.isRegExp) {
        var _thatIfIsRegExp = {

            /**
             * Tests if the passed parameter is a RegExp.
             * @method is
             * @param o {Object} Required. An Object that want to ensure is a RegExp.
             * @return {Boolean} True when parameter is a RegExp.
             * @static
             */
            is: function(o) {
                return _YL.isRegExp(o);
            }
        };

	    _YL.augmentObject(RegExp, _thatIfIsRegExp, true);
    }
})();

/**
 * The RegExp utility extends the native JavaScript RegExp Object prototype with additional methods and objects.
 * @class RegExp
 * @namespace Window
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns the number of times this regex matches the haystack.
         * @method count
         * @param haystack {String} Required. The string to search; fails gracefull on non-string haystacks.
         * @return {Number} The number of matches.
         * @public
         */
        count: function(haystack) {
            return ('' + haystack).match(this).length;
        }
    };

	_YL.augmentObject(RegExp.prototype, _that);
})();