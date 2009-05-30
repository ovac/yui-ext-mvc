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
Core.View.Board = function(elem, conf) {
	var cfg = _YL.isObject(conf) ? conf : {};

	cfg.classBoard = _assertOrDefault(cfg.classBoard, _YL.isString, Core.View.Board.CLASS_NAME);

	this._node = _YD.get(elem);
	_YD.addClass(this._node, cfg.classCard);

	this._cfg = cfg;
};

Core.View.Board.prototype = {

    /**
     * The configuration object.
     * @property _cfg
     * @type Object
     * @public
     */
	_cfg: {},

    /**
     * The dom node wrapped by this card view.
     * @property _node
     * @type Object
     * @public
     */
	_node: {},

	render: function() {
		
	}
};

Core.View.Board.CLASS_NAME = 'board';

})();