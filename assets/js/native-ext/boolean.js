/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Boolean utility extends the native JavaScript Boolean Object with additional methods and objects.
 * @class Boolean
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Converts truthy/falsy to Boolean.
         * @method get
         * @param o {Object} Required. An Object that want to convert to Boolean.
         * @return {Boolean} True when parameter is truthy or true.
         * @static
         */
        get: function(o) {
		    //noinspection RedundantConditionalExpressionJS
            return (o && _YL.isDefined(o)) ? true : false; // ensures proper type for ===
        },

        /**
         * Tests if the passed parameter is a Boolean.
         * @method is
         * @param o {Object} Required. An Object that want to ensure is a Boolean.
         * @return {Boolean} True when parameter is a Boolean.
         * @static
         */
        is: function(o) {
            return _YL.isBoolean(o);
        }

    };

	_YL.augmentObject(Boolean, _that);
})();