/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

/**
 * YAHOO_config is not included as part of the library.  Instead it is an 
 * object that can be defined by the implementer immediately before 
 * including the YUI library.  The properties included in this object
 * will be used to configure global properties needed as soon as the 
 * library begins to load.
 * @class YAHOO_config
 * @static
 */

/**
 * A reference to a function that will be executed every time a YAHOO module
 * is loaded.  As parameter, this function will receive the version
 * information for the module. See <a href="YAHOO.env.html#getVersion">
 * YAHOO.env.getVersion</a> for the description of the version data structure.
 * @property listener
 * @type Function
 * @static
 * @default undefined
 */

/**
 * Set to true if the library will be dynamically loaded after window.onload.
 * Defaults to false 
 * @property injecting
 * @type boolean
 * @static
 * @default undefined
 */

/**
 * Instructs the yuiloader component to dynamically load yui components and
 * their dependencies.  See the yuiloader documentation for more information
 * about dynamic loading
 * @property load
 * @static
 * @default undefined
 * @see yuiloader
 */

/**
 * Forces the use of the supplied locale where applicable in the library
 * @property locale
 * @type string
 * @static
 * @default undefined
 */

if (typeof YAHOO == "undefined" || !YAHOO) {
    /**
     * The YAHOO global namespace object.  If YAHOO is already defined, the
     * existing YAHOO object will not be overwritten so that defined
     * namespaces are preserved.
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=a[i].split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is
 * available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};

/**
 * Registers a module with the YAHOO object
 * @method register
 * @static
 * @param {String}   name    the name of the module (event, slider, etc)
 * @param {Function} mainClass a reference to class in the module.  This
 *                             class will be tagged with the version info
 *                             so that it will be possible to identify the
 *                             version that is in use when multiple versions
 *                             have loaded
 * @param {Object}   data      metadata object for the module.  Currently it
 *                             is expected to contain a "version" property
 *                             and a "build" property at minimum.
 */
YAHOO.register = function(name, mainClass, data) {
    var mods = YAHOO.env.modules;
    if (!mods[name]) {
        mods[name] = { versions:[], builds:[] };
    }
    var m=mods[name],v=data.version,b=data.build,ls=YAHOO.env.listeners;
    m.name = name;
    m.version = v;
    m.build = b;
    m.versions.push(v);
    m.builds.push(b);
    m.mainClass = mainClass;
    // fire the module load listeners
    for (var i=0;i<ls.length;i=i+1) {
        ls[i](m);
    }
    // label the main class
    if (mainClass) {
        mainClass.VERSION = v;
        mainClass.BUILD = b;
    } else {
        YAHOO.log("mainClass is undefined for module " + name, "warn");
    }
};

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @static
 */
YAHOO.env = YAHOO.env || {

    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],
    
    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: []
};

/**
 * Returns the version data for the specified module:
 *      <dl>
 *      <dt>name:</dt>      <dd>The name of the module</dd>
 *      <dt>version:</dt>   <dd>The version in use</dd>
 *      <dt>build:</dt>     <dd>The build number in use</dd>
 *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
 *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
 *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
 *                 current version and build. If 
 *                 mainClass.VERSION != version or mainClass.BUILD != build,
 *                 multiple versions of pieces of the library have been
 *                 loaded, potentially causing issues.</dd>
 *       </dl>
 *
 * @method getVersion
 * @static
 * @param {String}  name the name of the module (event, slider, etc)
 * @return {Object} The version info
 */
YAHOO.env.getVersion = function(name) {
    return YAHOO.env.modules[name] || null;
};

/**
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  YAHOO.env.ua stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is 
 * presented as a float so that it can easily be used for boolean evaluation 
 * as well as for looking for a particular range of versions.  Because of this, 
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9 
 * reports 1.8).
 * @class YAHOO.env.ua
 * @static
 */
YAHOO.env.ua = function() {
    var o={

        /**
         * Internet Explorer version number or 0.  Example: 6
         * @property ie
         * @type float
         */
        ie:0,

        /**
         * Opera version number or 0.  Example: 9.2
         * @property opera
         * @type float
         */
        opera:0,

        /**
         * Gecko engine revision number.  Will evaluate to 1 if Gecko 
         * is detected but the revision could not be found. Other browsers
         * will be 0.  Example: 1.8
         * <pre>
         * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
         * Firefox 1.5.0.9: 1.8.0.9 <-- Reports 1.8
         * Firefox 2.0.0.3: 1.8.1.3 <-- Reports 1.8
         * Firefox 3 alpha: 1.9a4   <-- Reports 1.9
         * </pre>
         * @property gecko
         * @type float
         */
        gecko:0,

        /**
         * AppleWebKit version.  KHTML browsers that are not WebKit browsers 
         * will evaluate to 1, other browsers 0.  Example: 418.9.1
         * <pre>
         * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the 
         *                                   latest available for Mac OSX 10.3.
         * Safari 2.0.2:         416     <-- hasOwnProperty introduced
         * Safari 2.0.4:         418     <-- preventDefault fixed
         * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
         *                                   different versions of webkit
         * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
         *                                   updated, but not updated
         *                                   to the latest patch.
         * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native SVG
         *                                   and many major issues fixed).  
         * 3.x yahoo.com, flickr:422     <-- Safari 3.x hacks the user agent
         *                                   string when hitting yahoo.com and 
         *                                   flickr.com.
         * Safari 3.0.4 (523.12):523.12  <-- First Tiger release - automatic update
         *                                   from 2.x via the 10.4.11 OS patch
         * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
         *                                   yahoo.com user agent hack removed.
         *                                   
         * </pre>
         * http://developer.apple.com/internet/safari/uamatrix.html
         * @property webkit
         * @type float
         */
        webkit: 0,

        /**
         * The mobile property will be set to a string containing any relevant
         * user agent information when a modern mobile browser is detected.
         * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
         * devices with the WebKit-based browser, and Opera Mini.  
         * @property mobile 
         * @type string
         */
        mobile: null,

        /**
         * Adobe AIR version number or 0.  Only populated if webkit is detected.
         * Example: 1.0
         * @property air
         * @type float
         */
        air: 0

    };

    var ua=navigator.userAgent, m;

    // Modern KHTML browsers should qualify as Safari X-Grade
    if ((/KHTML/).test(ua)) {
        o.webkit=1;
    }
    // Modern WebKit browsers are at least X-Grade
    m=ua.match(/AppleWebKit\/([^\s]*)/);
    if (m&&m[1]) {
        o.webkit=parseFloat(m[1]);

        // Mobile browser check
        if (/ Mobile\//.test(ua)) {
            o.mobile = "Apple"; // iPhone or iPod Touch
        } else {
            m=ua.match(/NokiaN[^\/]*/);
            if (m) {
                o.mobile = m[0]; // Nokia N-series, ex: NokiaN95
            }
        }

        m=ua.match(/AdobeAIR\/([^\s]*)/);
        if (m) {
            o.air = m[0]; // Adobe AIR 1.0 or better
        }

    }

    if (!o.webkit) { // not webkit
        // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
        m=ua.match(/Opera[\s\/]([^\s]*)/);
        if (m&&m[1]) {
            o.opera=parseFloat(m[1]);
            m=ua.match(/Opera Mini[^;]*/);
            if (m) {
                o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
            }
        } else { // not opera or webkit
            m=ua.match(/MSIE\s([^;]*)/);
            if (m&&m[1]) {
                o.ie=parseFloat(m[1]);
            } else { // not opera, webkit, or ie
                m=ua.match(/Gecko\/([^\s]*)/);
                if (m) {
                    o.gecko=1; // Gecko detected, look for revision
                    m=ua.match(/rv:([^\s\)]*)/);
                    if (m&&m[1]) {
                        o.gecko=parseFloat(m[1]);
                    }
                }
            }
        }
    }
    
    return o;
}();

/*
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.  This is the setup
 * for env.
 * @method init
 * @static
 * @private
 */
(function() {
    YAHOO.namespace("util", "widget", "example");
    if ("undefined" !== typeof YAHOO_config) {
        var l=YAHOO_config.listener,ls=YAHOO.env.listeners,unique=true,i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0;i<ls.length;i=i+1) {
                if (ls[i]==l) {
                    unique=false;
                    break;
                }
            }
            if (unique) {
                ls.push(l);
            }
        }
    }
})();
/**
 * Provides the language utilites and extensions used by the library
 * @class YAHOO.lang
 */
YAHOO.lang = YAHOO.lang || {};

(function() {

var L = YAHOO.lang,

    // ADD = ["toString", "valueOf", "hasOwnProperty"],
    ADD = ["toString", "valueOf"],

    OB = {

    /**
     * Determines whether or not the provided object is an array.
     * Testing typeof/instanceof/constructor of arrays across frame 
     * boundaries isn't possible in Safari unless you have a reference
     * to the other frame to test against its Array prototype.  To
     * handle this case, we test well-known array properties instead.
     * properties.
     * @method isArray
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isArray: function(o) { 
        if (o) {
           return L.isNumber(o.length) && L.isFunction(o.splice);
        }
        return false;
    },

    /**
     * Determines whether or not the provided object is a boolean
     * @method isBoolean
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isBoolean: function(o) {
        return typeof o === 'boolean';
    },
    
    /**
     * Determines whether or not the provided object is a function
     * @method isFunction
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isFunction: function(o) {
        return typeof o === 'function';
    },
        
    /**
     * Determines whether or not the provided object is null
     * @method isNull
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNull: function(o) {
        return o === null;
    },
        
    /**
     * Determines whether or not the provided object is a legal number
     * @method isNumber
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },
      
    /**
     * Determines whether or not the provided object is of type object
     * or function
     * @method isObject
     * @param {any} o The object being testing
     * @return {boolean} the result
     */  
    isObject: function(o) {
return (o && (typeof o === 'object' || L.isFunction(o))) || false;
    },
        
    /**
     * Determines whether or not the provided object is a string
     * @method isString
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isString: function(o) {
        return typeof o === 'string';
    },
        
    /**
     * Determines whether or not the provided object is undefined
     * @method isUndefined
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isUndefined: function(o) {
        return typeof o === 'undefined';
    },
    
 
    /**
     * IE will not enumerate native functions in a derived object even if the
     * function was overridden.  This is a workaround for specific functions 
     * we care about on the Object prototype. 
     * @property _IEEnumFix
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @static
     * @private
     */
    _IEEnumFix: (YAHOO.env.ua.ie) ? function(r, s) {
            for (var i=0;i<ADD.length;i=i+1) {
                var fname=ADD[i],f=s[fname];
                if (L.isFunction(f) && f!=Object.prototype[fname]) {
                    r[fname]=f;
                }
            }
    } : function(){},
       
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass 
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
        if (!superc||!subc) {
            throw new Error("extend failed, please check that " +
                            "all dependencies are included.");
        }
        var F = function() {};
        F.prototype=superc.prototype;
        subc.prototype=new F();
        subc.prototype.constructor=subc;
        subc.superclass=superc.prototype;
        if (superc.prototype.constructor == Object.prototype.constructor) {
            superc.prototype.constructor=superc;
        }
    
        if (overrides) {
            for (var i in overrides) {
                if (L.hasOwnProperty(overrides, i)) {
                    subc.prototype[i]=overrides[i];
                }
            }

            L._IEEnumFix(subc.prototype, overrides);
        }
    },
   
    /**
     * Applies all properties in the supplier to the receiver if the
     * receiver does not have these properties yet.  Optionally, one or 
     * more methods/properties can be specified (as additional 
     * parameters).  This option will overwrite the property if receiver 
     * has it already.  If true is passed as the third parameter, all 
     * properties will be applied and _will_ overwrite properties in 
     * the receiver.
     *
     * @method augmentObject
     * @static
     * @since 2.3.0
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything
     *        in the supplier will be used unless it would
     *        overwrite an existing property in the receiver. If true
     *        is specified as the third parameter, all properties will
     *        be applied and will overwrite an existing property in
     *        the receiver
     */
    augmentObject: function(r, s) {
        if (!s||!r) {
            throw new Error("Absorb failed, verify dependencies.");
        }
        var a=arguments, i, p, override=a[2];
        if (override && override!==true) { // only absorb the specified properties
            for (i=2; i<a.length; i=i+1) {
                r[a[i]] = s[a[i]];
            }
        } else { // take everything, overwriting only if the third parameter is true
            for (p in s) { 
                if (override || !(p in r)) {
                    r[p] = s[p];
                }
            }
            
            L._IEEnumFix(r, s);
        }
    },
 
    /**
     * Same as YAHOO.lang.augmentObject, except it only applies prototype properties
     * @see YAHOO.lang.augmentObject
     * @method augmentProto
     * @static
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything 
     *        in the supplier will be used unless it would overwrite an existing 
     *        property in the receiver.  if true is specified as the third 
     *        parameter, all properties will be applied and will overwrite an 
     *        existing property in the receiver
     */
    augmentProto: function(r, s) {
        if (!s||!r) {
            throw new Error("Augment failed, verify dependencies.");
        }
        //var a=[].concat(arguments);
        var a=[r.prototype,s.prototype];
        for (var i=2;i<arguments.length;i=i+1) {
            a.push(arguments[i]);
        }
        L.augmentObject.apply(this, a);
    },

      
    /**
     * Returns a simple string representation of the object or array.
     * Other types of objects will be returned unprocessed.  Arrays
     * are expected to be indexed.  Use object notation for
     * associative arrays.
     * @method dump
     * @since 2.3.0
     * @param o {Object} The object to dump
     * @param d {int} How deep to recurse child objects, default 3
     * @return {String} the dump result
     */
    dump: function(o, d) {
        var i,len,s=[],OBJ="{...}",FUN="f(){...}",
            COMMA=', ', ARROW=' => ';

        // Cast non-objects to string
        // Skip dates because the std toString is what we want
        // Skip HTMLElement-like objects because trying to dump 
        // an element will cause an unhandled exception in FF 2.x
        if (!L.isObject(o)) {
            return o + "";
        } else if (o instanceof Date || ("nodeType" in o && "tagName" in o)) {
            return o;
        } else if  (L.isFunction(o)) {
            return FUN;
        }

        // dig into child objects the depth specifed. Default 3
        d = (L.isNumber(d)) ? d : 3;

        // arrays [1, 2, 3]
        if (L.isArray(o)) {
            s.push("[");
            for (i=0,len=o.length;i<len;i=i+1) {
                if (L.isObject(o[i])) {
                    s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                } else {
                    s.push(o[i]);
                }
                s.push(COMMA);
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("]");
        // objects {k1 => v1, k2 => v2}
        } else {
            s.push("{");
            for (i in o) {
                if (L.hasOwnProperty(o, i)) {
                    s.push(i + ARROW);
                    if (L.isObject(o[i])) {
                        s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                    } else {
                        s.push(o[i]);
                    }
                    s.push(COMMA);
                }
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("}");
        }

        return s.join("");
    },

    /**
     * Does variable substitution on a string. It scans through the string 
     * looking for expressions enclosed in { } braces. If an expression 
     * is found, it is used a key on the object.  If there is a space in
     * the key, the first word is used for the key and the rest is provided
     * to an optional function to be used to programatically determine the
     * value (the extra information might be used for this decision). If 
     * the value for the key in the object, or what is returned from the
     * function has a string value, number value, or object value, it is 
     * substituted for the bracket expression and it repeats.  If this
     * value is an object, it uses the Object's toString() if this has
     * been overridden, otherwise it does a shallow dump of the key/value
     * pairs.
     * @method substitute
     * @since 2.3.0
     * @param s {String} The string that will be modified.
     * @param o {Object} An object containing the replacement values
     * @param f {Function} An optional function that can be used to
     *                     process each match.  It receives the key,
     *                     value, and any extra metadata included with
     *                     the key inside of the braces.
     * @return {String} the substituted string
     */
    substitute: function (s, o, f) {
        var i, j, k, key, v, meta, saved=[], token, 
            DUMP='dump', SPACE=' ', LBRACE='{', RBRACE='}';


        for (;;) {
            i = s.lastIndexOf(LBRACE);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info 
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (L.isArray(v)) {
                    v = L.dump(v, parseInt(meta, 10));
                } else {
                    meta = meta || "";

                    // look for the keyword 'dump', if found force obj dump
                    var dump = meta.indexOf(DUMP);
                    if (dump > -1) {
                        meta = meta.substring(4);
                    }

                    // use the toString if it is not the Object toString 
                    // and the 'dump' meta info was not found
                    if (v.toString===Object.prototype.toString||dump>-1) {
                        v = L.dump(v, parseInt(meta, 10));
                    } else {
                        v = v.toString();
                    }
                }
            } else if (!L.isString(v) && !L.isNumber(v)) {
                // This {block} has no replace string. Save it for later.
                v = "~-" + saved.length + "-~";
                saved[saved.length] = token;

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);


        }

        // restore saved {block}s
        for (i=saved.length-1; i>=0; i=i-1) {
            s = s.replace(new RegExp("~-" + i + "-~"), "{"  + saved[i] + "}", "g");
        }

        return s;
    },


    /**
     * Returns a string without any leading or trailing whitespace.  If 
     * the input is not a string, the input will be returned untouched.
     * @method trim
     * @since 2.3.0
     * @param s {string} the string to trim
     * @return {string} the trimmed string
     */
    trim: function(s){
        try {
            return s.replace(/^\s+|\s+$/g, "");
        } catch(e) {
            return s;
        }
    },

    /**
     * Returns a new object containing all of the properties of
     * all the supplied objects.  The properties from later objects
     * will overwrite those in earlier objects.
     * @method merge
     * @since 2.3.0
     * @param arguments {Object*} the objects to merge
     * @return the new merged object
     */
    merge: function() {
        var o={}, a=arguments;
        for (var i=0, l=a.length; i<l; i=i+1) {
            L.augmentObject(o, a[i], true);
        }
        return o;
    },

    /**
     * Executes the supplied function in the context of the supplied 
     * object 'when' milliseconds later.  Executes the function a 
     * single time unless periodic is set to true.
     * @method later
     * @since 2.4.0
     * @param when {int} the number of milliseconds to wait until the fn 
     * is executed
     * @param o the context object
     * @param fn {Function|String} the function to execute or the name of 
     * the method in the 'o' object to execute
     * @param data [Array] data that is provided to the function.  This accepts
     * either a single item or an array.  If an array is provided, the
     * function is executed with one parameter for each array item.  If
     * you need to pass a single array parameter, it needs to be wrapped in
     * an array [myarray]
     * @param periodic {boolean} if true, executes continuously at supplied 
     * interval until canceled
     * @return a timer object. Call the cancel() method on this object to 
     * stop the timer.
     */
    later: function(when, o, fn, data, periodic) {
        when = when || 0; 
        o = o || {};
        var m=fn, d=data, f, r;

        if (L.isString(fn)) {
            m = o[fn];
        }

        if (!m) {
            throw new TypeError("method undefined");
        }

        if (!L.isArray(d)) {
            d = [data];
        }

        f = function() {
            m.apply(o, d);
        };

        r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

        return {
            interval: periodic,
            cancel: function() {
                if (this.interval) {
                    clearInterval(r);
                } else {
                    clearTimeout(r);
                }
            }
        };
    },
    
    /**
     * A convenience method for detecting a legitimate non-null value.
     * Returns false for null/undefined/NaN, true for other values, 
     * including 0/false/''
     * @method isValue
     * @since 2.3.0
     * @param o {any} the item to test
     * @return {boolean} true if it is not null/undefined/NaN || false
     */
    isValue: function(o) {
        // return (o || o === false || o === 0 || o === ''); // Infinity fails
return (L.isObject(o) || L.isString(o) || L.isNumber(o) || L.isBoolean(o));
    }

};

/**
 * Determines whether or not the property was added
 * to the object instance.  Returns false if the property is not present
 * in the object, or was inherited from the prototype.
 * This abstraction is provided to enable hasOwnProperty for Safari 1.3.x.
 * There is a discrepancy between YAHOO.lang.hasOwnProperty and
 * Object.prototype.hasOwnProperty when the property is a primitive added to
 * both the instance AND prototype with the same value:
 * <pre>
 * var A = function() {};
 * A.prototype.foo = 'foo';
 * var a = new A();
 * a.foo = 'foo';
 * alert(a.hasOwnProperty('foo')); // true
 * alert(YAHOO.lang.hasOwnProperty(a, 'foo')); // false when using fallback
 * </pre>
 * @method hasOwnProperty
 * @param {any} o The object being testing
 * @param prop {string} the name of the property to test
 * @return {boolean} the result
 */
L.hasOwnProperty = (Object.prototype.hasOwnProperty) ?
    function(o, prop) {
        return o && o.hasOwnProperty(prop);
    } : function(o, prop) {
        return !L.isUndefined(o[prop]) && 
                o.constructor.prototype[prop] !== o[prop];
    };

// new lang wins
OB.augmentObject(L, OB, true);

/*
 * An alias for <a href="YAHOO.lang.html">YAHOO.lang</a>
 * @class YAHOO.util.Lang
 */
YAHOO.util.Lang = L;
 
/**
 * Same as YAHOO.lang.augmentObject, except it only applies prototype 
 * properties.  This is an alias for augmentProto.
 * @see YAHOO.lang.augmentObject
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*|boolean}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver.  if true
 *        is specified as the third parameter, all properties will
 *        be applied and will overwrite an existing property in
 *        the receiver
 */
L.augment = L.augmentProto;

/**
 * An alias for <a href="YAHOO.lang.html#augment">YAHOO.lang.augment</a>
 * @for YAHOO
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver
 */
YAHOO.augment = L.augmentProto;
       
/**
 * An alias for <a href="YAHOO.lang.html#extend">YAHOO.lang.extend</a>
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *        subclass prototype.  These will override the
 *        matching items obtained from the superclass if present.
 */
YAHOO.extend = L.extend;

})();
YAHOO.register("yahoo", YAHOO, {version: "2.6.0", build: "1321"});
/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
/**
 * The dom module provides helper methods for manipulating Dom elements.
 * @module dom
 *
 */

(function() {
    var Y = YAHOO.util,     // internal shorthand
        lang = YAHOO.lang,
        getStyle,           // for load time browser branching
        setStyle,           // ditto
        propertyCache = {}, // for faster hyphen converts
        reClassNameCache = {},          // cache regexes for className
        document = window.document;     // cache for faster lookups
    
    YAHOO.env._id_counter = YAHOO.env._id_counter || 0;     // for use with generateId (global to save state if Dom is overwritten)

    // brower detection
    var isOpera = YAHOO.env.ua.opera,
        isSafari = YAHOO.env.ua.webkit, 
        isGecko = YAHOO.env.ua.gecko,
        isIE = YAHOO.env.ua.ie; 
    
    // regex cache
    var patterns = {
        HYPHEN: /(-[a-z])/i, // to normalize get/setStyle
        ROOT_TAG: /^body|html$/i, // body for quirks mode, html for standards,
        OP_SCROLL:/^(?:inline|table-row)$/i
    };

    var toCamel = function(property) {
        if ( !patterns.HYPHEN.test(property) ) {
            return property; // no hyphens
        }
        
        if (propertyCache[property]) { // already converted
            return propertyCache[property];
        }
       
        var converted = property;
 
        while( patterns.HYPHEN.exec(converted) ) {
            converted = converted.replace(RegExp.$1,
                    RegExp.$1.substr(1).toUpperCase());
        }
        
        propertyCache[property] = converted;
        return converted;
        //return property.replace(/-([a-z])/gi, function(m0, m1) {return m1.toUpperCase()}) // cant use function as 2nd arg yet due to safari bug
    };
    
    var getClassRegEx = function(className) {
        var re = reClassNameCache[className];
        if (!re) {
            re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
            reClassNameCache[className] = re;
        }
        return re;
    };

    // branching at load instead of runtime
    if (document.defaultView && document.defaultView.getComputedStyle) { // W3C DOM method
        getStyle = function(el, property) {
            var value = null;
            
            if (property == 'float') { // fix reserved word
                property = 'cssFloat';
            }

            var computed = el.ownerDocument.defaultView.getComputedStyle(el, '');
            if (computed) { // test computed before touching for safari
                value = computed[toCamel(property)];
            }
            
            return el.style[property] || value;
        };
    } else if (document.documentElement.currentStyle && isIE) { // IE method
        getStyle = function(el, property) {                         
            switch( toCamel(property) ) {
                case 'opacity' :// IE opacity uses filter
                    var val = 100;
                    try { // will error if no DXImageTransform
                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                    } catch(e) {
                        try { // make sure its in the document
                            val = el.filters('alpha').opacity;
                        } catch(e) {
                        }
                    }
                    return val / 100;
                case 'float': // fix reserved word
                    property = 'styleFloat'; // fall through
                default: 
                    // test currentStyle before touching
                    var value = el.currentStyle ? el.currentStyle[property] : null;
                    return ( el.style[property] || value );
            }
        };
    } else { // default to inline only
        getStyle = function(el, property) { return el.style[property]; };
    }
    
    if (isIE) {
        setStyle = function(el, property, val) {
            switch (property) {
                case 'opacity':
                    if ( lang.isString(el.style.filter) ) { // in case not appended
                        el.style.filter = 'alpha(opacity=' + val * 100 + ')';
                        
                        if (!el.currentStyle || !el.currentStyle.hasLayout) {
                            el.style.zoom = 1; // when no layout or cant tell
                        }
                    }
                    break;
                case 'float':
                    property = 'styleFloat';
                default:
                el.style[property] = val;
            }
        };
    } else {
        setStyle = function(el, property, val) {
            if (property == 'float') {
                property = 'cssFloat';
            }
            el.style[property] = val;
        };
    }

    var testElement = function(node, method) {
        return node && node.nodeType == 1 && ( !method || method(node) );
    };

    /**
     * Provides helper methods for DOM elements.
     * @namespace YAHOO.util
     * @class Dom
     */
    YAHOO.util.Dom = {
        /**
         * Returns an HTMLElement reference.
         * @method get
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID for getting a DOM reference, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {HTMLElement | Array} A DOM reference to an HTML element or an array of HTMLElements.
         */
        get: function(el) {
            if (el) {
                if (el.nodeType || el.item) { // Node, or NodeList
                    return el;
                }

                if (typeof el === 'string') { // id
                    return document.getElementById(el);
                }
                
                if ('length' in el) { // array-like 
                    var c = [];
                    for (var i = 0, len = el.length; i < len; ++i) {
                        c[c.length] = Y.Dom.get(el[i]);
                    }
                    
                    return c;
                }

                return el; // some other object, just pass it back
            }

            return null;
        },
    
        /**
         * Normalizes currentStyle and ComputedStyle.
         * @method getStyle
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property whose value is returned.
         * @return {String | Array} The current value of the style property for the element(s).
         */
        getStyle: function(el, property) {
            property = toCamel(property);
            
            var f = function(element) {
                return getStyle(element, property);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Wrapper for setting style properties of HTMLElements.  Normalizes "opacity" across modern browsers.
         * @method setStyle
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property to be set.
         * @param {String} val The value to apply to the given property.
         */
        setStyle: function(el, property, val) {
            property = toCamel(property);
            
            var f = function(element) {
                setStyle(element, property, val);
                
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Array} The XY position of the element(s)
         */
        getXY: function(el) {
            var f = function(el) {
                // has to be part of document to have pageXY
                if ( (el.parentNode === null || el.offsetParent === null ||
                        this.getStyle(el, 'display') == 'none') && el != el.ownerDocument.body) {
                    return false;
                }
                
                return getXY(el);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current X position of an element based on page coordinates.  The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The X position of the element(s)
         */
        getX: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[0];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current Y position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The Y position of the element(s)
         */
        getY: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[1];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the position of an html element in page coordinates, regardless of how the element is positioned.
         * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @param {Array} pos Contains X & Y values for new position (coordinates are page-based)
         * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
         */
        setXY: function(el, pos, noRetry) {
            var f = function(el) {
                var style_pos = this.getStyle(el, 'position');
                if (style_pos == 'static') { // default to relative
                    this.setStyle(el, 'position', 'relative');
                    style_pos = 'relative';
                }

                var pageXY = this.getXY(el);
                if (pageXY === false) { // has to be part of doc to have pageXY
                    return false; 
                }
                
                var delta = [ // assuming pixels; if not we will have to retry
                    parseInt( this.getStyle(el, 'left'), 10 ),
                    parseInt( this.getStyle(el, 'top'), 10 )
                ];
            
                if ( isNaN(delta[0]) ) {// in case of 'auto'
                    delta[0] = (style_pos == 'relative') ? 0 : el.offsetLeft;
                } 
                if ( isNaN(delta[1]) ) { // in case of 'auto'
                    delta[1] = (style_pos == 'relative') ? 0 : el.offsetTop;
                } 
        
                if (pos[0] !== null) { el.style.left = pos[0] - pageXY[0] + delta[0] + 'px'; }
                if (pos[1] !== null) { el.style.top = pos[1] - pageXY[1] + delta[1] + 'px'; }
              
                if (!noRetry) {
                    var newXY = this.getXY(el);

                    // if retry is true, try one more time if we miss 
                   if ( (pos[0] !== null && newXY[0] != pos[0]) || 
                        (pos[1] !== null && newXY[1] != pos[1]) ) {
                       this.setXY(el, pos, true);
                   }
                }        
        
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x The value to use as the X coordinate for the element(s).
         */
        setX: function(el, x) {
            Y.Dom.setXY(el, [x, null]);
        },
        
        /**
         * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x To use as the Y coordinate for the element(s).
         */
        setY: function(el, y) {
            Y.Dom.setXY(el, [null, y]);
        },
        
        /**
         * Returns the region position of the given element.
         * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
         * @method getRegion
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {Region | Array} A Region or array of Region instances containing "top, left, bottom, right" member data.
         */
        getRegion: function(el) {
            var f = function(el) {
                if ( (el.parentNode === null || el.offsetParent === null ||
                        this.getStyle(el, 'display') == 'none') && el != el.ownerDocument.body) {
                    return false;
                }

                var region = Y.Region.getRegion(el);
                return region;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns the width of the client (viewport).
         * @method getClientWidth
         * @deprecated Now using getViewportWidth.  This interface left intact for back compat.
         * @return {Int} The width of the viewable area of the page.
         */
        getClientWidth: function() {
            return Y.Dom.getViewportWidth();
        },
        
        /**
         * Returns the height of the client (viewport).
         * @method getClientHeight
         * @deprecated Now using getViewportHeight.  This interface left intact for back compat.
         * @return {Int} The height of the viewable area of the page.
         */
        getClientHeight: function() {
            return Y.Dom.getViewportHeight();
        },

        /**
         * Returns a array of HTMLElements with the given class.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsByClassName
         * @param {String} className The class name to match against
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @return {Array} An array of elements that have the given class name
         */
        getElementsByClassName: function(className, tag, root, apply) {
            className = lang.trim(className);
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 
            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag),
                re = getClassRegEx(className);

            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( re.test(elements[i].className) ) {
                    nodes[nodes.length] = elements[i];
                    if (apply) {
                        apply.call(elements[i], elements[i]);
                    }
                }
            }
            
            return nodes;
        },

        /**
         * Determines whether an HTMLElement has the given className.
         * @method hasClass
         * @param {String | HTMLElement | Array} el The element or collection to test
         * @param {String} className the class name to search for
         * @return {Boolean | Array} A boolean value or array of boolean values
         */
        hasClass: function(el, className) {
            var re = getClassRegEx(className);

            var f = function(el) {
                return re.test(el.className);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Adds a class name to a given element or collection of elements.
         * @method addClass         
         * @param {String | HTMLElement | Array} el The element or collection to add the class to
         * @param {String} className the class name to add to the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        addClass: function(el, className) {
            var f = function(el) {
                if (this.hasClass(el, className)) {
                    return false; // already present
                }
                
                
                el.className = lang.trim([el.className, className].join(' '));
                return true;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Removes a class name from a given element or collection of elements.
         * @method removeClass         
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} className the class name to remove from the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        removeClass: function(el, className) {
            var re = getClassRegEx(className);
            
            var f = function(el) {
                var ret = false,
                    current = el.className;

                if (className && current && this.hasClass(el, className)) {
                    
                    el.className = current.replace(re, ' ');
                    if ( this.hasClass(el, className) ) { // in case of multiple adjacent
                        this.removeClass(el, className);
                    }

                    el.className = lang.trim(el.className); // remove any trailing spaces
                    if (el.className === '') { // remove class attribute if empty
                        var attr = (el.hasAttribute) ? 'class' : 'className';
                        el.removeAttribute(attr);
                    }
                    ret = true;
                }                 
                return ret;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Replace a class with another class for a given element or collection of elements.
         * If no oldClassName is present, the newClassName is simply added.
         * @method replaceClass  
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} oldClassName the class name to be replaced
         * @param {String} newClassName the class name that will be replacing the old class name
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        replaceClass: function(el, oldClassName, newClassName) {
            if (!newClassName || oldClassName === newClassName) { // avoid infinite loop
                return false;
            }
            
            var re = getClassRegEx(oldClassName);

            var f = function(el) {
            
                if ( !this.hasClass(el, oldClassName) ) {
                    this.addClass(el, newClassName); // just add it if nothing to replace
                    return true; // NOTE: return
                }
            
                el.className = el.className.replace(re, ' ' + newClassName + ' ');

                if ( this.hasClass(el, oldClassName) ) { // in case of multiple adjacent
                    this.removeClass(el, oldClassName);
                }

                el.className = lang.trim(el.className); // remove any trailing spaces
                return true;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns an ID and applies it to the element "el", if provided.
         * @method generateId  
         * @param {String | HTMLElement | Array} el (optional) An optional element array of elements to add an ID to (no ID is added if one is already present).
         * @param {String} prefix (optional) an optional prefix to use (defaults to "yui-gen").
         * @return {String | Array} The generated ID, or array of generated IDs (or original ID if already present on an element)
         */
        generateId: function(el, prefix) {
            prefix = prefix || 'yui-gen';

            var f = function(el) {
                if (el && el.id) { // do not override existing ID
                    return el.id;
                } 

                var id = prefix + YAHOO.env._id_counter++;

                if (el) {
                    el.id = id;
                }
                
                return id;
            };

            // batch fails when no element, so just generate and return single ID
            return Y.Dom.batch(el, f, Y.Dom, true) || f.apply(Y.Dom, arguments);
        },
        
        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy.
         * @method isAncestor
         * @param {String | HTMLElement} haystack The possible ancestor
         * @param {String | HTMLElement} needle The possible descendent
         * @return {Boolean} Whether or not the haystack is an ancestor of needle
         */
        isAncestor: function(haystack, needle) {
            haystack = Y.Dom.get(haystack);
            needle = Y.Dom.get(needle);
            
            var ret = false;

            if ( (haystack && needle) && (haystack.nodeType && needle.nodeType) ) {
                if (haystack.contains && haystack !== needle) { // contains returns true when equal
                    ret = haystack.contains(needle);
                }
                else if (haystack.compareDocumentPosition) { // gecko
                    ret = !!(haystack.compareDocumentPosition(needle) & 16);
                }
            } else {
            }
            return ret;
        },
        
        /**
         * Determines whether an HTMLElement is present in the current document.
         * @method inDocument         
         * @param {String | HTMLElement} el The element to search for
         * @return {Boolean} Whether or not the element is present in the current document
         */
        inDocument: function(el) {
            return this.isAncestor(document.documentElement, el);
        },
        
        /**
         * Returns a array of HTMLElements that pass the test applied by supplied boolean method.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @return {Array} Array of HTMLElements
         */
        getElementsBy: function(method, tag, root, apply) {
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 

            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag);
            
            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( method(elements[i]) ) {
                    nodes[nodes.length] = elements[i];
                    if (apply) {
                        apply(elements[i]);
                    }
                }
            }

            
            return nodes;
        },
        
        /**
         * Runs the supplied method against each item in the Collection/Array.
         * The method is called with the element(s) as the first arg, and the optional param as the second ( method(el, o) ).
         * @method batch
         * @param {String | HTMLElement | Array} el (optional) An element or array of elements to apply the method to
         * @param {Function} method The method to apply to the element(s)
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} override (optional) Whether or not to override the scope of "method" with "o"
         * @return {Any | Array} The return value(s) from the supplied method
         */
        batch: function(el, method, o, override) {
            el = (el && (el.tagName || el.item)) ? el : Y.Dom.get(el); // skip get() when possible

            if (!el || !method) {
                return false;
            } 
            var scope = (override) ? o : window;
            
            if (el.tagName || el.length === undefined) { // element or not array-like 
                return method.call(scope, el, o);
            } 

            var collection = [];
            
            for (var i = 0, len = el.length; i < len; ++i) {
                collection[collection.length] = method.call(scope, el[i], o);
            }
            
            return collection;
        },
        
        /**
         * Returns the height of the document.
         * @method getDocumentHeight
         * @return {Int} The height of the actual document (which includes the body and its margin).
         */
        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != 'CSS1Compat') ? document.body.scrollHeight : document.documentElement.scrollHeight;

            var h = Math.max(scrollHeight, Y.Dom.getViewportHeight());
            return h;
        },
        
        /**
         * Returns the width of the document.
         * @method getDocumentWidth
         * @return {Int} The width of the actual document (which includes the body and its margin).
         */
        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != 'CSS1Compat') ? document.body.scrollWidth : document.documentElement.scrollWidth;
            var w = Math.max(scrollWidth, Y.Dom.getViewportWidth());
            return w;
        },

        /**
         * Returns the current height of the viewport.
         * @method getViewportHeight
         * @return {Int} The height of the viewable area of the page (excludes scrollbars).
         */
        getViewportHeight: function() {
            var height = self.innerHeight; // Safari, Opera
            var mode = document.compatMode;
        
            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                height = (mode == 'CSS1Compat') ?
                        document.documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
            }
        
            return height;
        },
        
        /**
         * Returns the current width of the viewport.
         * @method getViewportWidth
         * @return {Int} The width of the viewable area of the page (excludes scrollbars).
         */
        
        getViewportWidth: function() {
            var width = self.innerWidth;  // Safari
            var mode = document.compatMode;
            
            if (mode || isIE) { // IE, Gecko, Opera
                width = (mode == 'CSS1Compat') ?
                        document.documentElement.clientWidth : // Standards
                        document.body.clientWidth; // Quirks
            }
            return width;
        },

       /**
         * Returns the nearest ancestor that passes the test applied by supplied boolean method.
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * @method getAncestorBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @return {Object} HTMLElement or null if not found
         */
        getAncestorBy: function(node, method) {
            while ( (node = node.parentNode) ) { // NOTE: assignment
                if ( testElement(node, method) ) {
                    return node;
                }
            } 

            return null;
        },
        
        /**
         * Returns the nearest ancestor with the given className.
         * @method getAncestorByClassName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} className
         * @return {Object} HTMLElement
         */
        getAncestorByClassName: function(node, className) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) { return Y.Dom.hasClass(el, className); };
            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the nearest ancestor with the given tagName.
         * @method getAncestorByTagName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} tagName
         * @return {Object} HTMLElement
         */
        getAncestorByTagName: function(node, tagName) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) {
                 return el.tagName && el.tagName.toUpperCase() == tagName.toUpperCase();
            };

            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the previous sibling that is an HTMLElement. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getPreviousSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSiblingBy: function(node, method) {
            while (node) {
                node = node.previousSibling;
                if ( testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the previous sibling that is an HTMLElement 
         * @method getPreviousSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getPreviousSiblingBy(node);
        }, 

        /**
         * Returns the next HTMLElement sibling that passes the boolean method. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getNextSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getNextSiblingBy: function(node, method) {
            while (node) {
                node = node.nextSibling;
                if ( testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the next sibling that is an HTMLElement 
         * @method getNextSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getNextSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getNextSiblingBy(node);
        }, 

        /**
         * Returns the first HTMLElement child that passes the test method. 
         * @method getFirstChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChildBy: function(node, method) {
            var child = ( testElement(node.firstChild, method) ) ? node.firstChild : null;
            return child || Y.Dom.getNextSiblingBy(node.firstChild, method);
        }, 

        /**
         * Returns the first HTMLElement child. 
         * @method getFirstChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChild: function(node, method) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            return Y.Dom.getFirstChildBy(node);
        }, 

        /**
         * Returns the last HTMLElement child that passes the test method. 
         * @method getLastChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getLastChildBy: function(node, method) {
            if (!node) {
                return null;
            }
            var child = ( testElement(node.lastChild, method) ) ? node.lastChild : null;
            return child || Y.Dom.getPreviousSiblingBy(node.lastChild, method);
        }, 

        /**
         * Returns the last HTMLElement child. 
         * @method getLastChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getLastChild: function(node) {
            node = Y.Dom.get(node);
            return Y.Dom.getLastChildBy(node);
        }, 

        /**
         * Returns an array of HTMLElement childNodes that pass the test method. 
         * @method getChildrenBy
         * @param {HTMLElement} node The HTMLElement to start from
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Array} A static array of HTMLElements
         */
        getChildrenBy: function(node, method) {
            var child = Y.Dom.getFirstChildBy(node, method);
            var children = child ? [child] : [];

            Y.Dom.getNextSiblingBy(child, function(node) {
                if ( !method || method(node) ) {
                    children[children.length] = node;
                }
                return false; // fail test to collect all children
            });

            return children;
        },
 
        /**
         * Returns an array of HTMLElement childNodes. 
         * @method getChildren
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Array} A static array of HTMLElements
         */
        getChildren: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
            }

            return Y.Dom.getChildrenBy(node);
        },
 
        /**
         * Returns the left scroll value of the document 
         * @method getDocumentScrollLeft
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the left
         */
        getDocumentScrollLeft: function(doc) {
            doc = doc || document;
            return Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
        }, 

        /**
         * Returns the top scroll value of the document 
         * @method getDocumentScrollTop
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the top
         */
        getDocumentScrollTop: function(doc) {
            doc = doc || document;
            return Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
        },

        /**
         * Inserts the new node as the previous sibling of the reference node 
         * @method insertBefore
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node before 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertBefore: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode.parentNode) {
                return null;
            }       

            return referenceNode.parentNode.insertBefore(newNode, referenceNode); 
        },

        /**
         * Inserts the new node as the next sibling of the reference node 
         * @method insertAfter
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node after 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertAfter: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode.parentNode) {
                return null;
            }       

            if (referenceNode.nextSibling) {
                return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling); 
            } else {
                return referenceNode.parentNode.appendChild(newNode);
            }
        },

        /**
         * Creates a Region based on the viewport relative to the document. 
         * @method getClientRegion
         * @return {Region} A Region object representing the viewport which accounts for document scroll
         */
        getClientRegion: function() {
            var t = Y.Dom.getDocumentScrollTop(),
                l = Y.Dom.getDocumentScrollLeft(),
                r = Y.Dom.getViewportWidth() + l,
                b = Y.Dom.getViewportHeight() + t;

            return new Y.Region(t, r, b, l);
        }
    };
    
    var getXY = function() {
        if (document.documentElement.getBoundingClientRect) { // IE
            return function(el) {
                var box = el.getBoundingClientRect(),
                    round = Math.round;

                var rootNode = el.ownerDocument;
                return [round(box.left + Y.Dom.getDocumentScrollLeft(rootNode)), round(box.top +
                        Y.Dom.getDocumentScrollTop(rootNode))];
            };
        } else {
            return function(el) { // manually calculate by crawling up offsetParents
                var pos = [el.offsetLeft, el.offsetTop];
                var parentNode = el.offsetParent;

                // safari: subtract body offsets if el is abs (or any offsetParent), unless body is offsetParent
                var accountForBody = (isSafari &&
                        Y.Dom.getStyle(el, 'position') == 'absolute' &&
                        el.offsetParent == el.ownerDocument.body);

                if (parentNode != el) {
                    while (parentNode) {
                        pos[0] += parentNode.offsetLeft;
                        pos[1] += parentNode.offsetTop;
                        if (!accountForBody && isSafari && 
                                Y.Dom.getStyle(parentNode,'position') == 'absolute' ) { 
                            accountForBody = true;
                        }
                        parentNode = parentNode.offsetParent;
                    }
                }

                if (accountForBody) { //safari doubles in this case
                    pos[0] -= el.ownerDocument.body.offsetLeft;
                    pos[1] -= el.ownerDocument.body.offsetTop;
                } 
                parentNode = el.parentNode;

                // account for any scrolled ancestors
                while ( parentNode.tagName && !patterns.ROOT_TAG.test(parentNode.tagName) ) 
                {
                    if (parentNode.scrollTop || parentNode.scrollLeft) {
                        pos[0] -= parentNode.scrollLeft;
                        pos[1] -= parentNode.scrollTop;
                    }
                    
                    parentNode = parentNode.parentNode; 
                }

                return pos;
            };
        }
    }() // NOTE: Executing for loadtime branching
})();
/**
 * A region is a representation of an object on a grid.  It is defined
 * by the top, right, bottom, left extents, so is rectangular by default.  If 
 * other shapes are required, this class could be extended to support it.
 * @namespace YAHOO.util
 * @class Region
 * @param {Int} t the top extent
 * @param {Int} r the right extent
 * @param {Int} b the bottom extent
 * @param {Int} l the left extent
 * @constructor
 */
YAHOO.util.Region = function(t, r, b, l) {

    /**
     * The region's top extent
     * @property top
     * @type Int
     */
    this.top = t;
    
    /**
     * The region's top extent as index, for symmetry with set/getXY
     * @property 1
     * @type Int
     */
    this[1] = t;

    /**
     * The region's right extent
     * @property right
     * @type int
     */
    this.right = r;

    /**
     * The region's bottom extent
     * @property bottom
     * @type Int
     */
    this.bottom = b;

    /**
     * The region's left extent
     * @property left
     * @type Int
     */
    this.left = l;
    
    /**
     * The region's left extent as index, for symmetry with set/getXY
     * @property 0
     * @type Int
     */
    this[0] = l;
};

/**
 * Returns true if this region contains the region passed in
 * @method contains
 * @param  {Region}  region The region to evaluate
 * @return {Boolean}        True if the region is contained with this region, 
 *                          else false
 */
YAHOO.util.Region.prototype.contains = function(region) {
    return ( region.left   >= this.left   && 
             region.right  <= this.right  && 
             region.top    >= this.top    && 
             region.bottom <= this.bottom    );

};

/**
 * Returns the area of the region
 * @method getArea
 * @return {Int} the region's area
 */
YAHOO.util.Region.prototype.getArea = function() {
    return ( (this.bottom - this.top) * (this.right - this.left) );
};

/**
 * Returns the region where the passed in region overlaps with this one
 * @method intersect
 * @param  {Region} region The region that intersects
 * @return {Region}        The overlap region, or null if there is no overlap
 */
YAHOO.util.Region.prototype.intersect = function(region) {
    var t = Math.max( this.top,    region.top    );
    var r = Math.min( this.right,  region.right  );
    var b = Math.min( this.bottom, region.bottom );
    var l = Math.max( this.left,   region.left   );
    
    if (b >= t && r >= l) {
        return new YAHOO.util.Region(t, r, b, l);
    } else {
        return null;
    }
};

/**
 * Returns the region representing the smallest region that can contain both
 * the passed in region and this region.
 * @method union
 * @param  {Region} region The region that to create the union with
 * @return {Region}        The union region
 */
YAHOO.util.Region.prototype.union = function(region) {
    var t = Math.min( this.top,    region.top    );
    var r = Math.max( this.right,  region.right  );
    var b = Math.max( this.bottom, region.bottom );
    var l = Math.min( this.left,   region.left   );

    return new YAHOO.util.Region(t, r, b, l);
};

/**
 * toString
 * @method toString
 * @return string the region properties
 */
YAHOO.util.Region.prototype.toString = function() {
    return ( "Region {"    +
             "top: "       + this.top    + 
             ", right: "   + this.right  + 
             ", bottom: "  + this.bottom + 
             ", left: "    + this.left   + 
             "}" );
};

/**
 * Returns a region that is occupied by the DOM element
 * @method getRegion
 * @param  {HTMLElement} el The element
 * @return {Region}         The region that the element occupies
 * @static
 */
YAHOO.util.Region.getRegion = function(el) {
    var p = YAHOO.util.Dom.getXY(el);

    var t = p[1];
    var r = p[0] + el.offsetWidth;
    var b = p[1] + el.offsetHeight;
    var l = p[0];

    return new YAHOO.util.Region(t, r, b, l);
};

/////////////////////////////////////////////////////////////////////////////


/**
 * A point is a region that is special in that it represents a single point on 
 * the grid.
 * @namespace YAHOO.util
 * @class Point
 * @param {Int} x The X position of the point
 * @param {Int} y The Y position of the point
 * @constructor
 * @extends YAHOO.util.Region
 */
YAHOO.util.Point = function(x, y) {
   if (YAHOO.lang.isArray(x)) { // accept input from Dom.getXY, Event.getXY, etc.
      y = x[1]; // dont blow away x yet
      x = x[0];
   }
   
    /**
     * The X position of the point, which is also the right, left and index zero (for Dom.getXY symmetry)
     * @property x
     * @type Int
     */

    this.x = this.right = this.left = this[0] = x;
     
    /**
     * The Y position of the point, which is also the top, bottom and index one (for Dom.getXY symmetry)
     * @property y
     * @type Int
     */
    this.y = this.top = this.bottom = this[1] = y;
};

YAHOO.util.Point.prototype = new YAHOO.util.Region();

YAHOO.register("dom", YAHOO.util.Dom, {version: "2.6.0", build: "1321"});

/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String}  type The type of event, which is passed to the callback
 *                  when the event fires
 * @param {Object}  oScope The context the event will fire from.  "this" will
 *                  refer to this object in the callback.  Default value: 
 *                  the window object.  The listener can override this.
 * @param {boolean} silent pass true to prevent the event from writing to
 *                  the debugsystem
 * @param {int}     signature the signature that the custom event subscriber
 *                  will receive. YAHOO.util.CustomEvent.LIST or 
 *                  YAHOO.util.CustomEvent.FLAT.  The default is
 *                  YAHOO.util.CustomEvent.LIST.
 * @namespace YAHOO.util
 * @class CustomEvent
 * @constructor
 */
YAHOO.util.CustomEvent = function(type, oScope, silent, signature) {

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The scope the the event will fire from by default.  Defaults to the window 
     * obj
     * @property scope
     * @type object
     */
    this.scope = oScope || window;

    /**
     * By default all custom events are logged in the debug build, set silent
     * to true to disable debug outpu for this event.
     * @property silent
     * @type boolean
     */
    this.silent = silent;

    /**
     * Custom events support two styles of arguments provided to the event
     * subscribers.  
     * <ul>
     * <li>YAHOO.util.CustomEvent.LIST: 
     *   <ul>
     *   <li>param1: event name</li>
     *   <li>param2: array of arguments sent to fire</li>
     *   <li>param3: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * <li>YAHOO.util.CustomEvent.FLAT
     *   <ul>
     *   <li>param1: the first argument passed to fire.  If you need to
     *           pass multiple parameters, use and array or object literal</li>
     *   <li>param2: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * </ul>
     *   @property signature
     *   @type int
     */
    this.signature = signature || YAHOO.util.CustomEvent.LIST;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber[]
     */
    this.subscribers = [];

    if (!this.silent) {
    }

    var onsubscribeType = "_YUICEOnSubscribe";

    // Only add subscribe events for events that are not generated by 
    // CustomEvent
    if (type !== onsubscribeType) {

        /**
         * Custom events provide a custom event that fires whenever there is
         * a new subscriber to the event.  This provides an opportunity to
         * handle the case where there is a non-repeating event that has
         * already fired has a new subscriber.  
         *
         * @event subscribeEvent
         * @type YAHOO.util.CustomEvent
         * @param {Function} fn The function to execute
         * @param {Object}   obj An object to be passed along when the event 
         *                       fires
         * @param {boolean|Object}  override If true, the obj passed in becomes 
         *                                   the execution scope of the listener.
         *                                   if an object, that object becomes the
         *                                   the execution scope.
         */
        this.subscribeEvent = 
                new YAHOO.util.CustomEvent(onsubscribeType, this, true);

    } 


    /**
     * In order to make it possible to execute the rest of the subscriber
     * stack when one thows an exception, the subscribers exceptions are
     * caught.  The most recent exception is stored in this property
     * @property lastError
     * @type Error
     */
    this.lastError = null;
};

/**
 * Subscriber listener sigature constant.  The LIST type returns three
 * parameters: the event type, the array of args passed to fire, and
 * the optional custom object
 * @property YAHOO.util.CustomEvent.LIST
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.LIST = 0;

/**
 * Subscriber listener sigature constant.  The FLAT type returns two
 * parameters: the first argument passed to fire and the optional 
 * custom object
 * @property YAHOO.util.CustomEvent.FLAT
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.FLAT = 1;

YAHOO.util.CustomEvent.prototype = {

    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {Object}   obj       An object to be passed along when the event 
     *                             fires
     * @param {boolean|Object}  override If true, the obj passed in becomes 
     *                                   the execution scope of the listener.
     *                                   if an object, that object becomes the
     *                                   the execution scope.
     */
    subscribe: function(fn, obj, override) {

        if (!fn) {
throw new Error("Invalid callback for subscriber to '" + this.type + "'");
        }

        if (this.subscribeEvent) {
            this.subscribeEvent.fire(fn, obj, override);
        }

        this.subscribers.push( new YAHOO.util.Subscriber(fn, obj, override) );
    },

    /**
     * Unsubscribes subscribers.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed
     * @param {Object}   obj  The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} True if the subscriber was found and detached.
     */
    unsubscribe: function(fn, obj) {

        if (!fn) {
            return this.unsubscribeAll();
        }

        var found = false;
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            var s = this.subscribers[i];
            if (s && s.contains(fn, obj)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fire 
     * @param {Object*} arguments an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false, 
     *                   true otherwise
     */
    fire: function() {

        this.lastError = null;

        var errors = [],
            len=this.subscribers.length;

        if (!len && this.silent) {
            return true;
        }

        var args=[].slice.call(arguments, 0), ret=true, i, rebuild=false;

        if (!this.silent) {
        }

        // make a copy of the subscribers so that there are
        // no index problems if one subscriber removes another.
        var subs = this.subscribers.slice(), throwErrors = YAHOO.util.Event.throwErrors;

        for (i=0; i<len; ++i) {
            var s = subs[i];
            if (!s) {
                rebuild=true;
            } else {
                if (!this.silent) {
                }

                var scope = s.getScope(this.scope);

                if (this.signature == YAHOO.util.CustomEvent.FLAT) {
                    var param = null;
                    if (args.length > 0) {
                        param = args[0];
                    }

                    try {
                        ret = s.fn.call(scope, param, s.obj);
                    } catch(e) {
                        this.lastError = e;
                        // errors.push(e);
                        if (throwErrors) {
                            throw e;
                        }
                    }
                } else {
                    try {
                        ret = s.fn.call(scope, this.type, args, s.obj);
                    } catch(ex) {
                        this.lastError = ex;
                        if (throwErrors) {
                            throw ex;
                        }
                    }
                }

                if (false === ret) {
                    if (!this.silent) {
                    }

                    break;
                    // return false;
                }
            }
        }

        return (ret !== false);
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {int} The number of listeners unsubscribed
     */
    unsubscribeAll: function() {
        for (var i=this.subscribers.length-1; i>-1; i--) {
            this._delete(i);
        }

        this.subscribers=[];

        return i;
    },

    /**
     * @method _delete
     * @private
     */
    _delete: function(index) {
        var s = this.subscribers[index];
        if (s) {
            delete s.fn;
            delete s.obj;
        }

        // this.subscribers[index]=null;
        this.subscribers.splice(index, 1);
    },

    /**
     * @method toString
     */
    toString: function() {
         return "CustomEvent: " + "'" + this.type  + "', " + 
             "scope: " + this.scope;

    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The function to execute
 * @param {Object}   obj      An object to be passed along when the event fires
 * @param {boolean}  override If true, the obj passed in becomes the execution
 *                            scope of the listener
 * @class Subscriber
 * @constructor
 */
YAHOO.util.Subscriber = function(fn, obj, override) {

    /**
     * The callback that will be execute when the event fires
     * @property fn
     * @type function
     */
    this.fn = fn;

    /**
     * An optional custom object that will passed to the callback when
     * the event fires
     * @property obj
     * @type object
     */
    this.obj = YAHOO.lang.isUndefined(obj) ? null : obj;

    /**
     * The default execution scope for the event listener is defined when the
     * event is created (usually the object which contains the event).
     * By setting override to true, the execution scope becomes the custom
     * object passed in by the subscriber.  If override is an object, that 
     * object becomes the scope.
     * @property override
     * @type boolean|object
     */
    this.override = override;

};

/**
 * Returns the execution scope for this listener.  If override was set to true
 * the custom obj will be the scope.  If override is an object, that is the
 * scope, otherwise the default scope will be used.
 * @method getScope
 * @param {Object} defaultScope the scope to use if this listener does not
 *                              override it.
 */
YAHOO.util.Subscriber.prototype.getScope = function(defaultScope) {
    if (this.override) {
        if (this.override === true) {
            return this.obj;
        } else {
            return this.override;
        }
    }
    return defaultScope;
};

/**
 * Returns true if the fn and obj match this objects properties.
 * Used by the unsubscribe method to match the right subscriber.
 *
 * @method contains
 * @param {Function} fn the function to execute
 * @param {Object} obj an object to be passed along when the event fires
 * @return {boolean} true if the supplied arguments match this 
 *                   subscriber's signature.
 */
YAHOO.util.Subscriber.prototype.contains = function(fn, obj) {
    if (obj) {
        return (this.fn == fn && this.obj == obj);
    } else {
        return (this.fn == fn);
    }
};

/**
 * @method toString
 */
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + this.obj  + 
           ", override: " +  (this.override || "no") + " }";
};

/**
 * The Event Utility provides utilities for managing DOM Events and tools
 * for building event systems
 *
 * @module event
 * @title Event Utility
 * @namespace YAHOO.util
 * @requires yahoo
 */

// The first instance of Event will win if it is loaded more than once.
// @TODO this needs to be changed so that only the state data that needs to
// be preserved is kept, while methods are overwritten/added as needed.
// This means that the module pattern can't be used.
if (!YAHOO.util.Event) {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */
    YAHOO.util.Event = function() {

        /**
         * True after the onload event has fired
         * @property loadComplete
         * @type boolean
         * @static
         * @private
         */
        var loadComplete =  false;

        /**
         * Cache of wrapped listeners
         * @property listeners
         * @type array
         * @static
         * @private
         */
        var listeners = [];

        /**
         * User-defined unload function that will be fired before all events
         * are detached
         * @property unloadListeners
         * @type array
         * @static
         * @private
         */
        var unloadListeners = [];

        /**
         * Cache of DOM0 event handlers to work around issues with DOM2 events
         * in Safari
         * @property legacyEvents
         * @static
         * @private
         */
        var legacyEvents = [];

        /**
         * Listener stack for DOM0 events
         * @property legacyHandlers
         * @static
         * @private
         */
        var legacyHandlers = [];

        /**
         * The number of times to poll after window.onload.  This number is
         * increased if additional late-bound handlers are requested after
         * the page load.
         * @property retryCount
         * @static
         * @private
         */
        var retryCount = 0;

        /**
         * onAvailable listeners
         * @property onAvailStack
         * @static
         * @private
         */
        var onAvailStack = [];

        /**
         * Lookup table for legacy events
         * @property legacyMap
         * @static
         * @private
         */
        var legacyMap = [];

        /**
         * Counter for auto id generation
         * @property counter
         * @static
         * @private
         */
        var counter = 0;
        
        /**
         * Normalized keycodes for webkit/safari
         * @property webkitKeymap
         * @type {int: int}
         * @private
         * @static
         * @final
         */
        var webkitKeymap = {
            63232: 38, // up
            63233: 40, // down
            63234: 37, // left
            63235: 39, // right
            63276: 33, // page up
            63277: 34, // page down
            25: 9      // SHIFT-TAB (Safari provides a different key code in
                       // this case, even though the shiftKey modifier is set)
        };
        
        // String constants used by the addFocusListener and removeFocusListener methods
        var _FOCUS = YAHOO.env.ua.ie ? "focusin" : "focus";
        var _BLUR = YAHOO.env.ua.ie ? "focusout" : "blur";      

        return {

            /**
             * The number of times we should look for elements that are not
             * in the DOM at the time the event is requested after the document
             * has been loaded.  The default is 2000@amp;20 ms, so it will poll
             * for 40 seconds or until all outstanding handlers are bound
             * (whichever comes first).
             * @property POLL_RETRYS
             * @type int
             * @static
             * @final
             */
            POLL_RETRYS: 2000,

            /**
             * The poll interval in milliseconds
             * @property POLL_INTERVAL
             * @type int
             * @static
             * @final
             */
            POLL_INTERVAL: 20,

            /**
             * Element to bind, int constant
             * @property EL
             * @type int
             * @static
             * @final
             */
            EL: 0,

            /**
             * Type of event, int constant
             * @property TYPE
             * @type int
             * @static
             * @final
             */
            TYPE: 1,

            /**
             * Function to execute, int constant
             * @property FN
             * @type int
             * @static
             * @final
             */
            FN: 2,

            /**
             * Function wrapped for scope correction and cleanup, int constant
             * @property WFN
             * @type int
             * @static
             * @final
             */
            WFN: 3,

            /**
             * Object passed in by the user that will be returned as a 
             * parameter to the callback, int constant.  Specific to
             * unload listeners
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            UNLOAD_OBJ: 3,

            /**
             * Adjusted scope, either the element we are registering the event
             * on or the custom object passed in by the listener, int constant
             * @property ADJ_SCOPE
             * @type int
             * @static
             * @final
             */
            ADJ_SCOPE: 4,

            /**
             * The original obj passed into addListener
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            OBJ: 5,

            /**
             * The original scope parameter passed into addListener
             * @property OVERRIDE
             * @type int
             * @static
             * @final
             */
            OVERRIDE: 6,

            /**
             * The original capture parameter passed into _addListener
             * @property CAPTURE
             * @type int
             * @static
             * @final
             */
            CAPTURE: 7,


            /**
             * addListener/removeListener can throw errors in unexpected scenarios.
             * These errors are suppressed, the method returns false, and this property
             * is set
             * @property lastError
             * @static
             * @type Error
             */
            lastError: null,

            /**
             * Safari detection
             * @property isSafari
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            isSafari: YAHOO.env.ua.webkit,
            
            /**
             * webkit version
             * @property webkit
             * @type string
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            webkit: YAHOO.env.ua.webkit,
            
            /**
             * IE detection 
             * @property isIE
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.ie
             */
            isIE: YAHOO.env.ua.ie,

            /**
             * poll handle
             * @property _interval
             * @static
             * @private
             */
            _interval: null,

            /**
             * document readystate poll handle
             * @property _dri
             * @static
             * @private
             */
             _dri: null,

            /**
             * True when the document is initially usable
             * @property DOMReady
             * @type boolean
             * @static
             */
            DOMReady: false,

            /**
             * Errors thrown by subscribers of custom events are caught
             * and the error message is written to the debug console.  If
             * this property is set to true, it will also re-throw the
             * error.
             * @property throwErrors
             * @type boolean
             * @default false
             */
            throwErrors: false,

            /**
             * @method startInterval
             * @static
             * @private
             */
            startInterval: function() {
                if (!this._interval) {
                    var self = this;
                    var callback = function() { self._tryPreloadAttach(); };
                    this._interval = setInterval(callback, this.POLL_INTERVAL);
                }
            },

            /**
             * Executes the supplied callback when the item with the supplied
             * id is found.  This is meant to be used to execute behavior as
             * soon as possible as the page loads.  If you use this after the
             * initial page load it will poll for a fixed time for the element.
             * The number of times it will poll and the frequency are
             * configurable.  By default it will poll for 10 seconds.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onAvailable
             *
             * @param {string||string[]}   p_id the id of the element, or an array
             * of ids to look for.
             * @param {function} p_fn what to execute when the element is found.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean|object}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj, if set to an object it
             *                   will execute in the scope of that object
             * @param checkContent {boolean} check child node readiness (onContentReady)
             * @static
             */
            onAvailable: function(p_id, p_fn, p_obj, p_override, checkContent) {

                var a = (YAHOO.lang.isString(p_id)) ? [p_id] : p_id;

                for (var i=0; i<a.length; i=i+1) {
                    onAvailStack.push({id:         a[i], 
                                       fn:         p_fn, 
                                       obj:        p_obj, 
                                       override:   p_override, 
                                       checkReady: checkContent });
                }

                retryCount = this.POLL_RETRYS;

                this.startInterval();
            },

            /**
             * Works the same way as onAvailable, but additionally checks the
             * state of sibling elements to determine if the content of the
             * available element is safe to modify.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onContentReady
             *
             * @param {string}   p_id the id of the element to look for.
             * @param {function} p_fn what to execute when the element is ready.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean|object}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj.  If an object, p_fn will
             *                   exectute in the scope of that object
             *
             * @static
             */
            onContentReady: function(p_id, p_fn, p_obj, p_override) {
                this.onAvailable(p_id, p_fn, p_obj, p_override, true);
            },

            /**
             * Executes the supplied callback when the DOM is first usable.  This
             * will execute immediately if called after the DOMReady event has
             * fired.   @todo the DOMContentReady event does not fire when the
             * script is dynamically injected into the page.  This means the
             * DOMReady custom event will never fire in FireFox or Opera when the
             * library is injected.  It _will_ fire in Safari, and the IE 
             * implementation would allow for us to fire it if the defered script
             * is not available.  We want this to behave the same in all browsers.
             * Is there a way to identify when the script has been injected 
             * instead of included inline?  Is there a way to know whether the 
             * window onload event has fired without having had a listener attached 
             * to it when it did so?
             *
             * <p>The callback is a CustomEvent, so the signature is:</p>
             * <p>type &lt;string&gt;, args &lt;array&gt;, customobject &lt;object&gt;</p>
             * <p>For DOMReady events, there are no fire argments, so the
             * signature is:</p>
             * <p>"DOMReady", [], obj</p>
             *
             *
             * @method onDOMReady
             *
             * @param {function} p_fn what to execute when the element is found.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean|object}  p_scope If set to true, p_fn will execute
             *                   in the scope of p_obj, if set to an object it
             *                   will execute in the scope of that object
             *
             * @static
             */
            onDOMReady: function(p_fn, p_obj, p_override) {
                if (this.DOMReady) {
                    setTimeout(function() {
                        var s = window;
                        if (p_override) {
                            if (p_override === true) {
                                s = p_obj;
                            } else {
                                s = p_override;
                            }
                        }
                        p_fn.call(s, "DOMReady", [], p_obj);
                    }, 0);
                } else {
                    this.DOMReadyEvent.subscribe(p_fn, p_obj, p_override);
                }
            },


            /**
             * Appends an event handler
             *
             * @method _addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener. If an
             *                             object, this object becomes the execution
             *                             scope.
             * @param {boolen}      capture capture or bubble phase
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @private
             * @static
             */
            _addListener: function(el, sType, fn, obj, override, capture) {

                if (!fn || !fn.call) {
                    return false;
                }

                // The el argument can be an array of elements or element ids.
                if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (var i=0,len=el.length; i<len; ++i) {
                        ok = this._addListener(el[i], 
                                       sType, 
                                       fn, 
                                       obj, 
                                       override, 
                                       capture) && ok;
                    }
                    return ok;

                } else if (YAHOO.lang.isString(el)) {
                    var oEl = this.getEl(el);
                    // If the el argument is a string, we assume it is 
                    // actually the id of the element.  If the page is loaded
                    // we convert el to the actual element, otherwise we 
                    // defer attaching the event until onload event fires

                    // check to see if we need to delay hooking up the event 
                    // until after the page loads.
                    if (oEl) {
                        el = oEl;
                    } else {
                        // defer adding the event until the element is available
                        this.onAvailable(el, function() {
                           YAHOO.util.Event._addListener(el, sType, fn, obj, override, capture);
                        });

                        return true;
                    }
                }

                // Element should be an html element or an array if we get 
                // here.
                if (!el) {
                    return false;
                }

                // we need to make sure we fire registered unload events 
                // prior to automatically unhooking them.  So we hang on to 
                // these instead of attaching them to the window and fire the
                // handles explicitly during our one unload event.
                if ("unload" == sType && obj !== this) {
                    unloadListeners[unloadListeners.length] =
                            [el, sType, fn, obj, override, capture];
                    return true;
                }


                // if the user chooses to override the scope, we use the custom
                // object passed in, otherwise the executing scope will be the
                // HTML element that the event is registered on
                var scope = el;
                if (override) {
                    if (override === true) {
                        scope = obj;
                    } else {
                        scope = override;
                    }
                }

                // wrap the function so we can return the obj object when
                // the event fires;
                var wrappedFn = function(e) {
                        return fn.call(scope, YAHOO.util.Event.getEvent(e, el), 
                                obj);
                    };

                var li = [el, sType, fn, wrappedFn, scope, obj, override, capture];
                var index = listeners.length;
                // cache the listener so we can try to automatically unload
                listeners[index] = li;

                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);

                    // Add a new dom0 wrapper if one is not detected for this
                    // element
                    if ( legacyIndex == -1 || 
                                el != legacyEvents[legacyIndex][0] ) {

                        legacyIndex = legacyEvents.length;
                        legacyMap[el.id + sType] = legacyIndex;

                        // cache the signature for the DOM0 event, and 
                        // include the existing handler for the event, if any
                        legacyEvents[legacyIndex] = 
                            [el, sType, el["on" + sType]];
                        legacyHandlers[legacyIndex] = [];

                        el["on" + sType] = 
                            function(e) {
                                YAHOO.util.Event.fireLegacyEvent(
                                    YAHOO.util.Event.getEvent(e), legacyIndex);
                            };
                    }

                    // add a reference to the wrapped listener to our custom
                    // stack of events
                    //legacyHandlers[legacyIndex].push(index);
                    legacyHandlers[legacyIndex].push(li);

                } else {
                    try {
                        this._simpleAdd(el, sType, wrappedFn, capture);
                    } catch(ex) {
                        // handle an error trying to attach an event.  If it fails
                        // we need to clean up the cache
                        this.lastError = ex;
                        this._removeListener(el, sType, fn, capture);
                        return false;
                    }
                }

                return true;
                
            },


            /**
             * Appends an event handler
             *
             * @method addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener. If an
             *                             object, this object becomes the execution
             *                             scope.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addListener: function (el, sType, fn, obj, override) {
                return this._addListener(el, sType, fn, obj, override, false);
            },

            /**
             * Appends a focus event handler.  (The focusin event is used for Internet Explorer, 
             * the focus, capture-event for Opera, WebKit, and Gecko.)
             *
             * @method addFocusListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener. If an
             *                             object, this object becomes the execution
             *                             scope.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addFocusListener: function (el, fn, obj, override) {
                return this._addListener(el, _FOCUS, fn, obj, override, true);
            },          


            /**
             * Removes a focus event listener
             *
             * @method removeFocusListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeFocusListener: function (el, fn) { 
                return this._removeListener(el, _FOCUS, fn, true);
            },

            /**
             * Appends a blur event handler.  (The focusout event is used for Internet Explorer, 
             * the focusout, capture-event for Opera, WebKit, and Gecko.)
             *
             * @method addBlurListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener. If an
             *                             object, this object becomes the execution
             *                             scope.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addBlurListener: function (el, fn, obj, override) {
                return this._addListener(el, _BLUR, fn, obj, override, true);
            },          

            /**
             * Removes a blur event listener
             *
             * @method removeBlurListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeBlurListener: function (el, fn) { 
            
                return this._removeListener(el, _BLUR, fn, true);
            
            },

            /**
             * When using legacy events, the handler is routed to this object
             * so we can fire our custom listener stack.
             * @method fireLegacyEvent
             * @static
             * @private
             */
            fireLegacyEvent: function(e, legacyIndex) {
                var ok=true, le, lh, li, scope, ret;
                
                lh = legacyHandlers[legacyIndex].slice();
                for (var i=0, len=lh.length; i<len; ++i) {
                // for (var i in lh.length) {
                    li = lh[i];
                    if ( li && li[this.WFN] ) {
                        scope = li[this.ADJ_SCOPE];
                        ret = li[this.WFN].call(scope, e);
                        ok = (ok && ret);
                    }
                }

                // Fire the original handler if we replaced one.  We fire this
                // after the other events to keep stopPropagation/preventDefault
                // that happened in the DOM0 handler from touching our DOM2
                // substitute
                le = legacyEvents[legacyIndex];
                if (le && le[2]) {
                    le[2](e);
                }
                
                return ok;
            },

            /**
             * Returns the legacy event index that matches the supplied 
             * signature
             * @method getLegacyIndex
             * @static
             * @private
             */
            getLegacyIndex: function(el, sType) {
                var key = this.generateId(el) + sType;
                if (typeof legacyMap[key] == "undefined") { 
                    return -1;
                } else {
                    return legacyMap[key];
                }
            },

            /**
             * Logic that determines when we should automatically use legacy
             * events instead of DOM2 events.  Currently this is limited to old
             * Safari browsers with a broken preventDefault
             * @method useLegacyEvent
             * @static
             * @private
             */
            useLegacyEvent: function(el, sType) {
return (this.webkit && this.webkit < 419 && ("click"==sType || "dblclick"==sType));
            },
                    
            /**
             * Removes an event listener
             *
             * @method _removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @param {boolen}      capture capture or bubble phase             
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             * @private
             */
            _removeListener: function(el, sType, fn, capture) {
                var i, len, li;

                // The el argument can be a string
                if (typeof el == "string") {
                    el = this.getEl(el);
                // The el argument can be an array of elements or element ids.
                } else if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (i=el.length-1; i>-1; i--) {
                        ok = ( this._removeListener(el[i], sType, fn, capture) && ok );
                    }
                    return ok;
                }

                if (!fn || !fn.call) {
                    //return false;
                    return this.purgeElement(el, false, sType);
                }

                if ("unload" == sType) {

                    for (i=unloadListeners.length-1; i>-1; i--) {
                        li = unloadListeners[i];
                        if (li && 
                            li[0] == el && 
                            li[1] == sType && 
                            li[2] == fn) {
                                unloadListeners.splice(i, 1);
                                // unloadListeners[i]=null;
                                return true;
                        }
                    }

                    return false;
                }

                var cacheItem = null;

                // The index is a hidden parameter; needed to remove it from
                // the method signature because it was tempting users to
                // try and take advantage of it, which is not possible.
                var index = arguments[4];
  
                if ("undefined" === typeof index) {
                    index = this._getCacheIndex(el, sType, fn);
                }

                if (index >= 0) {
                    cacheItem = listeners[index];
                }

                if (!el || !cacheItem) {
                    return false;
                }


                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);
                    var llist = legacyHandlers[legacyIndex];
                    if (llist) {
                        for (i=0, len=llist.length; i<len; ++i) {
                        // for (i in llist.length) {
                            li = llist[i];
                            if (li && 
                                li[this.EL] == el && 
                                li[this.TYPE] == sType && 
                                li[this.FN] == fn) {
                                    llist.splice(i, 1);
                                    // llist[i]=null;
                                    break;
                            }
                        }
                    }

                } else {
                    try {
                        this._simpleRemove(el, sType, cacheItem[this.WFN], capture);
                    } catch(ex) {
                        this.lastError = ex;
                        return false;
                    }
                }

                // removed the wrapped handler
                delete listeners[index][this.WFN];
                delete listeners[index][this.FN];
                listeners.splice(index, 1);
                // listeners[index]=null;

                return true;

            },


            /**
             * Removes an event listener
             *
             * @method removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeListener: function(el, sType, fn) {

				return this._removeListener(el, sType, fn, false);

            },


            /**
             * Returns the event's target element.  Safari sometimes provides
             * a text node, and this is automatically resolved to the text
             * node's parent so that it behaves like other browsers.
             * @method getTarget
             * @param {Event} ev the event
             * @param {boolean} resolveTextNode when set to true the target's
             *                  parent will be returned if the target is a 
             *                  text node.  @deprecated, the text node is
             *                  now resolved automatically
             * @return {HTMLElement} the event's target
             * @static
             */
            getTarget: function(ev, resolveTextNode) {
                var t = ev.target || ev.srcElement;
                return this.resolveTextNode(t);
            },

            /**
             * In some cases, some browsers will return a text node inside
             * the actual element that was targeted.  This normalizes the
             * return value for getTarget and getRelatedTarget.
             * @method resolveTextNode
             * @param {HTMLElement} node node to resolve
             * @return {HTMLElement} the normized node
             * @static
             */
            resolveTextNode: function(n) {
                try {
                    if (n && 3 == n.nodeType) {
                        return n.parentNode;
                    }
                } catch(e) { }

                return n;
            },

            /**
             * Returns the event's pageX
             * @method getPageX
             * @param {Event} ev the event
             * @return {int} the event's pageX
             * @static
             */
            getPageX: function(ev) {
                var x = ev.pageX;
                if (!x && 0 !== x) {
                    x = ev.clientX || 0;

                    if ( this.isIE ) {
                        x += this._getScrollLeft();
                    }
                }

                return x;
            },

            /**
             * Returns the event's pageY
             * @method getPageY
             * @param {Event} ev the event
             * @return {int} the event's pageY
             * @static
             */
            getPageY: function(ev) {
                var y = ev.pageY;
                if (!y && 0 !== y) {
                    y = ev.clientY || 0;

                    if ( this.isIE ) {
                        y += this._getScrollTop();
                    }
                }


                return y;
            },

            /**
             * Returns the pageX and pageY properties as an indexed array.
             * @method getXY
             * @param {Event} ev the event
             * @return {[x, y]} the pageX and pageY properties of the event
             * @static
             */
            getXY: function(ev) {
                return [this.getPageX(ev), this.getPageY(ev)];
            },

            /**
             * Returns the event's related target 
             * @method getRelatedTarget
             * @param {Event} ev the event
             * @return {HTMLElement} the event's relatedTarget
             * @static
             */
            getRelatedTarget: function(ev) {
                var t = ev.relatedTarget;
                if (!t) {
                    if (ev.type == "mouseout") {
                        t = ev.toElement;
                    } else if (ev.type == "mouseover") {
                        t = ev.fromElement;
                    }
                }

                return this.resolveTextNode(t);
            },

            /**
             * Returns the time of the event.  If the time is not included, the
             * event is modified using the current time.
             * @method getTime
             * @param {Event} ev the event
             * @return {Date} the time of the event
             * @static
             */
            getTime: function(ev) {
                if (!ev.time) {
                    var t = new Date().getTime();
                    try {
                        ev.time = t;
                    } catch(ex) { 
                        this.lastError = ex;
                        return t;
                    }
                }

                return ev.time;
            },

            /**
             * Convenience method for stopPropagation + preventDefault
             * @method stopEvent
             * @param {Event} ev the event
             * @static
             */
            stopEvent: function(ev) {
                this.stopPropagation(ev);
                this.preventDefault(ev);
            },

            /**
             * Stops event propagation
             * @method stopPropagation
             * @param {Event} ev the event
             * @static
             */
            stopPropagation: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                } else {
                    ev.cancelBubble = true;
                }
            },

            /**
             * Prevents the default behavior of the event
             * @method preventDefault
             * @param {Event} ev the event
             * @static
             */
            preventDefault: function(ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            },
             
            /**
             * Finds the event in the window object, the caller's arguments, or
             * in the arguments of another method in the callstack.  This is
             * executed automatically for events registered through the event
             * manager, so the implementer should not normally need to execute
             * this function at all.
             * @method getEvent
             * @param {Event} e the event parameter from the handler
             * @param {HTMLElement} boundEl the element the listener is attached to
             * @return {Event} the event 
             * @static
             */
            getEvent: function(e, boundEl) {
                var ev = e || window.event;

                if (!ev) {
                    var c = this.getEvent.caller;
                    while (c) {
                        ev = c.arguments[0];
                        if (ev && Event == ev.constructor) {
                            break;
                        }
                        c = c.caller;
                    }
                }

                return ev;
            },

            /**
             * Returns the charcode for an event
             * @method getCharCode
             * @param {Event} ev the event
             * @return {int} the event's charCode
             * @static
             */
            getCharCode: function(ev) {
                var code = ev.keyCode || ev.charCode || 0;

                // webkit key normalization
                if (YAHOO.env.ua.webkit && (code in webkitKeymap)) {
                    code = webkitKeymap[code];
                }
                return code;
            },

            /**
             * Locating the saved event handler data by function ref
             *
             * @method _getCacheIndex
             * @static
             * @private
             */
            _getCacheIndex: function(el, sType, fn) {
                for (var i=0, l=listeners.length; i<l; i=i+1) {
                    var li = listeners[i];
                    if ( li                 && 
                         li[this.FN] == fn  && 
                         li[this.EL] == el  && 
                         li[this.TYPE] == sType ) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Generates an unique ID for the element if it does not already 
             * have one.
             * @method generateId
             * @param el the element to create the id for
             * @return {string} the resulting id of the element
             * @static
             */
            generateId: function(el) {
                var id = el.id;

                if (!id) {
                    id = "yuievtautoid-" + counter;
                    ++counter;
                    el.id = id;
                }

                return id;
            },


            /**
             * We want to be able to use getElementsByTagName as a collection
             * to attach a group of events to.  Unfortunately, different 
             * browsers return different types of collections.  This function
             * tests to determine if the object is array-like.  It will also 
             * fail if the object is an array, but is empty.
             * @method _isValidCollection
             * @param o the object to test
             * @return {boolean} true if the object is array-like and populated
             * @static
             * @private
             */
            _isValidCollection: function(o) {
                try {
                    return ( o                     && // o is something
                             typeof o !== "string" && // o is not a string
                             o.length              && // o is indexed
                             !o.tagName            && // o is not an HTML element
                             !o.alert              && // o is not a window
                             typeof o[0] !== "undefined" );
                } catch(ex) {
                    return false;
                }

            },

            /**
             * @private
             * @property elCache
             * DOM element cache
             * @static
             * @deprecated Elements are not cached due to issues that arise when
             * elements are removed and re-added
             */
            elCache: {},

            /**
             * We cache elements bound by id because when the unload event 
             * fires, we can no longer use document.getElementById
             * @method getEl
             * @static
             * @private
             * @deprecated Elements are not cached any longer
             */
            getEl: function(id) {
                return (typeof id === "string") ? document.getElementById(id) : id;
            },

            /**
             * Clears the element cache
             * @deprecated Elements are not cached any longer
             * @method clearCache
             * @static
             * @private
             */
            clearCache: function() { },

            /**
             * Custom event the fires when the dom is initially usable
             * @event DOMReadyEvent
             */
            DOMReadyEvent: new YAHOO.util.CustomEvent("DOMReady", this),

            /**
             * hook up any deferred listeners
             * @method _load
             * @static
             * @private
             */
            _load: function(e) {

                if (!loadComplete) {
                    loadComplete = true;
                    var EU = YAHOO.util.Event;

                    // Just in case DOMReady did not go off for some reason
                    EU._ready();

                    // Available elements may not have been detected before the
                    // window load event fires. Try to find them now so that the
                    // the user is more likely to get the onAvailable notifications
                    // before the window load notification
                    EU._tryPreloadAttach();

                }
            },

            /**
             * Fires the DOMReady event listeners the first time the document is
             * usable.
             * @method _ready
             * @static
             * @private
             */
            _ready: function(e) {
                var EU = YAHOO.util.Event;
                if (!EU.DOMReady) {
                    EU.DOMReady=true;

                    // Fire the content ready custom event
                    EU.DOMReadyEvent.fire();

                    // Remove the DOMContentLoaded (FF/Opera)
                    EU._simpleRemove(document, "DOMContentLoaded", EU._ready);
                }
            },

            /**
             * Polling function that runs before the onload event fires, 
             * attempting to attach to DOM Nodes as soon as they are 
             * available
             * @method _tryPreloadAttach
             * @static
             * @private
             */
            _tryPreloadAttach: function() {

                if (onAvailStack.length === 0) {
                    retryCount = 0;
                    clearInterval(this._interval);
                    this._interval = null;
                    return;
                }

                if (this.locked) {
                    return;
                }

                if (this.isIE) {
                    // Hold off if DOMReady has not fired and check current
                    // readyState to protect against the IE operation aborted
                    // issue.
                    if (!this.DOMReady) {
                        this.startInterval();
                        return;
                    }
                }

                this.locked = true;


                // keep trying until after the page is loaded.  We need to 
                // check the page load state prior to trying to bind the 
                // elements so that we can be certain all elements have been 
                // tested appropriately
                var tryAgain = !loadComplete;
                if (!tryAgain) {
                    tryAgain = (retryCount > 0 && onAvailStack.length > 0);
                }

                // onAvailable
                var notAvail = [];

                var executeItem = function (el, item) {
                    var scope = el;
                    if (item.override) {
                        if (item.override === true) {
                            scope = item.obj;
                        } else {
                            scope = item.override;
                        }
                    }
                    item.fn.call(scope, item.obj);
                };

                var i, len, item, el, ready=[];

                // onAvailable onContentReady
                for (i=0, len=onAvailStack.length; i<len; i=i+1) {
                    item = onAvailStack[i];
                    if (item) {
                        el = this.getEl(item.id);
                        if (el) {
                            if (item.checkReady) {
                                if (loadComplete || el.nextSibling || !tryAgain) {
                                    ready.push(item);
                                    onAvailStack[i] = null;
                                }
                            } else {
                                executeItem(el, item);
                                onAvailStack[i] = null;
                            }
                        } else {
                            notAvail.push(item);
                        }
                    }
                }
                
                // make sure onContentReady fires after onAvailable
                for (i=0, len=ready.length; i<len; i=i+1) {
                    item = ready[i];
                    executeItem(this.getEl(item.id), item);
                }


                retryCount--;

                if (tryAgain) {
                    for (i=onAvailStack.length-1; i>-1; i--) {
                        item = onAvailStack[i];
                        if (!item || !item.id) {
                            onAvailStack.splice(i, 1);
                        }
                    }

                    this.startInterval();
                } else {
                    clearInterval(this._interval);
                    this._interval = null;
                }

                this.locked = false;

            },

            /**
             * Removes all listeners attached to the given element via addListener.
             * Optionally, the node's children can also be purged.
             * Optionally, you can specify a specific type of event to remove.
             * @method purgeElement
             * @param {HTMLElement} el the element to purge
             * @param {boolean} recurse recursively purge this element's children
             * as well.  Use with caution.
             * @param {string} sType optional type of listener to purge. If
             * left out, all listeners will be removed
             * @static
             */
            purgeElement: function(el, recurse, sType) {
                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;
                var elListeners = this.getListeners(oEl, sType), i, len;
                if (elListeners) {
                    for (i=elListeners.length-1; i>-1; i--) {
                        var l = elListeners[i];
                        this._removeListener(oEl, l.type, l.fn, l.capture);
                    }
                }

                if (recurse && oEl && oEl.childNodes) {
                    for (i=0,len=oEl.childNodes.length; i<len ; ++i) {
                        this.purgeElement(oEl.childNodes[i], recurse, sType);
                    }
                }
            },

            /**
             * Returns all listeners attached to the given element via addListener.
             * Optionally, you can specify a specific type of event to return.
             * @method getListeners
             * @param el {HTMLElement|string} the element or element id to inspect 
             * @param sType {string} optional type of listener to return. If
             * left out, all listeners will be returned
             * @return {Object} the listener. Contains the following fields:
             * &nbsp;&nbsp;type:   (string)   the type of event
             * &nbsp;&nbsp;fn:     (function) the callback supplied to addListener
             * &nbsp;&nbsp;obj:    (object)   the custom object supplied to addListener
             * &nbsp;&nbsp;adjust: (boolean|object)  whether or not to adjust the default scope
             * &nbsp;&nbsp;scope: (boolean)  the derived scope based on the adjust parameter
             * &nbsp;&nbsp;scope: (capture)  the capture parameter supplied to addListener
             * &nbsp;&nbsp;index:  (int)      its position in the Event util listener cache
             * @static
             */           
            getListeners: function(el, sType) {
                var results=[], searchLists;
                if (!sType) {
                    searchLists = [listeners, unloadListeners];
                } else if (sType === "unload") {
                    searchLists = [unloadListeners];
                } else {
                    searchLists = [listeners];
                }

                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;

                for (var j=0;j<searchLists.length; j=j+1) {
                    var searchList = searchLists[j];
                    if (searchList) {
                        for (var i=0,len=searchList.length; i<len ; ++i) {
                            var l = searchList[i];
                            if ( l  && l[this.EL] === oEl && 
                                    (!sType || sType === l[this.TYPE]) ) {
                                results.push({
                                    type:   l[this.TYPE],
                                    fn:     l[this.FN],
                                    obj:    l[this.OBJ],
                                    adjust: l[this.OVERRIDE],
                                    scope:  l[this.ADJ_SCOPE],
                                    capture:  l[this.CAPTURE],                                    
                                    index:  i
                                });
                            }
                        }
                    }
                }

                return (results.length) ? results : null;
            },

            /**
             * Removes all listeners registered by pe.event.  Called 
             * automatically during the unload event.
             * @method _unload
             * @static
             * @private
             */
            _unload: function(e) {

                var EU = YAHOO.util.Event, i, j, l, len, index,
                         ul = unloadListeners.slice();

                // execute and clear stored unload listeners
                for (i=0,len=unloadListeners.length; i<len; ++i) {
                    l = ul[i];
                    if (l) {
                        var scope = window;
                        if (l[EU.ADJ_SCOPE]) {
                            if (l[EU.ADJ_SCOPE] === true) {
                                scope = l[EU.UNLOAD_OBJ];
                            } else {
                                scope = l[EU.ADJ_SCOPE];
                            }
                        }
                        l[EU.FN].call(scope, EU.getEvent(e, l[EU.EL]), l[EU.UNLOAD_OBJ] );
                        ul[i] = null;
                        l=null;
                        scope=null;
                    }
                }

                unloadListeners = null;

                // Remove listeners to handle IE memory leaks
                //if (YAHOO.env.ua.ie && listeners && listeners.length > 0) {
                
                // 2.5.0 listeners are removed for all browsers again.  FireFox preserves
                // at least some listeners between page refreshes, potentially causing
                // errors during page load (mouseover listeners firing before they
                // should if the user moves the mouse at the correct moment).
                if (listeners) {
                    for (j=listeners.length-1; j>-1; j--) {
                        l = listeners[j];
                        if (l) {
                            EU._removeListener(l[EU.EL], l[EU.TYPE], l[EU.FN], l[EU.CAPTURE], j);
                        } 
                    }
                    l=null;
                }

                legacyEvents = null;

                EU._simpleRemove(window, "unload", EU._unload);

            },

            /**
             * Returns scrollLeft
             * @method _getScrollLeft
             * @static
             * @private
             */
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },

            /**
             * Returns scrollTop
             * @method _getScrollTop
             * @static
             * @private
             */
            _getScrollTop: function() {
                return this._getScroll()[0];
            },

            /**
             * Returns the scrollTop and scrollLeft.  Used to calculate the 
             * pageX and pageY in Internet Explorer
             * @method _getScroll
             * @static
             * @private
             */
            _getScroll: function() {
                var dd = document.documentElement, db = document.body;
                if (dd && (dd.scrollTop || dd.scrollLeft)) {
                    return [dd.scrollTop, dd.scrollLeft];
                } else if (db) {
                    return [db.scrollTop, db.scrollLeft];
                } else {
                    return [0, 0];
                }
            },
            
            /**
             * Used by old versions of CustomEvent, restored for backwards
             * compatibility
             * @method regCE
             * @private
             * @static
             * @deprecated still here for backwards compatibility
             */
            regCE: function() {
                // does nothing
            },

            /**
             * Adds a DOM event directly without the caching, cleanup, scope adj, etc
             *
             * @method _simpleAdd
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleAdd: function () {
                if (window.addEventListener) {
                    return function(el, sType, fn, capture) {
                        el.addEventListener(sType, fn, (capture));
                    };
                } else if (window.attachEvent) {
                    return function(el, sType, fn, capture) {
                        el.attachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }(),

            /**
             * Basic remove listener
             *
             * @method _simpleRemove
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function (el, sType, fn, capture) {
                        el.removeEventListener(sType, fn, (capture));
                    };
                } else if (window.detachEvent) {
                    return function (el, sType, fn) {
                        el.detachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }()
        };

    }();

    (function() {
        var EU = YAHOO.util.Event;

        /**
         * YAHOO.util.Event.on is an alias for addListener
         * @method on
         * @see addListener
         * @static
         */
        EU.on = EU.addListener;

        /**
         * YAHOO.util.Event.onFocus is an alias for addFocusListener
         * @method on
         * @see addFocusListener
         * @static
         */
        EU.onFocus = EU.addFocusListener;

        /**
         * YAHOO.util.Event.onBlur is an alias for addBlurListener
         * @method onBlur
         * @see addBlurListener
         * @static
         */     
        EU.onBlur = EU.addBlurListener;


/*! DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller */

        // Internet Explorer: use the readyState of a defered script.
        // This isolates what appears to be a safe moment to manipulate
        // the DOM prior to when the document's readyState suggests
        // it is safe to do so.
        if (EU.isIE) {

            // Process onAvailable/onContentReady items when the 
            // DOM is ready.
            YAHOO.util.Event.onDOMReady(
                    YAHOO.util.Event._tryPreloadAttach,
                    YAHOO.util.Event, true);
            
            var n = document.createElement('p');  

            EU._dri = setInterval(function() {
                try {
                    // throws an error if doc is not ready
                    n.doScroll('left');
                    clearInterval(EU._dri);
                    EU._dri = null;
                    EU._ready();
                    n = null;
                } catch (ex) { 
                }
            }, EU.POLL_INTERVAL); 

        
        // The document's readyState in Safari currently will
        // change to loaded/complete before images are loaded.
        } else if (EU.webkit && EU.webkit < 525) {

            EU._dri = setInterval(function() {
                var rs=document.readyState;
                if ("loaded" == rs || "complete" == rs) {
                    clearInterval(EU._dri);
                    EU._dri = null;
                    EU._ready();
                }
            }, EU.POLL_INTERVAL); 

        // FireFox and Opera: These browsers provide a event for this
        // moment.  The latest WebKit releases now support this event.
        } else {

            EU._simpleAdd(document, "DOMContentLoaded", EU._ready);

        }
        /////////////////////////////////////////////////////////////


        EU._simpleAdd(window, "load", EU._load);
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();

}
/**
 * EventProvider is designed to be used with YAHOO.augment to wrap 
 * CustomEvents in an interface that allows events to be subscribed to 
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 *
 * @Class EventProvider
 */
YAHOO.util.EventProvider = function() { };

YAHOO.util.EventProvider.prototype = {

    /**
     * Private storage of custom events
     * @property __yui_events
     * @type Object[]
     * @private
     */
    __yui_events: null,

    /**
     * Private storage of custom event subscribers
     * @property __yui_subscribers
     * @type Object[]
     * @private
     */
    __yui_subscribers: null,
    
    /**
     * Subscribe to a CustomEvent by event type
     *
     * @method subscribe
     * @param p_type     {string}   the type, or name of the event
     * @param p_fn       {function} the function to exectute when the event fires
     * @param p_obj      {Object}   An object to be passed along when the event 
     *                              fires
     * @param p_override {boolean}  If true, the obj passed in becomes the 
     *                              execution scope of the listener
     */
    subscribe: function(p_type, p_fn, p_obj, p_override) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            ce.subscribe(p_fn, p_obj, p_override);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var subs = this.__yui_subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push(
                { fn: p_fn, obj: p_obj, override: p_override } );
        }
    },

    /**
     * Unsubscribes one or more listeners the from the specified event
     * @method unsubscribe
     * @param p_type {string}   The type, or name of the event.  If the type
     *                          is not specified, it will attempt to remove
     *                          the listener from all hosted events.
     * @param p_fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param p_obj  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} true if the subscriber was found and detached.
     */
    unsubscribe: function(p_type, p_fn, p_obj) {
        this.__yui_events = this.__yui_events || {};
        var evts = this.__yui_events;
        if (p_type) {
            var ce = evts[p_type];
            if (ce) {
                return ce.unsubscribe(p_fn, p_obj);
            }
        } else {
            var ret = true;
            for (var i in evts) {
                if (YAHOO.lang.hasOwnProperty(evts, i)) {
                    ret = ret && evts[i].unsubscribe(p_fn, p_obj);
                }
            }
            return ret;
        }

        return false;
    },
    
    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method unsubscribeAll
     * @param p_type {string}   The type, or name of the event
     */
    unsubscribeAll: function(p_type) {
        return this.unsubscribe(p_type);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned. 
     *
     * @method createEvent
     *
     * @param p_type {string} the type, or name of the event
     * @param p_config {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *      scope: defines the default execution scope.  If not defined
     *      the default scope will be this instance.
     *    </li>
     *    <li>
     *      silent: if true, the custom event will not generate log messages.
     *      This is false by default.
     *    </li>
     *    <li>
     *      onSubscribeCallback: specifies a callback to execute when the
     *      event has a new subscriber.  This will fire immediately for
     *      each queued subscriber if any exist prior to the creation of
     *      the event.
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    createEvent: function(p_type, p_config) {

        this.__yui_events = this.__yui_events || {};
        var opts = p_config || {};
        var events = this.__yui_events;

        if (events[p_type]) {
        } else {

            var scope  = opts.scope  || this;
            var silent = (opts.silent);

            var ce = new YAHOO.util.CustomEvent(p_type, scope, silent,
                    YAHOO.util.CustomEvent.FLAT);
            events[p_type] = ce;

            if (opts.onSubscribeCallback) {
                ce.subscribeEvent.subscribe(opts.onSubscribeCallback);
            }

            this.__yui_subscribers = this.__yui_subscribers || {};
            var qs = this.__yui_subscribers[p_type];

            if (qs) {
                for (var i=0; i<qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].obj, qs[i].override);
                }
            }
        }

        return events[p_type];
    },


   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The first argument fire() was executed with</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fireEvent
     * @param p_type    {string}  the type, or name of the event
     * @param arguments {Object*} an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} the return value from CustomEvent.fire
     *                   
     */
    fireEvent: function(p_type, arg1, arg2, etc) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (!ce) {
            return null;
        }

        var args = [];
        for (var i=1; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }
        return ce.fire.apply(ce, args);
    },

    /**
     * Returns true if the custom event of the provided type has been created
     * with createEvent.
     * @method hasEvent
     * @param type {string} the type, or name of the event
     */
    hasEvent: function(type) {
        if (this.__yui_events) {
            if (this.__yui_events[type]) {
                return true;
            }
        }
        return false;
    }

};

//@TODO optimize
//@TODO use event utility, lang abstractions
//@TODO replace

/**
* KeyListener is a utility that provides an easy interface for listening for
* keydown/keyup events fired against DOM elements.
* @namespace YAHOO.util
* @class KeyListener
* @constructor
* @param {HTMLElement} attachTo The element or element ID to which the key 
*                               event should be attached
* @param {String}      attachTo The element or element ID to which the key
*                               event should be attached
* @param {Object}      keyData  The object literal representing the key(s) 
*                               to detect. Possible attributes are 
*                               shift(boolean), alt(boolean), ctrl(boolean) 
*                               and keys(either an int or an array of ints 
*                               representing keycodes).
* @param {Function}    handler  The CustomEvent handler to fire when the 
*                               key event is detected
* @param {Object}      handler  An object literal representing the handler. 
* @param {String}      event    Optional. The event (keydown or keyup) to 
*                               listen for. Defaults automatically to keydown.
*
* @knownissue the "keypress" event is completely broken in Safari 2.x and below.
*             the workaround is use "keydown" for key listening.  However, if
*             it is desired to prevent the default behavior of the keystroke,
*             that can only be done on the keypress event.  This makes key
*             handling quite ugly.
* @knownissue keydown is also broken in Safari 2.x and below for the ESC key.
*             There currently is no workaround other than choosing another
*             key to listen for.
*/
YAHOO.util.KeyListener = function(attachTo, keyData, handler, event) {
    if (!attachTo) {
    } else if (!keyData) {
    } else if (!handler) {
    } 
    
    if (!event) {
        event = YAHOO.util.KeyListener.KEYDOWN;
    }

    /**
    * The CustomEvent fired internally when a key is pressed
    * @event keyEvent
    * @private
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    var keyEvent = new YAHOO.util.CustomEvent("keyPressed");
    
    /**
    * The CustomEvent fired when the KeyListener is enabled via the enable() 
    * function
    * @event enabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.enabledEvent = new YAHOO.util.CustomEvent("enabled");

    /**
    * The CustomEvent fired when the KeyListener is disabled via the 
    * disable() function
    * @event disabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.disabledEvent = new YAHOO.util.CustomEvent("disabled");

    if (typeof attachTo == 'string') {
        attachTo = document.getElementById(attachTo);
    }

    if (typeof handler == 'function') {
        keyEvent.subscribe(handler);
    } else {
        keyEvent.subscribe(handler.fn, handler.scope, handler.correctScope);
    }

    /**
    * Handles the key event when a key is pressed.
    * @method handleKeyPress
    * @param {DOMEvent} e   The keypress DOM event
    * @param {Object}   obj The DOM event scope object
    * @private
    */
    function handleKeyPress(e, obj) {
        if (! keyData.shift) {  
            keyData.shift = false; 
        }
        if (! keyData.alt) {    
            keyData.alt = false;
        }
        if (! keyData.ctrl) {
            keyData.ctrl = false;
        }

        // check held down modifying keys first
        if (e.shiftKey == keyData.shift && 
            e.altKey   == keyData.alt &&
            e.ctrlKey  == keyData.ctrl) { // if we pass this, all modifiers match
            
            var dataItem;

            if (keyData.keys instanceof Array) {
                for (var i=0;i<keyData.keys.length;i++) {
                    dataItem = keyData.keys[i];

                    if (dataItem == e.charCode ) {
                        keyEvent.fire(e.charCode, e);
                        break;
                    } else if (dataItem == e.keyCode) {
                        keyEvent.fire(e.keyCode, e);
                        break;
                    }
                }
            } else {
                dataItem = keyData.keys;
                if (dataItem == e.charCode ) {
                    keyEvent.fire(e.charCode, e);
                } else if (dataItem == e.keyCode) {
                    keyEvent.fire(e.keyCode, e);
                }
            }
        }
    }

    /**
    * Enables the KeyListener by attaching the DOM event listeners to the 
    * target DOM element
    * @method enable
    */
    this.enable = function() {
        if (! this.enabled) {
            YAHOO.util.Event.addListener(attachTo, event, handleKeyPress);
            this.enabledEvent.fire(keyData);
        }
        /**
        * Boolean indicating the enabled/disabled state of the Tooltip
        * @property enabled
        * @type Boolean
        */
        this.enabled = true;
    };

    /**
    * Disables the KeyListener by removing the DOM event listeners from the 
    * target DOM element
    * @method disable
    */
    this.disable = function() {
        if (this.enabled) {
            YAHOO.util.Event.removeListener(attachTo, event, handleKeyPress);
            this.disabledEvent.fire(keyData);
        }
        this.enabled = false;
    };

    /**
    * Returns a String representation of the object.
    * @method toString
    * @return {String}  The string representation of the KeyListener
    */ 
    this.toString = function() {
        return "KeyListener [" + keyData.keys + "] " + attachTo.tagName + 
                (attachTo.id ? "[" + attachTo.id + "]" : "");
    };

};

/**
 * Constant representing the DOM "keydown" event.
 * @property YAHOO.util.KeyListener.KEYDOWN
 * @static
 * @final
 * @type String
 */
YAHOO.util.KeyListener.KEYDOWN = "keydown";

/**
 * Constant representing the DOM "keyup" event.
 * @property YAHOO.util.KeyListener.KEYUP
 * @static
 * @final
 * @type String
 */
YAHOO.util.KeyListener.KEYUP = "keyup";

/**
 * keycode constants for a subset of the special keys
 * @property KEY
 * @static
 * @final
 */
YAHOO.util.KeyListener.KEY = {
    ALT          : 18,
    BACK_SPACE   : 8,
    CAPS_LOCK    : 20,
    CONTROL      : 17,
    DELETE       : 46,
    DOWN         : 40,
    END          : 35,
    ENTER        : 13,
    ESCAPE       : 27,
    HOME         : 36,
    LEFT         : 37,
    META         : 224,
    NUM_LOCK     : 144,
    PAGE_DOWN    : 34,
    PAGE_UP      : 33, 
    PAUSE        : 19,
    PRINTSCREEN  : 44,
    RIGHT        : 39,
    SCROLL_LOCK  : 145,
    SHIFT        : 16,
    SPACE        : 32,
    TAB          : 9,
    UP           : 38
};
YAHOO.register("event", YAHOO.util.Event, {version: "2.6.0", build: "1321"});
/**
    json.js
    2007-08-19

    Public Domain

    This file adds these methods to JavaScript:

        array.toJSONString(whitelist)
        boolean.toJSONString()
        date.toJSONString()
        number.toJSONString()
        object.toJSONString(whitelist)
        string.toJSONString()
            These methods produce a JSON text from a JavaScript value.
            It must not contain any cyclical references. Illegal values
            will be excluded.

            The default conversion for dates is to an ISO string. You can
            add a toJSONString method to any date object to get a different
            representation.

            The object and array methods can take an optional whitelist
            argument. A whitelist is an array of strings. If it is provided,
            keys in objects not found in the whitelist are excluded.

        string.parseJSON(filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function which can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = text.parseJSON(function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    It is expected that these methods will formally become part of the
    JavaScript Programming Language in the Fourth Edition of the
    ECMAScript standard in 2008.

    This file will break programs with improper for..in loops. See
    http://yuiblog.com/blog/2006/09/26/for-in-intrigue/

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load untrusted third party
    code into your pages.
 * @module json
 * @namespace window
 */

/*jslint evil: true */

// Augment the basic prototypes if they have not already been augmented.

if (!Object.prototype.toJSONString) {

    Array.prototype.toJSONString = function (w) {
        var a = [],     // The array holding the partial texts.
            i,          // Loop counter.
            l = this.length,
            v;          // The value to be stringified.

// For each value in this array...

        for (i = 0; i < l; i += 1) {
            v = this[i];
            switch (typeof v) {
            case 'object':

// Serialize a JavaScript object value. Ignore objects thats lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                if (v) {
                    if (typeof v.toJSONString === 'function') {
                        a.push(v.toJSONString(w));
                    }
                } else {
                    a.push('null');
                }
                break;

            case 'string':
            case 'number':
            case 'boolean':
                a.push(v.toJSONString());

// Values without a JSON representation are ignored.

            }
        }

// Join all of the member texts together and wrap them in brackets.

        return '[' + a.join(',') + ']';
    };


    Boolean.prototype.toJSONString = function () {
        return String(this);
    };


    Date.prototype.toJSONString = function () {

// Eventually, this method will be based on the date.toISOString method.

        function f(n) {

// Format integers to have at least two digits.

            return n < 10 ? '0' + n : n;
        }

        return '"' + this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1)  + '-' +
                f(this.getUTCDate())       + 'T' +
                f(this.getUTCHours())      + ':' +
                f(this.getUTCMinutes())    + ':' +
                f(this.getUTCSeconds())    + 'Z"';
    };


    Number.prototype.toJSONString = function () {

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(this) ? String(this) : 'null';
    };


    Object.prototype.toJSONString = function (w) {
        var a = [],     // The array holding the partial texts.
            k,          // The current key.
            i,          // The loop counter.
            v;          // The current value.

// If a whitelist (array of keys) is provided, use it assemble the components
// of the object.

        if (w) {
            for (i = 0; i < w.length; i += 1) {
                k = w[i];
                if (typeof k === 'string') {
                    v = this[k];
                    switch (typeof v) {
                    case 'object':

// Serialize a JavaScript object value. Ignore objects that lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                        if (v) {
                            if (typeof v.toJSONString === 'function') {
                                a.push(k.toJSONString() + ':' +
                                       v.toJSONString(w));
                            }
                        } else {
                            a.push(k.toJSONString() + ':null');
                        }
                        break;

                    case 'string':
                    case 'number':
                    case 'boolean':
                        a.push(k.toJSONString() + ':' + v.toJSONString());

// Values without a JSON representation are ignored.

                    }
                }
            }
        } else {

// Iterate through all of the keys in the object, ignoring the proto chain
// and keys that are not strings.

            for (k in this) {
                if (typeof k === 'string' &&
                        Object.prototype.hasOwnProperty.apply(this, [k])) {
                    v = this[k];
                    switch (typeof v) {
                    case 'object':

// Serialize a JavaScript object value. Ignore objects that lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                        if (v) {
                            if (typeof v.toJSONString === 'function') {
                                a.push(k.toJSONString() + ':' +
                                       v.toJSONString());
                            }
                        } else {
                            a.push(k.toJSONString() + ':null');
                        }
                        break;

                    case 'string':
                    case 'number':
                    case 'boolean':
                        a.push(k.toJSONString() + ':' + v.toJSONString());

// Values without a JSON representation are ignored.

                    }
                }
            }
        }

// Join all of the member texts together and wrap them in braces.

        return '{' + a.join(',') + '}';
    };


    (function (s) {

// Augment String.prototype. We do this in an immediate anonymous function to
// avoid defining global variables.

// m is a table of character substitutions.

        var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };


        s.parseJSON = function (filter) {
            var j;

            function walk(k, v) {
                var i;
                if (v && typeof v === 'object') {
                    for (i in v) {
                        if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                            v[i] = walk(i, v[i]);
                        }
                    }
                }
                return filter(k, v);
            }


// Parsing happens in three stages. In the first stage, we run the text against
// a regular expression which looks for non-JSON characters. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we will reject all
// unexpected characters.

// We split the first stage into 3 regexp operations in order to work around
// crippling deficiencies in Safari's regexp engine. First we replace all
// backslash pairs with '@' (a non-JSON character). Second we delete all of
// the string literals. Third, we look to see if only JSON characters
// remain. If so, then the text is safe for eval.

            if (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/.test(this.
                    replace(/\\./g, '@').
                    replace(/"[^"\\\n\r]*"/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + this + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a filter function for possible transformation.

                return typeof filter === 'function' ? walk('', j) : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('parseJSON');
        };


        s.toJSONString = function () {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can simply slap some quotes around it.
// Otherwise we must also replace the offending characters with safe
// sequences.

            if (/["\\\x00-\x1f]/.test(this)) {
                return '"' + this.replace(/[\x00-\x1f\\"]/g, function (a) {
                    var c = m[a];
                    if (c) {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                }) + '"';
            }
            return '"' + this + '"';
        };
    })(String.prototype);
}/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
(function() {

var Y = YAHOO.util;

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/

/**
 * The animation module provides allows effects to be added to HTMLElements.
 * @module animation
 * @requires yahoo, event, dom
 */

/**
 *
 * Base animation class that provides the interface for building animated effects.
 * <p>Usage: var myAnim = new YAHOO.util.Anim(el, { width: { from: 10, to: 100 } }, 1, YAHOO.util.Easing.easeOut);</p>
 * @class Anim
 * @namespace YAHOO.util
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent
 * @constructor
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */

var Anim = function(el, attributes, duration, method) {
    if (!el) {
    }
    this.init(el, attributes, duration, method); 
};

Anim.NAME = 'Anim';

Anim.prototype = {
    /**
     * Provides a readable name for the Anim instance.
     * @method toString
     * @return {String}
     */
    toString: function() {
        var el = this.getEl() || {};
        var id = el.id || el.tagName;
        return (this.constructor.NAME + ': ' + id);
    },
    
    patterns: { // cached for performance
        noNegatives:        /width|height|opacity|padding/i, // keep at zero or above
        offsetAttribute:  /^((width|height)|(top|left))$/, // use offsetValue as default
        defaultUnit:        /width|height|top$|bottom$|left$|right$/i, // use 'px' by default
        offsetUnit:         /\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i // IE may return these, so convert these to offset
    },
    
    /**
     * Returns the value computed by the animation's "method".
     * @method doMethod
     * @param {String} attr The name of the attribute.
     * @param {Number} start The value this attribute should start from for this animation.
     * @param {Number} end  The value this attribute should end at for this animation.
     * @return {Number} The Value to be applied to the attribute.
     */
    doMethod: function(attr, start, end) {
        return this.method(this.currentFrame, start, end - start, this.totalFrames);
    },
    
    /**
     * Applies a value to an attribute.
     * @method setAttribute
     * @param {String} attr The name of the attribute.
     * @param {Number} val The value to be applied to the attribute.
     * @param {String} unit The unit ('px', '%', etc.) of the value.
     */
    setAttribute: function(attr, val, unit) {
        if ( this.patterns.noNegatives.test(attr) ) {
            val = (val > 0) ? val : 0;
        }

        Y.Dom.setStyle(this.getEl(), attr, val + unit);
    },                        
    
    /**
     * Returns current value of the attribute.
     * @method getAttribute
     * @param {String} attr The name of the attribute.
     * @return {Number} val The current value of the attribute.
     */
    getAttribute: function(attr) {
        var el = this.getEl();
        var val = Y.Dom.getStyle(el, attr);

        if (val !== 'auto' && !this.patterns.offsetUnit.test(val)) {
            return parseFloat(val);
        }
        
        var a = this.patterns.offsetAttribute.exec(attr) || [];
        var pos = !!( a[3] ); // top or left
        var box = !!( a[2] ); // width or height
        
        // use offsets for width/height and abs pos top/left
        if ( box || (Y.Dom.getStyle(el, 'position') == 'absolute' && pos) ) {
            val = el['offset' + a[0].charAt(0).toUpperCase() + a[0].substr(1)];
        } else { // default to zero for other 'auto'
            val = 0;
        }

        return val;
    },
    
    /**
     * Returns the unit to use when none is supplied.
     * @method getDefaultUnit
     * @param {attr} attr The name of the attribute.
     * @return {String} The default unit to be used.
     */
    getDefaultUnit: function(attr) {
         if ( this.patterns.defaultUnit.test(attr) ) {
            return 'px';
         }
         
         return '';
    },
        
    /**
     * Sets the actual values to be used during the animation.  Should only be needed for subclass use.
     * @method setRuntimeAttribute
     * @param {Object} attr The attribute object
     * @private 
     */
    setRuntimeAttribute: function(attr) {
        var start;
        var end;
        var attributes = this.attributes;

        this.runtimeAttributes[attr] = {};
        
        var isset = function(prop) {
            return (typeof prop !== 'undefined');
        };
        
        if ( !isset(attributes[attr]['to']) && !isset(attributes[attr]['by']) ) {
            return false; // note return; nothing to animate to
        }
        
        start = ( isset(attributes[attr]['from']) ) ? attributes[attr]['from'] : this.getAttribute(attr);

        // To beats by, per SMIL 2.1 spec
        if ( isset(attributes[attr]['to']) ) {
            end = attributes[attr]['to'];
        } else if ( isset(attributes[attr]['by']) ) {
            if (start.constructor == Array) {
                end = [];
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + attributes[attr]['by'][i] * 1; // times 1 to cast "by" 
                }
            } else {
                end = start + attributes[attr]['by'] * 1;
            }
        }
        
        this.runtimeAttributes[attr].start = start;
        this.runtimeAttributes[attr].end = end;

        // set units if needed
        this.runtimeAttributes[attr].unit = ( isset(attributes[attr].unit) ) ?
                attributes[attr]['unit'] : this.getDefaultUnit(attr);
        return true;
    },

    /**
     * Constructor for Anim instance.
     * @method init
     * @param {String | HTMLElement} el Reference to the element that will be animated
     * @param {Object} attributes The attribute(s) to be animated.  
     * Each attribute is an object with at minimum a "to" or "by" member defined.  
     * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
     * All attribute names use camelCase.
     * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
     * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
     */ 
    init: function(el, attributes, duration, method) {
        /**
         * Whether or not the animation is running.
         * @property isAnimated
         * @private
         * @type Boolean
         */
        var isAnimated = false;
        
        /**
         * A Date object that is created when the animation begins.
         * @property startTime
         * @private
         * @type Date
         */
        var startTime = null;
        
        /**
         * The number of frames this animation was able to execute.
         * @property actualFrames
         * @private
         * @type Int
         */
        var actualFrames = 0; 

        /**
         * The element to be animated.
         * @property el
         * @private
         * @type HTMLElement
         */
        el = Y.Dom.get(el);
        
        /**
         * The collection of attributes to be animated.  
         * Each attribute must have at least a "to" or "by" defined in order to animate.  
         * If "to" is supplied, the animation will end with the attribute at that value.  
         * If "by" is supplied, the animation will end at that value plus its starting value. 
         * If both are supplied, "to" is used, and "by" is ignored. 
         * Optional additional member include "from" (the value the attribute should start animating from, defaults to current value), and "unit" (the units to apply to the values).
         * @property attributes
         * @type Object
         */
        this.attributes = attributes || {};
        
        /**
         * The length of the animation.  Defaults to "1" (second).
         * @property duration
         * @type Number
         */
        this.duration = !YAHOO.lang.isUndefined(duration) ? duration : 1;
        
        /**
         * The method that will provide values to the attribute(s) during the animation. 
         * Defaults to "YAHOO.util.Easing.easeNone".
         * @property method
         * @type Function
         */
        this.method = method || Y.Easing.easeNone;

        /**
         * Whether or not the duration should be treated as seconds.
         * Defaults to true.
         * @property useSeconds
         * @type Boolean
         */
        this.useSeconds = true; // default to seconds
        
        /**
         * The location of the current animation on the timeline.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property currentFrame
         * @type Int
         */
        this.currentFrame = 0;
        
        /**
         * The total number of frames to be executed.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property totalFrames
         * @type Int
         */
        this.totalFrames = Y.AnimMgr.fps;
        
        /**
         * Changes the animated element
         * @method setEl
         */
        this.setEl = function(element) {
            el = Y.Dom.get(element);
        };
        
        /**
         * Returns a reference to the animated element.
         * @method getEl
         * @return {HTMLElement}
         */
        this.getEl = function() { return el; };
        
        /**
         * Checks whether the element is currently animated.
         * @method isAnimated
         * @return {Boolean} current value of isAnimated.     
         */
        this.isAnimated = function() {
            return isAnimated;
        };
        
        /**
         * Returns the animation start time.
         * @method getStartTime
         * @return {Date} current value of startTime.      
         */
        this.getStartTime = function() {
            return startTime;
        };        
        
        this.runtimeAttributes = {};
        
        
        
        /**
         * Starts the animation by registering it with the animation manager. 
         * @method animate  
         */
        this.animate = function() {
            if ( this.isAnimated() ) {
                return false;
            }
            
            this.currentFrame = 0;
            
            this.totalFrames = ( this.useSeconds ) ? Math.ceil(Y.AnimMgr.fps * this.duration) : this.duration;
    
            if (this.duration === 0 && this.useSeconds) { // jump to last frame if zero second duration 
                this.totalFrames = 1; 
            }
            Y.AnimMgr.registerElement(this);
            return true;
        };
          
        /**
         * Stops the animation.  Normally called by AnimMgr when animation completes.
         * @method stop
         * @param {Boolean} finish (optional) If true, animation will jump to final frame.
         */ 
        this.stop = function(finish) {
            if (!this.isAnimated()) { // nothing to stop
                return false;
            }

            if (finish) {
                 this.currentFrame = this.totalFrames;
                 this._onTween.fire();
            }
            Y.AnimMgr.stop(this);
        };
        
        var onStart = function() {            
            this.onStart.fire();
            
            this.runtimeAttributes = {};
            for (var attr in this.attributes) {
                this.setRuntimeAttribute(attr);
            }
            
            isAnimated = true;
            actualFrames = 0;
            startTime = new Date(); 
        };
        
        /**
         * Feeds the starting and ending values for each animated attribute to doMethod once per frame, then applies the resulting value to the attribute(s).
         * @private
         */
         
        var onTween = function() {
            var data = {
                duration: new Date() - this.getStartTime(),
                currentFrame: this.currentFrame
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', currentFrame: ' + data.currentFrame
                );
            };
            
            this.onTween.fire(data);
            
            var runtimeAttributes = this.runtimeAttributes;
            
            for (var attr in runtimeAttributes) {
                this.setAttribute(attr, this.doMethod(attr, runtimeAttributes[attr].start, runtimeAttributes[attr].end), runtimeAttributes[attr].unit); 
            }
            
            actualFrames += 1;
        };
        
        var onComplete = function() {
            var actual_duration = (new Date() - startTime) / 1000 ;
            
            var data = {
                duration: actual_duration,
                frames: actualFrames,
                fps: actualFrames / actual_duration
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', frames: ' + data.frames +
                    ', fps: ' + data.fps
                );
            };
            
            isAnimated = false;
            actualFrames = 0;
            this.onComplete.fire(data);
        };
        
        /**
         * Custom event that fires after onStart, useful in subclassing
         * @private
         */    
        this._onStart = new Y.CustomEvent('_start', this, true);

        /**
         * Custom event that fires when animation begins
         * Listen via subscribe method (e.g. myAnim.onStart.subscribe(someFunction)
         * @event onStart
         */    
        this.onStart = new Y.CustomEvent('start', this);
        
        /**
         * Custom event that fires between each frame
         * Listen via subscribe method (e.g. myAnim.onTween.subscribe(someFunction)
         * @event onTween
         */
        this.onTween = new Y.CustomEvent('tween', this);
        
        /**
         * Custom event that fires after onTween
         * @private
         */
        this._onTween = new Y.CustomEvent('_tween', this, true);
        
        /**
         * Custom event that fires when animation ends
         * Listen via subscribe method (e.g. myAnim.onComplete.subscribe(someFunction)
         * @event onComplete
         */
        this.onComplete = new Y.CustomEvent('complete', this);
        /**
         * Custom event that fires after onComplete
         * @private
         */
        this._onComplete = new Y.CustomEvent('_complete', this, true);

        this._onStart.subscribe(onStart);
        this._onTween.subscribe(onTween);
        this._onComplete.subscribe(onComplete);
    }
};

    Y.Anim = Anim;
})();
/**
 * Handles animation queueing and threading.
 * Used by Anim and subclasses.
 * @class AnimMgr
 * @namespace YAHOO.util
 */
YAHOO.util.AnimMgr = new function() {
    /** 
     * Reference to the animation Interval.
     * @property thread
     * @private
     * @type Int
     */
    var thread = null;
    
    /** 
     * The current queue of registered animation objects.
     * @property queue
     * @private
     * @type Array
     */    
    var queue = [];

    /** 
     * The number of active animations.
     * @property tweenCount
     * @private
     * @type Int
     */        
    var tweenCount = 0;

    /** 
     * Base frame rate (frames per second). 
     * Arbitrarily high for better x-browser calibration (slower browsers drop more frames).
     * @property fps
     * @type Int
     * 
     */
    this.fps = 1000;

    /** 
     * Interval delay in milliseconds, defaults to fastest possible.
     * @property delay
     * @type Int
     * 
     */
    this.delay = 1;

    /**
     * Adds an animation instance to the animation queue.
     * All animation instances must be registered in order to animate.
     * @method registerElement
     * @param {object} tween The Anim instance to be be registered
     */
    this.registerElement = function(tween) {
        queue[queue.length] = tween;
        tweenCount += 1;
        tween._onStart.fire();
        this.start();
    };
    
    /**
     * removes an animation instance from the animation queue.
     * All animation instances must be registered in order to animate.
     * @method unRegister
     * @param {object} tween The Anim instance to be be registered
     * @param {Int} index The index of the Anim instance
     * @private
     */
    this.unRegister = function(tween, index) {
        index = index || getIndex(tween);
        if (!tween.isAnimated() || index == -1) {
            return false;
        }
        
        tween._onComplete.fire();
        queue.splice(index, 1);

        tweenCount -= 1;
        if (tweenCount <= 0) {
            this.stop();
        }

        return true;
    };
    
    /**
     * Starts the animation thread.
	* Only one thread can run at a time.
     * @method start
     */    
    this.start = function() {
        if (thread === null) {
            thread = setInterval(this.run, this.delay);
        }
    };

    /**
     * Stops the animation thread or a specific animation instance.
     * @method stop
     * @param {object} tween A specific Anim instance to stop (optional)
     * If no instance given, Manager stops thread and all animations.
     */    
    this.stop = function(tween) {
        if (!tween) {
            clearInterval(thread);
            
            for (var i = 0, len = queue.length; i < len; ++i) {
                this.unRegister(queue[0], 0);  
            }

            queue = [];
            thread = null;
            tweenCount = 0;
        }
        else {
            this.unRegister(tween);
        }
    };
    
    /**
     * Called per Interval to handle each animation frame.
     * @method run
     */    
    this.run = function() {
        for (var i = 0, len = queue.length; i < len; ++i) {
            var tween = queue[i];
            if ( !tween || !tween.isAnimated() ) { continue; }

            if (tween.currentFrame < tween.totalFrames || tween.totalFrames === null)
            {
                tween.currentFrame += 1;
                
                if (tween.useSeconds) {
                    correctFrame(tween);
                }
                tween._onTween.fire();          
            }
            else { YAHOO.util.AnimMgr.stop(tween, i); }
        }
    };
    
    var getIndex = function(anim) {
        for (var i = 0, len = queue.length; i < len; ++i) {
            if (queue[i] == anim) {
                return i; // note return;
            }
        }
        return -1;
    };
    
    /**
     * On the fly frame correction to keep animation on time.
     * @method correctFrame
     * @private
     * @param {Object} tween The Anim instance being corrected.
     */
    var correctFrame = function(tween) {
        var frames = tween.totalFrames;
        var frame = tween.currentFrame;
        var expected = (tween.currentFrame * tween.duration * 1000 / tween.totalFrames);
        var elapsed = (new Date() - tween.getStartTime());
        var tweak = 0;
        
        if (elapsed < tween.duration * 1000) { // check if falling behind
            tweak = Math.round((elapsed / expected - 1) * tween.currentFrame);
        } else { // went over duration, so jump to end
            tweak = frames - (frame + 1); 
        }
        if (tweak > 0 && isFinite(tweak)) { // adjust if needed
            if (tween.currentFrame + tweak >= frames) {// dont go past last frame
                tweak = frames - (frame + 1);
            }
            
            tween.currentFrame += tweak;      
        }
    };
};
/**
 * Used to calculate Bezier splines for any number of control points.
 * @class Bezier
 * @namespace YAHOO.util
 *
 */
YAHOO.util.Bezier = new function() {
    /**
     * Get the current position of the animated element based on t.
     * Each point is an array of "x" and "y" values (0 = x, 1 = y)
     * At least 2 points are required (start and end).
     * First point is start. Last point is end.
     * Additional control points are optional.     
     * @method getPosition
     * @param {Array} points An array containing Bezier points
     * @param {Number} t A number between 0 and 1 which is the basis for determining current position
     * @return {Array} An array containing int x and y member data
     */
    this.getPosition = function(points, t) {  
        var n = points.length;
        var tmp = [];

        for (var i = 0; i < n; ++i){
            tmp[i] = [points[i][0], points[i][1]]; // save input
        }
        
        for (var j = 1; j < n; ++j) {
            for (i = 0; i < n - j; ++i) {
                tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
                tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1]; 
            }
        }
    
        return [ tmp[0][0], tmp[0][1] ]; 
    
    };
};
(function() {
/**
 * Anim subclass for color transitions.
 * <p>Usage: <code>var myAnim = new Y.ColorAnim(el, { backgroundColor: { from: '#FF0000', to: '#FFFFFF' } }, 1, Y.Easing.easeOut);</code> Color values can be specified with either 112233, #112233, 
 * [255,255,255], or rgb(255,255,255)</p>
 * @class ColorAnim
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {HTMLElement | String} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.
 * Each attribute is an object with at minimum a "to" or "by" member defined.
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var ColorAnim = function(el, attributes, duration,  method) {
        ColorAnim.superclass.constructor.call(this, el, attributes, duration, method);
    };
    
    ColorAnim.NAME = 'ColorAnim';

    ColorAnim.DEFAULT_BGCOLOR = '#fff';
    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(ColorAnim, Y.Anim);

    var superclass = ColorAnim.superclass;
    var proto = ColorAnim.prototype;
    
    proto.patterns.color = /color$/i;
    proto.patterns.rgb            = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    proto.patterns.hex            = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    proto.patterns.hex3          = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    proto.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/; // need rgba for safari
    
    /**
     * Attempts to parse the given string and return a 3-tuple.
     * @method parseColor
     * @param {String} s The string to parse.
     * @return {Array} The 3-tuple of rgb values.
     */
    proto.parseColor = function(s) {
        if (s.length == 3) { return s; }
    
        var c = this.patterns.hex.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16) ];
        }
    
        c = this.patterns.rgb.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
        }
    
        c = this.patterns.hex3.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16) ];
        }
        
        return null;
    };

    proto.getAttribute = function(attr) {
        var el = this.getEl();
        if (this.patterns.color.test(attr) ) {
            var val = YAHOO.util.Dom.getStyle(el, attr);
            
            var that = this;
            if (this.patterns.transparent.test(val)) { // bgcolor default
                var parent = YAHOO.util.Dom.getAncestorBy(el, function(node) {
                    return !that.patterns.transparent.test(val);
                });

                if (parent) {
                    val = Y.Dom.getStyle(parent, attr);
                } else {
                    val = ColorAnim.DEFAULT_BGCOLOR;
                }
            }
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };
    
    proto.doMethod = function(attr, start, end) {
        var val;
    
        if ( this.patterns.color.test(attr) ) {
            val = [];
            for (var i = 0, len = start.length; i < len; ++i) {
                val[i] = superclass.doMethod.call(this, attr, start[i], end[i]);
            }
            
            val = 'rgb('+Math.floor(val[0])+','+Math.floor(val[1])+','+Math.floor(val[2])+')';
        }
        else {
            val = superclass.doMethod.call(this, attr, start, end);
        }

        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        superclass.setRuntimeAttribute.call(this, attr);
        
        if ( this.patterns.color.test(attr) ) {
            var attributes = this.attributes;
            var start = this.parseColor(this.runtimeAttributes[attr].start);
            var end = this.parseColor(this.runtimeAttributes[attr].end);
            // fix colors if going "by"
            if ( typeof attributes[attr]['to'] === 'undefined' && typeof attributes[attr]['by'] !== 'undefined' ) {
                end = this.parseColor(attributes[attr].by);
            
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + end[i];
                }
            }
            
            this.runtimeAttributes[attr].start = start;
            this.runtimeAttributes[attr].end = end;
        }
    };

    Y.ColorAnim = ColorAnim;
})();
/*!
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Singleton that determines how an animation proceeds from start to end.
 * @class Easing
 * @namespace YAHOO.util
*/

YAHOO.util.Easing = {

    /**
     * Uniform speed between points.
     * @method easeNone
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeNone: function (t, b, c, d) {
    	return c*t/d + b;
    },
    
    /**
     * Begins slowly and accelerates towards end.
     * @method easeIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeIn: function (t, b, c, d) {
    	return c*(t/=d)*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.
     * @method easeOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOut: function (t, b, c, d) {
    	return -c *(t/=d)*(t-2) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end.
     * @method easeBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBoth: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t + b;
        }
        
    	return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    
    /**
     * Begins slowly and accelerates towards end.
     * @method easeInStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeInStrong: function (t, b, c, d) {
    	return c*(t/=d)*t*t*t + b;
    },
    
    /**
     * Begins quickly and decelerates towards end.
     * @method easeOutStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOutStrong: function (t, b, c, d) {
    	return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end.
     * @method easeBothStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBothStrong: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t*t*t + b;
        }
        
    	return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    /**
     * Snap in elastic effect.
     * @method elasticIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */

    elasticIn: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },

    /**
     * Snap out elastic effect.
     * @method elasticOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticOut: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    
    /**
     * Snap both elastic effect.
     * @method elasticBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticBoth: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        
        if ( (t /= d/2) == 2 ) {
            return b+c;
        }
        
        if (!p) {
            p = d*(.3*1.5);
        }
        
    	if ( !a || a < Math.abs(c) ) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	if (t < 1) {
            return -.5*(a*Math.pow(2,10*(t-=1)) * 
                    Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        }
    	return a*Math.pow(2,-10*(t-=1)) * 
                Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },


    /**
     * Backtracks slightly, then reverses direction and moves to end.
     * @method backIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backIn: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*(t/=d)*t*((s+1)*t - s) + b;
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     * @method backOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backOut: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    
    /**
     * Backtracks slightly, then reverses direction, overshoots end, 
     * then reverses and comes back to end.
     * @method backBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backBoth: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158; 
        }
        
    	if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        }
    	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },

    /**
     * Bounce off of start.
     * @method bounceIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceIn: function (t, b, c, d) {
    	return c - YAHOO.util.Easing.bounceOut(d-t, 0, c, d) + b;
    },
    
    /**
     * Bounces off end.
     * @method bounceOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceOut: function (t, b, c, d) {
    	if ((t/=d) < (1/2.75)) {
    		return c*(7.5625*t*t) + b;
    	} else if (t < (2/2.75)) {
    		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    	} else if (t < (2.5/2.75)) {
    		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    	}
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    },
    
    /**
     * Bounces off start and end.
     * @method bounceBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceBoth: function (t, b, c, d) {
    	if (t < d/2) {
            return YAHOO.util.Easing.bounceIn(t*2, 0, c, d) * .5 + b;
        }
    	return YAHOO.util.Easing.bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
};

(function() {
/**
 * Anim subclass for moving elements along a path defined by the "points" 
 * member of "attributes".  All "points" are arrays with x, y coordinates.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Motion(el, { points: { to: [800, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Motion
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @constructor
 * @extends YAHOO.util.ColorAnim
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var Motion = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            Motion.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };


    Motion.NAME = 'Motion';

    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(Motion, Y.ColorAnim);
    
    var superclass = Motion.superclass;
    var proto = Motion.prototype;

    proto.patterns.points = /^points$/i;
    
    proto.setAttribute = function(attr, val, unit) {
        if (  this.patterns.points.test(attr) ) {
            unit = unit || 'px';
            superclass.setAttribute.call(this, 'left', val[0], unit);
            superclass.setAttribute.call(this, 'top', val[1], unit);
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    proto.getAttribute = function(attr) {
        if (  this.patterns.points.test(attr) ) {
            var val = [
                superclass.getAttribute.call(this, 'left'),
                superclass.getAttribute.call(this, 'top')
            ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;

        if ( this.patterns.points.test(attr) ) {
            var t = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;				
            val = Y.Bezier.getPosition(this.runtimeAttributes[attr], t);
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        if ( this.patterns.points.test(attr) ) {
            var el = this.getEl();
            var attributes = this.attributes;
            var start;
            var control = attributes['points']['control'] || [];
            var end;
            var i, len;
            
            if (control.length > 0 && !(control[0] instanceof Array) ) { // could be single point or array of points
                control = [control];
            } else { // break reference to attributes.points.control
                var tmp = []; 
                for (i = 0, len = control.length; i< len; ++i) {
                    tmp[i] = control[i];
                }
                control = tmp;
            }

            if (Y.Dom.getStyle(el, 'position') == 'static') { // default to relative
                Y.Dom.setStyle(el, 'position', 'relative');
            }
    
            if ( isset(attributes['points']['from']) ) {
                Y.Dom.setXY(el, attributes['points']['from']); // set position to from point
            } 
            else { Y.Dom.setXY( el, Y.Dom.getXY(el) ); } // set it to current position
            
            start = this.getAttribute('points'); // get actual top & left
            
            // TO beats BY, per SMIL 2.1 spec
            if ( isset(attributes['points']['to']) ) {
                end = translateValues.call(this, attributes['points']['to'], start);
                
                var pageXY = Y.Dom.getXY(this.getEl());
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = translateValues.call(this, control[i], start);
                }

                
            } else if ( isset(attributes['points']['by']) ) {
                end = [ start[0] + attributes['points']['by'][0], start[1] + attributes['points']['by'][1] ];
                
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = [ start[0] + control[i][0], start[1] + control[i][1] ];
                }
            }

            this.runtimeAttributes[attr] = [start];
            
            if (control.length > 0) {
                this.runtimeAttributes[attr] = this.runtimeAttributes[attr].concat(control); 
            }

            this.runtimeAttributes[attr][this.runtimeAttributes[attr].length] = end;
        }
        else {
            superclass.setRuntimeAttribute.call(this, attr);
        }
    };
    
    var translateValues = function(val, start) {
        var pageXY = Y.Dom.getXY(this.getEl());
        val = [ val[0] - pageXY[0] + start[0], val[1] - pageXY[1] + start[1] ];

        return val; 
    };
    
    var isset = function(prop) {
        return (typeof prop !== 'undefined');
    };

    Y.Motion = Motion;
})();
(function() {
/**
 * Anim subclass for scrolling elements to a position defined by the "scroll"
 * member of "attributes".  All "scroll" members are arrays with x, y scroll positions.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Scroll(el, { scroll: { to: [0, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Scroll
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @extends YAHOO.util.ColorAnim
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var Scroll = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            Scroll.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    Scroll.NAME = 'Scroll';

    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(Scroll, Y.ColorAnim);
    
    var superclass = Scroll.superclass;
    var proto = Scroll.prototype;

    proto.doMethod = function(attr, start, end) {
        var val = null;
    
        if (attr == 'scroll') {
            val = [
                this.method(this.currentFrame, start[0], end[0] - start[0], this.totalFrames),
                this.method(this.currentFrame, start[1], end[1] - start[1], this.totalFrames)
            ];
            
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.getAttribute = function(attr) {
        var val = null;
        var el = this.getEl();
        
        if (attr == 'scroll') {
            val = [ el.scrollLeft, el.scrollTop ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }
        
        return val;
    };

    proto.setAttribute = function(attr, val, unit) {
        var el = this.getEl();
        
        if (attr == 'scroll') {
            el.scrollLeft = val[0];
            el.scrollTop = val[1];
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    Y.Scroll = Scroll;
})();
YAHOO.register("animation", YAHOO.util.Anim, {version: "2.6.0", build: "1321"});
/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
/**
 * The Connection Manager provides a simplified interface to the XMLHttpRequest
 * object.  It handles cross-browser instantiantion of XMLHttpRequest, negotiates the
 * interactive states and server response, returning the results to a pre-defined
 * callback you create.
 *
 * @namespace YAHOO.util
 * @module connection
 * @requires yahoo
 * @requires event
 */

/**
 * The Connection Manager singleton provides methods for creating and managing
 * asynchronous transactions.
 *
 * @class Connect
 */

YAHOO.util.Connect =
{
  /**
   * @description Array of MSFT ActiveX ids for XMLHttpRequest.
   * @property _msxml_progid
   * @private
   * @static
   * @type array
   */
	_msxml_progid:[
		'Microsoft.XMLHTTP',
		'MSXML2.XMLHTTP.3.0',
		'MSXML2.XMLHTTP'
		],

  /**
   * @description Object literal of HTTP header(s)
   * @property _http_header
   * @private
   * @static
   * @type object
   */
	_http_headers:{},

  /**
   * @description Determines if HTTP headers are set.
   * @property _has_http_headers
   * @private
   * @static
   * @type boolean
   */
	_has_http_headers:false,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to any client HTTP headers sent for POST
  * transactions.
  * @property _use_default_post_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_post_header:true,

 /**
  * @description The default header used for POST transactions.
  * @property _default_post_header
  * @private
  * @static
  * @type boolean
  */
    _default_post_header:'application/x-www-form-urlencoded; charset=UTF-8',

 /**
  * @description The default header used for transactions involving the
  * use of HTML forms.
  * @property _default_form_header
  * @private
  * @static
  * @type boolean
  */
    _default_form_header:'application/x-www-form-urlencoded',

 /**
  * @description Determines if a default header of
  * 'X-Requested-With: XMLHttpRequest'
  * will be added to each transaction.
  * @property _use_default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_xhr_header:true,

 /**
  * @description The default header value for the label
  * "X-Requested-With".  This is sent with each
  * transaction, by default, to identify the
  * request as being made by YUI Connection Manager.
  * @property _default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _default_xhr_header:'XMLHttpRequest',

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _has_default_headers:true,

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _default_headers:{},

 /**
  * @description Property modified by setForm() to determine if the data
  * should be submitted as an HTML form.
  * @property _isFormSubmit
  * @private
  * @static
  * @type boolean
  */
    _isFormSubmit:false,

 /**
  * @description Property modified by setForm() to determine if a file(s)
  * upload is expected.
  * @property _isFileUpload
  * @private
  * @static
  * @type boolean
  */
    _isFileUpload:false,

 /**
  * @description Property modified by setForm() to set a reference to the HTML
  * form node if the desired action is file upload.
  * @property _formNode
  * @private
  * @static
  * @type object
  */
    _formNode:null,

 /**
  * @description Property modified by setForm() to set the HTML form data
  * for each transaction.
  * @property _sFormData
  * @private
  * @static
  * @type string
  */
    _sFormData:null,

 /**
  * @description Collection of polling references to the polling mechanism in handleReadyState.
  * @property _poll
  * @private
  * @static
  * @type object
  */
    _poll:{},

 /**
  * @description Queue of timeout values for each transaction callback with a defined timeout value.
  * @property _timeOut
  * @private
  * @static
  * @type object
  */
    _timeOut:{},

  /**
   * @description The polling frequency, in milliseconds, for HandleReadyState.
   * when attempting to determine a transaction's XHR readyState.
   * The default is 50 milliseconds.
   * @property _polling_interval
   * @private
   * @static
   * @type int
   */
     _polling_interval:50,

  /**
   * @description A transaction counter that increments the transaction id for each transaction.
   * @property _transaction_id
   * @private
   * @static
   * @type int
   */
     _transaction_id:0,

  /**
   * @description Tracks the name-value pair of the "clicked" submit button if multiple submit
   * buttons are present in an HTML form; and, if YAHOO.util.Event is available.
   * @property _submitElementValue
   * @private
   * @static
   * @type string
   */
	 _submitElementValue:null,

  /**
   * @description Determines whether YAHOO.util.Event is available and returns true or false.
   * If true, an event listener is bound at the document level to trap click events that
   * resolve to a target type of "Submit".  This listener will enable setForm() to determine
   * the clicked "Submit" value in a multi-Submit button, HTML form.
   * @property _hasSubmitListener
   * @private
   * @static
   */
	 _hasSubmitListener:(function()
	 {
		if(YAHOO.util.Event){
			YAHOO.util.Event.addListener(
				document,
				'click',
				function(e){
					var obj = YAHOO.util.Event.getTarget(e);
					if(obj.nodeName.toLowerCase() == 'input' && (obj.type && obj.type.toLowerCase() == 'submit')){
						YAHOO.util.Connect._submitElementValue = encodeURIComponent(obj.name) + "=" + encodeURIComponent(obj.value);
					}
				});
			return true;
	    }
	    return false;
	 })(),

  /**
   * @description Custom event that fires at the start of a transaction
   * @property startEvent
   * @private
   * @static
   * @type CustomEvent
   */
	startEvent: new YAHOO.util.CustomEvent('start'),

  /**
   * @description Custom event that fires when a transaction response has completed.
   * @property completeEvent
   * @private
   * @static
   * @type CustomEvent
   */
	completeEvent: new YAHOO.util.CustomEvent('complete'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 2xx range.
   * @property successEvent
   * @private
   * @static
   * @type CustomEvent
   */
	successEvent: new YAHOO.util.CustomEvent('success'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 4xx/5xx range.
   * @property failureEvent
   * @private
   * @static
   * @type CustomEvent
   */
	failureEvent: new YAHOO.util.CustomEvent('failure'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 4xx/5xx range.
   * @property failureEvent
   * @private
   * @static
   * @type CustomEvent
   */
	uploadEvent: new YAHOO.util.CustomEvent('upload'),

  /**
   * @description Custom event that fires when a transaction is successfully aborted.
   * @property abortEvent
   * @private
   * @static
   * @type CustomEvent
   */
	abortEvent: new YAHOO.util.CustomEvent('abort'),

  /**
   * @description A reference table that maps callback custom events members to its specific
   * event name.
   * @property _customEvents
   * @private
   * @static
   * @type object
   */
	_customEvents:
	{
		onStart:['startEvent', 'start'],
		onComplete:['completeEvent', 'complete'],
		onSuccess:['successEvent', 'success'],
		onFailure:['failureEvent', 'failure'],
		onUpload:['uploadEvent', 'upload'],
		onAbort:['abortEvent', 'abort']
	},

  /**
   * @description Member to add an ActiveX id to the existing xml_progid array.
   * In the event(unlikely) a new ActiveX id is introduced, it can be added
   * without internal code modifications.
   * @method setProgId
   * @public
   * @static
   * @param {string} id The ActiveX id to be added to initialize the XHR object.
   * @return void
   */
	setProgId:function(id)
	{
		this._msxml_progid.unshift(id);
	},

  /**
   * @description Member to override the default POST header.
   * @method setDefaultPostHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultPostHeader:function(b)
	{
		if(typeof b == 'string'){
			this._default_post_header = b;
		}
		else if(typeof b == 'boolean'){
			this._use_default_post_header = b;
		}
	},

  /**
   * @description Member to override the default transaction header..
   * @method setDefaultXhrHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultXhrHeader:function(b)
	{
		if(typeof b == 'string'){
			this._default_xhr_header = b;
		}
		else{
			this._use_default_xhr_header = b;
		}
	},

  /**
   * @description Member to modify the default polling interval.
   * @method setPollingInterval
   * @public
   * @static
   * @param {int} i The polling interval in milliseconds.
   * @return void
   */
	setPollingInterval:function(i)
	{
		if(typeof i == 'number' && isFinite(i)){
			this._polling_interval = i;
		}
	},

  /**
   * @description Instantiates a XMLHttpRequest object and returns an object with two properties:
   * the XMLHttpRequest instance and the transaction id.
   * @method createXhrObject
   * @private
   * @static
   * @param {int} transactionId Property containing the transaction id for this transaction.
   * @return object
   */
	createXhrObject:function(transactionId)
	{
		var obj,http;
		try
		{
			// Instantiates XMLHttpRequest in non-IE browsers and assigns to http.
			http = new XMLHttpRequest();
			//  Object literal with http and tId properties
			obj = { conn:http, tId:transactionId };
		}
		catch(e)
		{
			for(var i=0; i<this._msxml_progid.length; ++i){
				try
				{
					// Instantiates XMLHttpRequest for IE and assign to http
					http = new ActiveXObject(this._msxml_progid[i]);
					//  Object literal with conn and tId properties
					obj = { conn:http, tId:transactionId };
					break;
				}
				catch(e2){}
			}
		}
		finally
		{
			return obj;
		}
	},

  /**
   * @description This method is called by asyncRequest to create a
   * valid connection object for the transaction.  It also passes a
   * transaction id and increments the transaction id counter.
   * @method getConnectionObject
   * @private
   * @static
   * @return {object}
   */
	getConnectionObject:function(isFileUpload)
	{
		var o;
		var tId = this._transaction_id;

		try
		{
			if(!isFileUpload){
				o = this.createXhrObject(tId);
			}
			else{
				o = {};
				o.tId = tId;
				o.isUpload = true;
			}

			if(o){
				this._transaction_id++;
			}
		}
		catch(e){}
		finally
		{
			return o;
		}
	},

  /**
   * @description Method for initiating an asynchronous request via the XHR object.
   * @method asyncRequest
   * @public
   * @static
   * @param {string} method HTTP transaction method
   * @param {string} uri Fully qualified path of resource
   * @param {callback} callback User-defined callback function or object
   * @param {string} postData POST body
   * @return {object} Returns the connection object
   */
	asyncRequest:function(method, uri, callback, postData)
	{
		var o = (this._isFileUpload)?this.getConnectionObject(true):this.getConnectionObject();
		var args = (callback && callback.argument)?callback.argument:null;

		if(!o){
			return null;
		}
		else{

			// Intialize any transaction-specific custom events, if provided.
			if(callback && callback.customevents){
				this.initCustomEvents(o, callback);
			}

			if(this._isFormSubmit){
				if(this._isFileUpload){
					this.uploadFile(o, callback, uri, postData);
					return o;
				}

				// If the specified HTTP method is GET, setForm() will return an
				// encoded string that is concatenated to the uri to
				// create a querystring.
				if(method.toUpperCase() == 'GET'){
					if(this._sFormData.length !== 0){
						// If the URI already contains a querystring, append an ampersand
						// and then concatenate _sFormData to the URI.
						uri += ((uri.indexOf('?') == -1)?'?':'&') + this._sFormData;
					}
				}
				else if(method.toUpperCase() == 'POST'){
					// If POST data exist in addition to the HTML form data,
					// it will be concatenated to the form data.
					postData = postData?this._sFormData + "&" + postData:this._sFormData;
				}
			}

			if(method.toUpperCase() == 'GET' && (callback && callback.cache === false)){
				// If callback.cache is defined and set to false, a
				// timestamp value will be added to the querystring.
				uri += ((uri.indexOf('?') == -1)?'?':'&') + "rnd=" + new Date().valueOf().toString();
			}

			o.conn.open(method, uri, true);

			// Each transaction will automatically include a custom header of
			// "X-Requested-With: XMLHttpRequest" to identify the request as
			// having originated from Connection Manager.
			if(this._use_default_xhr_header){
				if(!this._default_headers['X-Requested-With']){
					this.initHeader('X-Requested-With', this._default_xhr_header, true);
				}
			}

			//If the transaction method is POST and the POST header value is set to true
			//or a custom value, initalize the Content-Type header to this value.
			if((method.toUpperCase() === 'POST' && this._use_default_post_header) && this._isFormSubmit === false){
				this.initHeader('Content-Type', this._default_post_header);
			}

			//Initialize all default and custom HTTP headers,
			if(this._has_default_headers || this._has_http_headers){
				this.setHeader(o);
			}

			this.handleReadyState(o, callback);
			o.conn.send(postData || '');


			// Reset the HTML form data and state properties as
			// soon as the data are submitted.
			if(this._isFormSubmit === true){
				this.resetFormState();
			}

			// Fire global custom event -- startEvent
			this.startEvent.fire(o, args);

			if(o.startEvent){
				// Fire transaction custom event -- startEvent
				o.startEvent.fire(o, args);
			}

			return o;
		}
	},

  /**
   * @description This method creates and subscribes custom events,
   * specific to each transaction
   * @method initCustomEvents
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */
	initCustomEvents:function(o, callback)
	{
		var prop;
		// Enumerate through callback.customevents members and bind/subscribe
		// events that match in the _customEvents table.
		for(prop in callback.customevents){
			if(this._customEvents[prop][0]){
				// Create the custom event
				o[this._customEvents[prop][0]] = new YAHOO.util.CustomEvent(this._customEvents[prop][1], (callback.scope)?callback.scope:null);

				// Subscribe the custom event
				o[this._customEvents[prop][0]].subscribe(callback.customevents[prop]);
			}
		}
	},

  /**
   * @description This method serves as a timer that polls the XHR object's readyState
   * property during a transaction, instead of binding a callback to the
   * onreadystatechange event.  Upon readyState 4, handleTransactionResponse
   * will process the response, and the timer will be cleared.
   * @method handleReadyState
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */

    handleReadyState:function(o, callback)

    {
		var oConn = this;
		var args = (callback && callback.argument)?callback.argument:null;

		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		this._poll[o.tId] = window.setInterval(
			function(){
				if(o.conn && o.conn.readyState === 4){

					// Clear the polling interval for the transaction
					// and remove the reference from _poll.
					window.clearInterval(oConn._poll[o.tId]);
					delete oConn._poll[o.tId];

					if(callback && callback.timeout){
						window.clearTimeout(oConn._timeOut[o.tId]);
						delete oConn._timeOut[o.tId];
					}

					// Fire global custom event -- completeEvent
					oConn.completeEvent.fire(o, args);

					if(o.completeEvent){
						// Fire transaction custom event -- completeEvent
						o.completeEvent.fire(o, args);
					}

					oConn.handleTransactionResponse(o, callback);
				}
			}
		,this._polling_interval);
    },

  /**
   * @description This method attempts to interpret the server response and
   * determine whether the transaction was successful, or if an error or
   * exception was encountered.
   * @method handleTransactionResponse
   * @private
   * @static
   * @param {object} o The connection object
   * @param {object} callback The user-defined callback object
   * @param {boolean} isAbort Determines if the transaction was terminated via abort().
   * @return {void}
   */
    handleTransactionResponse:function(o, callback, isAbort)
    {
		var httpStatus, responseObject;
		var args = (callback && callback.argument)?callback.argument:null;

		try
		{
			if(o.conn.status !== undefined && o.conn.status !== 0){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch(e){

			 // 13030 is a custom code to indicate the condition -- in Mozilla/FF --
			 // when the XHR object's status and statusText properties are
			 // unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}

		if(httpStatus >= 200 && httpStatus < 300 || httpStatus === 1223){
			responseObject = this.createResponseObject(o, args);
			if(callback && callback.success){
				if(!callback.scope){
					callback.success(responseObject);
				}
				else{
					// If a scope property is defined, the callback will be fired from
					// the context of the object.
					callback.success.apply(callback.scope, [responseObject]);
				}
			}

			// Fire global custom event -- successEvent
			this.successEvent.fire(responseObject);

			if(o.successEvent){
				// Fire transaction custom event -- successEvent
				o.successEvent.fire(responseObject);
			}
		}
		else{
			switch(httpStatus){
				// The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					responseObject = this.createExceptionObject(o.tId, args, (isAbort?isAbort:false));
					if(callback && callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}

					break;
				default:
					responseObject = this.createResponseObject(o, args);
					if(callback && callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}
			}

			// Fire global custom event -- failureEvent
			this.failureEvent.fire(responseObject);

			if(o.failureEvent){
				// Fire transaction custom event -- failureEvent
				o.failureEvent.fire(responseObject);
			}

		}

		this.releaseObject(o);
		responseObject = null;
    },

  /**
   * @description This method evaluates the server response, creates and returns the results via
   * its properties.  Success and failure cases will differ in the response
   * object's property values.
   * @method createResponseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @return {object}
   */
    createResponseObject:function(o, callbackArg)
    {
		var obj = {};
		var headerObj = {};

		try
		{
			var headerStr = o.conn.getAllResponseHeaders();
			var header = headerStr.split('\n');
			for(var i=0; i<header.length; i++){
				var delimitPos = header[i].indexOf(':');
				if(delimitPos != -1){
					headerObj[header[i].substring(0,delimitPos)] = header[i].substring(delimitPos+2);
				}
			}
		}
		catch(e){}

		obj.tId = o.tId;
		// Normalize IE's response to HTTP 204 when Win error 1223.
		obj.status = (o.conn.status == 1223)?204:o.conn.status;
		// Normalize IE's statusText to "No Content" instead of "Unknown".
		obj.statusText = (o.conn.status == 1223)?"No Content":o.conn.statusText;
		obj.getResponseHeader = headerObj;
		obj.getAllResponseHeaders = headerStr;
		obj.responseText = o.conn.responseText;
		obj.responseXML = o.conn.responseXML;

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description If a transaction cannot be completed due to dropped or closed connections,
   * there may be not be enough information to build a full response object.
   * The failure callback will be fired and this specific condition can be identified
   * by a status property value of 0.
   *
   * If an abort was successful, the status property will report a value of -1.
   *
   * @method createExceptionObject
   * @private
   * @static
   * @param {int} tId The Transaction Id
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @param {boolean} isAbort Determines if the exception case is caused by a transaction abort
   * @return {object}
   */
    createExceptionObject:function(tId, callbackArg, isAbort)
    {
		var COMM_CODE = 0;
		var COMM_ERROR = 'communication failure';
		var ABORT_CODE = -1;
		var ABORT_ERROR = 'transaction aborted';

		var obj = {};

		obj.tId = tId;
		if(isAbort){
			obj.status = ABORT_CODE;
			obj.statusText = ABORT_ERROR;
		}
		else{
			obj.status = COMM_CODE;
			obj.statusText = COMM_ERROR;
		}

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description Method that initializes the custom HTTP headers for the each transaction.
   * @method initHeader
   * @public
   * @static
   * @param {string} label The HTTP header label
   * @param {string} value The HTTP header value
   * @param {string} isDefault Determines if the specific header is a default header
   * automatically sent with each transaction.
   * @return {void}
   */
	initHeader:function(label, value, isDefault)
	{
		var headerObj = (isDefault)?this._default_headers:this._http_headers;
		headerObj[label] = value;

		if(isDefault){
			this._has_default_headers = true;
		}
		else{
			this._has_http_headers = true;
		}
	},


  /**
   * @description Accessor that sets the HTTP headers for each transaction.
   * @method setHeader
   * @private
   * @static
   * @param {object} o The connection object for the transaction.
   * @return {void}
   */
	setHeader:function(o)
	{
		var prop;
		if(this._has_default_headers){
			for(prop in this._default_headers){
				if(YAHOO.lang.hasOwnProperty(this._default_headers, prop)){
					o.conn.setRequestHeader(prop, this._default_headers[prop]);
				}
			}
		}

		if(this._has_http_headers){
			for(prop in this._http_headers){
				if(YAHOO.lang.hasOwnProperty(this._http_headers, prop)){
					o.conn.setRequestHeader(prop, this._http_headers[prop]);
				}
			}
			delete this._http_headers;

			this._http_headers = {};
			this._has_http_headers = false;
		}
	},

  /**
   * @description Resets the default HTTP headers object
   * @method resetDefaultHeaders
   * @public
   * @static
   * @return {void}
   */
	resetDefaultHeaders:function(){
		delete this._default_headers;
		this._default_headers = {};
		this._has_default_headers = false;
	},

  /**
   * @description This method assembles the form label and value pairs and
   * constructs an encoded string.
   * asyncRequest() will automatically initialize the transaction with a
   * a HTTP header Content-Type of application/x-www-form-urlencoded.
   * @method setForm
   * @public
   * @static
   * @param {string || object} form id or name attribute, or form object.
   * @param {boolean} optional enable file upload.
   * @param {boolean} optional enable file upload over SSL in IE only.
   * @return {string} string of the HTML form field name and value pairs..
   */
	setForm:function(formId, isUpload, secureUri)
	{
        var oForm, oElement, oName, oValue, oDisabled,
            hasSubmit = false,
            data = [], item = 0,
            i,len,j,jlen,opt;

		this.resetFormState();

		if(typeof formId == 'string'){
			// Determine if the argument is a form id or a form name.
			// Note form name usage is deprecated by supported
			// here for legacy reasons.
			oForm = (document.getElementById(formId) || document.forms[formId]);
		}
		else if(typeof formId == 'object'){
			// Treat argument as an HTML form object.
			oForm = formId;
		}
		else{
			return;
		}

		// If the isUpload argument is true, setForm will call createFrame to initialize
		// an iframe as the form target.
		//
		// The argument secureURI is also required by IE in SSL environments
		// where the secureURI string is a fully qualified HTTP path, used to set the source
		// of the iframe, to a stub resource in the same domain.
		if(isUpload){

			// Create iframe in preparation for file upload.
			this.createFrame(secureUri?secureUri:null);

			// Set form reference and file upload properties to true.
			this._isFormSubmit = true;
			this._isFileUpload = true;
			this._formNode = oForm;

			return;

		}

		// Iterate over the form elements collection to construct the
		// label-value pairs.
		for (i=0,len=oForm.elements.length; i<len; ++i){
			oElement  = oForm.elements[i];
			oDisabled = oElement.disabled;
            oName     = oElement.name;

			// Do not submit fields that are disabled or
			// do not have a name attribute value.
			if(!oDisabled && oName)
			{
                oName  = encodeURIComponent(oName)+'=';
                oValue = encodeURIComponent(oElement.value);

				switch(oElement.type)
				{
                    // Safari, Opera, FF all default opt.value from .text if
                    // value attribute not specified in markup
					case 'select-one':
                        if (oElement.selectedIndex > -1) {
                            opt = oElement.options[oElement.selectedIndex];
                            data[item++] = oName + encodeURIComponent(
                                (opt.attributes.value && opt.attributes.value.specified) ? opt.value : opt.text);
                        }
                        break;
					case 'select-multiple':
                        if (oElement.selectedIndex > -1) {
                            for(j=oElement.selectedIndex, jlen=oElement.options.length; j<jlen; ++j){
                                opt = oElement.options[j];
                                if (opt.selected) {
                                    data[item++] = oName + encodeURIComponent(
                                        (opt.attributes.value && opt.attributes.value.specified) ? opt.value : opt.text);
                                }
                            }
                        }
						break;
					case 'radio':
					case 'checkbox':
						if(oElement.checked){
                            data[item++] = oName + oValue;
						}
						break;
					case 'file':
						// stub case as XMLHttpRequest will only send the file path as a string.
					case undefined:
						// stub case for fieldset element which returns undefined.
					case 'reset':
						// stub case for input type reset button.
					case 'button':
						// stub case for input type button elements.
						break;
					case 'submit':
						if(hasSubmit === false){
							if(this._hasSubmitListener && this._submitElementValue){
                                data[item++] = this._submitElementValue;
							}
							else{
                                data[item++] = oName + oValue;
							}

							hasSubmit = true;
						}
						break;
					default:
                        data[item++] = oName + oValue;
				}
			}
		}

		this._isFormSubmit = true;
		this._sFormData = data.join('&');


		this.initHeader('Content-Type', this._default_form_header);

		return this._sFormData;
	},

  /**
   * @description Resets HTML form properties when an HTML form or HTML form
   * with file upload transaction is sent.
   * @method resetFormState
   * @private
   * @static
   * @return {void}
   */
	resetFormState:function(){
		this._isFormSubmit = false;
		this._isFileUpload = false;
		this._formNode = null;
		this._sFormData = "";
	},

  /**
   * @description Creates an iframe to be used for form file uploads.  It is remove from the
   * document upon completion of the upload transaction.
   * @method createFrame
   * @private
   * @static
   * @param {string} optional qualified path of iframe resource for SSL in IE.
   * @return {void}
   */
	createFrame:function(secureUri){

		// IE does not allow the setting of id and name attributes as object
		// properties via createElement().  A different iframe creation
		// pattern is required for IE.
		var frameId = 'yuiIO' + this._transaction_id;
		var io;
		if(YAHOO.env.ua.ie){
			io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');

			// IE will throw a security exception in an SSL environment if the
			// iframe source is undefined.
			if(typeof secureUri == 'boolean'){
				io.src = 'javascript:false';
			}
		}
		else{
			io = document.createElement('iframe');
			io.id = frameId;
			io.name = frameId;
		}

		io.style.position = 'absolute';
		io.style.top = '-1000px';
		io.style.left = '-1000px';

		document.body.appendChild(io);
	},

  /**
   * @description Parses the POST data and creates hidden form elements
   * for each key-value, and appends them to the HTML form object.
   * @method appendPostData
   * @private
   * @static
   * @param {string} postData The HTTP POST data
   * @return {array} formElements Collection of hidden fields.
   */
	appendPostData:function(postData)
	{
		var formElements = [],
			postMessage = postData.split('&'),
			i, delimitPos;
		for(i=0; i < postMessage.length; i++){
			delimitPos = postMessage[i].indexOf('=');
			if(delimitPos != -1){
				formElements[i] = document.createElement('input');
				formElements[i].type = 'hidden';
				formElements[i].name = decodeURIComponent(postMessage[i].substring(0,delimitPos));
				formElements[i].value = decodeURIComponent(postMessage[i].substring(delimitPos+1));
				this._formNode.appendChild(formElements[i]);
			}
		}

		return formElements;
	},

  /**
   * @description Uploads HTML form, inclusive of files/attachments, using the
   * iframe created in createFrame to facilitate the transaction.
   * @method uploadFile
   * @private
   * @static
   * @param {int} id The transaction id.
   * @param {object} callback User-defined callback object.
   * @param {string} uri Fully qualified path of resource.
   * @param {string} postData POST data to be submitted in addition to HTML form.
   * @return {void}
   */
	uploadFile:function(o, callback, uri, postData){

		// Each iframe has an id prefix of "yuiIO" followed
		// by the unique transaction id.
		var frameId = 'yuiIO' + o.tId,
		    uploadEncoding = 'multipart/form-data',
		    io = document.getElementById(frameId),
		    oConn = this,
			args = (callback && callback.argument)?callback.argument:null,
            oElements,i,prop,obj;

		// Track original HTML form attribute values.
		var rawFormAttributes =
		{
			action:this._formNode.getAttribute('action'),
			method:this._formNode.getAttribute('method'),
			target:this._formNode.getAttribute('target')
		};

		// Initialize the HTML form properties in case they are
		// not defined in the HTML form.
		this._formNode.setAttribute('action', uri);
		this._formNode.setAttribute('method', 'POST');
		this._formNode.setAttribute('target', frameId);

		if(YAHOO.env.ua.ie){
			// IE does not respect property enctype for HTML forms.
			// Instead it uses the property - "encoding".
			this._formNode.setAttribute('encoding', uploadEncoding);
		}
		else{
			this._formNode.setAttribute('enctype', uploadEncoding);
		}

		if(postData){
			oElements = this.appendPostData(postData);
		}

		// Start file upload.
		this._formNode.submit();

		// Fire global custom event -- startEvent
		this.startEvent.fire(o, args);

		if(o.startEvent){
			// Fire transaction custom event -- startEvent
			o.startEvent.fire(o, args);
		}

		// Start polling if a callback is present and the timeout
		// property has been defined.
		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		// Remove HTML elements created by appendPostData
		if(oElements && oElements.length > 0){
			for(i=0; i < oElements.length; i++){
				this._formNode.removeChild(oElements[i]);
			}
		}

		// Restore HTML form attributes to their original
		// values prior to file upload.
		for(prop in rawFormAttributes){
			if(YAHOO.lang.hasOwnProperty(rawFormAttributes, prop)){
				if(rawFormAttributes[prop]){
					this._formNode.setAttribute(prop, rawFormAttributes[prop]);
				}
				else{
					this._formNode.removeAttribute(prop);
				}
			}
		}

		// Reset HTML form state properties.
		this.resetFormState();

		// Create the upload callback handler that fires when the iframe
		// receives the load event.  Subsequently, the event handler is detached
		// and the iframe removed from the document.
		var uploadCallback = function()
		{
			if(callback && callback.timeout){
				window.clearTimeout(oConn._timeOut[o.tId]);
				delete oConn._timeOut[o.tId];
			}

			// Fire global custom event -- completeEvent
			oConn.completeEvent.fire(o, args);

			if(o.completeEvent){
				// Fire transaction custom event -- completeEvent
				o.completeEvent.fire(o, args);
			}

			obj = {
			    tId : o.tId,
			    argument : callback.argument
            };

			try
			{
				// responseText and responseXML will be populated with the same data from the iframe.
				// Since the HTTP headers cannot be read from the iframe
				obj.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:io.contentWindow.document.documentElement.textContent;
				obj.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
			}
			catch(e){}

			if(callback && callback.upload){
				if(!callback.scope){
					callback.upload(obj);
				}
				else{
					callback.upload.apply(callback.scope, [obj]);
				}
			}

			// Fire global custom event -- uploadEvent
			oConn.uploadEvent.fire(obj);

			if(o.uploadEvent){
				// Fire transaction custom event -- uploadEvent
				o.uploadEvent.fire(obj);
			}

			YAHOO.util.Event.removeListener(io, "load", uploadCallback);

			setTimeout(
				function(){
					document.body.removeChild(io);
					oConn.releaseObject(o);
				}, 100);
		};

		// Bind the onload handler to the iframe to detect the file upload response.
		YAHOO.util.Event.addListener(io, "load", uploadCallback);
	},

  /**
   * @description Method to terminate a transaction, if it has not reached readyState 4.
   * @method abort
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest.
   * @param {object} callback  User-defined callback object.
   * @param {string} isTimeout boolean to indicate if abort resulted from a callback timeout.
   * @return {boolean}
   */
	abort:function(o, callback, isTimeout)
	{
		var abortStatus;
		var args = (callback && callback.argument)?callback.argument:null;


		if(o && o.conn){
			if(this.isCallInProgress(o)){
				// Issue abort request
				o.conn.abort();

				window.clearInterval(this._poll[o.tId]);
				delete this._poll[o.tId];

				if(isTimeout){
					window.clearTimeout(this._timeOut[o.tId]);
					delete this._timeOut[o.tId];
				}

				abortStatus = true;
			}
		}
		else if(o && o.isUpload === true){
			var frameId = 'yuiIO' + o.tId;
			var io = document.getElementById(frameId);

			if(io){
				// Remove all listeners on the iframe prior to
				// its destruction.
				YAHOO.util.Event.removeListener(io, "load");
				// Destroy the iframe facilitating the transaction.
				document.body.removeChild(io);

				if(isTimeout){
					window.clearTimeout(this._timeOut[o.tId]);
					delete this._timeOut[o.tId];
				}

				abortStatus = true;
			}
		}
		else{
			abortStatus = false;
		}

		if(abortStatus === true){
			// Fire global custom event -- abortEvent
			this.abortEvent.fire(o, args);

			if(o.abortEvent){
				// Fire transaction custom event -- abortEvent
				o.abortEvent.fire(o, args);
			}

			this.handleTransactionResponse(o, callback, true);
		}

		return abortStatus;
	},

  /**
   * @description Determines if the transaction is still being processed.
   * @method isCallInProgress
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest
   * @return {boolean}
   */
	isCallInProgress:function(o)
	{
		// if the XHR object assigned to the transaction has not been dereferenced,
		// then check its readyState status.  Otherwise, return false.
		if(o && o.conn){
			return o.conn.readyState !== 4 && o.conn.readyState !== 0;
		}
		else if(o && o.isUpload === true){
			var frameId = 'yuiIO' + o.tId;
			return document.getElementById(frameId)?true:false;
		}
		else{
			return false;
		}
	},

  /**
   * @description Dereference the XHR instance and the connection object after the transaction is completed.
   * @method releaseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @return {void}
   */
	releaseObject:function(o)
	{
		if(o && o.conn){
			//dereference the XHR instance.
			o.conn = null;


			//dereference the connection object.
			o = null;
		}
	}
};
YAHOO.register("connection", YAHOO.util.Connect, {version: "2.6.0", build: "1321"});
/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * Extending YAHOO.lang.
 * @requires YAHOO.lang
 */

/**
 * @class YAHOO.lang
 * @static
 */
(function() {    
    var _YL = YAHOO.lang,
        _YUA = YAHOO.env.ua;

	var _that = {

        /**
         * The error text to throw when a method is not implemetented.
         * @property ERROR_NOT_IMPLEMENTED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_IMPLEMENTED: 'Method "??.??" not available without including "??" in your library.',

        /**
         * The error text to throw when invalid parameters are passed into a method.
         * @property ERROR_INVALID_PARAMETERS
         * @type String
         * @static
         * @final
         */
        ERROR_INVALID_PARAMETERS: 'Method "??.??" is missing required parameter of (??) "??".',

        /**
         * The error text to throw when a required value is not defined.
         * @property ERROR_NOT_DEFINED
         * @type String
         * @static
         * @final
         */
        ERROR_NOT_DEFINED: '?? - "??" not defined, unable to ?? "??"',

        /**
         * The error text to throw when an object is missing a required key.
         * @property ERROR_MALFORMED_OBJECT
         * @type String
         * @static
         * @final
         */
        ERROR_MALFORMED_OBJECT: '?? - Object "??" does not contain required parameter (??) "??"',

        /**
		 * Iterates on the provided array and calls provided function with the value of each index.
		 * @method arrayWalk
		 * @param arr {Array} Required. The array or array-like object to iterate on (must have a length).
		 * @param fx {Function} Required. The function to execute.
		 * @param scope {Object} Optional. The execution scope.
		 * @static
		 */
		arrayWalk: function(arr, fx, scope) {
			if (! (arr || arr.length)) {return;}
			var n = arr.length;
			for (var i = 0; i < n; i+= 1) {
				var o = fx.call(scope || window, arr[i], i);
				if (_YL.isDefined(o)) {return o;}
			}
		},

		/**
		 * Wrapper for simple lazy-loading functions.
		 * @method callLazy
		 * @param callback {Function} Required. The callback method.
		 * @param isReady {Function} Required. The is ready test function.
		 * @param conf {Object} Optional. Configuration options for execution.
		 *          failure: {Function} The method to call if max iteration is reached.
		 *          maxExec: {Number} The maximum number of time to execute; default is 25.
		 *          timeout: {Number} The number of milliseconds to wait before checking 'isReady'; default is 100ms.
		 *          params: {Object} An object to pass through to callback function.
		 * @static
		 */
		callLazy: function(callback, isReady, conf) {
            // define cfg and set default values
            var cfg = _YL.isObject(conf) ? conf : {};
            if (! (0 < cfg.maxExec)) {cfg.maxExec = 25;}
            if (! (0 < cfg.timeout)) {cfg.timeout = 100;}
            if (! _YL.isFunction(callback)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', typeof callback, callback);}
            if (! _YL.isFunction(isReady)) {_YL.throwError(_YL.ERROR_INVALID_PARAMETERS, 'YAHOO.lang', 'callLazy', typeof isReady, isReady);}

            var fx = function(index) {
                // index does not yet exceed maxExec
                if (cfg.maxExec > index) {
                    if (isReady()) {
                        callback(cfg.params);
                    }
                    else {
					    setTimeout(function() {fx.call(this, index + 1);}, cfg.timeout);
                    }
                }
                // exceeding maxExec; terminate
                else {
                    // was a failutre function provided
                    if (_YL.isFunction(cfg.failure)) {
                        cfg.failure(fx, cfg, i);
                    }
                }
            };

            fx(0);
		},

        /**
         * Provides a safe method for executing a for ... in" loop on the provided object, calling the function with the object and key.
         * @method forEach
         * @param obj {Object} Required. The object to loop through.
         * @param fx {Function} Required. The callback function.
         * @static
         */
        forEach: function(obj, fx) {
            if (! (_YL.isDefined(obj) && _YL.isFunction(fx))) {return;}
    
            // iterate on the keys in data
            for (var k in obj) {
                var o = obj[k];

                if (! _YL.isFunction(o)) { // ignore functions
                    fx(o, k);
                }
            }
        },

        /**
         * Evaluates if the provided object is an arguments object or not.
         * @method isArgument
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is an argument.
         * @static
         */
        isArgument: function(o) {
            return _YL.isObject(o) && o.callee;
        },

        /**
         * Evaluates if the provided object is an Date object or not; the special "o.length" check is for Array-Like object that may not have 'constructor'.
         * @method isDate
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a Date.
         * @static
         */
        isDate: function(o) {
            return _YL.isObject(o) && _YL.isUndefined(o.length) && Date === o.constructor;
        },

        /**
         * Evaluates if the provided object is defined or not; defined means not NULL and not UNDEFINED. Slightly more performance than YAHOO.lang.isValue.
         * @see YAHOO.lang.isValue
         * @method isDefined
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a defined.
         * @static
         */
        isDefined: function(o) {
		    return o || ! (undefined === o || null === o);
        },

        /**
         * Test if the client browser is firefox.
         * @method isFireFox
         * @return {Boolean} The client is firefox.
         * @static
         */
        isFireFox: function() {
            /** @namespace _YUA.firefox */
            return 0 < _YUA.firefox;
        },

        /**
         * Test if the client browser is IE.
         * @method isIE
         * @return {Boolean} The client is IE.
         * @static
         */
        isIE: function() {
            return 0 < _YUA.ie;
        },

        /**
         * Test if the client browser is IE 6.
         * @method isIE6
         * @return {Boolean} The client is IE 6.
         * @static
         */
        isIE6: function() {
            return 7 > _YUA.ie;
        },

        /**
         * Test if the client browser is IE 7.
         * @method isIE7
         * @return {Boolean} The client is IE 7.
         * @static
         */
        isIE7: function() {
            return 7 <= _YUA.ie || 8 >= _YUA.ie;
        },

        /**
         * Test if the client browser is opera.
         * @method isOpera
         * @return {Boolean} The client is opera.
         * @static
         */
        isOpera: function() {
            return 7 > _YUA.opera;
        },

        /**
         * Evaluates if the provided object is a regular expression object or not.
         * @method isRegExp
         * @param o {Object} Required. The object to evaluate.
         * @return {Boolean} The object is a RegExp.
         * @static
         */
        isRegExp: function(o) {
            return _YL.isObject(o) && o.match;
        },

        /**
         * Test if the client browser is safari.
         * @method isSafari
         * @return {Boolean} The client is safari.
         * @static
         */
        isSafari: function() {
            return 0 < _YUA.webkit;
        },

        /**
         * Throws the provided error text after performing text replacement.
         * @method throwError
         * @param text {String} Required. The error text.
         * @static
         */
        throwError: function(text) {
			var params = [];
			
			var fx = function() {
				_YL.arrayWalk(arguments, function(o) {
					if (_YL.isArray(o) || _YL.isArgument(o)) {
						fx.apply(this, o);
					}
					else {
						params.push(o);
					}
				});
			};
			
			_YL.throwError = function() {
				params = [];
				fx.apply(this, arguments);
				
				var str = '' + params[0];
				_YL.arrayWalk(params.slice(1), function(o) {
					str = str.replace(/\?\?/, o);
				});
				
				throw(str);
			};
			
			_YL.throwError.apply(this, arguments);
        }
    };

    // fixing IE; index of is assumed to be available
    if (! Array.prototype.indexOf) {

        // this is not to be JavaDoc'ed as it will confuse the compiler
        /*
         * The last index of value in the array.
         * @namespace window
         * @method indexOf
         * @param val {Object} Required. Any non-Object, object.
         * @param strict {Boolean} Optional. True when also comparing type.
         * @return {Number} The index of value or -1 when object is not in array.
         * @public
         */
        Array.prototype.indexOf = function(val, strict) {
            var t1 = _YL.arrayWalk(this, function(o, i) {
                return (o === val) || (! strict && o == val) ? i : false;
            });
            return _YL.isNumber(t1) ? t1 : -1;
        };
    }
	
    _YL.augmentObject(_YL, _that);
})();/**
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
     * @readonly
     */
    C.HTML.CLS.DISABLED='disabled';

    /**
     * The DOM class attribute for applying error styles.
     * @property ERROR
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.ERROR='error';

    /**
     * The DOM class attribute for emulating :first-child psuedo class.
     * @property FIRST
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.FIRST='first';

    /**
     * The DOM class attribute for applying the "visibility:hidden" style.
     * @property HIDDEN
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HIDDEN='hidden';

    /**
     * The DOM class attribute for applying the "display:none" style.
     * @property HIDE
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HIDE='displayNone';

    /**
     * The DOM class attribute for emulating :hover psuedo class.
     * @property HOVER
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.HOVER='hover';

    /**
     * The DOM class attribute for emulating :last-child psuedo class.
     * @property LAST
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.LAST='last';

    /**
     * The DOM class attribute for applying message styles.
     * @property MESSAGE
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.MESSAGE='message';

    /**
     * The DOM class attribute for identifying 'next' elements (usually used in pagination).
     * @property NEXT
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.NEXT='next';

    /**
     * The DOM class attribute for applying open styles and/or identifying element state.
     * @property OPEN
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.OPEN='open';

    /**
     * The DOM class attribute for identifying 'previous' elements (usually used in pagination).
     * @property PREV
     * @type {String}
     * @static
     * @final
     * @readonly
     */
    C.HTML.CLS.PREV='prev';

    /**
     * The DOM class attribute for applying selected styles and/or identifying element state.
     * @property SELECTED
     * @type {String}
     * @static
     * @final
     * @readonly
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
     * @readonly
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
     * @readonly
     */
    C.HTML.NAME.TASK='task';
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.06
 */

/**
 * Extending YAHOO.util.Dom.
 * @module dom
 * @namespace YAHOO.util
 * @requires yahoo, dom
 */

/**
 * @class Dom
 * @static
 */
(function() {
    var _DOC = document,
        _YD = YAHOO.util.Dom,
        _YE = YAHOO.util.Event,
        _YL = YAHOO.lang;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'extend', 'yahoo-ext/dom.js');}
		
	var $ = _YD.get,
        _scrollIntervalId = 0;

    C.HTML.CLS.IS_DELETING = 'isDeleting';

    /**
	 * W3C DOM Level 2 standard node types; for older browsers and IE.
	 */
	if (! _DOC.ELEMENT_NODE) {
		_DOC.ELEMENT_NODE = 1;
		_DOC.ATTRIBUTE_NODE = 2;
		_DOC.TEXT_NODE = 3;
		_DOC.CDATA_SECTION_NODE = 4;
		_DOC.ENTITY_REFERENCE_NODE = 5;
		_DOC.ENTITY_NODE = 6;
		_DOC.PROCESSING_INSTRUCTION_NODE = 7;
		_DOC.COMMENT_NODE = 8;
		_DOC.DOCUMENT_NODE = 9;
		_DOC.DOCUMENT_TYPE_NODE = 10;
		_DOC.DOCUMENT_FRAGMENT_NODE = 11;
		_DOC.NOTATION_NODE = 12;
	}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Dom', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /* defined below */
        animate: function() {_throwNotImplemented('animate', 'yahoo/animation.js');},

        /**
         * Removes whitespace-only text node children.
         * @method cleanWhitespace
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {Element} Cleaned DOM node for convenience or NULL.
         * @static
         */
        cleanWhitespace: function(elem) {
            var node = $(elem);
            if (! node) {return null;}
            var cld = node.firstChild;

            while (cld) {
                var nextNode = cld.nextSibling;
                
                if (_DOC.COMMENT_NODE === cld.nodeType || (_DOC.TEXT_NODE === cld.nodeType && ! /\S/.test(cld.nodeValue))) {
                    node.removeChild(cld);
                }

                cld = nextNode;
            }

            return node;
        },

        /**
         * Positions the second element at the same coords as the first.
         * @method cloneDimensions
         * @param srcElem {Element|String} Required. The element to get position of.
         * @param applyElem {Element|String} Required. The element to set position of.
         * @static
         */
        cloneDimensions: function(srcElem, applyElem) {
            var o = _YD.getRegion(srcElem),
                node = $(applyElem);

            if (_YL.isUndefined(o.height)) { // for YUI < 2.7
                o.height = o.bottom - o.top;
                o.width = o.right - o.left;
            }

            _YD.setStyle(node, 'left', o.left + 'px');
            _YD.setStyle(node, 'top', o.top + 'px');
            _YD.setStyle(node, 'height', o.height + 'px');
            _YD.setStyle(node, 'width', o.width + 'px');

            // debugging tools
            // _YD.setStyle(node, 'border', 'red solid 1px');
    		// alert(node.id + 'left: ' + o.left + ', top: ' + o.top + ', height: ' + o.height + ', width: ' + o.width);
        },

        /**
         * If possible creates the document element according to the xhtml namespace, otherwise, normally;
         *  failure returns a Function that throws an exception.
         * @method createNode
         * @param tagName {String} Required. Tag name to create.
         * @return {Element} The newly created element.
         * @static
         */
        createNode: function(tagName) {
            if (_DOC.createElementNS) {
                _YD.createNode = function(tagName) {
                    return tagName ? _DOC.createElementNS('http://www.w3.org/1999/xhtml', tagName) : null;
                };
            }
            else if (_DOC.createElement) {
                _YD.createNode = function(tagName) {
                    return tagName ? _DOC.createElement(tagName) : null;
                };
            }
            else {
                _YD.createNode = function() {throw 'createElement is not available.';};
            }

            return _YD.createNode(tagName);
        },

        /* defined below */
        createTag: function() {_throwNotImplemented('createTag', 'yahoo.ext/lang.js');},

        /**
         * Removes a node from the DOM, using a fading animation and clearning all events.
         * @method deleteNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to delete.
         * @param func {Function} Optional. The callback function after animation finishes; default is undefined.
         * @param isRemoveListener {Boolean} Optional. True, when you want to purge event listeners from node and children; default is undefined.
         * @param isAnimate {Boolean} Optional. Animated this action.
         * @return {Boolean} Node deleted.
         * @static
         */
        deleteNode: function(elem, func, isRemoveListener, isAnimate) {
            var node = $(elem),
                fn = _YL.isFunction(func) ? func : function() {};
            if (! node || _YD.hasClass(node, C.HTML.CLS.IS_DELETING)) {return false;}
            var parent = node.parentNode;

            // remove listeners when YAHOO.util.Event is available, but not required
            if (isRemoveListener && _YE && _YE.purgeElement) {_YE.purgeElement(node);}

            // animate when YAHOO.util.Anim  is available, but not required
            if (YAHOO.util.Anim && isAnimate) {
                _YD.addClass(node, C.HTML.CLS.IS_DELETING);
                _YD.animate(node, {opacity: {from: 1, to: 0.25}}, 0.5, YAHOO.util.Easing.easeOut, [{id: 'onComplete', fx: function() {
                    parent.removeChild(node);
                    _YD.addClass(node, C.HTML.CLS.IS_DELETING);
                    if (fn) {fn(parent);}
                }}]);
            }
            else {
                parent.removeChild(node);
                fn(parent);
            }

            return true;
        },

        /**
         * Navigates on the element through native JavaScript properties or YUI equivalent, as provided by instructions.
         * @method exec
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search from.
         * @param instructions (String} Required. The '.' delimited navigation instructions.
         * @return {Element} The found node or NULL.
         * @static
         */
        exec: function(elem, instructions) {
            var node = $(elem);

            if (! (node && instructions)) {return null;}

            var _s = instructions.split('.');

            for (var i = 0; i < _s.length; i += 1) {
                if (node) {
                    var task = _s[i];

                    if (_YD[task]) {
                        node = _YD[task](node);
                    } // todo: support childNodes[]
                    else if (node[task]) {
                        node = node[task];
                    }
                    else {
                        // unsupported technique
                    }
                }
                else {
                    return true;
                }
            }

            return node;
        },

        /**
         * Find and replace the first text (ignores whitespaces), or append a textnode when there is no textnode.
         * @method findFirstText
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @return {Element} The first available text node or null.
         * @static
         */
        findFirstText: function(elem) {
			var node = $(elem);
			if (! node) {return null;}

            // this is a text node and not a whitespace, so update it
            if (_YD.isTextNode(node) && ('' === node.nodeValue || /\S/.test(node.nodeValue))) {
				return node;
			}
			// find text node
			else {
                var firstText = null,
                    nextSibling = node.firstChild;

                // iterate until nextSibling is null or set to false, indicating we have found a matching node
                while (! firstText && nextSibling) {
                    firstText = _YD.findFirstText(nextSibling);
                    nextSibling = nextSibling.nextSibling;
                }

                return firstText;
			}
        },

        /**
         * Animates the background color of the element with a color flash.
         * @method flashBackgroundColor
         * @param node {Element} Required. Pointer or string reference to DOM element to animate.
         * @param color {String} Required. The color to animate to.
         * @static
         */
        flashBackgroundColor: function(node, color) {
            if (! (node || color)) {return;}

            var attr = {backgroundColor: {to: color}},
                anim = new YAHOO.util.ColorAnim(node, attr),
                oColor = _YD.getBackgroundColor(node);

            anim.onComplete.subscribe(function() {
                setTimeout(function() {
                    var attr = {backgroundColor: {to: oColor}},
                        anim = new YAHOO.util.ColorAnim(node, attr);

                    anim.animate();
                }, 500);
            });

            anim.animate();
        },

        /**
         * Determines the background color of an element in Hexidecimal format, will head up the document stack, if transparent.
         * @method getBackgroundColor
         * @param node {Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {String} The background color.
         * @static
         */
        getBackgroundColor: function(node) {
            if (! node) {return null;}
            var backgroundColor = _YD.getStyle(node, 'backgroundColor');
            if ('transparent' === backgroundColor) {return _YD.getBackgroundColor(node.parentNode);}
            var rgb = backgroundColor.replace(/rgba?\((.*?)\)/, '$1').split(', ');
            return String.RGBtoHex(rgb[0], rgb[1], rgb[2]);
        },

        /**
         * Retrieves the HTMLBodyElement, x-browser safe.
         * @method getBodyElement
         * @param newDoc {Document} Optional. The document to use.
         * @return {Element} Body DOM node for convenience or NULL.
         * @static
         */
        getBodyElement: function(newDoc) {
            var body;

            if (! newDoc || newDoc === _DOC) {body = $(C.HTML.ID.BODY);} // get body by the ID

            if (! body) { // find the body the tag
                var doc = newDoc || _DOC;
                body = doc.getElementsByTagName('body')[0];

                if (! body) { // try find the body on the document
                    //noinspection XHTMLIncompatabilitiesJS
                    body = doc.body || doc.childNodes[0].childNodes[1];

                    if (! body) { // No body, try appending to document
                        body = doc;
                    }
                }
            }

            return body;
        },

        /**
         * Fetchs the childNode of the node, whilst ignoring whitespaces.
         * @method getChildNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @param i {Number} Required. The index of the node to get;
         * @return {Element} The pointer to the found DOM node or NULL.
         * @static
         */
        getChildNode: function(elem, i) {
            var j = 0,
                node = $(elem);

            if (! node) {return null;}

            return _YD.getFirstChildBy(node, function() {
                if (i === j) {return true;}
                j += 1;
            });
        },

        /**
         * Find the common ancestor shared by two elements, or NULL otherwise.
         * @method getCommonAncestor
         * @param elem1 {Element} Required. Pointer or string reference to DOM element to search.
         * @param elem1 {Element} Required. Pointer or string reference to DOM element to search.
         * @return {Element} The desired node or null.
         * @static
         */
        getCommonAncestor: function(elem1, elem2) {
            var node1 = $(elem1),
                node2 = $(elem2);

            if (! (node1 && node2)) {return null;} // missing parameter, fail
            node1 = node1.parentNode;

            // iterate up the DOM tree
            while (node1) {
                if (_YD.isAncestor(node1, node2)) {return node1;}
                node1 = node1.parentNode;
            }

            return null;
        },

        /* defined below */
		getContentAsFloat: function() {_throwNotImplemented('getContentAsFloat', 'yahoo.ext/lang.js');},

        /* defined below */
		getContentAsInteger: function() {_throwNotImplemented('getContentAsInteger', 'yahoo.ext/lang.js');},

        /* defined below */
		getContentAsString: function() {_throwNotImplemented('getContentAsString', 'yahoo.ext/lang.js');},

        /**
         * Returns the left and top scroll value of the document.
         * @method getDocumentScroll
         * @param doc {HTMLDocument} Optional. The document to evaluate.
         * @return {Object} An object where left/top (Number) are the values the document is scrolled to.
         * @static
         */
        getDocumentScroll: function(doc) {
            return {left: _YD.getDocumentScrollLeft(doc), top: _YD.getDocumentScrollTop(doc)};
        },

        /**
         * Returns the height and width of the document.
         * @method getDocumentSize
         * @param doc {HTMLDocument} Optional. The document to evaluate.
         * @return {Object} An object where height/width (Number) are the actual height/width of document (which includes the body and its margin).
         * @static
         */
        getDocumentSize: function(doc) {
            return {height: _YD.getDocumentHeight(doc), width: _YD.getDocumentWidth(doc)};
        },

        /* defined below */
		getElementsByTagName: function() {_throwNotImplemented('getElementsByTagName', 'native.ext/array.js');},

		/**
		 * Returns the first childnode of the node with tag name and class name.
		 * @method getFirstChildByTagAndClass
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param tagName {String} Optional. The DOM node tag name to limit by.
		 * @param className {String} Optional. The DOM node attribute class name to limit by.
		 * @return {Element} The first matching element or null.
		 * @static
		 */
		getFirstChildByTagAndClass: function(elem, tagName, className) {
			var node = $(elem);

			if (! (node && _YL.isString(tagName) && _YL.isString(className))) {return null;}

			return _YD.getFirstChildBy(node, function(node) {
				var tn = _YD.getTagName(node);
				return (tn === tagName && _YD.hasClass(node, className));
			});
		},

        /**
         * Retrieves the first text nodes value.
         * @method getFirstText
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @return {String} The value of the first text node.
         * @static
         */
        getFirstText: function(elem) {
            var node = _YD.findFirstText(elem);
            if (! node) {return '';}
            return _YD.isTextNode(node) ? node.nodeValue : '';
        },

		/**
		 * Returns an image object with src, useful for image caching.
		 * @method getImage
		 * @param src {String} Required. The location of the image.
		 * @return {Image} A Javascript Image Object with the src set.
		 * @static
		 */
		getImage: function(src) {
			var img = new Image();
			img.src = src;
			return img;
		},

		/*
		 * Finds element's absolute position.
		 * @method getPos
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {Object} The {x:posX, y:posY} of DOM node.
		 * @static
		 *//*
		getPos: function(elem) {
			var node = $(elem),
				curleft = 0, curtop = 0;

			if (node && node.offsetParent) {
				curleft = node.offsetLeft;
				curtop = node.offsetTop;

				while (node.offsetParent) {
					node = node.offsetParent;
					curleft += node.offsetLeft;
					curtop += node.offsetTop;
				}
			}

			return {x:curleft, y:curtop};
		},*/

        /**
         * Safe method for fetching the tagName of a node; also converts to lower-case.
         * @method getTagName
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {String} The tagName or an emtpy string.
         * @static
         */
        getTagName: function(elem) {
            var node = $(elem);
            return node ? ('' + node.tagName).toLowerCase() : '';
        },

        /**
         * Returns the current height and width of the viewport.
         * @method getViewport
         * @return {Object} An object where height/width (Number) are the current viewable area of the page (excludes scrollbars).
         * @static
         */
        getViewport: function(doc) {
            return {height: _YD.getViewportHeight(doc), width: _YD.getViewportWidth(doc)};
        },

        /* defined below */
        hide: function() {_throwNotImplemented('hide', 'yahoo.ext/lang.js');},

		/*
		 * X-browser importNode function to insert.
		 * @method _importNode
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to activate.
		 * @param allChildren {Boolean} Required. Set to true, when you want to copy the children nodes as well.
		 * @static
		 * @deprecated Note: keeping around, as I might one day want to use it again
		 *
		 * Example:
		 *  var newNode = null, importedNode = null;
		 *
		 *  newNode = xhrResponse.responseXML.getElementsByTagName ('title')[0].childNodes[0];
		 *  if (newNode.nodeType != document.ELEMENT_NODE) {newNode = newNode.nextSibling;}
		 *  if (newNode) {
		 *  importedNode = document._importNode(newNode, true);
		 *  document.getElementById('divTitleContainer').appendChild(importedNode);
		 *  if (!document.importNode) {
		 *     document.getElementById('divTitleContainer').innerHTML = document.getElementById('divTitleContainer').innerHTML;
		 *  }
		 *  }
		 *//*
		_importNode: function(elem, allChildren) {
			var node = YAHOO.util.$(elem);

			switch (node ? null : node.nodeType) {
				case document.ELEMENT_NODE:
					var newNode = document.createElement(node.nodeName);

					// does the node have any attributes to add?
					if (node.attributes && node.getAttribute && newNode.setAttribute && 0 < node.attributes.length) {
						Mint.batch(node.attributes, function(n) {
							if (n && Object.is(n) && node.getAttribute(n.nodeName)) {
								newNode.setAttribute(n.nodeName, node.getAttribute(n.nodeName));
							}
						});
					}

					// are we going after children too, and does the node have any?
					if (allChildren && node.childNodes && 0 < node.childNodes.length) {
						Mint.batch(node.childNodes, function(n) {
							newNode.appendChild(document._importNode(n, allChildren));
						});
					}

					return newNode;

				case document.TEXT_NODE:
				case document.CDATA_SECTION_NODE:
				case document.COMMENT_NODE:
					return document.createTextNode(node.nodeValue);

				default:
					return null;
			}
		},*/

        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy; this is different from YUI method,
         * because it takes no shortcuts and works right all the time.
         * @method isAncestorOf
         * @param ancestor {String | HTMLElement} Required. The possible ancestor.
         * @param decendant {String | HTMLElement} Required. The possible decendant.
         * @return {Boolean} Is ancestor of decendant.
         * @static
         */
        isAncestorOf: function(ancestor, decendant) {
            var haystack = _YD.get(ancestor),
                needle = _YD.get(decendant);

            if (! (haystack && needle)) {return null;}

            while (needle && needle !== _DOC) {
                if (needle === ancestor) {return true;}
                needle = needle.parentNode;
            }

            return false;
        },

        /* defined below */
        isTagName: function() {_throwNotImplemented('isTagName', 'yahoo.ext/lang.js');},

        /* defined below */
        isElementType: function() {_throwNotImplemented('isElementType', 'yahoo.ext/lang.js');},

        /**
         * Tests if the node is one of 3 text types.
         * @method isTextNode
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
         * @return {Boolean} True, if the elem is a comment, text, or cdata node.
         * @static
         */
        isTextNode: function(elem) {
            var node = $(elem),
                isValidNode = node && node.nodeType; // not calling isNodeOfType because this is faster

            return isValidNode && (node.nodeType === _DOC.CDATA_SECTION_NODE || node.nodeType === _DOC.COMMENT_NODE || node.nodeType === _DOC.TEXT_NODE);
        },

        /**
         * Remove childNodes from node, should be used instead of element.innerHTML = '' as this is xhtml compliant.
         * @method removeChildNodes
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to clear.
         * @return {Number} The number of removed nodes.
         * @static
         */
        removeChildNodes: function(elem) {
            var val = false,
                node = $(elem);

            if (node) {
                val = node.childNodes.length;
                while (node.hasChildNodes()) {
                    node.removeChild(node.firstChild);
                }
            }

            return val;
        },

		/**
		 * Replaces all children of elem as a textnode of text.
		 * @method replace
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to replace content of.
		 * @param text {String} Required. The innerHTML value equivalent to replace content with.
		 * @static
		 */
		replace: function(elem, text) {
			var node = $(elem);
            if (! node) {return;}
            //noinspection InnerHTMLJS
            node.innerHTML = text;
		},

        /**
         * Scrolls to a given position, animating using a fractal algorithm.
         * @method scrollTo
         * @param x {Number} Required. The x position to scroll to.
         * @param y {Number} Required. The y position to scroll to.
         * @param n {Number} Optional. The number of steps to take; default is 5.
         * @param ms {Number} Optional. The length of time to animate.
         * @param ease {Function} Optional. The easing function.
         * @static
         */
        scrollTo: function(x, y, n, ms, ease) {
            //noinspection UnnecessaryLocalVariableJS
            var offset = _YD.getDocumentScroll(),
                steps = n || 5,
                i = steps,
                time = ms || 250,
                xdiff = x - offset.left,
                ydiff = y - offset.top,
                fx = ease ? ease : function(i) {
                    return Math.pow(2, i); // easing out; fast then slow
                };

            if (offset.left === x && offset.top === y) {return;} // no need to scroll

            clearInterval(_scrollIntervalId);
            _scrollIntervalId = setInterval(function() {
                i -= 1;
                var divisor = fx(i, steps);

                window.scroll(xdiff / divisor + offset.left, ydiff / divisor + offset.top);

                // last step
                if (0 === i) {
                    clearInterval(_scrollIntervalId);
                    window.scroll(x, y);
                }
            }, time / steps);
        },

		/**
		 * Scroll to the top of the page using the native window.scroll method and 0,0 coordinates.
		 * @method scrollTop
		 * @static
		 */
		scrollTop: function() {
			_that.scrollTo(0, 0);
		},

        /**
         * Find and replace the first text, or append a textnode when there is no textnode.
         * @method setFirstText
         * @param elem {String|Element} Required. A pointer or string reference to DOM element to set first text of.
         * @param text {String} Required. The text value to set.
         * @static
         */
        setFirstText: function(elem, text) {
            var node = $(elem);
            if (! node || ! _YL.isDefined(text)) {return;}
            var tn = _YD.findFirstText(node);
            if (tn) {tn.nodeValue = text;}
        },

        /* defined below */
        show: function() {_throwNotImplemented('show', 'yahoo.ext/lang.js');},

		/**
		 * Toggles the className for the provided element as a result of the boolean.
		 * @method toggleClass
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element apply class to.
		 * @param className {String} Required. The class name to apply.
		 * @param b {Boolean} Optional. Force class instead of toggle.
		 */
		toggleClass: function(elem, className, b) {
			var bool = _YL.isUndefined(b) ? ! _YD.hasClass(elem, className) : b;
			_YD[bool ? 'addClass' : 'removeClass'](elem, className);
		},

		/**
		 * Hides displayed elements and shows non-displayed element.
		 * @method toggleDisplay
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to style.
		 * @param b {Boolean} Optional. Force display instead of toggle.
		 * @static
		 */
		toggleDisplay: function(elem, b) {
			_YD.toggleClass(elem, C.HTML.CLS.HIDE, ! b);
		},

		/**
		 * Toggles the visibility of element.
		 * @method visibility
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to toggle style of.
		 * @param b {Boolean} Optional. Force visible instead of toggle.
		 * @static
		 */
		toggleVisibility: function(elem, b) {
			_YD.toggleClass(elem, C.HTML.CLS.HIDDEN, ! b);
		}
    };

    _YL.augmentObject(_YD, _that);

    // backwards compatibility for 'getRegion', height/width added in YUI 2.7
    var bodyRegion = _YD.getRegion(_YD.getBodyElement());
    if (! bodyRegion.height) {
        _YD.$old_getRegion = _YD.getRegion;
        _YD.getRegion = function() {
            var dim = _YD.$old_getRegion.apply(this, arguments);
            dim.height = dim.bottom - dim.top;
            dim.width = dim.right - dim.left;
            return dim;
        };
    }

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Creates and returns an html element and adds attributes from the hash.
             * @method createTag
             * @param tagName {String} Required. Tag name to create.
             * @param hash {Object} Optional. The hashtable of attributes, styles, and classes; defaults is empty object.
             * @return {Element} The newly created element; returns null otherwise.
             * @static
             */
            createTag: function(tagName, hash) {
                var node = _YD.createNode(tagName);

                // iterate through the possible attributes
                _YL.forEach(hash || {}, function(v, k) {
                    switch (k.toLowerCase()) {
                        case 'classname':
                        case 'class':
                        case 'cls':
                            _YD.addClass(node, v);
                            break;

                        case 'cellpadding':
                            node.cellPadding = v;
                            break;

                        case 'cellspacing':
                            node.cellSpacing = v;
                            break;

                        case 'colspan':
                            node.colSpan = v;
                            break;

                        case 'src':
                        case 'checked':
                        case 'disabled':
                            // Capitolization is important in your hashtable for these to work properly in all browsers
                            node[k] = v;
                            break;

                        case 'rowspan':
                            node.rowSpan = v;
                            break;

                        case 'style':
                            // iterate on the styles and set them
                            _YL.forEach(v, function(v, k) {
                                _YD.setStyle(node, k, v);
                            });
                            break;

                        case 'innerhtml':
                        case 'text':
                            var text = ('' + v);

                            if (text.match(/<.*?>/) || text.match(/&.*?;/)) {
	                            _YD.replace(node, text);
                            }
                            else {
	                            node.appendChild(_DOC.createTextNode(text));
                            }
                                
                            break;

                        default:
                            node.setAttribute(k, v);
                            break;
                    }
                });

                return node || null;
            },

            /**
             * Returns the elements content as a float.
             * @method getContentAsFloat
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node as a float.
             * @static
             */
            getContentAsFloat: function(elem) {
                return parseFloat(_YD.getContentAsString(elem));
            },

            /**
             * Returns the elements content as a integer.
             * @method getContentAsInteger
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node as a integer.
             * @static
             */
            getContentAsInteger: function(elem) {
                return parseInt(_YD.getContentAsString(elem), 10);
            },

            /**
             * Returns the elements content.
             * @method getContentAsString
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @return {String} The innerHTML of the node.
             * @static
             */
            getContentAsString: function(elem) {
                /*
                 * Returns the elements content of nodes as a string.
                 */
                var _getContentAsString = window.XMLSerializer ? function(nodes) { // mozilla
                    var xmlSerializer = new XMLSerializer(),
                        sb = [];

                    _YL.arrayWalk(nodes, function(node, i) {
                        //noinspection NestedConditionalExpressionJS
                        sb[i] = ($doc.CDATA_SECTION_NODE === node.nodeType) ? node.nodeValue : xmlSerializer.serializeToString(node);
                    });

                    return sb.join('').replace(/(\<textarea[^\<]*?)\/\>/, '$1>&nbsp;</textarea>');
                } : function(nodes) { // IE
                    var sb = [];

                    _YL.arrayWalk(nodes, function(node, i) {
                    //noinspection NestedConditionalExpressionJS,InnerHTMLJS
                        sb[i] = (_YD.isTextNode(node)) ? node.nodeValue : node.xml || node.innerHTML;
                    });

                    return sb.join('').replace(/\/?\>\<\/input\>/gi, '\/>'); // IE tends to insert a bogus "</input>" element instead of understanding empty closure "<input ... />"
                };

                _YD.getContentAsString = function(elem) {
                    var parentNode = _YD.get(elem);

                    if (! parentNode || ! parentNode.childNodes.length) {return '';}

                    if (_YD.isTextNode(parentNode.firstChild.nodeType) && 1 === parentNode.childNodes.length) {
                        return parentNode.firstChild.nodeValue;
                    }
                    else {
                        return _getContentAsString(parentNode.childNodes);
                    }
                };

                return _YD.getContentAsString(elem);
            },

			/**
			 * Hides any number of elements using class 'hide'; doesn't attempt to correct "display:none", designers should use a class to apply display instead.
			 * @method hide
			 * @param arg1 {String|Element} Required. Pointer or string reference to DOM element to style.
			 * @param argX {String|Element} Optional. Additional pointers or string references to DOM element to style.
			 * @static
			 */
			hide: function(arg1, argX) {
				_YL.arrayWalk(arguments, function(elem) {
					_YD.addClass(elem, C.HTML.CLS.HIDE);
				});
			},

            /**
             * Tests if the node has the same tag name as those included in arguments 2+.
             * @method isTagName
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @param arg1 {String} Required. A node name to compare with.
             * @param argX {String} Optional. Additional node names to compare with.
             * @return {Boolean} True when the DOM node attribute nodeName is included in the arguments.
             * @static
             *
             * Example:
             * isTagName(domNode, 'div', 'input', 'div');
             */
            isTagName: function(elem, arg1, argX) {
                var tagName = _YD.getTagName(elem);                
                if (! tagName) {return false;}

                return _YL.arrayWalk(arguments, function(tagname) {
                    if (tagName === tagname) {return true;}
                });
            },

            /**
             * Tests if the node has the same type as those included in arguments 2+.
             * @method isElementType
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
             * @param arg1 {Number} Required. A node type to compare with.
             * @param argX {Number} Optional. Additional node types to compare with.
             * @return {Boolean} True when the DOM node attribute nodeType is included in the arguments.
             * @static
             *
             * Example:
             * isElementType(domNode, document.ELEMENT_NODE, document.ATTRIBUTE_NODE, document.TEXT_NODE);
             */
            isElementType: function(elem, arg1, argX) {
                var node = $(elem);
                if (! (node && node.nodeType)) {return false;}

                return _YL.arrayWalk(arguments, function(nodetype) {
                    if (node.nodeType === nodetype) {return true;}
                });
            },

			/**
			 * Show any number of elements removing class 'hide'.
			 * @method show
			 * @param arg1 {String|Element} Required. Pointer or string reference to DOM element to style.
			 * @param argX {String|Element} Optional. Additional pointers or string references to DOM element to style.
			 * @static
			 */
			show: function(arg1, argX) {
				_YL.arrayWalk(arguments, function(node) {
					_YD.removeClass(node, C.HTML.CLS.HIDE);
				});
			}
		};
		
		_YL.augmentObject(_YD, _thatIfLangExtended, true);
	}

    // extend helper methods requiring yahoo/animation.js
    if (YAHOO.util.Anim) {
        var _thatIfAnim = {

            /**
             * Removes a node from the DOM, using a fading animation and clearning all events.
             * @method animate
             * @param elem {String|Element} Required. Pointer or string reference to DOM element to delete.
             * @param obj {Object} Optional. The animation object data; default will fade opacity from 1 to 0.25.
             * @param dur {Number} Optional. The duration of the animation; default is 0.5s.
             * @param ease {Object} Optional. The easing method; default is easeOut.
             * @param functions {Array} Optional. A collection of animation event callback functions {id: the event, fx: callback function}.
             * @return {Object} YAHOO animation object.
             * @static
             */
            animate: function(elem, obj, dur, ease, functions) {
                var node = $(elem),
                    cfg = {
                    duration: dur || 0.5,
                    ease: ease || YAHOO.util.Easing.easeOut,
                    obj: obj || {opacity: {from: 1, to: 0.25}}
                },
                    fxs = functions || [],
                    anim = new YAHOO.util.Anim(node, cfg.obj, cfg.duration, cfg.ease);

                // functions are provided
                if (fxs.length) {
                    for (var i = 0; i < fxs.length; i += 1) {
                        var o = fxs[i];
                        if (anim[o.id]) {anim[o.id].subscribe(o.fx);}
                    }
                }

                anim.animate();
                return anim;
            }
        };

        _YL.augmentObject(_YD, _thatIfAnim, true);
    }

    // extend helper methods requiring native-ext/array.js
    var _augmentDomWithArrayMethods = function() {

        var _thatIfArray = {

			/**
			 * Wraps the native getElementsByTagName method, converting the nodelist to an Array object.
			 * @method getElementsByTagName
			 * @param tagName {String} Required. The DOM node tag to search for.
			 * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
			 * @return {NodeList} The collection of nodes.
			 * @static
			 */
			getElementsByTagName: function(tagName, elem) {
				var node = $(elem);
				if (! node) {return null;}
				return Array.get(node.getElementsByTagName(tagName));
			}
        };

        _YL.augmentObject(_YD, _thatIfArray, true);
    };

    if (Array.get) {
        _augmentDomWithArrayMethods();
    }
    else {
        _YD.augmentWithArrayMethods = function() {
            _augmentDomWithArrayMethods();
            delete _YD.augmentWithArrayMethods;
        };
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.03
 */

/**
 * Extending YAHOO.util.Event.
 * @module event
 * @namespace YAHOO.util
 * @requires yahoo, event
 */

/**
 * @class Event
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YE = YAHOO.util.Event,
        _YK = YAHOO.util.KeyListener.KEY;

    if (! _YE) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Event', 'extend', 'yahoo-ext/event.js');}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Dom', arguments);
	}: function(text) {throw(text);};

    _YE.throwErrors = true;

    var _that = {

        /**
         * An alias for YAHOO.util.Event.removeListener.
         * @method off
         * @see YAHOO.util.Event.removeListener
         */
        off: _YE.removeListener,

        /**
         * Adds a listener to input that checks keydown events for keycode, then calls the appropriately scoped function, passing the event.
         * @method addKeyListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param keycodes {Array} Required. A collection of desired keycodes.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @param correctScope {Boolean} Optional. True, if you want to correct the scope of callback.
         * @static
         */
        addKeyListener: function(attachTo, keycodes, callback, scope, correctScope) {
            var kl = new YAHOO.util.KeyListener(attachTo, keycodes, {fn: callback, scope: scope ? scope: window, correctScope: correctScope});
            kl.enable();
            return kl;
        },

        /**
         * Adds a listener to input that checks keypress events for enter, then
         *  calls the appropriate function or method. (pass the window into obj for functions).
         * @method addEnterListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @static
         */
        addEnterListener: function(attachTo, callback, scope) {
            return _YE.addKeyListener(attachTo, {keys: _YK.ENTER}, callback, scope);
        },

        /**
         * Adds a listener to input that checks keypress events for escape, then
         *  calls the appropriate function or method. (pass the window into obj for functions).
         * @method addEscapeListener
         * @param attachTo {Element} Required. Pointer or string reference to DOM input element to listen on.
         * @param callback {Function} Required. The callback function.
         * @param scope {Object} Optional. The execution scope of callback function.
         * @static
         */
        addEscapeListener: function(attachTo, callback, scope) {
            return _YE.addKeyListener(attachTo, {keys: _YK.ESCAPE}, callback, scope);
        },

        /**
         * Retrieves the {x, y} coordinates of an event.
         * @method getMousePosition
         * @param e {Event} Required. The triggered JavaScript event; any mouse event.
         * @return {Object} Where x = x coordinate and y = y coordinate of event.
         * @static
         */
        getMousePosition: function(e) {
            return {x:_YE.getPageX(e), y:_YE.getPageY(e)};
        },

        /* defined below */
		simulateClick: function() {_throwNotImplemented('simulateClick', 'yahoo.ext/lang.js');},

        /* defined below */
		simulateEvent: function() {_throwNotImplemented('simulateEvent', 'yahoo.ext/lang.js');}
    };

    _YL.augmentObject(_YE, _that);

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Simulates a click event on an element. Will iterate up the DOM tree until the root is reached or node becomes undefined.
             * @method simulateClick
             * @param elem {Element} Required. The element to click on.
             * @param rt {Element} Optional. The ancestor to stop on; default is document.
             * @static
             */
            simulateClick: function(elem, rt) {
                _YE.simulateEvent(elem, 'click', rt);
            },

            /**
             * Simulates an event on an element. Will iterate up the DOM tree until the root is reached or node becomes undefined.
             * @method simulateEvent
             * @param node {Element} Required. The element to click on.
             * @param eventType {String} Required. The event type to fire.
             * @param rt {Element} Optional. The ancestor to stop on; default is document.
             * @static
             */
            simulateEvent: function(node, eventType, rt) {
                var root = rt || document,
                    searchNode = node;

                // iterate up the DOM tree
                while (searchNode && root !== searchNode) {
                    var listeners = _YE.getListeners(searchNode, eventType);

                    // node has listeners
                    if (listeners && listeners.length) {
                        // iterate on those listeners
                        _YL.arrayWalk(listeners, function(o) {
                            o.fn.call(o.adjust ? o.scope : this, {target: node}, o.obj); // execute function
                        });
                    }

                    searchNode = searchNode.parentNode;
                }
            }
        };

        _YL.augmentObject(_YE, _thatIfLangExtended, true);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Form module provides helper methods for manipulating Form elements.
 * @module form
 * @title form Utility
 * @namespace YAHOO.util
 * @requires yahoo, yahoo.util.Dom
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form) {

/**
 * Provides helper methods for Form elements.
 * @class Form
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'extend', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _YF = YAHOO.namespace('util.Form'),
        $ = _YD.get;

	// static namespace
    var _that = {

        /**
         * Removes all values from form fields.
         * @method clear
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @param iTypes {Array} Optional. An array of input types to ignore.
         * @static
         */
        clear: function(elem, iTypes) {
            var form = $(elem),
                ignoreTypes = Array.is(iTypes) ? iTypes : [];

            var fx = function(fld) {
                // IE 7 will insert some elements without a type; then test if the node type is supposed to be ignored.
                var type = _YF.Element.getType(fld);

                if (type && -1 === ignoreTypes.indexOf(type)) {
                    _YF.Element.clear(fld);
                }
            };

            _YL.arrayWalk(form.getElementsByTagName('input'), fx);
            _YL.arrayWalk(form.getElementsByTagName('textarea'), fx);
            _YL.arrayWalk(form.getElementsByTagName('select'), function(fld) {
                _YF.Element.clear(fld);
            });
        },

        /**
         * Disables the form and all it's serializable elements.
         * @method disable
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @static
         */
        disable: function(elem) {
            var form = $(elem);
            form.disabled = 'true';
            _YL.arrayWalk(_YF.getFields(form), _YF.Element.disable);
        },

        /**
         * Enables the form and all it's serializable elements.
         * @method enable
         * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
         * @static
         */
        enable: function(elem) {
            var form = $(elem);
            form.disabled = '';
            _YL.arrayWalk(_YF.getFields(form), _YF.Element.enable);
        },

		/**
		 * Retrieves the first non-hidden element of the form.
		 * @method findFirstElement
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param iTypes {Array} Optional. An array of input types to ignore; default is 'hidden'.
		 * @return {Element} The first field not of the ignored types or NULL.
		 * @static
		 */
		findFirstElement: function(elem, iTypes) {
			return _YL.arrayWalk(_YF.getFields(elem, '', iTypes), function(fld) {
				return fld;
			});
		},

		/**
		 * Retrieves the first non-hidden element of the form and focuses on it.
		 * @method focusFirstElement
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param iTypes {Array} Optional. An array of input types to ignore; default is 'hidden'.
		 * @static
		 */
		focusFirstElement: function(elem, iTypes) {
			_YF.Element.focus(_YF.findFirstElement(elem, iTypes || ['hidden']));
		},

		/**
		 * Retrieves all serializable elements of the form; sorts them top to bottom, left to right by defualt.
		 *  note: DOM iterating is faster than using getElementsByTagName("*")
		 * @method getFields
	     * @param elem {String|Element} Required. The pointer or string reference to DOM Form element.
	     * @param fldName {String} Optional. A name to filter by.
		 * @param iTypes {Array} Optional. List of element types to ignore; default is hidden.
		 * @return {Array} A collection of Form fields.
		 * @static
		 */
		getFields: function(elem, fldName, iTypes) {
			var form = $(elem),
				set = [];

			if (! form) {return set;}
            var ignoreTypes = _YL.isArray(iTypes) ? iTypes : [];

			// should be redefined each time, because of closure on 'set'
			var fn = function(nodes) {
				for (var i = 0; i < nodes.length; i += 1) {
					var fld = nodes[i],
                        tagName = _YD.getTagName(fld),
                        isValidTag = ('input' === tagName || 'textarea' === tagName || 'select' === tagName),
                        isValidName = (! fldName || fldName === fld.name);

					if (isValidTag && isValidName && -1 === ignoreTypes.indexOf(_YF.Element.getType(fld))) {
						set.push(fld);
					}
					else if (fld.childNodes.length) {
						fn(fld.childNodes);
					}
				}
			};

			fn(form.childNodes);

            return set;
		},

		/**
		 * Retrieves all input elements of the form with typeName and/or name.
		 * @method getElementsByName
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to search.
		 * @param typeName {String}	Optional. The type of input to filter by.
	     * @param name {String} Optional. The name to filter by.
		 * @param multi {Boolean} Optional. True, when mulitple elements use this name.
		 * @static
		 */
		getInputs: function(elem, typeName, name, multi) {
			var form = $(elem);
			if (! multi && name && form[name]) {return [form[name]];} // fast return for DOM compliant browsers, when name is provided; may cause issue if name is something like 'parentNode'
			var fields = form.getElementsByTagName('input');

			if (! (_YL.isString(typeName) || _YL.isString(name)) && Array.get) {return Array.get(fields);}

			var matches = [];
			_YL.arrayWalk(fields, function(fld) {
				if ((typeName && _YF.Element.getType(fld) !== typeName) || (name && fld.name !== name)) {return;}
				matches.push(fld);
			});

			return matches;
		},

		/**
		 * Serializes the form into a query string, collection &key=value pairs.
		 * @method serialize
	     * @param elem {String|Element} Required. The pointer or string reference to DOM Form element.
	     * @return {String} The serialized form.
		 * @static
		 */
		serialize: function(elem) {
			var queryComponents = [];

			_YL.arrayWalk(_YF.getFields(elem), function(fld) {
				var qc = _YF.Element.serialize(fld);
				if (qc) {queryComponents.push(qc);}
			});

			return queryComponents.join('&');
		},

		/**
		 * Enables the value of the field.
		 * @method enable
	     * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable fields of.
		 * @param b {Boolean} Optional. True, when enabling, falsy to disable.
		 * @static
		 */
		toggleEnabled: function(elem, b) {
            var form = $(elem);
            
            if (form) {
                var bool = _YL.isUndefined(b) ? ! form.disabled : b;
                _YF[bool ? 'enable' : 'disable'](form);
            }
        }
    };

    _YL.augmentObject(_YF, _that);
})();

}/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.02
 */

/**
 * @namespace YAHOO.util.Form
 * @requires yahoo, yahoo.util.Dom, yahoo.util.Form
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array crap. Use these functions to work with forms fields.
 * @class Element
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _YE = YAHOO.util.Event,
        _YF = YAHOO.util.Form;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'implement', 'yahoo-ext/form.js');}
    if (! _YF) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form', 'implement', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', arguments);
	}: function(text) {throw(text);};

    var _YFE = YAHOO.namespace('util.Form.Element'),
        $ = _YD.get;

    var _that = {

        attachFocusAndBlur: function() {_throwNotImplemented('attachFocusAndBlur', 'YAHOO.util.Event');},

        /**
		 * Short-cut method to do a browser safe check on any HTMLInputElement of type checkbox (possibly radio too).
		 * @method check
		 * @param elem {String|Element} Required. Pointer or string reference to checkable DOM element.
		 * @param fl {Boolean} Required. True when checkbox should be checked.
		 * @param doNotChangeValue {Boolean} Optional. True, when we should not change values.
		 * @static
		 */
		check: function(elem, fl, doNotChangeValue) {
			var node = $(elem);

			// node exists
			if (node) {
                var type = _YFE.getType(node);
                
                // node is of a valid type
				if ('checkbox' === type || 'radio' === type) {
					// if this check isn't in place Safari & Opera will check false
					if (node.checked != fl) { // do not make strict
						node.checked = fl;
						if (node.setAttribute) {node.setAttribute('checked', fl);} // insurance against some browser issues
						if ('checkbox' === type && ! doNotChangeValue) {node.value = fl ? 'on' : 'off';} // required for Safari, don't change value of radios
					}
				}
				// not of a valid type
				else {
					throw('Attempting to check the wrong node type: ' + type + '.');
				}
			}
			// node does not exist
			else {
				throw('Attempting to check a non-existant node.');
			}
		},

		/**
		 * Resets the value of the field.
		 * @method clear
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to clear.
		 * @static
		 */
		clear: function(elem) {
			var fld = $(elem);
			fld.value = '';
			if (fld.checked) {fld.checked = false;}
			else if (fld.selectedIndex) {fld.selectedIndex = 0;}
		},

		/**
		 * Disables the value of the field.
		 * @method disable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to disable.
		 * @static
		 */
		disable: function(elem) {
			var fld = $(elem);
			_YD.addClass(fld, C.HTML.CLS.DISABLED);
			fld.disabled = 'true';
		},

		/**
		 * Enables the value of the field.
		 * @method enable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable.
		 * @static
		 */
		enable: function(elem) {
			var fld = $(elem);
			fld.disabled = '';
			_YD.removeClass(fld, C.HTML.CLS.DISABLED);
		},

		/**
		 * Focuses on the field.
		 * @method focus
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to enable.
		 * @param select {Boolean} Optional. True when text should be selected; may not be possible, but will attempt.
		 * @param i {Number} Optional. The recursion counter, should be managed by this function.
		 * @static
		 */
        focus: function(elem, select, i) {
			var nodeFocus = function(node, select, i) {
				if (node) {
					try {
						if (node.focus) {
                            if (_YE.simulateClick) {_YE.simulateClick(node);}
                            node.setAttribute('autocomplete', 'off'); // this fixes possible "Permission denied to set property XULElement.selectedIndex ..." exception
							node.focus();
						}
						if (node.select && select) {node.select();}
					}
					catch (e) {
						if (e.message && -1 < ('' + e.message).indexOf("object doesn't support")) {return;} // squelch
						if (e && 10 > i) {
							setTimeout(function() {nodeFocus(node, select, i + 1);}, 250); // timeout, hopefully will catch IE exceptions
						}
						// taking too long, after 2.5s stop process
						else {
							// do nothing for now, just stop recursion
						}
					}
				}
			};

			_YFE.focus = function(elem, select, i) {
				var node = $(elem);
				if (! node) {return;}

                var dim = _YD.getRegion(node),
					execN = 0 < i ? i : 0;

                if (10 < execN) {return;} // stop recursion

				// element only has dimensions when it is visible
				if ('hidden' === node.type || ! (dim.width || dim.height)) {
					setTimeout(function() {_YFE.focus(node, select, i);}, 250); // timeout, hopefully will catch IE exceptions
				}
				else { // has layout
					nodeFocus(node, select, 0);
//					alert(node.outerHTML + ' | width: ' + dim.width + ' | height: ' + dim.height + ' | type: ' + node.type + ' | bool: ' + ! (dim.width || dim.height));
				}

				return node;
			};

			return _YFE.focus(elem, select, i);
        },

        /**
		 * Attempt to find the type attribute of the element.
		 * @method getType
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {String} The type or empty string.
		 * @static
		 */
		getType: function(elem) {
			var fld = $(elem);
			if (! (fld || fld.type || fld.getAttribute)) {return '';}
			return (fld.type || fld.getAttribute('type') || '').toLowerCase();
		},

		/**
		 * Attempt to find the value of field.
		 * @method getValue
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @return {String} The field value or empty string.
		 * @static
		 */
		getValue: function(elem) {
			var fld = $(elem),
                method = _YD.getTagName(fld);

			//	missing element is the most common error when serializing; also don't serialize validators
			if (! method) {return '';}

			var parameter = _YFE.Serializers[method](fld);
			if (parameter) {return parameter[1];}
		},

        /**
         * Tests if the element is a checkbox or radio.
         * @method isCheckable
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The input is type checkbox or radio.
		 * @static
         */
        isCheckable: function(elem) {
            return _YFE.isType(elem, 'checkbox', 'radio');
        },

        /**
		 * Tests if the field has changed from the default.
		 * @method isSet
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The field has changed.
		 * @static
         */
        isChanged: function(elem) {
            var fld = $(elem);
            if (! fld) {return false;}

            if (_YFE.isCheckable(fld)) {
                return fld.defaultChecked !== fld.checked;
            }
            else {
                return fld.defaultValue !== fld.value;
            }
        },

        /**
		 * Tests if the field has a value.
		 * @method isSet
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {Boolean} The field is empty or non-existing.
		 * @static
		 */
		isSet: function(elem) {
			return '' !== _YFE.getValue(elem);
		},

        /**
         * Tests if the field is one of the provided types.
         * @method isType
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
		 * @param arg1 {String} Required. A type to evaluate.
		 * @param argX {String} Required. Aditional types to evaluate.
	     * @return {Boolean} The field is one of the provided types.
		 * @static
         */
        isType: function(elem, arg1, argX) {
            var type = _YFE.getType(elem);
            if (! type) {return false;}

            return _YL.arrayWalk(arguments, function(t) {
                if (type === t) {return true;}
            });
        },

        /**
		 * Serializes the form into a key value pair query string.
		 * @method serialize
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to evaluate.
	     * @return {string} the key/value pairs as a query string.
		 * @static
		 */
		serialize: function(elem) {
			var fld = $(elem),
                method = _YD.getTagName(fld);

			//	missing element is the most common error when serializing; also don't serialize validators
			if (! method) {return '';}

			var parameter = _YFE.Serializers[method](fld);

			if (parameter) {
				var key = encodeURIComponent(parameter[0]);
				if (0 === key.length) {return '';}
				if (! _YL.isArray(parameter[1])) {parameter[1] = [parameter[1]];}

				_YL.arrayWalk(parameter[1], function(value, i) {
					parameter[1][i] = key + '=' + encodeURIComponent(value);
				});

				return parameter[1].join('&');
			}
		},

		/**
		 * Enables the value of the field.
		 * @method enable
	     * @param elem {String|Element} Required. Pointer or string reference to DOM Form field element to enable.
		 * @param b {Boolean} Optional. True, when enabling, falsy to disable.
		 * @static
		 */
		toggleEnabled: function(elem, b) {
            var node = $(elem);

            if (node) {
                var bool = _YL.isUndefined(b) ? ! node.disabled : b;
                _YFE[bool ? 'enable' : 'disable'](node);
            }
		}
    };

    _YL.augmentObject(_YFE, _that);

    // YAHOO.json extensions are included
    if (_YE) {

        /**
		 * Updates the onblur and onclick events of the element to show default text.
		 * @method onFocusAndBlur
		 * @param elem {String|Element} Required. Pointer or string reference to DOM element to attach events to.
		 * @param text {String} Required. The default text.
		 * @param c {String} Optional. The color to set default text to.
		 * @static
		 */
        _YFE.attachFocusAndBlur = function(elem, text, c) {
			var fld = $(elem);

			// validate
	        if (fld) {
		        if ('text' !== _YFE.getType(fld)) {
					throw('YAHOO.util.Form.Element.attachFocusAndBlur() Exception - invalid field type for type: ' + _YFE.getType(fld));
				}
	        }
	        else {
		        return;
	        }

			var color = c || '#999',
				oColor = fld.style.color || '#000';

			// function that resets to the default
			var update = function(fld, text, color) {
				fld.value = text;
				fld.style.color = color;
			};

			// on focus clear value if equal to default
			_YE.on(fld, 'focus', function(e, fld) {
				if (e && text === _YFE.getValue(fld).trim()) {
					update(fld, '', oColor);
				}
			}, fld);

			// onblur reset default if no value entered
			_YE.on(fld, 'blur', function(e, fld) {
				if (e && ! _YFE.getValue(fld).trim()) {update(fld, text, color);}
			}, fld);

			// update the initial state if needed
			var val = _YFE.getValue(fld).trim();
			if (text === val || '' === val) {update(fld, text, color);}
		};
    }
})();

}/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * @module form
 * @namespace YAHOO.util.Form.Element
 * @requires yahoo, dom, event, form
 */

// Only use first inclusion of this class.
if (! YAHOO.util.Form.Element.Serializers) {

/**
 * These Form utility functions are thanks in a large part to the Prototype group. I have modified them to improve
 * 	performance, remove redundancy, and get rid of the magic array functionality.
 * @class Serializers
 * @static
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _YF = YAHOO.util.Form,
        _YFE = YAHOO.util.Form.Element;

    if (! _YD) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Dom', 'implement', 'yahoo-ext/form.js');}
    if (! _YF) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form', 'implement', 'yahoo-ext/form.js');}
    if (! _YFE) {_YL.throwError.call(this, _YL.ERROR_NOT_DEFINED, 'YAHOO.util.Form.Element', 'implement', 'yahoo-ext/form.js');}
    if (! _YL.arrayWalk) {_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'YAHOO.util.Form', '', 'yahoo-ext/lang.js');}

    var _YFS = YAHOO.namespace('util.Form.Element.Serializers');
    
    var _that = {

        /**
         * Finds the value of a checkbox/radio input element.
         * @method input
         * @param element {String|Element} Required. The input node.
         * @return {Array} The name/value pairs.
         * @static
         */
        input: function(element) {		
            switch (_YFE.getType(element)) {
                case 'checkbox':
                case 'radio':
                    return _YFS.inputSelector(element);
                default:
                    return _YFS.textarea(element);
            }
        },

        /**
         * Finds the value of a checkbox/radio input element.
         * @method inputSelector
         * @param element {String|Element} Required. The input node.
         * @return {Array} The name/value pairs.
         * @static
         */
        inputSelector: function(element) {
            if (element.checked) {
                return [element.name, element.value];
            }
        },

        /**
         * Finds the value of a select-one element.
         * @method textarea
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        textarea: function(element) {
            return [element.name, element.value];
        },

        /**
         * Finds the value of a select tag element.
         * @method select
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        select: function(element) {
            return _YFS['select-one' === _YFE.getType(element) ? 'selectOne' : 'selectMany'](element);
        },

        /**
         * Finds the value of a select-one element.
         * @method selectOne
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        selectOne: function(element) {
            var value = '', opt, index = element.selectedIndex;
            if (0 <= index) {
                opt = element.options[index];
                value = opt.value || opt.text;
            }
            return [element.name, value];
        },

        /**
         * Finds the value of a select-many element.
         * @method selectMany
         * @param element {String|Element} Required. The select node.
         * @return {Array} The name/value pairs.
         * @static
         */
        selectMany: function(element) {
            var value = [];

            for (var i = 0; i < element.length; i += 1) {
                var opt = element.options[i];
                if (opt.selected) {
                    value.push(opt.value || opt.text);
                }
            }

            return [element.name, value];
        }
    };

    _YL.augmentObject(_YFS, _that);
})();

}/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.02
 */

/**
 * The Array utility extends the native JavaScript Array Object with additional methods and objects.
 * @module window
 * @class Array
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Converts the provided Object into an array, ensure it is not an array-like object.
         * @method get
         * @param o {Object} Required. An array or array-like object.
         * @return {Array} The provided object as an Array.
         * @static
         */
        get: function(o) {
            var data = (o && o.length) ? o : []; // defaults to Array when passed nothing or crap

            if (_YL.isArray(data)) {
                return data;
            }
            else {
                var arr;

                try {
                    arr = Array.prototype.slice.call(data, 0);
                }
                catch (e) {
                    if (! e) {return [];}
                    arr = [];

                    // not an Array, but an Array-like object, let's make it an Array
                    if (data.length) {
                        var j = data.length,
                            i = 0;

                        // iterate through nodeList, this should be sequential, because we expect nodeList to be in a certain order
                        for (i = 0; i < j; i += 1) {
                            // only add keys with values
                            if (data[i]) {
                                arr[arr.length] = data[i];
                            }
                        }
                    }
                }

                return arr;
            }
        },

        /**
         * Tests if the passed parameter is an Array.
         * @param o {Object} Required. An Object that want to ensure is an Array.
         * @return {Boolean} True when parameter is an Array.
         * @static
         */
        is: function(o) {
            return _YL.isArray(o);
        }
        
    };

	_YL.augmentObject(Array, _that);
})();

/**
 * The Array utility extends the native JavaScript Array Object prototype with additional methods.
 * @class Array
 * @namespace Window
 * @extends Array
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Array.prototype', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * The number current position of the pointer. Should be considered private, even though it is attached to the prototoype.
         * @property _pointer
         * @type Number
         * @const
         * @public
         */
        _pointer: 0,

        /* defined below */
        batch: function() {_throwNotImplemented('batch', 'yahoo.ext/lang.js');},

        /* defined below */
        compact: function() {_throwNotImplemented('compact', 'yahoo.ext/lang.js');},

        /* defined below */
        contains: function() {_throwNotImplemented('contains', 'yahoo.ext/lang.js');},

        /* defined below */
        copy: function() {_throwNotImplemented('copy', 'yahoo.ext/lang.js');},

        /**
         * Returns the element currently pointed to.
         * @method current
         * @returrn {Object} The object in 'this' at pointer.
         * @public
         */
        current: function() {
            return this[this._pointer];
        },

        /* defined below */
        equals: function() {_throwNotImplemented('equals', 'yahoo.ext/lang.js');},

        /* defined below */
        forEach: function() {_throwNotImplemented('forEach', 'yahoo.ext/lang.js');},

        /**
         * Returns the first element in the Array or Undefined.
         * @method first
         * @return {Object} The first element in array.
         * @public
         */
        first: function() {
            return this[0];
        },

        /* defined below */
        indexOf: function() {_throwNotImplemented('indexOf', 'yahoo.ext/lang.js');},

        /**
         * Returns the last element in the Array or Undefined.
         * @method last
         * @return {Object} The last element in array.
         * @public
         */
        last: function() {
            return (this.length) ? this[this.length - 1] : undefined;
        },

        /* defined below */
        lastIndexOf: function() {_throwNotImplemented('lastIndexOf', 'yahoo.ext/lang.js');},

        /**
         * Updates the array pointer to the next position; wraps to ZERO when wrap is true.
         * @method next
         * @param wrap {Boolean} Optional. True when you want to wrap to ZERO when exceeding array length.
         * @return {Object} The next element in the Array.
         * @public
         */
        next: function(wrap) {
            var i = this._pointer;
            i += 1;
            if (wrap && this.length - 1 < i) {i = 0;}
            this._pointer = i;
            return this[i];
        },

        /**
         * Updates the array pointer to the prev position; wraps to length - 1.
         * @method prev
         * @param wrap {Boolean} Optional. True when you want to wrap to ZERO when exceeding array length.
         * @return {Object} The previous element in the Array.
         * @public
         */
        prev: function(wrap) {
            var i = this._pointer;
            i -= 1;
            if (wrap && 0 > i) {i = this.length - 1;}
            this._pointer = i;
            return this[i];
        },

        /* defined below */
        removeIndex: function() {_throwNotImplemented('removeIndex', 'yahoo.ext/lang.js');},

        /* defined below */
        removeValue: function() {_throwNotImplemented('removeValue', 'yahoo.ext/lang.js');},

        /**
         * Resets the Array pointer to the first position.
         * @method reset
         * @public
         */
        reset: function() {
            this._pointer = 0;
        },

        /* defined below */
        toJsonString: function() {_throwNotImplemented('toJsonString', 'yahoo.ext/lang.js');},

        /* defined below */
        unique: function() {_throwNotImplemented('unique', 'yahoo.ext/lang.js');},

        /* defined below */
        walk: function() {_throwNotImplemented('walk', 'yahoo.ext/lang.js');}
    };

    _YL.augmentObject(Array.prototype, _that);

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfArrayWalk = {

            /**
             * Return a copy of the array with null and undefined elements removed; this is not a DEEP COPY, sub-references remain intact.
             *  This method does not change the existing arrays, it only returns a copy of the joined arrays.
             * @method compact
             * @param compress {Boolean} Optional. When true, this function will not preserve indices.
             * @return {Array} Copy of 'this' array without null/undefined elements.
             * @public
             */
            compact: function(compress) {
                var arr = [];

                // iterate on the
                this.walk(function(o, k) {
                    if (_YL.isDefined(o)) {
                        if (compress && _YL.isNumber(k)) {
                            arr.push(o);
                        }
                        else {
                            arr[k] = o;
                        }
                    }
                });

                return arr;
            },

            /**
             * Returns true if the object is in the array.
             * @method contains
             * @param val {Object} Required. The object to compare.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Boolean} True when the object is in the Array.
             * @public
             */
            contains: function(val, strict) {
	            return -1 < this.indexOf(val, strict);
            },

            /**
             * Returns a new Array object with the same keys/values as current Array.
             * @method copy
             * @return {ModelArray} The copy of this.
             * @public
             */
            copy: function() {
                var arr = [];
                this.walk(function(o, k) {arr[k] = o;});
                return arr;
            },

            /**
             * Compares the objects for equality, defeats javascript objects compare by reference.
             * @method Equals
             * @param compare {Array} Required. An object to compare to with.
             * @return {Boolean} True, when values in object and array are equal.
             * @public
             */
            equals: function(compare) {
                if (this.length !== compare.length) {return false;}
                if (! this.length) {return true;}
                var isEqual = true;

                this.walk(function(o, i) {
                    isEqual &= o === compare[i];
                });

                return isEqual;
            },

            /**
             * The last index of value in the array.
             * @method indexOf
             * @param val {Object} Required. Any non-Object, object.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Number} The index of value or -1 when object is not in array.
             * @public
             */
            indexOf: function(val, strict) {
                var t1 = this.walk(function(o, i) {
                    return (o === val) || (! strict && o == val) ? i : null;
                });
                return _YL.isNumber(t1) ? t1 : -1;
            },

            /**
             * The last index of value in the Array.
             * @method lastIndexOf
             * @param val {Object} Required. Any non-Object, object.
             * @param strict {Boolean} Optional. True when also comparing type.
             * @return {Number} The index of value or -1 when object is not in array.
             * @public
             */
            lastIndexOf: function(val, strict) {
                // iterate on the data, in the reversed direction
                for (var i = this.length - 1; -1 < i; i -= 1) {
                    var o = this[i];
                    if ((o === val) || (! strict && o == val)) {return i;}
                }

                return -1;
            },

            /**
             * Remove the member at index (i) in the array.
             * @method removeIndex
             * @param n {Number} Required. The index to remove.
             * @return {Object} The new Array or Original.
             * @public
             */
            removeIndex: function(n) {
                var arr = [],
                    i = 0;

                // invalid index
                if (0 > n || n >= this.length) {return this;}
	            var index = n;

                // iterate on self
                this.walk(function(o) {
                    // index to remove
                    if (i === index) {
                        index -= 1;
                    }
                    // other values
                    else {
                        arr[i] = o;
                        i += 1;
                    }
                });

                return arr;
            },

            /**
             * Finds the object in the array and removes it.
             * @method removeValue
             * @param val {Object} Required. The object to remove.
             * @return {Object} The new Array or Original.
             * @public
             */
            removeValue: function(val) {
                return this.removeIndex(this.indexOf(val));
            },

            /**
             * Convert the array to a JSONArray object.
             * @method toJsonString
             * @return {String} This JSON array as a string.
             * @public
             */
            toJsonString: function() {
                var sb = [];

                this.walk(function(o) {
                    sb.push(Object.convertToJsonString(o));
                });

                return '[' + sb.join(',') + ']';
            },

            /**
             * Iterates through the array and removes duplicate values.
             * @method unique
             * @return {Array} Array with only unique values.
             * @public
             */
            unique: function() {
                var sorter = {},
                    out = [];

                // iterate on this
                this.walk(function(o) {
                    // test if object with type already exists
                    if (! sorter[o + typeof o]) {
                        out.push(o);
                        sorter[o + typeof o] = true;
                    }
                });

                return out;
            },

            /**
             * Iterates on the array, executing 'fx' with each value.
             * @method walk
             * @param fx {Function} Required. The function to execute.
             * @param scope {Object} Optional. The scope to execute 'fx' in.
             * @public
             */
            walk: function(fx, scope) {
                return _YL.arrayWalk(this, fx, scope);
            }
        };

        /**
         * An alias for Array.walk.
         * @method batch
         * @see Array.walk
         * @public
         */
        _thatIfArrayWalk.batch = _thatIfArrayWalk.walk;

        /**
         * An alias for Array.walk.
         * @method forEach
         * @see Array.walk
         * @public
         */
        _thatIfArrayWalk.forEach = _thatIfArrayWalk.walk;

        _YL.augmentObject(Array.prototype, _thatIfArrayWalk, true);
    }

    // augment the DOM methods that use Array, if not already augmented
    if (_YD && _YD.augmentWithArrayMethods) {
        _YD.augmentWithArrayMethods();
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Boolean utility extends the native JavaScript Boolean Object with additional methods and objects.
 * @module window
 * @class Boolean
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Converts truthy/falsy to Boolean.
         * @method get
         * @param o {Object} Required. An Object that want to convert to Boolean.
         * @return {Boolean} True when parameter is truthy or true.
         * @static
         */
        get: function(o) {
		    //noinspection RedundantConditionalExpressionJS
            return (o && _YL.isDefined(o)) ? true : false; // ensures proper type for ===
        },

        /**
         * Tests if the passed parameter is a Boolean.
         * @method is
         * @param o {Object} Required. An Object that want to ensure is a Boolean.
         * @return {Boolean} True when parameter is a Boolean.
         * @static
         */
        is: function(o) {
            return _YL.isBoolean(o);
        }

    };

	_YL.augmentObject(Boolean, _that);
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Date utility extends the native JavaScript Date Object with additional methods and objects.
 * @module window
 * @class Date
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Date', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * Constant type for hours.
         * @property HOUR
         * @static
         * @final
         * @type String
         */
        HOUR: 'H',

        /**
         * Constant type for milliseconds.
         * @property MILLISECOND
         * @static
         * @final
         * @type String
         */
        MILLISECOND: 'MS',

        /**
         * Constant type for minutes.
         * @property MINUTE
         * @static
         * @final
         * @type String
         */
        MINUTE: 'I',

        /**
         * Constant value for 1 second in milliseconds.
         * @property ONE_SECOND_MS
         * @static
         * @final
         * @type Number
         */
        ONE_SECOND_MS: 1000,

        /**
         * Constant value for 1 minute in milliseconds.
         * @property ONE_MINUTE_MS
         * @static
         * @final
         * @type Number
         */
        ONE_MINUTE_MS: 60 * 1000,

        /**
         * Constant value for 1 hour in milliseconds.
         * @property ONE_HOUR_MS
         * @static
         * @final
         * @type Number
         */
        ONE_HOUR_MS: 60 * 60 * 1000,

        /**
         * Constant value for 1 day in milliseconds.
         * @property ONE_DAY_MS
         * @static
         * @final
         * @type Number
         */
        ONE_DAY_MS: 24 * 60 * 60 * 1000,

        /**
         * Constant value for 1 week in milliseconds.
         * @property ONE_WEEK_MS
         * @static
         * @final
         * @type Number
         */
        ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,

        /**
         * Constant type for seconds.
         * @property SECOND
         * @static
         * @final
         * @type String
         */
        SECOND: 'S',

        /**
         * Date constant for full month names.
         * @property MONTHS
         * @static
         * @final
         * @type String
         */
        MONTHS: ['January','February','March','April','May','June','July','August','September','October','November','December'],

        /**
         * Collection of abbreviated Month names.
         * @property MONTHS_ABBR
         * @static
         * @final
         * @type Array
         */
        MONTHS_ABBR: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		
		/**
		 * Determines the timezone offset from GMT.
		 *	Originally by Josh Fraser (http://www.onlineaspect.com)
		 * @method getTimeZoneOffset
		 * @return {Number} The timezone offset.
		 * @static
		 */
		getTimeZoneOffset: function() {
			var rightNow = new Date(),
				jan1 = Date.getJan1(rightNow),
				june1 = Date.getDate(rightNow.getFullYear(), 6, 1),
				tempGMT = jan1.toGMTString(),
				jan2 = new Date(tempGMT.substring(0, tempGMT.lastIndexOf(" ") - 1));

			tempGMT = june1.toGMTString();
			var june2 = new Date(tempGMT.substring(0, tempGMT.lastIndexOf(" ") - 1)),
				std_time_offset = (jan1 - jan2) / Date.ONE_HOUR_MS,
				daylight_time_offset = (june1 - june2) / Date.ONE_HOUR_MS,
				dst;

			if (std_time_offset === daylight_time_offset) {
				dst = 0; // daylight savings time is NOT observed
			}
			else {
				// positive is southern, negative is northern hemisphere
				var hemisphere = std_time_offset - daylight_time_offset;
				if (0 <= hemisphere) {std_time_offset = daylight_time_offset;}
				dst = 1; // daylight savings time is observed
			}
			
			var n = Math.floor(Math.abs(std_time_offset)) + dst;
			
			return (0 > std_time_offset) ? (-1 * n) : n;
		},

        /**
         * Calculates the difference between calA and calB in units of field. CalB should be before calA or the result will be negative.
         * @method diff
         * @param cA {Date} Optional. The JavaScript Date that is after than calB, or if invalid will assume 'Now'.
         * @param cB {Date} Optional. The JavaScript Date that is before than calA, or if invalid will assume 'Now'.
         * @param field {String} Optional. The field constant to be used for performing date math.
         * @return {Number} A number representing the length of time, in units of field, between dates calA & calB (rounded up).
         * @static
         */
        diff: function(cA, cB, field) {
            var calA = _YL.isDate(cA) ? cA : new Date(),
                calB = _YL.isDate(cB) ? cB : new Date(),
                val = 0,
                preround = 0,
	            isFieldTimeOfDay = Date.MILLISECOND === field || Date.HOUR === field || Date.MINUTE === field || Date.SECOND === field;

            // any period shorter than a week can be calculated using milliseconds, otherwise will require the year
            var diff = (Date.DAY === field || isFieldTimeOfDay) ? calA.getTime() - calB.getTime() : calA.getFullYear() - calB.getFullYear();

            switch (field) {
                case Date.YEAR: // year(s)
                    val = diff;
                    // correct for months
                    if (calA.getMonth() === calB.getMonth()) {
                        // correct for days
                        if (calA.getDate() < calB.getDate()) {
                            val -= 1;
                        }
                    }
                    else if (calA.getMonth() < calB.getMonth()) {
                        val -= 1;
                    }
                    break;

                case this.MONTH: // month(s)
                    val = diff * 12 + calA.getMonth() - calB.getMonth();
                    // correct for days
                    if (calA.getDate() < calB.getDate()) {
                        val -= 1;
                    }
                    break;

                case this.DAY: // day(s)
                    preround = diff / Date.ONE_DAY_MS;
                    break;

                case this.HOUR: // hour(s)
                    preround = diff / Date.ONE_HOUR_MS;
                    break;

                case this.MINUTE: // minute(s)
                    preround = diff / Date.ONE_MINUTE_MS;
                    break;

                case this.SECOND: // second(s)
                    preround = diff / Date.ONE_SECOND_MS;
                    break;

                case this.MILLISECOND: // millisecond(s)
                default:
                    val = diff;
                    break;
            }

            return preround ? Math.round(preround) : val;
        },

        /**
         * Returns a new JavaScript Date object, representing the given year, month and date. Time fields (hr, min, sec, ms) on the new Date object
         *  are set to 0. The method allows Date instances to be created with the a year less than 100. 'new Date(year, month, date)' implementations
         *  set the year to 19xx if a year (xx) which is less than 100 is provided.
         *
         * Note: Validation on argument values is not performed. It is the caller's responsibility to ensure
         *  arguments are valid as per the ECMAScript-262 Date object specification for the new Date(year, month[, date]) constructor.
         *
         * @method getDate
         * @param y {Number} Required. The date year.
         * @param m {Number} Required. The month index from 0 (Jan) to 11 (Dec).
         * @param d {Number} Optional. The date from 1 to 31. If not provided, defaults to 1.
         * @param h {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param i {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param s {Number} Optional. The date from 0 to 59. If not provided, defaults to 0.
         * @param ms {Number} Optional. The date from 0 to 999. If not provided, defaults to 0.
         * @return {Date} The JavaScript date object with year, month, date set as provided.
         * @static
         */
        getDate: function(y, m, d, h, i, s, ms) {
            var dt = null;

            if (_YL.isDefined(y) && _YL.isDefined(m)) {
                if (100 <= y) {
                    dt = new Date(y, m, d || 1);
                }
                else {
                    dt = new Date();
                    dt.setFullYear(y);
                    dt.setMonth(m);
                    dt.setDate(d || 1);
                }

                dt.setHours(h || 0, i || 0, s || 0, ms || 0);
            }

            return dt;
        },

        /**
         * Returns a date object from the String; expects 'MonthName, DayNr Year Hrs:Min:Sec', may not work properly on other strings in all browsers.
         * @method getDate
         * @param s {String} Required. The date as a String.
         * @return {Date} A date object, defined by the passed String; null when s is an invalid date.
         * @static
         */
        getDateFromTime: function(s) {
            var d = new Date();
            d.setTime(Date.parse('' + s));
            return ('Invalid Date' === ('' + d) || isNaN(d)) ? null : d;
        },

        /**
         * Retrieves the month value from the months short or abreviated name (ex. jan == Jan == January == january == 1).
         * @method getMonthIndexFromName
         * @param s {String} Required. The textual name of the month, can be any case and 3 letters or full name.
         * @return {Number} The index of the month (1-12) or -1 if invalid.
         * @static
         */
        getMonthIndexFromName: function(s) {
            var month = ('' + s).toLowerCase().substr(0, 3),
                mlist = Date.MONTHS_ABBR,
                i = 0;

            for (i = 0; i < mlist.length; i += 1) {
                if (mlist[i].toLowerCase() === month) {return i + 1;}
            }

            return -1;
        },

        /**
         * Shortcut method to get the current time in milliseconds.
         * @method getTime
         * @return {Number} the current time in milliseconds
         * @static
         */
        getTime: function() {
            return (new Date()).getTime();
        },

        /**
         * Calculates an appropriate time window then returns a String representation of that window.
         * @method getTimeAgo
         * @param c1 {Date} Required. The JavaScript Date that is before now, or will default to 'Now'.
         * @param c2 {Date} Optional. The JavaScript Date that is after 'then'; default is 'Now'.
         * @return {String} A String representing the length of time with units between date and 'Now'.
         * @static
         */
        getTimeAgo: function(c1, c2) {
            var now = _YL.isDate(c2) ? c2 : new Date(),
                then = _YL.isDate(c1) ? c1 : now,
                diff = (then.getTime() === now.getTime()) ? 0 : Date.diff(now, then, Date.MILLISECOND);

            if (diff < Date.ONE_SECOND_MS) {return '0 seconds';}

            if (diff < Date.ONE_MINUTE_MS) {
                diff = Date.diff(now, then, Date.SECOND);
                return diff + ' second' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_HOUR_MS) {
                diff = Date.diff(now, then, Date.MINUTE);
                return diff + ' minute' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_DAY_MS) {
                diff = Date.diff(now, then, Date.HOUR);
                return diff + ' hour' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_WEEK_MS) {
                diff = Date.diff(now, then, Date.DAY);
                return diff + ' day' + (1 === diff ? '' : 's');
            }

            if (diff < Date.ONE_WEEK_MS * 4) {
                diff = parseInt(Date.diff(now, then, Date.DAY) / 7, 10);
                return diff + ' week' + (1 === diff ? '' : 's');
            }

            diff = this.diff(now, then, Date.YEAR);

            if (1 < diff) {
                return diff + ' years';
            }
            else {
                diff = Date.diff(now, then, Date.MONTH);
                return diff + ' month' + (1 === diff ? '' : 's');
            }
        },

        /* defined below */
        is: function() {_throwNotImplemented('is', 'yahoo.ext/lang.js');}

    };

	_YL.augmentObject(Date, _that);

    // YAHOO.widget.DateMath included, use instead of custom Date methods
    if (YAHOO.widget && YAHOO.widget.DateMath) {
        var _DM = YAHOO.widget.DateMath;

        var _thatIfDateMath = {

            /**
             * @see YAHOO.widget.DateMath.DAY
             */
            DAY: _DM.DAY,

            /**
             * @see YAHOO.widget.DateMath.MONTH
             */
            MONTH: _DM.MONTH,

            /**
             * @see YAHOO.widget.DateMath.WEEK
             */
            WEEK: _DM.WEEK,

            /**
             * @see YAHOO.widget.DateMath.YEAR
             */
            YEAR: _DM.YEAR,

            /**
             * @see YAHOO.widget.DateMath.getJan1
             */
            getJan1: _DM.getJan1
        };

	    _YL.augmentObject(Object, _thatIfDateMath);
    }
    else {
        var _thatIfNotDateMath = {

            /**
             * Constant field representing Day.
             * @property DAY
             * @static
             * @final
             * @type String
             */
            DAY: 'D',

            /**
             * Constant field representing Month.
             * @property MONTH
             * @static
             * @final
             * @type String
             */
            MONTH: 'M',

            /**
             * Constant field representing Week.
             * @property WEEK
             * @static
             * @final
             * @type String
             */
            WEEK: 'W',

            /**
             * Constant field representing Year.
             * @property YEAR
             * @static
             * @final
             * @type String
             */
            YEAR: 'Y',

            /**
             * Retrieves a JavaScript Date object representing January 1 of any given year.
             * @method getJan1
             * @param calendarYear {Number} Optional. The calendar year for which to retrieve January 1; default is this year.
             * @return {Date} The Date for January 1 of the calendar year specified.
             * @static
             */
            getJan1: function(calendarYear) {
                return Date.getDate(_YL.isNumber(calendarYear) ? calendarYear : (new Date()).getFullYear(), 0, 1, 0, 0, 0, 1);
            }
        };

	    _YL.augmentObject(Date, _thatIfNotDateMath);
    }

    // YAHOO.lang extensions are included
    if (_YL.isDate) {
        var _thatIfIsDate = {

            /**
             * Tests if the passed parameter is a date.
             * @method is
             * @param date {Object} Required. An Object that want to ensure is a Date.
             * @return {Boolean} True when parameter is a date.
             * @static
             */
            is: function(date) {
                return _YL.isDate(date);
            }
        };

	    _YL.augmentObject(Date, _thatIfIsDate);
    }
})();

/**
 * The Date utility extends the native JavaScript Date Object prototype with additional methods and objects.
 * @class Date
 * @namespace Window
 * @extends Date
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Creates a new Date Object with the same time as 'this'.
         * @method clone
         * @return {Date} The copied date.
         * @public
         */
        clone: function() {
            var date = new Date();
            date.setTime(this.getTime());
            return date;
        },

        /**
         * Converts the JavaScript Date into a date String. Recognizes the following format characters:
         *  y = year, m = month, d = day of month, h = hour, i = minute, s = second.
         * @method toDateString
         * @param format (String} Optional. The String format to convert the JavaScript Date into (ie. 'm/d/y' or 'm. d, y'); default is 'm/d/y'.
         * @param showZeros {Boolean} Optional. Forces leading zeros, so 9/1/2006 becomes 09/01/2006.
         * @param useMonthName {String|Boolean} Optional. String or Boolean, use the month name instead of the digit, ('abbr' uses the short name).
         * @return {String} the JavaScript Date as a String
         * @public
         */
        format: function(format, showZeros, useMonthName) {
            var f = (_YL.isString(format) ? format : Date.MONTH + '/' + Date.DAY + '/' + Date.YEAR).toUpperCase();

            // cast all values to strings
            var day = '' + this.getDate(),
                month = '' + (this.getMonth() + 1),
                hour = '' + this.getHours(),
                minute = '' + this.getMinutes(),
                second = '' + this.getSeconds(),
                year = '' + this.getFullYear();

            // pad leading zeros
            if (showZeros) {
                if (1 === day.length) {day = '0' + day;}
                if (1 === month.length) {month = '0' + month;}
                if (1 === hour.length) {hour = '0' + hour;}
                if (1 === minute.length) {minute = '0' + minute;}
                if (1 === second.length) {second = '0' + second;}
            }

            // use month name
            if (useMonthName) {
                month = (_YL.isString(useMonthName) && 'abbr' === useMonthName.toLowerCase()) ? this.getMonthNameAbbr() : this.getMonthName();
            }

            // do month last as some months contain reserved letters
            return f.replace(Date.YEAR, year).replace(Date.DAY, day).replace(Date.HOUR, hour).replace(Date.MINUTE, minute)
                    .replace(Date.SECOND, second).replace(Date.MONTH, month);
        },

        /**
         * Converts JavaScript Date into a MySQL dateTime String '1969-12-31 00:00:00'.
         * @method formatTime
         * @return {String} The JavaScript Date as a MySQL time String.
         * @public
         */
        formatTime: function() {
            return this.format('y-m-d h:i:s', true);
        },

        /**
         * Retrieves the name of the month.
         * @method getMonthName
         * @return {String} The month fullname.
         * @public
         */
        getMonthName: function() {
            return Date.MONTHS[this.getMonth()];
        },

        /**
         * Retrieves the abbreviated name of the month.
         * @method getMonthNameAbbr
         * @return {String} The month abbreviated name.
         * @public
         */
        getMonthNameAbbr: function() {
            return this.getMonthName().substr(0,3);
        },

        /**
         * Returns whether the Javascript Date or 'Now' is on a leap year.
         * @method isLeapYear
         * @return {Boolean} True if the year matches traditional leap year rules.
         * @static
         */
        isLeapYear: function() {
            var year = this.getFullYear();
            return (0 === year % 4 && (0 !== year % 100 || 0 === year % 400));
        },

        /**
         * Returns whether the Javascript Date or 'Now' is on a weekend.
         * @method isWeekend
         * @return {Boolean} True if the day of the week matches traditional weekend rules.
         * @static
         */
        isWeekend: function() {
            return (2 > this.getDay());
        }
    };

	_YL.augmentObject(Date.prototype, _that);

    // YAHOO.widget.DateMath included, use instead of custom Date methods
    if (YAHOO.widget && YAHOO.widget.DateMath) {
        var _DM = YAHOO.widget.DateMath;

        var _thatIfDateMath = {

            /**
             * @see YAHOO.widget.DateMath.add
             */
            add: function() {
                return _DM.add.call(this, this, arguments[0], arguments[1]);
            },

            /**
             * @see YAHOO.widget.DateMath.after
             */
            after: function() {
                return _DM.after.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.before
             */
            before: function() {
                return _DM.before.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.between
             */
            between: function() {
                return _DM.between.call(this, this, arguments[0], arguments[1]);
            },

            /**
             * @see YAHOO.widget.DateMath.clearTime
             */
            clearTime: function() {
                return _DM.clearTime.call(this, this);
            },

            /**
             * @see YAHOO.widget.DateMath.getDayOffset
             */
            getDayOffset: function() {
                return _DM.getDayOffset.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.getJan1
             */
            getJan1: function() {
                return _DM.getJan1.call(this, this, arguments[0]);
            },

            /**
             * @see YAHOO.widget.DateMath.subtract
             */
            subtract: function() {
                return _DM.subtract.call(this, this, arguments[0], arguments[1]);
            }
        };

	    _YL.augmentObject(Date.prototype, _thatIfDateMath);
    }
    else {
        var _thatIfNotDateMath = {

            /**
             * Adds the specified amount of time to the this instance.
             * @method add
             * @param field {String} Required. The field constant to be used for performing addition.
             * @param amount {Number} Required. The number of units (measured in the field constant) to add to the date.
             * @return {Date} The resulting Date object.
             * @public
             */
            add : function(field, amount) {
                var d = new Date(this.getTime()),
                    amt = _YL.isNumber(amount) ? amount : 0;

                switch (field) {
                    case Date.MONTH:
                        var newMonth = this.getMonth() + amt,
                            years = 0;

                        if (0 > newMonth) {
                            while (0 > newMonth) {
                                newMonth += 12;
                                years -= 1;
                            }
                        }
                        else if (11 < newMonth) {
                            while (11 < newMonth) {
                                newMonth -= 12;
                                years += 1;
                            }
                        }

                        d.setMonth(newMonth);
                        d.setFullYear(this.getFullYear() + years);
                        break;

                    case Date.YEAR:
                        d.setFullYear(this.getFullYear() + amt);
                        break;

                    case Date.WEEK:
                        d.setDate(this.getDate() + (amt * 7));
                        break;

                    case Date.DAY:
                    default:
                        d.setDate(this.getDate() + amt);
                        break;
                }

                return d;
            },

            /**
             * Determines whether a given date is after another date on the calendar.
             * @method after
             * @param compareTo {Date} Required. The Date object to use for the comparison.
             * @return {Boolean} True if the date occurs after the compared date; false if not.
             * @public
             */
            after : function(compareTo) {
                return _YL.isDate(compareTo) && (this.getTime() > compareTo.getTime());
            },

            /**
             * Determines whether a given date is before another date on the calendar.
             * @method before
             * @param compareTo {Date} Required. The Date object to use for the comparison.
             * @return {Boolean} True if the date occurs before the compared date; false if not.
             * @public
             */
            before : function(compareTo) {
                return _YL.isDate(compareTo) && (this.getTime() < compareTo.getTime());
            },

            /**
             * Determines whether a given date is between two other dates on the calendar.
             * @method between
             * @param dateA {Date} Required. One end of the range.
             * @param dateB {Date} Required. Another end of the range.
             * @return {Boolean} True if the date occurs between the compared dates; false if not.
             * @public
             */
            between : function(dateA, dateB) {
	            if (! (_YL.isDate(dateA) && _YL.isDate(dateB))) {return false;}
                return ( (this.after(dateA) && this.before(dateB)) || (this.before(dateA) && this.after(dateB)) );
            },

            /**
             * Removes the time only values from the 'this'.
             * @method clearTime
             * @return {Date} Returns a reference to 'this'.
             * @public
             */
            clearTime: function() {
                this.setHours(0, 0, 0, 0);
                return this;
            },

            /**
             * Calculates the number of days the specified date is from January 1 of the specified calendar year.
             *  Passing January 1 to this function would return an offset value of zero.
             * @method getDayOffset
             * @return {Number} The number of days since January 1 of the given year.
             * @public
             */
            getDayOffset : function() {
                // clear hours first
                var date = this.clone();
                date.setHours(0, 0, 0, 0);
                return Date.diff(date, this.getJan1(), Date.DAY);
            },

            /**
             * Retrieves a JavaScript Date object representing January 1 of the year for 'this'.
             * @method getJan1
             * @return {Date} The Date for January 1 of the year for 'this'.
             * @static
             */
            getJan1: function() {
                return Date.getDate(this.getFullYear(), 0, 1, 0, 0, 0, 1);
            },

            /**
             * Subtracts the specified amount of time from the this instance.
             * @method subtract
             * @param field {Number} Required. The this field constant to be used for performing subtraction.
             * @param amount {Number} Required. The number of units (measured in the field constant) to subtract from the date.
             * @return {Date} The resulting Date object.
             * @public
             */
            subtract: function(field, amount) {
                return this.add(field, _YL.isNumber(amount) ? (amount * -1) : 0);
            }
        };

	    _YL.augmentObject(Date.prototype, _thatIfNotDateMath);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The Number utility extends the native JavaScript Number Object with additional methods and objects.
 * @module window
 * @class Number
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns a unique number, non-repeatable number.
         * @method getUnique
         * @return {Number} A integer value.
         * @static
         */
        getUnique: function() {
            return parseInt(new Date().getTime() + Math.random() * 10000, 10);
        },

        /**
         * Tests if the passed parameter is a Number.
         * @param n {Object} Required. An Object that want to ensure is a Number.
         * @return {Boolean} True when parameter is a Number.
         * @static
         */
        is: function(n) {
            return _YL.isNumber(n);
        }

    };

	_YL.augmentObject(Number, _that);
})();

/**
 * The Number utility extends the native JavaScript Number Object prototype with additional methods and objects.
 * @class Number
 * @namespace Window
 * @extends Number
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns the value of 'this' without any direction.
         * @method abs
         * @return {Number} The absolute value of 'this'.
         * @see Math.abs
         * @public
         */
        abs: function() {
            return Math.abs(this);
        },

        /**
         * Returns the value of 'this' rounded upwards to the nearest integer.
         * @method ceil
         * @return {Number} The rounded value of 'this'.
         * @see Math.ceil
         * @public
         */
        ceil: function() {
            return Math.ceil(this);
        },

        /**
         * Returns the value of 'this' rounded downwards to the nearest integer.
         * @method floor
         * @return {Number} The rounded value of 'this'.
         * @see Math.floor
         * @public
         */
        floor: function() {
            return Math.floor(this);
        },

        /**
         * Formats the number according to the 'format' string; adherses to the american number standard where a comma is inserted after every 3 digits.
         *  Note: there should be only 1 contiguous number in the format, where a number consists of digits, period, and commas
         *        any other characters can be wrapped around this number, including '$', '%', or text
         *        examples (123456.789):
         *          '0' - (123456) show only digits, no precision
         *          '0.00' - (123456.78) show only digits, 2 precision
         *          '0.0000' - (123456.7890) show only digits, 4 precision
         *          '0,000' - (123,456) show comma and digits, no precision
         *          '0,000.00' - (123,456.78) show comma and digits, 2 precision
         *          '0,0.00' - (123,456.78) shortcut method, show comma and digits, 2 precision
         *	Note: Fails on formats with multiple periods.
         * @method format
         * @param format {String} Required. The way you would like to format this text.
         * @return {String} The formatted number.
         * @public
         */
        format: function(format) {
            if (! _YL.isString(format)) {return '';} // sanity check

            var hasComma = -1 < format.indexOf(','),
                psplit = format.replace(/[^0-9\u2013\-\.]/g, '').split('.'),
                that = this;

            // compute precision
            if (1 < psplit.length) {
                // fix number precision
                that = that.toFixed(psplit[1].length);
            }
            // error: too many periods
            else if (2 < psplit.length) {
                throw('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
            }
            // remove precision
            else {
                that = that.toFixed(0);
            }

            // get the string now that precision is correct
            var fnum = that.toString();

            // format has comma, then compute commas
            if (hasComma) {
                // remove precision for computation
                psplit = fnum.split('.');

                var cnum = psplit[0],
                    parr = [],
                    j = cnum.length,
                    m = Math.floor(j / 3),
                    n = (cnum.length % 3) || 3; // n cannot be ZERO or causes infinite loop

                // break the number into chunks of 3 digits; first chunk may be less than 3
                for (var i = 0; i < j; i += n) {
                    if (0 !== i) {n = 3;}
                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }

                // put chunks back together, separated by comma
                fnum = parr.join(',');

                // add the precision back in
                if (psplit[1]) {fnum += '.' + psplit[1];}
            }

            // replace the number portion of the format with fnum
            return format.replace(/[\d,?\.?]+/, fnum);
        },

        /**
         * Determines the number of significant figures in Number.
         * @method getPrecision
         * @retrun {Number} The number of significant figures.
         * @public
         */
        getPrecision: function() {
            var sb = ('' + Math.abs(this)).split('.');

            if ('0' === sb[0] && sb[1] && sb[1].length) {
                return -1 * sb[1].length;
            }
            else {
                return sb[0].length;
            }
        },

        /**
         * Determines if the number value is between two other values.
         * @method isBetween
         * @param i {Number} Required. The lower bound of the range.
         * @param j {Number} Required. The upper bound of the range.
         * @param inclusive {Boolean} Optional. True if i and j are to be included in the range.
         * @return {Boolean} True if i < this < j or j > this > i.
         * @public
         */
        isBetween: function(i, j, inclusive) {
            if (! (Number.is(i) && Number.is(j))) {return false;}
            return inclusive ? ((i <= this && j >= this) || (j <= this && i >= this)) :
                               ((i < this && j > this) || (j < this && i > this));
        },

        /**
         * Determines if the number value is not between two other values.
         * @method isNotBetween
         * @param i {Number} Required. The lower bound of the range.
         * @param j {Number} Required. The upper bound of the range.
         * @param inclusive {Boolean} Optional. True if i and j are to be included in the range.
         * @return {Boolean} True if i > this || val > j.
         * @public
         */
        isNotBetween: function(i, j, inclusive) {
            return ! this.isBetween(i, j, inclusive);
        },

        /**
         * Computes a random integer from 'this'; if parameter n is passed, then computes a number in the range between 'this' and 'n'.
         * @method random
         * @param n {Number} Optional. End of range.
         * @return {Number} A random integer.
         * @public
         */
        random: function(n) {
            var offset = 0,
                m = this;

            // compute min/max
            if (_YL.isNumber(n) && n !== m) {
                var max = (n < m) ? m : n,
                    min = n === max ? m : n;

                offset = min;
                m = max - min;
            }

            return offset + Math.floor(Math.random() * m + 1);
        },

        /**
         * Rounds a number to the nearest integer.
         * @method round
         * @return {Number} The rounded value of 'this'.
         * @see Math.round
         * @public
         */
        round: function() {
            return Math.round(this);
        },

        /**
         * Rounds to the nearest whole number.
         * @method roundToPrecision
         * @param prec {Number} Optional. The precision to round to: 1, 10, 100, etc...; default is 10, which rounds to the nearest tenth.
         * @return {Number} The converted number.
         * @public
         */
        roundToPrecision: function(prec) {
            if (1 > this) {return 1;}
            var pstr = ('' + prec),
                precision = Number.is(prec) ? (Math.pow(10, pstr.length) / 10) : 10,
                n = Math.ceil(this / precision);
            return n * precision;
        },

        /**
         * Returns the square root of a number.
         * @method round
         * @return {Number} The sqrt value of 'this'.
         * @see Math.sqrt
         * @public
         */
        sqrt: function() {
            return Math.sqrt(this);
        }
    };

	_YL.augmentObject(Number.prototype, _that);
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Object utility extends the native JavaScript Object Object with additional methods and objects.
 * @module window
 * @class Object
 * @dependencies YAHOO.lang
 */
// !IMPORTANT! Do not put anything on the Object.prototype as this can cause issues.
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'Object', arguments);
	}: function(text) {throw(text);};

    var _that = {

	    /**
	     * Determines the appropriate JSON representation for object.
	     * @method convertToJsonString
	     * @param o {Object} Required. An object.
	     * @static
	     */
	    convertToJsonString: function(o) {
			// this is a String
			if (_YL.isString(o)) {
				// this is actually a number cast as a string, convert back to number
				if ('' !== o && o === o.stripNonNumeric()) {
					return parseFloat(o);
				}
				else {
					return ('"' + o + '"').replace(/^""(.*?)""$/, '"$1"');
				}
			}
			else {
				// Number
				if (_YL.isNumber(o)) {
					return parseFloat(o);
				}
				// Array
				else if (_YL.isArray(o)) {
					return o.toJsonString();
				}
				// Objects should be parsed
				else if (_YL.isObject(o)) {
					return Object.toJsonString(o);
				}

				return ('"' + o + '"'); // some unknown object, just use native 'toString' method of object
			}
	    },

        /* defined below */
        forEach: function() {_throwNotImplemented('forEach', 'yahoo.ext/lang.js');},

        /**
         * Tests if the passed parameter is an Object.
         * @param o {Object} Required. An Object that want to ensure is an Object.
         * @return {Boolean} True when parameter is an Object.
         * @static
         */
        is: function(o) {
            return _YL.isObject(o);
        },

        /* defined below */
        toJsonString: function() {_throwNotImplemented('toJsonString', 'yahoo.ext/lang.js');},

        /* defined below */
        toQueryString: function() {_throwNotImplemented('toQueryString', 'yahoo.ext/lang.js');}
    };

	_YL.augmentObject(Object, _that);

    // YAHOO.lang extensions are included
    if (_YL.forEach) {
        var _thatIfLangExtended = {

            /**
             * Alias for YAHOO.lang.forEach.
             * @method forEach
             * @see YAHOO.lang.forEach
             * @static
             */
            forEach: _YL.forEach,

            /**
             * Static method for converting the object to a JSON string.
             * @method toJsonString
             * @param data {Object} Required. The object to loop through.
             * @return {String} The object as a JSON string.
             * @static
             */
            toJsonString: function(data) {
                var sb = [];

                Object.forEach(data, function(o, k) {
                    sb.push(('"' + k + '":') + Object.convertToJsonString(o));
                });

                return '{' + sb.join(',') + '}';
            },

            /**
             * Static method for converting the object to a query string.
             * @method toQueryString
             * @param data {Object} Required. The object to loop through.
             * @param encode {Boolean} Optional. True when you want to escape the string; default is falsy.
             * @return {String} The object as a query string.
             * @static
             */
            toQueryString: function(data, encode) {
                var sb = [],
                    i = 0;

                _YL.forEach(data, function(v, k) {
					// only care about strings and numbers
					if (_YL.isString(v, 'string') || _YL.isNumber(v, 'number')) {
						sb[i] = (k + '=' + v);
						i += 1;
					}
                });

                return encode ? encodeURIComponent(sb.join('&')) : sb.join('&');
            }
        };

		_YL.augmentObject(Object, _thatIfLangExtended, true);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The RegExp utility extends the native JavaScript RegExp Object with additional methods and objects.
 * @module window
 * @class RegExp
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'RegExp', arguments);
	}: function(text) {throw(text);};

    var _that = {

        /**
         * Static method to escape regex literals.
         * @method esc
         * @param text {String} Required. The literal to search.
         * @return {String} The text escaped.
         * @static
         */
        esc: function(text) {
          if (! arguments.callee.sRE) {
            var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ];
            arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
          }

          return text.replace(arguments.callee.sRE, '\\$1');
        },

        /* defined below */
        is: function() {_throwNotImplemented('is', 'yahoo.ext/lang.js');}

    };

	_YL.augmentObject(RegExp, _that);

    if (_YL.isRegExp) {
        var _thatIfIsRegExp = {

            /**
             * Tests if the passed parameter is a RegExp.
             * @method is
             * @param o {Object} Required. An Object that want to ensure is a RegExp.
             * @return {Boolean} True when parameter is a RegExp.
             * @static
             */
            is: function(o) {
                return _YL.isRegExp(o);
            }
        };

	    _YL.augmentObject(RegExp, _thatIfIsRegExp, true);
    }
})();

/**
 * The RegExp utility extends the native JavaScript RegExp Object prototype with additional methods and objects.
 * @class RegExp
 * @namespace Window
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _that = {

        /**
         * Returns the number of times this regex matches the haystack.
         * @method count
         * @param haystack {String} Required. The string to search; fails gracefull on non-string haystacks.
         * @return {Number} The number of matches.
         * @public
         */
        count: function(haystack) {
            return ('' + haystack).match(this).length;
        }
    };

	_YL.augmentObject(RegExp.prototype, _that);
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.01
 */

/**
 * The String utility extends the native JavaScript String Object with additional methods and objects.
 * @module window
 * @class String
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang,
        _YD = YAHOO.util.Dom,
        _DOC = document;
    
    var _that = {

        /**
         * An associative array containing select HTML character entities that we'd like to decode.
         * @property htmlCharacterEntities
         * @static
         * @final
         * @type {Array}
         */
        htmlCharacterEntities: {"quot":'"',"nbsp":' ',"ndash":"\u2013","lt":'<',"gt":'>', "reg":'\xae',"copy":'\xa9',
                                "cent":'\xa2',"amp":'&',"apos":"'","rsquo":'\x27'},

        /**
         * Regex for color validation.
         * @property RX_COLOR
         * @static
         * @final
         * @type {RegExp}
         */
        RX_COLOR: /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/,

        /**
         * Regex for email validation.
         * @property RX_EMAIL
         * @static
         * @final
         * @type {RegExp}
         */
        RX_EMAIL: /^\w(\+?\.?-?\w)*\-?@\w(\+?\.?[\-\w])*\.[a-z]{2,4}$/i,

        /**
         * Converts a hexidecimal color into it's RGB values.
         * @method hexToRGB
         * @param s {String} A hexidecimal color.
         * @static
         */
        hexToRGB: function(s) {
            var r = 0, g = 0, b = 0;

            if (s.isColor()) {
                var n = -1 < s.indexOf('#') ? 1 : 0;

                if (3 === (s.length - n)) {
                    r = s.substr(n, 1);
                    g = s.substr(n + 1, 1);
                    b = s.substr(n + 2, 1);
                    r = (r + r).fromHex();
                    g = (g + g).fromHex();
                    b = (b + b).fromHex();
                }
                else {
                    r = s.substr(n, 2).fromHex();
                    g = s.substr(n + 2, 2).fromHex();
                    b = s.substr(n + 4, 2).fromHex();
                }
            }

            return [r, g, b];
        },

        /**
         * Tests if the passed parameter is a String.
         * @param o {Object} Required. An Object that want to ensure is a String.
         * @return {Boolean} True when parameter is a String.
         * @static
         */
        is: function(o) {
            return _YL.isString(o);
        },

        /**
         * Converts red, green, blue numeric values to hex.
         * @method RGBtoHex
         * @param r {String|Number} Required. The value from 0-255.
         * @param g {String|Number} Required. The value from 0-255.
         * @param b {String|Number} Required. The value from 0-255.
         * @return {String} The numeric value as a hex 00-FF.
         * @static
         */
        RGBtoHex: function(r, g, b) {
            return ('' + r).toHex() + ('' + g).toHex() + ('' + b).toHex();
        }
    };

	_YL.augmentObject(String, _that);

    // DOM extensions are included
    if (_YD.replace) {
        var _thatIfDomReplace = {

            /**
             * Method to search a string for long words and break them into manageable chunks.
             * @method breakLongWords
             * @param node {Element} Required. Pointer reference to DOM element to append to.
             * @param s {String} The text.
             * @param n {Number} The character position to split around.
             * @static
             */
            breakLongWords: function(node, s, n) {
                if (! s) {return;}
                var tokens = s.split(' '),
                    span = node.appendChild(_DOC.createElement('span')),
                    sb = [];

                // iterate on each word in the string
                _YL.arrayWalk(tokens, function(token) {
                    var tok = token + ' ',
                        m = tok.length;

                    // the length of the word exceeds the threshold
                    if (m > n) {
                        _YD.replace(span, sb.join(''));

                        for (var k=0; k < m; k += n) {
                            var wspan = (0 === k && 0 === sb.length)? span: node.appendChild(_DOC.createElement('span'));

                            if (k + n < m) {
                                _YD.replace(wspan, tok.substr(k, n));
                                node.appendChild(_DOC.createElement('wbr'));
                            }
                            else {
                                _YD.replace(wspan, tok.substring(k));
                            }
                        }

                        span = node.appendChild(_DOC.createElement('span'));
                        sb = [];
                    }
                    // the length of the word is less than threshold
                    else {
                        sb.push(tok);
                    }
                });

                _YD.replace(span, sb.join(''));
                if (! sb.length) {node.removeChild(span);}
            }
        };

        _YL.augmentObject(String, _thatIfDomReplace);
    }
})();

/**
 * The String utility extends the native JavaScript String Object prototype with additional methods.
 * @class String
 * @namespace Window
 * @extends String
 * @dependencies YAHOO.lang
 */
(function() {
    var _YL = YAHOO.lang;

    var _throwNotImplemented = _YL.throwError ? function() {
		_YL.throwError.call(this, _YL.ERROR_NOT_IMPLEMENTED, 'String.prototype', arguments);
	}: function(text) {throw(text);};

    var _that = {

        capitalize: function() {_throwNotImplemented('capitalize', 'yahoo.ext/lang.js');},

        /**
         * Converts commas in the string into comma + newline characters.
         * @method convertCommasToNewline
         * @return {String} The converted string.
         * @public
         */
        convertCommasToNewline: function() {
            return this.replace(/,\s*/g, ",\n");
        },

        /**
         * Decodes a string containing either HTML or XML character entities.  Not all HTML character entities are supported.
         * @author Jason Yiin
         * @method decode
         * @return {String} The decoded string.
         * @public
         */
        decode: function() {
            return this.replace(/\&#?([a-z]+|[0-9]+);|\&#x([0-9a-fA-F]+);/g,
                /*
                 * Callback function callback by replace.
                 * @param matched {Object} Required. The matches from regex.
                 * @param htmlCharacterEntity {String} Required. The match for the first back-reference.
                 * @param xmlCharacterEntity {String} Required. The match for the second back-reference.
                 * @param offset {Number} Optional. The offset of match in String.
                 * @param whole {String} Optional. The reference to the original value.
                 */
                function(matched, htmlCharacterEntity, xmlCharacterEntity) {
                    var returnString = matched;

                    if (htmlCharacterEntity) {
                        var hceValue = String.htmlCharacterEntities[htmlCharacterEntity];
                        if (hceValue) {returnString = hceValue;}
                    }
                    else if (xmlCharacterEntity) {
                        //if fromCharCode is passed something that it can't recognize, it returns a ?
                        returnString = String.fromCharCode(parseInt(xmlCharacterEntity, 16));
                    }

                    return returnString;
                });
        },

        /**
         * Decodes the URL and then corrects any discrepencies.
         * @method decodeUrl
         * @return {String} The decoded URL.
         * @public
         */
        decodeUrl: function() {
            return decodeURIComponent(this).replace(/\+/g, ' ');
        },
    
        /**
         * Encodes the URL and then corrects any discrepencies.
         * @method encodeUrl
         * @return {String} The encoded URL.
         * @public
         */
        encodeUrl: function() {
            return encodeURIComponent(this);
        },

        /**
         * Checks if a 'this' ends with the needle.
         * @method endsWith
         * @param needle {String} Required. The search needle.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if 'this' ends with needle.
         * @public
         */
        endsWith: function(needle, ignoreCase) {
            var str = '' + this,
                end = '' + needle;

            // if the needle is longer than 'this', we know false
            if (0 === end.length || 0 > (this.length - end.length)) {return false;}

            if (ignoreCase) {
                str = str.toLowerCase();
                end = end.toLowerCase();
            }

            return str.lastIndexOf(end) === str.length - end.length;
        },

        /**
         * Checks if a 'this' ends with any of the needles in the argument set.
         * @method endsWithAny
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional search needles.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings; last parameter if desired.
         * @return {Boolean} True, if 'this' ends with any of the arguments.
         * @public
         */
        endsWithAny: function(needle, needleX, ignoreCase) {
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last];

            for (var i = 0; i < args.length; i += 1) {
                if (this.endsWith(args[i], iCase)) {return true;}
            }

            return false;
        },

        /**
         * Converts a 10-digit number into an american phone number (###-###-####).
         * @method formatPhone
         * @return {String} The formatted string; return "" when invalid.
         * @public
         */
        formatPhone: function() {
            var str = this.stripNonNumbers();
            if (10 !== str.length) {return '';}
            return str.replace(/(\d{3})(\d{3})(\d{4})/g, '$1-$2-$3');
        },

        /**
         * Converts a hexidecimal into a number.
         * @method fromHex
         * @return {Number} The hexidecimal value of number.
         * @public
         */
        fromHex: function() {
            return parseInt('' + this, 16);
        },

        /**
         * Converts 'this' into a number, defaults to 0.
         * @method getNumber
         * @param isInt {Boolean} Optional. When true, converts to integer instead of float; default is falsy.
         * @param strict {Boolean} Optional. When true, removes all non-numbers, otherwise remove non-numeric; default is falsy.
         * @return {Number} The formatted number.
         * @public
         */
        getNumber: function(isInt, strict) {
            var str = strict ? this.stripNonNumbers() : this.stripNonNumeric();
            if (0 === str.length) {str = '0';}
            return isInt ? parseInt(str) : parseFloat(str);
        },

        /* defined below */
        getQueryValue: function() {_throwNotImplemented('getQueryValue', 'native.ext/regexp.js');},

        /**
         * Returns the number of words in a string (does not split on '_').
         * @method getWordCount
         * @return {Number} The number of words in 'this'.
         * @public
         */
        getWordCount: function() {
            var o = this.trim().match(/\b\w+\b/g);
            return o ? o.length : 0;
        },

        /**
         * Checks if a string contains any of the strings in the arguement set.
         * @method has
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional needles to search.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if str contains any of the arguements.
         * @static
         */
        has: function(needle, needleX, ignoreCase) {
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last],
                str = iCase ? this.toLowerCase() : this;

            // if the needle is longer than 'this', we know false
            if (0 === str.length) {return false;}

            for (var i = 0; i < args.length; i += 1) {
                var s = '' + args[i];
                if (0 < s.length && -1 < str.indexOf(iCase ? s.toLowerCase() : s)) {return true;}
            }

            return false;
        },

        /**
         * Assert is a 'hexidecimal color'.
         * @method isColor
         * @return {Boolean} True, if the str contains a color string like '#F00' or '#FF00CC'.
         * @static
         */
        isColor: function() {
            return String.RX_COLOR.test(this);
        },

        /**
         * Checks if the email string is an email by test it has an '@' and a '.' in the correct places.
         * @method isEmail
         * @return {Boolean} True, if the str contains only one email.
         * @static
         */
        isEmail: function() {
            return String.RX_EMAIL.test(this.trim());
        },

        /**
         * Checks if the string is a number (numeric).
         * @method isNumber
         * @return {Boolean} True, if 'this' is a number.
         * @static
         */
        isNumber: function() {
            return this.trim().length === this.stripNonNumeric().length;
        },

        /**
         * Convert string new lines to newlineChar, useful for form submission.
         * @method normalizeNewlines
         * @param newlineChar {String} Optional. The character to replace newline with ("\n" or "\r").
         * @return {String} The converted string.
         * @public
         */
        normalizeNewlines: function(newlineChar) {
            var text = this;

            if ('\n' === newlineChar || '\r' === newlineChar) {
                text = text.replace(/\r\n|\r|\n/g, newlineChar);
            }
            else {
                text = text.replace(/\r\n|\r|\n/g, "\r\n");
            }

            return text;
        },

        /**
         * Removes the rx pattern from the string.
         * @method remove
         * @param rx {RegExp} Required. The regex to use for finding characters to remove.
         * @return {String} The cleaned string.
         * @public
         */
        remove: function(rx) {
            return this.replace(rx, '');
        },

        /**
         * Checks if a 'this' starts with the needle.
         * @method startsWith
         * @param needle {String} Required. The search needle.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings.
         * @return {Boolean} True, if 'this' starts with needle.
         * @public
         */
        startsWith: function(needle, ignoreCase) {
            var str = '' + this,
                start = '' + needle;

            // if the needle is longer than 'this', we know false
            if (0 === start.length || 0 > (this.length - start.length)) {return false;}

            if (ignoreCase) {
                str = str.toLowerCase();
                start = start.toLowerCase();
            }

            return 0 === str.indexOf(start);
        },

        /**
         * Checks if a 'this' starts with any of the needles in the argument set.
         * @method startsWithAny
         * @param needle {String} Required. The search needle.
         * @param needleX {String} Optional. Additional search needles.
         * @param ignoreCase {Boolean} Optional. True, ignores the case of the two strings; last parameter if desired.
         * @return {Boolean} True, if 'this' starts with any of the arguments.
         * @public
         */
        startsWithAny: function(needle, needleX, ignoreCase){
            var args = arguments,
                last = args.length - 1,
                iCase = _YL.isBoolean(args[last]) && args[last];

            for (var i = 0; i < args.length; i += 1) {
                if (this.startsWith(args[i], iCase)) {return true;}
            }

            return false;
        },

        /**
         * Removes non-numeric characters, except minus and decimal.
         * @method stripNonNumeric
         * @return {String} The cleaned string.
         * @public
         */
        stripNonNumeric: function() {
            return this.remove(/[^0-9\u2013\-\.]/g);
        },

        /**
         * Remove all characters that are not 0-9.
         * @method stripNonNumbers
         * @return {String} The cleaned string.
         * @public
         */
        stripNonNumbers: function() {
            return this.remove(/[^0-9]/g);
        },

        /**
         * Remove all characters that are 0-9.
         * @method stripNumbers
         * @return {String} The cleaned string.
         * @public
         */
        stripNumbers: function() {
            return this.remove(/[0-9]/g);
        },

        /**
         * HTML script tags from the string.
         * @method stripScripts
         * @return {String} The cleaned string.
         * @public
         */
        stripScripts: function() {
            return this.remove(new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img'));
        },

        /**
         * HTML tags from the string.
         * @method stripTags
         * @return {String} The cleaned string.
         * @public
         */
        stripTags: function() {
            return this.remove(/<\/?[^>]+>/gi);
        },

        /**
         * Returns the substring up to or including the needle.
         * @method substrToStr
         * @param needle {String} Required. The search needle.
         * @param sIndex {Number} Optional. The starting index, default will start from the beginning of 'this'.
         * @param fl {Boolean} Optional. If truthy, will include the substring in the output.
         * @return {String} A substring of 'this' or empty string.
         * @public
         */
        substrToStr: function(needle, sIndex, fl) {
            var sub = needle ? '' + needle : '';
            if (! _YL.isNumber(sIndex)) {sIndex = 0;}
            if (sIndex > this.length) {return '';}
            var i = this.indexOf(sub);
            if (-1 === i) {return '';}
            return this.substr(sIndex, i - sIndex) + (fl ? sub : '');
        },

        /**
         * Converts 0-255 value into its hex equivalent. String should be numberic between 0 and 255.
         * @method toHex
         * @return {String} The hex 00-FF of numberic value.
         * @static
         */
        toHex: function() {
            var hex = '0123456789ABCDEF',
                n = parseInt(this, 10);

            if (0 === n || isNaN(n)) {return '00';}
            n %= 256; // ensures number is base 16
            n = Math.max(0, n);
            n = Math.min(n, 255);
            n = Math.round(n);
            return hex.charAt((n - n % 16) / 16) + hex.charAt(n % 16);
        },

        /**
         * Truncates the string and inserts and elipsis.
         * @method truncate
         * @param n {Number} Optional. The max length of the string; defualt is 30.
         * @param truncation {String} Optional. The string to use as the ellipsis; defualt is '...'.
         * @return {String} The truncated string with ellipsis if necessary.
         * @static
         */
        truncate: function(n, truncation) {
            var str = '' + this,
                length = n || 30;
            truncation = $defined(truncation) ? truncation : '...';
            return str.length > length ? str.substring(0, length - truncation.length) + truncation : str;
        },

        /**
         * Replaces the white spaces at the front and end of the string.
         *  Optimized: http://blog.stevenlevithan.com/archives/faster-trim-javascript.
         * @method trim
         * @return {String} The cleaned string.
         * @public
         */
        trim: function() {
            return this.remove(/^\s\s*/).remove(/\s\s*$/);
        },

        /* defined below */
        toJsonObject: function() {_throwNotImplemented('toJsonObject', 'yahoo/json.js');}
    };

    _YL.augmentObject(String.prototype, _that);

    // YAHOO.json extensions are included
    if (''.parseJSON) {
        var _thatIfJSON = {

            /**
             * Converts the string to a JSON object; contains special logic for older safari versions that choke on large strings.
             * @method toJsonObject
             * @param forceEval {Boolean} Optional. True, when using eval instead of parseJSON.
             * @return {Array} JSON formatted array [{}, {}, {}, ...].
             * @public
             */
            toJsonObject: function(forceEval) {
                if (! this) {return [];}
                return ((522 > YAHOO.env.ua.webkit && 4000 < this.length) || forceEval) ? eval("(" + this + ")") : this.parseJSON();
            }
        };

        _YL.augmentObject(String.prototype, _thatIfJSON, true);
    }

    // YAHOO.lang extensions are included
    if (_YL.arrayWalk) {
        var _thatIfLangExtended = {

            /**
             * Capitolize the first letter of every word.
             * @method capitalize
             * @param ucfirst {Boolean} Optional. When truthy, converts non-first letters to lower case; default is undefined.
             * @param minLength {Number} Optional. When set, this is the minimum number of characters a word must be before transforming; default is undefined.
             * @return {String} The converted string.
             * @public
             */
            capitalize: function(ucfirst, minLength) {
                var i = 0,
                    rs = [];

                _YL.arrayWalk(this.split(/\s+/g), function(w) { // don't assume $A() is available
                    w = w.trim();

                    // this is not whitespace
                    if (w) {
                        // not applying a min length, or word is greater than min
                        if (! minLength || (minLength && w.length >= minLength)) {
                            rs[i] = w.charAt(0).toUpperCase() + (ucfirst? w.substring(1).toLowerCase(): w.substring(1));
                        }
                        // insert word directly
                        else {
                            rs[i] = w;
                        }

                        i += 1;
                    }
                });

                return rs.join(' ');
            }
        };

		_YL.augmentObject(String.prototype, _thatIfLangExtended, true);
    }

    // RegExp extensions are included
    if (RegExp.esc) {
        var _thatIfRegExp = {

            /**
             * Escape regex literals in 'this'.
             * @method escapeRx
             * @return {String} The escaped text.
             * @static
             */
            escapeRx: function() {
                return RegExp.esc(this);
            },

            /**
             * Retrieves value for the given key out of the url query string.
             *  ex: url=http://www.mattsnider.com?id=1234&type=special then, getQueryValue(url,"id") == "1234"
             * @method getQueryValue
             * @param key {String} Required. The key value you want to retrieve.
             * @return {String} The value of the key or empty string.
             * @static
             */
            getQueryValue: function(key) {
                var url = '&' !== this.charAt(0) ? '&' + this : this; // prevents malformed url problem
                //noinspection JSDeprecatedSymbols
                var regex = new RegExp('[\\?&]' + RegExp.esc('' + key) + '=([^&#]*)'),
                    results = regex.exec(url);
                return results ? results[1] : '';
            }
        };

		_YL.augmentObject(String.prototype, _thatIfRegExp, true);
    }
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.01
 */

/**
 * The Core object manages the MVC architecture of the pages and namespacing.
 * @module mvc
 * @class Core
 * @dependencies YAHOO.lang, YAHOO.util.event, YAHOO.util.dom, YAHOO.util.connection
 * @static
 */
(function() {
    // the log severity level constants, used to determine if a debug statmenet should be logged or not
    var _LOG_LEVEL = {
		ALL: 1, // developer environments
		DEBUG: 2,
		INFO: 3, // production environments should be set to 3 or higher
		WARN: 4,
		SEVERE: 5
    };

    // private namespace
	var _logLevel = _LOG_LEVEL.INFO,
        _WL = window.location;

    // static namespace
    window.Core = {

		/**
		 * The current project version #.
		 * @property Version
		 * @type String
		 * @static
		 * @final
		 */
		VERSION: '1.0',

        /**
         * The controller namespace.
         * @property Controller
         * @type Object
		 * @static
         */
        Controller: {},

        /**
         * Object namespace placeholder for attaching global constants; inner Function to create Client Singleton.
         * @property Constants
         * @type Object
		 * @static
         */
        Constants: {},

        /**
         * The model object namespace.
         * @property Model
         * @type Object
         */
        Model: {},

        /**
         * The utility namespaces.
         * @property Util
         * @type Object
		 * @static
         */
        Util: {},

        /**
         * The view object namespace.
         * @property View
         * @type Object
		 * @static
         */
        View: {},

		/**
		 * Returns the log level of the application.
		 * @method getLogLevel
		 * @return {Number} The current log level.
		 * @static
		 */
		getLogLevel: function() {return _logLevel;},

        /**
		 * Retrieves the hash from the location object; ensures is a string.
		 * @method getHash
		 * @return {String} The page hash.
		 * @static
		 */
        getHash: function() {
            return ('' + _WL.hash);
        },

        /**
		 * Retrieves the host from the location object; ensures is a string.
		 * @method getHost
		 * @return {String} The page host.
		 * @static
		 */
        getHost: function() {
            return ('' + _WL.host);
        },

        /**
		 * Retrieves the page name from the URL.
		 * @method getPageName
		 * @return {String} The page name.
		 * @static
		 */
		getPageName: function() {
			return Core.getUrl().replace(/.*\/(.*)(\.|\?|\/).*/, '$1');
		},

        /**
		 * Retrieves the port from the location object; ensures is a string.
		 * @method getPort
		 * @return {String} The page port.
		 * @static
		 */
        getPort: function() {
            return ('' + _WL.port);
        },

        /**
		 * Retrieves the protocol from the location object; ensures is a string.
		 * @method getProtocol
		 * @return {String} The page protocol.
		 * @static
		 */
        getProtocol: function() {
            return ('' + _WL.protocol);
        },

        /**
		 * Retrieves the search from the location object; ensures is a string.
		 * @method getSearch
		 * @return {String} The page query string.
		 * @static
		 */
        getSearch: function() {
            return ('' + _WL.search);
        },

		/**
		 * Retrieves the value of XSRF token from the DOM, or throws an exception when not found.
		 * @method getToken
		 * @return {String} The XSRF token.
		 * @static
		 */
		getToken: function() {
			var token = YAHOO.util.Form.Element.getValue('javascript-token');

			if (! token) {
				throw ('Token Node requested before DOM INPUT node "javascript-token" was made available.');
			}

			Core.getToken = function() {
				return token;
			};

			return Core.getToken();
		},

        /**
		 * Retrieves the URL from the location object; ensures is a string.
		 * @method getUrl
		 * @return {String} The page URL.
		 * @static
		 */
        getUrl: function() {
            return ('' + _WL.href);
        },

		/**
		 * Sets the log level of the application.
		 * @method setLogLevel
		 * @param lvl {Number} Required. The new log level.
		 * @static
		 */
		setLogLevel: function(lvl) {_logLevel = lvl;},

        /**
         * Refreshes the page by calling window.location.reload.
         * @method reload
         * @static
         */
        reload: function() {
            _WL.reload();
        },

        /**
         * Replaces the page by calling window.location.replace(DOMString URL); does not call create a browser history node.
         * @method replace
         * @param url {String} Optional. The URL.
         * @static
         */
        replace: function(url) {
            if (! url) {url = window.location.href;}
            _WL.replace('' + url);
        }
    };
})();/**
 * Copyright (c) 2009, Matt Snider, LLC All rights reserved.
 * Version: 1.0.00
 */

/**
 * The console pacakge extends the "mvc/core.js" package with additional console logging capabilities. This package
 *  first attempts to use the FireBug console logger, and then, when that is not available will open a new browser window
 *  and log there.
 * @class Core
 * @dependencies YAHOO.lang, YAHOO.util.dom, mvc/core.js
 * @static
 */
(function() {
    var _YD = YAHOO.util.Dom,
        _YL = YAHOO.lang;

    var _consoleBody,
        _consoleDoc,
        _consoleObject = {},
        _consoleWindow,
        _countTimerMap = {},
        _countNameMap = {},
        _nextLogType = null,
        _timeNameMap = {};

    var _HTML = '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title>Mint Console Logger</title><style type="text/css">p{margin:0; padding: 0.25em;}div.log{font-family: console, arial, san-serif; font-size: 12px; border: 1px solid #EEE;color: #333; margin: 0; padding: 0.25em;}span.label{color:#009; font-weight:bold; padding-right: 0.25em;}</style></head><body><div>&nbsp;</div></body></html>';

    /**
     * Prepends the time onto the message.
     * @method _prependTime
     * @param message {String} Required. The value to prepend.
     * @private
     */
    var _prependTime = function(message) {
        return ('@' + (new Date()).formatTime() + ': ') + message;
    };

    /**
     * Evaluates if the FireBug console object is available.
     * @method _hasConsole
     * @return {Boolean} The console exists.
     * @private
     */
    var _hasConsole = function() {
        return window.console && window.console.firebug;
    };

    /**
     * Create a new one and pointers to interal document.
     * @method _setWindow
     * @private
     */
    var _setWindow = function() {
        if (! _consoleWindow) {
            _consoleWindow = window.open("","_consoleWindow","width=500,height=300,scrollbars=1,resizable=1");
            _consoleDoc = _consoleWindow.window.document;
            _consoleDoc.open();
            _consoleDoc.write(_HTML);
            _consoleDoc.close();
        }

        if (! _consoleBody) {
            _consoleBody = _YD.getBodyElement(_consoleDoc);
        }

        return (_consoleWindow && _consoleBody && _consoleDoc);
    };

    /**
     * Inserts a log statement into the logging window.
     * @method _log
     * @param message {String} Required. The message.
     * @param objectX {Object} Optional. Objects to substitue in message.
     * @private
     */
    var _log = function(message, objectX) {
        var args = arguments;

        _YL.callLazy(function() {
            var p = _consoleBody.insertBefore(_consoleDoc.createElement('div'), _YD.getFirstChild(_consoleBody)),
                j = args.length;

            message = _prependTime(message);
            p.className = 'log';

            if (_nextLogType) {
                var color = '#333',
                    symbol = '';

                switch (_nextLogType) {
                    case 'error':
                        color = '#900';
                        symbol = '(X)';
                    break;

                    case 'info':
                        symbol = '(i)';
                    break;

                    case 'warn':
                        _YD.setStyle(p, 'backgroundColor', '#0FF');
                        symbol = '(!)';
                    break;

                    default: // do nothing
                }

                _YD.setStyle(p, 'color', color);

                if (symbol) {
                    message = '<strong>' + symbol + ' </strong>' + message;
                }

                _nextLogType = null;
            }

            for (var i = 1; i < j; i += 1) {
                var arg = args[i], rx;

                if (_YL.isString(arg)) {
                    rx = /\%s/;
                }
                else if (_YL.isNumber(arg)) {
                    if (parseInt(arg) === arg) {
                        rx = /\%d|\%i/;
                    }
                    else {
                        rx = /\%f/;
                    }
                }
                else {
                    rx = /\%o/;
                }

                message = message.replace(rx, arg);
            }

            _YD.replace(p, message);
        }, _setWindow);
    };

    /**
     * Fetches the console object for logging; emulates console in non-FF browsers.
     * @method getConsole
     * @return {Object} The console object.
     * @static
     */
    Core.getConsole = function() {
        if (_hasConsole()) {
            /*
                note: the FireBug implementation of string substitution patterns does not check type, it simply
                    finds the first instance of a substitution pattern and replaces it with the agument in that position.
                    this means that console.log('test - %d %s', 's1', 's2') will produce the message "test - s1 s2" not "test - %d s1"
             */

			_consoleObject = window.console;
        }
        else {

            _YL.augmentObject(_consoleObject, {

                /**
                 * Tests an expression, inserting an error message, when false.
                 * @method assert
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                assert: function(message, objectX, fileName, lineNumber) {
                    var args = arguments;

                    if (! args[0]) {
                        args[0] = 'assertion <span class="label">false</span>';
                        _consoleObject.error.apply(this, args);
                    }
                },

                /**
                 * Writes the number of times that the line of code where count was called was executed.
                 * @method count
                 * @param name {String} Required. The name of this event.
                 * @param fileName {String} Required. The JavaScript filename.
                 * @param lineNumber {Number} Required. The line number.
                 * @public
                 */
                count: function(name, fileName, lineNumber) {
                    if (! _countNameMap[name]) {_countNameMap[name] = 0;}
                    _countNameMap[name] += 1;

                    // attempt to emulate the count logic logging that fires after codeblock is done in FireBug
                    clearTimeout(_countTimerMap[name]);
                    _countTimerMap[name] = setTimeout(function() {
                        _consoleObject.debug.call(this, '%s %i', name, _countNameMap[name], fileName, lineNumber);
                    }, 1000);
                },

                /**
                 * Inserts a debug statement into the logging window with a line number.
                 * @method debug
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                debug: function(message, objectX, fileName, lineNumber) {
                    var args = arguments;
                    args[0] += '; %s (line %d)';
                    _log.apply(this, args);
                },

                /**
                 * Prints a listing of all properties of the object.
                 * @method dir
                 * @param o {Object} Required. The evaluation object.
                 * @public
                 */
                dir: function(o) {
                    var sb = [];

                    for (var k in o) {
                        var obj = o[k],
                            s = '<p><span class="label">' + k + '</span>';

                        if (_YL.isFunction(obj)) {
                            s += 'function()';
                        }
                        else if (_YL.isObject(obj)) {
                            s += 'Object';
                        }
                        else if (_YL.isArray(obj)) {
                            s += 'Array';
                        }
                        else if (_YL.isString(obj)) {
                            s += '"' + obj + '"';
                        }
                        else if (_YL.isNumber(obj)) {
                            s += obj;
                        }
                        else if (_YL.isUndefined(obj)) {
                            s += 'Undefined';
                        }
                        else if (_YL.isNull(obj)) {
                            s += 'Null';
                        }
                        else if (_YL.isDate(obj)) {
                            s += obj.formatTime();
                        }

                        s += '</p>';
                        sb.push(s);
                    }

                    // sorts the functions to the end, everything else alphabetically
                    sb.sort(function(a, b) {
                        var aIsFunction = -1 < a.indexOf('function()');
                        var bIsFunction = -1 < b.indexOf('function()');

                        if (aIsFunction && ! bIsFunction) {
                            return 1;
                        }
                        else if (bIsFunction && ! aIsFunction) {
                            return -1;
                        }
                        // sort alpha
                        else {
                            var rx = /.*?\"\>(.*)?\<\/span\>.*/,
                                nameA = a.replace(rx, '$1'),
                                temp = [nameA, b.replace(rx, '$1')];

                            temp.sort();
                            return nameA === temp[0] ? -1 : 1;
                        }
                    });

                    _log(sb.join(''));
                },

                /**
                 * Prints the XML source tree of an HTML or XML element.
                 * @method dirxml
                 * @param node {Element} Required. The evaluation element.
                 * @public
                 */
                dirxml: function(node) {
                    // todo: implement
                },

                /**
                 * Inserts an error statement into the logging window with a line number.
                 * @method error
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                error: function(message, objectX, fileName, lineNumber) {
                    _nextLogType = 'error';
                    _consoleObject.debug.apply(this, arguments);
                },

                /**
                 * Writes a message to the console and opens a nested block to indent all future messages sent to the console; filename and linenumber required.
                 * @method group
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                group: function(message, objectX, fileName, lineNumber) {
                    // todo: implement
                },

                /**
                 * Closes the most recently opened block created by a call to console.group.
                 * @method groupEnd
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                groupEnd: function(message, objectX, fileName, lineNumber) {
                    // todo: implement
                },

                /**
                 * Inserts an info statement into the logging window with a line number.
                 * @method info
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                info: function(message, objectX, fileName, lineNumber) {
                    _nextLogType = 'info';
                    _consoleObject.debug.apply(this, arguments);
                },

                /**
                 * Inserts a log statement into the logging window.
                 * @method log
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @public
                 */
                log: _log,

                /**
                 * Prevents the profile call from throwing an exception in non-FireBug enabled browsers.
                 * @method profile
                 * @public
                 */
                profile: function() {
                    _log('profile unimplemented');
                },

                /**
                 * Prevents the profileEnd call from throwing an exception in non-FireBug enabled browsers.
                 * @method profileEnd
                 * @public
                 */
                profileEnd: function() {
                    _log('profileEnd unimplemented');
                },

                /**
                 * Creates a new timer under the given name. Call console.timeEnd(name) with the same name to stop the timer and print the time elapsed.
                 * @method time
                 * @param name {String} Required. The name of this event.
                 * @public
                 */
                time: function(name) {
                    _timeNameMap['' + name] = new Date();
                },

                /**
                 * Stops a timer created by a call to console.time(name) and writes the time elapsed.
                 * @method timeEnd
                 * @param name {String} Required. The name of this event.
                 * @param fileName {String} Required. The JavaScript filename.
                 * @param lineNumber {Number} Required. The line number.
                 * @public
                 */
                timeEnd: function(name) {
                    if (_timeNameMap['' + name]) {
                        var args = arguments;
                        args[0] = name + ': ' + Date.diff(null, _timeNameMap['' + name], Date.MILLISECOND) + 'ms';
                        _consoleObject.debug.apply(this, args);
                    }
                },

                /**
                 * Prevents the trace call from throwing an exception in non-FireBug enabled browsers.
                 * @method trace
                 * @public
                 */
                trace: function() {
                    _log('Trace unimplemented');
                },

                /**
                 * Inserts a warn statement into the logging window with a line number.
                 * @method warn
                 * @param message {String} Required. The message.
                 * @param objectX {Object} Optional. Objects to substitue in message.
                 * @param fileName {String} Required. The JavaScript filename; the second to last parameter.
                 * @param lineNumber {Number} Required. The line number; the last parameter.
                 * @public
                 */
                warn: function() {
                    _nextLogType = 'warn';
                    _consoleObject.debug.apply(this, arguments);
                }
            });
        }

        Core.getConsole = function() {return _consoleObject;};
        return _consoleObject;
    };
})();/**
 * Copyright (c) 2009, Matt Snider, LLC. All rights reserved.
 * Version: 1.0.00
 */

/**
 * The EventDispatcher class dispatches events for an entire page, using .
 * @namespace Core.Util
 * @class EventDispatcher
 * @dependencies yahoo-dom-event.js
 * @static
 */
Core.Util.EventDispatcher = (function() {
    // local variables
    var _callbackMap = {},
        _DOC = document,
        _F = function() {},
        _rx = /\bcom_\w+\b/g,
        _that = null,
        _YE = YAHOO.util.Event;

    // event namespace
    var _E = {

        /**
         * The generic event dispatcher callback; passes these parameters into callback(event, targetNode, flattenedArguments...).
         * @method dispatcher
         * @param e {Event} Required. The triggered JavaScript event.
         * @private
         */
        dispatcher: function(e) {
            var node = _YE.getTarget(e);

            // simulate bubbling
            while (node && node !== _DOC) {
                var coms = node.className.match(_rx);

                // not matched
                if (null === coms) {
                    // not found, do nothing for now
                }
                // command class exists
                else {
                    var i = 0, j = 0;

                    // iterate on matching commands
                    for (; i < coms.length; i += 1) {
                        var id = coms[i].replace(/com_/, ''),
                            carr = _callbackMap[e.type][id];

                        // object for command exists, command could be for another event
                        if (carr && carr.length) {
                            // iterate on command callbacks
                            for (j = 0; j < carr.length; j += 1) {
                                var o = carr[j],
                                    args = [e, node];

                                if (o.eventFx) {o.eventFx.call(_YE, e);} // event stop events
                                o.callback.apply(o.scope, args.concat(o.arguments));
                            }
                        }
                    }
                }

                node = node.parentNode;
            }
        }
    };

   // public interface
    _F.prototype = {

        /**
         * Method to register an event on the document.
         * @method register
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        register: function(type, o) {
            // check for required
            if (! (type && o && o.id && o.callback)) {
                alert('Invalid regristration to EventDispatcher - missing required value, see source code.');
            }

            // allows for lazy-loading of events
            if (! _callbackMap[type]) {
                _callbackMap[type] = {};
                _YE.on(_DOC, type, _E.dispatcher);
            }

            if (! _callbackMap[type][o.id]) {_callbackMap[type][o.id] = [];}
            if (! o.scope) {o.scope = window;}
            if (! o.arguments) {o.arguments = [];}
            if (! YAHOO.lang.isArray(o.arguments)) {o.arguments = [o.arguments];} // support arguments _that are non arrays
            _callbackMap[type][o.id].push(o);
        },

        /**
         * Call this method to register an event the first time _that ID is provided, and not subsequent times.
         * @method registerOnce
         * @param type {String} Required. The event type (ie. 'click').
         * @param o {Object} Required. The event data.
         * @static
         */
        registerOnce: function(type, o) {
            if (! (_callbackMap[type] || _callbackMap[type][o.id])) {
                register(type, o);
            }
        }
    };

    _that = new _F();
    return _that;
})();