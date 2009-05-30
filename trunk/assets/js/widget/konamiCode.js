/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * Super Konami Code widget. This widget allows the developer to change and/or encrypt the secret code; defaults to
 * 	the Konami Code.
 */
(function() {
		// constants
	var Y = YAHOO.util,
		YE = Y.Event,
		YL = YAHOO.lang,

		// local namespace
		_F = function() {},
		_keyPressed = [],
		_code = '38,38,40,40,37,39,37,39,66,65,13',
		_cryptoFx = function(typedCode, storedCode) {return typedCode === storedCode;},
		_length = 11,
		_that = null,

		// event namespace
		_E = {
			onKey: function(e) {
				var keyCode = YE.getCharCode(e);
				_keyPressed.push(keyCode);

				if (_keyPressed.length >= _length && _cryptoFx(_keyPressed.slice(_keyPressed.length - _length).join(','), _code)) {
					_keyPressed = [];
					_that.fireEvent(_that.EVENT_CODE_ENTERED);
				}
			}
		};

	// public namespace
	YL.augmentObject(_F.prototype, {

		/**
		 * The event to fire after the Konami code is successfully entered.
		 * @event onCodeEntered
		 */
		EVENT_CODE_ENTERED: 'KonamiCode.CodeEntered',

		/**
		 * Change the code; use a string of comma separated key codes.
		 * @method changeCode
		 * @param code {String} Required. The key codes.
		 * @public
		 */
		changeCode: function(code) {
			if (YL.isString(code)) {
				_code = code;
				_length = code.split(',').length;
			}
		},

		/**
		 * Change the code and apply a cryptography method.
		 * @method useCrypto
		 * @param code {String} Required. The encrypted key codes.
		 * @param cryptoFx {Function} Required. The cryptography function, see cryptoFx above for function signature.
		 * @param length {Number} Required. The number of characters that originated the encrypted key codes.
		 * @public
		 */
		useCrypto: function(code, cryptoFx, length) {
			if (YL.isString(code) && YL.isFunction(cryptoFx) && YL.isNumber(length)) {
				_code = code;
				_cryptoFx = cryptoFx;
				_length = length;
			}
		}
	});

	YL.augmentProto(_F, Y.EventProvider);
	YE.on(document, 'keydown', _E.onKey);

	_that = new _F();
	_that.createEvent(_that.EVENT_CODE_ENTERED);
	Core.Controller.KonamiCode = _that;
}());