/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element.Serializers) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array functionality.
 * @class Serializers
 * @namespace YAHOO.util.Form.Element
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _YF = YAHOO.util.Form,
        _YFE = YAHOO.util.Form.Element;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'implement', 'yahoo-ext/form.js');}
    if (! _YF) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form', 'implement', 'yahoo-ext/form.js');}
    if (! _YFE) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form.Element', 'implement', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _YFS = YAHOO.namespace('util.Form.Element.Serializers');
    
    var _that = {

        /**
         * Finds the value of a checkbox/radio input element.
         * @method input
         * @param element {String|Element} Required. The input node.
         * @return {Array} The name/value pairs.
         * @static
         */
        input: function(element) {		
            switch (_YFE.getType(element)) {
                case 'checkbox':
                case 'radio':
                    return _YFS.inputSelector(element);
                default:
                    return _YFS.textarea(element);
            }
        },

        /**
         * Finds the value of a checkbox/radio input element.
         * @method inputSelector
         * @param element {String|Element} Required. The input node.
         * @return {Array} The name/value pairs.
         * @static
         */
        inputSelector: function(element) {
            if (element.checked) {
                return [element.name, element.value];
            }
        },

        /**
         * Finds the value of a select-one element.
         * @method textarea
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        textarea: function(element) {
            return [element.name, element.value];
        },

        /**
         * Finds the value of a select tag element.
         * @method select
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        select: function(element) {
            return _YFS['select-one' === _YFE.getType(element) ? 'selectOne' : 'selectMany'](element);
        },

        /**
         * Finds the value of a select-one element.
         * @method selectOne
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        selectOne: function(element) {
            var value = '', opt, index = element.selectedIndex;
            if (0 <= index) {
                opt = element.options[index];
                value = opt.value || opt.text;
            }
            return [element.name, value];
        },

        /**
         * Finds the value of a select-many element.
         * @method selectMany
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        selectMany: function(element) {
            var value = [];

            for (var i = 0; i < element.length; i += 1) {
                var opt = element.options[i];
                if (opt.selected) {
                    value.push(opt.value || opt.text);
                }
            }

            return [element.name, value];
        }
    };

    _YL.augmentObject(_YFS, _that);
})();

}