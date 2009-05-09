/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

var init = function(_W, _D) {
	_W.YAHOO.util.testObject = {

		test: function() {
			alert('This is now attached to the main window.');
		}
	};
};