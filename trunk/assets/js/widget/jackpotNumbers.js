/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */
(function() {
var Y = YAHOO,
	YD = Y.util.Dom,
	YL = Y.lang,

	_addNumbers = function(n) {
		var result = 1, i = 2;
		for (; i <= n; i += 1) {
			result += i;
		}
		return result;
	},

	_handleAnimation = function() {
		var _this = this; // improves compression
		_this.value += Math.round(_this.stepSize * _this.stepCount);
		_this.node.innerHTML = _this.formatFx(_this.value);
		_this.stepCount += 1;

		if (_this.stepCount >= _this.animSteps) {
			_this.timeout.cancel();
			_this.node.innerHTML = _this.formatFx(_this.finalValue);
		}
	};

	Core.Widget.JackpotNumbers = {
		incrementTo: function(elem, endPoint, conf) {
			var node = YD.get(elem),
				cfg = YL.isObject(conf) ? conf : {},
				currValue, isIncrement, diffValue;

			if (! node) {
				Y.log('Invalid node passed to Core.Widget.JackpotNumbers.incrementTo');
				return;
			}

			currValue = parseInt(node.innerHTML.replace(/[^0-9\.-]/, ''), 10);

			if (isNaN(currValue)) {
				Y.log('Node did not resolve to number in Core.Widget.JackpotNumbers.incrementTo');
				return;
			}

			isIncrement = currValue < endPoint;
			diffValue = isIncrement ? endPoint - currValue : currValue - endPoint;

			if (! YL.isNumber(cfg.animLength)) {cfg.animLength = 1000;}
			if (! YL.isNumber(cfg.animSteps)) {cfg.animSteps = 20;}
			if (! YL.isFunction(cfg.formatFx)) {cfg.formatFx = function(n) {return n;};}

			cfg.multiplier = _addNumbers(cfg.animSteps);
			cfg.animFreq = cfg.animLength / cfg.animSteps;
			cfg.stepCount = 1;
			cfg.stepSize = (isIncrement ? 1 : -1) * diffValue / (cfg.multiplier);
			cfg.node = node;
			cfg.value = currValue;
			cfg.finalValue = endPoint;
			cfg.timeout = YL.later(cfg.animFreq, cfg, _handleAnimation, null, true);
		}
	};
}());