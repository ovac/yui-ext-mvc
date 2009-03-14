(function(){var c={ALL:1,DEBUG:2,INFO:3,WARN:4,SEVERE:5};
var a=c.INFO,b=window.location;
window.Core={VERSION:"1.0",Controller:{},Constants:{},Model:{},Util:{},View:{},getLogLevel:function(){return a
},getHash:function(){return(""+b.hash)
},getHost:function(){return(""+b.host)
},getPageName:function(){return Core.getUrl().replace(/.*\/(.*)(\.|\?|\/).*/,"$1")
},getPort:function(){return(""+b.port)
},getProtocol:function(){return(""+b.protocol)
},getSearch:function(){return(""+b.search)
},getToken:function(){var d=YAHOO.util.Form.Element.getValue("javascript-token");
if(!d){throw ('Token Node requested before DOM INPUT node "javascript-token" was made available.')
}Core.getToken=function(){return d
};
return Core.getToken()
},getUrl:function(){return(""+b.href)
},setLogLevel:function(d){a=d
},reload:function(){b.reload()
},replace:function(d){if(!d){d=window.location.href
}b.replace(""+d)
}}
})();
(function(){var n=YAHOO.util.Dom,j=YAHOO.lang;
var c,m,a={},g,i={},o={},f=null,e={};
var d='<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title>Mint Console Logger</title><style type="text/css">p{margin:0; padding: 0.25em;}div.log{font-family: console, arial, san-serif; font-size: 12px; border: 1px solid #EEE;color: #333; margin: 0; padding: 0.25em;}span.label{color:#009; font-weight:bold; padding-right: 0.25em;}</style></head><body><div>&nbsp;</div></body></html>';
var l=function(p){return("@"+(new Date()).formatTime()+": ")+p
};
var b=function(){return window.console&&window.console.firebug
};
var h=function(){if(!g){g=window.open("","_consoleWindow","width=500,height=300,scrollbars=1,resizable=1");
m=g.window.document;
m.open();
m.write(d);
m.close()
}if(!c){c=n.getBodyElement(m)
}return(g&&c&&m)
};
var k=function(r,p){var q=arguments;
j.callLazy(function(){var y=c.insertBefore(m.createElement("div"),n.getFirstChild(c)),u=q.length;
r=l(r);
y.className="log";
if(f){var t="#333",w="";
switch(f){case"error":t="#900";
w="(X)";
break;
case"info":w="(i)";
break;
case"warn":n.setStyle(y,"backgroundColor","#0FF");
w="(!)";
break;
default:}n.setStyle(y,"color",t);
if(w){r="<strong>"+w+" </strong>"+r
}f=null
}for(var v=1;
v<u;
v+=1){var s=q[v],x;
if(j.isString(s)){x=/\%s/
}else{if(j.isNumber(s)){if(parseInt(s)===s){x=/\%d|\%i/
}else{x=/\%f/
}}else{x=/\%o/
}}r=r.replace(x,s)
}n.replace(y,r)
},h)
};
Core.getConsole=function(){if(b()){a=window.console
}else{j.augmentObject(a,{assert:function(s,q,t,p){var r=arguments;
if(!r[0]){r[0]='assertion <span class="label">false</span>';
a.error.apply(this,r)
}},count:function(q,r,p){if(!o[q]){o[q]=0
}o[q]+=1;
clearTimeout(i[q]);
i[q]=setTimeout(function(){a.debug.call(this,"%s %i",q,o[q],r,p)
},1000)
},debug:function(s,q,t,p){var r=arguments;
r[0]+="; %s (line %d)";
k.apply(this,r)
},dir:function(t){var u=[];
for(var p in t){var r=t[p],q='<p><span class="label">'+p+"</span>";
if(j.isFunction(r)){q+="function()"
}else{if(j.isObject(r)){q+="Object"
}else{if(j.isArray(r)){q+="Array"
}else{if(j.isString(r)){q+='"'+r+'"'
}else{if(j.isNumber(r)){q+=r
}else{if(j.isUndefined(r)){q+="Undefined"
}else{if(j.isNull(r)){q+="Null"
}else{if(j.isDate(r)){q+=r.formatTime()
}}}}}}}}q+="</p>";
u.push(q)
}u.sort(function(w,s){var A=-1<w.indexOf("function()");
var v=-1<s.indexOf("function()");
if(A&&!v){return 1
}else{if(v&&!A){return -1
}else{var z=/.*?\"\>(.*)?\<\/span\>.*/,y=w.replace(z,"$1"),x=[y,s.replace(z,"$1")];
x.sort();
return y===x[0]?-1:1
}}});
k(u.join(""))
},dirxml:function(p){},error:function(r,q,s,p){f="error";
a.debug.apply(this,arguments)
},group:function(r,q,s,p){},groupEnd:function(r,q,s,p){},info:function(r,q,s,p){f="info";
a.debug.apply(this,arguments)
},log:k,profile:function(){k("profile unimplemented")
},profileEnd:function(){k("profileEnd unimplemented")
},time:function(p){e[""+p]=new Date()
},timeEnd:function(q){if(e[""+q]){var p=arguments;
p[0]=q+": "+Date.diff(null,e[""+q],Date.MILLISECOND)+"ms";
a.debug.apply(this,p)
}},trace:function(){k("Trace unimplemented")
},warn:function(){f="warn";
a.debug.apply(this,arguments)
}})
}Core.getConsole=function(){return a
};
return a
}
})();
Core.Util.EventDispatcher=(function(){var a={},e=document,f=function(){},b=/\bcom_\w+\b/g,d=null,c=YAHOO.util.Event;
var g={dispatcher:function(q){var l=c.getTarget(q);
while(l&&l!==e){var m=l.className.match(b);
if(null===m){}else{var p=0,n=0;
for(;
p<m.length;
p+=1){var h=m[p].replace(/com_/,""),s=a[q.type][h];
if(s&&s.length){for(n=0;
n<s.length;
n+=1){var k=s[n],r=[q,l];
if(k.eventFx){k.eventFx.call(c,q)
}k.callback.apply(k.scope,r.concat(k.arguments))
}}}}l=l.parentNode
}}};
f.prototype={register:function(h,i){if(!(h&&i&&i.id&&i.callback)){alert("Invalid regristration to EventDispatcher - missing required value, see source code.")
}if(!a[h]){a[h]={};
c.on(e,h,g.dispatcher)
}if(!a[h][i.id]){a[h][i.id]=[]
}if(!i.scope){i.scope=window
}if(!i.arguments){i.arguments=[]
}if(!YAHOO.lang.isArray(i.arguments)){i.arguments=[i.arguments]
}a[h][i.id].push(i)
},registerOnce:function(h,i){if(!(a[h]||a[h][i.id])){register(h,i)
}}};
d=new f();
return d
})();