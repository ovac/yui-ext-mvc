/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.01.00
 */

/**
 * The EventDispatcher class dispatches events for an entire page, using .
 * @namespace Core.Util
 * @class EventDispatcher
 * @static
 */
(function() {
    // local variables
    var _callbackMap = {},
        _DOC = document,
        _rx = /\bcom_\w+\b/g,
        _YE = YAHOO.util.Event;

    // event namespace
    var _E = {

        /**
         * The generic event dispatcher callback; passes these parameters into callback(event, targetNode, flattenedArguments...).
         * @method dispatcher
         * @param e {Event} Required. The triggered JavaScript event.
         * @private
         */
        dispatcher: function(e) {
            var node = _YE.getTarget(e);

            // simulate bubbling
            while (node && node !== _DOC) {
                var coms = node.className.match(_rx);

                // not matched
                if (null === coms) {
                    // not found, do nothing for now
                }
                // command class exists
                else {
                    var i = 0, j = 0;

                    // iterate on matching commands
                    for (; i < coms.length; i += 1) {
                        var id = coms[i].replace(/com_/, ''),
                            carr = _callbackMap[e.type][id];

                        // object for command exists, command could be for another event
                        if (carr && carr.length) {
                            // iterate on command callbacks
                            for (j = 0; j < carr.length; j += 1) {
                                var o = carr[j],
                                    args = [e, node];

                                if (o.eventFx) {o.eventFx.call(_YE, e);} // event stop events
                                o.callback.apply(o.scope, args.concat(o.arguments));
                            }
                        }
                    }
                }

                node = node.parentNode;
            }
        }
    };

   	// public namespace
	Core.Util.EventDispatcher = {

        /**
         * Method to register an event on the document.
         * @method register
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        register: function(type, o) {
            // check for required
            if (! (type && o && o.id && o.callback)) {
                alert('Invalid regristration to EventDispatcher - missing required value, see source code.');
            }

            // allows for lazy-loading of events
            if (! _callbackMap[type]) {
                _callbackMap[type] = {};
                _YE.on(_DOC, type, _E.dispatcher);
            }

            if (! _callbackMap[type][o.id]) {_callbackMap[type][o.id] = [];}
            if (! o.scope) {o.scope = window;}
            if (! o.arguments) {o.arguments = [];}
            if (! YAHOO.lang.isArray(o.arguments)) {o.arguments = [o.arguments];} // support arguments _that are non arrays
            _callbackMap[type][o.id].push(o);
        },

        /**
         * Call this method to register an event the first time _that ID is provided, and not subsequent times.
         * @method registerOnce
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        registerOnce: function(type, o) {
            if (! (_callbackMap[type] || _callbackMap[type][o.id])) {
                register(type, o);
            }
        }
    };
}());