YUI.add('gallery-aws-json', function(Y) {

/**
* <p>The AWS JSON Plugin makes interacting with the Amazon Web Services data. By
* leveraging the DataType.XML parsing methods, this plugin automatically converts
* the XML into an appropraite JSON object.</p>
*
* <p>
* The widget currently supports all 'ItemLookup' Operations..
* </p>

All, Apparel, Automotive, Baby, Beauty, Blended, Books, Classical, DVD, DigitalMusic, Electronics, GourmetFood, Grocery, HealthPersonalCare, HomeGarden, Industrial, Jewelry, KindleStore, Kitchen, MP3Downloads, Magazines, Marketplace, Merchants, Miscellaneous, Music, MusicTracks, MusicalInstruments, OfficeProducts, OutdoorLiving, PCHardware, PetSupplies, Photo, Shoes, SilverMerchants, Software, SportingGoods, Tools, Toys, UnboxVideo, VHS, Video, VideoGames, Watches, Wireless, WirelessAccessories
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

// setup some parsers
Y.Parsers = Y.namespace("Parsers");
Y.Parsers.integer = function(val) {
	return parseInt(val, 10);
};
Y.Parsers.decimal = function(val) {
	return parseFloat(val);
};
Y.Parsers.bool = function(val) {
	return val ? true : false;
};

var ITEM_ATTRIBUTES_PFX = 'ItemAttributes/',
	OPERATIONS_CART = ['CartAdd', 'CartCreate', 'CartModify', 'CartGet'],
	OPERATIONS_CUSTOMER = ['CustomerContentLookup'],
	OPERATIONS_LOOKUP = ['ItemLookup', 'ItemSearch', 'ListLookup', 'SimilarityLookup'],
	META_FIELDS = { // from the Request ResponseGroup
		condition:"//Condition",
		deliveryMethod:"//DeliveryMethod",
		idType:"//IdType",
		isValid:{locator: "//IsValid", parser: 'bool'},
		itemId:"//ItemId",
		merchantId:"//MerchantId",
		offerPage:"//OfferPage",
		requestId:"//RequestId",
		responseGroup:"//ResponseGroup",
		reviewPage:"//ReviewPage",
		reviewSort:"//ReviewSort",
		searchIndex:"//SearchIndex",
		variationPage:"//VariationPage",
		totalPages:{locator: "//TotalPages", parser: 'integer'},
		totalResults:{locator: "//TotalResults", parser: 'integer'}
	},
	META_FIELDS_CUSTOMER = {
		customerId:"//CustomerContentLookupRequest/CustomerId",
		isValid:{locator: "//IsValid", parser: 'bool'},
		responseGroup:"//CustomerContentLookupRequest/ResponseGroup"
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
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key:"accessories", schema: {
					allowEmpty: true,
					resultListLocator: "Accessory",
					resultFields:[
						{key:"asin", locator:'ASIN'},
						{key:"title", locator:'Title'}
					]
				}}
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
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key: 'alternateVersions', schema: {
					allowEmpty: true,
					resultListLocator: "AlternateVersion",
					resultFields:[
						{key:"asin", locator:'ASIN'},
						{key:"title", locator:'Title'},
						{key:"binding", locator:'Binding'}
					]
				}}
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
			metaFields: {
				browseNodeId:{locator: "//BrowseNodeLookupRequest/BrowseNodeId", parser: 'integer'},
				isValid:{locator: "//IsValid", parser: 'bool'},
				responseGroup:"//BrowseNodeLookupRequest/ResponseGroup"
			},
			operations: ['BrowserNodeLookup'],
			resultListLocator: "//BrowseNodes/BrowseNode",
			resultFields:[
				/* also includes BrowseNodes */
				{key:'children', schema: {
					resultListLocator: "//Children/BrowseNode",
					resultFields:[
						{key:"browseNodeId", locator:'BrowseNodeId', parser: 'integer'},
						{key:"name", locator:'Name'}
					],
					useXPath: true
				}}
			],
			useXPath: true
		},

		/*
&Operation=BrowseNodeLookup&SearchIndex=Books&Keywords=Potter&ResponseGroup=BrowseNodes
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
	...
</BrowseNodes>
		 */
		BrowseNodes: {
			metaFields: {
				browseNodeId:{locator: "//BrowseNodeLookupRequest/BrowseNodeId", parser: 'integer'},
				isValid:{locator: "//IsValid", parser: 'bool'},
				responseGroup:"//BrowseNodeLookupRequest/ResponseGroup"
			},
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "//BrowseNodes/BrowseNode",
			resultFields:[
				{key:"browseNodeId", locator:'BrowseNodeId', parser: 'integer'},
				{key:"name", locator:'Name'},
				{key:'ancestors', schema: {
					resultListLocator: "Ancestors",
					resultFields:[
						{key:"browseNodeId", locator:'BrowseNode/BrowseNodeId', parser: 'integer'},
						{key:"isCategoryRoot", locator:'BrowseNode/IsCategoryRoot', parser: 'bool'},
						{key:"name", locator:'BrowseNode/Name'}
					]
				}}
			],
			useXPath: true
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
			operations: OPERATIONS_CART.concat(['CartClear']),
			resultListLocator: "Item",
			resultFields:[
				/* Not currently supporting */
			]
		},

		/*
&Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartNewReleases
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
			operations: OPERATIONS_CART,
			resultListLocator: "Item",
			resultFields:[
				{key:"newReleaseAsin", locator:'NewReleases/NewRelease/ASIN'},
				{key:"newReleaseTitle", locator:'NewReleases/NewRelease/Title'}
			]
		},

		/*
Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartTopSellers
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
			operations: OPERATIONS_CART,
			resultListLocator: "Item",
			resultFields:[
				{key:"collectionParentAsin", locator:'TopSellers/TopSeller/ASIN'},
				{key:"collectionParentTitle", locator:'TopSellers/TopSeller/Title'}
			]
		},

		/*
Operation=CartCreate&Item.1.ASIN=B000062TU1&MergeCart=True&Item.1.Quantity=2&ResponseGroup=CartSimilarities
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
			operations: OPERATIONS_CART,
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
Operation=ItemLookup&ItemId=B000ALMQ9C&ResponseGroup=ItemIds,Collections
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
			metaFields: META_FIELDS_CUSTOMER,
			operations: OPERATIONS_CART,
			resultListLocator: "Customer",
			resultFields:[]
		},

		/*
&Operation=CustomerContentLookup&CustomerId=A2JM0EQJELFL69&ResponseGroup=CustomerInfo
		<Customers>
			<Customer>
				<CustomerId>ABCDEFG12345</CustomerId>
				<Nickname>jeff</Nickname>
			</Customer>
			...
		<Customers>
		 */
		CustomerInfo: {
			metaFields: META_FIELDS_CUSTOMER,
			operations: OPERATIONS_CART.concat('CustomerContentSearch'),
			resultListLocator: "Customer",
			resultFields:[
				{key:"customerId", locator:'CustomerId'},
				{key:"nickname", locator:'Nickname'}
			]
		},

		/*
&Operation=CustomerContentLookup&CustomerId=A2JM0EQJELFL69&ResponseGroup=CustomerLists
		<Customers>
			<Customer>
				<CustomerId>ABCDEFG12345</CustomerId>
				<WishListId>123456ABCDEF</WishListId>
			</Customer>
			...
		<Customers>
		 */
		CustomerLists: {
			metaFields: META_FIELDS_CUSTOMER,
			operations: OPERATIONS_CART,
			resultListLocator: "Customer",
			resultFields:[
				{key:"customerId", locator:'CustomerId'},
				{key:"wishListId", locator:'WishListId'}
			]
		},

		/*
Operation=CustomerContentLookup&CustomerId=ABCDEF123456&ResponseGroup=CustomerReviews
		<Customers>
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
			...
		<Customers>
		 */
		CustomerReviews: {
			metaFields: META_FIELDS_CUSTOMER,
			operations: OPERATIONS_CART,
			resultListLocator: "Customer",
			resultFields:[
				{key:"customerId", locator:'CustomerId'},
				{key:"totalReviews", locator:'//TotalReviews', parser: 'integer'},
				{key:"totalReviewPages", locator:'//TotalReviewPages', parser: 'integer'},
				{key:'reviews', schema: {
					allowEmpty: true,
					resultListLocator: "Review",
					resultFields:[
						{key:"asin", locator:'ASIN'},
						{key:"rating", locator:'Rating', parser: 'integer'},
						{key:"helpfulVotes", locator:'HelpfulVotes', parser: 'integer'},
						{key:"date", locator:'Date'},
						{key:"reviewerCustomerId", locator:'Reviewer/CustomerId'},
						{key:"reviewerName", locator:'Reviewer/Name'},
						{key:"totalVotes", locator:'TotalVotes', parser: 'integer'},
						{key:"summary", locator:'Summary'},
						{key:"content", locator:'Content'}
					]
				}}
			]
		},

		/*
		<Item>
			<ASIN>#</ASIN>
			<EditorialReviews>
				<EditorialReview>
					<Source>TEXT</Source>
					<Content>TEXT</Content>
				</EditorialReview>
				...
			</EditorialReviews>
		</Item>
		 */
		EditorialReview: {
			metaFields: {
				isValid:{locator: "//IsValid", parser: 'bool'},
				keywords:"//ItemSearchRequest/Keywords",
				responseGroup:"//ItemSearchRequest/ResponseGroup",
				searchIndex:"//ItemSearchRequest/SearchIndex"
			},
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key:"editorialReviews", schema:{
					resultListLocator: "EditorialReview",
					resultFields:[
						{key:"content", locator:'Content'},
						{key:"source", locator:'Source'}
					]
				}}
			]
		},

		/*
Operation=Help&HelpType=Operation&About=CustomerContentLookup&
Very prelimiary, needs more exploration
		 */
		Help: {
			resultListLocator: "OperationInformation",
			resultFields:[
				{key:"name", locator:'Name'},
				{key:"requiredParameters", schema: {
					resultListLocator: "RequiredParameters/Parameter",
					resultFields:[
						{key:"value", locator:'.'}
					],
					useXPath: true
				}},
				{key:"availableParameters", schema: {
					resultListLocator: "AvailableParameters/Parameter",
					resultFields:[
						{key:"value", locator:'.'}
					],
					useXPath: true
				}},
				{key:"defaultResponseGroups", schema: {
					resultListLocator: "DefaultResponseGroups/ResponseGroup",
					resultFields:[
						{key:"value", locator:'.'}
					],
					useXPath: true
				}},
				{key:"availableResponseGroups", schema: {
					resultListLocator: "AvailableResponseGroups/ResponseGroup",
					resultFields:[
						{key:"value", locator:'.'}
					],
					useXPath: true
				}}
			]
		},

		/*
Operation=ItemSearch&Condition=All&ResponseGroup=Images&SearchIndex=Blended&Keywords=GodSmack&Merchant=All&
		 */
		Images: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields:[
				{key:"asin", locator:'ASIN'},
				{key:"merchantId", locator:'ImageSets/MerchantId'},
				{key:"smallImageURL", locator:'SmallImage/URL'},
				{key:"smallImageWidth", locator:'SmallImage/Width', parser: 'integer'},
				{key:"smallImageHeight", locator:'SmallImage/Height', parser: 'integer'},
				{key:"smallImageWidthUnits", locator:'SmallImage/Width/@Units'},
				{key:"smallImageHeightUnits", locator:'SmallImage/Height/@Units'},
				{key:"mediumImageURL", locator:'MediumImage/URL'},
				{key:"mediumImageWidth", locator:'MediumImage/Width', parser: 'integer'},
				{key:"mediumImageHeight", locator:'MediumImage/Height', parser: 'integer'},
				{key:"mediumImageWidthUnits", locator:'MediumImage/Width/@Units'},
				{key:"mediumImageHeightUnits", locator:'MediumImage/Height/@Units'},
				{key:"largeImageURL", locator:'LargeImage/URL'},
				{key:"largeImageWidth", locator:'LargeImage/Width', parser: 'integer'},
				{key:"largeImageHeight", locator:'LargeImage/Height', parser: 'integer'},
				{key:"largeImageWidthUnits", locator:'LargeImage/Width/@Units'},
				{key:"largeImageHeightUnits", locator:'LargeImage/Height/@Units'},
				{key:"imageSets", schema: {
					resultListLocator: 'ImageSet',
					resultFields:[
						{key:"category", locator:'@Category'},
						{key:"swatchImageURL", locator:'SwatchImage/URL'},
						{key:"swatchImageWidth", locator:'SwatchImage/Width', parser: 'integer'},
						{key:"swatchImageHeight", locator:'SwatchImage/Height', parser: 'integer'},
						{key:"swatchImageWidthUnits", locator:'SwatchImage/Width/@Units'},
						{key:"swatchImageHeightUnits", locator:'SwatchImage/Height/@Units'},
						{key:"smallImageURL", locator:'SmallImage/URL'},
						{key:"smallImageWidth", locator:'SmallImage/Width', parser: 'integer'},
						{key:"smallImageHeight", locator:'SmallImage/Height', parser: 'integer'},
						{key:"smallImageWidthUnits", locator:'SmallImage/Width/@Units'},
						{key:"smallImageHeightUnits", locator:'SmallImage/Height/@Units'},
						{key:"thumbnailImageURL", locator:'ThumbnailImage/URL'},
						{key:"thumbnailImageWidth", locator:'ThumbnailImage/Width', parser: 'integer'},
						{key:"thumbnailImageHeight", locator:'ThumbnailImage/Height', parser: 'integer'},
						{key:"thumbnailImageWidthUnits", locator:'ThumbnailImage/Width/@Units'},
						{key:"thumbnailImageHeightUnits", locator:'ThumbnailImage/Height/@Units'},
						{key:"tinyImageURL", locator:'TinyImage/URL'},
						{key:"tinyImageWidth", locator:'TinyImage/Width', parser: 'integer'},
						{key:"tinyImageHeight", locator:'TinyImage/Height', parser: 'integer'},
						{key:"tinyImageWidthUnits", locator:'TinyImage/Width/@Units'},
						{key:"tinyImageHeightUnits", locator:'TinyImage/Height/@Units'},
						{key:"mediumImageURL", locator:'MediumImage/URL'},
						{key:"mediumImageWidth", locator:'MediumImage/Width', parser: 'integer'},
						{key:"mediumImageHeight", locator:'MediumImage/Height', parser: 'integer'},
						{key:"mediumImageWidthUnits", locator:'MediumImage/Width/@Units'},
						{key:"mediumImageHeightUnits", locator:'MediumImage/Height/@Units'},
						{key:"largeImageURL", locator:'LargeImage/URL'},
						{key:"largeImageWidth", locator:'LargeImage/Width', parser: 'integer'},
						{key:"largeImageHeight", locator:'LargeImage/Height', parser: 'integer'},
						{key:"largeImageWidthUnits", locator:'LargeImage/Width/@Units'},
						{key:"largeImageHeightUnits", locator:'LargeImage/Height/@Units'},
					]
				}}
			]
		},

		ItemAttributes: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"actors", schema:{
					allowEmpty: true,
					resultListLocator: "Actor",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"address", schema:{
					allowEmpty: true,
					resultListLocator: "Address",
					resultFields: [
						{key:"country", locator:'Country'}
					]
				}},
				{key:"amazonMaximumAge", locator:ITEM_ATTRIBUTES_PFX + 'AmazonMaximumAge', parser: 'integer'},
				{key:"amazonMinimumAge", locator:ITEM_ATTRIBUTES_PFX + 'AmazonMinimumAge', parser: 'integer'},
				{key:"amazonMaximumAgeUnits", locator:ITEM_ATTRIBUTES_PFX + 'AmazonMaximumAge/@Units'},
				{key:"amazonMinimumAgeUnits", locator:ITEM_ATTRIBUTES_PFX + 'AmazonMinimumAge/@Units'},
				{key:"apertureModes", locator:'ApertureModes'},
				{key:"artists", schema:{
					allowEmpty: true,
					resultListLocator: "Artist",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"aspectRatio", locator:ITEM_ATTRIBUTES_PFX + 'AspectRatio'},
				{key:"audienceRating", locator:ITEM_ATTRIBUTES_PFX + 'AudienceRating'},
				{key:"audioFormat", locator:ITEM_ATTRIBUTES_PFX + 'AudioFormat'},
				{key:"authors", schema:{
					allowEmpty: true,
					resultListLocator: "Author",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"backFinding", locator:ITEM_ATTRIBUTES_PFX + 'BackFinding'},
				{key:"bandMaterialType", locator:ITEM_ATTRIBUTES_PFX + 'BandMaterialType'},
				{key:"batteries", locator:ITEM_ATTRIBUTES_PFX + 'Batteries'},
				{key:"batteriesIncluded", locator:ITEM_ATTRIBUTES_PFX + 'BatteriesIncluded', parser: 'integer'},
				{key:"batteryDescription", locator:ITEM_ATTRIBUTES_PFX + 'BatteryDescription'},
				{key:"batteryType", locator:ITEM_ATTRIBUTES_PFX + 'BatteryType'},
				{key:"bezelMaterialType", locator:ITEM_ATTRIBUTES_PFX + 'BezelMaterialType'},
				{key:"binding", locator:ITEM_ATTRIBUTES_PFX + 'Binding'},
				{key:"brand", locator:ITEM_ATTRIBUTES_PFX + 'Brand'},
				{key:"calendarType", locator:ITEM_ATTRIBUTES_PFX + 'CalendarType'},
				{key:"cameraManualFeatures", locator:ITEM_ATTRIBUTES_PFX + 'CameraManualFeatures'},
				{key:"caseDiameter", locator:ITEM_ATTRIBUTES_PFX + 'CaseDiameter'},
				{key:"caseDiameterUnits", locator:ITEM_ATTRIBUTES_PFX + 'CaseDiameter/@Units'},
				{key:"caseMaterialType", locator:ITEM_ATTRIBUTES_PFX + 'CaseMaterialType'},
				{key:"caseThickness", locator:ITEM_ATTRIBUTES_PFX + 'CaseThickness'},
				{key:"caseType", locator:ITEM_ATTRIBUTES_PFX + 'CaseType'},
				{key:"cdrwDescription", locator:ITEM_ATTRIBUTES_PFX + 'CDRWDescription'},
				{key:"chainType", locator:ITEM_ATTRIBUTES_PFX + 'ChainType'},
				{key:"city", locator:ITEM_ATTRIBUTES_PFX + 'City'},
				{key:"claspType", locator:ITEM_ATTRIBUTES_PFX + 'ClaspType'},
				{key:"clothingSize", locator:ITEM_ATTRIBUTES_PFX + 'ClothingSize'},
				{key:"color", locator:ITEM_ATTRIBUTES_PFX + 'Color'},
				{key:"compatibility", locator:ITEM_ATTRIBUTES_PFX + 'Compatibility'},
				{key:"compatibleDevices", schema:{
					allowEmpty: true,
					resultListLocator: "CompatibleDevices",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"connectivity", locator:ITEM_ATTRIBUTES_PFX + 'Connectivity'},
				{key:"country", locator:ITEM_ATTRIBUTES_PFX + 'Country'},
				{key:"cpuManufacturer", locator:ITEM_ATTRIBUTES_PFX + 'CPUManufacturer'},
				{key:"cpuSpeed", locator:ITEM_ATTRIBUTES_PFX + 'CPUSpeed', parser: 'decimal'},
				{key:"cpuSpeedUnits", locator:ITEM_ATTRIBUTES_PFX + 'CPUSpeed/@Units'},
				{key:"cpuType", locator:ITEM_ATTRIBUTES_PFX + 'CPUType'},
				{key:"creator", schema:{
					allowEmpty: true,
					resultListLocator: "Creator",
					resultFields: [
						{key:"value", locator:'.'},
						{key:"role", locator:'@Role'}
					]
				}},
				{key:"dataLinkProtocol", locator:ITEM_ATTRIBUTES_PFX + 'DataLinkProtocol'},
				{key:"department", locator:ITEM_ATTRIBUTES_PFX + 'Department'},
				{key:"deweyDecimalNumber", locator:ITEM_ATTRIBUTES_PFX + 'DeweyDecimalNumber'},
				{key:"dialColor", locator:ITEM_ATTRIBUTES_PFX + 'DialColor'},
				{key:"dialWindowMaterialType", locator:ITEM_ATTRIBUTES_PFX + 'DialWindowMaterialType'},
				{key:"digitalZoom", locator:ITEM_ATTRIBUTES_PFX + 'DigitalZoom'},
				{key:"digitalZoomUnits", locator:ITEM_ATTRIBUTES_PFX + 'DigitalZoom/@Units'},
				{key:"directors", schema:{
					allowEmpty: true,
					resultListLocator: "Director",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"displaySize", locator:ITEM_ATTRIBUTES_PFX + 'DisplaySize', parser: 'decimal'},
				{key:"displaySizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'DisplaySize/@Units'},
				{key:"ean", locator:ITEM_ATTRIBUTES_PFX + 'EAN'},
				{key:"edition", locator:ITEM_ATTRIBUTES_PFX + 'Edition'},
				{key:"episodeSequence", locator:ITEM_ATTRIBUTES_PFX + 'EpisodeSequence'},
				{key:"esrbAgeRating", locator:ITEM_ATTRIBUTES_PFX + 'ESRBAgeRating'},
				{key:"fabricType", locator:ITEM_ATTRIBUTES_PFX + 'FabricType'},
				{key:"features", schema:{
					allowEmpty: true,
					resultListLocator: "Feature",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"firstIssueLeadTime", locator:ITEM_ATTRIBUTES_PFX + 'FirstIssueLeadTime'},
				{key:"flavorName", locator:ITEM_ATTRIBUTES_PFX + 'FlavorName'},
				{key:"floppyDiskDriveDescription", locator:ITEM_ATTRIBUTES_PFX + 'FloppyDiskDriveDescription'},
				{key:"format", schema:{
					allowEmpty: true,
					resultListLocator: "Format",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"formFactor", locator:ITEM_ATTRIBUTES_PFX + 'FormFactor'},
				{key:"gemType", locator:ITEM_ATTRIBUTES_PFX + 'GemType'},
				{key:"gemTypeSetElements", schema:{
					allowEmpty: true,
					resultListLocator: "GemTypeSetElement",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"genre", locator:ITEM_ATTRIBUTES_PFX + 'Genre'},
				{key:"graphicsMemorySize", locator:ITEM_ATTRIBUTES_PFX + 'GraphicsMemorySize', parser: 'integer'},
				{key:"graphicsMemorySizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'GraphicsMemorySize/@Units'},
				{key:"hardDiskSize", locator:ITEM_ATTRIBUTES_PFX + 'HardDiskSize', parser: 'integer'},
				{key:"hardDiskSizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'HardDiskSize/@Units'},
				{key:"hardDiskInterface", locator:ITEM_ATTRIBUTES_PFX + 'HardDiskInterface'},
				{key:"hardwarePlatform", locator:ITEM_ATTRIBUTES_PFX + 'HardwarePlatform'},
				{key:"hasRedEyeReduction", locator:ITEM_ATTRIBUTES_PFX + 'HasRedEyeReduction', parser: 'bool'},
				{key:"includedSoftware", locator:ITEM_ATTRIBUTES_PFX + 'IncludedSoftware'},
				{key:"ingredients", locator:ITEM_ATTRIBUTES_PFX + 'Ingredients'},
				{key:"ingredientsSetElement", schema:{
					allowEmpty: true,
					resultListLocator: "IngredientsSetElement",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"isAdultProduct", locator:ITEM_ATTRIBUTES_PFX + 'IsAdultProduct', parser: 'bool'},
				{key:"isAutographed", locator:ITEM_ATTRIBUTES_PFX + 'IsAutographed', parser: 'bool'},
				{key:"isFragile", locator:ITEM_ATTRIBUTES_PFX + 'IsFragile', parser: 'bool'},
				{key:"isLabCreated", locator:ITEM_ATTRIBUTES_PFX + 'IsLabCreated', parser: 'bool'},
				{key:"isMemorabilia", locator:ITEM_ATTRIBUTES_PFX + 'IsMemorabilia', parser: 'bool'},
				{key:"issuesPerYear", locator:ITEM_ATTRIBUTES_PFX + 'IssuesPerYear', parser: 'integer'},
				{key:"height", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Height', parser: 'integer'},
				{key:"length", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Length', parser: 'integer'},
				{key:"width", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Width', parser: 'integer'},
				{key:"weight", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Weight', parser: 'integer'},
				{key:"heightUnits", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Height/@Units'},
				{key:"lengthUnits", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Length/@Units'},
				{key:"widthUnits", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Width/@Units'},
				{key:"weightUnits", locator:ITEM_ATTRIBUTES_PFX + 'ItemDimensions/Weight/@Units'},
				{key:"label", locator:ITEM_ATTRIBUTES_PFX + 'Label'},
				{key:"languages", schema:{
					allowEmpty: true,
					resultListLocator: "Language",
					resultFields: [
						{key:"name", locator:'Name'},
						{key:"type", locator:'Type'}
					]
				}},
				{key:"legalDisclaimer", locator:ITEM_ATTRIBUTES_PFX + 'LegalDisclaimer'},
				{key:"lensType", locator:ITEM_ATTRIBUTES_PFX + 'LensType'},
				{key:"listPriceAmount", locator:ITEM_ATTRIBUTES_PFX + 'ListPrice/Amount', parser: 'integer'},
				{key:"listPriceCurrencyCode", locator:ITEM_ATTRIBUTES_PFX + 'ListPrice/CurrencyCode'},
				{key:"listPriceFormattedPrice", locator:ITEM_ATTRIBUTES_PFX + 'ListPrice/FormattedPrice'},
				{key:"longSynopsis", locator:ITEM_ATTRIBUTES_PFX + 'LongSynopsis'},
				{key:"magazineType", locator:ITEM_ATTRIBUTES_PFX + 'MagazineType'},
				{key:"manufacturer", locator:ITEM_ATTRIBUTES_PFX + 'Manufacturer'},
				{key:"manufacturerMaximumAge", locator:ITEM_ATTRIBUTES_PFX + 'ManufacturerMaximumAge'},
				{key:"manufacturerMaximumAgeUnits", locator:ITEM_ATTRIBUTES_PFX + 'ManufacturerMaximumAge/@Units'},
				{key:"manufacturerMinimumAge", locator:ITEM_ATTRIBUTES_PFX + 'ManufacturerMinimumAge'},
				{key:"manufacturerMinimumAgeUnits", locator:ITEM_ATTRIBUTES_PFX + 'ManufacturerMinimumAge/@Units'},
				{key:"materialType", locator:ITEM_ATTRIBUTES_PFX + 'MaterialType'},
				{key:"materialTypeSetElements", schema:{
					allowEmpty: true,
					resultListLocator: "MaterialTypeSetElement",
					resultFields: [
						{key:"name", locator:'Name'},
						{key:"type", locator:'Type'}
					]
				}},
				{key:"maximumFocalLength", locator:ITEM_ATTRIBUTES_PFX + 'MaximumFocalLength'},
				{key:"maximumFocalLengthUnits", locator:ITEM_ATTRIBUTES_PFX + 'MaximumFocalLength/@Units'},
				{key:"maximumResolution", locator:ITEM_ATTRIBUTES_PFX + 'MaximumResolution'},
				{key:"maximumResolutionUnits", locator:ITEM_ATTRIBUTES_PFX + 'MaximumResolution/@Units'},
				{key:"maximumWeightRecommendation", locator:ITEM_ATTRIBUTES_PFX + 'MaximumWeightRecommendation'},
				{key:"maximumWeightRecommendationUnits", locator:ITEM_ATTRIBUTES_PFX + 'MaximumWeightRecommendation/@Units'},
				{key:"mediaType", locator:ITEM_ATTRIBUTES_PFX + 'MediaType'},
				{key:"metalStamp", locator:ITEM_ATTRIBUTES_PFX + 'MetalStamp'},
				{key:"metalType", locator:ITEM_ATTRIBUTES_PFX + 'MetalType'},
				{key:"minimumFocalLength", locator:ITEM_ATTRIBUTES_PFX + 'MinimumFocalLength'},
				{key:"minimumFocalLengthUnits", locator:ITEM_ATTRIBUTES_PFX + 'MinimumFocalLength/@Units'},
				{key:"minimumShutterSpeed", locator:ITEM_ATTRIBUTES_PFX + 'MinimumShutterSpeed'},
				{key:"minimumShutterSpeedUnits", locator:ITEM_ATTRIBUTES_PFX + 'MinimumShutterSpeed/@Units'},
				{key:"model", locator:ITEM_ATTRIBUTES_PFX + 'Model'},
				{key:"monitorSize", locator:ITEM_ATTRIBUTES_PFX + 'MonitorSize'},
				{key:"monitorSizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'MonitorSize/@Units'},
				{key:"mpn", locator:ITEM_ATTRIBUTES_PFX + 'MPN'},
				{key:"nativeResolution", locator:ITEM_ATTRIBUTES_PFX + 'NativeResolution'},
				{key:"numberOfDiscs", locator:ITEM_ATTRIBUTES_PFX + 'NumberOfDiscs', parser: 'integer'},
				{key:"numberOfItems", locator:ITEM_ATTRIBUTES_PFX + 'NumberOfItems', parser: 'integer'},
				{key:"numberOfIssues", locator:ITEM_ATTRIBUTES_PFX + 'NumberOfIssues', parser: 'integer'},
				{key:"numberOfPages", locator:ITEM_ATTRIBUTES_PFX + 'NumberOfPages', parser: 'integer'},
				{key:"numberOfStones", locator:ITEM_ATTRIBUTES_PFX + 'NumberOfStones', parser: 'integer'},
				{key:"operatingSystem", locator:ITEM_ATTRIBUTES_PFX + 'OperatingSystem'},
				{key:"opticalSensorResolution", locator:ITEM_ATTRIBUTES_PFX + 'OpticalSensorResolution'},
				{key:"opticalSensorResolutionUnits", locator:ITEM_ATTRIBUTES_PFX + 'OpticalSensorResolution/@Units'},
				{key:"opticalZoom", locator:ITEM_ATTRIBUTES_PFX + 'OpticalZoom'},
				{key:"opticalZoomUnits", locator:ITEM_ATTRIBUTES_PFX + 'OpticalZoom/@Units'},
				{key:"originalAirDate", locator:ITEM_ATTRIBUTES_PFX + 'OriginalAirDate'},
				{key:"originalReleaseDate", locator:ITEM_ATTRIBUTES_PFX + 'OriginalReleaseDate'},
				{key:"packageHeight", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Height', parser: 'integer'},
				{key:"packageLength", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Length', parser: 'integer'},
				{key:"packageWidth", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Width', parser: 'integer'},
				{key:"packageWeight", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Weight', parser: 'integer'},
				{key:"packageHeightUnits", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Height/@Units'},
				{key:"packageLengthUnits", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Length/@Units'},
				{key:"packageWidthUnits", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Width/@Units'},
				{key:"packageWeightUnits", locator:ITEM_ATTRIBUTES_PFX + 'PackageDimensions/Weight/@Units'},
				{key:"packageQuantity", locator:ITEM_ATTRIBUTES_PFX + 'PackageQuantity', parser: 'integer'},
				{key:"pearlLustre", locator:ITEM_ATTRIBUTES_PFX + 'PearlLustre'},
				{key:"pearlMinimumColor", locator:ITEM_ATTRIBUTES_PFX + 'PearlMinimumColor'},
				{key:"pearlShape", locator:ITEM_ATTRIBUTES_PFX + 'PearlShape'},
				{key:"pearlStringingMethod", locator:ITEM_ATTRIBUTES_PFX + 'PearlStringingMethod'},
				{key:"pearlSurfaceBlemishes", locator:ITEM_ATTRIBUTES_PFX + 'PearlSurfaceBlemishes'},
				{key:"pearlType", locator:ITEM_ATTRIBUTES_PFX + 'PearlType'},
				{key:"pearlUniformity", locator:ITEM_ATTRIBUTES_PFX + 'PearlUniformity'},
				{key:"platforms", schema:{
					allowEmpty: true,
					resultListLocator: "Platform",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"processorCount", locator:ITEM_ATTRIBUTES_PFX + 'ProcessorCount', parser: 'integer'},
				{key:"productGroup", locator:ITEM_ATTRIBUTES_PFX + 'ProductGroup'},
				{key:"productTypeName", locator:ITEM_ATTRIBUTES_PFX + 'ProductTypeName'},
				{key:"publicationDate", locator:ITEM_ATTRIBUTES_PFX + 'PublicationDate'},
				{key:"publisher", locator:ITEM_ATTRIBUTES_PFX + 'Publisher'},
				{key:"readingLevel", locator:ITEM_ATTRIBUTES_PFX + 'ReadingLevel'},
				{key:"regionCode", locator:ITEM_ATTRIBUTES_PFX + 'RegionCode', parser: 'integer'},
				{key:"releaseDate", locator:ITEM_ATTRIBUTES_PFX + 'ReleaseDate'},
				{key:"removableStorage", locator:ITEM_ATTRIBUTES_PFX + 'RemovableStorage'},
				{key:"ringSize", locator:ITEM_ATTRIBUTES_PFX + 'RingSize', parser: 'integer'},
				{key:"ringSizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'RingSize/@Units'},
				{key:"runningTime", locator:ITEM_ATTRIBUTES_PFX + 'RunningTime', parser: 'integer'},
				{key:"runningTimeUnits", locator:ITEM_ATTRIBUTES_PFX + 'RunningTime/@Units'},
				{key:"seasonSequence", locator:ITEM_ATTRIBUTES_PFX + 'SeasonSequence'},
				{key:"settingType", locator:ITEM_ATTRIBUTES_PFX + 'SettingType'},
				{key:"shortSynopsis", locator:ITEM_ATTRIBUTES_PFX + 'ShortSynopsis'},
				{key:"size", locator:ITEM_ATTRIBUTES_PFX + 'Size'},
				{key:"sizePerPearl", locator:ITEM_ATTRIBUTES_PFX + 'SizePerPearl'},
				{key:"sku", locator:ITEM_ATTRIBUTES_PFX + 'SKU'},
				{key:"specialFeatures", schema:{
					allowEmpty: true,
					resultListLocator: "SpecialFeatures",
					resultFields: [
						{key:"value", locator:'.'}
					]
				}},
				{key:"stoneShape", locator:ITEM_ATTRIBUTES_PFX + 'StoneShape'},
				{key:"studio", locator:ITEM_ATTRIBUTES_PFX + 'Studio'},
				{key:"subscriptionLength", locator:ITEM_ATTRIBUTES_PFX + 'SubscriptionLength'},
				{key:"subscriptionLengthUnits", locator:ITEM_ATTRIBUTES_PFX + 'SubscriptionLength/@Units'},
				{key:"systemBusSpeed", locator:ITEM_ATTRIBUTES_PFX + 'SystemBusSpeed', parser: 'integer'},
				{key:"systemBusSpeedUnits", locator:ITEM_ATTRIBUTES_PFX + 'SystemBusSpeed/@Units'},
				{key:"systemMemorySize", locator:ITEM_ATTRIBUTES_PFX + 'SystemMemorySize', parser: 'integer'},
				{key:"systemMemorySizeUnits", locator:ITEM_ATTRIBUTES_PFX + 'SystemMemorySize/@Units'},
				{key:"systemMemoryType", locator:ITEM_ATTRIBUTES_PFX + 'SystemMemoryType'},
				{key:"theatricalReleaseDate", locator:ITEM_ATTRIBUTES_PFX + 'TheatricalReleaseDate'},
				{key:"title", locator:ITEM_ATTRIBUTES_PFX + 'Title'},
				{key:"totalDiamondWeight", locator:ITEM_ATTRIBUTES_PFX + 'TotalDiamondWeight'},
				{key:"totalDiamondWeightUnits", locator:ITEM_ATTRIBUTES_PFX + 'TotalDiamondWeight/@Units'},
				{key:"totalGemWeight", locator:ITEM_ATTRIBUTES_PFX + 'TotalGemWeight'},
				{key:"totalGemWeightUnits", locator:ITEM_ATTRIBUTES_PFX + 'TotalGemWeight/@Units'},
				{key:"totalMetalWeight", locator:ITEM_ATTRIBUTES_PFX + 'TotalMetalWeight'},
				{key:"totalMetalWeightUnits", locator:ITEM_ATTRIBUTES_PFX + 'TotalMetalWeight/@Units'},
				{key:"trackSequence", locator:ITEM_ATTRIBUTES_PFX + 'TrackSequence'},
				{key:"upc", locator:ITEM_ATTRIBUTES_PFX + 'UPC'},
				{key:"warranty", locator:ITEM_ATTRIBUTES_PFX + 'Warranty'},
				{key:"watchMovementType", locator:ITEM_ATTRIBUTES_PFX + 'WatchMovementType'},
				{key:"waterResistanceDepth", locator:ITEM_ATTRIBUTES_PFX + 'WaterResistanceDepth'},
				{key:"waterResistanceDepthUnits", locator:ITEM_ATTRIBUTES_PFX + 'WaterResistanceDepth/@Units'}
			].concat(RESULT_FIELDS_LINKS)
		},

/*
Operation=ItemLookup&ItemId=B000A3UB2O&ResponseGroup=ItemIds
 */
		ItemIds: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: [{key:"asin", locator:'ASIN'}]
		},

		Large: {
			metaFields: META_FIELDS,
			resultListLocator: "Item",
			resultFields: []
		},
		
		ListFull: {
			metaFields: META_FIELDS,
			operations: ['ListLookup'],
			resultListLocator: "List",
			resultFields: []
		},

/*
Operation=ListSearch&ListType=WishList&Name=John%20Smith&ResponseGroup=ListInfo
<List>
	<ListId>2H09LAC20BQ12</ListId>
	<ListURL>http://www.amazon.com/gp/registry/wishlist/2H09LAC20BQ12</ListURL>
	<ListName>Wish List</ListName>
	<ListType>WishList</ListType>
	<TotalItems>1444</TotalItems>
	<TotalPages>145</TotalPages>
	<DateCreated>2006-01-07</DateCreated>
	<LastModified>2009-11-07</LastModified>
	<CustomerName>john smith</CustomerName>
</List>
 */
		ListInfo: {
			metaFields: META_FIELDS,
			operations: ['ListLookup', 'ListSearch'],
			resultListLocator: "List",
			resultFields: [
				{key:"listId", locator:'ListId'},
				{key:"listURL", locator:'ListURL'},
				{key:"listType", locator:'ListType'},
				{key:"totalItems", locator:'TotalItems', parser: 'integer'},
				{key:"totalPages", locator:'TotalPages', parser: 'integer'},
				{key:"dateCreated", locator:'DateCreated'},
				{key:"lastModified", locator:'LastModified'},
				{key:"customerName", locator:'CustomerName'},
			]
		},

/*
Operation=ListLookup&ListType=Listmania&ListId=2WYHF5M2L9142&ResponseGroup=ListItems&
<List>
	<ListId>2WYHF5M2L9142</ListId>
	<ListName>Popular Christmas Books For Young and Old</ListName>
	<TotalItems>25</TotalItems>
	<TotalPages>1</TotalPages>
	<ListItem>
		<ListItemId>RI12NH0FJAU5DPX</ListItemId>
		<Item>
			<ASIN>0385508417</ASIN>
			<ItemAttributes>
				<Title>Skipping Christmas</Title>
			</ItemAttributes>
		</Item>
	</ListItem>
</List>
 */
		ListItems: {
			metaFields: META_FIELDS,
			operations: ['ListLookup'],
			resultListLocator: "List",
			resultFields: [
				{key:"listId", locator:'ListId'},
				{key:"totalItems", locator:'TotalItems', parser: 'integer'},
				{key:"totalPages", locator:'TotalPages', parser: 'integer'},
				{key:'ListItems', schema: {
					resultListLocator: "ListItem",
					resultFields: [
						{key:"listItemId", locator:'ListItemId'},
						{key:"asin", locator:'Item/ASIN'},
						{key:"title", locator:'Item/ItemAttributes/Title'}
					]
				}}
			]
		},

/*
Operation=ItemLookup&ItemId=0545010225&IdType=ASIN&ResponseGroup=ListmaniaList
<ListmaniaLists>
  <ListmaniaList>
    <ListId>R1XB8VAK6TI229</ListId> 
    <ListName>Mike's Dumb List</ListName> 
  </ListmaniaList>
	...
</ListmaniaLists>
 */
		ListmaniaLists: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: [
				{key: 'asin', locator: 'ASIN'},
				{key: 'listmaniaLists', schema: {
					resultListLocator: "ListmaniaList",
					resultFields: [
						{key: 'listId', locator: 'ListId'},
						{key: 'listName', locator: 'ListName'}
					]
				}}
			]
		},

/*
Operation=ListSearch&ListType=WishList&Name=John%20Smith&ResponseGroup=ListMinimum
<TotalResults>557</TotalResults> 
<TotalPages>56</TotalPages> 
<List>
  <ListId>2AAAAAAAAAA6B</ListId> 
  <ListName>Wishlist</ListName> 
  <TotalItems>73</TotalItems> 
  <TotalPages>8</TotalPages> 
</List>
 */
		ListMinimum: {
			metaFields: META_FIELDS,
			operations: ['ListSearch'],
			resultListLocator: "List",
			resultFields: [
				{key: 'listId', locator: 'ListId'},
				{key: 'listName', locator: 'ListName'},
				{key: 'totalItems', locator: 'TotalItems'},
				{key: 'totalPages', locator: 'TotalPages'}
			]
		},

		Medium: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: []
		},

/*
ItemId=B0000041CG&IdType=ASIN&ResponseGroup=MerchantItemAttributes
See ItemAttributes
 */
		MerchantItemAttributes: {
			metaFields: META_FIELDS,
			operations: ['ItemLookup', 'ItemSearch'],
			resultListLocator: "Item",
			resultFields: []
		},
		
/*
Operation=BrowseNodeLookup&BrowseNodeId=4229&ResponseGroup=NewReleases
<NewReleases>
  <NewRelease>
    <ASIN>0446578622</ASIN> 
    <Title>The Notebook Girls</Title> 
  </NewRelease>
  ...
</NewReleases>
 */
		NewReleases: {
			metaFields: META_FIELDS,
			operations: ['BrowseNodeLookup'],
			resultListLocator: "BrowseNode",
			resultFields: [
				{key: 'browseNodeId', locator: 'BrowseNodeId'},
				{key: 'name', locator: 'Name'},
				{key: 'newReleases', schema: {
					resultListLocator: "NewRelease",
					resultFields: [
						{key: 'asin', locator: 'ASIN'},
						{key: 'title', locator: 'Title'}
					]
				}},
				{key: 'topItemSets', schema: {
					resultListLocator: "TopItem",
					resultFields: [
						{key: 'asin', locator: 'ASIN'},
						{key: 'author', locator: 'Author'},
						{key: 'detailPageURL', locator: 'DetailPageURL'},
						{key: 'productGroup', locator: 'ProductGroup'},
						{key: 'title', locator: 'Title'}
					]
				}},
				{key: 'topItemSetType', locator: 'TopItemSet/Type'}
			]
		},

/* 
Operation=ItemSearch&Keywords=sports&ResponseGroup=OfferListings
<Item>
	<ASIN>B002OHDZD6</ASIN>
	<Offers>
		<TotalOffers>1</TotalOffers>
		<TotalOfferPages>1</TotalOfferPages>
		<Offer>
			<Merchant>
				<MerchantId>ATVPDKIKX0DER</MerchantId>
				<GlancePage>http://www.amazon.com/gp/help/seller/home.html?seller=ATVPDKIKX0DER</GlancePage>
				<AverageFeedbackRating>0.0</AverageFeedbackRating>
				<TotalFeedback>0</TotalFeedback>
			</Merchant>
			<OfferAttributes>
				<Condition>New</Condition>
				<SubCondition>new</SubCondition>
			</OfferAttributes>
			<OfferListing>
				<OfferListingId>ooO%2FDZkMPtGJrURWT4zPUyAxvglTDLozNWUbuqArYV1UnPl6WqfROM7bA9IRcYLZWJciWzLV1skkn1Ex6T3h0mMvzoxqrfF8</OfferListingId>
				<Price>
					<Amount>1700</Amount>
					<CurrencyCode>USD</CurrencyCode>
					<FormattedPrice>$17.00</FormattedPrice>
				</Price>
				<Availability>Usually ships in 24 hours</Availability>
				<AvailabilityAttributes>
					<AvailabilityType>now</AvailabilityType>
					<MinimumHours>0</MinimumHours>
					<MaximumHours>0</MaximumHours>
				</AvailabilityAttributes>
				<Quantity>-1</Quantity>
				<IsEligibleForSuperSaverShipping>1</IsEligibleForSuperSaverShipping>
			</OfferListing>
		</Offer>
	</Offers>
</Item>
 */
		OfferListings: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"offers", schema: {
					allowEmpty: true,
					resultListLocator: "Offer",
					resultFields: [
						{key:"averageFeedbackRating", locator:'Merchant/AverageFeedbackRating', parser: 'decimal'},
						{key:"glancePage", locator:'Merchant/GlancePage', parser: 'integer'},
						{key:"merchantId", locator:'Merchant/MerchantId'},
						{key:"totalFeedback", locator:'Merchant/TotalFeedback', parser: 'integer'},
						{key:"condition", locator:'OfferAttributes/Condition'},
						{key:"subCondition", locator:'OfferAttributes/SubCondition'},
						{key:"conditionNote", locator:'OfferAttributes/ConditionNote'},
						{key:"offerListingId", locator:'OfferListing/OfferListingId'},
						{key:"priceAmount", locator:'OfferListing/Price/Amount', parser: 'integer'},
						{key:"priceCurrencyCode", locator:'OfferListing/Price/CurrencyCode'},
						{key:"priceFormattedPrice", locator:'OfferListing/Price/FormattedPrice'},
						{key:"savedAmount", locator:'OfferListing/AmountSaved/Amount', parser: 'integer'},
						{key:"savedCurrencyCode", locator:'OfferListing/AmountSaved/CurrencyCode'},
						{key:"savedFormattedPrice", locator:'OfferListing/AmountSaved/FormattedPrice'},
						{key:"availability", locator:'OfferListing/Availability'},
						{key:"availabilityAttributesAvailabilityType", locator:'OfferListing/AvailabilityAttributes/AvailabilityType'},
						{key:"availabilityAttributesMinimumHours", locator:'OfferListing/AvailabilityAttributes/MinimumHours', parser: 'integer'},
						{key:"availabilityAttributesMaximumHours", locator:'OfferListing/AvailabilityAttributes/MaximumHours', parser: 'integer'},
						{key:"quantity", locator:'OfferListing/Quantity'},
						{key:"isEligibleForSuperSaverShipping", locator:'OfferListing/IsEligibleForSuperSaverShipping', parser: 'bool'}
					]
				}}
			]
		},

/*
Operation=ItemLookup&ItemId=B000AYGDIO&MerchantId=All&ResponseGroup=Offers 
 */
		Offers: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: []
		},

/* 
Operation=ItemLookup&ItemId=B000A3UB2O&ResponseGroup=OfferSummary
<Item>
	<ASIN>B002OHDZD6</ASIN>
	<OfferSummary>
		<LowestNewPrice>
			<Amount>400</Amount>
			<CurrencyCode>USD</CurrencyCode>
			<FormattedPrice>$4.00</FormattedPrice>
		</LowestNewPrice>
		<LowestUsedPrice>
			<Amount>317</Amount>
			<CurrencyCode>USD</CurrencyCode>
			<FormattedPrice>$3.17</FormattedPrice>
		</LowestUsedPrice>
		<TotalNew>31</TotalNew>
		<TotalUsed>24</TotalUsed>
		<TotalCollectible>0</TotalCollectible>
		<TotalRefurbished>0</TotalRefurbished>
	</OfferSummary>
</Item>
 */
		OfferSummary: {
			metaFields: META_FIELDS,
			operations: OPERATIONS_LOOKUP,
			resultListLocator: "Item",
			resultFields: [
				{key:"asin", locator:'ASIN'},
				{key:"newPriceAmount", locator:'//LowestNewPrice/Amount', parser: 'integer'},
				{key:"newPriceCurrencyCode", locator:'//LowestNewPrice/CurrencyCode'},
				{key:"newPriceFormatted", locator:'//LowestNewPrice/FormattedPrice'},
				{key:"usedPriceAmount", locator:'//LowestUsedPrice/Amount', parser: 'integer'},
				{key:"usedPriceCurrencyCode", locator:'//LowestUsedPrice/CurrencyCode'},
				{key:"usedPriceFormatted", locator:'//LowestUsedPrice/FormattedPrice'},
				{key:"totalNew", locator:'//TotalNew', parser: 'integer'},
				{key:"totalUsed", locator:'//TotalUsed', parser: 'integer'},
				{key:"totalCollectible", locator:'//TotalCollectible', parser: 'integer'},
				{key:"totalRefurbished", locator:'//TotalRefurbished', parser: 'integer'}
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
				{key:"manufacturer", locator:ITEM_ATTRIBUTES_PFX + 'Manufacturer'},
				{key:"message", locator:'Message'},
				{key:"productGroup", locator:ITEM_ATTRIBUTES_PFX + 'ProductGroup'},
				{key:"role", locator:'Role'},
				{key:"title", locator:ITEM_ATTRIBUTES_PFX + 'Title'}
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

// update schemas that use other schemas
AWS_SCHEMA.BrowseNodeInfo.resultFields = AWS_SCHEMA.BrowseNodeInfo.resultFields.concat(AWS_SCHEMA.BrowseNodes.resultFields);
AWS_SCHEMA.CustomerFull.resultFields = AWS_SCHEMA.CustomerInfo.resultFields.concat(AWS_SCHEMA.CustomerLists.resultFields)
	.concat(AWS_SCHEMA.CustomerReviews.resultFields);
AWS_SCHEMA.ListFull.resultFields = AWS_SCHEMA.ListInfo.resultFields.concat(AWS_SCHEMA.ListItems.resultFields);
AWS_SCHEMA.MerchantItemAttributes.resultFields = AWS_SCHEMA.ItemAttributes.resultFields;
AWS_SCHEMA.Offers.resultFields = AWS_SCHEMA.OfferSummary.resultFields;

// update meta
AWS_SCHEMA.OfferListings.metaFields.totalOffers = '//TotalOffers';
AWS_SCHEMA.OfferListings.metaFields.totalOfferPages = '//TotalOfferPages';

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

}, {requires: ['oop', 'datatype-json', 'dataschema-xml2', 'gallery-aws']});