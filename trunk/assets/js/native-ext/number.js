/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Number utility extends the native JavaScript Number Object with additional methods and objects.
 * @class Number
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns a unique number, non-repeatable number.
         * @method getUnique
         * @return {Number} A integer value.
         * @static
         */
        getUnique: function() {
            return parseInt(new Date().getTime() + Math.random() * 10000, 10);
        },

        /**
         * Tests if the passed parameter is a Number.
         * @param n {Object} Required. An Object that want to ensure is a Number.
         * @return {Boolean} True when parameter is a Number.
         * @static
         */
        is: function(n) {
            return _YL.isNumber(n);
        }

    };

	_YL.augmentObject(Number, _that);
})();

/**
 * The Number utility extends the native JavaScript Number Object prototype with additional methods and objects.
 * @class Number
 * @namespace Window
 * @extends Number
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns the value of 'this' without any direction.
         * @method abs
         * @return {Number} The absolute value of 'this'.
         * @see Math.abs
         * @public
         */
        abs: function() {
            return Math.abs(this);
        },

        /**
         * Returns the value of 'this' rounded upwards to the nearest integer.
         * @method ceil
         * @return {Number} The rounded value of 'this'.
         * @see Math.ceil
         * @public
         */
        ceil: function() {
            return Math.ceil(this);
        },

        /**
         * Returns the value of 'this' rounded downwards to the nearest integer.
         * @method floor
         * @return {Number} The rounded value of 'this'.
         * @see Math.floor
         * @public
         */
        floor: function() {
            return Math.floor(this);
        },

        /**
         * Formats the number according to the 'format' string; adherses to the american number standard where a comma is inserted after every 3 digits.
         *  Note: there should be only 1 contiguous number in the format, where a number consists of digits, period, and commas
         *        any other characters can be wrapped around this number, including '$', '%', or text
         *        examples (123456.789):
         *          '0' - (123456) show only digits, no precision
         *          '0.00' - (123456.78) show only digits, 2 precision
         *          '0.0000' - (123456.7890) show only digits, 4 precision
         *          '0,000' - (123,456) show comma and digits, no precision
         *          '0,000.00' - (123,456.78) show comma and digits, 2 precision
         *          '0,0.00' - (123,456.78) shortcut method, show comma and digits, 2 precision
         *	Note: Fails on formats with multiple periods.
         * @method format
         * @param format {String} Required. The way you would like to format this text.
         * @return {String} The formatted number.
         * @public
         */
        format: function(format) {
            if (! _YL.isString(format)) {return '';} // sanity check

            var hasComma = -1 < format.indexOf(','),
                psplit = format.replace(/[^0-9\u2013\-\.]/g, '').split('.'),
                that = this;

            // compute precision
            if (1 < psplit.length) {
                // fix number precision
                that = that.toFixed(psplit[1].length);
            }
            // error: too many periods
            else if (2 < psplit.length) {
                throw('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
            }
            // remove precision
            else {
                that = that.toFixed(0);
            }

            // get the string now that precision is correct
            var fnum = that.toString();

            // format has comma, then compute commas
            if (hasComma) {
                // remove precision for computation
                psplit = fnum.split('.');

                var cnum = psplit[0],
                    parr = [],
                    j = cnum.length,
                    m = Math.floor(j / 3),
                    n = (cnum.length % 3) || 3; // n cannot be ZERO or causes infinite loop

                // break the number into chunks of 3 digits; first chunk may be less than 3
                for (var i = 0; i < j; i += n) {
                    if (0 !== i) {n = 3;}
                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }

                // put chunks back together, separated by comma
                fnum = parr.join(',');

                // add the precision back in
                if (psplit[1]) {fnum += '.' + psplit[1];}
            }

            // replace the number portion of the format with fnum
            return format.replace(/[\d,?\.?]+/, fnum);
        },

        /**
         * Determines the number of significant figures in Number.
         * @method getPrecision
         * @retrun {Number} The number of significant figures.
         * @public
         */
        getPrecision: function() {
            var sb = ('' + Math.abs(this)).split('.');

            if ('0' === sb[0] && sb[1] && sb[1].length) {
                return -1 * sb[1].length;
            }
            else {
                return sb[0].length;
            }
        },

        /**
         * Determines if the number value is between two other values.
         * @method isBetween
         * @param i {Number} Required. The lower bound of the range.
         * @param j {Number} Required. The upper bound of the range.
         * @param inclusive {Boolean} Optional. True if i and j are to be included in the range.
         * @return {Boolean} True if i < this < j or j > this > i.
         * @public
         */
        isBetween: function(i, j, inclusive) {
            if (! (Number.is(i) && Number.is(j))) {return false;}
            return inclusive ? ((i <= this && j >= this) || (j <= this && i >= this)) :
                               ((i < this && j > this) || (j < this && i > this));
        },

        /**
         * Determines if the number value is not between two other values.
         * @method isNotBetween
         * @param i {Number} Required. The lower bound of the range.
         * @param j {Number} Required. The upper bound of the range.
         * @param inclusive {Boolean} Optional. True if i and j are to be included in the range.
         * @return {Boolean} True if i > this || val > j.
         * @public
         */
        isNotBetween: function(i, j, inclusive) {
            return ! this.isBetween(i, j, inclusive);
        },

        /**
         * Computes a random integer from 'this'; if parameter n is passed, then computes a number in the range between 'this' and 'n'.
         * @method random
         * @param n {Number} Optional. End of range.
         * @return {Number} A random integer.
         * @public
         */
        random: function(n) {
            var offset = 0,
                m = this;

            // compute min/max
            if (_YL.isNumber(n) && n !== m) {
                var max = (n < m) ? m : n,
                    min = n === max ? m : n;

                offset = min;
                m = max - min;
            }

            return offset + Math.floor(Math.random() * m + 1);
        },

        /**
         * Rounds a number to the nearest integer.
         * @method round
         * @return {Number} The rounded value of 'this'.
         * @see Math.round
         * @public
         */
        round: function() {
            return Math.round(this);
        },

        /**
         * Rounds to the nearest whole number.
         * @method roundToPrecision
         * @param prec {Number} Optional. The precision to round to: 1, 10, 100, etc...; default is 10, which rounds to the nearest tenth.
         * @return {Number} The converted number.
         * @public
         */
        roundToPrecision: function(prec) {
            if (1 > this) {return 1;}
            var pstr = ('' + prec),
                precision = Number.is(prec) ? (Math.pow(10, pstr.length) / 10) : 10,
                n = Math.ceil(this / precision);
            return n * precision;
        },

        /**
         * Returns the square root of a number.
         * @method round
         * @return {Number} The sqrt value of 'this'.
         * @see Math.sqrt
         * @public
         */
        sqrt: function() {
            return Math.sqrt(this);
        }
    };

	_YL.augmentObject(Number.prototype, _that);
})();