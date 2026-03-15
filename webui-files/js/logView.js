var operator_name = gOperatorName;
var remote_servicesdata = "";
var wanIp = "";
$(document).ready(function() {
	//优化滚动条，无需改动
	// //customScrollBar("html");
	if (operator_name == "IDN_TELKOM") {
		XHR.get("get_remote_server_info", null, fillData);
		$("#remote_server_form").show();
		$("#log_prompt").html("On this page, you could view the logs and configure Remote Syslog Server functions.");
		XHR.get("get_allwan_info", null, getWanIP);
		initValidate();
		$("input[name='remote_enable']").bind("click", function() {
			var remote_enable = $("input[name='remote_enable']:checked").val();
			if (remote_enable == 0) {
				$("#add_port").css("display", "none");
			} else {
				$("#add_port").css("display", "");
			}
		});
	}

	if (operator_name == "ALGERIA_TELECOM" || operator_name == "CHL_ENTEL" || operator_name == "EG_TELECOM" || operator_name == "MY_TM") {
		$("#button_div").show();
	}

	showLog();
});

function getWanIP(getdata) {
	if (getdata != null && getdata.wan) {
		all_wan_info = getdata;
		wan_info = all_wan_info.wan;
		if (all_wan_info != '' && all_wan_info.wan) {
			wan_num = all_wan_info.wan.length;
		}

		if (wan_num > 0) {
			for (i = 0; i < wan_num; i++) {
				var single_wan = all_wan_info.wan[i];
				var wan_path = single_wan.WAN_url;
				if (single_wan.ServiceList.indexOf("VOIP") >= 0 && single_wan.Name.indexOf("_B_") == -1) {
					wanIp = single_wan.ExternalIPAddress;
				}

			}
		}

	}
}

function initValidate() {
	$("#remote_server_form").validate({
		debug: true,
		rules: {
			"remote_address": { required: true, nocn: true },
			"remote_port": { required: true, nocn: true }
		},
		errorPlacement: function(error, element) {
			error.insertAfter(element.parent().parent());
		},
		messages: {
		},
		submitHandler: function(form) {
			fiberlog("validate loid ok.....");
		},
		invalidHandler: function(form, validator) {
			fiberlog("validate loid failed.....");
			return false;
		}
	});
}

function parseDate(data) {
	loadLog(data);
}

function showLog() {
	var postdata = new Object();
	postdata.action = "showlog";
	XHR.post("logview", postdata, parseDate);
}

function downloadLog() {
	if (operator_name == "ALGERIA_TELECOM" || operator_name == "CHL_ENTEL" || operator_name == "EG_TELECOM" || operator_name == "MY_TM") {
		show_shadow();
		window.location = "../cgi-bin/download?web_log";
	}
}
function loadLog(data) {
	var dynamicHTML = "";
	/*var isEven; //是否是偶数行
	var tr069ip = "";
	
	//get tr069 wan ip
	XHR.get("get_allwan_info", null, function(getdata)
	{	
		if ( getdata && getdata.wan )
		{
			var wanAarry = getdata.wan;
			if ( wanAarry.length > 0 )
			{
				for (var i=0; i<wanAarry.length; i++ )
				{
					var singleWan = wanAarry[i];
					if ( singleWan.Name.toUpperCase().indexOf("TR069") >=0 )
					{
						if ( singleWan.IPMode == 1 || singleWan.IPMode == 3 ) //ipv4
						{
							if ( singleWan.ConnectionType == 'PPPoE_Bridged' )
							{
								tr069ip = "";
							}
							else
							{
								if ( singleWan.ConnectionStatus == 'Connected' || singleWan.AddressingType == 'Static' )
								{
									tr069ip = singleWan.ExternalIPAddress;
								}
							}
						}
						
						if ( singleWan.IPMode == 2 ) //ipv6
						{
							if ( singleWan.ConnectionType == 'PPPoE_Bridged' )
							{
								tr069ip = "";
							}
							else
							{
								if ( singleWan.IPv6ConnStatus == 'Connected' || singleWan.IPv6IPAddressOrigin == 'Static' )
								{
									tr069ip = singleWan.IPv6IPAddress;
								}
							}
						}
					}
				}
			}
		}
	});*/
	
	dynamicHTML += 'Manufacturer: ' + data.Manufacturer + '&#13;&#10;';
	dynamicHTML += 'ProductClass: ' + data.ProductClass + '&#13;&#10;';
	dynamicHTML += 'SerialNumber: ' + data.SerialNumber + '&#13;&#10;';
	dynamicHTML += 'ONU IP: ' + data.IP + '&#13;&#10;';
	dynamicHTML += 'HWVer: ' + data.HWVer + '&#13;&#10;';
	dynamicHTML += 'SWVer: ' + data.SWVer + '&#13;&#10;&#13;&#10;';

	for (var i = 1; i <= data.logcount; i++) {
		dynamicHTML += eval("data.log" + i) + '&#13;&#10;';
	}

	$("#logtable").html(dynamicHTML);
}

function fillData(data) {
	if (data && data.remote_services) {
		remote_servicesdata = data.remote_services;
		displayHtml();
	}
}


function displayHtml() {
	if (remote_servicesdata.remote_enable == "0") {
		$("#add_port").css("display", "none");
		$("input[name='remote_enable']:last").attr('checked', 'checked');
	} else {
		$("#add_port").css("display", "");
		$("input[name='remote_enable']:first").attr('checked', 'checked');
	}

	$("#remote_address").val(remote_servicesdata.remote_address);
	$("#remote_port").val(remote_servicesdata.remote_port);

}

function CancelBtn() {
	displayHtml();
}

function saveApply() {
	show_shadow();
	if (!$("#remote_server_form").valid()) {
		alert("invalid_data_alert".i18n());
		return;
	}
	if (operator_name == "IDN_TELKOM") {

		var postdata = new Object();
		postdata.remote_enable = $("input[name='remote_enable']:checked").val();
		postdata.remote_address = $("#remote_address").val();
		postdata.remote_port = $("#remote_port").val();
		postdata.remote_wan_ip = wanIp;
		XHR.post("set_remote_server_info", postdata, fillData);
	}
}

