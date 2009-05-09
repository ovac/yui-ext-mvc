/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

Core.Controller.KonamiCode = (function() {
	// constants
	var _YU = YAHOO.util,
		_CE = _YU.CustomEvent,
		_YE = _YU.Event,
		_YKL = _YU.KeyListener,
		_YKLK = _YKL.KEY;

	_YKLK.A = 65;
	_YKLK.B = 66;

	// local namespace
	var _F = function() {},
		_keyPressed = [],
		_that = null;

	// event namespace
	var _E = {
		onKey: function(e) {
			var keyCode = _YE.getCharCode(e),
				n = _keyPressed.length;

			switch (keyCode) {
				case _YKLK.LEFT:
					if (4 == n || 6 == n) {
						_keyPressed.push(_YKLK.LEFT);
					}
					else {
						_keyPressed = [];
					}
				break;

				case _YKLK.UP:
					if (2 < n) {_keyPressed = [];}
					_keyPressed.push(_YKLK.UP);
				break;

				case _YKLK.RIGHT:
					if (5 == n || 7 == n) {
						_keyPressed.push(_YKLK.RIGHT);
					}
					else {
						_keyPressed = [];
					}
				break;

				case _YKLK.DOWN:
					if (2 <= n && 4 > n) {
						_keyPressed.push(_YKLK.DOWN);
					}
					else {
						_keyPressed = [];
					}
				break;

				case _YKLK.A:
					if (9 == n) {
						_keyPressed.push(_YKLK.A);
					}
					else {
						_keyPressed = [];
					}
				break;

				case _YKLK.B:
					if (8 == n) {
						_keyPressed.push(_YKLK.B);
					}
					else {
						_keyPressed = [];
					}
				break;

				case _YKLK.ENTER:
					if (10 == n) {
						_keyPressed = [];
						_that.onCodeEntered.fire();
					}
				break;

				default: _keyPressed = [];
			}
		}
	};

	// public namespace
	_F.prototype = {

		/**
		 * The event to fire after the Konami code is successfully entered.
		 * @event onCodeEntered
		 */
		onCodeEntered: new _CE('KonamiCode.CodeEntered', null, false, _CE.FLAT)
	};

	_YE.on(document, 'keydown', _E.onKey);

	_that = new _F();
	return _that;
})();