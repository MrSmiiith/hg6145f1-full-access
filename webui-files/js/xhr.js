/*
 * xhr.js - XMLHttpRequest helper class
 * (c) 2008-2010 Jo-Philipp Wich
 */
var ajaxcgi = "../cgi-bin/ajax";
var jsonheadstr = "Content-type: application/json";
XHR = function()
{
	this.reinit = function()
	{
		if (window.XMLHttpRequest) {
			this._xmlHttp = new XMLHttpRequest();
		}
		else if (window.ActiveXObject) {
			this._xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		else {
			alert("xhr.js: XMLHttpRequest is not supported by this browser!");
		}
	}

	this.busy = function() {
		if (!this._xmlHttp)
			return false;

		switch (this._xmlHttp.readyState)
		{
			case 1:
			case 2:
			case 3:
				return true;

			default:
				return false;
		}
	}

	this.abort = function() {
		if (this.busy())
			this._xmlHttp.abort();
	}

	this.get = function(ajaxmethod,data,callback)
	{
		this.reinit();

		var xhr  = this._xmlHttp;
		var code = this._encode_new(ajaxmethod, data);
		
		url = ajaxcgi;

		if (code)
			if (url.substr(url.length-1,1) == '&')
				url += code;
			else
				url += '?' + code;
			
		//url += '&token=' + navigator.userAgent;


		xhr.open('GET', url, false);

		/*xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
				var json = parseData(xhr);
				if ( callback != null )
				{
					callback(json);
				}
			}
		}*/
		xhr.send(null);
		
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			var json = parseData(xhr, "GET");
			if ( callback != null )
			{
				callback(json);
			}
		}
			
	}

	this.post = function(ajaxmethod,data,callback)
	{
		this.reinit();
		var that =this;
		(new XHR()).get("get_refresh_sessionid", null,  function(getdata){
			if ( getdata.sessionid != undefined )
				{
				   data.sessionid =  getdata.sessionid;
		       	   that.post2(ajaxmethod,data,callback);
				};
		});
	}

	this.post2 = function(ajaxmethod,data,callback)
	{
		var xhr  = this._xmlHttp;
		//var code = fhencrypt(this._encode_new(ajaxmethod, data));
		var code = this._encode_new(ajaxmethod, data);
		url = ajaxcgi;

		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
				var json = parseData(xhr, "POST");
				if ( callback != null )
				{
					callback(json);
				}
			}
		}

		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('Content-length', code.length);
		//xhr.setRequestHeader('Connection', 'close');
		//alert(code);
		xhr.send(code);
	}

	this.cancel = function()
	{
		this._xmlHttp.onreadystatechange = function(){};
		this._xmlHttp.abort();
	}

	this.send_form = function(form,callback,extra_values)
	{
		var code = '';

		for (var i = 0; i < form.elements.length; i++)
		{
			var e = form.elements[i];

			if (e.options)
			{
				code += (code ? '&' : '') +
					form.elements[i].name + '=' + encodeURIComponent(
						e.options[e.selectedIndex].value
					);
			}
			else if (e.length)
			{
				for (var j = 0; j < e.length; j++)
					if (e[j].name) {
						code += (code ? '&' : '') +
							e[j].name + '=' + encodeURIComponent(e[j].value);
					}
			}
			else
			{
				code += (code ? '&' : '') +
					e.name + '=' + encodeURIComponent(e.value);
			}
		}

		if (typeof extra_values == 'object')
			for (var key in extra_values)
				code += (code ? '&' : '') +
					key + '=' + encodeURIComponent(extra_values[key]);

		return(
			(form.method == 'get')
				? this.get(form.getAttribute('action'), code, callback)
				: this.post(form.getAttribute('action'), code, callback)
		);
	}

	this._encode = function(obj)
	{
		obj = obj ? obj : { };
		obj['_'] = Math.random();

		if (typeof obj == 'object')
		{
			var code = '';
			var self = this;

			for (var k in obj)
				code += (code ? '&' : '') +
					k + '=' + encodeURIComponent(obj[k]);

			return code;
		}

		return obj;
	}
	
	this._encode_new = function(ajaxmethod, obj)
	{
		if(typeof obj == 'object')
		{
			obj = obj ? obj : { };
			obj['ajaxmethod'] = ajaxmethod;
			obj['_'] = Math.random();
		}else if(typeof obj == 'string'){
			obj += "&ajaxmethod=" + ajaxmethod;
			obj += "&_=" + Math.random();
		}
		

		if (typeof obj == 'object')
		{
			var code = '';
			var self = this;

			for (var k in obj)
				code += (code ? '&' : '') +
					k + '=' + encodeURIComponent(obj[k]);

			return code;
		}

		return obj;
	}
}

XHR.get = function(url, data, callback)
{
	(new XHR()).get(url, data, callback);
}

XHR.post = function(url, data, callback)
{
	(new XHR()).post(url, data, callback);
}


XHR.poll = function(interval, url, data, callback)
{
	if (isNaN(interval) || interval < 1)
		interval = 5;

	if (!XHR._q)
	{
		XHR._t = 0;
		XHR._q = [ ];
		XHR._r = function() {
			for (var i = 0, e = XHR._q[0]; i < XHR._q.length; e = XHR._q[++i])
			{
				if (!(XHR._t % e.interval) && !e.xhr.busy())
					e.xhr.get(e.url, e.data, e.callback);
			}

			XHR._t++;
		};
	}

	XHR._q.push({
		interval: interval,
		callback: callback,
		url:      url,
		data:     data,
		xhr:      new XHR()
	});

	XHR.run();
}

XHR.halt = function()
{
	if (XHR._i)
	{
		/* show & set poll indicator */
		try {
			document.getElementById('xhr_poll_status').style.display = '';
			document.getElementById('xhr_poll_status_on').style.display = 'none';
			document.getElementById('xhr_poll_status_off').style.display = '';
		} catch(e) { }

		window.clearInterval(XHR._i);
		XHR._i = null;
	}
}

XHR.run = function()
{
	if (XHR._r && !XHR._i)
	{
		/* show & set poll indicator */
		try {
			document.getElementById('xhr_poll_status').style.display = '';
			document.getElementById('xhr_poll_status_on').style.display = '';
			document.getElementById('xhr_poll_status_off').style.display = 'none';
		} catch(e) { }

		/* kick first round manually to prevent one second lag when setting up
		 * the poll interval */
		XHR._r();
		XHR._i = window.setInterval(XHR._r, 1000);
	}
}

XHR.running = function()
{
	return !!(XHR._r && XHR._i);
}

function parseData(xhr, method)
{
	var json = null;
	var ResponseHeader = xhr.getResponseHeader("Content-type");
	if (ResponseHeader == "application/json" || ResponseHeader == "text/plain; charset=utf-8" || ResponseHeader == "text/plain")
	{
		try
		{
		
			json = eval('(' + xhr.responseText + ')');
		}
		catch(e)
		{
			json = null;
		}
	}
	else
	{
		var indexplace = xhr.responseText.indexOf(jsonheadstr);
		if ( indexplace >= 0 )
		{
			var tempstr = xhr.responseText.substring(indexplace + jsonheadstr.length, xhr.responseText.length);
			try
			{
				json = eval('(' + tempstr + ')');
			}
			catch(e)
			{
				json = null;
			}
		}
	}
	if ( json != null && json.session_valid != null && json.session_valid != undefined )
	{
		if ( json.session_valid == 0 ) //session invalid, jump to login page
		{
			console.log("session is valid!")

			/*session无效时，不弹窗提示，直接退出到登录页面 */
            // if(parent.gSessionFlag == "1"){
            //     return; 
            // }
			// else
            {
                var operator_name = sessionStorage.getItem("operator_name");
                if(operator_name == "BZ_TIM"){
                	alert("Time Out, Please Login again!");
                	window.parent.location = "../html/login_inter.html";
                }else if(operator_name == "PH_PLDT"){
                	alert("Time Out, Please Login again!");
                	window.parent.location = "../html/login_pldt.html";
                }else if(operator_name == "COL_ETB"){
                	alert("Time Out, Please Login again!");
                	window.parent.location = "../index.html";
                }else{
					window.parent.location = "../index.html";
				}
            }
			
		}

		//iframe子页面有get、post操作，也视为一次有效操作，更新上次操作时间。W
        if ( parent && parent.gLastOperateTime != undefined &&  method == "POST")
		{
			parent.gLastOperateTime = new Date().getTime();
		}
	}
	json = JSON.parse(JSON.stringify(json).replace(/_point_/g, "."));
	return json;
}
