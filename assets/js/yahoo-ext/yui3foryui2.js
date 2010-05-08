/**
 * Create YUI 3 placeholders and features.
 */
(function() {

var W = window,
	WL = W.location,
	CLS = C.HTML.CLS,
	Yahoo = YAHOO,
	YU = Yahoo.util,
//	YW = Yahoo.widget,
	Conn = YU.Connect,
	Lang = Yahoo.lang,
	Selector = YU.Selector,
	Element = YU.Element,
	Dom = YU.Dom,
	Event = YU.Event,
	DOM_REFERENCES = {
		parentNode: true,
		firstChild: true,
		lastChild: true
	},
	UA = Yahoo.env.ua,
	Doc = document,
	RX_WHITE = /\S/,
	Native = Array.prototype,

	_updateAttribute = function(ctx, attribute, value) {
		if (ctx) {
			ctx[attribute] = value;
		}

		return value;
	},

	_wrapNode = function(node) {
		if (node) {
			return node instanceof Y.Node ? node : new Y.Node(node);
		}

		return null;
	},

	UNDEFINED = undefined,

	/**
	 * webkit key remapping required for Safari < 3.1
	 * @property webkitKeymap
	 * @private
	 */
	webkitKeymap = {
		63232: 38, // up
		63233: 40, // down
		63234: 37, // left
		63235: 39, // right
		63276: 33, // page up
		63277: 34, // page down
		25:     9, // SHIFT-TAB (Safari provides a different key code in
				   // this case, even though the shiftKey modifier is set)
		63272: 46, // delete
		63273: 36, // home
		63275: 35  // end
	},

	/**
	 * Returns a wrapped node.  Intended to be used on event targets,
	 * so it will return the node's parent if the target is a text
	 * node.
	 *
	 * If accessing a property of the node throws an error, this is
	 * probably the anonymous div wrapper Gecko adds inside text
	 * nodes.  This likely will only occur when attempting to access
	 * the relatedTarget.  In this case, we now return null because
	 * the anonymous div is completely useless and we do not know
	 * what the related target was because we can't even get to
	 * the element's parent node.
	 *
	 * @method resolve
	 * @private
	 */
	resolve = function(n) {
		try {
			if (n && 3 == n.nodeType) {
				n = n. parentNode;
			}
		} catch(e) {
			return null;
		}

		return n ? new Y.Node(n) : null;
	},

	owns = function(o, k) {
		return o && o.hasOwnProperty && o.hasOwnProperty(k);
	},

	/**
	 * Extracts the keys, values, or size from an object
	 *
	 * @method _extract
	 * @param o the object
	 * @param what what to extract (0: keys, 1: values, 2: size)
	 * @return {boolean|Array} the extracted info
	 * @static
	 * @private
	 */
	_extract = function(o, what) {
		var count = (what === 2), out = (count) ? 0 : [], i;

		for (i in o) {
			if (owns(o, i)) {
				if (count) {
					out++;
				} else {
					out.push((what) ? o[i] : i);
				}
			}
		}

		return out;
	},
	
	YObject = function(o) {
		var F = function() {};
		F.prototype = o;
		return new F();
	},

	YArray = function(o, startIdx, arraylike) {
		var t = (arraylike) ? 2 : YArray.test(o),
			l, a, start = startIdx || 0;

		if (t) {
			// IE errors when trying to slice HTMLElement collections
			try {
				return Native.slice.call(o, start);
			} catch(e) {
				a = [];
				l = o.length;
				for (; start<l; start++) {
					a.push(o[start]);
				}
				return a;
			}
		} else {
			return [o];
		}
	},

	Y = {
		extend: Yahoo.extend,
		later: Lang.later,
		namespace: Yahoo.namespace,
		Lang: Lang,
		UA: UA,
		Easing: YU.Easing,

		Event: {},

		each: YArray.each,
		Array: YArray,
		Object: YObject,

		JSON: Lang.JSON,

		all: function(query) {
			var qnodes = Selector.query(query),
				rnodes = [];

			Y.each(qnodes, function(node, i) {
				rnodes[i] = new Y.Node(node);
			});

			return rnodes;
		},

		bind: function(ctx, fn) {
			return function() {
				fn.call(ctx, arguments);
			}
		},

		one: function(query) {
			return _wrapNode(Selector.query(query, null, true));
		}
	};

	//////
	// Define Y.Object functions
	//////

	/**
	 * Determines the appropriate JSON representation for object.
	 * @method convertToJsonString
	 * @param o {Object} Required. An object.
	 * @static
	 */
	YObject.convertToJsonString = function(o) {
		// this is a String
		if (Lang.isString(o)) {
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
			if (Lang.isNumber(o)) {
				return parseFloat(o);
			}
			// Array
			else if (Lang.isArray(o)) {
				return o.toJsonString();
			}
			// Objects should be parsed
			else if (Lang.isObject(o)) {
				return YObject.toJsonString(o);
			}

			return ('"' + o + '"'); // some unknown object, just use native 'toString' method of object
		}
	};

	/**
	 * Returns an array containing the object's keys
	 * @TODO use native Object.keys() if available
	 * @method keys
	 * @static
	 * @param o an object
	 * @return {string[]} the keys
	 */
	YObject.keys = function(o) {
		return _extract(o);
	};

	/**
	 * Returns an array containing the object's values
	 * @TODO use native Object.values() if available
	 * @method values
	 * @static
	 * @param o an object
	 * @return {Array} the values
	 */
	YObject.values = function(o) {
		return _extract(o, 1);
	};

	/**
	 * Returns the size of an object
	 * @TODO use native Object.size() if available
	 * @method size
	 * @static
	 * @param o an object
	 * @return {int} the size
	 */
	YObject.size = function(o) {
		return _extract(o, 2);
	};

	/**
	 * Returns true if the object contains a given key
	 * @method hasKey
	 * @static
	 * @param o an object
	 * @param k the key to query
	 * @return {boolean} true if the object contains the key
	 */
	YObject.hasKey = owns;
	/**
	 * Returns true if the object contains a given value
	 * @method hasValue
	 * @static
	 * @param o an object
	 * @param v the value to query
	 * @return {boolean} true if the object contains the value
	 */
	YObject.hasValue = function(o, v) {
		return (Y.Array.indexOf(YObject.values(o), v) > -1);
	};

	/**
	 * Determines whether or not the property was added
	 * to the object instance.  Returns false if the property is not present
	 * in the object, or was inherited from the prototype.
	 *
	 * @method owns
	 * @static
	 * @param o {any} The object being testing
	 * @param p {string} the property to look for
	 * @return {boolean} true if the object has the property on the instance
	 */
	YObject.owns = owns;

	/**
	 * Executes a function on each item. The function
	 * receives the value, the key, and the object
	 * as paramters (in that order).
	 * @method each
	 * @static
	 * @param o the object to iterate
	 * @param f {Function} the function to execute on each item. The function
	 * receives three arguments: the value, the the key, the full object.
	 * @param c the execution context
	 * @param proto {boolean} include proto
	 * @return {YUI} the YUI instance
	 */
	YObject.each = function (o, f, c, proto) {
		var s = c || Y, i;

		for (i in o) {
			if (proto || owns(o, i)) {
				f.call(s, o[i], i, o);
			}
		}
		return Y;
	};

	/*
	 * Executes a function on each item, but halts if the
	 * function returns true.  The function
	 * receives the value, the key, and the object
	 * as paramters (in that order).
	 * @method some
	 * @static
	 * @param o the object to iterate
	 * @param f {Function} the function to execute on each item. The function
	 * receives three arguments: the value, the the key, the full object.
	 * @param c the execution context
	 * @param proto {boolean} include proto
	 * @return {boolean} true if any execution of the function returns true, false otherwise
	 */
	YObject.some = function (o, f, c, proto) {
		var s = c || Y, i;

		for (i in o) {
			if (proto || owns(o, i)) {
				if (f.call(s, o[i], i, o)) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Retrieves the sub value at the provided path,
	 * from the value object provided.
	 *
	 * @method getValue
	 * @param o The object from which to extract the property value
	 * @param path {Array} A path array, specifying the object traversal path
	 * from which to obtain the sub value.
	 * @return {Any} The value stored in the path, undefined if not found,
	 * undefined if the source is not an object.  Returns the source object
	 * if an empty path is provided.
	 */
	YObject.getValue = function (o, path) {
		if (!Y.Lang.isObject(o)) {
			return UNDEFINED;
		}

		var i,
			p = Y.Array(path),
			l = p.length;

		for (i=0; o !== UNDEFINED && i < l; i++) {
			o = o[p[i]];
		}

		return o;
	};

	/**
	 * Sets the sub-attribute value at the provided path on the
	 * value object.  Returns the modified value object, or
	 * undefined if the path is invalid.
	 *
	 * @method setValue
	 * @param o             The object on which to set the sub value.
	 * @param path {Array}  A path array, specifying the object traversal path
	 *                      at which to set the sub value.
	 * @param val {Any}     The new value for the sub-attribute.
	 * @return {Object}     The modified object, with the new sub value set, or
	 *                      undefined, if the path was invalid.
	 */
	YObject.setValue = function(o, path, val) {
		var i,
			p       = Y.Array(path),
			leafIdx = p.length-1,
			ref     = o;

		if (leafIdx >= 0) {
			for (i=0; ref !== UNDEFINED && i < leafIdx; i++) {
				ref = ref[p[i]];
			}

			if (ref !== UNDEFINED) {
				ref[p[i]] = val;
			} else {
				return UNDEFINED;
			}
		}

		return o;
	};

	//////
	// Define Y.Array functions
	//////

	/**
	 * Evaluates the input to determine if it is an array, array-like, or
	 * something else.  This is used to handle the arguments collection
	 * available within functions, and HTMLElement collections
	 *
	 * @method test
	 * @static
	 *
	 * @todo current implementation (intenionally) will not implicitly
	 * handle html elements that are array-like (forms, selects, etc).
	 *
	 * @return {int} a number indicating the results:
	 * 0: Not an array or an array-like collection
	 * 1: A real array.
	 * 2: array-like collection.
	 */
	YArray.test = function(o) {
		var r = 0;
		if ($YL.isObject(o)) {
			if ($YL.isArray(o)) {
				r = 1;
			} else {
				try {
					// indexed, but no tagName (element) or alert (window), or functions without apply/call (Safari HTMLElementCollection bug)
					if (('length' in o) && !o.tagName && !o.alert && !o.apply) {
						r = 2;
					}

				} catch(e) {}
			}
		}
		return r;
	};

	/**
	 * Executes the supplied function on each item in the array.
	 * @method each
	 * @param a {Array} the array to iterate
	 * @param f {Function} the function to execute on each item.  The
	 * function receives three arguments: the value, the index, the full array.
	 * @param o Optional context object
	 * @static
	 */
	YArray.each = (Native.forEach) ?
		function (a, f, o) {
			Native.forEach.call(a || [], f, o || $Y);
		} :
		function (a, f, o) {
			var l = (a && a.length) || 0, i;
			for (i = 0; i < l; i=i+1) {
				f.call(o || $Y, a[i], i, a);
			}
		};

	/**
	 * Returns an object using the first array as keys, and
	 * the second as values.  If the second array is not
	 * provided the value is set to true for each.
	 * @method hash
	 * @static
	 * @param k {Array} keyset
	 * @param v {Array} optional valueset
	 * @return {object} the hash
	 */
	YArray.hash = function(k, v) {
		var o = {}, l = k.length, vl = v && v.length, i;
		for (i=0; i<l; i=i+1) {
			o[k[i]] = (vl && vl > i) ? v[i] : true;
		}

		return o;
	};

	/**
	 * Returns the index of the first item in the array
	 * that contains the specified value, -1 if the
	 * value isn't found.
	 * @method indexOf
	 * @static
	 * @param a {Array} the array to search
	 * @param val the value to search for
	 * @return {int} the index of the item that contains the value or -1
	 */
	YArray.indexOf = (Native.indexOf) ?
		function(a, val) {
			return Native.indexOf.call(a, val);
		} :
		function(a, val) {
			for (var i=0; i<a.length; i=i+1) {
				if (a[i] === val) {
					return i;
				}
			}

			return -1;
		};

	/**
	 * Numeric sort convenience function.
	 * Y.ArrayAssert.itemsAreEqual([1, 2, 3], [3, 1, 2].sort(Y.Array.numericSort));
	 * @method numericSort
	 */
	YArray.numericSort = function(a, b) {
		return (a - b);
	};

	/**
	 * Executes the supplied function on each item in the array.
	 * Returning true from the processing function will stop the
	 * processing of the remaining
	 * items.
	 * @method some
	 * @param a {Array} the array to iterate
	 * @param f {Function} the function to execute on each item. The function
	 * receives three arguments: the value, the index, the full array.
	 * @param o Optional context object
	 * @static
	 * @return {boolean} true if the function returns true on
	 * any of the items in the array
	 */
	YArray.some = (Native.some) ?
		function (a, f, o) {
			return Native.some.call(a, f, o);
		} :
		function (a, f, o) {
			var l = a.length, i;
			for (i=0; i<l; i=i+1) {
				if (f.call(o, a[i], i, a)) {
					return true;
				}
			}
			return false;
		};

	/**
	 * Returns the index of the last item in the array
	 * that contains the specified value, -1 if the
	 * value isn't found.
	 * method Array.lastIndexOf
	 * @static
	 * @param a {Array} the array to search
	 * @param val the value to search for
	 * @return {int} the index of hte item that contains the value or -1
	 */
	YArray.lastIndexOf = (Native.lastIndexOf) ?
		function(a ,val) {
			return a.lastIndexOf(val);
		} :
		function(a, val) {
			for (var i=a.length-1; i>=0; i=i-1) {
				if (a[i] === val) {
					break;
				}
			}
			return i;
		};

	/**
	 * Returns a copy of the array with the duplicate entries removed
	 * @method Array.unique
	 * @static
	 * @param a {Array} the array to find the subset of uniques for
	 * @param sort {bool} flag to denote if the array is sorted or not. Defaults to false, the more general operation
	 * @return {Array} a copy of the array with duplicate entries removed
	 */
	YArray.unique = function(a, sort) {
		var b = a.slice(), i = 0, n = -1, item = null;

		while (i < b.length) {
			item = b[i];
			while ((n = YArray.lastIndexOf(b, item)) !== i) {
				b.splice(n, 1);
			}
			i += 1;
		}

		// Note: the sort option doesn't really belong here... I think it was added
		// because there was a way to fast path the two operations together.  That
		// implementation was not working, so I replaced it with the following.
		// Leaving it in so that the API doesn't get broken.
		if (sort) {
			if (L.isNumber(b[0])) {
				b.sort(YArray.numericSort);
			} else {
				b.sort();
			}
		}

		return b;
	};

	/**
	* Executes the supplied function on each item in the array.
	* Returns a new array containing the items that the supplied
	* function returned true for.
	* @method Array.filter
	* @param a {Array} the array to iterate
	* @param f {Function} the function to execute on each item
	* @param o Optional context object
	* @static
	* @return {Array} The items on which the supplied function
	* returned true. If no items matched an empty array is
	* returned.
	*/
	YArray.filter = (Native.filter) ?
		function(a, f, o) {
			return Native.filter.call(a, f, o);
		} :
		function(a, f, o) {
			var results = [];
			YArray.each(a, function(item, i, a) {
				if (f.call(o, item, i, a)) {
					results.push(item);
				}
			});

			return results;
		};

	/**
	* The inverse of filter. Executes the supplied function on each item.
	* Returns a new array containing the items that the supplied
	* function returned *false* for.
	* @method Array.reject
	* @param a {Array} the array to iterate
	* @param f {Function} the function to execute on each item
	* @param o Optional context object
	* @static
	* @return {Array} The items on which the supplied function
	* returned false.
	*/
	YArray.reject = function(a, f, o) {
		return YArray.filter(a, function(item, i, a) {
			return !f.call(o, item, i, a);
		});
	};

	/**
	* Executes the supplied function on each item in the array.
	* @method Array.every
	* @param a {Array} the array to iterate
	* @param f {Function} the function to execute on each item
	* @param o Optional context object
	* @static
	* @return {boolean} true if every item in the array returns true
	* from the supplied function.
	*/
	YArray.every = (Native.every) ?
		function(a, f, o) {
			return Native.every.call(a,f,o);
		} :
		function(a, f, o) {
			var l = a.length;
			for (var i = 0; i < l; i=i+1) {
				if (!f.call(o, a[i], i, a)) {
					return false;
				}
			}

			return true;
		};

	/**
	* Executes the supplied function on each item in the array.
	* @method Array.map
	* @param a {Array} the array to iterate
	* @param f {Function} the function to execute on each item
	* @param o Optional context object
	* @static
	* @return {Array} A new array containing the return value
	* of the supplied function for each item in the original
	* array.
	*/
	YArray.map = (Native.map) ?
		function(a, f, o) {
			return Native.map.call(a, f, o);
		} :
		function(a, f, o) {
			var results = [];
			YArray.each(a, function(item, i, a) {
				results.push(f.call(o, item, i, a));
			});
			return results;
		};


	/**
	* Executes the supplied function on each item in the array.
	* Reduce "folds" the array into a single value.
	* @method Array.reduce
	* @param a {Array} the array to iterate
	* @param init The initial value to start from
	* @param f {Function} the function to execute on each item. It
	* is responsible for returning the updated value of the
	* computation.
	* @param o Optional context object
	* @static
	* @return A value that results from iteratively applying the
	* supplied function to each element in the array.
	*/
	YArray.reduce = (Native.reduce) ?
		function(a, init, f, o) {
			//Firefox's Array.reduce does not allow inclusion of a
			//  thisObject, so we need to implement it manually
			return Native.reduce.call(a, function(init, item, i, a) {
				return f.call(o, init, item, i, a);
			}, init);
		} :
		function(a, init, f, o) {
			var r = init;
			YArray.each(a, function (item, i, a) {
				r = f.call(o, r, item, i, a);
			});
			return r;
		};


	/**
	* Executes the supplied function on each item in the array,
	* searching for the first item that matches the supplied
	* function.
	* @method Array.find
	* @param a {Array} the array to search
	* @param f {Function} the function to execute on each item.
	* Iteration is stopped as soon as this function returns true
	* on an item.
	* @param o Optional context object
	* @static
	* @return {object} the first item that the supplied function
	* returns true for, or null if it never returns true
	*/
	YArray.find = function(a, f, o) {
		var l = a.length;
		for(var i=0; i < l; i++) {
			if (f.call(o, a[i], i, a)) {
				return a[i];
			}
		}
		return null;
	};

	/**
	* Iterates over an array, returning a new array of all the elements
	* that match the supplied regular expression
	* @method Array.grep
	* @param a {Array} a collection to iterate over
	* @param pattern {RegExp} The regular expression to test against
	* each item
	* @static
	* @return {Array} All the items in the collection that
	* produce a match against the supplied regular expression.
	* If no items match, an empty array is returned.
	*/
	YArray.grep = function (a, pattern) {
		return YArray.filter(a, function (item, index) {
			return pattern.test(item);
		});
	};


	/**
	* Partitions an array into two new arrays, one with the items
	* that match the supplied function, and one with the items that
	* do not.
	* @method Array.partition
	* @param a {Array} a collection to iterate over
	* @paran f {Function} a function that will receive each item
	* in the collection and its index.
	* @param o Optional execution context of f.
	* @static
	* @return An object with two members, 'matches' and 'rejects',
	* that are arrays containing the items that were selected or
	* rejected by the test function (or an empty array).
	*/
	YArray.partition = function (a, f, o) {
		var results = {matches: [], rejects: []};
		YArray.each(a, function (item, index) {
			var set = f.call(o, item, index, a) ? results.matches : results.rejects;
			set.push(item);
		});
		return results;
	};

	/**
	* Creates an array of arrays by pairing the corresponding
	* elements of two arrays together into a new array.
	* @method Array.zip
	* @param a {Array} a collection to iterate over
	* @param a2 {Array} another collection whose members will be
	* paired with members of the first parameter
	* @static
	* @return An array of arrays formed by pairing each element
	* of the first collection with an item in the second collection
	* having the corresponding index.
	*/
	YArray.zip = function (a, a2) {
		var results = [];
		YArray.each(a, function (item, index) {
			results.push([item, a2[index]]);
		});
		return results;
	};

	/**
	 * Returns true if the object is in the array.
	 * @method contains
	 * @param a {Array} the array to search
	 * @param val {Object} Required. The object to compare.
	 * @return {Boolean} True when the object is in the Array.
	 * @static
	 */
	YArray.contains = function(a, val) {
		return -1 < YArray.indexOf(a, val);
	};

	/**
	 * Returns the first element in the Array or Undefined.
	 * @method first
	 * @param a {Array} the array to search
	 * @return {Object} The first element in array.
	 * @static
	 */
	YArray.first= function(a) {
		return a[0];
	};

	/**
	 * Returns the last element in the Array or Undefined.
	 * @method last
	 * @param a {Array} the array to search
	 * @return {Object} The last element in array.
	 * @static
	 */
	YArray.last= function(a) {
		return (a.length) ? a[a.length - 1] : undefined;
	};

	/**
	 * Remove the member at index (i) in the array; does not modify the current array.
	 * @method removeIndex
	 * @param a {Array} the array to search
	 * @param n {Number} Required. The index to remove.
	 * @return {Object} The new Array or Original.
	 * @public
	 */
	YArray.removeIndex= function(a,n) {
		// invalid index
		if (0 > n || n >= a.length) {return a;}
		var resp = a.slice(0, n),
			rest = a.slice(n + 1);
		return resp.concat(rest);
	};

	/**
	 * Finds the object in the array and removes it; does not modify the current array.
	 * @method removeValue
	 * @param a {Array} the array to search
	 * @param val {Object} Required. The object to remove.
	 * @return {Object} The new Array or Original.
	 * @public
	 */
	YArray.removeValue= function(a,val) {
		return YArray.removeIndex(a,YArray.indexOf(a,val));
	};

	//////
	// Define DOM Event facade
	//////

	function DOMEventFacade(ev, currentTarget, wrapper) {

		wrapper = wrapper || {};

		var e = ev, d = document, b = d.body,
			x = e.pageX, y = e.pageY, c, t,
			overrides = wrapper.overrides || {};

		this.altKey   = e.altKey;
		this.ctrlKey  = e.ctrlKey;
		this.metaKey  = e.metaKey;
		this.shiftKey = e.shiftKey;
		this.type     = overrides.type || e.type;
		this.clientX  = e.clientX;
		this.clientY  = e.clientY;

		//////////////////////////////////////////////////////

		if (!x && 0 !== x) {
			x = e.clientX || 0;
			y = e.clientY || 0;

			if (UA.ie) {
				x += Math.max(d.documentElement.scrollLeft, b.scrollLeft);
				y += Math.max(d.documentElement.scrollTop, b.scrollTop);
			}
		}

		this._yuifacade = true;

		/**
		 * The native event
		 * @property _event
		 */
		this._event = e;

		/**
		 * The X location of the event on the page (including scroll)
		 * @property pageX
		 * @type int
		 */
		this.pageX = x;

		/**
		 * The Y location of the event on the page (including scroll)
		 * @property pageY
		 * @type int
		 */
		this.pageY = y;

		//////////////////////////////////////////////////////

		c = e.keyCode || e.charCode || 0;

		if (UA.webkit && (c in webkitKeymap)) {
			c = webkitKeymap[c];
		}

		/**
		 * The keyCode for key events.  Uses charCode if keyCode is not available
		 * @property keyCode
		 * @type int
		 */
		this.keyCode = c;

		/**
		 * The charCode for key events.  Same as keyCode
		 * @property charCode
		 * @type int
		 */
		this.charCode = c;

		//////////////////////////////////////////////////////

		/**
		 * The button that was pushed.
		 * @property button
		 * @type int
		 */
		this.button = e.which || e.button;

		/**
		 * The button that was pushed.  Same as button.
		 * @property which
		 * @type int
		 */
		this.which = this.button;

		//////////////////////////////////////////////////////

		/**
		 * Node reference for the targeted element
		 * @propery target
		 * @type Node
		 */
		this.target = resolve(e.target || e.srcElement);

		/**
		 * Node reference for the element that the listener was attached to.
		 * @propery currentTarget
		 * @type Node
		 */
		this.currentTarget = resolve(currentTarget);

		t = e.relatedTarget;

		if (!t) {
			if (e.type == "mouseout") {
				t = e.toElement;
			} else if (e.type == "mouseover") {
				t = e.fromElement;
			}
		}

		/**
		 * Node reference to the relatedTarget
		 * @propery relatedTarget
		 * @type Node
		 */
		this.relatedTarget = resolve(t);

		/**
		 * Number representing the direction and velocity of the movement of the mousewheel.
		 * Negative is down, the higher the number, the faster.  Applies to the mousewheel event.
		 * @property wheelDelta
		 * @type int
		 */
		if (e.type == "mousewheel" || e.type == "DOMMouseScroll") {
			this.wheelDelta = (e.detail) ? (e.detail * -1) : Math.round(e.wheelDelta / 80) || ((e.wheelDelta < 0) ? -1 : 1);
		}

		//////////////////////////////////////////////////////
		// methods

		/**
		 * Stops the propagation to the next bubble target
		 * @method stopPropagation
		 */
		this.stopPropagation = function() {
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
			wrapper.stopped = 1;
		};

		/**
		 * Stops the propagation to the next bubble target and
		 * prevents any additional listeners from being exectued
		 * on the current target.
		 * @method stopImmediatePropagation
		 */
		this.stopImmediatePropagation = function() {
			if (e.stopImmediatePropagation) {
				e.stopImmediatePropagation();
			} else {
				this.stopPropagation();
			}
			wrapper.stopped = 2;
		};

		/**
		 * Prevents the event's default behavior
		 * @method preventDefault
		 * @param returnValue {string} sets the returnValue of the event to this value
		 * (rather than the default false value).  This can be used to add a customized
		 * confirmation query to the beforeunload event).
		 */
		this.preventDefault = function(returnValue) {
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.returnValue = returnValue || false;
			wrapper.prevented = 1;
		};

		/**
		 * Stops the event propagation and prevents the default
		 * event behavior.
		 * @method halt
		 * @param immediate {boolean} if true additional listeners
		 * on the current target will not be executed
		 */
		this.halt = function(immediate) {
			if (immediate) {
				this.stopImmediatePropagation();
			} else {
				this.stopPropagation();
			}

			this.preventDefault();
		};

	}

	//////
	// Define Mock YUI 3 objects
	//////

	// mock the Y.Base object
	Y.Base = function(attr) {
		var host = this, // help compression
			ctx = host.constructor,
		    attrs = ctx.ATTRS;

		host.name = host.constructor.NAME;

		// ATTRS support for Node, which is not Base based
		while (attrs) {
			Y.Object.each(attrs, function(map, key) {
				host.setAttributeConfig(key, map);
			});

			if (ctx.superclass) {
				ctx = ctx.superclass.constructor;
				attrs = ctx.ATTRS;
			}
			else {
				attrs = null;
			}
		}

		host.setAttributes(attr || {});

		host.initializer(attr);
	};

	YAHOO.augment(Y.Base, YU.EventProvider);
	YAHOO.augment(Y.Base, YU.AttributeProvider);

	Y.Base.prototype.name = null;
	Y.Base.prototype.destructor = function() {};
	Y.Base.prototype.initializer = function() {};

	// mock the Y.Widget object
	Y.Widget = function() {
		Y.Widget.superclass.constructor.apply(this, arguments);
		this.set('id');
	};

	Y.Widget.ATTRS = {
		boundingBox: {
			value:null,
			setter: _wrapNode,
			writeOnce: true
		},

		contentBox: {
			setter: _wrapNode,
			writeOnce: true
		},

		disabled: {
			value: false
		},

		focused: {
			value: false,
			readOnly:true
		},

		height: {
			value: ''
		},

		id: {
			setter: function() {return Lang.getUniqueId();},
			writeOnce: true
		},

		render: {
			value:false,
			writeOnce: true
		},

		rendered: {
			value:false,
			readOnly: true
		},

		tabIndex: {
			value: null,
			validator: Lang.isNumber
		},

		visible: {
			value: true
		},

		width: {
			value: ''
		}
	};

	Y.extend(Y.Widget, Y.Base, {
		bindUI: function() {},

		destructor: function() {
			this.set('boundingBox', null);
			this.set('contentBox', null);
		},

		initializer: function() {
			if (this.get('render')) {
				this.render();
			}
		},

		/**
		 * Alias for addListener
		 * @method on
		 * @param {String} type The name of the event to listen for
		 * @param {Function} fn The function call when the event fires
		 * @param {Any} obj A variable to pass to the handler
		 * @param {Object} scope The object to use for the scope of the handler
		 */
		on: function() {
			var _this = this,
				args = arguments;

			_this.createEvent(args[0]);
			_this.addListener.apply(_this, args);

			return {
			   detach: function() {
				   _this.removeListener.apply(_this, args);
			   }
			};
		},
		
		renderUI: function() {
			if (! this.get('contentBox')) {
				this.set('contentBox', this.get('boundingBox').get('firstChild'));
			}
			else if (! this.get('boundingBox')) {
				var contentBox = this.get('contentBox'),
					pnode = contentBox.parent(),
					nnode = document.createElement('div');

				pnode.replaceChild(nnode, contentBox.get('element'));
				contentBox.appendTo(nnode);
				this.set('boundingBox', nnode);
			}
		},

		render: function() {
			this.renderUI();
			this.bindUI();
			this.syncUI();
		},

		syncUI: function() {}
	});

	// mock the DOM object
	Y.DOM = {
		byId: function(id) {return document.getElementById(id);},

		/**
		 * Searches the element by the given axis for the first matching element.
		 * @method elementByAxis
		 * @param {HTMLElement} element The html element.
		 * @param {String} axis The axis to search (parentNode, nextSibling, previousSibling).
		 * @param {Function} fn optional An optional boolean test to apply.
		 * @param {Boolean} all optional Whether all node types should be returned, or just element nodes.
		 * The optional function is passed the current HTMLElement being tested as its only argument.
		 * If no function is given, the first element is returned.
		 * @return {HTMLElement | null} The matching element or null if none found.
		 */
		elementByAxis: function(element, axis, fn, all) {
			while (element && (element = element[axis])) { // NOTE: assignment
					if ( (all || element.tagName) && (!fn || fn(element)) ) {
						return element;
					}
			}
			return null;
		}
	};

	// mock the io function
	Y.io = function(url, conf) {
		var cfg = conf || {},
		config = {
			argument: cfg.arguments,
			data: cfg.data,
			method: cfg.method || 'GET',
			scope: cfg.context,
			timeout: cfg.timeout
		},
		on;

		if (cfg.on) {
			on = cfg.on;
			config.complete = on.complete;
			config.end = on.end;
			config.failure = on.failure;
			config.start = on.start;
			config.success = on.success;
		}

		return Conn.asyncRequest(config.method, url, config, config.data);
	};

	// mock the animation object
	Y.Anim = function() {
		Y.Anim.superclass.constructor.apply(this, arguments);
		var from = this.get('from') || {},
			to = this.get('to'),
			conf = {};

		Y.Object.each(to, function(value, key) {
			conf[key] = {to: value};
		});

		Y.Object.each(from, function(value, key) {
			conf[key].from = value;
		});

		this._anim = new YU.Anim(this.get('node'), conf, this.get('duration'), this.get('easing'));
	};

	Y.Anim.ATTRS = {
		duration: {
			setter: function(value) {
				return _updateAttribute(this._anim, 'duration', value);
			}
		},

		easing: {
			setter: function(value) {
				return _updateAttribute(this._anim, 'method', value);
			}
		},

		from: {
			setter: function(value) {
				var anim = this._anim;
				if (anim) {
					Y.Object.each(value, function(v, k) {
						anim.attributes[k].from = value[k];
					});
				}

				return value;
			},
			validator: Lang.isObject
		},

		node: {
			setter: _wrapNode,
			writeOnce: true
		},

		to: {
			setter: function(value) {
				var anim = this._anim;
				if (anim) {
					Y.Object.each(value, function(v, k) {
						anim.attributes[k].to = value[k];
					});
				}

				return value;
			},
			validator: Lang.isObject
		}
	};

	Y.extend(Y.Anim, Y.Base, {
		_anim: null,

		on: function(evt, fn, data, ctx) {
			switch (evt) {
				case 'end':
					this._anim.onComplete.subscribe(fn, data, ctx);
				break;
				case 'start':
					this._anim.onStart.subscribe(fn, data, ctx);
				break;
				case 'tween':
					this._anim.onTween.subscribe(fn, data, ctx);
				break;
			}
		},

		run: function() {
			this._anim.animate();
		},

		stop: function(finish) {
			this._anim.stop(finish);
		}
	});

	// mock the Y.Node object
	Y.Node = function(elem, conf) {
		var node = (elem.indexOf && -1 < elem.indexOf('#')) ? Selector.query(elem, null, true) : elem;
		Y.Node.superclass.constructor.call(this, node, conf);

		if (! this.get('id')) {
			this.set('id', Lang.getUniqueId());
		}
	};

	Y.extend(Y.Node, YU.Element, {

		all: function(query) {
			return Y.all('#' + this.get('id') + ' ' + query);
		},

		ancestor: function(query) {
			var node = Dom.getAncestorBy(this.get('element'), function(node) {
				return Selector.filter([node], query).length;
			});
			return _wrapNode(node);
		},

		_blur: function() {
			this.get('element').blur();
		},

		blur: function() {
			var _this = this;
			if (_this.get('element')) {
				_this._blur();
			}
			else {
				_this.on('available', _this._blur, _this, true);
			}
		},

		_focus: function() {
			this.get('element').focus();
		},

		focus: function() {
			var _this = this;
			if (_this.get('element')) {
				_this._focus();
			}
			else {
				_this.on('available', _this._focus, _this, true);
			}
		},

		get: function(lbl) {
			var o = Y.Node.superclass.get.apply(this, arguments);
			return DOM_REFERENCES[lbl] && o ? new Y.Node(o) : o;
		},

		next: function(fn) {
			return _wrapNode(Dom[fn ? 'getNextSiblingBy' : 'getNextSibling'](this.get('element'), fn));
		},

		/**
		 * Alias for addListener
		 * @method on
		 * @param {String} type The name of the event to listen for
		 * @param {Function} fn The function call when the event fires
		 * @param {Any} obj A variable to pass to the handler
		 * @param {Object} scope The object to use for the scope of the handler
		 */
		on: function(type, fn, obj, scope) {
			var _this = this,
				func = function(e, o) {
					if (e.target) {
						fn.call(this, new DOMEventFacade(e, e.relatedTarget || e.originalTarget), o);
					}
					else {
						fn.call(this, e);
					}
				};

			_this.addListener.call(_this, type, func, obj, scope);

			return {
			   detach: function() {
				   _this.removeListener.call(_this, type, func, obj, scope);
			   }
			};
		},

		one: function(query) {
			return _wrapNode(Selector.query(query, this.get('element'), true));
		},

		previous: function(fn) {
			return Dom[fn ? 'getPreviousSiblingBy' : 'getPreviousSibling'](this.get('element'), fn);
		}
	});

	// mock special DOM events
	Y.Event.on = function(e, fn) {
		switch (e) {
			case 'domready':
				Event.onDOMReady(fn);
			return;
			case 'contentready':
				Event.onContentReady(fn);
			return;
			case 'available':
				Event.onAvailable(fn);
			return;
		}

		Event.addListener.apply(Event, arguments);
	};

	// mock the YUI function
	W.YUI = function() {
		return {
			add: function() {
				arguments[1].call(W, Y);
			},
			use: function() {
				arguments[arguments.length - 1].call(W, Y);
			}
		};
	};

}());