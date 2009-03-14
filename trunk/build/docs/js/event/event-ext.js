/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.03
 */

/**
 * Extending YAHOO.util.Event.
 * @class Event
 * @namespace YAHOO.util
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
})();