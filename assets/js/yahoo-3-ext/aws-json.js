YUI.add('gallery-aws-json', function(Y) {

/**
* <p>The AWS JSON Plugin makes interacting with the Amazon Web Services data. By
* leveraging the DataType.XML parsing methods, this plugin automatically converts
* the XML into an appropraite JSON object.</p>
*
* <p>
* The widget currently supports all 'ItemLookup' Operations..
* </p>
*
* @module aws-json
*/

/**
 * Creates an object to handle JavaScript communication between Amazon Web Services and your site using JSON objects
 * 	instead of XML.
 *
 * @class AwsJSON
 * @param config {Object} Optional. Configuration object
 * @constructor
 */
function AwsJSON() {
//	AwsJSON.superclass.constructor.apply(this,arguments);
}

var META_FIELDS = { // from the Request ResponseGroup
		condition:"//Condition",
		deliveryMethod:"//DeliveryMethod",
		idType:"//IdType",
		isValid:"//IsValid",
		itemId:"//ItemId",
		merchantId:"//MerchantId",
		offerPage:"//OfferPage",
		requestId:"//RequestId",
		responseGroup:"//ResponseGroup",
		reviewPage:"//ReviewPage",
		reviewSort:"//ReviewSort",
		searchIndex:"//SearchIndex",
		variationPage:"//VariationPage",
		totalPages:"//List/TotalPages",
		totalResults:"//List/TotalResults"
	},
	RESULT_FIELDS_LINKS = [
		{key:"technicalDetailsURL", locator:'//ItemLinks/ItemLink[1]/URL'}, // [1] may need to change to [0] in IE
		{key:"babyRegistryURL", locator:'//ItemLinks/ItemLink[2]/URL'},
		{key:"weddingRegistryURL", locator:'//ItemLinks/ItemLink[3]/URL'},
		{key:"wishlistURL", locator:'//ItemLinks/ItemLink[4]/URL'},
		{key:"tellAFriendURL", locator:'//ItemLinks/ItemLink[5]/URL'},
		{key:"customerReviewsURL", locator:'//ItemLinks/ItemLink[6]/URL'},
		{key:"allOffersURL", locator:'//ItemLinks/ItemLink[7]/URL'}
	],
	AWS_SCHEMA = {
		args: {
			metaFields: {
				code: '//Errors/Error/Code',
				message: '//Errors/Error/Message'
			},
			resultListLocator: "Argument",
			resultFields: [{key:"name", locator:'@Name'},{key:"value", locator:'@Value'}]
		},

		EditorialReview: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"description", locator:'//EditorialReviews/EditorialReview[1]/Content'},
				{key:"review", locator:'//EditorialReviews/EditorialReview[2]/Content'}
			]
		},

		Images: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"smallImageURL", locator:'//SmallImage/URL'},
				{key:"smallImageWidth", locator:'//SmallImage/Width'},
				{key:"smallImageHeight", locator:'//SmallImage/Height'},
				{key:"smallImageWidthUnits", locator:'//SmallImage/Width/@Units'},
				{key:"smallImageHeightUnits", locator:'//SmallImage/Height/@Units'},
				{key:"mediumImageURL", locator:'//MediumImage/URL'},
				{key:"mediumImageWidth", locator:'//MediumImage/Width'},
				{key:"mediumImageHeight", locator:'//MediumImage/Height'},
				{key:"mediumImageWidthUnits", locator:'//MediumImage/Width/@Units'},
				{key:"mediumImageHeightUnits", locator:'//MediumImage/Height/@Units'},
				{key:"largeImageURL", locator:'//LargeImage/URL'},
				{key:"largeImageWidth", locator:'//LargeImage/Width'},
				{key:"largeImageHeight", locator:'//LargeImage/Height'},
				{key:"largeImageWidthUnits", locator:'//LargeImage/Width/@Units'},
				{key:"largeImageHeightUnits", locator:'//LargeImage/Height/@Units'}
			]
		},

		ItemAttributes: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"amazonMaximumAge", locator:'ItemAttributes/AmazonMaximumAge'},
				{key:"amazonMinimumAge ", locator:'ItemAttributes/AmazonMinimumAge'},
				{key:"amazonMaximumAgeUnits", locator:'ItemAttributes/AmazonMaximumAge/@Units'},
				{key:"amazonMinimumAgeUnits ", locator:'ItemAttributes/AmazonMinimumAge/@Units'},
				{key:"batteriesIncluded ", locator:'ItemAttributes/BatteriesIncluded'},
				{key:"binding ", locator:'ItemAttributes/Binding'},
				{key:"brand ", locator:'ItemAttributes/Brand'},
				{key:"ean ", locator:'ItemAttributes/EAN'},
				{key:"edition ", locator:'ItemAttributes/Edition'},
				{key:"esrbAgeRating ", locator:'ItemAttributes/ESRBAgeRating'},
				{key:"genre ", locator:'ItemAttributes/Genre'},
				{key:"hardwarePlatform ", locator:'ItemAttributes/HardwarePlatform'},
				{key:"isAutographed ", locator:'ItemAttributes/IsAutographed'},
				{key:"isMemorabilia ", locator:'ItemAttributes/IsMemorabilia'},
				{key:"height", locator:'ItemAttributes/ItemDimensions/Height'},
				{key:"length", locator:'ItemAttributes/ItemDimensions/Length'},
				{key:"width", locator:'ItemAttributes/ItemDimensions/Width'},
				{key:"weight", locator:'ItemAttributes/ItemDimensions/Weight'},
				{key:"heightUnits", locator:'ItemAttributes/ItemDimensions/Height/@Units'},
				{key:"lengthUnits", locator:'ItemAttributes/ItemDimensions/Length/@Units'},
				{key:"widthUnits", locator:'ItemAttributes/ItemDimensions/Width/@Units'},
				{key:"weightUnits", locator:'ItemAttributes/ItemDimensions/Weight/@Units'},
				{key:"label", locator:'ItemAttributes/Label'},
				{key:"primaryLanguage", locator:'ItemAttributes/Language/Name'},
				{key:"legalDisclaimer", locator:'ItemAttributes/LegalDisclaimer'},
				{key:"listPriceAmount", locator:'ItemAttributes/ListPrice/Amount'},
				{key:"listPriceCurrencyCode", locator:'ItemAttributes/ListPrice/CurrencyCode'},
				{key:"listPriceFormattedPrice", locator:'ItemAttributes/ListPrice/FormattedPrice'},
				{key:"manufacturer", locator:'ItemAttributes/Manufacturer'},
				{key:"model", locator:'ItemAttributes/Model'},
				{key:"mpn", locator:'ItemAttributes/MPN'},
				{key:"numberOfItems", locator:'ItemAttributes/NumberOfItems'},
				{key:"operatingSystem", locator:'ItemAttributes/OperatingSystem'},
				{key:"packageHeight", locator:'ItemAttributes/PackageDimensions/Height'},
				{key:"packageLength", locator:'ItemAttributes/PackageDimensions/Length'},
				{key:"packageWidth", locator:'ItemAttributes/PackageDimensions/Width'},
				{key:"packageWeight", locator:'ItemAttributes/PackageDimensions/Weight'},
				{key:"packageHeightUnits", locator:'ItemAttributes/PackageDimensions/Height/@Units'},
				{key:"packageLengthUnits", locator:'ItemAttributes/PackageDimensions/Length/@Units'},
				{key:"packageWidthUnits", locator:'ItemAttributes/PackageDimensions/Width/@Units'},
				{key:"packageWeightUnits", locator:'ItemAttributes/PackageDimensions/Weight/@Units'},
				{key:"packageQuantity", locator:'ItemAttributes/PackageQuantity'},
				{key:"platform", locator:'ItemAttributes/Platform'},
				{key:"productGroup", locator:'ItemAttributes/ProductGroup'},
				{key:"productTypeName", locator:'ItemAttributes/ProductTypeName'},
				{key:"publicationDate", locator:'ItemAttributes/PublicationDate'},
				{key:"publisher", locator:'ItemAttributes/Publisher'},
				{key:"releaseDate", locator:'ItemAttributes/ReleaseDate'},
				{key:"studio", locator:'ItemAttributes/Studio'},
				{key:"title", locator:'ItemAttributes/Title'},
				{key:"upc", locator:'ItemAttributes/UPC'}
			]
		},

		ItemIds: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [{key:"asin", locator:'ASIN'}]
		},

		Large: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: []
		},

		Medium: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: []
		},

		Offers: {
			metaFields: {
				lowestNewPriceAmount:'OfferSummary/LowestNewPrice/Amount',
				lowestNewPriceCurrencyCode:'OfferSummary/LowestNewPrice/CurrencyCode',
				lowestNewPriceFormattedPrice:'OfferSummary/LowestNewPrice/FormattedPrice',
				lowestUsedPriceAmount:'OfferSummary/LowestUsedPrice/Amount',
				lowestUsedPriceCurrencyCode:'OfferSummary/LowestUsedPrice/CurrencyCode',
				lowestUsedPriceFormattedPrice:'OfferSummary/LowestUsedPrice/FormattedPrice',
				lowestCollectiblePriceAmount:'OfferSummary/LowestCollectiblePrice/Amount',
				lowestCollectiblePriceCurrencyCode:'OfferSummary/LowestCollectiblePrice/CurrencyCode',
				lowestCollectiblePriceFormattedPrice:'OfferSummary/LowestCollectiblePrice/FormattedPrice',
				totalNew:'OfferSummary/TotalNew',
				totalUsed:'OfferSummary/TotalUsed',
				totalCollectible:'OfferSummary/TotalCollectible',
				totalRefurbished:'OfferSummary/TotalRefurbished',
				totalOffers:'Offers/TotalOffers',
				totalOfferPages:'Offers/TotalOfferPages'
			},
			resultListLocator: "Item",
			resultFields: [
				{key:'merchantId',locator:'Offers/Merchant/MerchantId'},
				{key:'glancePage',locator:'Offers/Merchant/GlancePage'},
				{key:'averageFeedbackRating',locator:'Offers/Merchant/AverageFeedbackRating'},
				{key:'totalFeedback',locator:'Offers/Merchant/TotalFeedback'},
				{key:'condition',locator:'Offers/OfferAttributes/Condition'},
				{key:'subCondition',locator:'Offers/OfferAttributes/SubCondition'},
				{key:'offerListingId',locator:'Offers/OfferListing/OfferListingId'},
				{key:'priceAmount',locator:'Offers/OfferListing/Price/Amount'},
				{key:'priceCurrencyCode',locator:'Offers/OfferListing/Price/CurrencyCode'},
				{key:'priceFormattedPrice',locator:'Offers/OfferListing/Price/FormattedPrice'},
				{key:'availability',locator:'Offers/OfferListing/Availability'},
				{key:'availabilityType',locator:'Offers/OfferListing/AvailabilityAttributes/AvailabilityType'},
				{key:'minimumHours',locator:'Offers/OfferListing/AvailabilityAttributes/MinimumHours'},
				{key:'maximumHours',locator:'Offers/OfferListing/AvailabilityAttributes/MaximumHours'},
				{key:'quantity',locator:'Offers/OfferListing/Quantity'},
				{key:'quantityLimit',locator:'Offers/OfferListing/QuantityRestriction/QuantityLimit'},
				{key:'isEligibleForSuperSaverShipping',locator:'Offers/OfferListing/IsEligibleForSuperSaverShipping'}
			]
		},

		Request: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [{key:"asin", locator:'ASIN'}]
		},

		SalesRank: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"salesRank", locator:'SalesRank'}
			]
		},

		Small: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"actor", locator:'Actor'},
				{key:"artist", locator:'Artist'},
				{key:"asin", locator:'ASIN'},
				{key:"author", locator:'Author'},
				{key:"creator", locator:'Creator'},
				{key:"detailPageURL", locator:'DetailPageURL'},
				{key:"director", locator:'Director'},
				{key:"keywords", locator:'Keywords'},
				{key:"manufacturer", locator:'ItemAttributes/Manufacturer'},
				{key:"message", locator:'Message'},
				{key:"productGroup", locator:'ItemAttributes/ProductGroup'},
				{key:"role", locator:'Role'},
				{key:"title", locator:'ItemAttributes/Title'}
			]
		},

		TagsSummary: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key: 'totalUsage', locator: 'Tags/TotalUsages'},
				{key: 'tagName', locator: 'Tags/Tag/Name'}
			]
		}
	},
	NAME_RESPONSE_GROUP = 'ResponseGroup';

// update schemas that inherit 
AWS_SCHEMA.Small.resultFields = AWS_SCHEMA.Small.resultFields.concat(RESULT_FIELDS_LINKS);
AWS_SCHEMA.Medium.resultFields = AWS_SCHEMA.Small.resultFields.concat(AWS_SCHEMA.Medium.resultFields)
	.concat(AWS_SCHEMA.ItemAttributes.resultFields).concat(AWS_SCHEMA.EditorialReview.resultFields)
	.concat(AWS_SCHEMA.Images.resultFields).concat(AWS_SCHEMA.SalesRank.resultFields);
AWS_SCHEMA.Large.resultFields = AWS_SCHEMA.Medium.resultFields.concat(AWS_SCHEMA.Offers.resultFields)
	/*.concat(AWS_SCHEMA.ItemAttributes.resultFields).concat(AWS_SCHEMA.EditorialReview.resultFields)
	.concat(AWS_SCHEMA.Images.resultFields).concat(AWS_SCHEMA.SalesRank.resultFields)*/;
Y.aggregate(AWS_SCHEMA.Offers.metaFields,META_FIELDS);

// add RESULT_FIELDS_LINKS to schemas where duplication would occur
AWS_SCHEMA.ItemAttributes.resultFields = AWS_SCHEMA.ItemAttributes.resultFields.concat(RESULT_FIELDS_LINKS);

Y.mix(Y.Aws.prototype, {
	_parseAWSContent: function(doc) {
		var args = Y.DataSchema.XML.apply(AWS_SCHEMA.args, doc),
			response = '',
			responseGroup = Y.Array.find(args.results, function(arg) {
				return NAME_RESPONSE_GROUP === arg.name;
			});


		if (responseGroup.value) {
			response = Y.DataSchema.XML.apply(AWS_SCHEMA[responseGroup.value], doc);
		}

		return response;
	},

	/**
	 * Fetches the AWS XML content for a given item and passes that information into the callback.
	 * @method getXML
	 * @param item {String} Required. The item ID to fetch, usually a UPC code.
	 * @param callback {Function} Required. The callback function when data is retrieved.
	 * @param ctx {Object} Optional. The execution context of callbacks; default is 'this'.
	 * @public
	 */
	getJSON: function(item, callback, ctx) {
		this.getXML(item, function(id, o) {
			if (o.responseXML) {
				var json = this._parseAWSContent(o.responseXML);

				if (json) {
					o.responseJSON = json;
					callback.apply(ctx, arguments);
				}
				else {
					alert('AWS request is missing the response type');
				}
			}
			else {
				alert('AWS request failed.');
			}
		}, ctx);
	}
});

}, {requires: ['datatype-json', 'oop', 'gallery-aws']});