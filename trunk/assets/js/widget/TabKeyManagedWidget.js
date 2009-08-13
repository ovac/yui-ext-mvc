/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

YUI().add('tabKeyManagedWidget', function(Y) {
	// constants
var Lang = Y.Lang,
	Node = Y.Node,

	// shared namespace; handles interactions between multiple TabKeyManagedWidgets
	_sharedObject = {
		// The current tab widget.
		_currentWidget: null,

		// Handle the document click, attempt to find a valid tab widget.
		_handleDocumentClick: function(e) {
			var n = e.target,
				i,
				j = _sharedObject.widgets.length;

			// search for ancestor, was this click on element inside of a node we have tab binding on
			for (i = 0; i < j; i += 1) {
				if (_sharedObject.widgets[i].get('node').contains(n)) {
					if (_sharedObject._currentWidget === _sharedObject.widgets[i]) {
						_sharedObject._currentWidget._updateTabIndex(n);
					}
					else {
						_sharedObject._currentWidget = _sharedObject.widgets[i];
						_sharedObject._currentWidget._setupFieldsForTabbing(n);
					}

					return;
				}
			}

			_sharedObject._currentWidget = null;
		},

		// Handle the use of the tab key.
		_handleTabKeyDown: function(e) {
			if (_sharedObject._currentWidget) {
				if (! Y.UA.opera) {e.halt();}

				if (_sharedObject._currentWidget.fire(_F.CE_BEFORE_TAB)) {
					_sharedObject._currentWidget[e.shiftKey ? 'previous' : 'next']();
					_sharedObject._currentWidget.fire(_F.CE_AFTER_TAB);
				}
			}
		},

		// A simple hash to evaluate if a tab widget object has been added.
		hasWidget: {},

		// Initialize the shared object and/or adds the widget thereto.
		init: function(o) {
			if (! _sharedObject.initialized) {
				var doc = o.get('node').get('ownerDocument');
				if (o.get('autoFocus')) {
					doc.on('click', _sharedObject._handleDocumentClick);
				}
				doc.on('key', _sharedObject._handleTabKeyDown, 'down:9');
				_sharedObject.initialized = true;
			}

			if (! _sharedObject.hasWidget[o]) {
				_sharedObject.hasWidget[o] = true;
				_sharedObject.widgets.push(o);
			}
		},

		// Removes the widget from the shard object.
		destroy: function(o) {
			if (_sharedObject.hasWidget[o]) {
				var widgets = [], i = 0, j = _sharedObject.widgets.length;
				delete _sharedObject.hasWidget[o];

				for (; i < j; i += 1) {
					if (o !== _sharedObject.widgets) {
						widgets.push(o);
					}
				}

				_sharedObject.widgets = widgets;
			}
		},

		// Inidicates if the initlization code has run.
		initialized: false,

		// A collection of registered widgets.
		widgets: []
	};

/**
 * The base class for all tab managed widgets.
 * @constructor
 * @namespace Yahoo.base
 * @class TabManagedWidget
 * @param nodeId {String} Required. Base node id.
 * @param conf {String} Optional. A configuration object.
 * @extends Yahoo.widget.Base
 */
function _F(conf) {
	_F.superclass.constructor.apply(this, arguments);
}

/*
 * The name of the `beforeTab` event.
 */
_F.CE_BEFORE_TAB = 'beforeTab';

/*
 * The name of the `afterTab` event.
 */
_F.CE_AFTER_TAB = 'afterTab';

/*
 * Required NAME static field, to identify the Widget class and
 * used as an event prefix, to generate class names etc. (set to the
 * class name in camel case).
 */
_F.NAME = "tabKeyManagedWidget";

/*
 * The attribute configuration for the TabKeyManagedWidget widget. Attributes can be
 * defined with default values, get/set functions and validator functions
 * as with any other class extending Base.
 */
_F.ATTRS = {
	// When active this widget uses document clicking to set the form for tabbing.
	autoFocus: {
		value: true
	},

	// A collection of current fields for tabbing.
	fieldsForTabbing: {
		value: []
	},

	// The HTML className to apply to elements when focused.
	focusClass: {
		value: 'focus'
	},

	// The node to bind this widget.
	node: {
		setter: function(node) {
			var n = Node.get(node); 
			if (!n) {
				Y.fail('TabKeyManagedWidget: Invalid Node Given: ' + node);
			}
			return n;
		}
	},

	// The selector string to find elements for tabbing.
	tabElements: {
		value: 'a,textarea,input,select'
//		value: 'input'
	},

	// The current index in the collection of tabbing fields.
	tabIndex: {
		value: 0
	},

	// The waits to focus on a tab event until the previous BLUR event fires.
	waitForBlur: {
		value: true
	}
};

Y.extend(_F, Y.Base, {

	/**
	 * Applies the focus class to the node, if property is set; also removes it when blurred.
	 * @method _applyFocusClass
	 * @param node {Element} Required. The DOM element to style.
	 * @private
	 */
	_applyFocusClass: function(node) {
		var cls = this.get('focusClass'),
			handle;

		if (cls && node) {
			node.addClass(cls);
			handle = node.on('blur', function() {
				node.removeClass(cls);
				handle.detach();
			});
		}
	},

    /**
     * Initializes the fields to use for tabbing.
     * @method _setupFieldsForTabbing
     * @param field {Element} Required. The element clicked on.
     * @private
     */
    _setupFieldsForTabbing: function(field) {
		var _this = this,
			i = 0,
			j = -1,
			fields = [],
			allFields = Y.all(this.get('tabElements'));

		if (allFields) {
			// iterate on the container inputs and update background positions
			allFields.each(function(fld) {
				var isHidden = 'hidden' === fld.getStyle('visibility') || 'hidden' === fld.getComputedStyle('visibility') || 'hidden' === Node.get('type'),
					isNone = 'none' === fld.getStyle('display') || 'none' === fld.getComputedStyle('display'),
					hasHeight = 0 < fld.get('region').height;

				if (! (isNone || isHidden) && hasHeight) {
					fld.tabIndex = i;
					fields.push(fld);
					if (field === fld) {
						j = i;
						_this._applyFocusClass(fld);
					}
					i += 1;
					if ('javascript://' === fld.href) {fld.href += fld.name;} // helps improve debugging
				}
			});
		}

		// clear existing set
		_this.set('fieldsForTabbing', fields);
		_this.set('tabIndex', -1 < j ? j : fields.length - 1);
	},

	/**
	 * Updates the form tab index of the container.
	 * @method _moveTabIndex
	 * @param isNext {Boolean} Required. True, when you want to move to the next element, false for previous.
	 * @private
	 */
	_moveTabIndex: function(isNext) {
		var _this = this,
			i = _this.get('tabIndex'),
			fields = _this.get('fieldsForTabbing'),
			lastField = fields[i],
			lastFieldBlurHandle, fld, fx, timeout;

		fx = function() {
			if (timeout) {timeout.cancel();}
			do { // iterate until we find a non-disabled field
				i += isNext ? 1 : -1;
				if (fields.length <= i) {i = 0;}
				else if (0 > i) {i = fields.length - 1;}
			}
			while (fields[i] && fields[i].get('disabled'));

			/* fetch field and button pos */
			fld = fields[i];
			_this.set('tabIndex', i);

		    if (fld) {
				fld.focus();
				_this._applyFocusClass(fld);
			}

			if (lastFieldBlurHandle) {lastFieldBlurHandle.detach();}
		};

		if (lastField && _this.get('waitForBlur')) {
			lastFieldBlurHandle = lastField.on('blur', fx);
			timeout = Lang.later(500, _this, fx); // this is because it's possible the BLUR event never fires (anchors or invisible fields)
			if (! Y.UA.opera) {lastField.blur();}
		}
		else {
			fx();
		}
	},

	/**
	 * Updates the form tab index of the container.
	 * @method _updateTabIndex
     * @param node {Element} Required. The selected field.
	 * @private
	 */
	_updateTabIndex: function(node) {
		var fields = this.get('fieldsForTabbing'), fld,
			i = 0,
			j = fields.length;

		for (; i < j; i += 1) {
			fld = fields[i];
			if (node === fld) {
				this.set('tabIndex', i);
				this._applyFocusClass(fld);
			}
		}
	},

    /*
     * destructor is part of the lifecycle introduced by
     * the Widget class. It is invoked during destruction,
     * and can be used to cleanup instance specific state.
     *
     * The TabKeyManagedWidget cleans up any node references it's holding
     * onto. The Widget classes destructor will purge the
     * widget's bounding box of event listeners, so TabKeyManagedWidget
     * only needs to clean up listeners it attaches outside of
     * the bounding box.
     */
    destructor: function() {
		_sharedObject.destroy(this);
    },

	/*
     * initializer is part of the lifecycle introduced by
     * the Widget class. It is invoked during construction,
     * and can be used to setup instance specific state.
     *
     * The TabKeyManagedWidget class does not need to perform anything
     * specific in this method, but it is left in as an example.
     */
    initializer: function(conf) {
		var tabElements = this.get('tabElements').split(','),
			idprefix = '#' + this.get('node').get('id') + ' ';
		_sharedObject.init(this);
		this.set('tabElements', idprefix + tabElements.join(',' + idprefix));
    },

	/**
	 * Moves to the next field in the form.
	 * @method next
	 * @public
	 */
	next: function() {
		this._moveTabIndex(true);
	},

	/**
	 * Moves to the previous field in the form.
	 * @method previous
	 * @public
	 */
	previous: function() {
		this._moveTabIndex(false);
	},

	/**
	 * Updated the sharded object to use this TabKeyManagedWidget.
	 * @method toggleBinding
	 * @param isCurrent {Boolean} Required. Set this widget to the current.
	 * @public
	 */
	toggleBinding: function(isCurrent) {
		_sharedObject._currentWidget = isCurrent ? this : null;
	}
});

Y.TabKeyManagedWidget = _F;
}, '1.0.0' ,{requires:['node'], use: ['lang']});