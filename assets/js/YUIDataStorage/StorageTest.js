(function() {
var _YU = YAHOO.util,
	_YD = _YU.Dom,
	_YE = _YU.Event,
	_YS = _YU.StorageManager.get(null, _YU.StorageManager.LOCATION_LOCAL);

var _currentKeys = _YD.get('currentKeys'),
	_link = null;

/**
 * Inserts a key into the key list.
 * @method _addItem
 * @param key {String} Required. The key.
 * @private
 */
var _addItem = function(key) {
	var node = _currentKeys.appendChild(document.createElement('a'));
	node.href = '';
	node.appendChild(document.createTextNode(key));
};

// change the engine
_YE.on('enginePicker', 'change', function() {
	var engineType = this.options[this.selectedIndex].value;
	_YS.unsubscribeAll(_YS.CE_CHANGE);
	
	switch (engineType) {
		case _YU.StorageEngineCookie.ENGINE_NAME:
			_YS = _YU.StorageManager.get(engineType, _YU.StorageManager.LOCATION_LOCAL);
		break;
		case _YU.StorageEngineGears.ENGINE_NAME:
			_YS = _YU.StorageManager.get(engineType, _YU.StorageManager.LOCATION_LOCAL);
		break;
		case _YU.StorageEngineSWF.ENGINE_NAME:
			_YS = _YU.StorageManager.get(engineType, _YU.StorageManager.LOCATION_LOCAL);
		break;
		case _YU.StorageEngineHTML5.ENGINE_NAME:
			_YS = _YU.StorageManager.get(engineType, _YU.StorageManager.LOCATION_LOCAL);
		break;
		default:
	}

	_waitForStorage();
});

// save or update a storage key
_YE.on('btnSave', 'click', function() {
	var key = _YD.get('fieldKey').value,
		data = _YD.get('fieldData').value;

	_YD.get('fieldData').value = '';
	_YD.get('fieldKey').value = '';

	if (key && data) {
		_YS.setItem(key, data);
	}
});

// alert the length of storage
_YE.on('btnLength', 'click', function() {
	alert( _YS.length);
});

// delete currently selected storage key
_YE.on('btnDelete', 'click', function(e) {
	var targ = _YE.getTarget(e);

	if (! _YD.hasClass(targ, 'disabled')) {
		_YS.removeItem(_YD.get('fieldKey').value);
		_YD.get('fieldData').value = '';
		_YD.get('fieldKey').value = '';
	}
});

// clear storage data
_YE.on('btnClear', 'click', function(e) {
	_YD.get('fieldData').value = '';
	_YD.get('fieldKey').value = '';
	_currentKeys.innerHTML = '';
	_YS.clear();
});

_YE.on(_currentKeys, 'click', function(e) {
	var targ = _YE.getTarget(e);

	if (targ && 'a' === ('' + targ.tagName).toLowerCase()) {
		_YE.preventDefault(e);
		_link = targ;
		var key = _link.innerHTML;
		_YD.get('fieldKey').value = key;
		_YD.get('fieldData').value = _YS.getItem(key);
		_YD[_currentKeys.childNodes.length ? 'removeClass' : 'addClass']('btnDelete', 'disabled');
	}
});

var _waitForStorage = function() {
	var intervalId = setInterval(function() {
		_YS.subscribe(_YS.CE_READY, function() {
			clearInterval(intervalId);

			_YS.subscribe(_YS.CE_CHANGE, function(e) {
				var isSetItem = null !== e.newValue,
					isNewItem = null === e.oldValue;

				if (isSetItem) {
					if (isNewItem) {
						_addItem(e.key);
					}
				}
				else {
					if (_link) {
						var key = _link.innerHTML;
						_link.parentNode.removeChild(_link);
						_link = null;
						_YS.removeItem(key);
					}
				}

				_YD[_currentKeys.childNodes.length ? 'removeClass' : 'addClass']('btnDelete', 'disabled');
			});

			_currentKeys.innerHTML = '';

			for (var i = 0; i < _YS.length; i += 1) {
				_addItem(_YS.key(i));
			}
		});
	}, 500);
};

_waitForStorage();
}());