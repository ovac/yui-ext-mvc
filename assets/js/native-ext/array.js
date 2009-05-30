/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.02
 */

/**
 * The Array utility extends the native JavaScript Array Object with additional methods and objects.
 * @class Array
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
             * Remove the member at index (i) in the array; does not modify the original array.
             * @method removeIndex
             * @param n {Number} Required. The index to remove.
             * @return {Object} The new Array or Original.
             * @public
             */
            removeIndex: function(n) {
                if (0 > n || n >= this.length) {return this;} // invalid index
                var resp = this.slice(0, n),
                    rest = this.slice(n + 1);
                return resp.concat(rest);
            },

            /**
             * Finds the object in the array and removes it; does not modify the original array.
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
}());