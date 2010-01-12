/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.00
 */

YUI().add('gallery-node-field', function(Y) {

/**
 * Creates a Node object augmented with extra input functionality.
 *
 * @module NodeField
 */

var LANG = Y.Lang,
NodeField = {

	/**
	 * Fetches the value from the element.
	 * @method getValue
	 * @param element {Element} Required. The input node.
	 * @return {String} The value.
	 * @static
	 */
	getValue: function(element) {
		var method = element.get('tagName').toLowerCase(),
			parameter = NodeFieldSerializer[method](element);
		return parameter ? parameter[1] : null;
	},

	/**
	 * Tests if the field has changed from the default.
	 * @method isChanged
	 * @param element {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	 * @return {Boolean} The field has changed.
	 * @static
	 */
	isChanged: function(element) {
		var fld = Y.get(element);
		if (! fld) {return false;}

		if (NodeField.isCheckable(fld)) {
			return fld.get('defaultChecked') !== fld.get('checked');
		}
		else {
			return fld.get('defaultValue') !== fld.get('value');
		}
	},

	/**
	 * Evaluates if the element is checkable type.
	 * @method isCheckable
	 * @param element {Element} Required. The input node.
	 * @return {Boolean} The element is checkable.
	 * @static
	 */
	isCheckable: function(element) {
		var type = element.get('type').toLowerCase();
		return 'checkbox' === type || 'radio' === type;
	},

	/**
	 * Evaluates if the element is a field element: input, select, textarea.
	 * @method isField
	 * @param element {Element} Required. The node.
	 * @return {Boolean} The element is a field.
	 * @static
	 */
	isField: function(element) {
		var tagName = element.getTagName();
		return 'input' == tagName || 'select' == tagName || 'textarea' == tagName;
	},

	/**
	 * Serializes the form into a key value pair query string.
	 * @method serialize
	 * @param element {Element} Required. Pointer or string reference to DOM element to evaluate.
	 * @return {string} the key/value pairs as a query string.
	 * @static
	 */
	serialize: function(element) {
		var method = element.get('tagName').toLowerCase(),
			parameter = NodeFieldSerializer[method](element);

		if (parameter) {
			var key = encodeURIComponent(parameter[0]);
			if (0 === key.length) {return '';}
			if (! LANG.isArray(parameter[1])) {parameter[1] = [parameter[1]];}

			Y.each(parameter[1], function(value, i) {
				parameter[1][i] = key + '=' + encodeURIComponent(value);
			});

			return parameter[1].join('&');
		}
	},

	/**
	 * Evaluate if the element is of one of the provided types.
	 * @method isType
	 * @param element {Element} Required. Pointer or string reference to DOM element to evaluate.
	 * @param arg1 {String} Required. A type to evaluate.
	 * @param argX {String} Optional. Additional type to evaluate.
	 * @return {Boolean} The element type matches one of the provided types.
	 * @static
	 */
	isType: function(element) {
		var i,
			type = element.get('type').toLowerCase(),
			args = arguments;

		for (i = args.length - 1; 0 < i; i -= 1) {
			if (args[i] == type) {return true;}
		}

		return false;
	}
},
NodeFieldSerializer = {

	/**
	 * Finds the value of a checkbox/radio input element.
	 * @method input
	 * @param element {Element} Required. The input node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	input: function(element) {
		switch (element.get('type')) {
			case 'checkbox':
			case 'radio':
				return NodeFieldSerializer.inputSelector(element);
			default:
				return NodeFieldSerializer.textarea(element);
		}
	},

	/**
	 * Finds the value of a checkbox/radio input element.
	 * @method inputSelector
	 * @param element {Element} Required. The input node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	inputSelector: function(element) {
		if (element.get('checked')) {
			return [element.get('name'), element.get('value')];
		}
	},

	/**
	 * Finds the value of a select tag element.
	 * @method select
	 * @param element {Element} Required. The select node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	select: function(element) {
		return NodeFieldSerializer['select-one' === element.get('type') ? 'selectOne' : 'selectMany'](element);
	},

	/**
	 * Finds the value of a select-one element.
	 * @method selectOne
	 * @param element {Element} Required. The select node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	selectOne: function(element) {
		var value = '', opt, index = element.get('selectedIndex');
		if (0 <= index) {
			opt = element.get('options').item(index);
			value = opt.get('value') || opt.get('text');
		}
		return [element.get('name'), value];
	},

	/**
	 * Finds the value of a select-many element.
	 * @method selectMany
	 * @param element {Element} Required. The select node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	selectMany: function(element) {
		var value = [], opt;

		for (var i = 0; i < element.get('length'); i += 1) {
			opt = element.get('options').item(i);
			if (opt.get('selected')) {
				value.push(opt.get('value') || opt.get('text'));
			}
		}

		return [element.get('name'), value];
	},

	/**
	 * Finds the value of a select-one element.
	 * @method textarea
	 * @param element {Element} Required. The select node.
	 * @return {Array} The name/value pairs.
	 * @static
	 */
	textarea: function(element) {
		return [element.get('name'), element.get('value')];
	}
};

Y.NodeField = NodeField;
Y.NodeFieldSerializer = NodeFieldSerializer;

}, {requires: ['node']});