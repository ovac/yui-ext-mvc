/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.02
 */

/**
 * The Array utility extends the native JavaScript Array Object with additional methods and objects.
 * @module window
 * @class Array
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Converts the provided Object into an array, ensure it is not an array-like object.
         * @method get
         * @param o {Object} Required. An array or array-like object.
         * @return {Array} The provided object as an Array.
         * @static
         */
        get: function(o) {
            var data = (o && o.length) ? o : []; // defaults to Array when passed nothing or crap

            if (_YL.isArray(data)) {
                return data;
            }
            else {
                var arr;

                try {
                    arr = Array.prototype.slice.call(data, 0);
                }
                catch (e) {
                    if (! e) {return [];}
                    arr = [];

                    // not an Array, but an Array-like object, let's make it an Array
                    if (data.length) {
                        var j = data.length,
                            i = 0;

                        // iterate through nodeList, this should be sequential, because we expect nodeList to be in a certain order
                        for (i = 0; i < j; i += 1) {
                            // only add keys with values
                            if (data[i]) {
                                arr[arr.length] = data[i];
                            }
                        }
                    }
                }

                return arr;
            }
        },

        /**
         * Tests if the passed parameter is an Array.
         * @param o {Object} Required. An Object that want to ensure is an Array.
         * @return {Boolean} True when parameter is an Array.
         * @static
         */
        is: function(o) {
            return _YL.isArray(o);
        }
        
    };

	_YL.augmentObject(Array, _that);
})();

/**
 * The Array utility extends the native JavaScript Array Object prototype with additional methods.
 * @class Array
 * @namespace Window
 * @extends Array
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Array.prototype', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * The number current position of the pointer. Should be considered private, even though it is attached to the prototoype.
         * @property _pointer
         * @type Number
         * @const
         * @public
         */
        _pointer: 0,

        /* defined below */
        batch: function() {_throwNotImplemented('batch', 'yahoo.ext/lang.js');},

        /* defined below */
        compact: function() {_throwNotImplemented('compact', 'yahoo.ext/lang.js');},

        /* defined below */
        contains: function() {_throwNotImplemented('contains', 'yahoo.ext/lang.js');},

        /* defined below */
        copy: function() {_throwNotImplemented('copy', 'yahoo.ext/lang.js');},

        /**
         * Returns the element currently pointed to.
         * @method current
         * @returrn {Object} The object in 'this' at pointer.
         * @public
         */
        current: function() {
            return this[this._pointer];
        },

        /* defined below */
        equals: function() {_throwNotImplemented('equals', 'yahoo.ext/lang.js');},

        /* defined below */
        forEach: function() {_throwNotImplemented('forEach', 'yahoo.ext/lang.js');},

        /**
         * Returns the first element in the Array or Undefined.
         * @method first
         * @return {Object} The first element in array.
         * @public
         */
        first: function() {
            return this[0];
        },

        /* defined below */
        indexOf: function() {_throwNotImplemented('indexOf', 'yahoo.ext/lang.js');},

        /**
         * Returns the last element in the Array or Undefined.
         * @method last
         * @return {Object} The last element in array.
         * @public
         */
        last: function() {
            return (this.length) ? this[this.length - 1] : undefined;
        },

        /* defined below */
        lastIndexOf: function() {_throwNotImplemented('lastIndexOf', 'yahoo.ext/lang.js');},

        /**
         * Updates the array pointer to the next position; wraps to ZERO when wrap is true.
         * @method next
         * @param wrap {Boolean} Optional. True when you want to wrap to ZERO when exceeding array length.
         * @return {Object} The next element in the Array.
         * @public
         */
        next: function(wrap) {
            var i = this._pointer;
            i += 1;
            if (wrap && this.length - 1 < i) {i = 0;}
            this._pointer = i;
            return this[i];
        },

        /**
         * Updates the array pointer to the prev position; wraps to length - 1.
         * @method prev
         * @param wrap {Boolean} Optional. True when you want to wrap to ZERO when exceeding array length.
         * @return {Object} The previous element in the Array.
         * @public
         */
        prev: function(wrap) {
            var i = this._pointer;
            i -= 1;
            if (wrap && 0 > i) {i = this.length - 1;}
            this._pointer = i;
            return this[i];
        },

        /* defined below */
        removeIndex: function() {_throwNotImplemented('removeIndex', 'yahoo.ext/lang.js');},

        /* defined below */
        removeValue: function() {_throwNotImplemented('removeValue', 'yahoo.ext/lang.js');},

        /**
         * Resets the Array pointer to the first position.
         * @method reset
         * @public
         */
        reset: function() {
            this._pointer = 0;
        },

        /* defined below */
        toJsonString: function() {_throwNotImplemented('toJsonString', 'yahoo.ext/lang.js');},

        /* defined below */
        unique: function() {_throwNotImplemented('unique', 'yahoo.ext/lang.js');},

        /* defined below */
        walk: function() {_throwNotImplemented('walk', 'yahoo.ext/lang.js');}
    };

    _YL.augmentObject(Array.prototype, _that);

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfArrayWalk = {

            /**
             * Return a copy of the array with null and undefined elements removed; this is not a DEEP COPY, sub-references remain intact.
             *  This method does not change the existing arrays, it only returns a copy of the joined arrays.
             * @method compact
             * @param compress {Boolean} Optional. When true, this function will not preserve indices.
             * @return {Array} Copy of 'this' array without null/undefined elements.
             * @public
             */
            compact: function(compress) {
                var arr = [];

                // iterate on the
                this.walk(function(o, k) {
                    if (_YL.isDefined(o)) {
                        if (compress && _YL.isNumber(k)) {
                            arr.push(o);
                        }
                        else {
                            arr[k] = o;
                        }
                    }
                });

                return arr;
            },

            /**
             * Returns true if the object is in the array.
             * @method contains
             * @param val {Object} Required. The object to compare.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Boolean} True when the object is in the Array.
             * @public
             */
            contains: function(val, strict) {
	            return -1 < this.indexOf(val, strict);
            },

            /**
             * Returns a new Array object with the same keys/values as current Array.
             * @method copy
             * @return {ModelArray} The copy of this.
             * @public
             */
            copy: function() {
                var arr = [];
                this.walk(function(o, k) {arr[k] = o;});
                return arr;
            },

            /**
             * Compares the objects for equality, defeats javascript objects compare by reference.
             * @method Equals
             * @param compare {Array} Required. An object to compare to with.
             * @return {Boolean} True, when values in object and array are equal.
             * @public
             */
            equals: function(compare) {
                if (this.length !== compare.length) {return false;}
                if (! this.length) {return true;}
                var isEqual = true;

                this.walk(function(o, i) {
                    isEqual &= o === compare[i];
                });

                return isEqual;
            },

            /**
             * The last index of value in the array.
             * @method indexOf
             * @param val {Object} Required. Any non-Object, object.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Number} The index of value or -1 when object is not in array.
             * @public
             */
            indexOf: function(val, strict) {
                var t1 = this.walk(function(o, i) {
                    return (o === val) || (! strict && o == val) ? i : null;
                });
                return _YL.isNumber(t1) ? t1 : -1;
            },

            /**
             * The last index of value in the Array.
             * @method lastIndexOf
             * @param val {Object} Required. Any non-Object, object.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Number} The index of value or -1 when object is not in array.
             * @public
             */
            lastIndexOf: function(val, strict) {
                // iterate on the data, in the reversed direction
                for (var i = this.length - 1; -1 < i; i -= 1) {
                    var o = this[i];
                    if ((o === val) || (! strict && o == val)) {return i;}
                }

                return -1;
            },

            /**
             * Remove the member at index (i) in the array.
             * @method removeIndex
             * @param n {Number} Required. The index to remove.
             * @return {Object} The new Array or Original.
             * @public
             */
            removeIndex: function(n) {
                var arr = [],
                    i = 0;

                // invalid index
                if (0 > n || n >= this.length) {return this;}
	            var index = n;

                // iterate on self
                this.walk(function(o) {
                    // index to remove
                    if (i === index) {
                        index -= 1;
                    }
                    // other values
                    else {
                        arr[i] = o;
                        i += 1;
                    }
                });

                return arr;
            },

            /**
             * Finds the object in the array and removes it.
             * @method removeValue
             * @param val {Object} Required. The object to remove.
             * @return {Object} The new Array or Original.
             * @public
             */
            removeValue: function(val) {
                return this.removeIndex(this.indexOf(val));
            },

            /**
             * Convert the array to a JSONArray object.
             * @method toJsonString
             * @return {String} This JSON array as a string.
             * @public
             */
            toJsonString: function() {
                var sb = [];

                this.walk(function(o) {
                    sb.push(Object.convertToJsonString(o));
                });

                return '[' + sb.join(',') + ']';
            },

            /**
             * Iterates through the array and removes duplicate values.
             * @method unique
             * @return {Array} Array with only unique values.
             * @public
             */
            unique: function() {
                var sorter = {},
                    out = [];

                // iterate on this
                this.walk(function(o) {
                    // test if object with type already exists
                    if (! sorter[o + typeof o]) {
                        out.push(o);
                        sorter[o + typeof o] = true;
                    }
                });

                return out;
            },

            /**
             * Iterates on the array, executing 'fx' with each value.
             * @method walk
             * @param fx {Function} Required. The function to execute.
             * @param scope {Object} Optional. The scope to execute 'fx' in.
             * @public
             */
            walk: function(fx, scope) {
                return _YL.arrayWalk(this, fx, scope);
            }
        };

        /**
         * An alias for Array.walk.
         * @method batch
         * @see Array.walk
         * @public
         */
        _thatIfArrayWalk.batch = _thatIfArrayWalk.walk;

        /**
         * An alias for Array.walk.
         * @method forEach
         * @see Array.walk
         * @public
         */
        _thatIfArrayWalk.forEach = _thatIfArrayWalk.walk;

        _YL.augmentObject(Array.prototype, _thatIfArrayWalk, true);
    }

    // augment the DOM methods that use Array, if not already augmented
    if (_YD && _YD.augmentWithArrayMethods) {
        _YD.augmentWithArrayMethods();
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Boolean utility extends the native JavaScript Boolean Object with additional methods and objects.
 * @module window
 * @class Boolean
 * @dependencies YAHOO.lang
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
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Date utility extends the native JavaScript Date Object with additional methods and objects.
 * @module window
 * @class Date
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Date', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * Constant type for hours.
         * @property HOUR
         * @static
         * @final
         * @type String
         */
        HOUR: 'H',

        /**
         * Constant type for milliseconds.
         * @property MILLISECOND
         * @static
         * @final
         * @type String
         */
        MILLISECOND: 'MS',

        /**
         * Constant type for minutes.
         * @property MINUTE
         * @static
         * @final
         * @type String
         */
        MINUTE: 'I',

        /**
         * Constant value for 1 second in milliseconds.
         * @property ONE_SECOND_MS
         * @static
         * @final
         * @type Number
         */
        ONE_SECOND_MS: 1000,

        /**
         * Constant value for 1 minute in milliseconds.
         * @property ONE_MINUTE_MS
         * @static
         * @final
         * @type Number
         */
        ONE_MINUTE_MS: 60 * 1000,

        /**
         * Constant value for 1 hour in milliseconds.
         * @property ONE_HOUR_MS
         * @static
         * @final
         * @type Number
         */
        ONE_HOUR_MS: 60 * 60 * 1000,

        /**
         * Constant value for 1 day in milliseconds.
         * @property ONE_DAY_MS
         * @static
         * @final
         * @type Number
         */
        ONE_DAY_MS: 24 * 60 * 60 * 1000,

        /**
         * Constant value for 1 week in milliseconds.
         * @property ONE_WEEK_MS
         * @static
         * @final
         * @type Number
         */
        ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,

        /**
         * Constant type for seconds.
         * @property SECOND
         * @static
         * @final
         * @type String
         */
        SECOND: 'S',

        /**
         * Date constant for full month names.
         * @property MONTHS
         * @static
         * @final
         * @type String
         */
        MONTHS: ['January','February','March','April','May','June','July','August','September','October','November','December'],

        /**
         * Collection of abbreviated Month names.
         * @property MONTHS_ABBR
         * @static
         * @final
         * @type Array
         */
        MONTHS_ABBR: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		
		/**
		 * Determines the timezone offset from GMT.
		 *	Originally by Josh Fraser (http://www.onlineaspect.com)
		 * @method getTimeZoneOffset
		 * @return {Number} The timezone offset.
		 * @static
		 */
		getTimeZoneOffset: function() {
			var rightNow = new Date(),
				jan1 = Date.getJan1(rightNow),
				june1 = Date.getDate(rightNow.getFullYear(), 6, 1),
				tempGMT = jan1.toGMTString(),
				jan2 = new Date(tempGMT.substring(0, tempGMT.lastIndexOf(" ") - 1));

			tempGMT = june1.toGMTString();
			var june2 = new Date(tempGMT.substring(0, tempGMT.lastIndexOf(" ") - 1)),
				std_time_offset = (jan1 - jan2) / Date.ONE_HOUR_MS,
				daylight_time_offset = (june1 - june2) / Date.ONE_HOUR_MS,
				dst;

			if (std_time_offset === daylight_time_offset) {
				dst = 0; // daylight savings time is NOT observed
			}
			else {
				// positive is southern, negative is northern hemisphere
				var hemisphere = std_time_offset - daylight_time_offset;
				if (0 <= hemisphere) {std_time_offset = daylight_time_offset;}
				dst = 1; // daylight savings time is observed
			}
			
			var n = Math.floor(Math.abs(std_time_offset)) + dst;
			
			return (0 > std_time_offset) ? (-1 * n) : n;
		},

        /**
         * Calculates the difference between calA and calB in units of field. CalB should be before calA or the result will be negative.
         * @method diff
         * @param cA {Date} Optional. The JavaScript Date that is after than calB, or if invalid will assume 'Now'.
         * @param cB {Date} Optional. The JavaScript Date that is before than calA, or if invalid will assume 'Now'.
         * @param field {String} Optional. The field constant to be used for performing date math.
         * @return {Number} A number representing the length of time, in units of field, between dates calA & calB (rounded up).
         * @static
         */
        diff: function(cA, cB, field) {
            var calA = _YL.isDate(cA) ? cA : new Date(),
                calB = _YL.isDate(cB) ? cB : new Date(),
                val = 0,
                preround = 0,
	            isFieldTimeOfDay = Date.MILLISECOND === field || Date.HOUR === field || Date.MINUTE === field || Date.SECOND === field;

            // any period shorter than a week can be calculated using milliseconds, otherwise will require the year
            var diff = (Date.DAY === field || isFieldTimeOfDay) ? calA.getTime() - calB.getTime() : calA.getFullYear() - calB.getFullYear();

            switch (field) {
                case Date.YEAR: // year(s)
                    val = diff;
                    // correct for months
                    if (calA.getMonth() === calB.getMonth()) {
                        // correct for days
                        if (calA.getDate() < calB.getDate()) {
                            val -= 1;
                        }
                    }
                    else if (calA.getMonth() < calB.getMonth()) {
                        val -= 1;
                    }
                    break;

                case this.MONTH: // month(s)
                    val = diff * 12 + calA.getMonth() - calB.getMonth();
                    // correct for days
                    if (calA.getDate() < calB.getDate()) {
                        val -= 1;
                    }
                    break;

                case this.DAY: // day(s)
                    preround = diff / Date.ONE_DAY_MS;
                    break;

                case this.HOUR: // hour(s)
                    preround = diff / Date.ONE_HOUR_MS;
                    break;

                case this.MINUTE: // minute(s)
                    preround = diff / Date.ONE_MINUTE_MS;
                    break;

                case this.SECOND: // second(s)
                    preround = diff / Date.ONE_SECOND_MS;
                    break;

                case this.MILLISECOND: // millisecond(s)
                default:
                    val = diff;
                    break;
            }

            return preround ? Math.round(preround) : val;
        },

        /**
         * Returns a new JavaScript Date object, representing the given year, month and date. Time fields (hr, min, sec, ms) on the new Date object
         *  are set to 0. The method allows Date instances to be created with the a year less than 100. 'new Date(year, month, date)' implementations
         *  set the year to 19xx if a year (xx) which is less than 100 is provided.
         *
         * Note: Validation on argument values is not performed. It is the caller's responsibility to ensure
         *  arguments are valid as per the ECMAScript-262 Date object specification for the new Date(year, month[, date]) constructor.
         *
         * @method getDate
         * @param y {Number} Required. The date year.
         * @param m {Number} Required. The month index from 0 (Jan) to 11 (Dec).
         * @param d {Number} Optional. The date from 1 to 31. If not provided, defaults to 1.
         * @param h {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param i {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param s {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param ms {Number} Optional. The date from 0 to 999. If not provided, defaults to 0.
         * @return {Date} The JavaScript date object with year, month, date set as provided.
         * @static
         */
        getDate: function(y, m, d, h, i, s, ms) {
            var dt = null;

            if (_YL.isDefined(y) && _YL.isDefined(m)) {
                if (100 <= y) {
                    dt = new Date(y, m, d || 1);
                }
                else {
                    dt = new Date();
                    dt.setFullYear(y);
                    dt.setMonth(m);
                    dt.setDate(d || 1);
                }

                dt.setHours(h || 0, i || 0, s || 0, ms || 0);
            }

            return dt;
        },

        /**
         * Returns a date object from the String; expects 'MonthName, DayNr Year Hrs:Min:Sec', may not work properly on other strings in all browsers.
         * @method getDate
         * @param s {String} Required. The date as a String.
         * @return {Date} A date object, defined by the passed String; null when s is an invalid date.
         * @static
         */
        getDateFromTime: function(s) {
            var d = new Date();
            d.setTime(Date.parse('' + s));
            return ('Invalid Date' === ('' + d) || isNaN(d)) ? null : d;
        },

        /**
         * Retrieves the month value from the months short or abreviated name (ex. jan == Jan == January == january == 1).
         * @method getMonthIndexFromName
         * @param s {String} Required. The textual name of the month, can be any case and 3 letters or full name.
         * @return {Number} The index of the month (1-12) or -1 if invalid.
         * @static
         */
        getMonthIndexFromName: function(s) {
            var month = ('' + s).toLowerCase().substr(0, 3),
                mlist = Date.MONTHS_ABBR,
                i = 0;

            for (i = 0; i < mlist.length; i += 1) {
                if (mlist[i].toLowerCase() === month) {return i + 1;}
            }

            return -1;
        },

        /**
         * Shortcut method to get the current time in milliseconds.
         * @method getTime
         * @return {Number} the current time in milliseconds
         * @static
         */
        getTime: function() {
            return (new Date()).getTime();
        },

        /**
         * Calculates an appropriate time window then returns a String representation of that window.
         * @method getTimeAgo
         * @param c1 {Date} Required. The JavaScript Date that is before now, or will default to 'Now'.
         * @param c2 {Date} Optional. The JavaScript Date that is after 'then'; default is 'Now'.
         * @return {String} A String representing the length of time with units between date and 'Now'.
         * @static
         */
        getTimeAgo: function(c1, c2) {
            var now = _YL.isDate(c2) ? c2 : new Date(),
                then = _YL.isDate(c1) ? c1 : now,
                diff = (then.getTime() === now.getTime()) ? 0 : Date.diff(now, then, Date.MILLISECOND);

            if (diff < Date.ONE_SECOND_MS) {return '0 seconds';}

            if (diff < Date.ONE_MINUTE_MS) {
                diff = Date.diff(now, then, Date.SECOND);
                return diff + ' second' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_HOUR_MS) {
                diff = Date.diff(now, then, Date.MINUTE);
                return diff + ' minute' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_DAY_MS) {
                diff = Date.diff(now, then, Date.HOUR);
                return diff + ' hour' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_WEEK_MS) {
                diff = Date.diff(now, then, Date.DAY);
                return diff + ' day' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_WEEK_MS * 4) {
                diff = parseInt(Date.diff(now, then, Date.DAY) / 7, 10);
                return diff + ' week' + (1 === diff ? '' : 's');
            }

            diff = this.diff(now, then, Date.YEAR);

            if (1 < diff) {
                return diff + ' years';
            }
            else {
                diff = Date.diff(now, then, Date.MONTH);
                return diff + ' month' + (1 === diff ? '' : 's');
            }
        },

        /* defined below */
        is: function() {_throwNotImplemented('is', 'yahoo.ext/lang.js');}

    };

	_YL.augmentObject(Date, _that);

    // YAHOO.widget.DateMath included, use instead of custom Date methods
    if (YAHOO.widget && YAHOO.widget.DateMath) {
        var _DM = YAHOO.widget.DateMath;

        var _thatIfDateMath = {

            /**
             * @see YAHOO.widget.DateMath.DAY
             */
            DAY: _DM.DAY,

            /**
             * @see YAHOO.widget.DateMath.MONTH
             */
            MONTH: _DM.MONTH,

            /**
             * @see YAHOO.widget.DateMath.WEEK
             */
            WEEK: _DM.WEEK,

            /**
             * @see YAHOO.widget.DateMath.YEAR
             */
            YEAR: _DM.YEAR,

            /**
             * @see YAHOO.widget.DateMath.getJan1
             */
            getJan1: _DM.getJan1
        };

	    _YL.augmentObject(Object, _thatIfDateMath);
    }
    else {
        var _thatIfNotDateMath = {

            /**
             * Constant field representing Day.
             * @property DAY
             * @static
             * @final
             * @type String
             */
            DAY: 'D',

            /**
             * Constant field representing Month.
             * @property MONTH
             * @static
             * @final
             * @type String
             */
            MONTH: 'M',

            /**
             * Constant field representing Week.
             * @property WEEK
             * @static
             * @final
             * @type String
             */
            WEEK: 'W',

            /**
             * Constant field representing Year.
             * @property YEAR
             * @static
             * @final
             * @type String
             */
            YEAR: 'Y',

            /**
             * Retrieves a JavaScript Date object representing January 1 of any given year.
             * @method getJan1
             * @param calendarYear {Number} Optional. The calendar year for which to retrieve January 1; default is this year.
             * @return {Date} The Date for January 1 of the calendar year specified.
             * @static
             */
            getJan1: function(calendarYear) {
                return Date.getDate(_YL.isNumber(calendarYear) ? calendarYear : (new Date()).getFullYear(), 0, 1, 0, 0, 0, 1);
            }
        };

	    _YL.augmentObject(Date, _thatIfNotDateMath);
    }

    // YAHOO.lang extensions are included
    if (_YL.isDate) {
        var _thatIfIsDate = {

            /**
             * Tests if the passed parameter is a date.
             * @method is
             * @param date {Object} Required. An Object that want to ensure is a Date.
             * @return {Boolean} True when parameter is a date.
             * @static
             */
            is: function(date) {
                return _YL.isDate(date);
            }
        };

	    _YL.augmentObject(Date, _thatIfIsDate);
    }
})();

/**
 * The Date utility extends the native JavaScript Date Object prototype with additional methods and objects.
 * @class Date
 * @namespace Window
 * @extends Date
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Creates a new Date Object with the same time as 'this'.
         * @method clone
         * @return {Date} The copied date.
         * @public
         */
        clone: function() {
            var date = new Date();
            date.setTime(this.getTime());
            return date;
        },

        /**
         * Converts the JavaScript Date into a date String. Recognizes the following format characters:
         *  y = year, m = month, d = day of month, h = hour, i = minute, s = second.
         * @method toDateString
         * @param format (String} Optional. The String format to convert the JavaScript Date into (ie. 'm/d/y' or 'm. d, y'); default is 'm/d/y'.
         * @param showZeros {Boolean} Optional. Forces leading zeros, so 9/1/2006 becomes 09/01/2006.
         * @param useMonthName {String|Boolean} Optional. String or Boolean, use the month name instead of the digit, ('abbr' uses the short name).
         * @return {String} the JavaScript Date as a String
         * @public
         */
        format: function(format, showZeros, useMonthName) {
            var f = (_YL.isString(format) ? format : Date.MONTH + '/' + Date.DAY + '/' + Date.YEAR).toUpperCase();

            // cast all values to strings
            var day = '' + this.getDate(),
                month = '' + (this.getMonth() + 1),
                hour = '' + this.getHours(),
                minute = '' + this.getMinutes(),
                second = '' + this.getSeconds(),
                year = '' + this.getFullYear();

            // pad leading zeros
            if (showZeros) {
                if (1 === day.length) {day = '0' + day;}
                if (1 === month.length) {month = '0' + month;}
                if (1 === hour.length) {hour = '0' + hour;}
                if (1 === minute.length) {minute = '0' + minute;}
                if (1 === second.length) {second = '0' + second;}
            }

            // use month name
            if (useMonthName) {
                month = (_YL.isString(useMonthName) && 'abbr' === useMonthName.toLowerCase()) ? this.getMonthNameAbbr() : this.getMonthName();
            }

            // do month last as some months contain reserved letters
            return f.replace(Date.YEAR, year).replace(Date.DAY, day).replace(Date.HOUR, hour).replace(Date.MINUTE, minute)
                    .replace(Date.SECOND, second).replace(Date.MONTH, month);
        },

        /**
         * Converts JavaScript Date into a MySQL dateTime String '1969-12-31 00:00:00'.
         * @method formatTime
         * @return {String} The JavaScript Date as a MySQL time String.
         * @public
         */
        formatTime: function() {
            return this.format('y-m-d h:i:s', true);
        },

        /**
         * Retrieves the name of the month.
         * @method getMonthName
         * @return {String} The month fullname.
         * @public
         */
        getMonthName: function() {
            return Date.MONTHS[this.getMonth()];
        },

        /**
         * Retrieves the abbreviated name of the month.
         * @method getMonthNameAbbr
         * @return {String} The month abbreviated name.
         * @public
         */
        getMonthNameAbbr: function() {
            return this.getMonthName().substr(0,3);
        },

        /**
         * Returns whether the Javascript Date or 'Now' is on a leap year.
         * @method isLeapYear
         * @return {Boolean} True if the year matches traditional leap year rules.
         * @static
         */
        isLeapYear: function() {
            var year = this.getFullYear();
            return (0 === year % 4 && (0 !== year % 100 || 0 === year % 400));
        },

        /**
         * Returns whether the Javascript Date or 'Now' is on a weekend.
         * @method isWeekend
         * @return {Boolean} True if the day of the week matches traditional weekend rules.
         * @static
         */
        isWeekend: function() {
            return (2 > this.getDay());
        }
    };

	_YL.augmentObject(Date.prototype, _that);

    // YAHOO.widget.DateMath included, use instead of custom Date methods
    if (YAHOO.widget && YAHOO.widget.DateMath) {
        var _DM = YAHOO.widget.DateMath;

        var _thatIfDateMath = {

            /**
             * @see YAHOO.widget.DateMath.add
             */
            add: function() {
                return _DM.add.call(this, this, arguments[0], arguments[1]);
            },

            /**
             * @see YAHOO.widget.DateMath.after
             */
            after: function() {
                return _DM.after.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.before
             */
            before: function() {
                return _DM.before.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.between
             */
            between: function() {
                return _DM.between.call(this, this, arguments[0], arguments[1]);
            },

            /**
             * @see YAHOO.widget.DateMath.clearTime
             */
            clearTime: function() {
                return _DM.clearTime.call(this, this);
            },

            /**
             * @see YAHOO.widget.DateMath.getDayOffset
             */
            getDayOffset: function() {
                return _DM.getDayOffset.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.getJan1
             */
            getJan1: function() {
                return _DM.getJan1.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.subtract
             */
            subtract: function() {
                return _DM.subtract.call(this, this, arguments[0], arguments[1]);
            }
        };

	    _YL.augmentObject(Date.prototype, _thatIfDateMath);
    }
    else {
        var _thatIfNotDateMath = {

            /**
             * Adds the specified amount of time to the this instance.
             * @method add
             * @param field {String} Required. The field constant to be used for performing addition.
             * @param amount {Number} Required. The number of units (measured in the field constant) to add to the date.
             * @return {Date} The resulting Date object.
             * @public
             */
            add : function(field, amount) {
                var d = new Date(this.getTime()),
                    amt = _YL.isNumber(amount) ? amount : 0;

                switch (field) {
                    case Date.MONTH:
                        var newMonth = this.getMonth() + amt,
                            years = 0;

                        if (0 > newMonth) {
                            while (0 > newMonth) {
                                newMonth += 12;
                                years -= 1;
                            }
                        }
                        else if (11 < newMonth) {
                            while (11 < newMonth) {
                                newMonth -= 12;
                                years += 1;
                            }
                        }

                        d.setMonth(newMonth);
                        d.setFullYear(this.getFullYear() + years);
                        break;

                    case Date.YEAR:
                        d.setFullYear(this.getFullYear() + amt);
                        break;

                    case Date.WEEK:
                        d.setDate(this.getDate() + (amt * 7));
                        break;

                    case Date.DAY:
                    default:
                        d.setDate(this.getDate() + amt);
                        break;
                }

                return d;
            },

            /**
             * Determines whether a given date is after another date on the calendar.
             * @method after
             * @param compareTo {Date} Required. The Date object to use for the comparison.
             * @return {Boolean} True if the date occurs after the compared date; false if not.
             * @public
             */
            after : function(compareTo) {
                return _YL.isDate(compareTo) && (this.getTime() > compareTo.getTime());
            },

            /**
             * Determines whether a given date is before another date on the calendar.
             * @method before
             * @param compareTo {Date} Required. The Date object to use for the comparison.
             * @return {Boolean} True if the date occurs before the compared date; false if not.
             * @public
             */
            before : function(compareTo) {
                return _YL.isDate(compareTo) && (this.getTime() < compareTo.getTime());
            },

            /**
             * Determines whether a given date is between two other dates on the calendar.
             * @method between
             * @param dateA {Date} Required. One end of the range.
             * @param dateB {Date} Required. Another end of the range.
             * @return {Boolean} True if the date occurs between the compared dates; false if not.
             * @public
             */
            between : function(dateA, dateB) {
	            if (! (_YL.isDate(dateA) && _YL.isDate(dateB))) {return false;}
                return ( (this.after(dateA) && this.before(dateB)) || (this.before(dateA) && this.after(dateB)) );
            },

            /**
             * Removes the time only values from the 'this'.
             * @method clearTime
             * @return {Date} Returns a reference to 'this'.
             * @public
             */
            clearTime: function() {
                this.setHours(0, 0, 0, 0);
                return this;
            },

            /**
             * Calculates the number of days the specified date is from January 1 of the specified calendar year.
             *  Passing January 1 to this function would return an offset value of zero.
             * @method getDayOffset
             * @return {Number} The number of days since January 1 of the given year.
             * @public
             */
            getDayOffset : function() {
                // clear hours first
                var date = this.clone();
                date.setHours(0, 0, 0, 0);
                return Date.diff(date, this.getJan1(), Date.DAY);
            },

            /**
             * Retrieves a JavaScript Date object representing January 1 of the year for 'this'.
             * @method getJan1
             * @return {Date} The Date for January 1 of the year for 'this'.
             * @static
             */
            getJan1: function() {
                return Date.getDate(this.getFullYear(), 0, 1, 0, 0, 0, 1);
            },

            /**
             * Subtracts the specified amount of time from the this instance.
             * @method subtract
             * @param field {Number} Required. The this field constant to be used for performing subtraction.
             * @param amount {Number} Required. The number of units (measured in the field constant) to subtract from the date.
             * @return {Date} The resulting Date object.
             * @public
             */
            subtract: function(field, amount) {
                return this.add(field, _YL.isNumber(amount) ? (amount * -1) : 0);
            }
        };

	    _YL.augmentObject(Date.prototype, _thatIfNotDateMath);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Number utility extends the native JavaScript Number Object with additional methods and objects.
 * @module window
 * @class Number
 * @dependencies YAHOO.lang
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
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Object utility extends the native JavaScript Object Object with additional methods and objects.
 * @module window
 * @class Object
 * @dependencies YAHOO.lang
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
					if (_YL.isString(v, 'string') || _YL.isNumber(v, 'number')) {
						sb[i] = (k + '=' + v);
						i += 1;
					}
                });

                return encode ? encodeURIComponent(sb.join('&')) : sb.join('&');
            }
        };

		_YL.augmentObject(Object, _thatIfLangExtended, true);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The RegExp utility extends the native JavaScript RegExp Object with additional methods and objects.
 * @module window
 * @class RegExp
 * @dependencies YAHOO.lang
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
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The String utility extends the native JavaScript String Object with additional methods and objects.
 * @module window
 * @class String
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _DOC = document;
    
    var _that = {

        /**
         * An associative array containing select HTML character entities that we'd like to decode.
         * @property htmlCharacterEntities
         * @static
         * @final
         * @type {Array}
         */
        htmlCharacterEntities: {"quot":'"',"nbsp":' ',"ndash":"\u2013","lt":'<',"gt":'>', "reg":'\xae',"copy":'\xa9',
                                "cent":'\xa2',"amp":'&',"apos":"'","rsquo":'\x27'},

        /**
         * Regex for color validation.
         * @property RX_COLOR
         * @static
         * @final
         * @type {RegExp}
         */
        RX_COLOR: /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/,

        /**
         * Regex for email validation.
         * @property RX_EMAIL
         * @static
         * @final
         * @type {RegExp}
         */
        RX_EMAIL: /^\w(\+?\.?-?\w)*\-?@\w(\+?\.?[\-\w])*\.[a-z]{2,4}$/i,

        /**
         * Converts a hexidecimal color into it's RGB values.
         * @method hexToRGB
         * @param s {String} A hexidecimal color.
         * @static
         */
        hexToRGB: function(s) {
            var r = 0, g = 0, b = 0;

            if (s.isColor()) {
                var n = -1 < s.indexOf('#') ? 1 : 0;

                if (3 === (s.length - n)) {
                    r = s.substr(n, 1);
                    g = s.substr(n + 1, 1);
                    b = s.substr(n + 2, 1);
                    r = (r + r).fromHex();
                    g = (g + g).fromHex();
                    b = (b + b).fromHex();
                }
                else {
                    r = s.substr(n, 2).fromHex();
                    g = s.substr(n + 2, 2).fromHex();
                    b = s.substr(n + 4, 2).fromHex();
                }
            }

            return [r, g, b];
        },

        /**
         * Tests if the passed parameter is a String.
         * @param o {Object} Required. An Object that want to ensure is a String.
         * @return {Boolean} True when parameter is a String.
         * @static
         */
        is: function(o) {
            return _YL.isString(o);
        },

        /**
         * Converts red, green, blue numeric values to hex.
         * @method RGBtoHex
         * @param r {String|Number} Required. The value from 0-255.
         * @param g {String|Number} Required. The value from 0-255.
         * @param b {String|Number} Required. The value from 0-255.
         * @return {String} The numeric value as a hex 00-FF.
         * @static
         */
        RGBtoHex: function(r, g, b) {
            return ('' + r).toHex() + ('' + g).toHex() + ('' + b).toHex();
        }
    };

	_YL.augmentObject(String, _that);

    // DOM extensions are included
    if (_YD.replace) {
        var _thatIfDomReplace = {

            /**
             * Method to search a string for long words and break them into manageable chunks.
             * @method breakLongWords
             * @param node {Element} Required. Pointer reference to DOM element to append to.
             * @param s {String} The text.
             * @param n {Number} The character position to split around.
             * @static
             */
            breakLongWords: function(node, s, n) {
                if (! s) {return;}
                var tokens = s.split(' '),
                    span = node.appendChild(_DOC.createElement('span')),
                    sb = [];

                // iterate on each word in the string
                _YL.arrayWalk(tokens, function(token) {
                    var tok = token + ' ',
                        m = tok.length;

                    // the length of the word exceeds the threshold
                    if (m > n) {
                        _YD.replace(span, sb.join(''));

                        for (var k=0; k < m; k += n) {
                            var wspan = (0 === k && 0 === sb.length)? span: node.appendChild(_DOC.createElement('span'));

                            if (k + n < m) {
                                _YD.replace(wspan, tok.substr(k, n));
                                node.appendChild(_DOC.createElement('wbr'));
                            }
                            else {
                                _YD.replace(wspan, tok.substring(k));
                            }
                        }

                        span = node.appendChild(_DOC.createElement('span'));
                        sb = [];
                    }
                    // the length of the word is less than threshold
                    else {
                        sb.push(tok);
                    }
                });

                _YD.replace(span, sb.join(''));
                if (! sb.length) {node.removeChild(span);}
            }
        };

        _YL.augmentObject(String, _thatIfDomReplace);
    }
})();

/**
 * The String utility extends the native JavaScript String Object prototype with additional methods.
 * @class String
 * @namespace Window
 * @extends String
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'String.prototype', arguments);
	}: function(text) {throw(text);};

    var _that = {

        capitalize: function() {_throwNotImplemented('capitalize', 'yahoo.ext/lang.js');},

        /**
         * Converts commas in the string into comma + newline characters.
         * @method convertCommasToNewline
         * @return {String} The converted string.
         * @public
         */
        convertCommasToNewline: function() {
            return this.replace(/,\s*/g, ",\n");
        },

        /**
         * Decodes a string containing either HTML or XML character entities.  Not all HTML character entities are supported.
         * @author Jason Yiin
         * @method decode
         * @return {String} The decoded string.
         * @public
         */
        decode: function() {
            return this.replace(/\&#?([a-z]+|[0-9]+);|\&#x([0-9a-fA-F]+);/g,
                /*
                 * Callback function callback by replace.
                 * @param matched {Object} Required. The matches from regex.
                 * @param htmlCharacterEntity {String} Required. The match for the first back-reference.
                 * @param xmlCharacterEntity {String} Required. The match for the second back-reference.
                 * @param offset {Number} Optional. The offset of match in String.
                 * @param whole {String} Optional. The reference to the original value.
                 */
                function(matched, htmlCharacterEntity, xmlCharacterEntity) {
                    var returnString = matched;

                    if (htmlCharacterEntity) {
                        var hceValue = String.htmlCharacterEntities[htmlCharacterEntity];
                        if (hceValue) {returnString = hceValue;}
                    }
                    else if (xmlCharacterEntity) {
                        //if fromCharCode is passed something that it can't recognize, it returns a ?
                        returnString = String.fromCharCode(parseInt(xmlCharacterEntity, 16));
                    }

                    return returnString;
                });
        },

        /**
         * Decodes the URL and then corrects any discrepencies.
         * @method decodeUrl
         * @return {String} The decoded URL.
         * @public
         */
        decodeUrl: function() {
            return decodeURIComponent(this).replace(/\+/g, ' ');
        },
    
        /**
         * Encodes the URL and then corrects any discrepencies.
         * @method encodeUrl
         * @return {String} The encoded URL.
         * @public
         */
        encodeUrl: function() {
            return encodeURIComponent(this);
        },

        /**
         * Checks if a 'this' ends with the needle.
         * @method endsWith
         * @param needle {String} Required. The search needle.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if 'this' ends with needle.
         * @public
         */
        endsWith: function(needle, ignoreCase) {
            var str = '' + this,
                end = '' + needle;

            // if the needle is longer than 'this', we know false
            if (0 === end.length || 0 > (this.length - end.length)) {return false;}

            if (ignoreCase) {
                str = str.toLowerCase();
                end = end.toLowerCase();
            }

            return str.lastIndexOf(end) === str.length - end.length;
        },

        /**
         * Checks if a 'this' ends with any of the needles in the argument set.
         * @method endsWithAny
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional search needles.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings; last parameter if desired.
         * @return {Boolean} True, if 'this' ends with any of the arguments.
         * @public
         */
        endsWithAny: function(needle, needleX, ignoreCase) {
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last];

            for (var i = 0; i < args.length; i += 1) {
                if (this.endsWith(args[i], iCase)) {return true;}
            }

            return false;
        },

        /**
         * Converts a 10-digit number into an american phone number (###-###-####).
         * @method formatPhone
         * @return {String} The formatted string; return "" when invalid.
         * @public
         */
        formatPhone: function() {
            var str = this.stripNonNumbers();
            if (10 !== str.length) {return '';}
            return str.replace(/(\d{3})(\d{3})(\d{4})/g, '$1-$2-$3');
        },

        /**
         * Converts a hexidecimal into a number.
         * @method fromHex
         * @return {Number} The hexidecimal value of number.
         * @public
         */
        fromHex: function() {
            return parseInt('' + this, 16);
        },

        /**
         * Converts 'this' into a number, defaults to 0.
         * @method getNumber
         * @param isInt {Boolean} Optional. When true, converts to integer instead of float; default is falsy.
         * @param strict {Boolean} Optional. When true, removes all non-numbers, otherwise remove non-numeric; default is falsy.
         * @return {Number} The formatted number.
         * @public
         */
        getNumber: function(isInt, strict) {
            var str = strict ? this.stripNonNumbers() : this.stripNonNumeric();
            if (0 === str.length) {str = '0';}
            return isInt ? parseInt(str) : parseFloat(str);
        },

        /* defined below */
        getQueryValue: function() {_throwNotImplemented('getQueryValue', 'native.ext/regexp.js');},

        /**
         * Returns the number of words in a string (does not split on '_').
         * @method getWordCount
         * @return {Number} The number of words in 'this'.
         * @public
         */
        getWordCount: function() {
            var o = this.trim().match(/\b\w+\b/g);
            return o ? o.length : 0;
        },

        /**
         * Checks if a string contains any of the strings in the arguement set.
         * @method has
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional needles to search.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if str contains any of the arguements.
         * @static
         */
        has: function(needle, needleX, ignoreCase) {
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last],
                str = iCase ? this.toLowerCase() : this;

            // if the needle is longer than 'this', we know false
            if (0 === str.length) {return false;}

            for (var i = 0; i < args.length; i += 1) {
                var s = '' + args[i];
                if (0 < s.length && -1 < str.indexOf(iCase ? s.toLowerCase() : s)) {return true;}
            }

            return false;
        },

        /**
         * Assert is a 'hexidecimal color'.
         * @method isColor
         * @return {Boolean} True, if the str contains a color string like '#F00' or '#FF00CC'.
         * @static
         */
        isColor: function() {
            return String.RX_COLOR.test(this);
        },

        /**
         * Checks if the email string is an email by test it has an '@' and a '.' in the correct places.
         * @method isEmail
         * @return {Boolean} True, if the str contains only one email.
         * @static
         */
        isEmail: function() {
            return String.RX_EMAIL.test(this.trim());
        },

        /**
         * Checks if the string is a number (numeric).
         * @method isNumber
         * @return {Boolean} True, if 'this' is a number.
         * @static
         */
        isNumber: function() {
            return this.trim().length === this.stripNonNumeric().length;
        },

        /**
         * Convert string new lines to newlineChar, useful for form submission.
         * @method normalizeNewlines
         * @param newlineChar {String} Optional. The character to replace newline with ("\n" or "\r").
         * @return {String} The converted string.
         * @public
         */
        normalizeNewlines: function(newlineChar) {
            var text = this;

            if ('\n' === newlineChar || '\r' === newlineChar) {
                text = text.replace(/\r\n|\r|\n/g, newlineChar);
            }
            else {
                text = text.replace(/\r\n|\r|\n/g, "\r\n");
            }

            return text;
        },

        /**
         * Removes the rx pattern from the string.
         * @method remove
         * @param rx {RegExp} Required. The regex to use for finding characters to remove.
         * @return {String} The cleaned string.
         * @public
         */
        remove: function(rx) {
            return this.replace(rx, '');
        },

        /**
         * Checks if a 'this' starts with the needle.
         * @method startsWith
         * @param needle {String} Required. The search needle.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if 'this' starts with needle.
         * @public
         */
        startsWith: function(needle, ignoreCase) {
            var str = '' + this,
                start = '' + needle;

            // if the needle is longer than 'this', we know false
            if (0 === start.length || 0 > (this.length - start.length)) {return false;}

            if (ignoreCase) {
                str = str.toLowerCase();
                start = start.toLowerCase();
            }

            return 0 === str.indexOf(start);
        },

        /**
         * Checks if a 'this' starts with any of the needles in the argument set.
         * @method startsWithAny
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional search needles.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings; last parameter if desired.
         * @return {Boolean} True, if 'this' starts with any of the arguments.
         * @public
         */
        startsWithAny: function(needle, needleX, ignoreCase){
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last];

            for (var i = 0; i < args.length; i += 1) {
                if (this.startsWith(args[i], iCase)) {return true;}
            }

            return false;
        },

        /**
         * Removes non-numeric characters, except minus and decimal.
         * @method stripNonNumeric
         * @return {String} The cleaned string.
         * @public
         */
        stripNonNumeric: function() {
            return this.remove(/[^0-9\u2013\-\.]/g);
        },

        /**
         * Remove all characters that are not 0-9.
         * @method stripNonNumbers
         * @return {String} The cleaned string.
         * @public
         */
        stripNonNumbers: function() {
            return this.remove(/[^0-9]/g);
        },

        /**
         * Remove all characters that are 0-9.
         * @method stripNumbers
         * @return {String} The cleaned string.
         * @public
         */
        stripNumbers: function() {
            return this.remove(/[0-9]/g);
        },

        /**
         * HTML script tags from the string.
         * @method stripScripts
         * @return {String} The cleaned string.
         * @public
         */
        stripScripts: function() {
            return this.remove(new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img'));
        },

        /**
         * HTML tags from the string.
         * @method stripTags
         * @return {String} The cleaned string.
         * @public
         */
        stripTags: function() {
            return this.remove(/<\/?[^>]+>/gi);
        },

        /**
         * Returns the substring up to or including the needle.
         * @method substrToStr
         * @param needle {String} Required. The search needle.
         * @param sIndex {Number} Optional. The starting index, default will start from the beginning of 'this'.
         * @param fl {Boolean} Optional. If truthy, will include the substring in the output.
         * @return {String} A substring of 'this' or empty string.
         * @public
         */
        substrToStr: function(needle, sIndex, fl) {
            var sub = needle ? '' + needle : '';
            if (! _YL.isNumber(sIndex)) {sIndex = 0;}
            if (sIndex > this.length) {return '';}
            var i = this.indexOf(sub);
            if (-1 === i) {return '';}
            return this.substr(sIndex, i - sIndex) + (fl ? sub : '');
        },

        /**
         * Converts 0-255 value into its hex equivalent. String should be numberic between 0 and 255.
         * @method toHex
         * @return {String} The hex 00-FF of numberic value.
         * @static
         */
        toHex: function() {
            var hex = '0123456789ABCDEF',
                n = parseInt(this, 10);

            if (0 === n || isNaN(n)) {return '00';}
            n %= 256; // ensures number is base 16
            n = Math.max(0, n);
            n = Math.min(n, 255);
            n = Math.round(n);
            return hex.charAt((n - n % 16) / 16) + hex.charAt(n % 16);
        },

        /**
         * Truncates the string and inserts and elipsis.
         * @method truncate
         * @param n {Number} Optional. The max length of the string; defualt is 30.
         * @param truncation {String} Optional. The string to use as the ellipsis; defualt is '...'.
         * @return {String} The truncated string with ellipsis if necessary.
         * @static
         */
        truncate: function(n, truncation) {
            var str = '' + this,
                length = n || 30;
            truncation = $defined(truncation) ? truncation : '...';
            return str.length > length ? str.substring(0, length - truncation.length) + truncation : str;
        },

        /**
         * Replaces the white spaces at the front and end of the string.
         *  Optimized: http://blog.stevenlevithan.com/archives/faster-trim-javascript.
         * @method trim
         * @return {String} The cleaned string.
         * @public
         */
        trim: function() {
            return this.remove(/^\s\s*/).remove(/\s\s*$/);
        },

        /* defined below */
        toJsonObject: function() {_throwNotImplemented('toJsonObject', 'yahoo/json.js');}
    };

    _YL.augmentObject(String.prototype, _that);

    // YAHOO.json extensions are included
    if (''.parseJSON) {
        var _thatIfJSON = {

            /**
             * Converts the string to a JSON object; contains special logic for older safari versions that choke on large strings.
             * @method toJsonObject
             * @param forceEval {Boolean} Optional. True, when using eval instead of parseJSON.
             * @return {Array} JSON formatted array [{}, {}, {}, ...].
             * @public
             */
            toJsonObject: function(forceEval) {
                if (! this) {return [];}
                return ((522 > YAHOO.env.ua.webkit && 4000 < this.length) || forceEval) ? eval("(" + this + ")") : this.parseJSON();
            }
        };

        _YL.augmentObject(String.prototype, _thatIfJSON, true);
    }

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Capitolize the first letter of every word.
             * @method capitalize
             * @param ucfirst {Boolean} Optional. When truthy, converts non-first letters to lower case; default is undefined.
             * @param minLength {Number} Optional. When set, this is the minimum number of characters a word must be before transforming; default is undefined.
             * @return {String} The converted string.
             * @public
             */
            capitalize: function(ucfirst, minLength) {
                var i = 0,
                    rs = [];

                _YL.arrayWalk(this.split(/\s+/g), function(w) { // don't assume $A() is available
                    w = w.trim();

                    // this is not whitespace
                    if (w) {
                        // not applying a min length, or word is greater than min
                        if (! minLength || (minLength && w.length >= minLength)) {
                            rs[i] = w.charAt(0).toUpperCase() + (ucfirst? w.substring(1).toLowerCase(): w.substring(1));
                        }
                        // insert word directly
                        else {
                            rs[i] = w;
                        }

                        i += 1;
                    }
                });

                return rs.join(' ');
            }
        };

		_YL.augmentObject(String.prototype, _thatIfLangExtended, true);
    }

    // RegExp extensions are included
    if (RegExp.esc) {
        var _thatIfRegExp = {

            /**
             * Escape regex literals in 'this'.
             * @method escapeRx
             * @return {String} The escaped text.
             * @static
             */
            escapeRx: function() {
                return RegExp.esc(this);
            },

            /**
             * Retrieves value for the given key out of the url query string.
             *  ex: url=http://www.mattsnider.com?id=1234&type=special then, getQueryValue(url,"id") == "1234"
             * @method getQueryValue
             * @param key {String} Required. The key value you want to retrieve.
             * @return {String} The value of the key or empty string.
             * @static
             */
            getQueryValue: function(key) {
                var url = '&' !== this.charAt(0) ? '&' + this : this; // prevents malformed url problem
                //noinspection JSDeprecatedSymbols
                var regex = new RegExp('[\\?&]' + RegExp.esc('' + key) + '=([^&#]*)'),
                    results = regex.exec(url);
                return results ? results[1] : '';
            }
        };

		_YL.augmentObject(String.prototype, _thatIfRegExp, true);
    }
})();