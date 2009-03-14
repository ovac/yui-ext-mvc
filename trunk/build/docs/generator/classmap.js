YAHOO.env.classMap = {"C.HTML.Number": "window", "YAHOO.util.Number": "datasource", "YAHOO.util.AnimMgr": "animation", "YAHOO.util.Form.Element.Serializers": "form", "YAHOO.util.EventProvider": "event", "YAHOO.util.XHRDataSource": "datasource", "YAHOO.util.KeyListener": "event", "YAHOO.util.CustomEvent": "event", "YAHOO.util.ScriptNodeDataSource": "datasource", "YAHOO.util.Event": "event", "YAHOO.util.Dom": "dom", "YAHOO.util.Easing": "animation", "C.HTML.RegExp": "window", "Core": "mvc", "YAHOO.util.Scroll": "animation", "YAHOO.util.Bezier": "animation", "YAHOO.util.Form": "form", "C.HTML": "window", "YAHOO.util.Subscriber": "event", "YAHOO.util.Connect": "connection", "YAHOO.util.Date": "datasource", "YAHOO.env": "yahoo", "YAHOO.util.Region": "dom", "YAHOO.util.Motion": "animation", "YAHOO.util.LocalDataSource": "datasource", "YAHOO.env.ua": "yahoo", "C": "window", "YAHOO.widget.AutoComplete": "autocomplete", "YAHOO.util.Form.Element": "form", "C.HTML.NAME": "window", "YAHOO.util.DataSourceBase": "datasource", "YAHOO.util.FunctionDataSource": "datasource", "YAHOO.util.DateLocale": "datasource", "YAHOO.util.Point": "dom", "YAHOO.lang": "yahoo", "YAHOO.util.DataSource": "datasource", "C.HTML.ID": "window", "Core.Util.EventDispatcher": "mvc", "YAHOO.util.ColorAnim": "animation", "YAHOO_config": "yahoo", "YAHOO": "yahoo", "YAHOO.util.Anim": "animation", "C.HTML.Date": "window", "Boolean": "window", "Array": "window", "C.HTML.CLS": "window"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
