var sessionidstr = "";
var wifidata = "";
var selectIdx = -1;
var operator_name = gOperatorName;
var userlevel = gLoginUser;
var multiap_enable;
var band_steering;
var model_name = gModelName;
var wifi_type = gWifi5Cap;
var password_length = 8;
var fttr_type = gFttr_type;
var multiAP = "";
var ssidstr = new Array();
var ssid = [];
var wifidataALL = []
var band_steering_enable;
var wps_enable_5g;
var current_time;
var duration;
var gSsidIndex = -1;
$(document).ready(function() {

	/*WIFI5 设备无WPA3、WPA2WPA3*/
	if (wifi_type == "0") {
		$("#WPA3").hide();
		$("#WPA2WPA3").hide();
	}
	initValidate();
	$("#common_password_tip").show();

	$("#BeaconType").bind("change", function() {
		var BeaconTypeval = $("#BeaconType").val();
		BeaconTypeShow(BeaconTypeval);
	});

	XHR.get("get_multiAP_enable", null, multiInfo);
	XHR.get("get_bandSteering_wlan", null, bandsteering_info);
	XHR.get("get_system_time", null, getCurrentTime);
	fillDuration();
	initPage();
	$("#ssid_choice").bind("change", function() {
		var sel = $(this).val();
		if ((sel == 0 || sel == 1 || sel == 2 || sel == 3) && ($("#BeaconType").val() == "WPA2/WPA3" || $("#BeaconType").val() == "WPA/WPA2" ||
			$("#BeaconType").val() == "WPA" || $("#BeaconType").val() == "11i"
			|| $("#BeaconType").val() == "WPA-Enterprise" || $("#BeaconType").val() == "WPA2-Enterprise" || $("#BeaconType").val() == "WPA-WPA2-Enterprise")) {
			$("#twoInput_div").hide();
		}

		fillCurrentSel(wifidataALL[sel])

	});

	$("#duration_day").bind("change", function() {
		if($(this).val()=="8"){
			$("#duration_hour").val("0")
			$("#duration_hour").attr("disabled", true); 
			$("#durationRemain_div").hide(); 
		}else{
			$("#duration_hour").attr("disabled", false); 
			$("#durationRemain_div").show(); 
		}
		
	});

	
	$("input[name='ssid_enable']").bind("click", function(){
		var ssid_enableleVal = $("input[name='ssid_enable']:checked").val();
		if(ssid_enableleVal == "0")
			$("#guest_div").hide(); 
		else
			$("#guest_div").show(); 
	});
	
	//if (operator_name == "COL_ETB") {
		$("#show_password").show();
	//}
	

});

function wpsInfo(g_wpsdata) {
	wps_enable_5g = g_wpsdata.Enable5g;
}

function bandsteering_info(data) {
	band_steering_enable = data.bandSteering.X_FH_BandSteeringEnable;
}

function BeaconTypeShow(BeaconTypeval) {

	if (BeaconTypeval == "Basic") {
		if (gNewUiFlag)
			$("#open_div").hide();
		else
			$("#open_div").show();
		$("#wpa_div").hide();
		$("#reAuthentication_div").hide();
		$("#wpa-enterprise_div").hide();
		if ($("#BasicEncryptionModes").val() == "WEPEncryption") {
			$("#wep_div").show();
		}
		else {
			$("#wep_div").hide();
		}
	}
	else if (BeaconTypeval == "Both" || BeaconTypeval == "SharedKey") {
		$("#open_div").hide();
		$("#wpa_div").hide();
		$("#wep_div").show();
		$("#reAuthentication_div").hide();
	} else if (BeaconTypeval == "WPA3" || BeaconTypeval == "WPA2/WPA3" || BeaconTypeval == "11i") {
		if (BeaconTypeval == "11i") {
			if (gNewUiFlag)
				$("#reAuthentication_div").hide();
			else
				$("#reAuthentication_div").show();
			$("#wpa3_div").show();
		} else {
			$("#reAuthentication_div").hide();
		}
		if (operator_name != "CHL_ENTEL" || operator_name != "COL_ETB") {
			if (gNewUiFlag)
				$("#WPA_Algorithms_text").html("AES");
			$("#Aesencryption").attr("checked", "checked");
		}
		$("#open_div").hide();
		$("#wep_div").hide();
		$("#wpa_div").show();
		$("#twoInput_div").hide();
		$("#wpa-enterprise_div").hide();

	} else if (BeaconTypeval == "WPA/WPA2") {
		if (operator_name != "CHL_ENTEL" || operator_name != "COL_ETB") {
			if (gNewUiFlag)
				$("#WPA_Algorithms_text").html("TKIPAES");

			$("#Tkipaesncryption").attr("checked", "checked");
		}
		$("#open_div").hide();
		$("#wep_div").hide();
		$("#wpa_div").show();
		$("#wpa3_div").show();
		$("#twoInput_div").hide();
		if (gNewUiFlag)
			$("#reAuthentication_div").hide();
		else
			$("#reAuthentication_div").show();
		$("#wpa-enterprise_div").hide();
	} else if (BeaconTypeval == "WPA-Enterprise" || BeaconTypeval == "WPA2-Enterprise" || BeaconTypeval == "WPA-WPA2-Enterprise")//wifi企业认证
	{
		if (BeaconTypeval == "WPA-Enterprise" || BeaconTypeval == "WPA2-Enterprise") {
			if (gNewUiFlag)
				$("#WPA_Algorithms_text").html("AES");
			$("#Aesencryption").attr("checked", "checked");
		} else {
			if (gNewUiFlag)
				$("#WPA_Algorithms_text").html("TKIPAES");
			$("#Tkipaesncryption").attr("checked", "checked");
		}


		$("#open_div").hide();
		$("#wpa_div").show();
		$("#wpa3_div").hide();
		$("#reAuthentication_div").hide();

		$("#wpa-enterprise_div").show();

	}
	else {

		$("#open_div").hide();
		$("#wep_div").hide();
		$("#wpa_div").show();
		$("#twoInput_div").hide();
		$("#reAuthentication_div").hide();
		$("#wpa-enterprise_div").hide();
	}
}
function multiInfo(data) {
	multiAP = data.multiAP_enable.Enable;
}

function change_eye() {
	$("#PreSharedKey").toggleClass("fh-text-security");
}

function initPage() {
	wifidataALL = []
	if (gDebug) {
		getDataByAjax("../fake/wlanAdvanced", fillData);
	} else {
		XHR.get("get_wifi_status", null, fillData2G);
		XHR.get("get_wifi_status_5G", null, fillData5G);
	}

	if (gSsidIndex == -1)
		fillCurrentSel(wifidataALL[0])
	else
		fillCurrentSel(wifidataALL[gSsidIndex])
}



function initValidate() {
	$("#wlanAdv_settings_form").validate({
		debug: true,
		rules: {
			"PreSharedKey": { required: true, minlength: password_length, maxlength: 63, nocn: true },
			"SSID": { required: true, minlength: 1, maxlength: 32, nocn: true },
			"reAuthentication": { required: true, range_int: [0, 86400], nocn: true },
			"ip_address": { required: true, ipv4: true},
			"port": { required: true, range_int: [1, 65535] },
			"shared_secret": { required: true, minlength: 1, maxlength: 64, nocn: true }
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
			error.insertAfter(element.parent().parent());
		},
		messages: {
		},
		submitHandler: function(form) {//校验成功回调
			fiberlog("validate mac filter ok.....");
		},
		invalidHandler: function(form, validator) {  //校验失败回调
			fiberlog("validate mac filter failed.....");
			return false;
		}
	});
}
function fillData2G(data) {
	if (data && data.wifi_status) {
		if(operator_name == "COL_ETB")
			wifidataALL.push(data.wifi_status[1])
		else
			wifidataALL.push(data.wifi_status[2])
	}
}

function fillData5G(data) {
	if (data && data.wifi_status5g) {
		if(operator_name == "COL_ETB")
			wifidataALL.push(data.wifi_status5g[1])
		else
			wifidataALL.push(data.wifi_status5g[2])
	}
}

function fillData(data) {
	if (data && gSsidIndex == 0) {
		if(operator_name == "COL_ETB")
			fillCurrentSel(data.wifi_status[1])
		else
			fillCurrentSel(data.wifi_status[2])
	} else if (data && gSsidIndex == 1) {
		if(operator_name == "COL_ETB")
			fillCurrentSel(data.wifi_status5g[1])
		else
			fillCurrentSel(data.wifi_status5g[2])
	}
}
function fillCurrentSel(data) {
	if (data.Enable == "0") {
		$("input[name='ssid_enable']:last").attr('checked', 'checked');
		$("#guest_div").hide(); 
	} else {
		$("input[name='ssid_enable']:first").attr('checked', 'checked');
		$("#guest_div").show(); 
	}
	$("#SSID").val(fhdecrypt(data.SSID));
	if (data.X_FH_SSIDHide == "1") {
		if (gNewUiFlag)
			$("input[name='ssid_hide']:last").attr('checked', 'checked');
		else
			setCheckbox("X_FH_SSIDHide", "0");
	} else {
		if (gNewUiFlag)
			$("input[name='ssid_hide']:first").attr('checked', 'checked');
		else
			setCheckbox("X_FH_SSIDHide", "1");
	}

	if (data.isolation_enable == "0") {
		$("input[name='ssid_isolation']:last").attr('checked', 'checked');
	} else {
		$("input[name='ssid_isolation']:first").attr('checked', 'checked');
	}

	if (data.WMMEnable == "1") {
		setCheckbox("wmm_enable", "1");
	} else {
		setCheckbox("wmm_enable", "0");
	}

	var BeaconTypeval = data.BeaconType;

	if (BeaconTypeval == "WPA2/WPA3" || BeaconTypeval == "WPA/WPA2" ||
		BeaconTypeval == "WPA" || BeaconTypeval == "11i") {
		$("#twoInput_div").hide();
	}

	if (BeaconTypeval == "Basic") {
		if (data.BasicAuthenticationMode == "SharedKey") {
			BeaconTypeval = "SharedKey";
		}

		if (data.BasicAuthenticationMode == "Both") {
			BeaconTypeval = "Both";
		}
	}


	if (BeaconTypeval == "None") {
		$("#BeaconType").val("Basic");
		BeaconTypeval = "Basic";
	} else {
		$("#BeaconType").val(BeaconTypeval);
	}

	BeaconTypeShow(BeaconTypeval);


	$("#NodeEncryption").click(function() {
		$("#wpa3_div").hide();
	});

	$("#Tkipncryption, #Aesencryption, #Tkipaesncryption, #Saencryption").click(function() {
		$("#wpa3_div").show();
	});

	if (data.BasicEncryptionModes != "") {
		$("#BasicEncryptionModes").val(data.BasicEncryptionModes);
	}


	if (data.WPAEncryptionModes == "TKIPandAESEncryption") {
		$("input[name='WPAEncryptionModes']:eq(1)").attr('checked', 'checked');
	}
	else {
		$("input[name='WPAEncryptionModes']:eq(0)").attr('checked', 'checked');
	}
	if (gNewUiFlag) {
		if (data.WPAEncryptionModes == "TKIPEncryption")
			$("#WPA_Algorithms_text").html("TKIPAES")
		else if (data.WPAEncryptionModes == "TKIPandAESEncryption")
			$("#WPA_Algorithms_text").html("TKIPAES")
		else
			$("#WPA_Algorithms_text").html("AES")
	}
	$("#twoInput_div").hide();//20200113 王洪磊 隐藏 WPA Algorithms中的 SAE 和 None
	temp_b64 = fhdecrypt(data.PreSharedKey);
	$("#PreSharedKey").val(temp_b64);
	$("#reAuthentication").val(data.X_FH_WPARekeyInterval);
	$("#ip_address").val(data.ServiceIP);
	$("#port").val(data.Port);
	$("#shared_secret").val(fhdecrypt(data.Key));
	duration = data.duration;
	guestwifi_time = data.guestwifi_time;
	if (duration == "0") {
		$("#duration_day").val("8");
		$("#duration_hour").val("0");
		$("#durationRemain_div").hide();
		$("#duration_hour").attr("disabled", true);
	} else {
		$("#durationRemain_div").show();
		$("#duration_hour").attr("disabled", false);
		day = parseInt(duration / 1440);
		hour = parseInt(duration % 1440 / 60);
		$("#duration_day").val(day);
		$("#duration_hour").val(hour);
	}
	showDuration(guestwifi_time);
}

function showDuration(guestwifi_time) {

	var remain_day = 0;
	var remain_hour = 0;
	var remain_minute = 0;
	var remain_second = 0;
	var remain_time = getSeconds(guestwifi_time) - getSeconds(current_time) + duration * 60;
	if (remain_time != "" && remain_time > 0) {
		remain_time--;
		remain_day = parseInt(remain_time / 86400);
		remain_hour = parseInt(remain_time % 86400 / 3600);
		remain_minute = parseInt(remain_time % 86400 % 3600 / 60);
		remain_second = parseInt(remain_time % 86400 % 3600 % 60);
		$("#durationRemain").html(remain_day + "&nbsp;"+"Days".i18n()+"&nbsp;" + remain_hour + "&nbsp;"+"Hours".i18n()+"&nbsp;" + remain_minute + "&nbsp;"+"Minutes".i18n()+"&nbsp;" + remain_second + "&nbsp;"+"Seconds".i18n());

	} else {
		$("#durationRemain").html(remain_day + "&nbsp;"+"Days".i18n()+"&nbsp;" + remain_hour + "&nbsp;"+"Hours".i18n()+"&nbsp;" + remain_minute + "&nbsp;"+"Minutes".i18n()+"&nbsp;" + remain_second + "&nbsp;"+"Seconds".i18n());
	}

}
function getCurrentTime(data) {
	current_time = data.systemTime;
	return current_time;
}


function getSeconds(value) {
	var newstr = value.replace(/-/g, '/');
	var data = new Date(newstr);
	var time_str = (parseInt(data.getTime()) / 1000).toString();
	return time_str;
}

function checkHex(str) {
	var len = str.length;

	for (var i = 0; i < str.length; i++) {
		if ((str.charAt(i) >= '0' && str.charAt(i) <= '9') ||
			(str.charAt(i) >= 'a' && str.charAt(i) <= 'f') ||
			(str.charAt(i) >= 'A' && str.charAt(i) <= 'F')) {
			continue;
		} else
			return false;
	}
	return true;
}

function checkInjection(str) {
	var len = str.length;
	for (var i = 0; i < str.length; i++) {
		if (str.charAt(i) == '\r' || str.charAt(i) == '\n') {
			return false;
		} else
			continue;
	}
	return true;
}

function fillDuration() {
	var durationDaySelectOption;
	var durationHourSelectOption;
	for (var i = 0; i <= 7; i++) {
		durationDaySelectOption += '<option value="' + i + '">' + i + '</option>';
	}
	durationDaySelectOption += '<option value="8">'+"No Limited".i18n()+'</option>'
	for (var j = 0; j < 24; j++) {
		durationHourSelectOption += '<option value="' + j + '">' + j + '</option>';
	}
	$("#duration_day").html(durationDaySelectOption);
	$("#duration_hour").html(durationHourSelectOption);


}

function saveApply() {
	show_shadow();
	if (!$("#wlanAdv_settings_form").valid()) {
		if (gNewUiFlag)
			myAlert('Tip',"invalid_value_alert".i18n())
		else
			alert("invalid_value_alert".i18n());
		return;
	}
	var postdata = new Object();
	gSsidIndex = Number($("#ssid_choice").val())
	selectIdx = $("#ssid_choice").val();
	var ssidindex
	if (selectIdx == "0")
		ssidindex = "3"
	else if (selectIdx == "1" && gWifi5GIndex == 5)
		ssidindex = "7"
	else if (selectIdx == "1" && gWifi5GIndex == 9)
		ssidindex = "11"

	if(operator_name == "COL_ETB"){
		if(ssidindex =="3")
			ssidindex = "2"
		else if(ssidindex =="7")
			ssidindex = "6"
		else if(ssidindex =="11")
			ssidindex = "10"
	}
	postdata.wifiIndex = ssidindex;
	postdata.Enable = $("input[name='ssid_enable']:checked").val();
	postdata.isolation_enable = $("input[name='ssid_enable']:checked").val();
	if(postdata.Enable == "1"){
		postdata.SSID = fhencrypt($("#SSID").val());
		postdata.X_FH_SSIDHide = $("#X_FH_SSIDHide").prop("checked") ? 0 : 1;
		
		var BeaconType = $("#BeaconType").val();
	
		if (BeaconType == "Basic") {
			postdata.BeaconType = "None";
			postdata.BasicAuthenticationMode = "OpenSystem";
			var BasicEncryptionModes = $("#BasicEncryptionModes").val();
			postdata.BasicEncryptionModes = BasicEncryptionModes;
	
		} else if (BeaconType == "WPA-Enterprise" || BeaconType == "WPA2-Enterprise" || BeaconType == "WPA-WPA2-Enterprise") {
			postdata.BeaconType = BeaconType;
			postdata.WPAEncryptionModes = $("input[name='WPAEncryptionModes']:checked").val();
			postdata.ip_address = $("#ip_address").val();
			postdata.port = $("#port").val();
			postdata.shared_secret = fhencrypt($("#shared_secret").val());
		}
		else {
			postdata.BeaconType = BeaconType;
			postdata.WPAEncryptionModes = $("input[name='WPAEncryptionModes']:checked").val();
			var temp_b64 = fhencrypt($("#PreSharedKey").val());
			postdata.PreSharedKey = temp_b64;
	
			if (BeaconType == "11i" || BeaconType == "WPA/WPA2") {
				postdata.X_FH_WPARekeyInterval = $("#reAuthentication").val();
			}
		}
	
		if ($("#duration_day").val() == "8") {
			postdata.duration = 0;
		} else {
			day = $("#duration_day").val();
			hour = $("#duration_hour").val();
			duration = day * 24 * 60 + hour * 60;
			postdata.duration = duration;
			alert(duration);
		}
	}
	XHR.post("setWlanGuestCfg", postdata, fillData);
}

