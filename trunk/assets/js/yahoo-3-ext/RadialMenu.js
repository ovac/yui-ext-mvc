/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The RadialMenu classes manages a the radio menu.
 * @class RadialMenu
 */
YUI().add('gallery-radial-menu', function(Y) {
	// constants
var Lang = Y.Lang,

	_getPanel = function(node) {
		return node.hasClass(Y.RadialMenuPanel.NAME) ? node : node.ancestor('.' + Y.RadialMenuPanel.NAME);
	},

    /**
     * The RadialMenu constructor.
     * @method RadialMenu
	 * @param conf {Object} Optional. Configuration parameters.
	 * @constructor
     * @public
     */
	RadialMenu = function(conf) {
		RadialMenu.superclass.constructor.apply(this, arguments);
	};

	Y.Get.css('/assets/css/radialMenu.css');

	RadialMenu.ATTRS = {

		/**
		 * @attribute diameter
		 * @type Number
		 * @default 100
		 * @description The inner diameter of menu.
		 */
		diameter: {
			value: 100,
			validator: function(val) {
				return Lang.isNumber(val) && 100 < val;
			}
		},

		/**
		 * @attribute hoverClass
		 * @type String
		 * @default ''
		 * @description The hover class.
		 */
		hoverClass: {
			value: Y.RadialMenuPanel.NAME + '-hover',
			validator: Lang.isString
		},

		/**
		 * @attribute panels
		 * @type Array
		 * @default []
		 * @description An array of RadialMenuPanels.
		 */
		panels: {
			value: [],
			validator: Lang.isArray
		}
	};

	RadialMenu.NAME = "radialMenu";


	Y.extend(RadialMenu, Y.Widget, {
		_lastPanel: null,
		_nodeClickHandle: null,
		_nodeMouseMoveHandle: null,

		/**
		 * Callback function for clicking inside the widget node.
		 * @method _handleClick
		 * @param e {Event} Required. The triggered `click` JavaScript event.
		 * @private
		 */
		_handleClick: function(e) {
			var panel = _getPanel(e.target);

			if (panel) {
				this.fire('panelClicked' + Y.Node.getDOMNode(panel)._radialIndex);
			}
		},

		/**
		 * Callback function for handling the mouse move inside the widget node.
		 * @method _handleMouseMove
		 * @param e {Event} Required. The triggered `mousemove` JavaScript event.
		 * @private
		 */
		_handleMouseMove: function(e) {
			var panel = _getPanel(e.target),
				hoverClass = this.get('hoverClass');

			if (panel) {
				if (this._lastPanel) {
					this._lastPanel.removeClass(hoverClass);
				}

				this._lastPanel = panel;
				panel.addClass(hoverClass);
			}
		},

		/**
		 * Destroys the widget.
		 * @method destructor
		 * @public
		 */
		destructor: function() {
			this._nodeClickHandle.detach();
			this._nodeMouseMoveHandle.detach();
		},

		/**
		 * Initialize the widget.
		 * @method initializer
		 * @param config {Object} Required. The initialization configuration.
		 * @public
		 */
		initializer: function(config) {
		},

		/**
		 * Bind events to the widget.
		 * @method bindUI
		 * @public
		 */
		bindUI: function() {
			var contentBox = this.get('contentBox');
			this._nodeClickHandle = contentBox.on("click", Y.bind(this._handleClick, this));
			this._nodeMouseMoveHandle = contentBox.on("mousemove", Y.bind(this._handleMouseMove, this));
		},

		/**
		 * Renders the checklist DOM inside of the block-level node.
		 * @method renderUI
		 * @public
		 */
		renderUI: function() {
		},

		syncUI: function() {
			var boundingBox = this.get('boundingBox'),
				countentBox = this.get('contentBox'),
				viewport = boundingBox.get('viewportRegion'),
				panels = this.get('panels'),
				n = this.get('panels').length,
				radius = this.get('diameter') / 2,
				pt = [
					viewport.left + (viewport.width - 5) / 2,
					viewport.top + (viewport.height - 5) / 2
				],
				angle = 360 / n,
				a, o, x, y;

			boundingBox.setStyle('height', (viewport.height - 5) + 'px');
			boundingBox.setStyle('width', (viewport.width - 5) + 'px');

			Y.each(panels, function(panel, i) {
				a = (angle * i - 90) * Math.PI / 180;
				x = pt[0] + radius * Math.cos(a);
				y = pt[1] + radius * Math.sin(a);
				o = panel.get('styles');
				o.left = x + 'px';
				o.top = y + 'px';
				panel.set('styles', o);
				panel.render(countentBox, i);
			}, this);
		}
	});

Y.RadialMenu = RadialMenu;
}, '1.0.01' ,{requires:['widget', 'gallery-radial-menu-panel'], use: []});