YUI.add('dataschema-xml2', function(Y) {

/**
 * Provides a DataSchema implementation which can be used to work with XML data.
 *
 * @module dataschema
 * @submodule dataschema-xml
 */
var LANG = Y.Lang,

    /**
     * XML subclass for the DataSchema Utility.
     * @class DataSchema.XML
     * @extends DataSchema.Base
     * @static
     */
    SchemaXML = {

        /////////////////////////////////////////////////////////////////////////////
        //
        // DataSchema.XML static methods
        //
        /////////////////////////////////////////////////////////////////////////////
        /**
         * Applies a given schema to given XML data.
         *
         * @method apply
         * @param schema {Object} Schema to apply.
         * @param xmldoc {XMLDoc} XML document.
         * @return {Object} Schema-parsed data.
         * @static
         */
        apply: function(schema, xmldoc) {
            var data_out = {results:[],meta:{}};

            if(xmldoc && xmldoc.nodeType && (9 === xmldoc.nodeType || 1 === xmldoc.nodeType || 11 === xmldoc.nodeType) && schema) {
                // Parse results data
				data_out = SchemaXML._getParseFunction(schema)(schema, xmldoc, data_out);

                // Parse meta data
                data_out = SchemaXML._parseMeta(schema.metaFields, xmldoc, data_out);
            }
            else {
                data_out.error = new Error("XML schema parse failure");
            }

            return data_out;
        },

        /**
         * Get an XPath-specified value for a given field from an XML node or document.
         *
         * @method _getLocationValue
         * @param field {String | Object} Field definition.
         * @param context {Object} XML node or document to search within.
         * @return {Object} Data value or null.
         * @static
         * @protected
         */
        _getLocationValue: function(field, context) {
            var locator = field.locator || field.key || field,
                xmldoc = context.ownerDocument || context,
                result, res, value = null;

            try {
				result = SchemaXML._getXPathResult(locator, context, xmldoc);
				while(res = result.iterateNext()) {
					value = res.textContent;
				}

                return Y.DataSchema.Base.parse(value, field);
            }
            catch(e) {
				Y.log('SchemaXML._getLocationValue failed: ' + e.message);
            }

			return null;
        },
		
		/**
		 * Fetches the result parsing function by evaluating the resultListLocator.
		 * 
		 * @method _getParseFunction
		 * @param schema {Object} Required. The schema to evaluate.
		 * @return {Function} The parsing function.
         * @static
         * @protected
		 */
		_getParseFunction: function(schema) {
			return SchemaXML[schema.resultListLocator.match(/^[:\-\w]+$/) ? '_parseResults' : '_parseResultsUsingXPath'];
		},

		/**
		 * Fetches the XPath-specified result for a given location in an XML node or document.
		 *
		 * @param locator {String} The XPath location.
         * @param context {Object} XML node or document to search within.
         * @param xmldoc {Object} XML document to resolve namespace.
         * @return {Object} Data collection or null.
         * @static
         * @protected
		 */
		_getXPathResult: function(locator, context, xmldoc) {
			// Standards mode
			if (!LANG.isUndefined(xmldoc.evaluate)) {
				return xmldoc.evaluate(locator, context, xmldoc.createNSResolver(context.ownerDocument ? context.ownerDocument.documentElement : context.documentElement), 0, null);
			}
            // IE mode
			else {
				var values, locatorArray = locator.split("/"), i=0, l=locatorArray.length, location, subloc; 
				
				// XPath is supported
				try {
					// this fixes the IE 5.5+ issue where childnode selectors begin at 0 instead of 1
					xmldoc.setProperty("SelectionLanguage", "XPath");
					values = context.selectNodes(locator);
				}
				// Fallback for DOM nodes and fragments
				catch (e) {
					// Iterate over each locator piece
					for(; i<l; i++) {
						location = locatorArray[i];

						// grab nth child []
						if((location.indexOf("[") > -1) && (location.indexOf("]") > -1)) {
							subloc = location.slice(location.indexOf("[")+1, location.indexOf("]"));
							//XPath is 1-based while DOM is 0-based
							subloc--;
							context = context.childNodes[subloc];
						}

						// grab attribute value @
						if(location.indexOf("@") > -1) {
							subloc = location.substr(location.indexOf("@"));
							context = subloc ? context.getAttribute(subloc) : context;
						}
					}
					
					// grab node value
					values = [context.innerHTML];
				}

				// returning a mock-standard object for IE
				return {
					index: 0,
					
					iterateNext: function() {
						if (this.index >= this.values.length) {return undefined;}
						var result = this.values[this.index];
						this.index += 1;
						return {/* commenting out, as none of these properties are used
							attributes: result.attributes,
							baseURI: result.baseURI,
							childNodes: result.childNodes,
							firstChild: result.firstChild,
							lastChild: result.lastChild,
							localName: result.localName,
							namespaceURI: result.namespaceURI,
							nextSibling: result.nextSibling,
							nodeName: result.nodeName,
							nodeValue: result.nodeValue,
							parentNode: result.parentNode,
							prefix: result.prefix,
							previousSibling: result.previousSibling,*/
							textContent: result.value || result.text || null/*,
							value: result.value*/
						};
					},

					values: values
				};
			}
		},

		_parseField: function(field, result, node) {
			if (field.schema) {
				result[field.key] = SchemaXML._getParseFunction(field.schema)(field.schema, node, {results:[],meta:{}});
			}
			else {
				result[field.key || field] = SchemaXML._getLocationValue(field, node);
			}
		},

        /**
         * Parses results data according to schema
         *
         * @method _parseMeta
         * @param xmldoc_in {Object} XML document parse.
         * @param data_out {Object} In-progress schema-parsed data to update.
         * @return {Object} Schema-parsed data.
         * @static
         * @protected
         */
        _parseMeta: function(metaFields, xmldoc_in, data_out) {
            if(LANG.isObject(metaFields)) {
                var key,
                    xmldoc = xmldoc_in.ownerDocument || xmldoc_in;

                for(key in metaFields) {
                    if (metaFields.hasOwnProperty(key)) {
                        data_out.meta[key] = SchemaXML._getLocationValue(metaFields[key], xmldoc);
                    }
                }
            }
            return data_out;
        },

        /**
         * Schema-parsed list of results from full data
         *
         * @method _parseResults
         * @param schema {Object} Schema to parse against.
         * @param xmldoc_in {Object} XML document parse.
         * @param data_out {Object} In-progress schema-parsed data to update.
         * @return {Object} Schema-parsed data.
         * @static
         * @protected
         */
        _parseResults: function(schema, xmldoc_in, data_out) {
            if(schema.resultListLocator && LANG.isArray(schema.resultFields)) {
                var nodeList = xmldoc_in.getElementsByTagName(schema.resultListLocator),
                    fields = schema.resultFields,
                    results = [],
                    node, result, i, j;

                if(nodeList.length) {
                    // Loop through each result node
                    for(i=nodeList.length-1; 0 <= i; i--) {
                        result = {};
                        node = nodeList[i];

                        // Find each field value
                        for(j=fields.length-1; 0 <= j; j--) {
							SchemaXML._parseField(fields[j], result, node);
                        }
                        results[i] = result;
                    }

                    data_out.results = results;
                }
                else if (! schema.allowEmpty) {
                    data_out.error = new Error("XML schema result nodes retrieval failure");
                }
            }
            return data_out;
        },

        /**
         * Schema-parsed list of results from full data using XPath instead of getElementsByTagName.
         *
         * @method _parseResultsUsingXPath
         * @param schema {Object} Schema to parse against.
         * @param xmldoc_in {Object} XML document parse.
         * @param data_out {Object} In-progress schema-parsed data to update.
         * @return {Object} Schema-parsed data.
         * @static
         * @protected
         */
        _parseResultsUsingXPath: function(schema, xmldoc_in, data_out) {
            if(schema.resultListLocator && LANG.isArray(schema.resultFields)) {
				try {
					var xmldoc = xmldoc_in.ownerDocument || xmldoc_in,
						nodeList = SchemaXML._getXPathResult(schema.resultListLocator, xmldoc, xmldoc),
						fields = schema.resultFields,
						results = [],
						node, result, i=0, j;

					while(node = nodeList.iterateNext()) {
						result = {};

						// Find each field value
						for(j=fields.length-1; 0 <= j; j--) {
							SchemaXML._parseField(fields[j], result, node);
						}

						results[i] = result;
						i += 1;
					}

					if (result) {
                    	data_out.results = results;
					}
					else {
                    	data_out.error = new Error("XML schema result nodes retrieval failure");
					}
				}
				catch(e) {
					Y.log('SchemaXML._parseResultsUsingXPath failed: ' + e.message);
				}
			}
			
            return data_out;
		}
    };

Y.DataSchema.XML = Y.mix(SchemaXML, Y.DataSchema.Base);

}, '@VERSION@' ,{requires:['dataschema-base']});