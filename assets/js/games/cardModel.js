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
 * The model of a card.
 * @namespace Core.Model
 * @class Card
 * @param conf {Object} Required. The configuration object.
 * @constructor
 */
Core.Model.Card = function(conf) {
	var cfg = _YL.isObject(conf) ? conf : {};

	cfg.suit = _assertOrDefault(cfg.suit, _YL.isString, '');
	cfg.value = _assertOrDefault(cfg.value, _YL.isNumber, 0);
	cfg.name = _assertOrDefault(cfg.name, _YL.isString, cfg.value);

	this._cfg = cfg;
};

Core.Model.Card.prototype = {

    /**
     * The configuration properties.
     * @property _cfg
     * @type Object
     * @public
     */
	_cfg: {},

	/**
	 * Reads the name of the card; default is the value.
	 * @method getName
	 * @return {String} The name.
	 * @public
	 */
	getName: function() {
		return this._cfg.name;
	},

	/**
	 * Reads the suit of the card.
	 * @method getSuit
	 * @return {String} The suit.
	 * @public
	 */
	getSuit: function() {
		return this._cfg.suit;
	},

	/**
	 * Reads the face value of the card.
	 * @method getValue
	 * @return {Number} The value.
	 * @public
	 */
	getValue: function() {
		return this._cfg.value;
	}
};

})();