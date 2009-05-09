/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

(function() {
// shortcuts
var _YL = YAHOO.lang;

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
 * Evaluates if the card is a Card model object.
 * @method _isValidCard
 * @param card {Object} Required. The card to evaluate.
 * @private
 */
var _isValidCard = function(card) {
	return card && card.equals;
};

/**
 * Evaluates if the index is valid (less than length and zero or greater.
 * @method _isValidIndex
 * @param i {Number} Required. The provided index.
 * @param n {Number} Required. The length;
 * @private
 */
var _isValidIndex = function(i, n) {
	return -1 < i && n > i;
};

/**
 * The model of a deck.
 * @namespace Core.Model
 * @class Deck
 * @param conf {Object} Required. The configuration object.
 * @constructor
 */
Core.Model.Deck = function(conf) {
	var cfg = _YL.isObject(conf) ? conf : {};

	cfg.cards = _assertOrDefault(cfg.cards, _YL.isArray, []);

	this._cards = cfg.cards.slice(0);
	this.length = this._cards.length;

	this._cfg = cfg;
};

Core.Model.Deck.prototype = {

    /**
     * The configuration properties.
     * @property _cfg
     * @type Object
     * @public
     */
	_cfg: {},

    /**
     * The length of the deck (number of cards).
     * @property length
     * @type Number
     * @public
     */
	length: 0,

	/**
	 * Adds a card at the provided index.
	 * @method addCardAt
	 * @param card {Object} Required. The card to add.
	 * @param i {Number} Required. The index to add.
	 * @public
	 */
	addCardAt: function(card, i) {
		if (! _isValidCard(card)) {return;}
		if (this.length === i) {this.addCard(card);}
		if (_isValidIndex(i, this.length)) {return;}
		this._cards.splice(i, 1, card);
		this.length += 1;
	},

	/**
	 * Adds a card to the bottom of the deck.
	 * @method addCardToBottom
	 * @param card {Object} Required. The card to add.
	 * @public
	 */
	addCardToBottom: function(card) {
		this._cards.unshift(card);
		this.legnth += 1;
	},

	/**
	 * Adds a card to the top of the deck.
	 * @method addCardToTop
	 * @param card {Object} Required. The card to add.
	 * @public
	 */
	addCardToTop: function(card) {
		this._cards.push(card);
		this.length += 1;
	},

	/**
	 * Removes the provided card from the deck.
	 * @method removeCardAt
	 * @param card {Object} Required. The card to remove.
	 * @return {Object} The card removed or null.
	 * @public
	 */
	removeCard: function(card) {
		if (! _isValidCard(card)) {return null;}
		var n = 0;

		_YL.arrayWalk(this._cards, function(o, i) {
			if (card.equals(o)) {
				n = i;
			}
		});

		return this.removeCardAt(n);
	},

	/**
	 * Removes the card at position i.
	 * @method removeCardAt
	 * @param i {Number} Required. The index to remove.
	 * @return {Object} The card removed or null.
	 * @public
	 */
	removeCardAt: function(i) {
		if (_isValidIndex(i, this.length)) {
			var card = this._cards[i];
			this._cards = this._cards.removeIndex(i);
			this.length -= 1;
			return card;
		}

		return null;
	},

	/**
	 * Removes a card from the bottom of the deck.
	 * @method removeCardFromBottom
	 * @return {Object} The card removed or null.
	 * @public
	 */
	removeCardFromBottom: function() {
		if (this.length) {
			this.legnth -= 1;
			return this._cards.shift();
		}

		return null;
	},

	/**
	 * Removes a card from the top of the deck.
	 * @method removeCardFromTop
	 * @return {Object} The card removed or null.
	 * @public
	 */
	removeCardFromTop: function() {
		if (this.length) {
			this.length -= 1;
			return this._cards.pop();
		}

		return null;
	},

	/**
	 * Resets the deck to the configured values.
	 * @method reset
	 * @public
	 */
	reset: function() {
		this._cards = this._cfg.cards.slice(0);
		this.length = this._cards.length;
	},

	/**
	 * Shuffles the cards using the Knuth shuffle algorithm.
	 * @method shuffle
	 * @public
	 */
	shuffle: function() {
		var cards = this._cards;
		
		_YL.arrayWalk(cards, function(card, i) {
			var rand = i.random() - 1;
			cards[i] = cards[rand];
			cards[rand] = card;
		});
	}
};

Core.Model.Deck.generate = function(json) {
	if (json && json.length) {
		var cards = [];

		_YL.arrayWalk(json, function(o) {
			cards.push(new Core.Model.Card(o));
		});

		return new Core.Model.Deck({cards: cards});
	}

	return null;
};

})();