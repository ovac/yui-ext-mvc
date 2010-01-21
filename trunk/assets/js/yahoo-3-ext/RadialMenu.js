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

	RadialMenu.ATTRS = {

		/**
		 * @attribute closeOnClick
		 * @type Boolean
		 * @default false
		 * @description Whether the menu should close on any click event or not.
		 */
		closeOnClick: {
			value: true
		},

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
			var node = _getPanel(e.target),
				panel, i;

			if (node) {
				e.halt();
				i = Y.Node.getDOMNode(node)._radialIndex;
				panel = this.get('panels')[i];
				this.fire('panelClicked', node, panel);
				this.fire('panelClicked' + i, node, panel);
			}

			if (this.get('closeOnClick')) {this.hide();}
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

			if (this._lastPanel) {
				this._lastPanel.removeClass(hoverClass);
			}

			if (panel) {

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
			this._nodeClickHandle = contentBox.on("click", this._handleClick, this, true);
			this._nodeMouseMoveHandle = contentBox.on("mousemove", this._handleMouseMove, this, true);
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
			countentBox.set('innerHTML', '');

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