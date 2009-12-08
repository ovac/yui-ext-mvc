/**
 * Copyright (c) 2008, Matt Snider, LLC. All rights reserved.
 * Version: 1
 */

/**
 * The BitWriter class manages using a bitmask to read data to and from a binary data structure.
 * @namespace Core.Widget
 * @class BitWriter
 * @dependencies core.js
 */
Core.Widget.BitWriter = function(n) {

    // local variables

    var bit = Math.abs(n),
        F = function() {},
        that = null;

    /**
     * Basic bitmask validate, a binary value should be 2^n power; this ensures the bit is valid by basic arithmetic
     * @method isValidBit
     * @return {Boolean} True, when a valid bitmask.
     * @private
     */
    var isValidBitmask = function(n) {
        if (0 > n) {return false;}
        var i = 0,
            j = 1;

        while (j <= n) {
            if (j === n) {return true;}
            i += 1;
            j = Math.pow(2, i);
        }

        return false;
    };

   // public interface

    F.prototype = {

        /**
         * Adds the bitmask to the binary value; remains unchanged if n is an invalid bitmask.
         * @method addBitmask
         * @param n {Number} Required. Any 2^n value.
         * @return {Number} The new binary value.
         * @public
         */
        addBitmask: function(n) {
            if (! isValidBitmask(n) || that.hasBitmask(n)) {return bit;}
            bit = (bit | n);
            return bit;
        },

        /**
         * Retrieves the binary value.
         * @method getValue
         * @return {Number} The binary value.
         * @public
         */
        getValue: function() {
            return bit;
        },

        /**
         * Tests if the bitmask is present, returning the bitmask when it is and ZERO otherwise.
         * @method hasBitmask
         * @param n {Number} Required. Any 2^n value.
         * @return {Number} The value of bitmask, when present, otherwise ZERO.
         * @public
         */
        hasBitmask: function(n) {
            if (! isValidBitmask(n) || n > bit) {return 0;}
            return (bit & n);
        },

        /**
         * Removes the bitmask to the binary value; remains unchanged if n is an invalid bitmask.
         *  When n > the binary number, then the number is simply reduced to ZERO.
         * @method removeBitmask
         * @param n {Number} Required. Any 2^n value.
         * @return {Number} The new binary value.
         * @public
         */
        removeBitmask: function(n) {
            if (! isValidBitmask(n) || ! that.hasBitmask(n)) {return bit;}
            bit = (bit ^ n);
            return bit;
        }
    };

    that = new F();
    return that;
};