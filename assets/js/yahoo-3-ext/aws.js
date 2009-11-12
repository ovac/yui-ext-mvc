YUI.add('gallery-aws', function(Y) {
var RX_URL = /^(https?:\/\/)?(([\w!~*'().&=+$%-]+: )?[\w!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([\w!~*'()-]+\.)*([\w^-][\w-]{0,61})?[\w]\.[a-z]{2,6})(:[0-9]{1,4})?((\/*)|(\/+[\w!~*'().;?:@&=+$,%#-]+)+\/*)$/,

	_isReady = false,
	_timeoutLength = 100,
	_timeoutStep = 50,
	_timer;

/**
 * Create an AWS object that can handles communication between your site and Amazon Web Services.
 * @module aws
 */

/**
 * Creates an object to handle JavaScript communication between Amazon web services and your site.
 *
 * @class Aws
 * @param config {Object} Optional. Configuration object
 * @constructor
 */
function Aws() {
	Aws.superclass.constructor.apply(this,arguments);
}

Y.mix(Aws, {
	/**
	 * @property Aws.NAME
	 * @type String
	 * @static
	 */
	NAME : 'aws',

	/**
	 * @property Aws.ATTRS
	 * @type Object
	 * @static
	 */
	ATTRS : {

		/** 
		 * @attribute awsSignedUrl
		 * @type String
		 * @default '/getAWSSignedUrl.php'
		 * @description The URL to fetch the AWS signed URL.
		 */
		awsSignedUrl: {
			value : '/getAWSSignedUrl.php',
			validator : function (val) {
				return this._validateUrl(val);
			}
		},

		/**
		 * @attribute operation
		 * @type String
		 * @default 'ItemLookup'
		 * @description The AWS Operation.
		 */
		operation: {
			value: 'ItemLookup',
			validator: function(val) {
				return -1 < Y.Array.indexOf(Aws.OPERATION, val);
			}
		},

		/**
		 * @attribute responseGroup
		 * @type String
		 * @default 'Small'
		 * @description The AWS ResponseGroup.
		 */
		responseGroup: {
			value: 'Small',
			validator: function(val) {
				return -1 < Y.Array.indexOf(Aws.RESPONSE_GROUP, val);
			}
		}
	},

	/**
	 * @property Aws.OPERATION
	 * @type Array
	 * @static
	 */
	OPERATION: ['ItemLookup', 'ItemSearch', 'ListLookup', 'SimilarityLookup'],

	/**
	 * @property Aws.RESPONSE_GROUP
	 * @type Array
	 * @static
	 */
	RESPONSE_GROUP: ['Request', 'ItemIds', 'Small', 'Medium', 'Large', 'Offers', 'OfferFull', 'OfferSummary',
		'OfferListings', 'PromotionSummary', 'PromotionDetails', 'Variations', 'VariationImages', 'VariationMinimum',
		'VariationSummary', 'TagsSummary', 'Tags', 'VariationMatrix', 'VariationOffers', 'ItemAttributes',
		'MerchantItemAttributes', 'Tracks', 'Accessories', 'EditorialReview', 'SalesRank', 'BrowseNodes', 'Images',
		'Similarities', 'Subjects', 'Reviews', 'ListmaniaLists', 'SearchInside', 'PromotionalTag',
		'AlternateVersions', 'Collections', 'ShippingCharges', 'RelatedItems']
});

Y.extend(Aws, Y.Base, {

	/**
	 * Evaluate the url.
	 * @method _validateUrl
	 * @param val {String} Required. The value to evaluate.
	 * @return {Boolean} The URL is valid.
	 * @protected
	 */
	_validateUrl: function(val) {
		return ('' + val).match(RX_URL);
	},

	/**
	 * Fetches the AWS XML content for a given item and passes that information into the callback.
	 * @method getXML
	 * @param conf {String} Required. The parameters required for the AWS request.
	 * @param callback {Function} Required. The callback function when data is retrieved.
	 * @param ctx {Object} Optional. The execution context of callbacks; default is 'this'.
	 * @public
	 */
	getXML: function(conf, callback, ctx) {
		if (_isReady) {
			var cfg = Y.Lang.isObject(conf) ? conf : {},
				url = this.get('awsSignedUrl'),
				operation = this.get('operation'),
				responseGroup = this.get('responseGroup'),
				context = ctx || this;

			if (_timer) {_timer.halt();}

			// build URL to fetch AWS URL
			if (-1 === url.indexOf('?')) {url += '?';}
			url += '&ResponseGroup=' + responseGroup + '&Operation=' + operation;

			Y.each(cfg, function(value, key) {
				url += '&' + key + '=' + value;
			});

			// fetch AWS URL
			Y.io(url, {on: {success: function(id,o) {
				try {
					// parse AWS URL
					var data = Y.JSON.parse(o.responseText);

					if (! data.aws_request) {
						// todo: update message to show missing parameters
						alert('AWS request is missing required parameters');
						return;
					}

					Y.io(data.aws_request, {context: context, on:{success: function(id,o) {
						// this is intentional, I cannot get "Y.DataSchema.XML" to work with namespaces
						var responseText = o.responseText.replace(/xmlns=".*?"/, ''), code, msg; // remove the namespace
						o.responseXML = Y.DataType.XML.parse(responseText); // convert to XML

						code = o.responseXML.getElementsByTagName('Code')[0];
						msg = o.responseXML.getElementsByTagName('Message')[0];

						// show AWS errors
						if (code && msg && code.firstChild.nodeValue) {
							alert(code.firstChild.nodeValue + "\n" + msg.firstChild.nodeValue);
							return;
						}

						callback.apply(this, arguments);
					}}, xdr:{/*dataType:'xml', */responseXML:false, use:'flash'}});
				}
				catch (e) {
					alert('Call to getAWSSignedUrl was not parsable');
				}
			}}});
		}
		else {
			_timer = Y.later(_timeoutLength, this, this.getXML, arguments);
			_timeoutLength += _timeoutStep;
		}
	}
});

// todo: figure out how to determine if the io.swf failed to load
// prepare the io.swf for xdr communication
Y.on('io:xdrReady', function() {
	_isReady = true;
}, this);
Y.io.transport({src:'/assets/file/io.swf?ts=' + new Date().valueOf().toString()});

Y.Aws = Aws;
}, {requires: ['io-base', 'io-xdr', 'json-parse', 'collection', 'dataschema', 'datatype-xml']});