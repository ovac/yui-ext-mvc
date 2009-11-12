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
				{key:"amazonMaximumAge", locator:'//AmazonMaximumAge'},
				{key:"amazonMinimumAge ", locator:'//AmazonMinimumAge'},
				{key:"amazonMaximumAgeUnits", locator:'//AmazonMaximumAge/@Units'},
				{key:"amazonMinimumAgeUnits ", locator:'//AmazonMinimumAge/@Units'},
				{key:"batteriesIncluded ", locator:'//BatteriesIncluded'},
				{key:"binding ", locator:'//Binding'},
				{key:"brand ", locator:'//Brand'},
				{key:"ean ", locator:'//EAN'},
				{key:"edition ", locator:'//Edition'},
				{key:"esrbAgeRating ", locator:'//ESRBAgeRating'},
				{key:"genre ", locator:'//Genre'},
				{key:"hardwarePlatform ", locator:'//HardwarePlatform'},
				{key:"isAutographed ", locator:'//IsAutographed'},
				{key:"isMemorabilia ", locator:'//IsMemorabilia'},
				{key:"height", locator:'//ItemDimensions/Height'},
				{key:"length", locator:'//ItemDimensions/Length'},
				{key:"width", locator:'//ItemDimensions/Width'},
				{key:"weight", locator:'//ItemDimensions/Weight'},
				{key:"heightUnits", locator:'//ItemDimensions/Height/@Units'},
				{key:"lengthUnits", locator:'//ItemDimensions/Length/@Units'},
				{key:"widthUnits", locator:'//ItemDimensions/Width/@Units'},
				{key:"weightUnits", locator:'//ItemDimensions/Weight/@Units'},
				{key:"label", locator:'//Label'},
				{key:"primaryLanguage", locator:'//Language/Name'},
				{key:"legalDisclaimer", locator:'//LegalDisclaimer'},
				{key:"listPriceAmount", locator:'//ListPrice/Amount'},
				{key:"listPriceCurrencyCode", locator:'//ListPrice/CurrencyCode'},
				{key:"listPriceFormattedPrice", locator:'//ListPrice/FormattedPrice'},
				{key:"manufacturer", locator:'Manufacturer'},
				{key:"model", locator:'//Model'},
				{key:"mpn", locator:'//MPN'},
				{key:"numberOfItems", locator:'//NumberOfItems'},
				{key:"operatingSystem", locator:'//OperatingSystem'},
				{key:"packageHeight", locator:'//PackageDimensions/Height'},
				{key:"packageLength", locator:'//PackageDimensions/Length'},
				{key:"packageWidth", locator:'//PackageDimensions/Width'},
				{key:"packageWeight", locator:'//PackageDimensions/Weight'},
				{key:"packageHeightUnits", locator:'//PackageDimensions/Height/@Units'},
				{key:"packageLengthUnits", locator:'//PackageDimensions/Length/@Units'},
				{key:"packageWidthUnits", locator:'//PackageDimensions/Width/@Units'},
				{key:"packageWeightUnits", locator:'//PackageDimensions/Weight/@Units'},
				{key:"packageQuantity", locator:'//PackageQuantity'},
				{key:"platform", locator:'//Platform'},
				{key:"productGroup", locator:'//ProductGroup'},
				{key:"productTypeName", locator:'//ProductTypeName'},
				{key:"publicationDate", locator:'//PublicationDate'},
				{key:"publisher", locator:'//Publisher'},
				{key:"releaseDate", locator:'//ReleaseDate'},
				{key:"studio", locator:'//Studio'},
				{key:"title", locator:'//Title'},
				{key:"upc", locator:'//UPC'}
			]
		},

		ItemIds: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [{key:"asin", locator:'ASIN'}]
		},

		Medium: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: []
		},

		Offers: {
			metaFields: {
				lowestNewPriceAmount:'//LowestNewPrice/Amount',
				lowestNewPriceCurrencyCode:'//LowestNewPrice/CurrencyCode',
				lowestNewPriceFormattedPrice:'//LowestNewPrice/FormattedPrice',
				lowestUsedPriceAmount:'//LowestUsedPrice/Amount',
				lowestUsedPriceCurrencyCode:'//LowestUsedPrice/CurrencyCode',
				lowestUsedPriceFormattedPrice:'//LowestUsedPrice/FormattedPrice',
				lowestCollectiblePriceAmount:'//LowestCollectiblePrice/Amount',
				lowestCollectiblePriceCurrencyCode:'//LowestCollectiblePrice/CurrencyCode',
				lowestCollectiblePriceFormattedPrice:'//LowestCollectiblePrice/FormattedPrice',
				totalNew:'//TotalNew',
				totalUsed:'//TotalUsed',
				totalCollectible:'//TotalCollectible',
				totalRefurbished:'//TotalRefurbished',
				totalOffers:'//TotalOffers',
				totalOfferPages:'//TotalOfferPages'
			},
			resultListLocator: "Item",
			resultFields: [
				{key:'merchantId',locator:'//MerchantId'},
				{key:'glancePage',locator:'//GlancePage'},
				{key:'averageFeedbackRating',locator:'//AverageFeedbackRating'},
				{key:'totalFeedback',locator:'//TotalFeedback'},
				{key:'condition',locator:'//Condition'},
				{key:'subCondition',locator:'//SubCondition'},
				{key:'offerListingId',locator:'//OfferListingId'},
				{key:'priceAmount',locator:'//Amount'},
				{key:'priceCurrencyCode',locator:'//CurrencyCode'},
				{key:'priceFormattedPrice',locator:'//FormattedPrice'},
				{key:'availability',locator:'//Availability'},
				{key:'availabilityType',locator:'//AvailabilityType'},
				{key:'minimumHours',locator:'//MinimumHours'},
				{key:'maximumHours',locator:'//MaximumHours'},
				{key:'quantity',locator:'//Quantity'},
				{key:'quantityLimit',locator:'//QuantityLimit'},
				{key:'isEligibleForSuperSaverShipping',locator:'//IsEligibleForSuperSaverShipping'},
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
				{key:"correctedQuery", locator:'CorrectedQuery'},
				{key:"creator", locator:'Creator'},
				{key:"detailPageURL", locator:'DetailPageURL'},
				{key:"director", locator:'Director'},
				{key:"keywords", locator:'Keywords'},
				{key:"manufacturer", locator:'Manufacturer'},
				{key:"message", locator:'Message'},
				{key:"productGroup", locator:'ProductGroup'},
				{key:"role", locator:'Role'},
				{key:"title", locator:'Title'}
			]
		}
	},
	NAME_RESPONSE_GROUP = 'ResponseGroup';

// update schemas that inherit
AWS_SCHEMA.Small.resultFields = AWS_SCHEMA.Small.resultFields.concat(RESULT_FIELDS_LINKS);
AWS_SCHEMA.Medium.resultFields = AWS_SCHEMA.Small.resultFields.concat(AWS_SCHEMA.Medium.resultFields)
	.concat(AWS_SCHEMA.ItemAttributes.resultFields).concat(AWS_SCHEMA.EditorialReview.resultFields)
	.concat(AWS_SCHEMA.Images.resultFields).concat(AWS_SCHEMA.SalesRank.resultFields);
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