/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The RadialMenuPanel classes manages the panels for use with radio menu.
 * @class RadialMenuPanel
 */
YUI().add('gallery-radial-menu-panel', function(Y) {
	// constants
var Lang = Y.Lang,

    /**
     * The RadialMenuPanel constructor.
     * @method RadialMenuPanel
	 * @param conf {Object} Optional. Configuration parameters.
	 * @constructor
     * @public
     */
	RadialMenuPanel = function(conf) {
		RadialMenuPanel.superclass.constructor.apply(this, arguments);
	};

	RadialMenuPanel.NAME = "radialMenuPanel";

	RadialMenuPanel.ATTRS = {

		/**
		 * @attribute content
		 * @type String
		 * @default ''
		 * @description The panel HTML content.
		 */
		content: {
			value: '',
			validator: Lang.isString
		},

		/**
		 * @attribute styles
		 * @type Object
		 * @default null
		 * @description The style overrides for this panel.
		 */
		styles: {
			value: null,
			validator: Lang.isObject
		},

		/**
		 * @attribute tagName
		 * @type String
		 * @default "div"
		 * @description The tag to use for panels.
		 */
		tagName: {
			value: 'div',
			validator: Lang.isString
		}
	};


	Y.extend(RadialMenuPanel, Y.Base, {

		/**
		 * Render the panel into the contentBox.
		 * @method render
		 * @param parent {Node} Required. The RadioMenu contentBox.
		 * @param i {Number} Required. The radial position.
		 * @public
		 */
		render: function(parent, i) {
			var node = new Y.Node(document.createElement(this.get('tagName'))),
				styles = this.get('styles'),
				units = this.get('units');

			if (! styles.zIndex) {styles.zIndex = i + 3;}
			node.setStyles(styles);
			node.addClass(RadialMenuPanel.NAME);

			node.set('innerHTML', this.get('content'));
			Y.Node.getDOMNode(node)._radialIndex = i;

			parent.appendChild(node);
		}
	});

Y.RadialMenuPanel = RadialMenuPanel;
}, '1.0.01', {requires: ['base']});