/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * There are three major improvements I would like to make to this widget. The first is to leverage the existing overlay infrastructure
 * that is built into YUI3. This way we can leverage existing shimming and positioning architecture. The second is to animate the menu.
 * I believe the menu should rotate out from the center when opened and rotate in the center when closed. Lastly, the menu needs keyboard support.
 * Although the keyboard is not the same as a gaming controller, I believe the RadialMenu lends itself to keyboard interaction. 
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

	_isBetween = function(i, lowerBounds, upperBounds) {
		return i > lowerBounds && i < upperBounds;
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
		 * @attribute keyHoldTimeout
		 * @type Number
		 * @default 500
 		 * @description The timeout when holding down a key.
		 */
		keyHoldTimeout: {
			value: 500,
			validator: Lang.isNumber
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
		_isKeyPressed: false,

		_lastNode: null,
		_lastPanel: null,
		_lastPoint: null,
		
		_nodeClickHandle: null,
		_nodeMouseMoveHandle: null,

		_keyDownHandle: null,
		_keyUpHandle: null,

		_timerKeyDown: null,

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
		 * Callback function for pressing a key while the menu is open.
		 * @method _handleKeyDown
		 * @param e {Event} Required. The triggered `keydown` JavaScript event.
		 * @private
		 */
		_handleKeyDown: function(e) {
			var panels = this.get('panels'),
				lastPanel = this._lastPanel,
				i = lastPanel ? lastPanel.getRadialIndex() : 0,
				n = panels.length,
				isValid = false,
				hoverClass = this.get('hoverClass'),
				m, l=n%2;

			switch (e.keyCode) {
				case 38: // up
					if (0 != i) {
					isValid = true;
						if (n / 2 > i) {
							i -= 1;
						}
						else {
							i += 1;
						}
					}
				break;

				case 39: // right
					m = n / 4;

					if (m != i && ! (l && _isBetween(i, m-1, m+1))) {
					isValid = true;
						if (m >= i + 1 || n - m <= i) {
							i += 1;
						}
						else if (m <= i - 1) {
							i -= 1;
						}
					}
				break;

				case 40: // down
					m = n / 2;

					if (m != i && ! (l && _isBetween(i, m-1, m+1))) {
					isValid = true;
						if (m >= i + 1) {
							i += 1;
						}
						else if (m <= i - 1) {
							i -= 1;
						}
					}
				break;

				case 37: // left
					m = n / 4;

					if (n - m != i && ! (l && _isBetween(i, n-m-1, n-m+1))) {
					isValid = true;
						if (m < i && n - m >= i + 1) {
							i += 1;
						}
						else if (n - m <= i - 1 || i <= m) {
							i -= 1;
						}
					}
				break;

				case 13: // enter
					if (lastPanel) {
						e.target = lastPanel._node;
						this._handleClick(e);
					}
				break;

				case 27: // escape
					this.hide();
				break;
			}

			if (isValid) {
				if (this._timerKeyDown) {this._timerKeyDown.cancel();}

				if (0 > i){
					i = n - 1;
				}
				else if (n - 1 < i) {
					i = 0;
				}


				n = this.get('keyHoldTimeout');
				if (0 < n) {
					this._timerKeyDown = Y.later(n, this, this._handleKeyDown, e);
				}
				if (lastPanel) {lastPanel._node.removeClass(hoverClass);}
				lastPanel = panels[i];
				this._lastPanel = lastPanel;
				lastPanel._node.addClass(hoverClass);
				this._isKeyPressed = true;
			}
		},

		/**
		 * Callback function for releasing a key while the menu is open.
		 * @method _handleKeyUp
		 * @param e {Event} Required. The triggered `keyup` JavaScript event.
		 * @private
		 */
		_handleKeyUp: function(e) {
			if (this._timerKeyDown) {this._timerKeyDown.cancel();}
			this._isKeyPressed = false;
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

			if (this._lastNode) {
				this._lastNode.removeClass(hoverClass);
			}

			if (panel) {
				this._lastNode = panel;
				panel.addClass(hoverClass);
			}
			else {
				this._lastNode = null;
			}
		},

		/**
		 * Destroys the widget.
		 * @method destructor
		 * @public
		 */
		destructor: function() {
			var hoverClass = this.get('hoverClass');
			if (this._nodeClickHandle) {
				this._nodeClickHandle.detach();
				this._nodeClickHandle = null;
			}
			if (this._keyDownHandle) {
				this._keyDownHandle.detach();
				this._keyDownHandle = null;
			}
			if (this._keyUpHandle) {
				this._keyUpHandle.detach();
				this._keyUpHandle = null;
			}
			if (this._nodeMouseMoveHandle) {
				this._nodeMouseMoveHandle.detach();
				this._nodeMouseMoveHandle = null;
			}
			if (this._timerKeyDown) {
				this._timerKeyDown.cancel();
				this._timerKeyDown = null;
			}
			if (this._lastNode) {this._lastNode.removeClass(hoverClass);}
			if (this._lastPanel) {this._lastPanel._node.removeClass(hoverClass);}
			this._lastNode = null;
			this._lastPanel = null;
		},

		/**
		 * Capture the hide function and remove key listeners, before delegating to superclass.
		 * @method hide
		 * @public
		 */
		hide: function() {
			this.destructor();
			RadialMenu.superclass.hide.apply(this, arguments);
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
			var contentBox = this.get('contentBox'),
				doc = new Y.Node(document);
			
			this._keyDownHandle = doc.on('keydown', this._handleKeyDown, this, true);
			this._keyUpHandle = doc.on('keyup', this._handleKeyUp, this, true);
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

		/**
		 * Capture the show function and add key listeners, before delegating to superclass.
		 * @method show
		 * @public
		 */
		show: function() {
			if (! this._keyDownHandle) {this.bindUI();}
			RadialMenu.superclass.show.apply(this, arguments);
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
			this._lastPoint = pt;

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
}, '1.0.01' ,{requires:['widget', 'gallery-radial-menu-panel'], use: [], optional: ['gallery-radial-menu-anim']});