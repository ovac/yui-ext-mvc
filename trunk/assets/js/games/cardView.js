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
 * The view of a card.
 * @namespace Core.View
 * @class Card
 * @param elem {String|Element} Required. The DOM node for the card.
 * @param conf {Object} Required. The configuration object.
 * @constructor
 */
Core.View.Card = function(elem, conf) {
	var cfg = _YL.isObject(conf) ? conf : {};

	cfg.classCard = _assertOrDefault(cfg.classCard, _YL.isString, 'card');
	cfg.classFaceDown = _assertOrDefault(cfg.classFaceDown, _YL.isString, 'faceDown');

	this._node = _YD.get(elem);
	_YD.addClass(this._node, cfg.classCard);

	this._cfg = cfg;

	this.toggleFaceUp(! cfg.isFaceDown);
};

Core.View.Card.prototype = {

	_isFaceUp: false,

    /**
     * The dom node wrapped by this card view.
     * @property _node
     * @type Object
     * @public
     */
	_node: {},

	setValue: function(card) {
		var text = card.getSuit() + ' - ' + card.getName();
		_YD.setFirstText(this._node, text);
		this._node.title = text;
	},

	toggleFaceUp: function(isFaceUp) {
		this._isfaceUp = isFaceUp;
		_YD.toggleClass(this._node, this._cfg.classFaceDown, ! this._isfaceUp);
	}
};

})();