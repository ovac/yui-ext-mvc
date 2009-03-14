/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * Extending YAHOO.lang.
 * @requires YAHOO.lang
 */

/**
 * @class YAHOO.lang
 * @static
 */
(function() {    
    var _YL = YAHOO.lang,
        _YUA = YAHOO.env.ua;

	var _that = {

        /**
         * The error text to throw when a method is not implemetented.
         * @property ERROR_NOT_IMPLEMENTED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_IMPLEMENTED: 'Method "??.??" not available without including "??" in your library.',

        /**
         * The error text to throw when invalid parameters are passed into a method.
         * @property ERROR_INVALID_PARAMETERS
         * @type String
         * @static
         * @final
         */
        ERROR_INVALID_PARAMETERS: 'Method "??.??" is missing required parameter of (??) "??".',

        /**
         * The error text to throw when a required value is not defined.
         * @property ERROR_NOT_DEFINED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_DEFINED: '?? - "??" not defined, unable to ?? "??"',

        /**
         * The error text to throw when an object is missing a required key.
         * @property ERROR_MALFORMED_OBJECT
         * @type String
         * @static
         * @final
         */
        ERROR_MALFORMED_OBJECT: '?? - Object "??" does not contain required parameter (??) "??"',

        /**
		 * Iterates on the provided array and calls provided function with the value of each index.
		 * @method arrayWalk
		 * @param arr {Array} Required. The array or array-like object to iterate on (must have a length).
		 * @param fx {Function} Required. The function to execute.
		 * @param scope {Object} Optional. The execution scope.
		 * @static
		 */
		arrayWalk: function(arr, fx, scope) {
			if (! (arr || arr.length)) {return;}
			var n = arr.length;
			for (var i = 0; i < n; i+= 1) {
				var o = fx.call(scope || window, arr[i], i);
				if (_YL.isDefined(o)) {return o;}
			}
		},

		/**
		 * Wrapper for simple lazy-loading functions.
		 * @method callLazy
		 * @param callback {Function} Required. The callback method.
		 * @param isReady {Function} Required. The is ready test function.
		 * @param conf {Object} Optional. Configuration options for execution.
		 *          failure: {Function} The method to call if max iteration is reached.
		 *          maxExec: {Number} The maximum number of time to execute; default is 25.
		 *          timeout: {Number} The number of milliseconds to wait before checking 'isReady'; default is 100ms.
		 *          params: {Object} An object to pass through to callback function.
		 * @static
		 */
		callLazy: function(callback, isReady, conf) {
            // define cfg and set default values
            var cfg = _YL.isObject(conf) ? conf : {};
            if (! (0 < cfg.maxExec)) {cfg.maxExec = 25;}
            if (! (0 < cfg.timeout)) {cfg.timeout = 100;}
            if (! _YL.isFunction(callback)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', typeof callback, callback);}
            if (! _YL.isFunction(isReady)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', typeof isReady, isReady);}

            var fx = function(index) {
                // index does not yet exceed maxExec
                if (cfg.maxExec > index) {
                    if (isReady()) {
                        callback(cfg.params);
                    }
                    else {
					    setTimeout(function() {fx.call(this, index + 1);}, cfg.timeout);
                    }
                }
                // exceeding maxExec; terminate
                else {
                    // was a failutre function provided
                    if (_YL.isFunction(cfg.failure)) {
                        cfg.failure(fx, cfg, i);
                    }
                }
            };

            fx(0);
		},

        /**
         * Provides a safe method for executing a for ... in" loop on the provided object, calling the function with the object and key.
         * @method forEach
         * @param obj {Object} Required. The object to loop through.
         * @param fx {Function} Required. The callback function.
         * @static
         */
        forEach: function(obj, fx) {
            if (! (_YL.isDefined(obj) && _YL.isFunction(fx))) {return;}
    
            // iterate on the keys in data
            for (var k in obj) {
                var o = obj[k];

                if (! _YL.isFunction(o)) { // ignore functions
                    fx(o, k);
                }
            }
        },

        /**
         * Evaluates if the provided object is an arguments object or not.
         * @method isArgument
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is an argument.
         * @static
         */
        isArgument: function(o) {
            return _YL.isObject(o) && o.callee;
        },

        /**
         * Evaluates if the provided object is an Date object or not; the special "o.length" check is for Array-Like object that may not have 'constructor'.
         * @method isDate
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a Date.
         * @static
         */
        isDate: function(o) {
            return _YL.isObject(o) && _YL.isUndefined(o.length) && Date === o.constructor;
        },

        /**
         * Evaluates if the provided object is defined or not; defined means not NULL and not UNDEFINED. Slightly more performance than YAHOO.lang.isValue.
         * @see YAHOO.lang.isValue
         * @method isDefined
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a defined.
         * @static
         */
        isDefined: function(o) {
		    return o || ! (undefined === o || null === o);
        },

        /**
         * Test if the client browser is firefox.
         * @method isFireFox
         * @return {Boolean} The client is firefox.
         * @static
         */
        isFireFox: function() {
            /** @namespace _YUA.firefox */
            return 0 < _YUA.firefox;
        },

        /**
         * Test if the client browser is IE.
         * @method isIE
         * @return {Boolean} The client is IE.
         * @static
         */
        isIE: function() {
            return 0 < _YUA.ie;
        },

        /**
         * Test if the client browser is IE 6.
         * @method isIE6
         * @return {Boolean} The client is IE 6.
         * @static
         */
        isIE6: function() {
            return 7 > _YUA.ie;
        },

        /**
         * Test if the client browser is IE 7.
         * @method isIE7
         * @return {Boolean} The client is IE 7.
         * @static
         */
        isIE7: function() {
            return 7 <= _YUA.ie || 8 >= _YUA.ie;
        },

        /**
         * Test if the client browser is opera.
         * @method isOpera
         * @return {Boolean} The client is opera.
         * @static
         */
        isOpera: function() {
            return 7 > _YUA.opera;
        },

        /**
         * Evaluates if the provided object is a regular expression object or not.
         * @method isRegExp
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a RegExp.
         * @static
         */
        isRegExp: function(o) {
            return _YL.isObject(o) && o.match;
        },

        /**
         * Test if the client browser is safari.
         * @method isSafari
         * @return {Boolean} The client is safari.
         * @static
         */
        isSafari: function() {
            return 0 < _YUA.webkit;
        },

        /**
         * Throws the provided error text after performing text replacement.
         * @method throwError
         * @param text {String} Required. The error text.
         * @static
         */
        throwError: function(text) {
			var params = [];
			
			var fx = function() {
				_YL.arrayWalk(arguments, function(o) {
					if (_YL.isArray(o) || _YL.isArgument(o)) {
						fx.apply(this, o);
					}
					else {
						params.push(o);
					}
				});
			};
			
			_YL.throwError = function() {
				params = [];
				fx.apply(this, arguments);
				
				var str = '' + params[0];
				_YL.arrayWalk(params.slice(1), function(o) {
					str = str.replace(/\?\?/, o);
				});
				
				throw(str);
			};
			
			_YL.throwError.apply(this, arguments);
        }
    };

    // fixing IE; index of is assumed to be available
    if (! Array.prototype.indexOf) {

        // this is not to be JavaDoc'ed as it will confuse the compiler
        /*
         * The last index of value in the array.
         * @namespace window
         * @method indexOf
         * @param val {Object} Required. Any non-Object, object.
         * @param strict {Boolean} Optional. True when also comparing type.
         * @return {Number} The index of value or -1 when object is not in array.
         * @public
         */
        Array.prototype.indexOf = function(val, strict) {
            var t1 = _YL.arrayWalk(this, function(o, i) {
                return (o === val) || (! strict && o == val) ? i : false;
            });
            return _YL.isNumber(t1) ? t1 : -1;
        };
    }
	
    _YL.augmentObject(_YL, _that);
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.03
 */

/**
 * Define global constants.
 * @module window
 */
(function() {
    
    /**
     * This Class contains global constants that to made be available throughout the codebase.
     * @class C
     * @static
     */
    if (! YAHOO.lang.isObject(window.C)) {window.C = {};} // don't override C, unless necessary

    /**
     * The global object to hold all HTML constants.
     * @namespace C
     * @class HTML
     * @static
     */
    C.HTML={};

    /**
     * The global object to hold all className constants.
     * @namespace C.HTML
     * @class CLS
     * @static
     */
    C.HTML.CLS={};

    /**
     * The DOM class attribute for applying disabled styles and/or identifying element state.
     * @property DISABLED
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.DISABLED='disabled';

    /**
     * The DOM class attribute for applying error styles.
     * @property ERROR
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.ERROR='error';

    /**
     * The DOM class attribute for emulating :first-child psuedo class.
     * @property FIRST
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.FIRST='first';

    /**
     * The DOM class attribute for applying the "visibility:hidden" style.
     * @property HIDDEN
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HIDDEN='hidden';

    /**
     * The DOM class attribute for applying the "display:none" style.
     * @property HIDE
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HIDE='displayNone';

    /**
     * The DOM class attribute for emulating :hover psuedo class.
     * @property HOVER
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HOVER='hover';

    /**
     * The DOM class attribute for emulating :last-child psuedo class.
     * @property LAST
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.LAST='last';

    /**
     * The DOM class attribute for applying message styles.
     * @property MESSAGE
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.MESSAGE='message';

    /**
     * The DOM class attribute for identifying 'next' elements (usually used in pagination).
     * @property NEXT
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.NEXT='next';

    /**
     * The DOM class attribute for applying open styles and/or identifying element state.
     * @property OPEN
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.OPEN='open';

    /**
     * The DOM class attribute for identifying 'previous' elements (usually used in pagination).
     * @property PREV
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.PREV='prev';

    /**
     * The DOM class attribute for applying selected styles and/or identifying element state.
     * @property SELECTED
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.SELECTED='selected';

    /**
     * The global object to hold all ID constants.
     * @namespace C.HTML
     * @class ID
     * @static
     */
    C.HTML.ID={};

    /**
     * The DOM id attribute for identifying the project's body element.
     * @property BODY
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.ID.BODY = 'project';

    /**
     * The name object to hold all naming constants.
     * @namespace C.HTML
     * @class NAME
     * @static
     */
    C.HTML.NAME={};

    /**
     * The DOM name attribute for tasks.
     * @property TASK
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.NAME.TASK='task';
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.06
 */

/**
 * Extending YAHOO.util.Dom.
 * @module dom
 * @namespace YAHOO.util
 * @requires yahoo, dom
 */

/**
 * @class Dom
 * @static
 */
(function() {
    var _DOC = document,
        _YD = YAHOO.util.Dom,
        _YE = YAHOO.util.Event,
        _YL = YAHOO.lang;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'extend', 'yahoo-ext/dom.js');}
		
	var $ = _YD.get,
        _scrollIntervalId = 0;

    C.HTML.CLS.IS_DELETING = 'isDeleting';

    /**
	 * W3C DOM Level 2 standard node types; for older browsers and IE.
	 */
	if (! _DOC.ELEMENT_NODE) {
		_DOC.ELEMENT_NODE = 1;
		_DOC.ATTRIBUTE_NODE = 2;
		_DOC.TEXT_NODE = 3;
		_DOC.CDATA_SECTION_NODE = 4;
		_DOC.ENTITY_REFERENCE_NODE = 5;
		_DOC.ENTITY_NODE = 6;
		_DOC.PROCESSING_INSTRUCTION_NODE = 7;
		_DOC.COMMENT_NODE = 8;
		_DOC.DOCUMENT_NODE = 9;
		_DOC.DOCUMENT_TYPE_NODE = 10;
		_DOC.DOCUMENT_FRAGMENT_NODE = 11;
		_DOC.NOTATION_NODE = 12;
	}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Dom', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /* defined below */
        animate: function() {_throwNotImplemented('animate', 'yahoo/animation.js');},

        /**
         * Removes whitespace-only text node children.
         * @method cleanWhitespace
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {Element} Cleaned DOM node for convenience or NULL.
         * @static
         */
        cleanWhitespace: function(elem) {
            var node = $(elem);
            if (! node) {return null;}
            var cld = node.firstChild;

            while (cld) {
                var nextNode = cld.nextSibling;
                
                if (_DOC.COMMENT_NODE === cld.nodeType || (_DOC.TEXT_NODE === cld.nodeType && ! /\S/.test(cld.nodeValue))) {
                    node.removeChild(cld);
                }

                cld = nextNode;
            }

            return node;
        },

        /**
         * Positions the second element at the same coords as the first.
         * @method cloneDimensions
         * @param srcElem {Element|String} Required. The element to get position of.
         * @param applyElem {Element|String} Required. The element to set position of.
         * @static
         */
        cloneDimensions: function(srcElem, applyElem) {
            var o = _YD.getRegion(srcElem),
                node = $(applyElem);

            if (_YL.isUndefined(o.height)) { // for YUI < 2.7
                o.height = o.bottom - o.top;
                o.width = o.right - o.left;
            }

            _YD.setStyle(node, 'left', o.left + 'px');
            _YD.setStyle(node, 'top', o.top + 'px');
            _YD.setStyle(node, 'height', o.height + 'px');
            _YD.setStyle(node, 'width', o.width + 'px');

            // debugging tools
            // _YD.setStyle(node, 'border', 'red solid 1px');
    		// alert(node.id + 'left: ' + o.left + ', top: ' + o.top + ', height: ' + o.height + ', width: ' + o.width);
        },

        /**
         * If possible creates the document element according to the xhtml namespace, otherwise, normally;
         *  failure returns a Function that throws an exception.
         * @method createNode
         * @param tagName {String} Required. Tag name to create.
         * @return {Element} The newly created element.
         * @static
         */
        createNode: function(tagName) {
            if (_DOC.createElementNS) {
                _YD.createNode = function(tagName) {
                    return tagName ? _DOC.createElementNS('http://www.w3.org/1999/xhtml', tagName) : null;
                };
            }
            else if (_DOC.createElement) {
                _YD.createNode = function(tagName) {
                    return tagName ? _DOC.createElement(tagName) : null;
                };
            }
            else {
                _YD.createNode = function() {throw 'createElement is not available.';};
            }

            return _YD.createNode(tagName);
        },

        /* defined below */
        createTag: function() {_throwNotImplemented('createTag', 'yahoo.ext/lang.js');},

        /**
         * Removes a node from the DOM, using a fading animation and clearning all events.
         * @method deleteNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to delete.
         * @param func {Function} Optional. The callback function after animation finishes; default is undefined.
         * @param isRemoveListener {Boolean} Optional. True, when you want to purge event listeners from node and children; default is undefined.
         * @param isAnimate {Boolean} Optional. Animated this action.
         * @return {Boolean} Node deleted.
         * @static
         */
        deleteNode: function(elem, func, isRemoveListener, isAnimate) {
            var node = $(elem),
                fn = _YL.isFunction(func) ? func : function() {};
            if (! node || _YD.hasClass(node, C.HTML.CLS.IS_DELETING)) {return false;}
            var parent = node.parentNode;

            // remove listeners when YAHOO.util.Event is available, but not required
            if (isRemoveListener && _YE && _YE.purgeElement) {_YE.purgeElement(node);}

            // animate when YAHOO.util.Anim  is available, but not required
            if (YAHOO.util.Anim && isAnimate) {
                _YD.addClass(node, C.HTML.CLS.IS_DELETING);
                _YD.animate(node, {opacity: {from: 1, to: 0.25}}, 0.5, YAHOO.util.Easing.easeOut, [{id: 'onComplete', fx: function() {
                    parent.removeChild(node);
                    _YD.addClass(node, C.HTML.CLS.IS_DELETING);
                    if (fn) {fn(parent);}
                }}]);
            }
            else {
                parent.removeChild(node);
                fn(parent);
            }

            return true;
        },

        /**
         * Navigates on the element through native JavaScript properties or YUI equivalent, as provided by instructions.
         * @method exec
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search from.
         * @param instructions (String} Required. The '.' delimited navigation instructions.
         * @return {Element} The found node or NULL.
         * @static
         */
        exec: function(elem, instructions) {
            var node = $(elem);

            if (! (node && instructions)) {return null;}

            var _s = instructions.split('.');

            for (var i = 0; i < _s.length; i += 1) {
                if (node) {
                    var task = _s[i];

                    if (_YD[task]) {
                        node = _YD[task](node);
                    } // todo: support childNodes[]
                    else if (node[task]) {
                        node = node[task];
                    }
                    else {
                        // unsupported technique
                    }
                }
                else {
                    return true;
                }
            }

            return node;
        },

        /**
         * Find and replace the first text (ignores whitespaces), or append a textnode when there is no textnode.
         * @method findFirstText
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @return {Element} The first available text node or null.
         * @static
         */
        findFirstText: function(elem) {
			var node = $(elem);
			if (! node) {return null;}

            // this is a text node and not a whitespace, so update it
            if (_YD.isTextNode(node) && ('' === node.nodeValue || /\S/.test(node.nodeValue))) {
				return node;
			}
			// find text node
			else {
                var firstText = null,
                    nextSibling = node.firstChild;

                // iterate until nextSibling is null or set to false, indicating we have found a matching node
                while (! firstText && nextSibling) {
                    firstText = _YD.findFirstText(nextSibling);
                    nextSibling = nextSibling.nextSibling;
                }

                return firstText;
			}
        },

        /**
         * Animates the background color of the element with a color flash.
         * @method flashBackgroundColor
         * @param node {Element} Required. Pointer or string reference to DOM element to animate.
         * @param color {String} Required. The color to animate to.
         * @static
         */
        flashBackgroundColor: function(node, color) {
            if (! (node || color)) {return;}

            var attr = {backgroundColor: {to: color}},
                anim = new YAHOO.util.ColorAnim(node, attr),
                oColor = _YD.getBackgroundColor(node);

            anim.onComplete.subscribe(function() {
                setTimeout(function() {
                    var attr = {backgroundColor: {to: oColor}},
                        anim = new YAHOO.util.ColorAnim(node, attr);

                    anim.animate();
                }, 500);
            });

            anim.animate();
        },

        /**
         * Determines the background color of an element in Hexidecimal format, will head up the document stack, if transparent.
         * @method getBackgroundColor
         * @param node {Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {String} The background color.
         * @static
         */
        getBackgroundColor: function(node) {
            if (! node) {return null;}
            var backgroundColor = _YD.getStyle(node, 'backgroundColor');
            if ('transparent' === backgroundColor) {return _YD.getBackgroundColor(node.parentNode);}
            var rgb = backgroundColor.replace(/rgba?\((.*?)\)/, '$1').split(', ');
            return String.RGBtoHex(rgb[0], rgb[1], rgb[2]);
        },

        /**
         * Retrieves the HTMLBodyElement, x-browser safe.
         * @method getBodyElement
         * @param newDoc {Document} Optional. The document to use.
         * @return {Element} Body DOM node for convenience or NULL.
         * @static
         */
        getBodyElement: function(newDoc) {
            var body;

            if (! newDoc || newDoc === _DOC) {body = $(C.HTML.ID.BODY);} // get body by the ID

            if (! body) { // find the body the tag
                var doc = newDoc || _DOC;
                body = doc.getElementsByTagName('body')[0];

                if (! body) { // try find the body on the document
                    //noinspection XHTMLIncompatabilitiesJS
                    body = doc.body || doc.childNodes[0].childNodes[1];

                    if (! body) { // No body, try appending to document
                        body = doc;
                    }
                }
            }

            return body;
        },

        /**
         * Fetchs the childNode of the node, whilst ignoring whitespaces.
         * @method getChildNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @param i {Number} Required. The index of the node to get;
         * @return {Element} The pointer to the found DOM node or NULL.
         * @static
         */
        getChildNode: function(elem, i) {
            var j = 0,
                node = $(elem);

            if (! node) {return null;}

            return _YD.getFirstChildBy(node, function() {
                if (i === j) {return true;}
                j += 1;
            });
        },

        /**
         * Find the common ancestor shared by two elements, or NULL otherwise.
         * @method getCommonAncestor
         * @param elem1 {Element} Required. Pointer or string reference to DOM element to search.
         * @param elem1 {Element} Required. Pointer or string reference to DOM element to search.
         * @return {Element} The desired node or null.
         * @static
         */
        getCommonAncestor: function(elem1, elem2) {
            var node1 = $(elem1),
                node2 = $(elem2);

            if (! (node1 && node2)) {return null;} // missing parameter, fail
            node1 = node1.parentNode;

            // iterate up the DOM tree
            while (node1) {
                if (_YD.isAncestor(node1, node2)) {return node1;}
                node1 = node1.parentNode;
            }

            return null;
        },

        /* defined below */
		getContentAsFloat: function() {_throwNotImplemented('getContentAsFloat', 'yahoo.ext/lang.js');},

        /* defined below */
		getContentAsInteger: function() {_throwNotImplemented('getContentAsInteger', 'yahoo.ext/lang.js');},

        /* defined below */
		getContentAsString: function() {_throwNotImplemented('getContentAsString', 'yahoo.ext/lang.js');},

        /**
         * Returns the left and top scroll value of the document.
         * @method getDocumentScroll
         * @param doc {HTMLDocument} Optional. The document to evaluate.
         * @return {Object} An object where left/top (Number) are the values the document is scrolled to.
         * @static
         */
        getDocumentScroll: function(doc) {
            return {left: _YD.getDocumentScrollLeft(doc), top: _YD.getDocumentScrollTop(doc)};
        },

        /**
         * Returns the height and width of the document.
         * @method getDocumentSize
         * @param doc {HTMLDocument} Optional. The document to evaluate.
         * @return {Object} An object where height/width (Number) are the actual height/width of document (which includes the body and its margin).
         * @static
         */
        getDocumentSize: function(doc) {
            return {height: _YD.getDocumentHeight(doc), width: _YD.getDocumentWidth(doc)};
        },

        /* defined below */
		getElementsByTagName: function() {_throwNotImplemented('getElementsByTagName', 'native.ext/array.js');},

		/**
		 * Returns the first childnode of the node with tag name and class name.
		 * @method getFirstChildByTagAndClass
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param tagName {String} Optional. The DOM node tag name to limit by.
		 * @param className {String} Optional. The DOM node attribute class name to limit by.
		 * @return {Element} The first matching element or null.
		 * @static
		 */
		getFirstChildByTagAndClass: function(elem, tagName, className) {
			var node = $(elem);

			if (! (node && _YL.isString(tagName) && _YL.isString(className))) {return null;}

			return _YD.getFirstChildBy(node, function(node) {
				var tn = _YD.getTagName(node);
				return (tn === tagName && _YD.hasClass(node, className));
			});
		},

        /**
         * Retrieves the first text nodes value.
         * @method getFirstText
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @return {String} The value of the first text node.
         * @static
         */
        getFirstText: function(elem) {
            var node = _YD.findFirstText(elem);
            if (! node) {return '';}
            return _YD.isTextNode(node) ? node.nodeValue : '';
        },

		/**
		 * Returns an image object with src, useful for image caching.
		 * @method getImage
		 * @param src {String} Required. The location of the image.
		 * @return {Image} A Javascript Image Object with the src set.
		 * @static
		 */
		getImage: function(src) {
			var img = new Image();
			img.src = src;
			return img;
		},

		/*
		 * Finds element's absolute position.
		 * @method getPos
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {Object} The {x:posX, y:posY} of DOM node.
		 * @static
		 *//*
		getPos: function(elem) {
			var node = $(elem),
				curleft = 0, curtop = 0;

			if (node && node.offsetParent) {
				curleft = node.offsetLeft;
				curtop = node.offsetTop;

				while (node.offsetParent) {
					node = node.offsetParent;
					curleft += node.offsetLeft;
					curtop += node.offsetTop;
				}
			}

			return {x:curleft, y:curtop};
		},*/

        /**
         * Safe method for fetching the tagName of a node; also converts to lower-case.
         * @method getTagName
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {String} The tagName or an emtpy string.
         * @static
         */
        getTagName: function(elem) {
            var node = $(elem);
            return node ? ('' + node.tagName).toLowerCase() : '';
        },

        /**
         * Returns the current height and width of the viewport.
         * @method getViewport
         * @return {Object} An object where height/width (Number) are the current viewable area of the page (excludes scrollbars).
         * @static
         */
        getViewport: function(doc) {
            return {height: _YD.getViewportHeight(doc), width: _YD.getViewportWidth(doc)};
        },

        /* defined below */
        hide: function() {_throwNotImplemented('hide', 'yahoo.ext/lang.js');},

		/*
		 * X-browser importNode function to insert.
		 * @method _importNode
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to activate.
		 * @param allChildren {Boolean} Required. Set to true, when you want to copy the children nodes as well.
		 * @static
		 * @deprecated Note: keeping around, as I might one day want to use it again
		 *
		 * Example:
		 *  var newNode = null, importedNode = null;
		 *
		 *  newNode = xhrResponse.responseXML.getElementsByTagName ('title')[0].childNodes[0];
		 *  if (newNode.nodeType != document.ELEMENT_NODE) {newNode = newNode.nextSibling;}
		 *  if (newNode) {
		 *  importedNode = document._importNode(newNode, true);
		 *  document.getElementById('divTitleContainer').appendChild(importedNode);
		 *  if (!document.importNode) {
		 *     document.getElementById('divTitleContainer').innerHTML = document.getElementById('divTitleContainer').innerHTML;
		 *  }
		 *  }
		 *//*
		_importNode: function(elem, allChildren) {
			var node = YAHOO.util.$(elem);

			switch (node ? null : node.nodeType) {
				case document.ELEMENT_NODE:
					var newNode = document.createElement(node.nodeName);

					// does the node have any attributes to add?
					if (node.attributes && node.getAttribute && newNode.setAttribute && 0 < node.attributes.length) {
						Mint.batch(node.attributes, function(n) {
							if (n && Object.is(n) && node.getAttribute(n.nodeName)) {
								newNode.setAttribute(n.nodeName, node.getAttribute(n.nodeName));
							}
						});
					}

					// are we going after children too, and does the node have any?
					if (allChildren && node.childNodes && 0 < node.childNodes.length) {
						Mint.batch(node.childNodes, function(n) {
							newNode.appendChild(document._importNode(n, allChildren));
						});
					}

					return newNode;

				case document.TEXT_NODE:
				case document.CDATA_SECTION_NODE:
				case document.COMMENT_NODE:
					return document.createTextNode(node.nodeValue);

				default:
					return null;
			}
		},*/

        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy; this is different from YUI method,
         * because it takes no shortcuts and works right all the time.
         * @method isAncestorOf
         * @param ancestor {String | HTMLElement} Required. The possible ancestor.
         * @param decendant {String | HTMLElement} Required. The possible decendant.
         * @return {Boolean} Is ancestor of decendant.
         * @static
         */
        isAncestorOf: function(ancestor, decendant) {
            var haystack = _YD.get(ancestor),
                needle = _YD.get(decendant);

            if (! (haystack && needle)) {return null;}

            while (needle && needle !== _DOC) {
                if (needle === ancestor) {return true;}
                needle = needle.parentNode;
            }

            return false;
        },

        /* defined below */
        isTagName: function() {_throwNotImplemented('isTagName', 'yahoo.ext/lang.js');},

        /* defined below */
        isElementType: function() {_throwNotImplemented('isElementType', 'yahoo.ext/lang.js');},

        /**
         * Tests if the node is one of 3 text types.
         * @method isTextNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {Boolean} True, if the elem is a comment, text, or cdata node.
         * @static
         */
        isTextNode: function(elem) {
            var node = $(elem),
                isValidNode = node && node.nodeType; // not calling isNodeOfType because this is faster

            return isValidNode && (node.nodeType === _DOC.CDATA_SECTION_NODE || node.nodeType === _DOC.COMMENT_NODE || node.nodeType === _DOC.TEXT_NODE);
        },

        /**
         * Remove childNodes from node, should be used instead of element.innerHTML = '' as this is xhtml compliant.
         * @method removeChildNodes
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to clear.
         * @return {Number} The number of removed nodes.
         * @static
         */
        removeChildNodes: function(elem) {
            var val = false,
                node = $(elem);

            if (node) {
                val = node.childNodes.length;
                while (node.hasChildNodes()) {
                    node.removeChild(node.firstChild);
                }
            }

            return val;
        },

		/**
		 * Replaces all children of elem as a textnode of text.
		 * @method replace
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to replace content of.
		 * @param text {String} Required. The innerHTML value equivalent to replace content with.
		 * @static
		 */
		replace: function(elem, text) {
			var node = $(elem);
            if (! node) {return;}
            //noinspection InnerHTMLJS
            node.innerHTML = text;
		},

        /**
         * Scrolls to a given position, animating using a fractal algorithm.
         * @method scrollTo
         * @param x {Number} Required. The x position to scroll to.
         * @param y {Number} Required. The y position to scroll to.
         * @param n {Number} Optional. The number of steps to take; default is 5.
         * @param ms {Number} Optional. The length of time to animate.
         * @param ease {Function} Optional. The easing function.
         * @static
         */
        scrollTo: function(x, y, n, ms, ease) {
            //noinspection UnnecessaryLocalVariableJS
            var offset = _YD.getDocumentScroll(),
                steps = n || 5,
                i = steps,
                time = ms || 250,
                xdiff = x - offset.left,
                ydiff = y - offset.top,
                fx = ease ? ease : function(i) {
                    return Math.pow(2, i); // easing out; fast then slow
                };

            if (offset.left === x && offset.top === y) {return;} // no need to scroll

            clearInterval(_scrollIntervalId);
            _scrollIntervalId = setInterval(function() {
                i -= 1;
                var divisor = fx(i, steps);

                window.scroll(xdiff / divisor + offset.left, ydiff / divisor + offset.top);

                // last step
                if (0 === i) {
                    clearInterval(_scrollIntervalId);
                    window.scroll(x, y);
                }
            }, time / steps);
        },

		/**
		 * Scroll to the top of the page using the native window.scroll method and 0,0 coordinates.
		 * @method scrollTop
		 * @static
		 */
		scrollTop: function() {
			_that.scrollTo(0, 0);
		},

        /**
         * Find and replace the first text, or append a textnode when there is no textnode.
         * @method setFirstText
         * @param elem {String|Element} Required. A pointer or string reference to DOM element to set first text of.
         * @param text {String} Required. The text value to set.
         * @static
         */
        setFirstText: function(elem, text) {
            var node = $(elem);
            if (! node || ! _YL.isDefined(text)) {return;}
            var tn = _YD.findFirstText(node);
            if (tn) {tn.nodeValue = text;}
        },

        /* defined below */
        show: function() {_throwNotImplemented('show', 'yahoo.ext/lang.js');},

		/**
		 * Toggles the className for the provided element as a result of the boolean.
		 * @method toggleClass
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element apply class to.
		 * @param className {String} Required. The class name to apply.
		 * @param b {Boolean} Optional. Force class instead of toggle.
		 */
		toggleClass: function(elem, className, b) {
			var bool = _YL.isUndefined(b) ? ! _YD.hasClass(elem, className) : b;
			_YD[bool ? 'addClass' : 'removeClass'](elem, className);
		},

		/**
		 * Hides displayed elements and shows non-displayed element.
		 * @method toggleDisplay
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to style.
		 * @param b {Boolean} Optional. Force display instead of toggle.
		 * @static
		 */
		toggleDisplay: function(elem, b) {
			_YD.toggleClass(elem, C.HTML.CLS.HIDE, ! b);
		},

		/**
		 * Toggles the visibility of element.
		 * @method visibility
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to toggle style of.
		 * @param b {Boolean} Optional. Force visible instead of toggle.
		 * @static
		 */
		toggleVisibility: function(elem, b) {
			_YD.toggleClass(elem, C.HTML.CLS.HIDDEN, ! b);
		}
    };

    _YL.augmentObject(_YD, _that);

    // backwards compatibility for 'getRegion', height/width added in YUI 2.7
    var bodyRegion = _YD.getRegion(_YD.getBodyElement());
    if (! bodyRegion.height) {
        _YD.$old_getRegion = _YD.getRegion;
        _YD.getRegion = function() {
            var dim = _YD.$old_getRegion.apply(this, arguments);
            dim.height = dim.bottom - dim.top;
            dim.width = dim.right - dim.left;
            return dim;
        };
    }

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Creates and returns an html element and adds attributes from the hash.
             * @method createTag
             * @param tagName {String} Required. Tag name to create.
             * @param hash {Object} Optional. The hashtable of attributes, styles, and classes; defaults is empty object.
             * @return {Element} The newly created element; returns null otherwise.
             * @static
             */
            createTag: function(tagName, hash) {
                var node = _YD.createNode(tagName);

                // iterate through the possible attributes
                _YL.forEach(hash || {}, function(v, k) {
                    switch (k.toLowerCase()) {
                        case 'classname':
                        case 'class':
                        case 'cls':
                            _YD.addClass(node, v);
                            break;

                        case 'cellpadding':
                            node.cellPadding = v;
                            break;

                        case 'cellspacing':
                            node.cellSpacing = v;
                            break;

                        case 'colspan':
                            node.colSpan = v;
                            break;

                        case 'src':
                        case 'checked':
                        case 'disabled':
                            // Capitolization is important in your hashtable for these to work properly in all browsers
                            node[k] = v;
                            break;

                        case 'rowspan':
                            node.rowSpan = v;
                            break;

                        case 'style':
                            // iterate on the styles and set them
                            _YL.forEach(v, function(v, k) {
                                _YD.setStyle(node, k, v);
                            });
                            break;

                        case 'innerhtml':
                        case 'text':
                            var text = ('' + v);

                            if (text.match(/<.*?>/) || text.match(/&.*?;/)) {
	                            _YD.replace(node, text);
                            }
                            else {
	                            node.appendChild(_DOC.createTextNode(text));
                            }
                                
                            break;

                        default:
                            node.setAttribute(k, v);
                            break;
                    }
                });

                return node || null;
            },

            /**
             * Returns the elements content as a float.
             * @method getContentAsFloat
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node as a float.
             * @static
             */
            getContentAsFloat: function(elem) {
                return parseFloat(_YD.getContentAsString(elem));
            },

            /**
             * Returns the elements content as a integer.
             * @method getContentAsInteger
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node as a integer.
             * @static
             */
            getContentAsInteger: function(elem) {
                return parseInt(_YD.getContentAsString(elem), 10);
            },

            /**
             * Returns the elements content.
             * @method getContentAsString
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node.
             * @static
             */
            getContentAsString: function(elem) {
                /*
                 * Returns the elements content of nodes as a string.
                 */
                var _getContentAsString = window.XMLSerializer ? function(nodes) { // mozilla
                    var xmlSerializer = new XMLSerializer(),
                        sb = [];

                    _YL.arrayWalk(nodes, function(node, i) {
                        //noinspection NestedConditionalExpressionJS
                        sb[i] = ($doc.CDATA_SECTION_NODE === node.nodeType) ? node.nodeValue : xmlSerializer.serializeToString(node);
                    });

                    return sb.join('').replace(/(\<textarea[^\<]*?)\/\>/, '$1>&nbsp;</textarea>');
                } : function(nodes) { // IE
                    var sb = [];

                    _YL.arrayWalk(nodes, function(node, i) {
                    //noinspection NestedConditionalExpressionJS,InnerHTMLJS
                        sb[i] = (_YD.isTextNode(node)) ? node.nodeValue : node.xml || node.innerHTML;
                    });

                    return sb.join('').replace(/\/?\>\<\/input\>/gi, '\/>'); // IE tends to insert a bogus "</input>" element instead of understanding empty closure "<input ... />"
                };

                _YD.getContentAsString = function(elem) {
                    var parentNode = _YD.get(elem);

                    if (! parentNode || ! parentNode.childNodes.length) {return '';}

                    if (_YD.isTextNode(parentNode.firstChild.nodeType) && 1 === parentNode.childNodes.length) {
                        return parentNode.firstChild.nodeValue;
                    }
                    else {
                        return _getContentAsString(parentNode.childNodes);
                    }
                };

                return _YD.getContentAsString(elem);
            },

			/**
			 * Hides any number of elements using class 'hide'; doesn't attempt to correct "display:none", designers should use a class to apply display instead.
			 * @method hide
			 * @param arg1 {String|Element} Required. Pointer or string reference to DOM element to style.
			 * @param argX {String|Element} Optional. Additional pointers or string references to DOM element to style.
			 * @static
			 */
			hide: function(arg1, argX) {
				_YL.arrayWalk(arguments, function(elem) {
					_YD.addClass(elem, C.HTML.CLS.HIDE);
				});
			},

            /**
             * Tests if the node has the same tag name as those included in arguments 2+.
             * @method isTagName
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @param arg1 {String} Required. A node name to compare with.
             * @param argX {String} Optional. Additional node names to compare with.
             * @return {Boolean} True when the DOM node attribute nodeName is included in the arguments.
             * @static
             *
             * Example:
             * isTagName(domNode, 'div', 'input', 'div');
             */
            isTagName: function(elem, arg1, argX) {
                var tagName = _YD.getTagName(elem);                
                if (! tagName) {return false;}

                return _YL.arrayWalk(arguments, function(tagname) {
                    if (tagName === tagname) {return true;}
                });
            },

            /**
             * Tests if the node has the same type as those included in arguments 2+.
             * @method isElementType
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @param arg1 {Number} Required. A node type to compare with.
             * @param argX {Number} Optional. Additional node types to compare with.
             * @return {Boolean} True when the DOM node attribute nodeType is included in the arguments.
             * @static
             *
             * Example:
             * isElementType(domNode, document.ELEMENT_NODE, document.ATTRIBUTE_NODE, document.TEXT_NODE);
             */
            isElementType: function(elem, arg1, argX) {
                var node = $(elem);
                if (! (node && node.nodeType)) {return false;}

                return _YL.arrayWalk(arguments, function(nodetype) {
                    if (node.nodeType === nodetype) {return true;}
                });
            },

			/**
			 * Show any number of elements removing class 'hide'.
			 * @method show
			 * @param arg1 {String|Element} Required. Pointer or string reference to DOM element to style.
			 * @param argX {String|Element} Optional. Additional pointers or string references to DOM element to style.
			 * @static
			 */
			show: function(arg1, argX) {
				_YL.arrayWalk(arguments, function(node) {
					_YD.removeClass(node, C.HTML.CLS.HIDE);
				});
			}
		};
		
		_YL.augmentObject(_YD, _thatIfLangExtended, true);
	}

    // extend helper methods requiring yahoo/animation.js
    if (YAHOO.util.Anim) {
        var _thatIfAnim = {

            /**
             * Removes a node from the DOM, using a fading animation and clearning all events.
             * @method animate
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to delete.
             * @param obj {Object} Optional. The animation object data; default will fade opacity from 1 to 0.25.
             * @param dur {Number} Optional. The duration of the animation; default is 0.5s.
             * @param ease {Object} Optional. The easing method; default is easeOut.
             * @param functions {Array} Optional. A collection of animation event callback functions {id: the event, fx: callback function}.
             * @return {Object} YAHOO animation object.
             * @static
             */
            animate: function(elem, obj, dur, ease, functions) {
                var node = $(elem),
                    cfg = {
                    duration: dur || 0.5,
                    ease: ease || YAHOO.util.Easing.easeOut,
                    obj: obj || {opacity: {from: 1, to: 0.25}}
                },
                    fxs = functions || [],
                    anim = new YAHOO.util.Anim(node, cfg.obj, cfg.duration, cfg.ease);

                // functions are provided
                if (fxs.length) {
                    for (var i = 0; i < fxs.length; i += 1) {
                        var o = fxs[i];
                        if (anim[o.id]) {anim[o.id].subscribe(o.fx);}
                    }
                }

                anim.animate();
                return anim;
            }
        };

        _YL.augmentObject(_YD, _thatIfAnim, true);
    }

    // extend helper methods requiring native-ext/array.js
    var _augmentDomWithArrayMethods = function() {

        var _thatIfArray = {

			/**
			 * Wraps the native getElementsByTagName method, converting the nodelist to an Array object.
			 * @method getElementsByTagName
			 * @param tagName {String} Required. The DOM node tag to search for.
			 * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
			 * @return {NodeList} The collection of nodes.
			 * @static
			 */
			getElementsByTagName: function(tagName, elem) {
				var node = $(elem);
				if (! node) {return null;}
				return Array.get(node.getElementsByTagName(tagName));
			}
        };

        _YL.augmentObject(_YD, _thatIfArray, true);
    };

    if (Array.get) {
        _augmentDomWithArrayMethods();
    }
    else {
        _YD.augmentWithArrayMethods = function() {
            _augmentDomWithArrayMethods();
            delete _YD.augmentWithArrayMethods;
        };
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.03
 */

/**
 * Extending YAHOO.util.Event.
 * @module event
 * @namespace YAHOO.util
 * @requires yahoo, event
 */

/**
 * @class Event
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YE = YAHOO.util.Event,
        _YK = YAHOO.util.KeyListener.KEY;

    if (! _YE) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Event', 'extend', 'yahoo-ext/event.js');}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Dom', arguments);
	}: function(text) {throw(text);};

    _YE.throwErrors = true;

    var _that = {

        /**
         * An alias for YAHOO.util.Event.removeListener.
         * @method off
         * @see YAHOO.util.Event.removeListener
         */
        off: _YE.removeListener,

        /**
         * Adds a listener to input that checks keydown events for keycode, then calls the appropriately scoped function, passing the event.
         * @method addKeyListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param keycodes {Array} Required. A collection of desired keycodes.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @param correctScope {Boolean} Optional. True, if you want to correct the scope of callback.
         * @static
         */
        addKeyListener: function(attachTo, keycodes, callback, scope, correctScope) {
            var kl = new YAHOO.util.KeyListener(attachTo, keycodes, {fn: callback, scope: scope ? scope: window, correctScope: correctScope});
            kl.enable();
            return kl;
        },

        /**
         * Adds a listener to input that checks keypress events for enter, then
         *  calls the appropriate function or method. (pass the window into obj for functions).
         * @method addEnterListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @static
         */
        addEnterListener: function(attachTo, callback, scope) {
            return _YE.addKeyListener(attachTo, {keys: _YK.ENTER}, callback, scope);
        },

        /**
         * Adds a listener to input that checks keypress events for escape, then
         *  calls the appropriate function or method. (pass the window into obj for functions).
         * @method addEscapeListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @static
         */
        addEscapeListener: function(attachTo, callback, scope) {
            return _YE.addKeyListener(attachTo, {keys: _YK.ESCAPE}, callback, scope);
        },

        /**
         * Retrieves the {x, y} coordinates of an event.
         * @method getMousePosition
         * @param e {Event} Required. The triggered JavaScript event; any mouse event.
         * @return {Object} Where x = x coordinate and y = y coordinate of event.
         * @static
         */
        getMousePosition: function(e) {
            return {x:_YE.getPageX(e), y:_YE.getPageY(e)};
        },

        /* defined below */
		simulateClick: function() {_throwNotImplemented('simulateClick', 'yahoo.ext/lang.js');},

        /* defined below */
		simulateEvent: function() {_throwNotImplemented('simulateEvent', 'yahoo.ext/lang.js');}
    };

    _YL.augmentObject(_YE, _that);

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Simulates a click event on an element. Will iterate up the DOM tree until the root is reached or node becomes undefined.
             * @method simulateClick
             * @param elem {Element} Required. The element to click on.
             * @param rt {Element} Optional. The ancestor to stop on; default is document.
             * @static
             */
            simulateClick: function(elem, rt) {
                _YE.simulateEvent(elem, 'click', rt);
            },

            /**
             * Simulates an event on an element. Will iterate up the DOM tree until the root is reached or node becomes undefined.
             * @method simulateEvent
             * @param node {Element} Required. The element to click on.
             * @param eventType {String} Required. The event type to fire.
             * @param rt {Element} Optional. The ancestor to stop on; default is document.
             * @static
             */
            simulateEvent: function(node, eventType, rt) {
                var root = rt || document,
                    searchNode = node;

                // iterate up the DOM tree
                while (searchNode && root !== searchNode) {
                    var listeners = _YE.getListeners(searchNode, eventType);

                    // node has listeners
                    if (listeners && listeners.length) {
                        // iterate on those listeners
                        _YL.arrayWalk(listeners, function(o) {
                            o.fn.call(o.adjust ? o.scope : this, {target: node}, o.obj); // execute function
                        });
                    }

                    searchNode = searchNode.parentNode;
                }
            }
        };

        _YL.augmentObject(_YE, _thatIfLangExtended, true);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Form module provides helper methods for manipulating Form elements.
 * @module form
 * @title form Utility
 * @namespace YAHOO.util
 * @requires yahoo, yahoo.util.Dom
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form) {

/**
 * Provides helper methods for Form elements.
 * @class Form
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
		 * @method enable
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

}/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.02
 */

/**
 * @namespace YAHOO.util.Form
 * @requires yahoo, yahoo.util.Dom, yahoo.util.Form
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array crap. Use these functions to work with forms fields.
 * @class Element
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
						node.checked = fl;
						if (node.setAttribute) {node.setAttribute('checked', fl);} // insurance against some browser issues
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
                            if (_YE.simulateClick) {_YE.simulateClick(node);}
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
		 * @method isSet
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
		 * @method enable
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

}/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * @module form
 * @namespace YAHOO.util.Form.Element
 * @requires yahoo, dom, event, form
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element.Serializers) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array functionality.
 * @class Serializers
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