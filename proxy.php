<?php
// PHP Proxy
// Responds to both HTTP GET and POST requests
//
// Script originally written by Abdul Qabiz
// Author: Matt Snider
// July 11th, 2009
//

// add domains here to prevent proxy chaining by nefarious people; default allows all domains
$domainWhitelist = array('core.localhost', 'localhost', 'mattsnider.com');
$isDomainValid = true;
if (sizeof($domainWhitelist)) {
	$domain = preg_replace("/^www\./", "", $_SERVER['HTTP_HOST']);
	$isXMLHttpRequest = array_key_exists('HTTP_X_REQUESTED_WITH', $_SERVER) && 'XMLHttpRequest' === $_SERVER['HTTP_X_REQUESTED_WITH'];
	$isDomainValid = $isXMLHttpRequest && in_array($domain, $domainWhitelist);
}

if ($isDomainValid) {

	// Get the url of to be proxied
	// Is it a POST or a GET?
	$isPost = array_key_exists('url', $_POST);
	$url = ($isPost) ? $_POST['url'] : $_GET['url'];
	$headers = '';
	$mimeType = '';

	if ($isPost) {
		if (array_key_exists('headers', $_POST)) {$headers = $_POST['headers'];}
		if (array_key_exists('mimeType', $_POST)) {$mimeType = $_POST['mimeType'];}
	}
	else {
		if (array_key_exists('headers', $_GET)) {$headers = $_GET['headers'];}
		if (array_key_exists('mimeType', $_GET)) {$mimeType = $_GET['mimeType'];}
	}


	//Start the Curl session
	$session = curl_init($url);
	//print_r($_SERVER);

	// If it's a POST, put the POST data in the body
	if ($isPost) {
		$postvars = '';
		while ($element = current($_POST)) {
			$postvars .= key($_POST).'='.$element.'&';
			next($_POST);
		}
		curl_setopt ($session, CURLOPT_POST, true);
		curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
	}

	// Don't return HTTP headers. Do return the contents of the call
	curl_setopt($session, CURLOPT_HEADER, ($headers == "true") ? true : false);

	curl_setopt($session, CURLOPT_FOLLOWLOCATION, true);
	// prevents an accidental or intentional DoS attack
	curl_setopt($session, CURLOPT_MAXREDIRS, 2);
	//curl_setopt($ch, CURLOPT_TIMEOUT, 4);
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

	// Make the call
	$response = curl_exec($session);

	if ($mimeType != "")
	{
		// The web service returns XML. Set the Content-Type appropriately
		header("Content-Type: ".$mimeType);
	}

	echo $response;

	curl_close($session);
}
?>