/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.02
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array crap. Use these functions to work with forms fields.
 * @class Element
 * @namespace YAHOO.util.Form
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _YE = YAHOO.util.Event,
        _YF = YAHOO.util.Form;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'implement', 'yahoo-ext/form.js');}
    if (! _YF) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form', 'implement', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', arguments);
	}: function(text) {throw(text);};

    var _YFE = YAHOO.namespace('util.Form.Element'),
        $ = _YD.get;

    var _that = {

        attachFocusAndBlur: function() {_throwNotImplemented('attachFocusAndBlur', 'YAHOO.util.Event');},

        /**
		 * Short-cut method to do a browser safe check on any HTMLInputElement of type checkbox (possibly radio too).
		 * @method check
		 * @param elem {String|Element} Required. Pointer or string reference to checkable DOM element.
		 * @param fl {Boolean} Required. True when checkbox should be checked.
		 * @param doNotChangeValue {Boolean} Optional. True, when we should not change values.
		 * @static
		 */
		check: function(elem, fl, doNotChangeValue) {
			var node = $(elem);

			// node exists
			if (node) {
                var type = _YFE.getType(node);
                
                // node is of a valid type
				if ('checkbox' === type || 'radio' === type) {
					// if this check isn't in place Safari & Opera will check false
					if (node.checked != fl) { // do not make strict
						try {
							node.checked = fl;
							if (node.setAttribute) {node.setAttribute('checked', fl);} // insurance against some browser issues
						}
						catch (ex) {
							if (ex) {
								// squelch exception thrown by IE 8
							}
						}
						if ('checkbox' === type && ! doNotChangeValue) {node.value = fl ? 'on' : 'off';} // required for Safari, don't change value of radios
					}
				}
				// not of a valid type
				else {
					throw('Attempting to check the wrong node type: ' + type + '.');
				}
			}
			// node does not exist
			else {
				throw('Attempting to check a non-existant node.');
			}
		},

		/**
		 * Resets the value of the field.
		 * @method clear
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to clear.
		 * @static
		 */
		clear: function(elem) {
			var fld = $(elem);
			fld.value = '';
			if (fld.checked) {fld.checked = false;}
			else if (fld.selectedIndex) {fld.selectedIndex = 0;}
		},

		/**
		 * Disables the value of the field.
		 * @method disable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to disable.
		 * @static
		 */
		disable: function(elem) {
			var fld = $(elem);
			_YD.addClass(fld, C.HTML.CLS.DISABLED);
			fld.disabled = 'true';
		},

		/**
		 * Enables the value of the field.
		 * @method enable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable.
		 * @static
		 */
		enable: function(elem) {
			var fld = $(elem);
			fld.disabled = '';
			_YD.removeClass(fld, C.HTML.CLS.DISABLED);
		},

		/**
		 * Focuses on the field.
		 * @method focus
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable.
		 * @param select {Boolean} Optional. True when text should be selected; may not be possible, but will attempt.
		 * @param i {Number} Optional. The recursion counter, should be managed by this function.
		 * @static
		 */
        focus: function(elem, select, i) {
			var nodeFocus = function(node, select, i) {
				if (node) {
					try {
						if (node.focus) {
                            // 'simulateClick' fucntion exist, go ahead and simulate that the field was clicked into
                            if (_YE.simulateClick) {
                                var tagName = _YD.getTagName(node), isCheckable, isClickable;

                                // some input types need special logic
                                if ('input' === tagName) {
                                    var type = _YFE.getType(node);
                                    isCheckable = 'checkbox' === type || 'radio' === type,
                                    isClickable = 'button' === type || 'submit' === type || 'image' === type || 'reset' === type;
                                }
        
                                // don't simulate clicks on checkable and clickable elements
                                if (! (isCheckable || isClickable)) {_YE.simulateClick(node);}
                            }

                            node.setAttribute('autocomplete', 'off'); // this fixes possible "Permission denied to set property XULElement.selectedIndex ..." exception
							node.focus();
						}
						if (node.select && select) {node.select();}
					}
					catch (e) {
						if (e.message && -1 < ('' + e.message).indexOf("object doesn't support")) {return;} // squelch
						if (e && 10 > i) {
							setTimeout(function() {nodeFocus(node, select, i + 1);}, 250); // timeout, hopefully will catch IE exceptions
						}
						// taking too long, after 2.5s stop process
						else {
							// do nothing for now, just stop recursion
						}
					}
				}
			};

			_YFE.focus = function(elem, select, i) {
				var node = $(elem);
				if (! node) {return;}

                var dim = _YD.getRegion(node),
					execN = 0 < i ? i : 0;

                if (10 < execN) {return;} // stop recursion

				// element only has dimensions when it is visible
				if ('hidden' === node.type || ! (dim.width || dim.height)) {
					setTimeout(function() {_YFE.focus(node, select, i);}, 250); // timeout, hopefully will catch IE exceptions
				}
				else { // has layout
					nodeFocus(node, select, 0);
//					alert(node.outerHTML + ' | width: ' + dim.width + ' | height: ' + dim.height + ' | type: ' + node.type + ' | bool: ' + ! (dim.width || dim.height));
				}

				return node;
			};

			return _YFE.focus(elem, select, i);
        },

        /**
		 * Attempt to find the type attribute of the element.
		 * @method getType
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {String} The type or empty string.
		 * @static
		 */
		getType: function(elem) {
			var fld = $(elem);
			if (! (fld || fld.type || fld.getAttribute)) {return '';}
			return (fld.type || fld.getAttribute('type') || '').toLowerCase();
		},

		/**
		 * Attempt to find the value of field.
		 * @method getValue
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {String} The field value or empty string.
		 * @static
		 */
		getValue: function(elem) {
			var fld = $(elem),
                method = _YD.getTagName(fld);

			//	missing element is the most common error when serializing; also don't serialize validators
			if (! method) {return '';}

			var parameter = _YFE.Serializers[method](fld);
			if (parameter) {return parameter[1];}
		},

        /**
         * Tests if the element is a checkbox or radio.
         * @method isCheckable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The input is type checkbox or radio.
		 * @static
         */
        isCheckable: function(elem) {
            return _YFE.isType(elem, 'checkbox', 'radio');
        },

        /**
		 * Tests if the field has changed from the default.
		 * @method isChanged
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The field has changed.
		 * @static
         */
        isChanged: function(elem) {
            var fld = $(elem);
            if (! fld) {return false;}

            if (_YFE.isCheckable(fld)) {
                return fld.defaultChecked !== fld.checked;
            }
            else {
                return fld.defaultValue !== fld.value;
            }
        },

        /**
		 * Tests if the field has a value.
		 * @method isSet
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The field is empty or non-existing.
		 * @static
		 */
		isSet: function(elem) {
			return '' !== _YFE.getValue(elem);
		},

        /**
         * Tests if the element is a type text, password, or a textarea.
         * @method isText
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The element is type text or password or is a textarea.
		 * @static
         */
        isText: function(elem) {
            var tagName = _YD.getTagName(elem);
            return 'textarea' === tagName || _YFE.isType(elem, 'text', 'password');
        },

        /**
         * Tests if the field is one of the provided types.
         * @method isType
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @param arg1 {String} Required. A type to evaluate.
		 * @param argX {String} Required. Aditional types to evaluate.
	     * @return {Boolean} The field is one of the provided types.
		 * @static
         */
        isType: function(elem, arg1, argX) {
            var type = _YFE.getType(elem);
            if (! type) {return false;}

            return _YL.arrayWalk(arguments, function(t) {
                if (type === t) {return true;}
            });
        },

        /**
		 * Serializes the form into a key value pair query string.
		 * @method serialize
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {string} the key/value pairs as a query string.
		 * @static
		 */
		serialize: function(elem) {
			var fld = $(elem),
                method = _YD.getTagName(fld);

			//	missing element is the most common error when serializing; also don't serialize validators
			if (! method) {return '';}

			var parameter = _YFE.Serializers[method](fld);

			if (parameter) {
				var key = encodeURIComponent(parameter[0]);
				if (0 === key.length) {return '';}
				if (! _YL.isArray(parameter[1])) {parameter[1] = [parameter[1]];}

				_YL.arrayWalk(parameter[1], function(value, i) {
					parameter[1][i] = key + '=' + encodeURIComponent(value);
				});

				return parameter[1].join('&');
			}
		},

		/**
		 * Enables the value of the field.
		 * @method toggleEnabled
	     * @param elem {String|Element} Required. Pointer or string reference to DOM Form field element to enable.
		 * @param b {Boolean} Optional. True, when enabling, falsy to disable.
		 * @static
		 */
		toggleEnabled: function(elem, b) {
            var node = $(elem);

            if (node) {
                var bool = _YL.isUndefined(b) ? ! node.disabled : b;
                _YFE[bool ? 'enable' : 'disable'](node);
            }
		}
    };

    _YL.augmentObject(_YFE, _that);

    // YAHOO.json extensions are included
    if (_YE) {

        /**
		 * Updates the onblur and onclick events of the element to show default text.
		 * @method onFocusAndBlur
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to attach events to.
		 * @param text {String} Required. The default text.
		 * @param c {String} Optional. The color to set default text to.
		 * @static
		 */
        _YFE.attachFocusAndBlur = function(elem, text, c) {
			var fld = $(elem);

			// validate
	        if (fld) {
		        if ('text' !== _YFE.getType(fld)) {
					throw('YAHOO.util.Form.Element.attachFocusAndBlur() Exception - invalid field type for type: ' + _YFE.getType(fld));
				}
	        }
	        else {
		        return;
	        }

			var color = c || '#999',
				oColor = fld.style.color || '#000';

			// function that resets to the default
			var update = function(fld, text, color) {
				fld.value = text;
				fld.style.color = color;
			};

			// on focus clear value if equal to default
			_YE.on(fld, 'focus', function(e, fld) {
				if (e && text === _YFE.getValue(fld).trim()) {
					update(fld, '', oColor);
				}
			}, fld);

			// onblur reset default if no value entered
			_YE.on(fld, 'blur', function(e, fld) {
				if (e && ! _YFE.getValue(fld).trim()) {update(fld, text, color);}
			}, fld);

			// update the initial state if needed
			var val = _YFE.getValue(fld).trim();
			if (text === val || '' === val) {update(fld, text, color);}
		};
    }
})();

}