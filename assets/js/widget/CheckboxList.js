/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The CheckboxList classes manages a scrollable list of checkboxes that is rendered via JavaScript.
 * @namespace Core.Widget
 * @class CheckboxList
 */
(function()
{
	// constants
var Y = YAHOO,
	YL = Y.lang,
	YU = Y.util,
	YD = YU.Dom,
	YE = YU.Event,
	ITEM_TMPL = '<li><input id="{id}" name="{name}" type="checkbox" value={value} {checked}/><label for="{id}">{label}</label></li>',

	/**
	 * Callback function for clicking inside the wdiget node.
	 * @method _evtOnClick
	 * @param e {Event} Required. The triggered `click` JavaScript event.
	 * @private
	 */
	_evtOnClick = function(e)
	{
		var targ = YE.getTarget(e);

		if ('input' === YD.getTagName(targ))
		{
			if (this.fireEvent(_F.CE_BEFORE_ONCHECKED, e))
			{
				this.fireEvent(_F.CE_ONCHECKED, e);
			}
			else
			{
				YE.stopEvent(e);
			}
		}
	},

    /**
     * The CheckboxList constructor.
     * @method CheckboxList
     * @param elem {Element|String} Required. A pointer to a block level HTML element; this will be the root for the list.
	 * @param conf {Object} Optional. Configuration parameters.
	 * @constructor
     * @public
     */
	_F = function(elem, conf)
	{
		var _this = this;
		_this._cfg = YL.isObject(conf) ? conf : {};
		if (! YL.isString(_this._cfg.maxHeight)) {_this._cfg.maxHeight = _F.ATTR.maxHeight;}

		_this._node = YD.get(elem);
		_this._tmpl = ITEM_TMPL.replace(/\{name\}/g, _this._cfg.name || _F.ATTR.name);
		_this.createEvent(_F.CE_BEFORE_ONCHECKED, _this);
		_this.createEvent(_F.CE_ONCHECKED, _this);

		YE.on(_this._node, 'click', _evtOnClick, _this, true);
	};

	_F.ATTR =
	{
		maxHeight: '100px',
		name: 'checkboxListValue[]'
	};

	YL.augmentObject(_F,
	{
		CE_BEFORE_ONCHECKED: 'before_onchecked',
		CE_ONCHECKED: 'onchecked'
	});

	_F.prototype =
	{
        /**
         * The configuration object.
         * @property _cfg
         * @type {Object}
         * @protected
         */
		_cfg: null,

        /**
         * The root node for checkbox list.
         * @property _node
         * @type {Element}
         * @protected
         */
		_node: null,

        /**
         * The template for a list item.
         * @property _tmpl
         * @type {String}
         * @protected
         */
		_tmpl: null,

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
			return this._tmpl.replace(/\{id\}/g, id).replace(/\{label\}/g, label).replace(/\{value\}/g, value)
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
			this._node.innerHTML = '';
		},

		/**
		 * Hides the node.
		 * @method hide
		 * @public
		 */
		hide: function()
		{
			YD.setStyle(this._node, 'display', 'none');
		},

		/**
		 * Renders the list from the provided JSON object.
		 * @method render
		 * @param json {Object} Required. An array of objects {id, label, isChecked}.
		 * @public
		 */
		render: function(json)
		{
			var i = 0, j = json.length, o, sb = ['<ul>'];

			for (; i < j; i += 1) {
				o = json[i];
				sb[i + 1] = this._renderItem(o.id, o.label, o.value, o.isChecked);
			}

			sb[i + 1] = '</ul>';
			this._node.innerHTML = sb.join('');

			if (this._cfg.maxHeight.replace(/\[\d\.]+/, '') < YD.getStyle(this._node, 'height').replace(/\[\d\.]+/, ''))
			{
				YD.setStyle(this._node, 'height', this._cfg.maxHeight);
			}

			this.show();
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
				npts = this._node.getElementsByTagName('input');

			for (var i = 0, j = npts.length, npt; i < j; i += 1)
			{
				npt = npts[i];
				if (npt.checked)
				{
					sb.push(npt.name + '=' + npt.value);
				}
			};

			return sb.join('&');
		},

		/**
		 * Shows the node.
		 * @method show
		 * @public
		 */
		show: function()
		{
			YD.setStyle(this._node, 'display', 'block');
		}
	};

    YL.augment(_F, YU.EventProvider);
	Core.Widget.CheckboxList = _F;
}());