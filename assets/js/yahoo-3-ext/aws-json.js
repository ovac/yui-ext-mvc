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

		/**
&Operation=ItemLookup&IdType=ASIN&ItemId=B00008OE6I&ResponseGroup=Accessories
		 <Item>
		  <ASIN>#</ASIN>
		  <Accessories>
			<Accessory>
			  <ASIN>B00003G1RG</ASIN>
			  <Title>Viking 128 MB CompactFlash Card (CF128M)</Title>
			</Accessory>
		 	...
		  </Accessories>
		 </Item>
		 */
		Accessories: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'}
			]
		},
		AccessoriesItem: {
			metaFields: {},
			resultListLocator: "Accessory",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key:"title", locator:'Title'}
			]
		},

		/**
&SearchIndex=Books&Keywords=potter&MerchantId=All&ResponseGroup=AlternateVersions
		 <Item>
			 <ASIN>#</ASIN>
			 <AlternateVersions>
			  <AlternateVersion>
				<ASIN>030728364X</ASIN>
				<Title>Harry Potter and the Half-Blood Prince (Book 6)</Title>
				<Binding>Audio Cassette</Binding>
			  </AlternateVersion>
			  ...
			 </AlternateVersions>
		 </Item>
		 */
		AlternateVersions: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'}
			]
		},
		AlternateVersionsItem: {
			metaFields: {},
			resultListLocator: "AlternateVersion",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key:"title", locator:'Title'},
				{key:"binding", locator:'Binding'}
			]
		},

		/**
&Operation=BrowseNodeLookup&BrowseNodeId=11232&ResponseGroup=BrowseNodeInfo
		<BrowseNodes>
		  <BrowseNode>
		  <BrowseNodeId>11232</BrowseNodeId>
		  <Name> Social Sciences</Name>
		  <Ancestors>
			<BrowseNode>
			  <BrowseNodeId>53</BrowseNodeId>
			  <Name>Nonfiction</Name>
			  <Ancestors>
				<BrowseNode>
				  <BrowseNodeId>1000</BrowseNodeId>
				  <Name>Subjects</Name>
				  <Ancestors>
					<BrowseNode>
					  <BrowseNodeId>283155</BrowseNodeId>
					  <Name>Books</Name>
					</BrowseNode>
				  </Ancestors>
				</BrowseNode>
			  </Ancestors>
			</BrowseNode>
		  </Ancestors>
		  <Children>
			<BrowseNode>
			  <BrowseNodeId>11233</BrowseNodeId>
			  <Name>Anthropology</Name>
			</BrowseNode>
		 	...
		  </Children>
		 </BrowseNode>
		</BrowseNodes>
		 */
		BrowseNodeInfo: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"browseNodeId", locator:'BrowseNodes/BrowseNode/BrowseNodeId'},
				{key:"browseNodeName", locator:'BrowseNodes/BrowseNode/Name'},
				{key:"childrenBrowseNodeId", locator:'BrowseNodes/Children/BrowseNode/BrowseNodeId'},
				{key:"childrenBrowseNodeName", locator:'BrowseNodes/Children/BrowseNode/Name'},
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=BrowseNodeLookup&SearchIndex=Books&Keywords=Potter&ResponseGroup=BrowseNodes
<BrowseNodes>
	<BrowseNode>
		<BrowseNodeId>63926</BrowseNodeId>
		<Name>General</Name>
		<Ancestors>
			<BrowseNode>
				<BrowseNodeId>34</BrowseNodeId>
				<Name>Jazz</Name>
				<Ancestors>
					<BrowseNode>
						<BrowseNodeId>301668</BrowseNodeId>
						<Name>Styles</Name>
					</BrowseNode>
				</Ancestors>
			</BrowseNode>
		</Ancestors>
	</BrowseNode>
	<BrowseNode>
		<BrowseNodeId>598176</BrowseNodeId>
		<Name>Hard Bop</Name>
		<Ancestors>
			<BrowseNode>
				<BrowseNodeId>598174</BrowseNodeId>
				<Name>Bebop</Name>
				<Ancestors>
					<BrowseNode>
						<BrowseNodeId>34</BrowseNodeId>
						<Name>Jazz</Name>
						<Ancestors>
							<BrowseNode>
								<BrowseNodeId>301668</BrowseNodeId>
								<Name>Styles</Name>
							</BrowseNode>
						</Ancestors>
					</BrowseNode>
				</Ancestors>
			</BrowseNode>
		</Ancestors>
	</BrowseNode>
</BrowseNodes>
		 */
		BrowseNodes: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[ /* not sure how to parse yet */]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&AssociateId=ws&Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=Cart
<Cart>
	<Request>
		<IsValid>True</IsValid>
		<CartCreateRequest>
			<MergeCart>True</MergeCart>
			<Items>
				<Item>
					<ASIN>B000062TU1</ASIN>
					<Quantity>2</Quantity>
				</Item>
			</Items>
		</CartCreateRequest>
	</Request>
	<CartId>002-5281165-2803250</CartId>
	<HMAC>5i1uO0G/PHqkvxZqC8oRkzmCano=</HMAC>
	<URLEncodedHMAC>5i1uO0G%2FPHqkvxZqC8oRkzmCano%3D</URLEncodedHMAC>
	<PurchaseURL>https://www.amazon.com/gp/cart/aws-merge.html?cart-id=002-5281165-2803250%26associate-id=ws%26hmac=5i1uO0G/PHqkvxZqC8oRkzmCano=%26SubscriptionId=1VMXF86PGNDAX3FW9C02%26MergeCart=True</PurchaseURL>
	<SubTotal>
		<Amount>1994</Amount>
		<CurrencyCode>USD</CurrencyCode>
		<FormattedPrice>$19.94</FormattedPrice>
	</SubTotal>
	<CartItems>
		<SubTotal>
			<Amount>1994</Amount>
			<CurrencyCode>USD</CurrencyCode>
			<FormattedPrice>$19.94</FormattedPrice>
		</SubTotal>
		<CartItem>
			<CartItemId>U2ABORWEFJ0WZP</CartItemId>
			<ASIN>B000062TU1</ASIN>
			<MerchantId>ATVPDKIKX0DER</MerchantId>
			<SellerId>A2R2RITDJNW1Q6</SellerId>
			<SellerNickname>Amazon.com, LLC</SellerNickname>
			<Quantity>2</Quantity>
			<Title>Harry Potter and the Sorcerer's Stone (Full Screen Edition) (Harry Potter 1)</Title>
			<ProductGroup>DVD</ProductGroup>
			<Price>
				<Amount>997</Amount>
				<CurrencyCode>USD</CurrencyCode>
				<FormattedPrice>$9.97</FormattedPrice>
			</Price>
			<ItemTotal>
				<Amount>1994</Amount>
				<CurrencyCode>USD</CurrencyCode>
				<FormattedPrice>$19.94</FormattedPrice>
			</ItemTotal>
		</CartItem>
	</CartItems>
</Cart>
		 */
		Cart: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				/* Not currently supporting */
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&AssociateId=ws&Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartNewReleases
		<NewReleases>
			<NewRelease>
				<ASIN>B00005JOFQ</ASIN>
				<Title>Brokeback Mountain (Widescreen Edition)</Title>
			</NewRelease>
			...
		</NewReleases>
		 */
		CartNewReleases: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"newReleaseAsin", locator:'NewReleases/NewRelease/ASIN'},
				{key:"newReleaseTitle", locator:'NewReleases/NewRelease/Title'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&AssociateId=ws&Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartTopSellers
		<TopSellers>
			<TopSeller>
				<ASIN>B00005JOFQ</ASIN>
				<Title>Brokeback Mountain (Widescreen Edition)</Title>
			</TopSeller>
			...
		</TopSellers>
		 */
		CartTopSellers: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"collectionParentAsin", locator:'TopSellers/TopSeller/ASIN'},
				{key:"collectionParentTitle", locator:'TopSellers/TopSeller/Title'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&AssociateId=ws&Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartSimilarities
		<SimilarProducts>
			<SimilarProduct>
				<ASIN>B00008DDXC</ASIN>
				<Title>Harry Potter and the Chamber of Secrets (Widescreen Edition) (Harry Potter 2)</Title>
			</SimilarProduct>
			...
		</SimilarProducts>
		<SimilarViewedProducts>
			<SimilarViewedProduct>
				<ASIN>B000E6UZZK</ASIN>
				<Title>Harry Potter Years 1-4 (Harry Potter and the Sorcerer's Stone / Chamber of Secrets / Prisoner of Azkaban / Goblet of Fire) (Widescreen Edition)</Title>
			</SimilarViewedProduct>
			...
		</SimilarViewedProducts>
		<OtherCategoriesSimilarProducts>
			<OtherCategoriesSimilarProduct>
				<ASIN>0590353403</ASIN>
				<Title>Harry Potter and the Sorcerer's Stone (Book 1)</Title>
			</OtherCategoriesSimilarProduct>
			...
		</OtherCategoriesSimilarProducts>
		 */
		CartSimilarities: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"similarProductAsin", locator:'SimilarProducts/SimilarProduct/ASIN'},
				{key:"similarProductTitle", locator:'SimilarProducts/SimilarProduct/Title'},
				{key:"similarViewedProductAsin", locator:'SimilarViewedProducts/SimilarViewedProduct/ASIN'},
				{key:"similarViewedProductTitle", locator:'SimilarViewedProducts/SimilarViewedProduct/Title'},
				{key:"otherCategoriesSimilarProductAsin", locator:'OtherCategoriesSimilarProducts/OtherCategoriesSimilarProduct/ASIN'},
				{key:"otherCategoriesSimilarProductTitle", locator:'OtherCategoriesSimilarProducts/OtherCategoriesSimilarProduct/Title'}
			]
		},

		/**
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKey=[Access Key ID]&Operation=ItemLookup&ItemId=B000ALMQ9C&ResponseGroup=ItemIds,Collections
		 * <Collections>
		 *	  <Collection>
		 *		<CollectionParent>
		 *		  <ASIN>B0006PLAOE</ASIN>
		 *		  <Title>Fieldcrest® Classic Bedding Collection GarnetIvory</Title>
		 *		</CollectionParent>
		 *		<CollectionItem>
		 *		  <ASIN>B00067IV8U</ASIN>
		 *		  <Title>Fieldcrest® Classic Solid Sheets Garnet</Title>
		 *		</CollectionItem>
		 *		...
		 *	  </Collection>
		 *	</Collections>
		 */
		Collections: {
			metaFields: META_FIELDS,
			/* As documented */ /*
			resultListLocator: "Item",
			resultFields:[
				{key:"collectionParentAsin", locator:'Collections/Collection/CollectionParent/ASIN'},
				{key:"collectionParentAsin", locator:'Collections/Collection/CollectionParent/Title'},
				{key:"collectionItemAsin", locator:'Collections/Collection/CollectionItem/ASIN'},
				{key:"collectionItemAsin", locator:'Collections/Collection/CollectionItem/Title'}
			]*/
			/* As experienced */
			resultListLocator: "Item",
			resultFields:[
				{key:"collectionItemAsin", locator:'ASIN'}
			]
		},

		/*
			uses CustomerInfo, CustomerLists, and CustomerReviews
		 */
		CustomerFull: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=CustomerContentLookup&CustomerId=[Customer ID]&ResponseGroup=CustomerInfo
		<Customer>
			<CustomerId>ABCDEFG12345</CustomerId>
			<Nickname>jeff</Nickname>
		</Customer>
		 */
		CustomerInfo: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"customerId", locator:'Customer/CustomerId'},
				{key:"nickname", locator:'Customer/Nickname'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=CustomerContentLookup&CustomerId=ABCDEF123456&ResponseGroup=CustomerLists
		<Customer>
			<CustomerId>ABCDEFG12345</CustomerId>
			<WishListId>123456ABCDEF</WishListId>
		</Customer>
		 */
		CustomerLists: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"customerId", locator:'Customer/CustomerId'},
				{key:"wishListId", locator:'Customer/WishListId'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=CustomerContentLookup&CustomerId=ABCDEF123456&ResponseGroup=CustomerReviews
		<Customer>
			<CustomerId>ABCDEFG12345</CustomerId>
			<CustomerReviews>
				<TotalReviews>8</TotalReviews>
				<TotalReviewPages>1</TotalReviewPages>
				<Review>
					<ASIN>6305692688</ASIN>
					<Rating>1</Rating>
					<HelpfulVotes>21</HelpfulVotes>
					<TotalVotes>35</TotalVotes>
					<Date>2000-02-29</Date>
					<Summary>one star is indeed one too many</Summary>
					<Content>CONTENT</Content>
				</Review>
				...
			</CustomerReviews>
		</Customer>
		 */
		CustomerReviews: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"customerId", locator:'Customer/CustomerId'},
				{key:"totalReviews", locator:'Customer/CustomerReviews/TotalReviews'},
				{key:"totalReviewPages", locator:'Customer/CustomerReviews/TotalReviewPages'},
				{key:"reviewAsin", locator:'Customer/CustomerReviews/Review/ASIN'},
				{key:"reviewRating", locator:'Customer/CustomerReviews/Review/Rating'},
				{key:"reviewHelpfulVotes", locator:'Customer/CustomerReviews/Review/HelpfulVotes'},
				{key:"reviewDate", locator:'Customer/CustomerReviews/Review/Date'},
				{key:"reviewSummary", locator:'Customer/CustomerReviews/Review/Summary'},
				{key:"reviewContent", locator:'Customer/CustomerReviews/Review/Content'}
			]
		},

		EditorialReview: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields:[
				{key:"description", locator:'EditorialReviews/EditorialReview[1]/Content'},
				{key:"review", locator:'EditorialReviews/EditorialReview[2]/Content'}
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

		/**
		 * <SimilarProducts>
		 * 	<SimilarProduct>
		 *   <ASIN>#</ASIN>
		 *   <Title>TITLE</Title>
		 * 	</SimilarProduct>
		 *  ...
		 * </SimilarProducts>
		 */
		Similarities: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key: 'similarAsin', locator: 'SimilarProducts/SimilarProduct/ASIN'},
				{key: 'similarTitle', locator: 'SimilarProducts/SimilarProduct/Title'}
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

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=ItemSearch&Condition=All&SearchIndex=Blended&Keywords=Brando&Merchant=All&ResponseGroup=Subjects
<Item>
 <ASIN>9589393314</ASIN>
 <Subjects>
   <Subject>Central America</Subject>
   ...
 </Subjects>
</Item>
		 */
		Subjects: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"asin", locator:'Subjects/Subject'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[Access Key ID]&AssociateTag=[Associate Tag]&Operation=TagLookup&ItemId=0545010225&ResponseGroup=TaggedGuides&Marketplace=us&TagName=tai
<Tags>
  <Tag>
    <Name>tai</Name>
    <TagType>Guides</TagType>
    <TotalUsages>0</TotalUsages>
  </Tag>
  ...
</Tags>
		 */
		TaggedGuides: {
			metaFields: META_FIELDS,
			resultListLocator: "Tags/Tag",
			resultFields: [
				{key: 'name', locator: 'Name'},
				{key: 'tagType', locator: 'TagType'},
				{key: 'totalUsages', locator: 'TotalUsages'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[Access Key ID]&AssociateTag=[Associate Tag]&Operation=TagLookup&ItemId=0545010225&ResponseGroup=TaggedItems&Marketplace=us&TagName=japan
<Tags>
  <Tag>
    <Name>japan</Name>
    <TagType>Items</TagType>
    <TotalUsages>1779</TotalUsages>
    <TaggedItems>
      <List>
        <ListId>15HSHKBGFT9PR</ListId>
      </List>
      <DistinctUsers>10</DistinctUsers>
      <TotalUsages>10</TotalUsages>
      <FirstTagging>
        <UserId>AKYNIMNI8LOBP</UserId>
        <Time>2007 01 01 16:16:54</Time>
      </FirstTagging>
      <LastTagging>
        <UserId>AKYNIMNI8LOBP</UserId>
        <Time>2007 01 01 16:16:54</Time>
      </LastTagging>
    </TaggedItems>
    <TaggedListmaniaLists>
      <List>
        <ListId>1H6IBS7W62367</ListId>
      </List>
      <DistinctUsers>1</DistinctUsers>
      <TotalUsages>1</TotalUsages>
      <FirstTagging>
        <UserId>A3F9988KGE684U</UserId>
        <Time>2007 03 29 17:03:33</Time>
      </FirstTagging>
      <LastTagging>
        <UserId>A3F9988KGE684U</UserId>
        <Time>2007 03 29 17:03:33</Time>
      </LastTagging>
    </TaggedListmaniaLists>
  </Tag>
  ...
</Tags>
		 */
		TaggedItems: {
			metaFields: META_FIELDS,
			resultListLocator: "Tags/Tag",
			resultFields: [
				{key: 'taggedItemsListId', locator: 'TaggedItems/List/ListId'},
				{key: 'taggedItemsDistinctUsers', locator: 'TaggedItems/DistinctUsers'},
				{key: 'taggedItemsTotalUsages', locator: 'TaggedItems/TotalUsages'},
				{key: 'taggedItemsFirstUserId', locator: 'TaggedItems/FirstTagging/UserId'},
				{key: 'taggedItemsFirstTime', locator: 'TaggedItems/FirstTagging/Time'},
				{key: 'taggedItemsLastUserId', locator: 'TaggedItems/LastTagging/UserId'},
				{key: 'taggedItemsLastTime', locator: 'TaggedItems/LastTagging/Time'}
			]
		},

		TaggedListmaniaLists: {
			metaFields: META_FIELDS,
			resultListLocator: "Tags/Tag",
			resultFields: [
				{key: 'taggedListmaniaListsDistinctUsers', locator: 'TaggedListmaniaLists/DistinctUsers'},
				{key: 'taggedListmaniaListsTotalUsages', locator: 'TaggedListmaniaLists/TotalUsages'},
				{key: 'taggedListmaniaListsFirstUserId', locator: 'TaggedListmaniaLists/FirstTagging/UserId'},
				{key: 'taggedListmaniaListsFirstTime', locator: 'TaggedListmaniaLists/FirstTagging/Time'},
				{key: 'taggedListmaniaListsLastUserId', locator: 'TaggedListmaniaLists/LastTagging/UserId'},
				{key: 'taggedListmaniaListsLastTime', locator: 'TaggedListmaniaLists/LastTagging/Time'}
			]
		},
		
		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[Access Key ID]&AssociateTag=[Associate Tag]&Operation=TagLookup&ItemId=0545010225&ResponseGroup=Tags&Marketplace=us&TagName=tai&CustomerId=[Customer ID]
<Tags>
...
<Tag>
  TagsSummary
  <DistinctItems>1</DistinctItems> 
  <DistinctUsers>1</DistinctUsers> 
  <FirstTagging>
    <EntityId>B00005A1UV</EntityId> 
    <UserId>A2ELLA3OQ06A6Z</UserId> 
    <Time>2005-12-07 14:41:52</Time> 
  </FirstTagging>
  <LastTagging>
    <EntityId>B00005A1UV</EntityId> 
    <UserId>A2ELLA3OQ06A6Z</UserId> 
    <Time>2005-12-07 14:41:52</Time> 
  </LastTagging>
  ...
</Tag>
...
</Tags>
		 */
		Tags: {
			metaFields: META_FIELDS,
			resultListLocator: "Tags/Tag",
			resultFields: [
				{key: 'distinctItems', locator: 'DistinctItems'},
				{key: 'distinctUsers', locator: 'DistinctUsers'},
				{key: 'taggedItemsFirstEntityId', locator: 'FirstTagging/EntityId'},
				{key: 'taggedItemsFirstUserId', locator: 'FirstTagging/UserId'},
				{key: 'taggedItemsFirstTime', locator: 'FirstTagging/Time'},
				{key: 'taggedItemsLastEntityId', locator: 'LastTagging/EntityId'},
				{key: 'taggedItemsLastUserId', locator: 'LastTagging/UserId'},
				{key: 'taggedItemsLastTime', locator: 'LastTagging/Time'},
				{key: 'taggedItemsASIN', locator: 'TaggedItems/Item/ASIN'}
			]
		},
		
		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[Access Key ID]&AssociateTag=[Associate Tag]&Operation=TagLookup&ItemId=0545010225&ResponseGroup=Tags&Marketplace=us&TagName=tai&CustomerId=[Customer ID]
<Tags>
...
<Tag>
  TaggedGuides
  
  <TaggedItems>
    <Item>
      <ASIN>B00005A1UV</ASIN> 
    </Item>
  </TaggedItems>
  ...
</Tag>
...
</Tags>
		 */
		TagsSummary: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key: 'totalUsage', locator: 'Tags/TotalUsages'},
				{key: 'tagName', locator: 'Tags/Tag/Name'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=BrowseNodeLookup&BrowseNodeId=20&ResponseGroup=TopSellers
<TopSeller>
  <ASIN>0446578622</ASIN>
  <Title>The Notebook Girls</Title>
</TopSeller>
...
		 */
		TopSellers: {
			metaFields: META_FIELDS,
			resultListLocator: "TopSeller",
			resultFields: [
				{key: 'asin', locator: 'ASIN'},
				{key: 'title', locator: 'Title'}
			]
		},

		/**
		 * <Tracks>
		 * 	<Disk Number="#">
		 * 	 <Track Number="#">TRACK NAME</Track>
		 *   ...
		 * 	</Disk>
		 *  ...
		 * </Tracks>
		 */
		Tracks: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key: 'track', locator: 'Tracks/Disc/Track'},
				{key: 'position', locator: 'Tracks/Disc/Track/@Number'}
			]
		},

		/*
http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=[AWS Access Key ID]&Operation=TransactionLookup&TransactionId=011-6222227-3333335&ResponseGroup=TransactionDetails
<Transactions>
 <Transaction>
  <TransactionId>00269664477138425</TransactionId>
  <SellerId>ATVPDKIKX0DER</SellerId>
  <Condition>Complete</Condition>
  <TransactionDate>20050608T19:19:27</TransactionDate>
  <TransactionDateEpoch>1118258367</TransactionDateEpoch>
  <SellerName>Amazon.com</SellerName>
  <Totals>
    <Total>
      <Amount>1879</Amount>
      <CurrencyCode>USD</CurrencyCode>
      <FormattedPrice>$18.79</FormattedPrice>
    </Total>
    <Subtotal>
      <Amount>1485</Amount>
      <CurrencyCode>USD</CurrencyCode>
      <FormattedPrice>$14.85</FormattedPrice>
    </Subtotal>
    <Tax>
      <Amount>144</Amount>
      <CurrencyCode>USD</CurrencyCode>
      <FormattedPrice>$1.44</FormattedPrice>
    </Tax>
    <ShippingCharge>
      <Amount>399</Amount>
      <CurrencyCode>USD</CurrencyCode>
      <FormattedPrice>$3.99</FormattedPrice>
    </ShippingCharge>
    <Promotion>
      <Amount>149</Amount>
      <CurrencyCode>USD</CurrencyCode>
      <FormattedPrice>$1.49</FormattedPrice>
    </Promotion>
  </Totals>
  <TransactionItems>
    <TransactionItem>
      <TransactionItemId>jooloslsnpl</TransactionItemId>
      <Quantity>1</Quantity>
      <UnitPrice>
        <Amount>1485</Amount>
        <CurrencyCode>USD</CurrencyCode>
        <FormattedPrice>$14.85</FormattedPrice>
      </UnitPrice>
      <TotalPrice>
        <Amount>1485</Amount>
        <CurrencyCode>USD</CurrencyCode>
        <FormattedPrice>$14.85</FormattedPrice>
      </TotalPrice>
    </TransactionItem>
    ...
  </TransactionItems>
  <Shipments>
    <Shipment>
      <Condition>Shipped</Condition>
      <ShipmentItems>
        <TransactionItemId>jooloslsnpl</TransactionItemId>
      </ShipmentItems>
    </Shipment>
    ...
  </Shipments>
 </Transaction>
 ...
</Transactions>
		 */
		TransactionDetails: {
			metaFields: META_FIELDS,
			resultListLocator: "Transaction",
			resultFields: [
				{key: "transactionId", locator:'TransactionId'},
				{key: "sellerId", locator:'SellerId'},
				{key: "condition", locator:'Condition'},
				{key: "transactionDate", locator:'TransactionDate'},
				{key: "transactionDateEpoch", locator:'TransactionDateEpoch'},
				{key: "sellerName", locator:'SellerName'},
				{key: 'condition', locator: 'Shipments/Shipment/Condition'},
				{key: 'shipmentTransactionItemId', locator: 'Shipments/Shipment/ShipmentItems/TransactionItemId'},
				{key: 'totalAmount', locator: 'Totals/Total/Amount'},
				{key: 'totalCurrencyCode', locator: 'Totals/Total/CurrencyCode'},
				{key: 'totalFormattedPrice', locator: 'Totals/Total/FormattedPrice'},
				{key: 'subtotalAmount', locator: 'Totals/Subtotal/Amount'},
				{key: 'subtotalCurrencyCode', locator: 'Totals/Subtotal/CurrencyCode'},
				{key: 'subtotalFormattedPrice', locator: 'Totals/Subtotal/FormattedPrice'},
				{key: 'taxAmount', locator: 'Totals/Tax/Amount'},
				{key: 'taxCurrencyCode', locator: 'Totals/Tax/CurrencyCode'},
				{key: 'taxFormattedPrice', locator: 'Totals/Tax/FormattedPrice'},
				{key: 'shippingChargeAmount', locator: 'Totals/ShippingCharge/Amount'},
				{key: 'shippingChargeCurrencyCode', locator: 'Totals/ShippingCharge/CurrencyCode'},
				{key: 'shippingChargeFormattedPrice', locator: 'Totals/ShippingCharge/FormattedPrice'},
				{key: 'promotionAmount', locator: 'Totals/Promotion/Amount'},
				{key: 'promotionCurrencyCode', locator: 'Totals/Promotion/CurrencyCode'},
				{key: 'promotionFormattedPrice', locator: 'Totals/Promotion/FormattedPrice'},
				{key: 'transactionItemId', locator: 'TransactionItems/TransactionItemId'},
				{key: 'transactionItemQuantity', locator: 'TransactionItems/Quantity'},
				{key: 'transactionItemTotalPriceAmount', locator: 'TransactionItems/TotalPrice/Amount'},
				{key: 'transactionItemTotalPriceCurrencyCode', locator: 'TransactionItems/TotalPrice/CurrencyCode'},
				{key: 'transactionItemTotalPriceFormattedPrice', locator: 'TransactionItems/TotalPrice/FormattedPrice'},
				{key: 'transactionItemUnitPriceAmount', locator: 'TransactionItems/UnitPrice/Amount'},
				{key: 'transactionItemUnitPriceCurrencyCode', locator: 'TransactionItems/UnitPrice/CurrencyCode'},
				{key: 'transactionItemUnitPriceFormattedPrice', locator: 'TransactionItems/UnitPrice/FormattedPrice'}
			]
		},

		/*
&Operation=ItemSearch&Condition=All&SearchIndex=Apparel&Keywords=Shirt&ResponseGroup=VariationMinimum
		 */
		VariationMinimum: {
			metaFields: {asin: 'ASIN'},
			resultListLocator: "Item",
			resultFields: [
				{key: 'asin', locator: 'ASIN'}
			]
		},

		/*
&Operation=ItemSearch&Condition=All&SearchIndex=Apparel&Keywords=Shirt&ResponseGroup=VariationDimensions
		 */
		VariationDimensions: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
			]
		},

		/*
&Operation=ItemSearch&Condition=All&SearchIndex=Apparel&Keywords=Shirt&ResponseGroup=Variations
<ItemSearchRequest>
  <Keywords>Hooded Short Down Jacket</Keywords>
  <ResponseGroup>Variations</ResponseGroup>
  <SearchIndex>Apparel</SearchIndex>
</ItemSearchRequest>
		 */
		Variations: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: [
				{key: 'asin', locator: 'ASIN'}
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
AWS_SCHEMA.CustomerFull.resultFields = AWS_SCHEMA.CustomerFull.resultFields.concat(AWS_SCHEMA.CustomerInfo.resultFields)
	.concat(AWS_SCHEMA.CustomerLists.resultFields).concat(AWS_SCHEMA.CustomerReviews.resultFields);
AWS_SCHEMA.TaggedItems.resultFields = AWS_SCHEMA.TaggedItems.resultFields.concat(AWS_SCHEMA.TaggedGuides.resultFields)
	.concat(AWS_SCHEMA.TaggedListmaniaLists.resultFields);
AWS_SCHEMA.TagsSummary.resultFields = AWS_SCHEMA.TagsSummary.resultFields.concat(AWS_SCHEMA.TaggedGuides.resultFields);
AWS_SCHEMA.Tags.resultFields = AWS_SCHEMA.Tags.resultFields.concat(AWS_SCHEMA.TagsSummary.resultFields);
Y.aggregate(AWS_SCHEMA.Offers.metaFields,META_FIELDS);
Y.aggregate(AWS_SCHEMA.VariationMinimum.metaFields,META_FIELDS);

// add RESULT_FIELDS_LINKS to schemas where duplication would occur
AWS_SCHEMA.ItemAttributes.resultFields = AWS_SCHEMA.ItemAttributes.resultFields.concat(RESULT_FIELDS_LINKS);

Y.mix(Y.Aws.prototype, {
	_parseAWSContent: function(doc) {
		var args = Y.DataSchema.XML.apply(AWS_SCHEMA.args, doc),
			response = '',
			responseGroup = Y.Array.find(args.results, function(arg) {
				return NAME_RESPONSE_GROUP === arg.name;
			}),
			schemaName = responseGroup.value;


		if (schemaName) {
			response = Y.DataSchema.XML.apply(AWS_SCHEMA[schemaName], doc);
			var name = schemaName + AWS_SCHEMA[schemaName].resultListLocator,
				schema = AWS_SCHEMA[name],
				items;

			if (schema) {
				items = doc.getElementsByTagName(AWS_SCHEMA[schemaName].resultListLocator);

				Y.each(items, function(item, i) {
					var iresponse = Y.DataSchema.XML.apply(AWS_SCHEMA[name], item);
					response.results[i][schemaName] = iresponse.results;
				});
			}
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