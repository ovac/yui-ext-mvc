/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The CheckboxList classes manages a scrollable list of checkboxes that is rendered via JavaScript.
 * @namespace Core.Widget
 * @class CheckboxList
 */
YUI().add('checkboxList', function(Y)
{
	// constants
var Lang = Y.Lang,
	ITEM_TMPL = '<li><input id="{id}" name="{name}" type="checkbox" value={value} {checked}/><label for="{id}">{label}</label></li>',

    /**
     * The CheckboxList constructor.
     * @method CheckboxList
	 * @param conf {Object} Optional. Configuration parameters.
	 * @constructor
     * @public
     */
	_F = function(conf)
	{
		_F.superclass.constructor.apply(this, arguments);
	};

	_F.ATTRS =
	{
		// the json for rendering
		json:
		{
			lazyAdd: false,
			setter: function(v)
			{
				if (! Lang.isArray(v))
				{
					Y.fail('CheckboxList: Invalid json provided: ' + typeof v);
				}
				return v;
			},
			value: []
		},

		// the maximum height to make the list
		maxHeight:
		{
			value: '100px'
		},

		// name to apply to each checkbox
		name:
		{
			value: 'checkboxListValue[]'
		},
		
		// The root node for this widget.
		node:
		{
			setter: function(node)
			{
				var n = Y.get(node);
				if (!n)
				{
					Y.fail('CheckboxList: Invalid node provided: ' + node);
				}
				return n;
			}
		},

		// the template item
		templateItem:
		{
			value: ''
		}
	};

	_F.NAME = "checkboxList";

	_F.CE_BEFORE_ONCHECKED = 'before_onchecked';
	_F.CE_ONCHECKED = 'onchecked';


	Y.extend(_F, Y.Widget,
	{

		/**
		 * Callback function for clicking inside the wdiget node.
		 * @method _evtOnClick
		 * @param e {Event} Required. The triggered `click` JavaScript event.
		 * @private
		 */
		_evtOnClick: function(e)
		{
			var targ = e.target;

			if ('input' === targ.get('tagName').toLowerCase())
			{
				/*
				not working the same in YUI 3 as in YUI 2
				if (this.fire(_F.CE_BEFORE_ONCHECKED, e))
				{
					e.halt();
					return;
				}
				*/
				this.fire(_F.CE_ONCHECKED, e);
			}
		},

		/**
		 * Renders a list item from the template.
		 * @method _renderItem
		 * @param id {String} Required. The checkbox ID.
		 * @param label {String} Required. The checkbox label.
		 * @param value {String} Required. The checkbox value.
		 * @param isChecked {Boolean} Optional. Check the checkbox.
		 * @return {String} The HTML for list item to render.
		 * @protected
		 */
		_renderItem: function(id, label, value, isChecked)
		{
			return this.get('templateItem').replace(/\{id\}/g, id).replace(/\{label\}/g, label).replace(/\{value\}/g, value)
							 .replace('{checked}', isChecked ? 'checked="checked"' : '');
		},

		/**
		 * Hides the node and removes its content.
		 * @method clear
		 * @public
		 */
		clear: function()
		{
			this.hide();
			this.get('node').set('innerHTML', '');
		},

		/**
		 * Destroys the widget.
		 * @method destructor
		 * @public
		 */
		destructor: function()
		{
			this.clear();
			this._nodeClickHandle.detach();
		},

		/**
		 * Hides the node.
		 * @method hide
		 * @public
		 */
		hide: function()
		{
			this.get('node').setStyle('display', 'none');
		},

		/**
		 * Initialize the widget.
		 * @method initializer
		 * @param config {Object} Required. The initialization configuration.
		 * @public
		 */
		initializer: function(config)
		{
			this.set('templateItem', ITEM_TMPL.replace(/\{name\}/g, this.get('name')));
		},

		/**
		 * Bind events to the widget.
		 * @method bindUI
		 * @public
		 */
		bindUI: function()
		{
			this._nodeClickHandle = this.get('node').on("click", Y.bind(this._evtOnClick, this));
		},

		/**
		 * Renders the checklist DOM inside of the block-level node.
		 * @method renderUI
		 * @public
		 */
		renderUI: function()
		{
			var json = this.get('json'),
				i = 0, o,
				j = json.length,
				sb = ['<ul>'],
				node = this.get('node');

			for (; i < j; i += 1)
			{
				o = json[i];
				sb[i + 1] = this._renderItem(o.id, o.label, o.value, o.isChecked);
			}

			sb[i + 1] = '</ul>';
			node.set('innerHTML', sb.join(''));

			if (this.get('maxHeight').replace(/\[\d\.]+/, '') < node.getStyle('height').replace(/\[\d\.]+/, ''))
			{
				node.setStyle('height', this.get('maxHeight'));
			}
		},

		/**
		 * Serializes the root node for an AJAX request.
		 * @method serialize
		 * @return {String} The parameterized form.
		 * @public
		 */
		serialize: function()
		{
			var sb = [],
				npts = this.get('node').getElementsByTagName('input');

			npts.each(function(npt, i)
			{
				if (npt.get('checked'))
				{
					sb.push(npt.get('name') + '=' + npt.get('value'));
				}
			});

			return sb.join('&');
		},

		/**
		 * Shows the node.
		 * @method show
		 * @public
		 */
		show: function()
		{
			this.get('node').setStyle('display', 'block');
		}
	});

Y.CheckboxList = _F;
}, '1.0.0' ,{requires:['widget'], use: []});