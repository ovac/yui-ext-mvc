/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * There are three major improvements I would like to make to this widget. The first is to leverage the existing overlay infrastructure
 * that is built into YUI3. This way we can leverage existing shimming and positioning architecture. The second is to animate the menu.
 * I believe the menu should rotate out from the center when opened and rotate in the center when closed. Lastly, the menu needs keyboard support.
 * Although the keyboard is not the same as a gaming controller, I believe the RadialMenuAnim lends itself to keyboard interaction.
 */

/**
 * The RadialMenuAnim classes manages a the radio menu.
 * @class RadialMenuAnim
 */
YUI().add('gallery-radial-menu-anim', function(Y) {
	// constants
var Lang = Y.Lang,

    /**
     * The RadialMenu constructor.
     * @method RadialMenuAnim
	 * @param conf {Object} Optional. Configuration parameters.
	 * @constructor
     * @public
     */
	RadialMenuAnim = function(conf) {
		RadialMenuAnim.superclass.constructor.apply(this, arguments);
		this._enabled = true;
	};

	RadialMenuAnim.ATTRS = {
		animType: {
			value: 'radiate',
			validate: function(val) {
				return 'rotate' == val || 'radiate' == val;
			}
		},

		duration: {
			value: 1,
			validate: Lang.isNumber
		},

		easingIn: {
			value: Y.Easing.elasticIn
		},

		easingOut: {
			value: Y.Easing.elasticOut
		},

		rotation: {
			value: 90,
			validate: Lang.isNumber
		}
	};

	RadialMenuAnim.NS = "radialMenuAnim";


	Y.extend(RadialMenuAnim, Y.Plugin.Base, {
		_enabled: null,

		animClosed: function() {
			if (!this._enabled) {return;}
			var host = this.get('host'),
				pt = host._lastPoint,
				panels = host.get('panels'),
				fnName = this.get('animType') + 'In',
				n = panels.length,
				duration = this.get('duration'),
				easing = this.get('easingIn');
			
			host.get('boundingBox').removeClass('yui-radialmenu-hidden');

			Y.each(panels,function(panel, i) {
				var styles = panel.get('styles'),
					region = panel._node.get('region'),
					anim = new Y.Anim({duration: duration, easing: easing, node: panel._node});

				this[fnName](anim, pt, region);

				if (i === n-1) {
					anim.on('end', function(){
						host.get('boundingBox').addClass('yui-radialmenu-hidden');
					});
				}
				
				anim.run();
			}, this);
		},

		animOpen: function() {
			if (!this._enabled) {return;}
			var host = this.get('host'),
				pt = host._lastPoint,
				panels = host.get('panels'),
				fnName = this.get('animType') + 'Out',
				duration = this.get('duration'),
				easing = this.get('easingOut');

			Y.each(panels,function(panel) {
				var styles = panel.get('styles'),
					anim = new Y.Anim({duration: duration, easing: easing, node: panel._node});

				this[fnName](anim, pt, styles);
				anim.run();
			}, this);
		},

		destructor: function() {

		},

		disable: function() {
			this._enabled = false;
		},

		enable: function() {
			this._enabled = true;
		},

		initializer: function() {
			var _this = this,
				_prefix = _this.get('animType');
			
			_this.doAfter('syncUI', _this.syncUI);
			_this.doAfter('hide', _this.animClosed);
			_this.doAfter('show', _this.animOpen);
		},

		radiateIn: function(anim, pt, region) {
			anim.set('to', {
				left: pt[0] - region.width / 2,
				top: pt[1] - region.height / 2
			});
		},

		radiateOut: function(anim, pt, styles) {
			anim.set('to', {
				left: styles.left,
				top: styles.top
			});
		},

		rotateIn: function(anim, pt, region) {
			anim.set('to', {
				curve: this.rotateInCurve([region.left, region.top], pt)
			})
		},

		rotateInCurve: function(startPt, endPt) {
			var radius = this.get('host').get('diameter') / 2,
				rotation = this.get('rotation'),
				angle = ((startPt[0] - endPt[0]) / radius),
				points = [],
				i=0, n=10, astep = rotation / n, rstep = radius / n;

			for (0; i < n; i += 1) {
				points[i] = [
					Math.floor(endPt[0] + radius * Math.cos(angle)),
					Math.floor(endPt[1] + radius * Math.sin(angle))
				];

				angle -= astep;
				radius -= rstep;
			}

			points[i] = endPt;
			return points;
		},

		rotateOut: function(anim, pt, styles) {
			anim.set('to', {
				curve: this.rotateOutCurve(pt, [styles.left.replace('px', ''), styles.top.replace('px', '')])
			})
		},

		rotateOutCurve: function(startPt, endPt) {
			var radius = this.get('host').get('diameter') / 2,
				rotation = this.get('rotation'),
				angle = ((endPt[0] - startPt[0]) / radius) - rotation,
				points = [],
				i=0, n=10, astep = rotation / n, rstep = radius / n;

			radius = rstep;
			angle = astep;

			for (1; i < n; i += 1) {
				points[i] = [
					Math.floor(startPt[0] + radius * Math.cos(angle)),
					Math.floor(startPt[1] + radius * Math.sin(angle))
				];

				angle += astep;
				radius += rstep;
			}

			points[i] = endPt;
			return points;
		},

		syncUI: function(a) {
			if (!this._enabled) {return;}
			var host = this.get('host'),
				x = host._lastPoint[0],
				y = host._lastPoint[1];
			
			Y.each(host.get('panels'),function(panel) {
				var node = panel._node,
					region = node.get('region'),
					l = x - region.width / 2,
					t = y - region.height / 2;

				node.setStyle('left', l + 'px');
				node.setStyle('top', t + 'px');
			});
		}
	});

Y.RadialMenuAnim = RadialMenuAnim;
}, '@VERSION@' ,{requires:['plugin', 'anim', 'gallery-radial-menu'], use: []});