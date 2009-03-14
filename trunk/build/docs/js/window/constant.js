/*
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.03
 */

/**
 * Define global constants.
 * @module window
 */
(function() {
    
    /**
     * This Class contains global constants that to made be available throughout the codebase.
     * @class C
     * @static
     */
    if (! YAHOO.lang.isObject(window.C)) {window.C = {};} // don't override C, unless necessary

    /**
     * The global object to hold all HTML constants.
     * @namespace C
     * @class HTML
     * @static
     */
    C.HTML={};

    /**
     * The global object to hold all className constants.
     * @namespace C.HTML
     * @class CLS
     * @static
     */
    C.HTML.CLS={};

    /**
     * The DOM class attribute for applying disabled styles and/or identifying element state.
     * @property DISABLED
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.DISABLED='disabled';

    /**
     * The DOM class attribute for applying error styles.
     * @property ERROR
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.ERROR='error';

    /**
     * The DOM class attribute for emulating :first-child psuedo class.
     * @property FIRST
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.FIRST='first';

    /**
     * The DOM class attribute for applying the "visibility:hidden" style.
     * @property HIDDEN
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.HIDDEN='hidden';

    /**
     * The DOM class attribute for applying the "display:none" style.
     * @property HIDE
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.HIDE='displayNone';

    /**
     * The DOM class attribute for emulating :hover psuedo class.
     * @property HOVER
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.HOVER='hover';

    /**
     * The DOM class attribute for emulating :last-child psuedo class.
     * @property LAST
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.LAST='last';

    /**
     * The DOM class attribute for applying message styles.
     * @property MESSAGE
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.MESSAGE='message';

    /**
     * The DOM class attribute for identifying 'next' elements (usually used in pagination).
     * @property NEXT
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.NEXT='next';

    /**
     * The DOM class attribute for applying open styles and/or identifying element state.
     * @property OPEN
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.OPEN='open';

    /**
     * The DOM class attribute for identifying 'previous' elements (usually used in pagination).
     * @property PREV
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.PREV='prev';

    /**
     * The DOM class attribute for applying selected styles and/or identifying element state.
     * @property SELECTED
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.CLS.SELECTED='selected';

    /**
     * The global object to hold all ID constants.
     * @namespace C.HTML
     * @class ID
     * @static
     */
    C.HTML.ID={};

    /**
     * The DOM id attribute for identifying the project's body element.
     * @property BODY
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.ID.BODY = 'project';

    /**
     * The name object to hold all naming constants.
     * @namespace C.HTML
     * @class NAME
     * @static
     */
    C.HTML.NAME={};

    /**
     * The DOM name attribute for tasks.
     * @property TASK
     * @type {String}
     * @static
     * @final
     * @readonly Defined at build time.
     */
    C.HTML.NAME.TASK='task';
})();