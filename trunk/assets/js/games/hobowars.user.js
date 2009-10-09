/*
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.00
 */

// Hobowars Manager
// version 0.1
// 2009-06-04
// Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Face Book Mafia Wars Quick/Auto Heal", and click Uninstall.
//
// --------------------------------------------------------------------
/*
History
-------
	06/04/09 - version 0.1    - Created

*/
//
// ==UserScript==
// @name 		  Hobowars Management Script
// @namespace 	 http://www.mattsnider.com
// @description    Managements your hobowars account for you
// @include 	   http://www.hobowars.com/game/*
// @version 	   0.1
// ==/UserScript==

(function() {

String.prototype.trim = function() {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

var _getQueryValue = function(str, key) {
	var url = '&' === str.charAt(0) ? str : '&' + str; // prevents malformed url problem
	//noinspection JSDeprecatedSymbols
	var regex = new RegExp('[\\?&]' + key + '=([^&#]*)'),
		results = regex.exec(url);

	return results ? decodeURIComponent(results[1]) : '';
};

	// constants query keys
var _QK_USER_ID = 'sr',
	_QK_COMMAND = 'cmd',
	_QK_ACTION = 'action',
	_QK_MOVE = 'move',

	// constant actions
	_ACTION_RPSLS = 'rpsls',

	// constant commands
	_CMD_CITY_HALL = 'city_hall',

	// constant moves
	_MOVE_ROCK = 'rock',
	_MOVE_PAPER = 'paper',
	_MOVE_SCISSORS = 'scissors',
	_MOVE_LIZARD = 'lizard',
	_MOVE_SPOCK = 'spock',

	_TEXT_EARS = "You notice the bald guy's ear wiggles a little bit...",
	_TEXT_EYES = 'You notice the bald guy crossing his eyes a little bit...',
	_TEXT_GROUND = 'You notice the bald guy planting both his feet firmly on the ground...',
	_TEXT_PALM = 'You nod your head and the bald hobo sticks his fist in his palm.',
	_TEXT_STARE = 'You stare the bald hobo straight in the eyes as you steel yourself mentally.',
	_TEXT_THUMB = 'You notice the bald guy tucking his thumb inside his fist...',
	_TEXT_TONGUE = 'You notice the bald guy sticking out his tongue slightly...',

	// local parameters
	_linkMap = {},
	_links = document.getElementsByTagName('a'),
	_length = _links.length,
	_page = {
		sr: _getQueryValue(window.location.href, _QK_USER_ID),
		cmd: _getQueryValue(window.location.href, _QK_COMMAND),
		action: _getQueryValue(window.location.href, _QK_ACTION),
		move: _getQueryValue(window.location.href, _QK_MOVE)
	};

var _isValidLink = function() {
	var args = arguments, j = arguments.length,
		map = _linkMap;

	for (var i=0; i < j; i += 1) {
		var arg = args[i];
		map = map[arg];
		if (! map) {return false;}
	}

	return true;
};

	// cache page links
for (var i=0; i < _length; i += 1) {
	var link = _links[i],
		cmd = _getQueryValue(link.href, _QK_COMMAND),
		action = _getQueryValue(link.href, _QK_ACTION),
		move = _getQueryValue(link.href, _QK_MOVE);

	if (! _linkMap[cmd]) {_linkMap[cmd] = {};}
	if (! _linkMap[cmd][action]) {_linkMap[cmd][action] = {};}
	if (! _linkMap[cmd][action][move]) {_linkMap[cmd][action][move] = link;}
}

if (_CMD_CITY_HALL === _page.cmd) {
	if (_ACTION_RPSLS === _page.action) {
		//	var b = confirm('Do you want to play Rock, Paper, Scissors, Lizard, Spock?');
		var	b = true;

		if (b && _isValidLink(_CMD_CITY_HALL, _ACTION_RPSLS, _MOVE_ROCK)) {
			var nodeLinkRock = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_ROCK],
				nodeTextMsg = nodeLinkRock.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling,
				text = nodeTextMsg.nodeValue,
				node = null;

			if (! text.trim()) {
				nodeTextMsg = nodeTextMsg.previousSibling.previousSibling.previousSibling;
				text = nodeTextMsg.nodeValue;
			}

			switch (text.trim()) {
				case (_TEXT_PALM + ' ' + _TEXT_EARS): case (_TEXT_STARE + ' ' + _TEXT_EARS): node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_LIZARD]; break;
				case (_TEXT_PALM + ' ' + _TEXT_EYES): case (_TEXT_STARE + ' ' + _TEXT_EYES): node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_ROCK]; break;
//				case (_TEXT_PALM + ' ' + _TEXT_GROUND): case (_TEXT_STARE + ' ' + _TEXT_GROUND): node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_SPOCK]; break;
				case (_TEXT_PALM + ' ' + _TEXT_GROUND): case (_TEXT_STARE + ' ' + _TEXT_GROUND): 
	//			case _TEXT_PALM: case _TEXT_STARE: node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_SPOCK]; break;
				case _TEXT_PALM: case _TEXT_STARE: node = {href: 'http://www.hobowars.com/game/game.php?sr=158&cmd=city_hall'}; break;
				case (_TEXT_PALM + ' ' + _TEXT_THUMB): case (_TEXT_STARE + ' ' + _TEXT_THUMB): node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_LIZARD]; break;
				case (_TEXT_PALM + ' ' + _TEXT_TONGUE): case (_TEXT_STARE + ' ' + _TEXT_TONGUE): node = _linkMap[_CMD_CITY_HALL][_ACTION_RPSLS][_MOVE_ROCK]; break;
				default:
			}

			if (node) {
	//			alert(node.href);
				window.location.href = node.href;
			}
			else {
				alert('fail');
			}
		}
	}
	else {
		window.location.href = 'http://www.hobowars.com/game/game.php?sr=158&cmd=city_hall&action=rpsls';
	}
}

}());