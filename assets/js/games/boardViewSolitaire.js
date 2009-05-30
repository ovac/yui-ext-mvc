/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

(function() {
// shortcuts
var _YD = YAHOO.util.Dom,
	_YL = YAHOO.lang;

/**
 * Assets the object is valid using the provided method, otherwise returns the default value.
 * @method _assertOrDefault
 * @param o {Object} Required. The value to evaluated.
 * @param fx {Function} Required. The evalutation method.
 * @param dlf {Object} Required. The default value.
 * @private
 */
var _assertOrDefault = function(o, fx, dlf) {
	return fx(o) ? o : dlf;
};

/**
 * The view of a solitaire board.
 * @namespace Core.View
 * @class BoardSolitaire
 * @param elem {String|Element} Required. The DOM node for the card.
 * @param conf {Object} Required. The configuration object.
 * @constructor
 */
Core.View.BoardSolitaire = function(elem, conf) {
	var cfg = _YL.isObject(conf) ? conf : {};

	Core.View.BoardSolitaire.superclass.constructor.apply(this, arguments);

	_YD.addClass(this._node, Core.View.BoardSolitaire.CLASS_NAME);
};

Core.View.Board.prototype = {

	render: function() {
		Core.View.BoardSolitaire.superclass.render();
	}
};

Core.View.BoardSolitaire.CLASS_NAME = 'solitaire';

})();