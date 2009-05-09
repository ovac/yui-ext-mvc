/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

(function() {
// shortcuts
var _YD = YAHOO.util.Dom,
	_YL = YAHOO.lang;

var _cardImages = {};

/**
 * The view of a card.
 * @namespace Core.View
 * @class CardImage
 * @param elem {String|Element} Required. The DOM node for the card.
 * @param conf {Object} Required. The configuration object.
 * @constructor
 */
Core.View.CardImage = function(elem, conf) {
	Core.View.CardImage.superclass.constructor.call(this, elem, conf);
	_YD.addClass(this._node, 'cardImage');
};

_YL.extend(Core.View.CardImage, Core.View.Card, {

	setValue: function(card) {
		Core.View.CardImage.superclass.setValue.call(this, card);
		_YD.removeChildNodes(this._node);

		var img = new Image();
		img.src = _cardImages[card.getSuit()][card.getName()];
		this._node.appendChild(img);
		
//		this._node.className = this._node.className.replace(/suit\-\w+\s+?/, '').replace(/value\-\w+\s+?/, '');
//		_YD.addClass(this._node, 'suit-' + suit);
//		_YD.addClass(this._node, 'value-' + value);
	},

	toggleFaceUp: function(isFaceUp) {
		Core.View.CardImage.superclass.toggleFaceUp.call(this, isFaceUp);
		if (! this._node.firstChild) {return;}
		
		if (isFaceUp && this._node.firstChild.lastSrc) {
			this._node.firstChild.src = this._node.firstChild.lastSrc;
		}

		if (! isFaceUp) {
			this._node.firstChild.lastSrc = this._node.firstChild.src;
			this._node.firstChild.src = _cardImages.faceDown.vertical;
		}
	}
});

Core.View.CardImage.loadImages = function(json) {
	// todo: this should return a complete collection of DOM objects
	_cardImages = json;
};

})();