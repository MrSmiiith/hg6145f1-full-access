var gDebug = false; //调试模式默认关闭
document.write('<script  src="..\/js\/jquery.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/xhr.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/util_global_vars.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/util_functions.js?'+new Date().getTime()+'"><'+'/'+'script>');
//document.write('<script  src="..\/js\/jquery.nicescroll.min.js?'+new Date().getTime()+'"><'+'/'+'script>');
//document.write('<script  src="..\/js\/validate.js?'+new Date().getTime()+'"><'+'/'+'script>');
//document.write('<script  src="..\/js\/aes.js?'+new Date().getTime()+'"><'+'/'+'script>');

if ("object" != typeof JSON) {
	document.write('<script  src="..\/js\/json2.js?'+new Date().getTime()+'"><'+'/'+'script>');
}

document.write('<script  src="..\/js\/i18n.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/access.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/loadcss.js?'+new Date().getTime()+'"><'+'/'+'script>');
document.write('<script  src="..\/js\/alert.js?'+new Date().getTime()+'"><'+'/'+'script>');

/*优化web页面显示，等所有资源加载完再显示页面*/
/*document.onreadystatechange=function(){
	if(document.readyState == "complete"){
		document.body.style.display = "block"
	}else
	{
		document.body.style.display = "none"
	}
}*/

//页面灰显，进行点击操作时，暂停0.8s
function show_shadow() {
	pause();
	setTimeout("pause_back()", 800);
}

function pause() {
	$(window.parent.document).find("#loading_window_div").attr('style', 'display:true');
}

function pause_back() {
	$(window.parent.document).find("#loading_window_div").attr('style', 'display:none');
}

function dhcp_value_switch(dhcp_value)
{
	var dhcp_enable = 0;
	if ((dhcp_value & 8) != 0)
	{
		if ((dhcp_value & 4) != 0)
		{
			dhcp_enable = 1;
		}
		else
		{
			dhcp_enable = 0;
		}
	}
	else if ((dhcp_value & 2) != 0)
	{
		if ((dhcp_value & 1 )!= 0)
		{
			dhcp_enable = 1;
		}
		else
		{
			dhcp_enable = 0;
		}
	}
	else
	{
		dhcp_enable = 1;
	}
   return dhcp_enable;
}


