/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Form module provides helper methods for manipulating Form elements.
 * @module form
 * @title form Utility
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form) {

/**
 * Provides helper methods for Form elements.
 * @class Form
 * @namespace YAHOO.util
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'extend', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _YF = YAHOO.namespace('util.Form'),
        $ = _YD.get;

	// static namespace
    var _that = {

        /**
         * Removes all values from form fields.
         * @method clear
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @param iTypes {Array} Optional. An array of input types to ignore.
         * @static
         */
        clear: function(elem, iTypes) {
            var form = $(elem),
                ignoreTypes = Array.is(iTypes) ? iTypes : [];

            var fx = function(fld) {
                // IE 7 will insert some elements without a type; then test if the node type is supposed to be ignored.
                var type = _YF.Element.getType(fld);

                if (type && -1 === ignoreTypes.indexOf(type)) {
                    _YF.Element.clear(fld);
                }
            };

            _YL.arrayWalk(form.getElementsByTagName('input'), fx);
            _YL.arrayWalk(form.getElementsByTagName('textarea'), fx);
            _YL.arrayWalk(form.getElementsByTagName('select'), function(fld) {
                _YF.Element.clear(fld);
            });
        },

        /**
         * Disables the form and all it's serializable elements.
         * @method disable
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @static
         */
        disable: function(elem) {
            var form = $(elem);
            form.disabled = 'true';
            _YL.arrayWalk(_YF.getFields(form), _YF.Element.disable);
        },

        /**
         * Enables the form and all it's serializable elements.
         * @method enable
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @static
         */
        enable: function(elem) {
            var form = $(elem);
            form.disabled = '';
            _YL.arrayWalk(_YF.getFields(form), _YF.Element.enable);
        },

		/**
		 * Retrieves the first non-hidden element of the form.
		 * @method findFirstElement
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param iTypes {Array} Optional. An array of input types to ignore; default is 'hidden'.
		 * @return {Element} The first field not of the ignored types or NULL.
		 * @static
		 */
		findFirstElement: function(elem, iTypes) {
			return _YL.arrayWalk(_YF.getFields(elem, '', iTypes), function(fld) {
				return fld;
			});
		},

		/**
		 * Retrieves the first non-hidden element of the form and focuses on it.
		 * @method focusFirstElement
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param iTypes {Array} Optional. An array of input types to ignore; default is 'hidden'.
		 * @static
		 */
		focusFirstElement: function(elem, iTypes) {
			_YF.Element.focus(_YF.findFirstElement(elem, iTypes || ['hidden']));
		},

		/**
		 * Retrieves all serializable elements of the form; sorts them top to bottom, left to right by defualt.
		 *  note: DOM iterating is faster than using getElementsByTagName("*")
		 * @method getFields
	     * @param elem {String|Element} Required. The pointer or string reference to DOM Form element.
	     * @param fldName {String} Optional. A name to filter by.
		 * @param iTypes {Array} Optional. List of element types to ignore; default is hidden.
		 * @return {Array} A collection of Form fields.
		 * @static
		 */
		getFields: function(elem, fldName, iTypes) {
			var form = $(elem),
				set = [];

			if (! form) {return set;}
            var ignoreTypes = _YL.isArray(iTypes) ? iTypes : [];

			// should be redefined each time, because of closure on 'set'
			var fn = function(nodes) {
				for (var i = 0; i < nodes.length; i += 1) {
					var fld = nodes[i],
                        tagName = _YD.getTagName(fld),
                        isValidTag = ('input' === tagName || 'textarea' === tagName || 'select' === tagName),
                        isValidName = (! fldName || fldName === fld.name);

					if (isValidTag && isValidName && -1 === ignoreTypes.indexOf(_YF.Element.getType(fld))) {
						set.push(fld);
					}
					else if (fld.childNodes.length) {
						fn(fld.childNodes);
					}
				}
			};

			fn(form.childNodes);

            return set;
		},

		/**
		 * Retrieves all input elements of the form with typeName and/or name.
		 * @method getElementsByName
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param typeName {String}	Optional. The type of input to filter by.
	     * @param name {String} Optional. The name to filter by.
		 * @param multi {Boolean} Optional. True, when mulitple elements use this name.
		 * @static
		 */
		getInputs: function(elem, typeName, name, multi) {
			var form = $(elem);
			if (! multi && name && form[name]) {return [form[name]];} // fast return for DOM compliant browsers, when name is provided; may cause issue if name is something like 'parentNode'
			var fields = form.getElementsByTagName('input');

			if (! (_YL.isString(typeName) || _YL.isString(name)) && Array.get) {return Array.get(fields);}

			var matches = [];
			_YL.arrayWalk(fields, function(fld) {
				if ((typeName && _YF.Element.getType(fld) !== typeName) || (name && fld.name !== name)) {return;}
				matches.push(fld);
			});

			return matches;
		},

		/**
		 * Serializes the form into a query string, collection &key=value pairs.
		 * @method serialize
	     * @param elem {String|Element} Required. The pointer or string reference to DOM Form element.
	     * @return {String} The serialized form.
		 * @static
		 */
		serialize: function(elem) {
			var queryComponents = [];

			_YL.arrayWalk(_YF.getFields(elem), function(fld) {
				var qc = _YF.Element.serialize(fld);
				if (qc) {queryComponents.push(qc);}
			});

			return queryComponents.join('&');
		},

		/**
		 * Enables the value of the field.
		 * @method toggleEnabled
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable fields of.
		 * @param b {Boolean} Optional. True, when enabling, falsy to disable.
		 * @static
		 */
		toggleEnabled: function(elem, b) {
            var form = $(elem);
            
            if (form) {
                var bool = _YL.isUndefined(b) ? ! form.disabled : b;
                _YF[bool ? 'enable' : 'disable'](form);
            }
        }
    };

    _YL.augmentObject(_YF, _that);
})();

}