/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */
(function() {
// constants
var _YU = YAHOO.util,
	_YL = YAHOO.lang,
	_CE = _YU.CustomEvent,
	_YC = YAHOO.util.Connect;
	
/**
 * A simple class that executes AJAX urls until the provided condition is met.
 * @namespace Core.Controller
 * @class AjaxPoller
 * @param conf {Object} Required. The configuration.
 * @constructor
 */
Core.Controller.AjaxPoller = function(conf) {
	var _cfg = _YL.isObject(conf) ? conf : {};

	if (! _YL.isNumber(_cfg.period)) {_cfg.period = 5000;} // default is 5 seconds
	if (! _YL.isNumber(_cfg.timeout)) {_cfg.timeout = 10000;} // default is to abort AJAX after 10 seconds
	if (! _YL.isFunction(_cfg.stopfx)) {_cfg.stopfx = function() {};}
	if (! _YL.isString(_cfg.url)) {_cfg.url = '';}

	this._cfg = _cfg;
	this.onPoll = new _CE('AjaxPoller.poll', null, false, _CE.FLAT);
	this.onStart = new _CE('AjaxPoller.start', null, false, _CE.FLAT);
	this.onStop = new _CE('AjaxPoller.stop', null, false, _CE.FLAT);

	if (_YL.isFunction(_cfg.onPoll)) {this.onPoll.subscribe(_cfg.onPoll);}
	if (_YL.isFunction(_cfg.onStart)) {this.onStart.subscribe(_cfg.onStart);}
	if (_YL.isFunction(_cfg.onStop)) {this.onStop.subscribe(_cfg.onStop);}
};

Core.Controller.AjaxPoller.prototype = {

	/**
	 * The event to fire after each AJAX poll request returns.
	 * @event onPoll
	 * @public
	 * @final
	 */
	onPoll: null,

	/**
	 * The event to fire before the poll system starts.
	 * @event onPoll
	 * @public
	 * @final
	 */
	onStart: null,

	/**
	 * The event to fire after the polling stop condition is reached.
	 * @event onPoll
	 * @public
	 * @final
	 */
	onStop: null,

	/**
	 * A pseudo-private pointer to the current configuration.
	 * @property _cfg
	 * @type {Object}
	 * @public
	 * @final
	 */
	_cfg: null,

	/**
	 * A pseudo-private pointer to the current timeout.
	 * @property _timeoutId
	 * @type {Number}
	 * @public
	 * @final
	 */
	_timeoutId: null,

	/**
	 * A pseudo-private pointer to the current AJAX transaction.
	 * @property _transaction
	 * @type {Object}
	 * @public
	 * @final
	 */
	_transaction: null,

	/**
	 * Starts the polling system.
	 * @method start
	 * @public
	 */
	start: function() {
		var _that = this;
		_that.onStart.fire(this);

		var fx = function() {
			_that._transaction = _YC.asyncRequest('GET', _that._cfg.url, {success: function(o) {
				_that.onPoll.fire(o);

				if (_that._cfg.stopfx(o)) {
					_that.stop(o);
				}
				else {
					_that._timeoutId = setTimeout(fx, _that._cfg.period);
				}
			}, failure: fx, timeout: _that._cfg.timeout});
		};

		fx();
	},

	/**
	 * Stops the current polling.
	 * @method stop
	 * @public
	 */
	stop: function() {
		if (this._transaction && this._transaction) {this._transaction.conn.abort();}
		if (this._timeoutId) {clearTimeout(this._timeoutId);}
		this.onStop.fire.apply(this.onStop, arguments);
	},

	/**
	 * Changes the url to poll; use for get request with changing parameters.
	 * @method updateUrl
	 * @param url {String} Required. The new url with parameters.
	 * @public
	 */
	updateUrl: function(url) {
		this._cfg.url = url;
	}
};
	
})();