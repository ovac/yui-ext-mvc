YUI.add('gallery-macprefradio', function(Y) {
var Lang = Y.Lang,
	Dom = Y.DOM,

	CLASS_ROOT = 'yui3-macprefradio',
	CLASS_ROOT_BUTTON = CLASS_ROOT + '-button',
	CLASS_ROOT_LEFT = CLASS_ROOT + '-left',
	CLASS_ROOT_CENTER = CLASS_ROOT + '-center',
	CLASS_ROOT_RIGHT = CLASS_ROOT + '-right',

	BEFORECHECKED = 'beforechecked',
	BOUNDING_BOX = 'boundingBox',
	CHECKED = 'checked',
	CONTENT_BOX = 'contentBox',
	INNERHTML = 'innerHTML',
	INPUT = 'input',
	NAME = 'name',
	RADIOS = 'radios',
	TEXT = 'text',
	TITLE = 'title',
	VALUE = 'value';

    Y.MacPrefRadio = Y.Base.create('macprefradio', Y.Widget, [], {
		_clickHandler: null,

		/**
		 * @see Y.Base
		 */
		destructor: function() {
			if (this._clickHandler) {this._clickHandler.detach();}
		},

		/**
		 * @see Y.Base
		 */
		initializer: function() {
			this._initEvents();
		},

		/**
		 * @see Y.Widget
		 */
		renderUI: function() {
			var cb, box, nodes, npt, labels,
				name = this.get(NAME);
			
			if (! this.get(RADIOS).length) {

				box = this.get(BOUNDING_BOX);
				cb = this.get(CONTENT_BOX);

				nodes = cb.all('div.' + CLASS_ROOT_BUTTON);

				if (! nodes.size()) {
					nodes = box.all('div.' + CLASS_ROOT_BUTTON);

					// contentBox was improperly setup, move content box
					if (nodes.size()) {
						cbId = cb.get('id');

						Y.each(box.get('childNodes'), function(node) {
							if (cbId != node.get('id')) {
								cb.appendChild(node);
							}
						});
					} else { // nodes are radio buttons, will need to convert
						nodes = box.all('input[type=radio]');

						// validate that we found radio elements
						if (nodes.size()) {
							// determine the 'name' of radio elements
							if (! name) {
								name = nodes.item(0).get(NAME);
							}

							// find labels
							if (this.get(USE_LABEL)) {
								labels = box.all('label');

								if (labels.size()) {
									if (labels.size() == nodes.size()) {
										nodes.each(function(node, i) {
											node.label = labels.item(i);
										});
									}
									else {
										Y.log('There needs to be 1 label per radio input', 'error');
										return;
									}
								}
							}

							box.set(INNERHTML, '');
							box.appendChild(cb);
						} else {
							Y.log('No radios found.', 'error');
							return;
						}
					}
				}

				// find the hidden input used for the serializable value
				npt = cb.one('input[type=hidden]');

				// input exists, parse the 'name'
				if (npt) {
					name = name || npt.get(NAME);
				}

				nodes.each(Y.bind(this._addRadio, this));
			}

			if (name) {
				this.set(NAME, name);
			} else {
				Y.log("No 'name' attribute defined or parsed.", 'error');
			}
		},

		/**
		 * @see Y.Widget
		 */
		bindUI: function() {
			this._clickHandler = this.get(BOUNDING_BOX).on('click', Y.bind(this._handleClick, this));
			this.on(NAME + "Change", Y.bind(this._handleNameChanged, this));
			this.on(RADIOS + "Change", Y.bind(this.syncUI, this));
			this.on(VALUE + "Change", Y.bind(this._handleValueChanged, this));
		},

		/**
		 * @see Y.Widget
		 */
		syncUI: function() {
			var _this = this,
				name = _this.get(NAME),
				cb = _this.get(CONTENT_BOX),
				radios = _this.get(RADIOS),
				j = radios.length - 1,
				sb = '',
				checkedValue = '';

			Y.each(radios, function(o, i) {
				var cls = [CLASS_ROOT_BUTTON], k=1;
				if (0 == i) {cls[k] = CLASS_ROOT_LEFT;}
				else if (j == i) {cls[k] = CLASS_ROOT_RIGHT;}
				else {cls[k] = CLASS_ROOT_CENTER;}
				if (o[CHECKED]) {
					cls[++k] = CHECKED;
					checkedValue = o[VALUE];
				}
				sb += '<div class="' + cls.join(' ') + '" title="' + o[VALUE] + '">' + o[TEXT] + '</div>';
			});

			sb += '<input name="' + name + '" type="hidden"/>';
			cb.set(INNERHTML, sb);
			this.set(VALUE, checkedValue);
		},

		/**
		 * Adds the Node into the list of radios.
		 * @method _addRadio
		 * @param node {Node} Required. The element to process in.
		 * @protected
		 */
		_addRadio: function(node) {
			var o = {};

			if ('INPUT' == node.get('tagName')) {
				o[CHECKED] = node.get(CHECKED);
				o[TEXT] = node.label ? node.label.get(INNERHTML) : node.get(VALUE);
				o[VALUE] = node.get(VALUE);
			}
			else if(node.hasClass(CLASS_ROOT_BUTTON)) {
				o[CHECKED] = node.hasClass(CHECKED);
				o[TEXT] = node.get(INNERHTML);
				o[VALUE] = node.get(TITLE);
			}
			else {
				Y.log('Attempting to add an invalid radio node.', 'error');
				return;
			}

			this.get(RADIOS).push(o);
		},

		/**
		 * Handles the click event on the bounding box.
		 * @method _handleClick
		 * @param e {Event} Required. The triggered `click` JavaScript event.
		 * @protected
		 */
		_handleClick: function(e) {
			var hTarget = e.target,
				hContentBox = this.get(CONTENT_BOX),
				hChecked, value, o = {};

			// target is not a radio button, see if ancestor is
			if (! hTarget.hasClass(CLASS_ROOT_BUTTON)) {
				hTarget = hTarget.ancestor('.' + CLASS_ROOT_BUTTON);
			}

			// valid, unchecked radio button
			if (hTarget && ! hTarget.hasClass(CHECKED)) {
				hChecked = hContentBox.one('.' + CHECKED);
				value = hTarget.get(TITLE);
				o[VALUE] = value;

				if (false !== this.fire(BEFORECHECKED, o)) {
					if (hChecked) {
						hChecked.removeClass(CHECKED);
						o['old' + VALUE] = this.get(VALUE);
					}

					hTarget.addClass(CHECKED);
					this.set(VALUE, value);
					this.fire(CHECKED, o);
				}
			}
		},

		/**
		 * Handles the name changed event of widget.
		 * @method _handleNameChanged
		 * @param e {Event} Required. The custom event.
		 * @protected
		 */
		_handleNameChanged: function(e) {
			var hInput = this.get(CONTENT_BOX).get('lastChild');
			hInput.set(NAME, e.newVal);
		},

		/**
		 * Handles the value changed event of widget.
		 * @method _handleValueChanged
		 * @param e {Event} Required. The custom event.
		 * @protected
		 */
		_handleValueChanged: function(e) {
			var hInput = this.get(CONTENT_BOX).get('lastChild');
			hInput.set(VALUE, e.newVal);
		},

		/**
		 * Publishes MacPrefRadio's events.
		 * @method _initEvents
		 * @protected
		 */
		_initEvents: function() {

			/**
			 * Signals when a radio is about to be checked.
			 * @event beforechecked
			 * @param event {Event.Facade} An Event Facade object with the following attribute specific properties added:
			 *  <dl>
			 *      <dt>value</dt>
			 *          <dd>The new value of the checked radio button.</dd>
			 *      <dt>oldvalue</dt>
			 *          <dd>The previous value of the checked radio button.</dd>
			 *  </dl>
			 */
			this.publish(BEFORECHECKED);

			/**
			 * Signals when a radio is checked.
			 * @event checked
			 * @param event {Event.Facade} An Event Facade object with the following attribute specific properties added:
			 *  <dl>
			 *      <dt>value</dt>
			 *          <dd>The new value of the checked radio button.</dd>
			 *      <dt>oldvalue</dt>
			 *          <dd>The previous value of the checked radio button.</dd>
			 *  </dl>
			 */
			this.publish(CHECKED);
		}
	}, {
		ATTRS: {
			radios: {
				value: [],
				validator: Lang.isArray
			},

			name: {
				validator: Lang.isString
			},

			/**
			 * Internal, don't set. Attribute, so we can subscribe to the valueChange event.
			 */
			value: {
				validator: Lang.isString
			}
		}
	});

}, '', {requires: ['widget','node', 'dom']});