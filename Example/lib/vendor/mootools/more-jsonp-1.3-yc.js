// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/0119174cc074dcb3c71d29e9b0ee39d9 
// Or build this file again with packager using: packager build More/Request.JSONP
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
Request.JSONP=new Class({Implements:[Chain,Events,Options],options:{onRequest:function(a){if(this.options.log&&window.console&&console.log){console.log("JSONP retrieving script with url:"+a);
}},onError:function(a){if(this.options.log&&window.console&&console.warn){console.warn("JSONP "+a+" will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs");
}},url:"",callbackKey:"callback",injectScript:document.head,data:"",link:"ignore",timeout:0,log:false},initialize:function(a){this.setOptions(a);},send:function(c){if(!Request.prototype.check.call(this,c)){return this;
}this.running=true;var d=typeOf(c);if(d=="string"||d=="element"){c={data:c};}c=Object.merge(this.options,c||{});var e=c.data;switch(typeOf(e)){case"element":e=document.id(e).toQueryString();
break;case"object":case"hash":e=Object.toQueryString(e);}var b=this.index=Request.JSONP.counter++;var f=c.url+(c.url.test("\\?")?"&":"?")+(c.callbackKey)+"=Request.JSONP.request_map.request_"+b+(e?"&"+e:"");
if(f.length>2083){this.fireEvent("error",f);}var a=this.getScript(f).inject(c.injectScript);this.fireEvent("request",[a.get("src"),a]);Request.JSONP.request_map["request_"+b]=function(){this.success(arguments,b);
}.bind(this);if(c.timeout){(function(){if(this.running){this.fireEvent("timeout",[a.get("src"),a]).fireEvent("failure").cancel();}}).delay(c.timeout,this);
}return this;},getScript:function(a){return this.script=new Element("script",{type:"text/javascript",src:a});},success:function(b,a){if(!this.running){return false;
}this.clear().fireEvent("complete",b).fireEvent("success",b).callChain();},cancel:function(){return this.running?this.clear().fireEvent("cancel"):this;
},isRunning:function(){return !!this.running;},clear:function(){if(this.script){this.script.destroy();}this.running=false;return this;}});Request.JSONP.counter=0;
Request.JSONP.request_map={};