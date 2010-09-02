/*
 * Create YUI 3 placeholders and features.
 */
(function() {

	/**
	 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
	 * events.
	 * @module event
	 * @submodule event-base
	 */

	/**
	 * Wraps a DOM event, properties requiring browser abstraction are
	 * fixed here.  Provids a security layer when required.
	 * @class DOMEventFacade
	 * @param ev {Event} the DOM event
	 * @param currentTarget {HTMLElement} the element the listener was attached to
	 * @param wrapper {Event.Custom} the custom event wrapper for this DOM event
	 */

	var ua = YAHOO.env.ua,

		/**
		 * webkit key remapping required for Safari < 3.1
		 * @property webkitKeymap
		 * @private
		 */
			webkitKeymap = {
				63232: 38, // up
				63233: 40, // down
				63234: 37, // left
				63235: 39, // right
				63276: 33, // page up
				63277: 34, // page down
				25:	 9, // SHIFT-TAB (Safari provides a different key code in
				// this case, even though the shiftKey modifier is set)
				63272: 46, // delete
				63273: 36, // home
				63275: 35  // end
			},

		/**
		 * Returns a wrapped node.  Intended to be used on event targets,
		 * so it will return the node's parent if the target is a text
		 * node.
		 *
		 * If accessing a property of the node throws an error, this is
		 * probably the anonymous div wrapper Gecko adds inside text
		 * nodes.  This likely will only occur when attempting to access
		 * the relatedTarget.  In this case, we now return null because
		 * the anonymous div is completely useless and we do not know
		 * what the related target was because we can't even get to
		 * the element's parent node.
		 *
		 * @method resolve
		 * @private
		 */
			resolve = function(n) {
				try {
					if (n && 3 == n.nodeType) {
						n = n.parentNode;
					}
				}
				catch(e) {
					return null;
				}

				return n ? new Y.Node(n) : null;
			},


		// provide a single event with browser abstractions resolved
		//
		// include all properties for both browers?
		// include only DOM2 spec properties?
		// provide browser-specific facade?

			DOMEventFacade = function(ev, currentTarget, wrapper) {

				wrapper = wrapper || {};

				var e = ev, d = document, b = d.body,
						x = e.pageX, y = e.pageY, c, t,
						overrides = wrapper.overrides || {};

				this.altKey = e.altKey;
				this.ctrlKey = e.ctrlKey;
				this.metaKey = e.metaKey;
				this.shiftKey = e.shiftKey;
				this.type = overrides.type || e.type;
				this.clientX = e.clientX;
				this.clientY = e.clientY;

				//////////////////////////////////////////////////////

				if (!x && 0 !== x) {
					x = e.clientX || 0;
					y = e.clientY || 0;

					if (ua.ie) {
						x += Math.max(d.documentElement.scrollLeft, b.scrollLeft);
						y += Math.max(d.documentElement.scrollTop, b.scrollTop);
					}
				}

				this._yuifacade = true;

				/**
				 * The native event
				 * @property _event
				 */
				this._event = e;

				/**
				 * The X location of the event on the page (including scroll)
				 * @property pageX
				 * @type int
				 */
				this.pageX = x;

				/**
				 * The Y location of the event on the page (including scroll)
				 * @property pageY
				 * @type int
				 */
				this.pageY = y;

				//////////////////////////////////////////////////////

				c = e.keyCode || e.charCode || 0;

				if (ua.webkit && (c in webkitKeymap)) {
					c = webkitKeymap[c];
				}

				/**
				 * The keyCode for key events.  Uses charCode if keyCode is not available
				 * @property keyCode
				 * @type int
				 */
				this.keyCode = c;

				/**
				 * The charCode for key events.  Same as keyCode
				 * @property charCode
				 * @type int
				 */
				this.charCode = c;

				//////////////////////////////////////////////////////

				/**
				 * The button that was pushed.
				 * @property button
				 * @type int
				 */
				this.button = e.which || e.button;

				/**
				 * The button that was pushed.  Same as button.
				 * @property which
				 * @type int
				 */
				this.which = this.button;

				//////////////////////////////////////////////////////

				/**
				 * Node reference for the targeted element
				 * @propery target
				 * @type Node
				 */
				this.target = resolve(e.target || e.srcElement);

				/**
				 * Node reference for the element that the listener was attached to.
				 * @propery currentTarget
				 * @type Node
				 */
				this.currentTarget = resolve(currentTarget);

				t = e.relatedTarget;

				if (!t) {
					if (e.type == "mouseout") {
						t = e.toElement;
					} else {
						if (e.type == "mouseover") {
							t = e.fromElement;
						}
					}
				}

				/**
				 * Node reference to the relatedTarget
				 * @propery relatedTarget
				 * @type Node
				 */
				this.relatedTarget = resolve(t);

				/**
				 * Number representing the direction and velocity of the movement of the mousewheel.
				 * Negative is down, the higher the number, the faster.  Applies to the mousewheel event.
				 * @property wheelDelta
				 * @type int
				 */
				if (e.type == "mousewheel" || e.type == "DOMMouseScroll") {
					this.wheelDelta = (e.detail) ? (e.detail * -1) : Math.round(e.wheelDelta / 80) || ((e.wheelDelta < 0) ? -1 : 1);
				}

				//////////////////////////////////////////////////////
				// methods

				/**
				 * Stops the propagation to the next bubble target
				 * @method stopPropagation
				 */
				this.stopPropagation = function() {
					if (e.stopPropagation) {
						e.stopPropagation();
					}
					else {
						e.cancelBubble = true;
					}
					wrapper.stopped = 1;
				};

				/**
				 * Stops the propagation to the next bubble target and
				 * prevents any additional listeners from being exectued
				 * on the current target.
				 * @method stopImmediatePropagation
				 */
				this.stopImmediatePropagation = function() {
					if (e.stopImmediatePropagation) {
						e.stopImmediatePropagation();
					}
					else {
						this.stopPropagation();
					}
					wrapper.stopped = 2;
				};

				/**
				 * Prevents the event's default behavior
				 * @method preventDefault
				 * @param returnValue {string} sets the returnValue of the event to this value
				 * (rather than the default false value).  This can be used to add a customized
				 * confirmation query to the beforeunload event).
				 */
				this.preventDefault = function(returnValue) {
					if (e.preventDefault) {
						e.preventDefault();
					}
					e.returnValue = returnValue || false;
					wrapper.prevented = 1;
				};

				/**
				 * Stops the event propagation and prevents the default
				 * event behavior.
				 * @method halt
				 * @param immediate {boolean} if true additional listeners
				 * on the current target will not be executed
				 */
				this.halt = function(immediate) {
					if (immediate) {
						this.stopImmediatePropagation();
					}
					else {
						this.stopPropagation();
					}

					this.preventDefault();
				};

			},

			W = window,
			WL = W.location,
			Yahoo = YAHOO,
			YU = Yahoo.util,
		//	YW = Yahoo.widget,
			Conn = YU.Connect,
			Lang = Yahoo.lang,
			Selector = YU.Selector,
			Element = YU.Element,
			Dom = YU.Dom,
			Event = YU.Event,
			DOM_REFERENCES = {
				parentNode: true,
				firstChild: true,
				lastChild: true,
				options: true
			},
			DOM_FUNCTIONS = {
				docscrollY: function() {
					return Dom.getDocumentScrollTop();
				},
				viewportRegion: function() {
					return Dom.getClientRegion();
				},
				region: Dom.getRegion
			},

			detachHandle,

			timerHandle,

			WINDOW_RESIZE_CE_NAME = new YU.CustomEvent('window:resize'),

			handler = function(e) {

				if (Y.UA.gecko) {

					WINDOW_RESIZE_CE_NAME.fire(e);

				} else {

					if (timerHandle) {
						timerHandle.cancel();
					}

					timerHandle = Y.later(Y.config.windowResizeDelay || 40, Y, function() {
						WINDOW_RESIZE_CE_NAME.fire(e);
					});
				}

			},

			_updateAttribute = function(ctx, attribute, value) {
				if (ctx) {
					ctx[attribute] = value;
				}

				return value;
			},
			_wrapNode = function(node) {
				if (node) {
					if (node._node) {
						return node;
					}
					else {
						return Lang.isString(node) ? Y.one(node) : new Y.Node(node);
					}
				}

				return null;
			},
			Y = {
				config: {},
				extend: Yahoo.extend,
				each: Yahoo.Array.each,
				later: Lang.later,
				mix: function (r, s, ov, wl, mode, merge) {
					switch (mode) {
						case 1:
							Lang.augment(r, s, ov, wl);
							break;

						case 2:
							Lang.augment(r, s, ov, wl);
							Lang.augmentObject(r, s, ov, wl);
							break;

						case 3:
							Lang.augmentObject(r, s.prototype, ov, wl);
							break;

						case 4:
							Lang.augmentObject(r.prototype, s, ov, wl);
							break;

						default:
							Lang.augmentObject(r, s, ov, wl);
					}

					return r;
				},
				namespace: Yahoo.namespace,
				on: function(e, fn) {
					switch (e) {
						case 'domready':
							return Event.onDOMReady(fn);
						case 'contentready':
							return Event.onContentReady(fn);
						case 'available':
							return Event.onAvailable(fn);
						case 'resize':
							// check for single window listener and add if needed
							if (! detachHandle) {
								detachHandle = Y.Event.attach(window, 'resize', handler);
							}

							var a = Y.Array(arguments, 0, true);
							a.unshift();
							WINDOW_RESIZE_CE_NAME.subscribe.apply(WINDOW_RESIZE_CE_NAME, a);
							return;
					}
				},
				Lang: Lang,
				Array: Yahoo.Array,
				Object: Yahoo.Object,
				UA: Yahoo.env.ua,
				Easing: YU.Easing,

				Event: {},

				EventTarget: YU.EventProvider,

				JSON: Lang.JSON,

				all: function(query) {
					var qnodes = Selector.query(query),
							rnodes = [];

					Y.each(qnodes, function(node, i) {
						rnodes[i] = new Y.Node(node);
					});

					return new Y.NodeList(rnodes);
				},

				bind: function(fn, ctx) {
					return function() {
						return fn.apply(ctx, arguments);
					}
				},

				one: function(query) {
					return _wrapNode(Lang.isString(query) ? Selector.query(query, null, true) : query);
				}
			};

	Y.NodeList = function(arr) {
		this._nodes = arr || [];
	};

	Y.NodeList.prototype = {
		_nodes: null,

		_batch: function(fx, args) {
			var arr = [];
			Y.each(this._nodes, function(node, i) {
				arr[i] = node[fx].apply(node, args);
			});
			return arr;
		},

		addClass: function() {
			this._batch('addClass', arguments);
		},

		each: function(fx, ctx) {
			Y.each(this._nodes, fx, ctx);
		},

		get: function() {
			this._batch('get', arguments);
		},

		getAttribute: function() {
			this._batch('getAttribute', arguments);
		},

		getStyle: function() {
			this._batch('getStyle', arguments);
		},

		hasClass: function() {
			this._batch('hasClass', arguments);
		},

		isEmpty: function() {
			return 0 === this._nodes.length;
		},

		item: function(i) {
			return _wrapNode(this._nodes[i]);
		},

		on: function() {
			var args = arguments;
			this._batch('on', args);

			return {
				detach: function() {
					this._batch('off', args);
				}
			}
		},

		remove: function() {
			this._batch('remove', arguments);
		},

		removeClass: function() {
			this._batch('removeClass', arguments);
		},

		replaceClass: function() {
			this._batch('replaceClass', arguments);
		},

		set: function() {
			this._batch('set', arguments);
		},

		setAttribute: function() {
			this._batch('setAttribute', arguments);
		},

		setStyle: function() {
			this._batch('setStyle', arguments);
		},

		size: function() {
			return this._nodes.length;
		}
	};

	Y.Base = function(oAttributes) {
		var host = this, // help compression
				ctx = host,
				aAttributeDefinitionSet = [], oAttributeDefinition;

		host.name = host.constructor.NAME;

		// this ensures attributes are added starting with the super-most class first
		do {
			ctx = ctx.constructor;
			aAttributeDefinitionSet.push(ctx.ATTRS);
			ctx = ctx.superclass;
		}
		while (ctx);

		while ((oAttributeDefinition = aAttributeDefinitionSet.pop())) {
			if (oAttributeDefinition) {
				Y.Object.each(oAttributeDefinition, function(map, key) {
					host.setAttributeConfig(key, map);
				});
			}
		}

		host.setAttributes(oAttributes || {});
		host.initializer(oAttributes);
	};

	//	YAHOO.augment(Y.Base, YU.EventProvider);
	YAHOO.augment(Y.Base, YU.AttributeProvider);
	Lang.augmentObject(Y.Base.prototype, {
		_setAttr: function() {
			Y.log('Y.Base#_setAttr is not fully implemented');
			this.set.apply(this, arguments);
		},

		fire: Y.Base.prototype.fireEvent,

		publish: Y.Base.prototype.createEvent,

		name: null,

		_on: Y.Base.prototype.on,

		destructor: function() {
			this.set('destroyed', true);
		},

		initializer: function() {
			this.set('initialized', true);
		}
	}, true);


	Y.Base.prototype.on = function() {
		var that = this,
				args = new Y.Array(arguments, 0, true),
				fn = args[1];

		args[1] = function(e) {
			e.newVal = e.newValue;
			e.prevVal = e.prevValue;
			fn.apply(that, arguments);
		};

		this._on.apply(that, args);
	};


	Y.Base.prototype.after = Y.Base.prototype.on;

	Y.Base.ATTRS = {
		destroyed: {
			validator: Lang.isBoolean,
			value: false
		},
		initialized: {
			validator: Lang.isBoolean,
			value: false
		}
	};

	Y.Widget = function() {
		Y.Widget.superclass.constructor.apply(this, arguments);
		this.set('id');
	};

	Y.Widget.ATTRS = {
		boundingBox: {
			value:null,
			setter: _wrapNode,
			writeOnce: true
		},

		contentBox: {
			setter: _wrapNode,
			writeOnce: true
		},

		disabled: {
			value: false
		},

		focused: {
			value: false,
			readOnly:true
		},

		height: {
			value: ''
		},

		id: {
			setter: function() {
				return Lang.getUniqueId();
			},
			writeOnce: true
		},

		render: {
			value:false,
			writeOnce: true
		},

		rendered: {
			value:false,
			readOnly: true
		},

		tabIndex: {
			value: null,
			validator: Lang.isNumber
		},

		visible: {
			value: true
		},

		width: {
			value: ''
		}
	};

	Y.extend(Y.Widget, Y.Base, {
		bindUI: function() {
		},

		destructor: function() {
			this.unsubscribeAll();
			this.set('boundingBox', null);
			this.set('contentBox', null);
		},

		hide: function() {
			this.get('boundingBox').addClass('hide');
		},

		initializer: function() {
			Y.Widget.superclass.initializer.apply(this, arguments);

			if (this.get('render')) {
				this.render();
			}
		},

		/**
		 * Alias for addListener
		 * @method on
		 * @param {String} type The name of the event to listen for
		 * @param {Function} fn The function call when the event fires
		 * @param {Any} obj A variable to pass to the handler
		 * @param {Object} scope The object to use for the scope of the handler
		 */
		on: function() {
			var that = this,
					args = arguments,
					fn;

			if (-1 == args[0].indexOf('Change')) {
				that.createEvent(args[0], that);
				that.addListener.apply(that, args);

				return {
					detach: function() {
						that.removeListener.apply(that, args);
					}
				};
			}
			else {
				Y.Widget.superclass.on.apply(that, args);
			}
		},

		renderUI: function() {
			var that = this,
					contentBox, pnode, nnode;

			if (! that.get('contentBox')) {
				contentBox = that.get('boundingBox').first();
				that.set('contentBox', contentBox ? contentBox : that.get('boundingBox').appendChild(document.createElement('div')));
			}
			else {
				if (! that.get('boundingBox')) {
					contentBox = that.get('contentBox');
					pnode = contentBox.parent();
					nnode = document.createElement('div');

					pnode.replaceChild(nnode, contentBox._node);
					contentBox.appendTo(nnode);
					that.set('boundingBox', nnode);
				}
			}
		},

		render: function() {
			this.renderUI();
			this.bindUI();
			this.syncUI();
		},

		show: function() {
			this.get('boundingBox').removeClass('hide');
		},

		syncUI: function() {
		}
	});

	if (! Y.log) {
		Y.log = function(msg, severity) {
			if ('console' in window) {
				console[severity || 'log'](msg);
			}
		}
	}

	Y.DOM = {
		byId: function(id) {
			return document.getElementById(id);
		},

		/**
		 * Searches the element by the given axis for the first matching element.
		 * @method elementByAxis
		 * @param {HTMLElement} element The html element.
		 * @param {String} axis The axis to search (parentNode, nextSibling, previousSibling).
		 * @param {Function} fn optional An optional boolean test to apply.
		 * @param {Boolean} all optional Whether all node types should be returned, or just element nodes.
		 * The optional function is passed the current HTMLElement being tested as its only argument.
		 * If no function is given, the first element is returned.
		 * @return {HTMLElement | null} The matching element or null if none found.
		 */
		elementByAxis: function(element, axis, fn, all) {
			while (element && (element = element[axis])) { // NOTE: assignment
				if ((all || element.tagName) && (!fn || fn(element))) {
					return element;
				}
			}
			return null;
		}
	};

	Y.io = function(url, conf) {
		var cfg = conf || {},
				config = {
					argument: cfg.arguments,
					data: cfg.data,
					method: cfg.method || 'GET',
					scope: cfg.context,
					timeout: cfg.timeout
				},
				on;

		if (cfg.on) {
			on = cfg.on;
			config.complete = on.complete;
			config.end = on.end;
			config.failure = on.failure;
			config.start = on.start;
			config.success = on.success;
		}

		return Conn.asyncRequest(config.method, url, config, config.data);
	};

	Y.Anim = function() {
		Y.Anim.superclass.constructor.apply(this, arguments);
		var from = this.get('from') || {},
				to = this.get('to'),
				conf = {};

		Y.Object.each(to, function(value, key) {
			conf[key] = {to: value};
		});

		Y.Object.each(from, function(value, key) {
			conf[key].from = value;
		});

		this._anim = new YU.Anim(this.get('node'), conf, this.get('duration'), this.get('easing'));
	};

	Y.Anim.ATTRS = {
		duration: {
			setter: function(value) {
				return _updateAttribute(this._anim, 'duration', value);
			}
		},

		easing: {
			setter: function(value) {
				return _updateAttribute(this._anim, 'method', value);
			}
		},

		from: {
			setter: function(value) {
				var anim = this._anim;
				if (anim) {
					Y.Object.each(value, function(v, k) {
						anim.attributes[k].from = value[k];
					});
				}

				return value;
			},
			validator: Lang.isObject
		},

		node: {
			setter: _wrapNode,
			writeOnce: true
		},

		to: {
			setter: function(value) {
				var anim = this._anim;
				if (anim) {
					Y.Object.each(value, function(v, k) {
						anim.attributes[k].to = value[k];
					});
				}

				return value;
			},
			validator: Lang.isObject
		}
	};

	Y.extend(Y.Anim, Y.Base, {
		_anim: null,

		on: function(evt, fn, data, ctx) {
			switch (evt) {
				case 'end':
					this._anim.onComplete.subscribe(fn, data, ctx);
					break;
				case 'start':
					this._anim.onStart.subscribe(fn, data, ctx);
					break;
				case 'tween':
					this._anim.onTween.subscribe(fn, data, ctx);
					break;
			}
		},

		run: function() {
			return this._anim.animate();
		},

		stop: function(finish) {
			this._anim.stop(finish);
		}
	});

	Y.Node = function(elem, conf) {
		var node = (elem.indexOf && -1 < elem.indexOf('#')) ? Selector.query(elem, null, true) : elem;
		Y.Node.superclass.constructor.call(this, node, conf);

		this._node = this.get('element');

		if (! this.get('id')) {
			this.set('id', Lang.getUniqueId());
		}
	};

	Y.Node.create = function(html, doc) {
		var temp = (doc || document).createElement('div'),
				len;

		temp.innerHTML = Lang.trim(html);
		len = temp.childNodes.length;

		if (len) {
			return 1 < len ? new Y.NodeList(new Y.Array(temp.childNodes, 0, true)) : new Y.Node(temp.firstChild);
		}
		else {
			return null;
		}
	};

	Y.extend(Y.Node, YU.Element, {

		_node: null,

		all: function(query) {
			return Y.all('#' + this.get('id') + ' ' + query);
		},

		ancestor: function(query, testSelf) {
			var fnEval = function(node) {
				return Selector.filter([node], query).length;
			},
					node;

			if (testSelf && fnEval(this._node)) {
				node = this;
			}

			if (! node) {
				node = Dom.getAncestorBy(this._node, fnEval);
			}

			return _wrapNode(node);
		},

		appendChild: function() {
			return _wrapNode(Y.Node.superclass.appendChild.apply(this, arguments));
		},

		_blur: function() {
			this._node.blur();
		},

		blur: function() {
			var _this = this;
			if (_this._node) {
				_this._blur();
			}
			else {
				_this.on('available', _this._blur, _this, true);
			}
		},

		compareTo: function(oNode) {
			var oNodeA = this._node,
					oNodeB = oNode instanceof Y.Node ? oNode._node : oNode;

			return oNodeA === oNodeB;
		},

		create: function(html, doc) {
			var fragment = (doc || document).createElement('div');
			fragment.innerHTML = html;
			return new Y.Node(fragment.firstChild);
		},

		_focus: function() {
			this._node.focus();
		},

		focus: function() {
			var _this = this;
			if (_this._node) {
				_this._focus();
			}
			else {
				_this.on('available', _this._focus, _this, true);
			}
		},

		get: function(lbl) {
			if (DOM_FUNCTIONS[lbl]) {
				return DOM_FUNCTIONS[lbl](this._node);
			}

			var o = Y.Node.superclass.get.apply(this, arguments);

			if (DOM_REFERENCES[lbl] && o) {
				return o.item ? new Y.NodeList(o) : _wrapNode(o);
			}

			return o;
		},

		hasChildNodes: function() {
			return this._node.childNodes.length;
		},

		insertBefore: function() {
			return _wrapNode(Y.Node.superclass.insertBefore.apply(this, arguments));
		},

		next: function(fn) {
			return _wrapNode(Dom[fn ? 'getNextSiblingBy' : 'getNextSibling'](this._node, fn));
		},

		/**
		 * Alias for addListener
		 * @method on
		 * @param {String} type The name of the event to listen for
		 * @param {Function} fn The function call when the event fires
		 * @param {Any} obj A variable to pass to the handler
		 * @param {Object} scope The object to use for the scope of the handler
		 */
		on: function(type, fn, obj, scope) {
			var _this = this,
					func = function(e, o) {
						if (e.target) {
							fn.call(this, new DOMEventFacade(e, e.relatedTarget || e.originalTarget), o);
						}
						else {
							fn.call(this, e);
						}
					};

			_this.addListener.call(_this, type, func, obj, scope);

			return {
				detach: function() {
					_this.removeListener.call(_this, type, func, obj, scope);
				}
			};
		},

		one: function(query) {
			return _wrapNode(Selector.query(query, this._node, true));
		},

		previous: function(fn) {
			return _wrapNode(Dom[fn ? 'getPreviousSiblingBy' : 'getPreviousSibling'](this._node, fn));
		},

		setXY: function(pt) {
			Dom.setXY(this._node, pt);
		}
	});

	Y.Event.attach = function(evtName, fn, node) {
		var elNode = _wrapNode(node),
				args = new Y.Array(arguments, null, true);
		args.unshift();

		elNode.on.apply(elNode, args);
	};

	Y.Event.detach = function(evtName, fn, node) {
		var elNode = _wrapNode(node),
				args = new Y.Array(arguments, null, true);
		args.unshift();

		elNode.off.apply(elNode, args);
	};

	W.YUI = function() {
		return {
			use: function() {
				arguments[arguments.length - 1].call(W, Y);
			}
		};
	};

	W.YUI.add = function() {
		arguments[1].call(W, Y);
	};

	Y.Base.create = function(name, base, extensions, px, sx) {
		function tempConstructor() {
			tempConstructor.superclass.constructor.apply(this, arguments);
		}

		tempConstructor.NAME = name;
		tempConstructor.TAB_NAME = name;

		// add in static values
		if (sx) {
			Y.Object.each(sx, function(v, k) {
				tempConstructor[k] = v;
			});
		}

		Y.extend(tempConstructor, base, px);

		return tempConstructor;
	};

}());