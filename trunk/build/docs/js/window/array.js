/**
 * The JavaScript Array Object.
 *  since FireFox 1.0, Netscape 2.0, and IE 4.0
 *
 * @class Array
 * @constructor
 */

/**
 * Allows you to add properties and methods to the object.
 *  since FireFox 1.0, Netscape 2.0, and IE 4.0
 *
 * @property prototype
 * @type Object
 * @public
 */

/**
 * Sets or returns the number of elements in an array.
 *  since FireFox 1.0, Netscape 2.0, and IE 4.0
 *
 * @property length
 * @type Object
 * @public
 */

/**
 * The concat() method is used to join two or more arrays.
 *  This method does not change the existing arrays, it only returns a copy of the joined arrays.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @method concat
 * @return {Array} A new array containing the combined arrays.
 * @public
 */

/**
 * The join() method is used to put all the elements of an array into a string.
 *  The elements will be separated by a specified separator.
 *  since FireFox 1.0, Netscape 3.0, and IE 4.0
 *
 * @method join
 * @param separator {String} Optional. Specifies the separator to be used.
 * @return {String} The array values as a string separeted by separator.
 * @public
 */

/**
 * The pop() method is used to remove and return the last element of an array.
 *  This method changes the length of the array.
 *  since FireFox 1.0, Netscape 4.0, and IE 5.5
 *
 * @method pop
 * @return {Object} The last element in the array.
 * @see push
 * @see shift
 * @see unshift
 * @public
 */

/**
 * The push() method adds one or more elements to the end of an array and returns the new length.
 *  This method changes the length of the array.
 *  since FireFox 1.0, Netscape 4.0, and IE 5.5
 *
 * @method push
 * @param newelement1 {Object} Required. The first object to append.
 * @param newelementX {Object} Optional. Any number of additional objects parameters to append.
 * @return {Array} The array calling method with new elements.
 * @see pop
 * @see shift
 * @see unshift
 * @public
 */

/**
 * The reverse() method is used to reverse the order of the elements in an array.
 *  The reverse() method changes the original array.
 *  since FireFox 1.0, Netscape 3.0, and IE 4.0
 *
 * @method reverse
 * @return {Array} The array calling method.
 * @public
 */

/**
 * The shift() method is used to remove and return the first element of an array.
 *  This method changes the length of the array.
 *  since FireFox 1.0, Netscape 4.0, and IE 5.5
 *
 * @method shift
 * @return {Object} The first element in the array.
 * @see pop
 * @see push
 * @see unshift
 * @public
 */

/**
 * The slice() method returns selected elements from an existing array.
 *  You can use negative numbers to select from the end of the array.
 *  If end is not specified, slice() selects all elements from the specified start position and to the end of the array.
 *  since FireFox 1.0, Netscape 4.0, and IE 4.0
 *
 * @method slice
 * @param start {Number} Required. Specify where to start the selection. Must be a number.
 * @param end {Number} Optional. Specify where to end  the selection. Must be a number.
 * @return {Array} The elements removed from the array.
 * @public
 */

/**
 * The sort() method is used to sort the elements of an array.
 *  The sort() method will sort the elements alphabetically by default. However, this means that numbers will not be sorted correctly (40 comes before 5). To sort numbers, you must create a function that compare numbers.
 *  After using the sort() method, the array is changed.
 *  since FireFox 1.0, Netscape 3.0, and IE 4.0
 *
 * sortby for number sorting is:
 *  function sortNumber(a,b){return a - b;}
 *
 * @method sort
 * @param sortby {Function} Optional. Specifies the sort order. Must be a function.
 * @return {Array} The array calling method.
 * @public
 */

/**
 * The splice() method is used to remove and add new elements to an array.
 *  since FireFox 1.0, Netscape 4.0, and IE 5.5
 *
 * @method splice
 * @param index {Number} Required. Specify where to add/remove elements. Must be a number.
 * @param howmany {Number} Required Specify how many elements should be removed. Must be a number, but can be "0".
 * @param element1 {Object} Optional. Specify a new object to add to the array.
 * @param elementX {Object} Optional. Any number of additional objects parameters to append.
 * @return {Array} The array calling method with new elements.
 * @public
 */

/**
 * Returns the source code used to generate array.
 *  This method does not work in Internet Explorer!
 *  since FireFox 1.0 and Netscape 4.0
 *
 * @method toSource
 * @return {String} The source-code that generated the array.
 * @public
 */

/**
 * The toString() method converts a array value to a String and returns the result.
 *  The elements in the array will be separated with commas.
 *  since FireFox 1.0, Netscape 3.0, and IE 4.0
 *
 * @method toString
 * @return {String} The array as a String.
 * @public
 */

/**
 * The unshift() method adds one or more elements to the beginning of an array and returns the new length.
 *  This method changes the length of the array.
 *  The unshift() method does not work properly in Internet Explorer!
 *  since FireFox 1.0, Netscape 4.0, and IE 6.0
 *
 * @method unshift
 * @return {Number} The new length of the array.
 * @see pop
 * @see push
 * @see shift
 * @public
 */

/**
 * The valueOf() method returns the primitive value of an Array object.
 *  The primitive value is inherited by all objects descended from the Array object.
 *  The valueOf() method is usually called automatically by JavaScript behind the scenes and not explicitly in code.
 *  since FireFox 1.0, Netscape 2.0, and IE 4.0
 *
 * @method valueOf
 * @return {Array} The array primitive.
 * @public
 */