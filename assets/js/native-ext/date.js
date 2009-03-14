/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Date utility extends the native JavaScript Date Object with additional methods and objects.
 * @class Date
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
})();