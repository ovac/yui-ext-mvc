/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * Event capture is a barebone event handling system, to be included in the header of the page, that will queue user
 * 	clicks occuring before the JavaScript library is loaded. Then when the library is loaded, it will dequeue all the
 * 	clicks using the simulateClick function. This effectively prevents the ...
 * @class EventCapture
 * @namespace YAHOO.util
 * @static
 */
(function() {
	var _addEventListener = null,
		_eventQueue = [];

	var _isLibraryEventModuleLoaded = function() {return window.YAHOO && YAHOO.util && YAHOO.util.Event;};

	// standard compliant browser
	if (window.addEventListener) {
		_addEventListener = function(el, eType, fn) {el.addEventListener(eType, fn, false);};
	}
	// IE
	else if (window.attachEvent) {
		_addEventListener = function(el, eType, fn) {el.attachEvent('on' + eType, fn, false);};
	}

	// if we cannot detect the event management system, then don't bother continuing
	if (_addEventListener) {
		var _handleClick = function(e) {_eventQueue.push(e);};
		
		_addEventListener(document, 'click', _handleClick);

		var _handleOnloadEvent = function() {
			if (_isLibraryEventModuleLoaded() && YAHOO.util.Event.simulateClick) {
				YAHOO.util.Event.removeListener(document, 'click', _handleClick);
				var j = _eventQueue.length;

				for (var i = 0; i < j; i += 1) {
					var targ = YAHOO.util.Event.getTarget(_eventQueue[i]);

					if (targ) {
						YAHOO.util.Event.simulateClick(targ);
					}
				}
			}
			else {
				setTimeout(_handleOnloadEvent, 250);
			}
		};

		_addEventListener(window, 'load', _handleOnloadEvent);
	}
})();