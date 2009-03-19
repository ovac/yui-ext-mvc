/**
 * The JavaScript RegExp Object
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @class RegExp
 * @constructor
 */

/**
 * The global property is used to return whether or not the "g" modifier is used in the regular expression.
 * The "g" modifier is set if the regular expression should be tested against all possible matches in the String.
 * This property is "TRUE" if the "g" modifier is set, "FALSE" otherwise.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property global
 * @type String
 * @public
 */

/**
 * The ignoreCase property is used to return whether or not the "i" modifier is used in the regular expression.
 * The "i" modifier is set if the regular expression should ignore the case of characters.
 * This property is "TRUE" if the "i" modifier is set, "FALSE" otherwise.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property ignoreCase
 * @type String
 * @public
 */

/**
 * The input property is the String the pattern match is performed.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property input
 * @type String
 * @public
 */

/**
 * The lastIndex property specifies the index (placement) in the String where to start the next match.
 * The index is a number specifying the placement of the first character after the last match.
 * This property only works if the "g" modifier is set.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property lastIndex
 * @type Number
 * @public
 */

/**
 * The lastMatch property is the last matched characters.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property lastMatch
 * @type String
 * @public
 */

/**
 * The lastParen property is the last parenthesized substring match.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property lastParen
 * @type String
 * @public
 */

/**
 * The leftContext property is the substring in front of the characters most recently matched.
 * This property contains everything from the String from before the match.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property leftContext
 * @type String
 * @public
 */

/**
 * The global property is used to return whether or not the "m" modifier is used in the regular expression.
 * The "m" modifier is set if the regular expression should be tested against possible matches over multiple lines.
 * This property is "TRUE" if the "m" modifier is set, "FALSE" otherwise.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property multiline
 * @type Boolean
 * @public
 */

/**
 * Allows you to add properties and methods to the object
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property prototype
 * @type Object
 * @public
 */

/**
 * The rightContext property is the substring from after the characters most recently matched.
 * This property contains everything from the String from after the match.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property rightContext
 * @type String
 * @public
 */

/**
 * The source property is used to return the text used for pattern matching.
 * The returned text is everything except the forward slashes and any flags.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @property source
 * @type String
 * @public
 */

/**
 * The compile() method is used to change the regular expression.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @method compile
 * @param regexp {String} Required. The new regular expression to search for.
 * @return {Boolean} true, when the regex matches
 * @public
 */

/**
 * The exec() method is used to search for a match of a regular expression in a String.
 * This method returns the matched text if a match is found, and null if not.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @method exec
 * @param regexp {String} Required. The String to search.
 * @return {String} found text, or null
 * @public
 */

/**
 * The test() method is used to search for a match of a regular expression in a String.
 * This method returns true if a match is found, and false if not.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @method test
 * @param regexp {String} Required. The String to search.
 * @return {Boolean} true, when the regex matches
 * @public
 */