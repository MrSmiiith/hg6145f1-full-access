var sessionidstr = "";
var all_wan_info = '';
var selectwan = '';
var login_user = '';
var operator_name = gOperatorName;
var splitchar = '_';
var connect_flag;
var bindListLanHead = "dev.eth.";
var bindListWifiHead = "dev.wla.";
var select_wan_info = '';
var selectwantype;
var main_wifi_index_5g = gWifi5GIndex;
var IPoEPPPoEArr = [];
var IPoEPPPoEArrIndex = 0;
var v4V6ModeAarry = new Array('1', '2', '3');
var gNew_Wan_Flag = true;
var ipv4ModeHTML = "<option value='1'>IPv4</option>";
var ipv6ModeHTML = "<option value='2'>IPv6</option>";
var ipv4AndIPv6ModeHTML = "<option value='1'>IPv4</option><option value='2'>IPv6</option><option value='3'>IPv4&IPv6</option>";

var lan1_bound = 0;//not bound
var lan2_bound = 0;
var lan3_bound = 0;
var lan4_bound = 0;
var lan_port_mode_enable = 0;
var serviceModesArray = new Array('TR069', 'VOIP', 'INTERNET', 'OTHER', "SPECIAL_SERVICE_1", "SPECIAL_SERVICE_2", "SPECIAL_SERVICE_3", "SPECIAL_SERVICE_4"); //1 2 4 8 16 32 64 128
var service_modes_new_array = new Array('TR069', 'VOIP', 'TR069,VOIP', 'INTERNET', "TR069,INTERNET", "VOIP,INTERNET", "TR069,VOIP,INTERNET", "MULTICAST", "IPTV", "OTHER");



//var serviceModesArray = new Array('TR069', 'VOIP', 'INTERNET', 'OTHER'); //1 2 4 8
if (operator_name == "TH_3BB") {
	service_modes_new_array = new Array('INTERNET', 'TR069,INTERNET', 'VOIP', "UNICAST_IPTV", "MULTICAST_IPTV", "OTHER");
	var service_bridge_array = new Array('INTERNET', 'VOIP', "UNICAST_IPTV", "MULTICAST_IPTV", "OTHER");
}


var connectModeAarry = new Array('route', 'bridge');
//IPoE和PPPoE下的ipv4 address的值无重叠部分，所以不加
var addressTypeArray = new Array('DHCP', 'Static', 'PPPoE');
var ipv6AddressArray = new Array('AutoConfigured', 'DHCPv6', 'Static', 'None');
var ipv6PrefixTypeArray = new Array('PrefixDelegation');

var portbind_num;
var lanportbind_num;
var wifiportbind_num;

var wifi_enable;
var wifi_5g_enable;
var addflag = "edit";
var lan_port_10g_num;
var lan_port_num;

var tr69_wan_modify_enable = 1; //default 
var pppoe_required = true;
var uplink_type;
var garea_code = gArea_code;
var ppp_password_encode;
$(document).ready(function() {
	//优化滚动条，无需改动
	//customScrollBar("html");
	var natHtml = "<option selected='selected' value='1'>"+"Enable".i18n()+"</option><option value='0'>"+"Disable".i18n()+"</option>";
	var nat_ecu_cntHtml = "<option  value='0'>Disable</option><option value='1'>Full Cone</option><option value='3'>Port-restricted Cone</option>"
	if(operator_name == "FTTR_MAIN_SFU_COMMON"){
		$("#vlanIdTip").html("(0-4094)");
	}
	if (operator_name == "SFU_COMMON") {
		pppoe_required = false;
	} else {
		pppoe_required = true;
	}
	if (operator_name == "EG_TELECOM") {
		$("#ed_username").show();
	}else if(operator_name == "ALGERIA_TELECOM"){
		$("#alias_td").show();
		$("#show_password").show();
	}
    customSwitchInit();
    //if(operator_name != "MY_TM" && operator_name != "COL_ETB"){
    //    setInterval(function(){
    //    	if($("#POED").length > 0){
    //    		if(!$("#POED").hasClass("fh-text-security")){
    //    			$("#POED").addClass("fh-text-security");
    //    		}
    //    	}else{
    //    		window.location.reload();
    //    	}
    //    }, 10);
    //}
     if(operator_name == "MY_TM"){
         $("#switch").show();
        $("#WlanEnable_container").bind("click", function() {
                if ($("#WlanEnable_container").hasClass("switch_content_on")) {
                    $("#IPv4_Address_PPPOEStatic_Settings").show();
                    $("#IPv4_Address_Static_Settings").hide();
                } else {
                    $("#IPv4_Address_PPPOEStatic_Settings").hide();
                    $("#IPv4_Address_Static_Settings").show();
                }
        });
    }

	if (operator_name == "TH_AIS" || operator_name == "MY_TM") {
	   	$("#SSID_checkbox5").html("SSID5".i18n());
	   	$("#SSID_checkbox6").html("SSID6".i18n());
	   	$("#SSID_checkbox7").html("SSID7".i18n());
	   	$("#SSID_checkbox8").html("SSID8".i18n());
		initValidate_th_ais();
		$("#vlan_cfg").show();
		if(operator_name != "MY_TM")
		{
		$("#WanVlan_Enable").bind("change", function() {

			if ($("#WanVlan_Enable").prop("checked")) {
				$("#VLAN_Setting").show();
				$("#WanVlanID_text").val('');
			} else {
				$("#VLAN_Setting").hide();
			}
		});
		}else{
			$("#WanVlan_Enable").bind("change", function() {
				if ($("#WanVlan_Enable").prop("checked")) {
					$("#WanVlanID_text").attr("disabled", false);
				} else {
					$("#WanVlanID_text").attr("disabled", true);
				}
			});
		}

	} else {
		initValidate();
		if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO" )
		{
			vlan_enable_switch();
			if (gPon_mode == 0)//EPON
			{
				$("#WanVlan_Enable").attr("disabled", false);
				$("#vlan_cfg").show();
			}
			else//GPON
			{
				$("#vlan_cfg").hide();
				$("#WanVlan_Enable").attr("disabled", true);
				$("#WanVlan_Enable").prop("checked", true);
			}
			$("#WanVlan_Enable").bind("change", function() {
			if ($("#WanVlan_Enable").prop("checked")) {

					$("#VLAN_Setting").show();

				} else {
					$("#VLAN_Setting").hide();
				}
			});
		}else if(gDevice_type != 1){
			$("#vlan_cfg").show();
			$("#WanVlan_Enable").bind("change", function() {
				if ($("#WanVlan_Enable").prop("checked")) {
					$("#VLAN_Setting").show();
					$("#WanVlanID_text").val('');
				} else {
					$("#VLAN_Setting").hide();
				}
			});
		}
	}


	/*XHR.get("get_factory_mode", null, function(getdata) {
		if (getdata.sessionid != undefined) {
			sessionidstr = getdata.sessionid;
		}
	});*/

	$("#WanConnectName_select").bind("change", function() {
		selectWanChange();
	});

	$("#WanAddress_select").bind("change", function() {
		initIPorPPPInnerHTML();
		//initMTU();
		//initServiceList();
	});

	$("#WanConnectMode_select").bind("change", function() {// route 、bridge
		var serviceList_temp = $("#WanServiceList_select").val();//表示目前的service_list
		var connectionType_temp = $("#WanConnectMode_select").val();//表示即将要切换到的方向
		if (operator_name == "BZ_INTELBRAS" ||  operator_name == "BZ_VERO" )
		{
			vlan_enable_switch();
		}
		initServiceList();
		if (connectionType_temp == 'bridge' && serviceList_temp.indexOf(service_bridge_array) == -1) {
			$("#WanServiceList_select").val('INTERNET');
		}
		else {
			$("#WanServiceList_select").val(serviceList_temp);
		}

		//change_service_list(serviceList_temp,connectionType_temp);
	});

	$("#WanServiceList_select").bind("change", function() { //tr069 、 internet VOIP
		if (operator_name == "ECU_CNT" && login_user == "1") {
			if (select_wan_info.ServiceList.indexOf("TR069") >= 0) {
				if ($("#WanServiceList_select").val().indexOf("TR069") < 0) {
					alert("tr069_wan_alert".i18n());
					$("#WanServiceList_select").val(select_wan_info.ServiceList);
				}
			}
		}
		if (operator_name == "BZ_INTELBRAS"  ||  operator_name == "BZ_VERO" )
		{
			vlan_enable_switch();
		}
		secServiceList();
	});

	$("select").bind("change", function() {//下拉框绑定选择
		checkShowHideElement();
	});

	$("input:checkbox").bind("click", function() {//复选框绑定选择
		checkShowHideElement();
	});

	//隐藏错误提示
	$(".main_item_error_hint").each(function(i) {
		$(this).hide();
	});

	//Construct  Wifi Port Html
	if (gDebug) {
		getDataByAjax("../fake/vlanbind", constructWifiPortHtml);
	}
	else {
		//XHR.get("vlanbind", null, constructWifiPortHtml);
		constructWifiPortHtml();
	}

	portbind_num = $("input[name='portbind']").length;
	lanportbind_num = $(".lanport").length;
	wifiportbind_num = $(".wifiport").length;

	//泰国TRUE，普通用户登录时该页面所有下拉框、输入框不可编辑
	login_user = gLoginUser;



	//阿根廷定制化需求：增加wanEnable复选框 +墨西哥TP版本和泰国AIS版本
	if (operator_name == "ARG_CLARO" || operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP" || operator_name == "TH_AIS" ||  operator_name == "MY_TM"
	|| operator_name == "COL_ETB") {
		$("#wanEnable").show();
	}
	if( operator_name == "COL_ETB"){
		$("#wanNameDiv").show();
	}
	
	
	//厄瓜多尔、巴勒斯坦定制化需求：增加DNS Override功能  
	if (operator_name == "ALGERIA_TELECOM" || operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") {

		//非static 显示dns override
		$("#wan_connect_mode_select").bind("change", function() {
			if (($("#wan_connect_mode_select").val() != "Static") && ($("#WanIP_Mode_select").val() != "2")) {
				$("#wan_dns_override").show();
			} else {
				$("#wan_dns_override").hide();
			}
		});

		$("#wan_dnsoverride_select").bind("change", function() {
			if ($("#wan_dnsoverride_select").val() == "1") {
				$("#WanPri_DNS_text").removeAttr("disabled");
				$("#WanSec_DNS_text").removeAttr("disabled");
			} else {
				$("#WanPri_DNS_text").attr("disabled", "disabled");
				$("#WanSec_DNS_text").attr("disabled", "disabled");
			}
		});

	}
	$("#wan_connect_mode_select").bind("change", function() {
		clearIpv4StaticIpInfo();
	});
	if (operator_name == "ECU_CNT") {
		$("#nat_select").html(nat_ecu_cntHtml);
	} else {
		$("#nat_select").html(natHtml);
	}

	//墨西哥TP版本定制化需求：5G频段的SSID索引改为5,6,7,8
	if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP") {
		$("#Wan_SSID_checkbox5").next("span").html("SSID5");
		$("#Wan_SSID_checkbox6").next("span").html("SSID6");
		$("#Wan_SSID_checkbox7").next("span").html("SSID7");
		$("#Wan_SSID_checkbox8").next("span").html("SSID8");
	}

	if (gDebug) //调试模式读取本地数据
	{
		getDataByAjax("../fake/wan_info", initPage);
	}
	else {
		//XHR.get("get_ssiddisplay_info", null, ssiddisplayInfo);
		if (operator_name == "ARG_CLARO" || operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP" || operator_name == "TH_AIS" ||operator_name == "MY_TM" || operator_name == "COL_ETB" ) {
			XHR.get("get_allwan_info_broadBand", null, initPage);
		} else {
			XHR.get("get_allwan_info", null, initPage);
		}

	}
	if (operator_name == "CHL_ENTEL" || operator_name == "MEX_TP" || operator_name == "ECU_CNT" || operator_name == "BZ_INTELBRAS") {
		XHR.get("get_lanmode_info", null, disableLAN);
	}

	if (operator_name == "MY_TM") {
		XHR.get("get_uplink_info", null, function(getdata) {
			if (getdata != null && getdata) {
				uplink_type = getdata.uplink_info.uplink_type;
			}
		});
		disable_lan(uplink_type);
	}

	if (operator_name == "IDN_TELKOM") {
		$("#WanConnectName_select").attr("disabled", "true");
		$("#WanServiceList_select").attr("disabled", "true");
		$("#WanEnable_checkbox").attr("disabled", "true");
		$("#WanConnectMode_select").attr("disabled", "true");
		$("#WanAddress_select").attr("disabled", "true");
		$("#WanVlanID_text").attr("disabled", "true");
		$("#Wan_802_1_P_select").attr("disabled", "true");
		$("#nat_select").attr("disabled", "true");
		$("#WanMTU_text").attr("disabled", "true");
		$("#WanProxyEnable_text").attr("disabled", "true");
		$("#WanMAXUser_text").attr("disabled", "true");
		$("#BROADBUND_ppptobridge").attr("disabled", "true");
		$("#Wan_Port_checkbox1").attr("disabled", "true");
		$("#Wan_Port_checkbox2").attr("disabled", "true");
		$("#Wan_Port_checkbox3").attr("disabled", "true");
		$("#Wan_Port_checkbox4").attr("disabled", "true");
		$("#Wan_Port_checkbox5").attr("disabled", "true");
		$("#Wan_SSID_checkbox1").attr("disabled", "true");
		$("#Wan_SSID_checkbox2").attr("disabled", "true");
		$("#Wan_SSID_checkbox3").attr("disabled", true);
		$("#Wan_SSID_checkbox4").attr("disabled", true);
		$("#Wan_SSID_checkbox5").attr("disabled", true);
		$("#Wan_SSID_checkbox6").attr("disabled", true);
		$("#Wan_SSID_checkbox7").attr("disabled", true);
		$("#Wan_SSID_checkbox8").attr("disabled", true);
		$("#wan_connect_mode_select").attr("disabled", true);
		$("#rapid_commit_select").attr("disabled", true);
		$("#WanUserName_text").attr("disabled", true);
		$("#POED").attr("disabled", true);
		$("#PPPoeServiceName_text").attr("disabled", true);
		$("#dialMode_select").attr("disabled", true);
		$("#connect_button").attr("disabled", true);
		$("#disconnect_button").attr("disabled", true);
		$("#idleDisconnectTime_text").attr("disabled", true);
		$("#option60_text").attr("disabled", true);
		$("#WanIPv4Address_text").attr("disabled", true);
		$("#WanSubmask_text").attr("disabled", true);
		$("#WanGateway_text").attr("disabled", true);
		$("#WanPri_DNS_text").attr("disabled", true);
		$("#WanSec_DNS_text").attr("disabled", true);
		$("#WanIPv6DNS_select").attr("disabled", true);
		$("#WanIPv6Address_text").attr("disabled", true);
		$("#WanIPv6_Gateway_text").attr("disabled", true);
		$("#WanIPv6Pri_DNS_text").attr("disabled", true);
		$("#WanIPv6Sec_DNS_text").attr("disabled", true);
		$("#WanPrefix_checkbox").attr("disabled", true);
		$("#WanIPv6Address_select").attr("disabled", true);
		$("#WanPrefix_select").attr("disabled", true);
		$("#WanIPv6Address_Pre_text").attr("disabled", true);
		$("#WanDslite_checkbox").attr("disabled", true);
		$("#aftr_checkbox").attr("disabled", true);
		$("#aftr_text").attr("disabled", true);

		document.getElementById('fw_add').style.display = 'none';
		document.getElementById('fw_delete').style.display = 'none';
		document.getElementById('save_button').style.display = 'none';
		document.getElementById('cancel_button').style.display = 'none';

	}

	if (operator_name == "BZ_INTELBRAS")
	{
		$("#WanIP_Mode_select").bind("change", function() {
			if (($("#WanIP_Mode_select").val() != "1") && select_wan_info.IPMode == "1") {
				$("#WanPrefix_checkbox").prop("checked", true);
				$("#WanIPv6Address_select").val("AutoConfigured");
			}
		});

		$("#wan_connect_mode_select").bind("change", function() {
			if (($("#wan_connect_mode_select").val() != "Static") 
				&& ($("#WanIP_Mode_select").val() != "1") && select_wan_info.IPMode == "1")
			{
				$("#WanPrefix_checkbox").prop("checked", true);
				$("#WanIPv6Address_select").val("AutoConfigured");
			}
			else
			{
				$("#WanIPv6Address_select").val(select_wan_info.IPv6IPAddressOrigin);

				if (select_wan_info.IPv6PrefixDelegationEnabled == '1') {
					$("#WanPrefix_checkbox").prop("checked", true);
				}
				else {
					$("#WanPrefix_checkbox").prop("checked", false);
				}
			}
		});

		$("#POED").prop('type', "password");
		$("#deletetitle").show();
	}
	
	//if(operator_name == "ALGERIA_TELECOM")
	//	$("#POED").prop('type', "password");
		
	if(operator_name == "TH_3BB")
    	{
		$("#POED,#xxx").prop('type','password')

		setInterval(function(){
		    if($("#POED").length > 0){
				if($("#POED").attr('type') != 'password'){
					$('#POED').prop('type','password')
				}
			}else{
				window.location.reload();
			}
			if($("#xxx").length > 0){
				if($("#xxx").attr('type') != 'password'){
					$('#xxx').prop('type','password')
				}
			}else{
				window.location.reload();
			}
		}, 10);
	}

	 if(operator_name == "BZ_INTELBRAS" && lan_port_mode_enable == "1"){
        $("#Wan_Port_checkbox1").bind("click", function() {
            if (lan1_bound == 0 && select_wan_info.LanInterface.indexOf("dev.eth.1") == -1 && getCheckbox("Wan_Port_checkbox1") == 1) {
                alert("ckecked_lan_port_alert".i18n());
				setCheckbox("Wan_Port_checkbox1", 0);
			} 
        });

		$("#Wan_Port_checkbox2").bind("click", function() {
            if (lan2_bound == 0 && select_wan_info.LanInterface.indexOf("dev.eth.2") == -1 && getCheckbox("Wan_Port_checkbox2") == 1) {
                alert("ckecked_lan_port_alert".i18n());
				setCheckbox("Wan_Port_checkbox2", 0);
			} 
        });

		$("#Wan_Port_checkbox3").bind("click", function() {
            if (lan3_bound == 0 && select_wan_info.LanInterface.indexOf("dev.eth.3") == -1 && getCheckbox("Wan_Port_checkbox3") == 1) {
                 alert("ckecked_lan_port_alert".i18n());
				setCheckbox("Wan_Port_checkbox3", 0);
			} 
        });

		$("#Wan_Port_checkbox4").bind("click", function() {
            if (lan4_bound == 0 && select_wan_info.LanInterface.indexOf("dev.eth.4") == -1 && getCheckbox("Wan_Port_checkbox4") == 1) {
                alert("ckecked_lan_port_alert".i18n());
				setCheckbox("Wan_Port_checkbox4", 0);
			} 
        });
    }
});

function vlan_enable_switch()
{
	/*if (($("#WanServiceList_select").val() == 'INTERNET' || $("#WanServiceList_select").val() == 'TR069,INTERNET' || $("#WanServiceList_select").val() == 'VOIP,INTERNET' || $("#WanServiceList_select").val() == 'TR069,VOIP,INTERNET'|| $("#WanServiceList_select").val() == 'TR069,IPTV,INTERNET'))
	{
		if (gPon_mode == 0)//EPON
		{
			$("#WanVlan_Enable").attr("disabled", false);
			$("#vlan_cfg").show();
		}
		else//GPON
		{
			$("#vlan_cfg").hide();
			$("#WanVlan_Enable").attr("disabled", true);
			$("#WanVlan_Enable").prop("checked", true);
		}
		if (getCheckbox("WanVlan_Enable") == "1")
		{
			$("#VLAN_Setting").show();
		}
		else
		{
			$("#VLAN_Setting").hide();
		}
	}
	else
	{
		$("#vlan_cfg").hide();
		$("#VLAN_Setting").show();
	}*/

	if (gPon_mode == 0)//EPON
	{
		$("#WanVlan_Enable").attr("disabled", false);
		$("#vlan_cfg").show();
	}
	else//GPON
	{
		$("#vlan_cfg").hide();
		$("#WanVlan_Enable").attr("disabled", true);
		$("#WanVlan_Enable").prop("checked", true);
	}
	if (getCheckbox("WanVlan_Enable") == "1")
	{
		$("#VLAN_Setting").show();
	}
	else
	{
		$("#VLAN_Setting").hide();
	}
}

function address_obtainment_method_switch(select_method) {
	if (operator_name == "TH_AIS") {
		$("#WanDNSv6_select").val(select_method);
	}
}
function ssiddisplayInfo(data) {
	main_wifi_index_5g = data.ssid_info.main_wifi_index_5g;
}

function change_eye() {
    $("#POED").toggleClass("fh-text-security");
}

function initValidate() {
	if(operator_name == "EG_TELECOM"){
		eg_required = true
	}else{
		eg_required = false
	}
	if(operator_name == "CHL_ENTEL"){
		var rang = [1280, 1540];
		var rang_ppoe = [1280, 1532];
	}else if(operator_name == "OMN_OMANTEL"){
		var rang = [1280, 2000];
		var rang_ppoe = [1280, 2000];
	}else{
		var rang = [1280, 1500];
		var rang_ppoe = [1280, 1492];
	}
	var vlanRange;
	if(operator_name == "FTTR_MAIN_SFU_COMMON")
		vlanRange = [0, 4094];
	else
		vlanRange = [1, 4094];
	$("#broadband_form").validate({
		debug: true,
		rules: {
			"WanMTU_text": { required: true, range_int: rang },
			"WanMTU_text_PPPoE": { required: true, range_int: rang_ppoe},
			"Wan_802_1_P_select": { required: true, range_int: [0, 7] },
			"WanVlanID_text": { required: true, range_int: vlanRange },
			"WanUserName_text": { required: true, maxlength: 63, digits:eg_required },
			"POED": { required: pppoe_required, nocn: true, maxlength: 63 ,digits:eg_required},
			"idleDisconnectTime_text": { required: true, range_int: [0, 65535] },
			"WanIPv4Address_text": { required: true, ipv4: true },
			"WanSubmask_text": { required: true, subnetMask: true },
			"WanGateway_text": { required: true, ipv4: true },
			"WanPri_DNS_text": { required: true, ipv4: true },
			"WanSec_DNS_text": { ipv4: true },
			"WanIPv6Address_Pre_text": { required: true, ipv6_mask: [48, 64] },
			"WanIPv6Address_text": { required: true, ipv6: true },
			"WanIPv6_Gateway_text": { required: true, ipv6: true },
			"WanIPv6Pri_DNS_text": { required: true, ipv6: true },
			"WanIPv6Sec_DNS_text": { ipv6: true },
			"aftr_text": { required: true, ipv6_domain: true },
			"Wan_Override_Pri_DNS_text": { required: true, ipv4: true },
			"Wan_Override_Sec_DNS_text": { ipv4: true },
			"wanName": { required: true,maxlength: 32},
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
			error.insertAfter(element.parent().parent());
		},
		messages: {
		},
		submitHandler: function(form) {//校验成功回调
			fiberlog("validate broadband ok.....");
		},
		invalidHandler: function(form, validator) {  //校验失败回调
			fiberlog("validate broadband failed.....");
			return false;
		}
	});
}

function initValidate_th_ais() {
	$("#broadband_form").validate({
		debug: true,
		rules: {
			"WanMTU_text": { required: true, range_int: [1280, 1500] },
			"WanMTU_text_PPPoE": { required: true, range_int: [1280, 1492] },
			"Wan_802_1_P_select": { required: true, range_int: [0, 7] },
			"WanVlanID_text": { required: true, range_int: [0, 4094] },
			"WanUserName_text": { required: true, maxlength: 63 },
			"POED": { required: true, nocn: true, maxlength: 63 },
			"idleDisconnectTime_text": { required: true, range_int: [0, 65535] },
			"WanIPv4Address_text": { required: true, ipv4: true },
			"WanSubmask_text": { required: true, subnetMask: true },
			"WanGateway_text": { required: true, ipv4: true },
			"WanPri_DNS_text": { required: true, ipv4: true },
			"WanSec_DNS_text": { ipv4: true },
			"WanIPv6Address_Pre_text": { required: true, ipv6_mask: [48, 64] },
			"WanIPv6Address_text": { required: true, ipv6: true },
			"WanIPv6_Gateway_text": { required: true, ipv6: true },
			"WanIPv6Pri_DNS_text": { required: true, ipv6: true },
			"WanIPv6Sec_DNS_text": { ipv6: true },
			"aftr_text": { required: true, ipv6_domain: true },
			"Wan_Override_Pri_DNS_text": { required: true, ipv4: true },
			"Wan_Override_Sec_DNS_text": { ipv4: true },
            "pppoe_static_ip": { ipv4: true },
            "pppoe_static_mask": { subnetMask: true },
            "pppoe_static_start_ip": { ipv4: true },
            "pppoe_static_end_ip": { ipv4: true }
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
				error.insertAfter(element.parent().parent());		
		},
		messages: {
		},
		submitHandler: function(form) {//校验成功回调
			fiberlog("validate broadband ok.....");
		},
		invalidHandler: function(form, validator) {  //校验失败回调
			fiberlog("validate broadband failed.....");
			return false;
		}
	});
}
//Construct  Wifi Port Html
function constructWifiPortHtml() {
	/*sessionidstr = data.sessionid;
	if (data.success != 'true') {
		return false;
	}

	if (data.wifi_enable != undefined) {
		wifi_enable = data.wifi_enable;
	}

	if (data.wifi_5g_enable != undefined) {
		wifi_5g_enable = data.wifi_5g_enable;
	}

	if (data.lan_port_10g_num != undefined) {
		lan_port_10g_num = data.lan_port_10g_num;
	}
	if (data.lan_port_num != undefined) {
		lan_port_num = data.lan_port_num;
	}

	gWifiData = data;*/
	wifi_enable = gWifiEnable;
	wifi_5g_enable = gWifiEnable5G;
	lan_port_num = gLanPortNum;
	lan_port_10g_num = g10GLanPortNum;

}

function checkShowHideElement() {
	var pppoeIPv6PrefixTypeHTML = "<option value='PrefixDelegation'>"+"Prefix Delegat".i18n()+"</option>";
	var pppoeIPv6AddressHTML = "<option value='AutoConfigured'>"+"AutoConfigured".i18n()+"</option><option value='DHCPv6'>DHCPv6</option>";
	var ipoeIPv6AddressHTML_IDN_TELKOM = "<option value='AutoConfigured'>AutoConfigured</option><option value='DHCPv6'>DHCPv6</option><option value='NONE'>NONE</option>";
	var ipoeIPv6StaticAddressHTML = "<option value='Static'>"+'Static'.i18n()+"</option>";
	if (($("#WanAddress_select").val() == "PPPoE") && $("#WanConnectMode_select").val() == "route") {
		$("#Address_PPPoE_Setting").show();
		if (operator_name == "JOR_UMNIAH") {
			$("#pppoeServiceName_Setting").show();
		}
		if (operator_name == "COL_MILLICOM") {
			$("#pppoe_pass_div").show();
		}

		if ($("#dialMode_select").val() == 'OnDemand') {
			$("#manual_mode").hide();
			$("#keep_alive_mode").show();
			$("#dialMode_select_title").css('height', "auto");
			$("#idleDisconnectTime_Setting").show();
			if(gNewUiFlag)
				$("#wPppoeConnTrigger_div").css('height', "60px");
		}
		else if ($("#dialMode_select").val() == 'Manual') {
			$("#keep_alive_mode").hide();
			$("#idleDisconnectTime_Setting").hide();
			$("#dialMode_select_title").css('height', "48px");
			$("#manual_mode").show();
			if(gNewUiFlag)
				$("#wPppoeConnTrigger_div").css('height', "120px");
				
		}
		else {
			$("#manual_mode").hide();
			$("#keep_alive_mode").show();
			$("#idleDisconnectTime_Setting").hide();
			$("#dialMode_select_title").css('height', "auto");
			if(gNewUiFlag)
				$("#wPppoeConnTrigger_div").css('height', "60px");
		}
	}
	else {
		$("#Address_PPPoE_Setting").hide();

		if (operator_name == "COL_MILLICOM") {
			$("#pppoe_pass_div").hide();
		}
	}


	if ($("#WanServiceList_select").val() == 'TR069' || $("#WanServiceList_select").val() == 'VOIP' || $("#WanServiceList_select").val() == 'TR069,VOIP') {
		// $("#lan_ports").hide();
		// $("#wifi_ports").hide();
		// if(operator_name == "MY_TM" && $("#WanConnectMode_select").val() == 'bridge' && $("#WanServiceList_select").val() == 'VOIP')
		// {
		// 	$("#port_div").show();
		// 	$("#lan_ports").show();
		// 	$("#wifi_ports_div1").hide();
		// 	$("#wifi_ports_div2").hide();
		// }else{
		// 	$("#port_div").hide();
		// }
			$("#port_div").hide();
		

		if(($("#WanServiceList_select").val() == 'TR069' || $("#WanServiceList_select").val() == 'TR069,VOIP')
			&& (operator_name == "BZ_INTELBRAS"))
		{
			$("#WanIP_Mode").show();
		}
		else
		{
			$("#WanIP_Mode").hide();
		}
		
		if(($("#WanServiceList_select").val() == 'VOIP') && (operator_name == "MEX_MEGA"))
		{
			$("#WanIP_Mode").show();
		}
		else
		{
			$("#WanIP_Mode").hide();
		}
		
		$("#nat_dns_mtu_div").hide();

	}
	else if ($("#WanServiceList_select").val() == 'INTERNET' || $("#WanServiceList_select").val() == 'TR069,INTERNET' || $("#WanServiceList_select").val() == 'VOIP,INTERNET' || $("#WanServiceList_select").val() == 'TR069,VOIP,INTERNET'|| $("#WanServiceList_select").val() == 'TR069,IPTV,INTERNET') {
		$("#WanIP_Mode").show();
		$("#nat_dns_mtu_div").show();
		$("#port_div").show();
		if(operator_name == "MEX_MEGA" &&  $("#WanIP_Mode_select").find("option[value='3']").length == 0){
			$("#WanIP_Mode_select").append('<option value="3">IPv4&IPv6</option>');
		}
	} else if ($("#WanServiceList_select").val() == 'MULTICAST' || $("#WanServiceList_select").val() == 'IPTV' || $("#WanServiceList_select").val() == 'OTHER') {
		$("#port_div").show();
		$("#WanIP_Mode").show();
		$("#nat_dns_mtu_div").hide();
		if(operator_name == "MEX_MEGA" &&  $("#WanIP_Mode_select").find("option[value='3']").length == 0){
			$("#WanIP_Mode_select").append('<option value="3">IPv4&IPv6</option>');
		}
	}
	if (operator_name == "IDN_TELKOM") {
		$("#WanIP_Mode_select").attr("disabled", "true");
	}

	//IPTV MULTICAST OTHER 支持配置IPV6
	if ($("#WanServiceList_select").val() == 'TR069' || $("#WanServiceList_select").val() == 'VOIP'
		|| $("#WanServiceList_select").val() == 'TR069,VOIP') {
		//$("#WanIP_Mode").show();

		if(($("#WanServiceList_select").val() == 'TR069' || $("#WanServiceList_select").val() == 'TR069,VOIP')
			&& (operator_name == "BZ_INTELBRAS"))
		{
			$("#WanIP_Mode").show();
		}
		else
		{
			if(operator_name == "MEX_MEGA" && $("#WanServiceList_select").val() == 'VOIP')
			{
				$("#WanIP_Mode_select option[value='3']").remove();
			}
			else
			{
				$("#WanIP_Mode_select").val("1");
			}
		}

		
		//$("#WanIP_Mode_select").attr("disabled", "true");
	}
	// else
	// {
	// 	if(operator_name == "IDN_TELKOM")
	// 	{
	// 		$("#WanIP_Mode_select").attr("disabled", "true");
	// 	}
	// 	// else
	// 	// {
	// 	// 	$("#WanIP_Mode_select").removeAttr("disabled");
	// 	// }

	// }

	//泰国3BB定制化需求 新增类型（multicast_iptv、 unicast_iptv、OTHER)则处理方式同internet
	if (operator_name == "TH_3BB") {
		if ($("#WanServiceList_select").val() == "UNICAST_IPTV" || $("#WanServiceList_select").val() == "MULTICAST_IPTV" || $("#WanServiceList_select").val() == "OTHER") {
			$("#WanIP_Mode").show();
			$("#nat_dns_mtu_div").show();
			$("#port_div").show();
			$("#WanIP_Mode_select").removeAttr("disabled");
		}
	}

	if ($("#wan_connect_mode_select").val() == 'Static') {
		$("#dhcp_list_title_value").html("wan_static_mode".i18n());

		$("#IPv4_Address_Static_Settings").show();

		if (operator_name != "IDN_TELKOM") {
			$("#WanIPv4Address_text").removeAttr("disabled");
			$("#WanSubmask_text").removeAttr("disabled");
			$("#WanGateway_text").removeAttr("disabled");
			$("#WanPri_DNS_text").removeAttr("disabled");
			$("#WanSec_DNS_text").removeAttr("disabled");
		}
		
		$("#option60_setting").hide();
		$("#IPv6_Address_Static_Settings").show();
		$("#WanIPv4Address_select_static").show();
		$("#WanPrefix_select").html(ipoeIPv6StaticAddressHTML);
		//$("#WanPrefix_select").attr("disabled", "true");
		$("#WanIPv6Address_select").html(ipoeIPv6StaticAddressHTML);
		if (operator_name == "TH_AIS") {
			$("#WanDNSv6_select").html(ipoeIPv6StaticAddressHTML);
		}
		//$("#WanIPv6Address_select").attr("disabled", "true");

		/**
		2020年5月25日修改
		MTU提示框修改，通过修改提示框的name，解决页面校验函数处理
		使得MTU_hint提示输入范围。
		此处修改涉及static/dhcp 和PPPoE 两种情况。
		此处（包括else分支）表示在下拉框切换时的情况。另有负责在页面载入时的情况。 检索20200525
		*/
		$("#WanMTU_text").attr('name', 'WanMTU_text');
		if(operator_name == "CHL_ENTEL"){
			$("#MTU_hint").html("(1280-1540)");
		}else if(operator_name == "OMN_OMANTEL"){
			$("#MTU_hint").html("(1280-2000)");
		}else{
			$("#MTU_hint").html("(1280-1500)");
		}
		//智利GTD版本增加IPv6 Rapid Commit功能，仅DHCP和PPPoE下可配置，Static下不可配
		if (operator_name == "CHL_GTD") {
			$("#rapidcommit_setting").hide();
		}

		if (operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") {
			$("#wan_dns_override").hide();
			$("#WanPri_DNS_text").removeAttr("disabled");
			$("#WanSec_DNS_text").removeAttr("disabled");
		}

	}
	else if ($("#wan_connect_mode_select").val() == 'DHCP') {
		$("#dhcp_list_title_value").html("wan_dhcp_mode".i18n());

		$("#option60_setting").show();


		$("#IPv4_Address_Static_Settings").show();
		$("#WanIPv4Address_text").attr("disabled", "true");
		$("#WanSubmask_text").attr("disabled", "true");
		$("#WanGateway_text").attr("disabled", "true");

		if (operator_name != "IDN_TELKOM") {
			$("#WanIPv6Address_select").removeAttr("disabled");
		}
		var temp = $("#WanIPv6Address_select").val();//2020年4月16日 临时补丁，修正static和dhcp切换时产生的问题。

		if (operator_name == "IDN_TELKOM") {
			$("#WanIPv6Address_select").html(ipoeIPv6AddressHTML_IDN_TELKOM);
		} else {
			$("#WanIPv6Address_select").html(pppoeIPv6AddressHTML);
			if (operator_name == "TH_AIS") {
				$("#WanDNSv6_select").html(pppoeIPv6AddressHTML);
			}
		}
		if (temp != "Static") {
			$("#WanIPv6Address_select").val(temp);
			if (operator_name == "TH_AIS") {
				$("#WanDNSv6_select").val(temp);
			}
		}
		$("#WanPrefix_select").html(pppoeIPv6PrefixTypeHTML);
		//$("#WanPrefix_select").attr("disabled", "true");
		$("#WanIPv4Address_select_static").hide();
		$("#IPv6_Address_Static_Settings").hide();
		$("#WanMTU_text").attr('name', 'WanMTU_text');
		if(operator_name == "CHL_ENTEL"){
			$("#MTU_hint").html("(1280-1540)");
		}else if(operator_name == "OMN_OMANTEL"){
			$("#MTU_hint").html("(1280-2000)");
		}else{
			$("#MTU_hint").html("(1280-1500)");
		}

		//智利GTD版本增加IPv6 Rapid Commit功能，仅DHCP和PPPoE下可配置，Static下不可配
		if ((operator_name == "CHL_GTD") && ($("#WanIP_Mode_select").val() != '1')) {
			$("#rapidcommit_setting").show();
		}

		if ((operator_name == "ALGERIA_TELECOM" || operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") && ($("#WanIP_Mode_select").val() != '2')) {
			$("#wan_dns_override").show();
			if ($("#wan_dnsoverride_select").val() == "1") {
				$("#WanPri_DNS_text").removeAttr("disabled");
				$("#WanSec_DNS_text").removeAttr("disabled");
			} else {
				$("#WanPri_DNS_text").attr("disabled", "disabled");
				$("#WanSec_DNS_text").attr("disabled", "disabled");
			}
		} else {
			$("#wan_dns_override").hide();
			$("#WanPri_DNS_text").attr("disabled", "true");
			$("#WanSec_DNS_text").attr("disabled", "true");
		}
	}
	else if ($("#wan_connect_mode_select").val() == 'PPPOE') {
		$("#dhcp_list_title_value").html("wan_pppoe_mode".i18n());
		$("#IPv6_Address_Static_Settings").hide();
		$("#option60_setting").hide();
		$("#WanIPv4Address_text").attr("disabled", "true");
		$("#WanSubmask_text").attr("disabled", "true");
		$("#WanGateway_text").attr("disabled", "true");
		$("#WanMTU_text").attr('name', 'WanMTU_text_PPPoE');
		if(operator_name == "CHL_ENTEL"){
			$("#MTU_hint").html("(1280-1532)");
		}else if(operator_name == "OMN_OMANTEL"){
			$("#MTU_hint").html("(1280-2000)");
		}else{
			$("#MTU_hint").html("(1280-1492)");
		}

		//智利GTD版本增加IPv6 Rapid Commit功能，仅DHCP和PPPoE下可配置，Static下不可配
		if ((operator_name == "CHL_GTD") && ($("#WanIP_Mode_select").val() != '1')) {
			$("#rapidcommit_setting").show();
		}

		if ((operator_name == "ALGERIA_TELECOM" || operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") && ($("#WanIP_Mode_select").val() != '2')) {
			$("#wan_dns_override").show();
			if ($("#wan_dnsoverride_select").val() == "1") {
				$("#WanPri_DNS_text").removeAttr("disabled");
				$("#WanSec_DNS_text").removeAttr("disabled");
			} else {
				$("#WanPri_DNS_text").attr("disabled", "true");
				$("#WanSec_DNS_text").attr("disabled", "true");
			}
		} else {
			$("#wan_dns_override").hide();
			$("#WanPri_DNS_text").attr("disabled", "true");
			$("#WanSec_DNS_text").attr("disabled", "true");
		}
	}

	if ($("#WanPrefix_checkbox").attr('checked')) {
		$("#IPv6_Address_Prefix_Type_Tr").show();
	}
	else {
		$("#IPv6_Address_Prefix_Type_Tr").show();
	}

	if ($("#WanPrefix_select").val() == 'Static') {
		$("#IPv6_Address_Prefix_Tr").show();
	}
	else {
		$("#IPv6_Address_Prefix_Tr").hide();
	}

	if ($("#WanConnectMode_select").val() == 'route') {
		if ($("#WanIP_Mode_select").val() == '1') //ipv4
		{
			$("#IPv4_Settings").show();
			$("#IPv6_Settings").hide();
			$("#nat_setting").show();//ipv4 时，可以配置nat
			if (operator_name == "TH_AIS") {
				$("#div_nat_loopback_enable").show();
			}
			//智利GTD版本增加IPv6 Rapid Commit功能，IPv4下不显示
			if (operator_name == "CHL_GTD") {
				$("#rapidcommit_setting").hide();
			}
		}
		else if ($("#WanIP_Mode_select").val() == '2') //ipv6
		{
			$("#IPv4_Settings").hide();
			$("#IPv6_Settings").show();
			$("#nat_setting").hide();//ipv6 时，不可以配置nat
			if (operator_name == "TH_AIS" ) {
				$("#div_nat_loopback_enable").hide();
			}

			//智利GTD版本增加IPv6 Rapid Commit功能，IPv6下显示
			if (operator_name == "CHL_GTD"
				&& $("#wan_connect_mode_select").val() != 'Static'
				&& $("#WanConnectMode_select").val() == "route") {
				$("#rapidcommit_setting").show();
			}
			if (operator_name == "TH_AIS" ) {
				$("#div_DNSv6_obtainment_method").show();
			}
		}
		else {
			$("#IPv4_Settings").show();
			$("#IPv6_Settings").show();
			$("#nat_setting").show();
			if (operator_name == "TH_AIS") {
				$("#div_nat_loopback_enable").show();
			}
			//智利GTD版本增加IPv6 Rapid Commit功能，IPv4&6下显示
			if (operator_name == "CHL_GTD"
				&& $("#wan_connect_mode_select").val() != 'Static'
				&& $("#WanConnectMode_select").val() == "route") {
				$("#rapidcommit_setting").show();
			}
			if (operator_name == "TH_AIS") {
				$("#div_DNSv6_obtainment_method").show();
			}
		}
	}
	else {
		$("#IPv4_Settings").hide();
		$("#IPv6_Settings").hide();
		//$("#port_div").hide();
		//$("#lan_ports").show();
		$("#nat_setting").hide();//桥接时，不配置nat
		if (operator_name == "TH_AIS") {
			$("#div_nat_loopback_enable").hide();
		}
		$("#mtu_setting").hide();//桥接时，不配置mtu
		$("#wan_address").hide();
		$("#wan_connect_mode").hide();
		$("#dhcp_list_title").hide();
		if(gNewUiFlag)
			$("#line").hide();
		$("#wifi_ports_div1").hide();
		$("#wifi_ports_div2").hide();
		if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP") {
			$("#WanIP_Mode").show();
		} else {
			$("#WanIP_Mode").hide();
		}

		//智利GTD版本增加IPv6 Rapid Commit功能，仅路由模式下DHCP和PPPoE下显示，桥接和Static下不显示
		if (operator_name == "CHL_GTD") {
			$("#rapidcommit_setting").hide();
		}

		if ((operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR")) {
			$("#wan_dns_override").hide();
		}
	}


	if ($("#WanDslite_checkbox").attr('checked')) {
		$("#aftr_check_div").show();
	}
	else {
		$("#aftr_check_div").hide();
	}

	if ($("#WanDslite_checkbox").attr('checked') && $("#aftr_checkbox").attr('checked')) {
		$("#aftr_value_div").show();
	}
	else {
		$("#aftr_value_div").hide();
	}

	// 包含Internet且IP模式为IPv6的连接才能配置DS-Lite信息
	// 2019-11-02 fengshuo 使得dslite隐藏不使用
	if ($("#WanServiceList_select").val().indexOf("INTERNET" >= 0)
		&& $("#WanIP_Mode_select").val() == v4V6ModeAarry[1]) {
		$("#IPv6_Dslite_Settingstotal").show();
	}
	else {
		$("#IPv6_Dslite_Settingstotal").hide();
	}

	if ($("#WanConnectName_select").val() == '0')//新建
	{
		$("#delete_button").hide();
	}
	else {
		$("#delete_button").show();
	}

	if (all_wan_info.wifi_device == 1) {
		$(".wifi_ports").show();
		$(".wifiport").hide();
		for (i = 0; i < all_wan_info.wifi_port_num; i++) {
			$(".wifiport:eq(" + i + ")").show();
		}
		if ( wifi_5g_enable == 1 )
		{
			$("#wifi_ports_div2").show();
		}
		else
		{
			$("#wifi_ports_div2").hide();
		}
		if($("#WanServiceList_select").val() == 'VOIP' && operator_name == "MY_TM"){
			$(".wifi_ports").hide();
		}
	}
	else {
		$(".wifi_ports").hide();
	}
}

function initPage(getdata) {
	pause_back()
	if (getdata.sessionid != undefined) {
		sessionidstr = getdata.sessionid;
	}
	XHR.get("get_login_user", null, function(getdata) {
		if (getdata.sessionid != undefined) {
			sessionidstr = getdata.sessionid;
		}
	});
	all_wan_info = '';
	// selectwan = '';
	if (getdata != null) {
		all_wan_info = getdata;
		// modify by fengshuo 经se同意，放开对tr069控制的限制
		// if ( getdata.tr69wan_modify != undefined )
		// {
		// 	tr69_wan_modify_enable = getdata.tr69wan_modify;
		// }
	}


	//初始化wan连接名称
	initConnectName();
	//初始化IP模式
	initIpProtocol();
	//根据封装类型初始化配置项的内容
	initIPorPPPInnerHTML();
	//根据连接模式初始化业务类型列表
	initServiceList();

	displayTableHtml();

	if (getdata.wan && getdata.wan.length > 0) {
		var currentwan = getdata.wan[0];
		if (operator_name == "IDN_TELKOM" && (currentwan.Name.indexOf("_INTERNET_B_") >= 0)) {
			$("#broadband_form").hide();
		} else {
			var value_temp = $("#WanConnectName_select").val();
			if(gNewUiFlag)
				selectwantype = currentwan.ConnectionType;

			displayFormHtml("init", value_temp);
		}
		if(gNewUiFlag){
			$("#outtable_0").addClass("wan_name_select")
			$("#img_select_0").show()
			$("#img_0").show()
		}

	}
	else {
		$("#broadband_form").hide();
		//displayFormHtml("init","0");
		if(gNewUiFlag)
			$("#image").show();
	}
	//selectWanChange();

	checkWifiEnable();
	if (login_user == "0" && (operator_name == "TH_TRUE") && (operator_name == "TH_SME_TRUE")) {
		$("input").attr("disabled", true);
		$("select").attr("disabled", true);
		//$("input[name='portbind']").attr("disabled", false);
	}
	if (wifi_5g_enable == 1) {
		$("#lantext1").html("wifi_5g_gbit_port1".i18n());
		$("#lantext2").html("wifi_5g_itv".i18n());
		$("#lantext3").html("wifi_5g_gbit_port3".i18n());
		$("#lantext4").html("wifi_5g_gbit_port4".i18n());
	}
	else {
		$("#lantext1").html("wifi_gbit_port".i18n());
		$("#lantext2").html("wifi_iTV".i18n());
		$("#lantext3").html("wifi_100m_port2".i18n());
		$("#lantext4").html("wifi_100m_port3".i18n());
	}
	$("#lantext5").html("wifi_10g_lan".i18n());
	if (lan_port_10g_num == 1) {
		document.getElementById('LAN5enable').style.display = '';
	}
	if (gModelName == "SR3141M") {
		$("#LAN4enable").hide();
	}


	/**
	2020年5月25日修改
	MTU提示框修改，通过修改提示框的name，解决页面校验函数处理
	使得MTU_hint提示
	输入范围pppoe-1280-1492。 ipoe 1280 -1500
	此处修改涉及static/dhcp 和PPPoE 两种情况。
	此处负责在页面载入时的情况。切换处处理检索20200525
	*/
	if ($("#WanAddress_select").val() == "PPPoE") {
		$("#WanMTU_text").attr('name', 'WanMTU_text_PPPoE');	
	}
	else {
		$("#WanMTU_text").attr('name', 'WanMTU_text');
	}
	if (wifi_enable == 0) {
		document.getElementById('wifi_ports_div1').style.display = 'none';
	}
	if (wifi_5g_enable == 0) {
		document.getElementById('wifi_ports_div2').style.display = 'none';
	}
	var lan_num = lan_port_num + lan_port_10g_num;
	$("#lan_list .lanport:gt(" + (lan_num - 1) + ")").hide();
	if(operator_name == "MAR_INWI")
	{
		$("#internet_list").children().eq(0).children().css("background-color", "#DEC0DF");
		$("#internet_list").children().eq(0).siblings().children().css("background-color", "#eef2f6");
		$("#internet_list").children().eq(0).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
		$("#internet_list").children().eq(0).children().click();
	}
	else{
	$("#internet_list").children().eq(0).children().css("background-color", "#b7e3e3");
	$("#internet_list").children().eq(0).siblings().children().css("background-color", "#eef2f6");
	$("#internet_list").children().eq(0).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
	$("#internet_list").children().eq(0).children().click();
	}
	gNew_Wan_Flag = true;
}
function select_this_wan(domNode){
	$(".error-conter").each(function(i) {
        $(this).html('');
    });
	$(".main_item_error_hint").each(function(i) {
		$(this).removeClass("main_item_error_hint");
    });
	$(".wan_name_select").removeClass("wan_name_select")
	$(domNode).addClass("wan_name_select")
	Showthisinfo(domNode.id)
	$(".del_wan_icon").hide()
	$(".img_select").hide()
	$("#img_select_"+ domNode.id.split("_")[1]).show()
	$("#img_"+ domNode.id.split("_")[1]).show()
	if(!gNew_Wan_Flag){
		$("#wan_rules").find("li:last").remove();
		gNew_Wan_Flag = true;
	}
}

function del_this_wan(id) {
	var index = id.split("_")[1];
	var value = $("#wan_index_"+index).val()
	myConfirm('Tip','Are you sure to delete the selected rule?'.i18n(),function(r){  
		if(r){  
			var value_temp;
			var wan_num = $("#WanConnectName_select").val();
			var index = wan_num.split("_")[0];
			IPoEPPPoEArr = [];
			IPoEPPPoEArrIndex = 0;
			IPoEPPPoEArr.push(getSingleWanInfo(value).iporppp);
			value_temp = value;
			index = value_temp;
			wanDelSleep(300);
			deleteWan(index); //执行删除操作
		}  
	}); 
}

function displayTableHtml() //动态给列表赋值显示后端传来的数据内容
{
	if(gNewUiFlag){
		var dynamicClsListHTML = '';
		for (var m = 0; m < all_wan_info.wan.length; m++) {
			var single = all_wan_info.wan[m];
			var wan_name_value = single.wan_index + '_' + single.wan_session_index + '_' + single.iporppp + '_' + single.Name;
			dynamicClsListHTML += "<li  id='outtable_"+ m + "' onclick='select_this_wan(this)' >";
			dynamicClsListHTML += "<span class ='img_select' id='img_select_"+ m + "' style='display:none'></span>";
			dynamicClsListHTML += single.Name;
			dynamicClsListHTML += "<img id='img_"+ m + "' src='../image/new_ui/del_wan.png' class='del_wan_icon' onclick='del_this_wan(this.id)'  >";
			dynamicClsListHTML += "<input id='wan_index_"+ m +"' type='hidden' value='"+ wan_name_value + "'>";//<input type="HIDDEN" name="recontrol_check" value="0">
			dynamicClsListHTML += "</li>";
		}
		$("#wan_rules").html(dynamicClsListHTML)
	}else{
	var num = 1;
	var ip_mode = '';
	var dynamicClsListHTML = '';
	for (var m = 0; m < all_wan_info.wan.length; m++) {
		var n = m + 1;
		var single = all_wan_info.wan[m];
		var wan_name_value = single.wan_index + '_' + single.wan_session_index + '_' + single.iporppp + '_' + single.Name;//拼接wan的value给
		if (operator_name == "IDN_TELKOM" && (single.Name.indexOf("_B_") >= 0) && (single.Name.indexOf("INTERNET") >= 0)) {
			continue;
		}

		if (operator_name == "BZ_TIM" && login_user == "0" && single.ServiceList == "TR069,VOIP") {
			continue;
		}

		dynamicClsListHTML += '<tr id="outtable_' + m + '" style="cursor: pointer;" onclick="Showthisinfo(this.id)">'; //新增数据时，把数据在前端显示显示
		dynamicClsListHTML += '<td align="center">' + n + '</td>';
		dynamicClsListHTML += '<td align="center">' + single.Name + '</td>';
		if(operator_name == "COL_ETB"){
			dynamicClsListHTML += '<td align="center">' + single.wanName + '</td>';
		}

		if(operator_name == "BZ_INTELBRAS" && single.vlanid == 0)
		{
			dynamicClsListHTML += '<td align="center">' + '--' + '/' + single.p8021 + '</td>';
		}
		else
		{
			dynamicClsListHTML += '<td align="center">' + single.vlanid + '/' + single.p8021 + '</td>';
		}
		if ("1" == single.IPMode) {
			ip_mode = "IPv4";
		}
		else if ("2" == single.IPMode) {
			ip_mode = "IPv6";
		}
		else if ("3" == single.IPMode) {
			ip_mode = "IPv4&IPv6";
		}
		dynamicClsListHTML += '<td align="center">' + ip_mode + '</td>';
		if (operator_name == "ECU_CNT" && login_user == "1" && (single.Name.indexOf("TR069") >= 0)) {
			dynamicClsListHTML += '<td></td> </tr>';
		} else {
			dynamicClsListHTML += '<td align="center"><input type="checkbox" class="delselwan" value="' + wan_name_value + '"></td>';
			dynamicClsListHTML += '</tr>';
		}

	}
	$("#internet_list").html(dynamicClsListHTML);
	}
}

function Showthisinfo(element) //选中当前行并改变背景色
{
	addflag = "edit";
	$("#add_item").remove();
	if(!gNewUiFlag){
	$("#" + element).children().css("background-color", "#b7e3e3");
	$("#" + element).siblings().children().css("background-color", "#eef2f6");
	$("#" + element).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
	}
	if(gOperatorName == "MAR_INWI"){
		$("#" + element).children().css("background-color", "#DEC0DF");
	$("#" + element).siblings().children().css("background-color", "#eef2f6");
	$("#" + element).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
	}
	var index = element.split("_")[1];
	var single_wan = all_wan_info.wan[index];
	var wan_name_value = single_wan.wan_index + '_' + single_wan.wan_session_index + '_' + single_wan.iporppp + '_' + single_wan.Name;//拼接wan的value给
	var mode = "old";
	selectwantype = single_wan.ConnectionType;
	selfilterIndex = parseInt(index) + 1;
	displayFormHtml(mode, wan_name_value);
	if ((operator_name == "MEX_TP") && login_user == 1) {
		if (single_wan.vlanid == 417 && single_wan.ServiceList == "INTERNET" && single_wan.ConnectionType == "PPPoE_Bridged") {
			$("#Wan_Port_checkbox1").prop("disabled", true);
			$("#Wan_Port_checkbox2").prop("disabled", true);
			$("#Wan_Port_checkbox3").prop("disabled", true);
			$("#Wan_Port_checkbox4").prop("disabled", true);
			$("#Wan_Port_checkbox5").prop("disabled", true);

			$("#Wan_SSID_checkbox1").prop("disabled", true);
			$("#Wan_SSID_checkbox2").prop("disabled", true);
			$("#Wan_SSID_checkbox3").prop("disabled", true);
			$("#Wan_SSID_checkbox4").prop("disabled", true);
			$("#Wan_SSID_checkbox5").prop("disabled", true);
			$("#Wan_SSID_checkbox6").prop("disabled", true);
			$("#Wan_SSID_checkbox7").prop("disabled", true);
			$("#Wan_SSID_checkbox8").prop("disabled", true);
		} else {
			$("#Wan_Port_checkbox1").prop("disabled", false);
			$("#Wan_Port_checkbox2").prop("disabled", false);
			$("#Wan_Port_checkbox3").prop("disabled", false);
			$("#Wan_Port_checkbox4").prop("disabled", false);
			$("#Wan_Port_checkbox5").prop("disabled", false);

			$("#Wan_SSID_checkbox1").prop("disabled", false);
			$("#Wan_SSID_checkbox2").prop("disabled", false);
			$("#Wan_SSID_checkbox3").prop("disabled", false);
			$("#Wan_SSID_checkbox4").prop("disabled", false);
			$("#Wan_SSID_checkbox5").prop("disabled", false);
			$("#Wan_SSID_checkbox6").prop("disabled", false);
			$("#Wan_SSID_checkbox7").prop("disabled", false);
			$("#Wan_SSID_checkbox8").prop("disabled", false);
		}
	}

	if (operator_name == "MY_TM") {
		disable_lan(uplink_type);
	}
	
	if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO")
	{
		vlan_enable_switch();
	}
}

function checkWifiEnable() {
	for (var i = 1; i <= 16; i++) {
		//var singlewlanvlanbind = gWifiData.wlanVlanBindList[i - 1];
		//if (eval("singlewlanvlanbind.ssid" + i) == 1)//wifi 实例存在
		{
			if (eval("all_wan_info.wifi_obj_enable.ConfigActive" + i) == 0) {
				$("#Wan_SSID_checkbox" + i).attr("disabled", true);
			} else {
				$("#Wan_SSID_checkbox" + i).attr("disabled", false);
			}
		}
		continue;
	}
}

function displayFormHtml(mode, wan_name) {
	$("#broadband_form").show();
	$(".main_item_error_hint").each(function(i) {
		$(this).html("");
	});
	selectwan = wan_name;

	$("#WanConnectName_select option").each(function() {

		if (selectwan == this.value) {
			$("#WanConnectName_select").val(selectwan);
		}
	})
	if (mode == "init" && selectwan == "0") {
		//addfilter();
		loadNewWan();
	}
	else {
		var select_wan_info = getSingleWanInfo(selectwan);
		if (select_wan_info != '') {
			loadSpecifiedWan(select_wan_info);
		}
	}
	checkShowHideElement();
}

function selectWanChange() {
	$(".main_item_error_hint").each(function(i) {
		$(this).hide();
	});

	selectwan = $("#WanConnectName_select").val();
	if (selectwan == 0)//新增WAN连接
	{
		loadNewWan();
	}
	else {
		var select_wan_info = getSingleWanInfo(selectwan);
		if (select_wan_info != '') {
			loadSpecifiedWan(select_wan_info);
		}
	}

	checkShowHideElement();
}

function getSingleWanInfo(selectwan_index) {
	var select_wan_index = selectwan_index.split(splitchar)[0];
	var select_wan_session_index = selectwan_index.split(splitchar)[1];
	var select_iporppp = selectwan_index.split(splitchar)[2];
	var wan_num = all_wan_info.wan.length;
	if (wan_num > 0) {
		for (i = 0; i < wan_num; i++) {
			var single_wan = all_wan_info.wan[i];
			if (single_wan.wan_index == select_wan_index
				&& single_wan.wan_session_index == select_wan_session_index
				&& single_wan.iporppp == select_iporppp) {
				select_wan_info = single_wan;
				break;
			}
		}
	}
	return select_wan_info;
}

//加载新增WAN连接的参数
function loadNewWan() {
	$("#WanAddress_select").val("IPoE");//封装类型默认选择IPoE
	initIPorPPPInnerHTML();

	$("#WanConnectMode_select").val(connectModeAarry[0]);//连接模式默认选择路由
	initServiceList();

	$("#WanServiceList_select").val("INTERNET"); //业务类型默认选择上网

	//v4V6ModeAarry is "1_2_3";
	$("#WanIP_Mode_select").val(v4V6ModeAarry[0]);//IP模式默认选择IPv4

	if(operator_name == "CHL_ENTEL"){
		$("#WanMTU_text").val('1492'); //默认MTU为1500
	}else{
		$("#WanMTU_text").val('1500'); //默认MTU为1500
	}

	//默认使用VLAN
	$("#WanVlan_Enable").prop("checked", true);
	$("#VLAN_Setting").show();
	$("#WanVlanID_text").val('');

	$("#Wan_802_1_P_select").val('0');//优先级默认设置

	unCheckAllBindPorts();//去除所有端口绑定

	// IPv4信息
	// addressTypeArray is ('DHCP', 'Static', 'PPPoE')
	$("#wan_connect_mode_select").val(addressTypeArray[0]);//默认选择DHCP
	clearIpv4StaticIpInfo();
	clearPPPoEInfo();

	// IPv6信息
	$("#WanPrefix_checkbox").prop("checked", true); //默认获取前缀
	// ipv6PrefixTypeArray is ('PrefixDelegation', 'Static', 'PPPoE', 'None');
	//$("#WanIPv6Address_Pre_text").val(ipv6PrefixTypeArray[0]);
	$("#WanIPv6Address_Pre_text").val('');
	//ipv6DNS配置暂缺
	$("#WanIPv6Address_select").val(ipv6AddressArray[1]);
	if (operator_name == "TH_AIS") {
		$("#WanDNSv6_select").val(ipv6AddressArray[1]);
	}
	clearIpv6StaticIpInfo();
	$("#WanDslite_checkbox").prop("checked", false);
	$("#aftr_checkbox").prop("checked", false);
	$("#aftr_text").val('');

	//tr069 wan不能修改，part 2
	$("#save_button, #delete_button").removeAttr("disabled");
	$("#save_button, #delete_button").removeClass("input_button_disabled");
	$("#tr69_wan_hint").hide();


}

function setCheck(ajaxObject, ischecked)//设置函数是否选中
{
	if (ajaxObject) {
		if (ischecked == 1 || ischecked == '1' || true == ischecked || ischecked == 'Enable' || ischecked == 'Enabled') {
			ajaxObject.attr('checked', true);
		}
		else {
			ajaxObject.attr('checked', false);
		}
	}
}

function loadSpecifiedWan(select_wan_info) {
	if (select_wan_info.iporppp == '1') //1:ipoe  2:pppoe
	{
		$("#WanAddress_select").val("IPoE");
	}
	else {
		$("#WanAddress_select").val("PPPoE");
	}
	//这种直接赋值的无法触发select的change事件，需要手动调用
	initIPorPPPInnerHTML();

	if (select_wan_info.ConnectionType == "IP_Routed" || select_wan_info.ConnectionType == "PPPoE_Routed" || select_wan_info.ConnectionType == "PPPoE_Mix") {
		$("#WanConnectMode_select").val(connectModeAarry[0]);
	}
	else {
		$("#WanConnectMode_select").val(connectModeAarry[1]);
	}
	initServiceList();

	var selectListValue = "";
	selectListValue = select_wan_info.ServiceList;
	//    if(operator_name =="ECU_CNT" && login_user == "1"){
	//        console.log(select_wan_info.ServiceList);
	//        if(select_wan_info.ServiceList.indexOf("TR069") >=0){
	//          $("#WanServiceList_select").bind("change", function(){
	//          	if($("#WanServiceList_select").val().indexOf("TR069") < 0){
	//               alert("Please make sure that there is one TR069 WAN links.");
	//               $("#WanServiceList_select").val(selectListValue);
	//            }
	//          })  
	//        }else{
	//            $("#WanServiceList_select").unbind("change");  
	//        }

	//   }
	//var isTr69Wan = 0;

	// for ( var i=0; i< service_modes_new_array.length; i++ )
	// {
	// 	if(select_wan_info.ServiceList == service_modes_new_array[i])
	// 	{
	// 		selectListValue = i;//选择当前的service list
	// 	// modify by fengshuo 经SE同意，放开对TR069控制的限制
	// 	// if ( i == 0 )
	//  	// 	{
	// 		// 	isTr69Wan = 1;
	//  	// 	}
	// 	}
	// }	
	//serviceModesArray is ('TR069', 'VOIP', 'INTERNET', 'OTHER');
	// for ( var i=0; i< service_modes_new_array.length; i++ )
	// {
	// 	if ( select_wan_info.ServiceList.toUpperCase().trim() == service_modes_new_array[i].trim())
	// 	{
	// 		selectListValue = i;
	// 		alert("list值是"+JSON.stringify(select_wan_info.ServiceList) + "指数是" + selectListValue);
	// 		alert("ddd"+ service_modes_new_array[i]);
	// 		if ( i == 0 )
	// 		{
	// 			isTr69Wan = 1;
	// 		}
	// 	}
	// }
	//fiberlog('selectListValue is ' + selectListValue);
	if (operator_name == "TH_3BB") {
		if (selectListValue == "MULTICAST_IPTV") {
			$("#WanConnectMode_select").attr("disabled", true);
		} else {
			$("#WanConnectMode_select").attr("disabled", false);
		}
	}
	$("#WanServiceList_select").val(selectListValue);

	$("#WanIP_Mode_select").val(select_wan_info.IPMode);

	//ipc和pppc的mtu管理量不同
	// if ( select_wan_info.iporppp == '1' )
	// {
	$("#WanMTU_text").val(select_wan_info.mtu);
	// }
	// else
	// {
	// $("#WanMTU_text").val(select_wan_info.mtu);
	// }
	if (select_wan_info.Enable == "1") {
		$("#WanEnable_checkbox").prop("checked", true);

	} else {
		$("#WanEnable_checkbox").prop("checked", false);
	}
	
	if(operator_name == "COL_ETB")
		$("#wanName").val(select_wan_info.wanName)

	if (operator_name == "TH_AIS" || operator_name == "MY_TM" || gDevice_type != 1) {

		setCheckbox("WanVlan_Enable", select_wan_info.VLANEnable);
		if(operator_name == "MY_TM")
		{
			$("#VLAN_Setting").show();
			$("#WanVlanID_text").val(select_wan_info.vlanid);
		if (select_wan_info.VLANEnable == 1) {
				$("#WanVlanID_text").attr("disabled", false);
			}else{
				$("#WanVlanID_text").attr("disabled", true);
			}
		}else{
			if (select_wan_info.VLANEnable == 1) {
			$("#VLAN_Setting").show();
			$("#WanVlanID_text").val(select_wan_info.vlanid);

		} else {	
			$("#VLAN_Setting").hide();
			}
		}
	}else if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO") {
		if (gPon_mode == 1)//GPON
		{
			setCheckbox("WanVlan_Enable", '1');
		}
		else
		{
			setCheckbox("WanVlan_Enable", select_wan_info.VLANEnable);
		}
			
		if (select_wan_info.VLANEnable == 1) {
			$("#WanVlanID_text").val(select_wan_info.vlanid);

		} else {
			$("#VLAN_Setting").hide();
			$("#WanVlanID_text").val('');
		}
		
	} else {

		if (select_wan_info.vlanid == '0') {
			if(operator_name == "FTTR_MAIN_SFU_COMMON" )
				$("#WanVlanID_text").val('0');
			else
				$("#WanVlanID_text").val('');
		}
		else {
			$("#WanVlanID_text").val(select_wan_info.vlanid);
		}
	}

	$("#Wan_802_1_P_select").val(select_wan_info.p8021);
	if (operator_name == "ECU_CNT") {
		if (select_wan_info.NATEnabled != 0) {
			$("#nat_select").val(select_wan_info.NATType);
		} else {
			$("#nat_select").val(select_wan_info.NATEnabled);
		}
	} else {
		$("#nat_select").val(select_wan_info.NATEnabled);
	}


	var bindlist = select_wan_info.LanInterface;
	//fiberlog('bindlist is ' + bindlist);
	unCheckAllBindPorts();
	if (bindlist != '') {
		var bindlist_array = bindlist.split(',');
		for (var i = 0; i < bindlist_array.length; i++) {
			var singlebind = bindlist_array[i];
			//fiberlog('singlebind is ' + singlebind);
			if (singlebind.indexOf(bindListLanHead) >= 0) {
				var singleport = singlebind.split('.')[2]; //dev.eth.1-4
				var elementIndex = singleport - 1;
				$("input[name='portbind']:eq(" + elementIndex + ")").prop("checked", true);
			}
			if (singlebind.indexOf(bindListWifiHead) >= 0) {
				var singleport = singlebind.split('.')[2]; //dev.wla.1-4
				if (main_wifi_index_5g == 9) {
					if (singleport > 8) {
						var elementIndex = singleport - 5;
					} else {
						var elementIndex = singleport - 1;
					}
					$("input[name='portbind']").each(function(i) {
						if ($(this).val() == elementIndex) {
							$(this).prop("checked", true);
						}
					});
				} else {
					var elementIndex = singleport - 1;
					$("input[name='portbind']").each(function(i) {
						if ($(this).val() == elementIndex) {
							$(this).prop("checked", true);
						}
					});
				}

			}
		}
	}



	$("#wan_connect_mode_select").val(select_wan_info.AddressingType);

	// IPv4信息
	if (operator_name == "ALGERIA_TELECOM" || operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") {
		$("#wan_dnsoverride_select").val(select_wan_info.DNSOverrideEnable);
		if ($("#wan_dnsoverride_select").val() == "1") {
			$("#WanPri_DNS_text").attr("disabled", "");
			$("#WanSec_DNS_text").attr("disabled", "");
		} else {
			$("#WanPri_DNS_text").attr("disabled", "disabled");
			$("#WanSec_DNS_text").attr("disabled", "disabled");
		}
	}

	$("#WanIPv4Address_text").val(select_wan_info.ExternalIPAddress);
	if (select_wan_info.AddressingType == addressTypeArray[2]) {
		if ($("#WanIPv4Address_text").val() != "" && $("#WanIPv4Address_text").val() != "0.0.0.0") {
			$("#WanSubmask_text").val("255.255.255.255");
		} else {
			$("#WanSubmask_text").val("");
		}
		$("#WanGateway_text").val(select_wan_info.RemoteIPAddress);
	} else {
		$("#WanSubmask_text").val(select_wan_info.SubnetMask);
		$("#WanGateway_text").val(select_wan_info.DefaultGateway);
	}

	var dns = select_wan_info.DNSServers;
	if (dns.indexOf(',') >= 0) {
		$("#WanPri_DNS_text").val(dns.split(',')[0]);
		$("#WanSec_DNS_text").val(dns.split(',')[1]);
	}
	else {
		$("#WanPri_DNS_text").val(dns);
		$("#WanSec_DNS_text").val('');
	}
	if (isValidIpAddress($("#WanIPv4Address_text").val()) == false) {
		$("#WanIPv4Address_text").val("");
	}
	if (isValidIpAddress($("#WanSubmask_text").val()) == false) {
		$("#WanSubmask_text").val("");
	}
	if (isValidIpAddress($("#WanGateway_text").val()) == false) {
		$("#WanGateway_text").val("");
	}
	if (isValidIpAddress($("#WanPri_DNS_text").val()) == false) {
		$("#WanPri_DNS_text").val("");
	}
	if (isValidIpAddress($("#WanSec_DNS_text").val()) == false) {
		$("#WanSec_DNS_text").val("");
	}

	if (select_wan_info.AddressingType != addressTypeArray[1]) {
		if (select_wan_info.option60_enable == 1) {
			$("#option60_text").val(select_wan_info.option60_value);
		}
		else {
			$("#option60_text").val("");
		}
	}

	if (select_wan_info.AddressingType == addressTypeArray[2]) {

		//填充pppoe信息
		if (operator_name == "EG_TELECOM") {
			$("#WanUserName_text").val(select_wan_info.Username.split("@")[0]);
		} else {
			$("#WanUserName_text").val(select_wan_info.Username);
		}

		//if(operator_name == "ALGERIA_TELECOM"){
		//	ppp_password_encode = select_wan_info.ppp_password_encode;
		//	$("#POED").val(ppp_password_encode);
		//}
		//else{	
			$("#POED").val(fhdecrypt(select_wan_info.Password));
		//}
		
		$("#PPPoeServiceName_text").val(select_wan_info.PPPoEServiceName);
		$("#dialMode_select").val(select_wan_info.ConnectionTrigger);

		if ($("#dialMode_select").val() == 'Manual') {
			$("#dialMode_select_title").css('height', "48px");
		}
		else {
			$("#dialMode_select_title").css('height', "auto");
		}
		$("#idleDisconnectTime_text").val(select_wan_info.IdleDisconnectTime);
		if (select_wan_info.X_FH_AutoConnection == 1) {

			//$("#connect_button").addClass("select_button");
		}
		else if (select_wan_info.X_FH_AutoConnection == 2) {

			//$("#disconnect_button").addClass("select_button");
		}
       // alert(select_wan_info.X_FH_PPPoEStaticEnable)
        if(select_wan_info.X_FH_PPPoEStaticEnable == "0")
        {
            $("#IPv4_Address_PPPOEStatic_Settings").hide();
            $("#IPv4_Address_Static_Settings").show();
            
        }else if(select_wan_info.X_FH_PPPoEStaticEnable == "1"){
            $("#IPv4_Address_PPPOEStatic_Settings").show();
            $("#IPv4_Address_Static_Settings").hide();
        }else{
            $("#IPv4_Address_PPPOEStatic_Settings").hide();
           // $("#IPv4_Address_Static_Settings").hide();
        }
        setSwitchValue("WlanEnable_container", select_wan_info.X_FH_PPPoEStaticEnable);
        $("#WlanEnable_checkbox").val(select_wan_info.X_FH_PPPoEStaticEnable);
        $("#pppoe_static_ip").val(select_wan_info.ExternalIPAddress);
        $("#pppoe_static_mask").val(select_wan_info.X_FH_PPPoEStaticLanNetmask);
        $("#pppoe_static_start_ip").val(select_wan_info.X_FH_PPPoEStaticLanIpStart);
        $("#pppoe_static_end_ip").val(select_wan_info.X_FH_PPPoEStaticLanIpEnd);
		setCheck($("#WanProxyEnable_text"), select_wan_info.pppProxyEnable);
		$("#WanMAXUser_text").val(select_wan_info.pppMAXUser);
		setCheck($("#BROADBUND_ppptobridge"), select_wan_info.pppToBridge);
		if (operator_name == "COL_MILLICOM") {
			setCheck($("#PPPoEPassthroughEnable"), select_wan_info.PassthroughEnable);
		}
	}
	else {
		clearPPPoEInfo();
	}

	// IPv6信息
	//智利GTD版本增加IPv6 Rapid Commit功能，仅路由模式下DHCP和PPPoE下显示，桥接和Static下不显示
	if (operator_name == "CHL_GTD") {
		if (select_wan_info.AddressingType != addressTypeArray[1]) {
			$("#rapidcommit_setting").show();
			$("#rapid_commit_select").val(select_wan_info.IPv6RapidCommitEnable);
		}
		else {
			$("#rapidcommit_setting").hide();
		}
	}
	else {
		$("#rapidcommit_setting").hide();
	}

	if (select_wan_info.IPv6PrefixDelegationEnabled == '1') {
		$("#WanPrefix_checkbox").prop("checked", true);
		$("#WanPrefix_select").val(select_wan_info.IPv6PrefixOrigin);
		if (select_wan_info.IPv6PrefixOrigin == 'Static') {
			$("#WanIPv6Address_Pre_text").val(select_wan_info.IPv6Prefix);
		}
		else {
			$("#WanIPv6Address_Pre_text").val('');

		}
	}
	else {
		$("#WanPrefix_checkbox").prop("checked", false);
		// ipv6PrefixTypeArray is ('PrefixDelegation', 'Static', 'PPPoE', 'None');
		$("#WanIPv6Address_Pre_text").val(ipv6PrefixTypeArray[0]);
		$("#WanIPv6Address_Pre_text").val('');
		//$("#WanPrefix_select").val('NULL');
	}
	//ipv6DNS配置暂缺
	$("#WanIPv6Address_select").val(select_wan_info.IPv6IPAddressOrigin);
	if (operator_name == "TH_AIS") {
		$("#WanDNSv6_select").val(select_wan_info.IPv6IPAddressOrigin);
	}
	//fiberlog(select_wan_info.IPv6IPAddressOrigin);
	// ipv6AddressArray is ('AutoConfigured', 'DHCPv6', 'Static', 'None')
	if (select_wan_info.IPv6IPAddressOrigin == ipv6AddressArray[2]) {
		$("#WanIPv6Address_text").val(select_wan_info.IPv6IPAddress);
		$("#WanIPv6_Gateway_text").val(select_wan_info.DefaultIPv6Gateway);
		var dns = select_wan_info.IPv6DNSServers;
		if (dns.indexOf(',') >= 0) {
			$("#WanIPv6Pri_DNS_text").val(dns.split(',')[0]);
			$("#WanIPv6Sec_DNS_text").val(dns.split(',')[1]);
		}
		else {
			$("#WanIPv6Pri_DNS_text").val(dns);
			$("#WanIPv6Sec_DNS_text").val('');
		}
	}
	else {
		clearIpv6StaticIpInfo();
	}
	if (select_wan_info.Dslite_Enable == '1') {
		$("#WanDslite_checkbox").prop("checked", true);
		if (select_wan_info.AftrMode == '1') {
			$("#aftr_checkbox").prop("checked", true);
			$("#aftr_text").val(select_wan_info.Aftr);
		}
		else {
			$("#aftr_checkbox").prop("checked", false);
			$("#aftr_text").val('');
		}
	}
	else {
		$("#WanDslite_checkbox").prop("checked", false);
		$("#aftr_checkbox").prop("checked", false);
		$("#aftr_text").val('');
	}

	//tr069 wan不能修改，part 1
	//modify by fengshuo 20191211 SE同意，放开对tr069编辑的控制限制，可以修改tr069
	// if ( isTr69Wan == 1 && tr69_wan_modify_enable == 0 )
	// {
	// 	$("#save_button, #delete_button").attr("disabled", "disabled");
	// 	$("#save_button, #delete_button").addClass("input_button_disabled");
	// 	$("#tr69_wan_hint").show();
	// }
	// else
	// {
	$("#save_button, #delete_button").removeAttr("disabled");
	$("#save_button, #delete_button").removeClass("input_button_disabled");
	$("#tr69_wan_hint").hide();
	//}

}


function clearIpv6StaticIpInfo() {
	$("#WanIPv6Address_text").val('');
	$("#WanIPv6_Gateway_text").val('');
	$("#WanIPv6Pri_DNS_text").val('');
	$("#WanIPv6Sec_DNS_text").val('');
}
function clearIpv4StaticIpInfo() {
	$("#WanIPv4Address_text").val('');
	$("#WanSubmask_text").val('');
	$("#WanGateway_text").val('');
	$("#WanPri_DNS_text").val('');
	$("#WanSec_DNS_text").val('');
}
function clearPPPoEInfo() {
	$("#WanUserName_text").val('');
	$("#POED").val('');
}

function unCheckAllBindPorts() {
	$("input[name='portbind']").prop("checked", false);
}

function initIPorPPPInnerHTML() {
	var pppoeIPv6PrefixTypeHTML = "<option value='PrefixDelegation'>"+"Prefix Delegat".i18n()+"</option>";
	var ipoeConnectModeHTML = "<option value='route'>" + "ipoe_route".i18n() + "</option><option value='bridge'>" + "ipoe_bridge".i18n() + "</option>";
	var pppoeConnectModeHTML = "<option value='route'>" + "pppoe_route".i18n() + "</option><option value='bridge'>" + "pppoe_bridge".i18n() + "</option>";
	var ipoeIPv6AddressHTML = "<option value='AutoConfigured'>"+"AutoConfigured".i18n()+"</option><option value='DHCPv6'>DHCPv6</option><option value='Static' id='WanIPv4Address_select_static'>Static</option>";
	var ipoeConnectModeHTML_true = "<option value='route'>" + "ipoe_route".i18n() + "</option>";
	var ipoeIPv4AddressHTML = "<option value='DHCP'>DHCP</option><option value='Static'>"+"Static".i18n()+"</option>";
	var pppoeIPv6AddressHTML_IDN_TELKOM = "<option value='AutoConfigured'>"+"AutoConfigured".i18n() + "</option><option value='DHCPv6'>DHCPv6</option><option value='None'>"+"None".i18n()+"</option>";
	var ipoeIPv6PrefixTypeHTML = "<option value='PrefixDelegation'>"+"Prefix Delegat".i18n()+"</option><option value='Static'>"+"Static".i18n()+"</option><option value='None'>"+"None".i18n()+"</option>";
	var ipoeIPv6AddressHTML_IDN_TELKOM = "<option value='AutoConfigured'>AutoConfigured</option><option value='DHCPv6'>DHCPv6</option><option value='NONE'>NONE</option>";
	var pppoeIPv4AddressHTML = "<option value='PPPOE'>PPPoE</option>";
	if ($("#WanAddress_select").val() == "IPoE") {
		$("#WanPrefix_select").html(ipoeIPv6PrefixTypeHTML);
		$("#wan_connect_mode_select").html(ipoeIPv4AddressHTML);
		if (operator_name == "TH_TRUE") {
			$("#WanConnectMode_select").html(ipoeConnectModeHTML_true);
		} else {
			$("#WanConnectMode_select").html(ipoeConnectModeHTML);
		}
		if (operator_name == "IDN_TELKOM") {
			$("#WanIPv6Address_select").html(ipoeIPv6AddressHTML_IDN_TELKOM);

		} else {

			$("#WanIPv6Address_select").html(ipoeIPv6AddressHTML);
			if (operator_name == "TH_AIS") {
				$("#WanDNSv6_select").html(ipoeIPv6AddressHTML);
			}
		}
		$("#option60_text").html("");
		if(operator_name == "CHL_ENTEL"){
			$("#WanMTU_text").val('1492'); //IPoE默认MTU为1492
		}else{
			$("#WanMTU_text").val('1500'); //IPoE默认MTU为1500
		}
		
		
	}
	else {
		$("#WanPrefix_select").html(pppoeIPv6PrefixTypeHTML);
		$("#wan_connect_mode_select").html(pppoeIPv4AddressHTML);
		if (operator_name == "TH_TRUE") {
			$("#WanConnectMode_select").html(ipoeConnectModeHTML_true);
		} else {
			$("#WanConnectMode_select").html(pppoeConnectModeHTML);
		}
		if (operator_name == "IDN_TELKOM") {
			$("#WanIPv6Address_select").html(ipoeIPv6AddressHTML_IDN_TELKOM);
		} else {

			$("#WanIPv6Address_select").html(pppoeIPv6AddressHTML_IDN_TELKOM);
			if (operator_name == "TH_AIS") {
				$("#WanDNSv6_select").html(pppoeIPv6AddressHTML_IDN_TELKOM);
			}
		}

		$("#WanMTU_text").val('1492'); //PPPoE默认MTU为1492		
	}
	//$("#WanPrefix_select").attr("disabled",true);
}

function initServiceList() {

	var routeServiceListHTML = "<option value='TR069'>" + "route_option_tr069".i18n() +
		"</option><option value='VOIP'>" + "route_option_voip".i18n() +
		"</option><option value='TR069,VOIP'>" + "route_option_tr069_voip".i18n() +
		"</option><option value='INTERNET'>" + "route_option_internet".i18n() +
		"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
		"</option><option value='VOIP,INTERNET'>" + "route_option_voip_internet".i18n() +
		"</option><option value='TR069,VOIP,INTERNET'>" + "route_option_tr069_voip_internet".i18n() +
		"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
		"</option><option value='IPTV'>" + "route_option_iptv".i18n() +
		"</option><option value='OTHER'>" + "route_option_other".i18n() + "</option>";//路由模式是否需要其它？
        if(operator_name != "MY_TM"){
            var bridgeServiceListHTML = "<option value='INTERNET'>" + "bridge_option_internet".i18n() + "</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
                "</option><option value='OTHER'>" + "bridge_option_other".i18n() + "</option>";
        }else{
            var bridgeServiceListHTML = "<option value='INTERNET'>" + "bridge_option_internet".i18n() + "</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
                "</option><option value='OTHER'>" + "bridge_option_other".i18n() + 
                "</option><option value='IPTV'>" + "route_option_iptv".i18n() +
				"</option><option value='VOIP'>" + "route_option_voip".i18n() +
				"</option>"; 
        }
	if (operator_name == "TH_3BB") {
		//3BB需求，MULTICAST_IPTV只有在bridge下使用，VOIP可以出现在路由、桥接模式下。
		routeServiceListHTML = "<option value='INTERNET'>" + "route_option_internet".i18n() +
			"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
			"</option><option value='VOIP'>" + "route_option_voip".i18n() +
			"</option><option value='MULTICAST_IPTV'>" + "route_option_multicast_iptv".i18n() +
			"</option><option value='UNICAST_IPTV'>" + "route_option_unicast_iptv".i18n() +
			"</option><option value='OTHER'>" + "route_option_other".i18n() + "</option>";

		bridgeServiceListHTML = "<option value='INTERNET'>" + "bridge_option_internet".i18n() +
			"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
			"</option><option value='VOIP'>" + "route_option_voip".i18n() +
			"</option><option value='MULTICAST_IPTV'>" + "route_option_multicast_iptv".i18n() +
			"</option><option value='UNICAST_IPTV'>" + "route_option_unicast_iptv".i18n() +
			"</option><option value='OTHER'>" + "bridge_option_other".i18n() + "</option>";
	} else if (operator_name == "IDN_TELKOM") {
		var routeServiceListHTML = "<option value='TR069'>" + "route_option_tr069".i18n() +
			"</option><option value='VOIP'>" + "route_option_voip".i18n() +
			"</option><option value='TR069,VOIP'>" + "route_option_tr069_voip".i18n() +
			"</option><option value='INTERNET'>" + "route_option_internet".i18n() +
			"</option><option value='RADIUS'>" + "route_option_radius".i18n() +
			"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
			"</option><option value='VOIP,INTERNET'>" + "route_option_voip_internet".i18n() +
			"</option><option value='TR069,VOIP,INTERNET'>" + "route_option_tr069_voip_internet".i18n() +
			"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
			"</option><option value='IPTV'>" + "route_option_iptv".i18n() +
			"</option><option value='OTHER'>" + "route_option_other".i18n() + "</option>";//路由模式是否需要其它？
		var bridgeServiceListHTML = "</option><option value='RADIUS'>" + "route_option_radius".i18n() +
			"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
			"</option><option value='OTHER'>" + "bridge_option_other".i18n() + "</option>";
	} else if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP" || operator_name == "TUR_TURKSAT" || operator_name == "PAK_PTCL") {
		var routeServiceListHTML = "<option value='TR069'>" + "route_option_tr069".i18n() +
			"</option><option value='VOIP'>" + "route_option_voip".i18n() +
			"</option><option value='TR069,VOIP'>" + "route_option_tr069_voip".i18n() +
			"</option><option value='INTERNET'>" + "route_option_internet".i18n() +
			"</option><option value='RADIUS'>" + "route_option_radius".i18n() +
			"</option><option value='RADIUS,INTERNET'>" + "route_option_radius_internet".i18n() +
			"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
			"</option><option value='VOIP,INTERNET'>" + "route_option_voip_internet".i18n() +
			"</option><option value='TR069,VOIP,INTERNET'>" + "route_option_tr069_voip_internet".i18n() +
			"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
			"</option><option value='IPTV'>" + "route_option_iptv".i18n() +
			"</option><option value='OTHER'>" + "route_option_other".i18n() + "</option>";//路由模式是否需要其它？
		var bridgeServiceListHTML = "<option value='INTERNET'>" + "bridge_option_internet".i18n() +
			"</option><option value='RADIUS'>" + "route_option_radius".i18n() +
			"</option><option value='RADIUS,INTERNET'>" + "route_option_radius_internet".i18n() +
			"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
			"</option><option value='OTHER'>" + "bridge_option_other".i18n() + "</option>";
	} else if (operator_name == "TH_TRUE") {
		var bridgeServiceListHTML = "<option value='INTERNET'>" + "bridge_option_internet".i18n() +
			"</option><option value='RADIUS'>" + "route_option_radius".i18n() +
			"</option><option value='RADIUS,INTERNET'>" + "route_option_radius_internet".i18n() +
			"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
			"</option><option value='OTHER'>" + "bridge_option_other".i18n() + "</option>";
	} else if(operator_name == "PRY_NUCLEO"){
		var routeServiceListHTML = "<option value='TR069'>" + "route_option_tr069".i18n() +
		"</option><option value='VOIP'>" + "route_option_voip".i18n() +
		"</option><option value='TR069,VOIP'>" + "route_option_tr069_voip".i18n() +
		"</option><option value='INTERNET'>" + "route_option_internet".i18n() +
		"</option><option value='TR069,INTERNET'>" + "route_option_tr069_internet".i18n() +
		"</option><option value='VOIP,INTERNET'>" + "route_option_voip_internet".i18n() +
		"</option><option value='TR069,VOIP,INTERNET'>" + "route_option_tr069_voip_internet".i18n() +
		"</option><option value='TR069,IPTV,INTERNET'>" + "route_option_tr069_iptv_internet".i18n() +
		"</option><option value='MULTICAST'>" + "route_option_multicast".i18n() +
		"</option><option value='IPTV'>" + "route_option_iptv".i18n() +
		"</option><option value='OTHER'>" + "route_option_other".i18n() + "</option>";//路由模式是否需要其它？
	}


	if ($("#WanConnectMode_select").val() == "route") {
		$("#WanServiceList_select").html(routeServiceListHTML);
		$("#nat_setting").show();
		if (operator_name == "TH_AIS") {
			$("#div_nat_loopback_enable").show();
		}
		$("#dns_relay_setting").show();
		$("#mtu_setting").show();
		$("#WanIP_Mode").show();
		$("#wan_connect_mode").show();
		$("#dhcp_list_title").show();
		if(gNewUiFlag)
			$("#line").show();
		$("#wan_address").show();
		if ($("#WanAddress_select").val() == "IPoE") {
			if(operator_name == "CHL_ENTEL"){
				$("#WanMTU_text").val('1492');
			}else{
				$("#WanMTU_text").val('1500');
			}	
		}
		else {
			$("#WanMTU_text").val('1492');
		}
	}
	else//桥接模式下的页面显示
	{
		if (operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") {
			$("#wan_dns_override").hide();
		}
		$("#WanServiceList_select").html(bridgeServiceListHTML);
		$("#nat_setting").hide();
		if (operator_name == "TH_AIS") {
			$("#div_nat_loopback_enable").hide();
		}

		$("#dns_relay_setting").hide();
		$("#mtu_setting").hide();
		if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP") {
			$("#WanIP_Mode").show();
		} else {
			$("#WanIP_Mode").hide();
		}
		$("#wan_connect_mode").hide();
		$("#dhcp_list_title").hide();
		if(gNewUiFlag)
			$("#line").hide();
		$("#wan_address").hide();
		$("#WanMTU_text").val('1500');
	}
	document.getElementById('PROXY_Setting').style.display = 'none';
	document.getElementById('pppToBridgeId').style.display = 'none';
}

function change_service_list(serviceList_temp, connectionType_temp) {//针对泰国3BB设置，在切换 connection_tyoe时，可以保留servicelist的值，如果vegetable值在将要切换的列表中，则赋值。否则赋值为INTERNET
	if (operator_name == 'TH_3BB') {
		if (connectionType_temp == 'route' && serviceList_temp.indexOf(service_modes_new_array)) {//切换到路由时，如果serviceList_temp在路由序列中
			$("#WanServiceList_select").val(serviceList_temp);
		}
		else if (connectionType_temp == 'bridge' && serviceList_temp.indexOf(service_bridge_array)) {//切换到桥接时，如果serviceList_temp在桥接序列中
			$("#WanServiceList_select").val(serviceList_temp);
		}
		else {
			$("#WanServiceList_select").val('INTERNET');
		}
	}
}

function secServiceList() {
	var serviceList = $("#WanServiceList_select").val();

	document.getElementById('PROXY_Setting').style.display = 'none';
	if (operator_name == "TH_3BB") {//泰国3BB定制需求，选择MULTICAST_IPTV时，只能选择桥接
		if (serviceList == "MULTICAST_IPTV") {
			$("#WanConnectMode_select").val("bridge");
			$("#WanConnectMode_select").attr("disabled", true);
		}//泰国3BB定制需求，选择TR069,INTERNET时，只能选择路由
		else {
			$("#WanConnectMode_select").removeAttr("disabled");
		}
	}
	if (operator_name == "IDN_TELKOM") {//印尼电信定制需求，选择INTERNET时，只能选择路由
		if (serviceList == "INTERNET"
			|| serviceList == "TR069,INTERNET"
			|| serviceList == "TR069,VOIP,INTERNET"
			|| serviceList == "VOIP,INTERNET") {
			$("#WanConnectMode_select").val("route");
			$("#WanConnectMode_select").attr("disabled", true);
		}
		/*else{
			$("#WanConnectMode_select").removeAttr("disabled");
		}*/
	}
}

function initConnectName() {
	//fiberlog('got ' + all_wan_info.wan.length + ' wan');
	var wan_num = 0;
	var dynamicHtml = '';
	if (all_wan_info.show_wan) {
		selectwan = all_wan_info.show_wan;
	}

	if (all_wan_info != '' && all_wan_info.wan) {
		wan_num = all_wan_info.wan.length;
	}
	if (wan_num > 0) {
		for (i = 0; i < wan_num; i++) {
			var single_wan = all_wan_info.wan[i];
			dynamicHtml += '<option value="' + single_wan.wan_index + '_' + single_wan.wan_session_index + '_' + single_wan.iporppp + '_' + single_wan.Name + '">' + single_wan.Name + '</option>';
			if (selectwan == '') {
				selectwan = single_wan.wan_index + '_' + single_wan.wan_session_index;
			}

			//兼容AddressingType为PPPoE和PPPOE的情况
			if (single_wan.AddressingType.toUpperCase() == addressTypeArray[2].toUpperCase()) {
				all_wan_info.wan[i].AddressingType = addressTypeArray[2];
			}
		}
	}
	dynamicHtml += '<option value="0">' + "add_new_wan_connection".i18n() + '</font></option>';
	if (selectwan == '') {
		selectwan = '0';
	}
	// fiberlog('selectwan is ' + selectwan);

	$("#WanConnectName_select").html(dynamicHtml);
	$("#WanConnectName_select").val(selectwan);
}

function initIpProtocol() {
	if (all_wan_info.ip_protocol_version == 1) //ipv4
	{
		$("#WanIP_Mode_select").html(ipv4ModeHTML);
	}
	else if (all_wan_info.ip_protocol_version == 2) //ipv6
	{
		$("#WanIP_Mode_select").html(ipv6ModeHTML);
	}
	else {
		$("#WanIP_Mode_select").html(ipv4AndIPv6ModeHTML);//v4&v6
	}
}

function extraValidCheck() {
	var wan_index = 0;
	var wan_session_index = 0;
	var wan_num;
	var str = $("#WanConnectName_select")[0].value;
	if ($("#WanConnectName_select").val() != '0') //not new
	{
		wan_index = $("#WanConnectName_select").val().split(splitchar)[0];
		wan_session_index = $("#WanConnectName_select").val().split(splitchar)[1];
	}


	if (all_wan_info != '' && all_wan_info.wan) {
		wan_num = all_wan_info.wan.length;
	}
	if (wan_num > 0) {
		var bindList = calcBindList();
		var routeFlag = 1;
		for (var wan_num_i = 0; wan_num_i < wan_num; wan_num_i++) {
			var single_wan = all_wan_info.wan[wan_num_i];
			var saveBindListAarry = bindList.split(',');
			var route_bridge;
			if (single_wan.ConnectionType.split("_")[1].toLocaleLowerCase() == "routed") {
				route_bridge = "route";
			} else if (single_wan.ConnectionType.split("_")[1].toLocaleLowerCase() == "bridged") {
				route_bridge = "bridge";
			}
			if (!(single_wan.wan_index == wan_index && single_wan.wan_session_index == wan_session_index)) {

				//检查是否有重复的vlan pldt定制化需求：放开多条wan连接之EE间不允许使用相同vlan的限制(不同wan指的是路由和桥接)
				if (operator_name == "PH_PLDT" || operator_name == "TH_AIS" || operator_name == "MY_TM" || operator_name == "CHL_MP" && garea_code == "PRT_LIGAT") {
					if (single_wan.vlanid == $("#WanVlanID_text").val() && single_wan.vlanid > 0 &&
						route_bridge == $("#WanConnectMode_select").val()) {

						/*TH_AIS version INTERNET related route wan not check vlan duplicate*/
						if (!((operator_name == "TH_AIS" || operator_name == "MY_TM") && $("#WanConnectMode_select").val() == "route"
							&& single_wan.ServiceList.indexOf("INTERNET") >= 0 && $("#WanServiceList_select").val().indexOf("INTERNET") >= 0)) {
							alert("duplicate_vlan_alert1".i18n() + $("#WanVlanID_text").val() + "duplicate_vlan_alert2".i18n());
							return false;
						}
					}
				} else {
					if (single_wan.vlanid == $("#WanVlanID_text").val() && single_wan.vlanid > 0) {
						if(gNewUiFlag)
							myAlert('Tip',''+"duplicate_vlan_alert1".i18n() + $("#WanVlanID_text").val() + "duplicate_vlan_alert2".i18n()+'',function(r){});
						else
						alert("duplicate_vlan_alert1".i18n() + $("#WanVlanID_text").val() + "duplicate_vlan_alert2".i18n());
						return false;
					}
				}

				// 新增判断方法，利用下拉框的值来判断当前是否选中了voip或是tr069的值
				if ((($("#WanServiceList_select").val() == "TR069") || ($("#WanServiceList_select").val() == "TR069,VOIP") || ($("#WanServiceList_select").val() == "TR069,INTERNET") || ($("#WanServiceList_select").val() == "TR069,VOIP,INTERNET"))
					&& single_wan.ServiceList.indexOf("TR069") >= 0) {
					if(gNewUiFlag)
						myAlert('Tip',''+"one_tr069_alert".i18n() +'',function(){});
					else
					alert("one_tr069_alert".i18n());
					return false;
				}

				//单条语音限制
				if ((($("#WanServiceList_select").val() == "VOIP") || ($("#WanServiceList_select").val() == "TR069,VOIP") || ($("#WanServiceList_select").val() == "VOIP,INTERNET") || ($("#WanServiceList_select").val() == "TR069,VOIP,INTERNET"))
					&& single_wan.ServiceList.indexOf("VOIP") >= 0) {
						if(gNewUiFlag)
							myAlert('Tip',''+"one_voice_alert".i18n() +'',function(){});
						else
					alert("one_voice_alert".i18n());
					return false;
				}

				if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO")//only allow exist one untag wan
				{
					if ((getCheckbox("WanVlan_Enable") == "0") && single_wan.VLANEnable == 0) {
						alert("one_untag_wan_alert".i18n());
						return false;
					}
				}

				//墨西哥TP版本允许同一个端口同时绑定一条IPTV类型和INTERNET类型的WAN连接
				var service_type_1 = $("#WanServiceList_select").val();
				var connect_mode_1 = $("#WanConnectMode_select").val();
				var service_type_2 = single_wan.ServiceList;
				var connect_mode_2 = single_wan.ConnectionType;
				if ((operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP" || operator_name == "CHL_ENTEL" || operator_name == "PAK_PTCL") && connect_mode_1 == "route" && connect_mode_2.indexOf("Routed") > -1 && ((service_type_1.indexOf("INTERNET") > -1 && service_type_2 == "IPTV") || (service_type_1 == "IPTV" && service_type_2.indexOf("INTERNET") > -1))) {
					continue;
				}

				//端口不能重复绑定
				if ($("#port_div").is(":visible") && single_wan.LanInterface != '' && bindList != '') {
					var wanBindListAarry = single_wan.LanInterface.split(',');
					for (var i = 0; i <= saveBindListAarry.length; i++) {
						if (saveBindListAarry[i] != undefined && saveBindListAarry[i] != '') {
							for (var j = 0; j <= wanBindListAarry.length; j++) {
								if (wanBindListAarry[j] != undefined && wanBindListAarry[j] != '') {
									if (saveBindListAarry[i] == wanBindListAarry[j]) {
										if(gNewUiFlag)
											myAlert('Tip',''+"repeated_binding_port_alert1".i18n() + single_wan.Name + "repeated_binding_port_alert2".i18n()+'');
										else
											alert("repeated_binding_port_alert1".i18n() + single_wan.Name + "repeated_binding_port_alert2".i18n());
										return false;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	if ($("#WanIP_Mode_select").val() != "1" && $("#WanPrefix_checkbox").prop("checked") == false && $("#WanIPv6Address_select").val() == "NONE") {
		if(gNewUiFlag){
			myAlert('Tip',''+"ipv6_pd_alert".i18n() +'');
		}else{
		alert("ipv6_pd_alert".i18n());
		}
	}
	return true;
}
function check_connection(value) {
	if (value == "Connect") {
		connect_flag = "true";
		$("#connect_button").addClass("select_button");
		$("#disconnect_button").removeClass("select_button");
	}
	else if (value == "Disconnect") {
		connect_flag = "false";
		$("#disconnect_button").addClass("select_button");
		$("#connect_button").removeClass("select_button");
	}
	else {
		connect_flag = "";
	}
	saveApply();
}

function maxRules() {
	var internetWanCount = 0;

	// 最多8条wan
	if (addflag == "add") {
		if (all_wan_info.wan.length >= "8") {
			if(gNewUiFlag){
				myAlert('Tip','You can configure 8 WAN connections at most !');
			}else{
				alert("at_most_8_WAN_connections".i18n());
			}
			return false;
		}
	}

	// 除TR069 voip相关路由wan外，最大支持5条其他路由wan
	if(operator_name == "BZ_INTELBRAS")
	{
		var route_wan_count;
		var count_wan_route = 0;
		route_wan_count = 5;
		for (var i = 0; i < all_wan_info.wan.length; i++) {
			
			/*TR069 VOIP相关路由WAN不计入*/
			if (all_wan_info.wan[i].ConnectionType.indexOf("Routed") > -1
				&& all_wan_info.wan[i].ServiceList.indexOf("TR069") == -1 
				&& all_wan_info.wan[i].ServiceList.indexOf("VOIP") == -1) {
				count_wan_route++;
				if (count_wan_route >= route_wan_count && (selectwantype.indexOf("Routed") == -1 &&  selectwantype.indexOf("Mix") == -1)) {
					if ($("#WanConnectMode_select").val() == "route" && $("#WanServiceList_select").val().indexOf("TR069") == -1
						&& $("#WanServiceList_select").val().indexOf("VOIP") == -1) {
						if(gNewUiFlag){
							myAlert('Tip','A maximum of 5 Internet Route WAN connections can be configured!');
						}else{
							alert("at_most_5_Route_WAN_connections".i18n());
						}
						return false;
					}
				}
			}
		}
	}
	else
	{
		var internet_wan_count;
		if(operator_name == "MEX_MEGA")
		{
			internet_wan_count = 8;
		}
		else
		{
			internet_wan_count = 4;
		}
		for (var i = 0; i < all_wan_info.wan.length; i++) {
			if (all_wan_info.wan[i].ConnectionType.indexOf("Routed") > -1) {
				internetWanCount++;
				if (internetWanCount >= internet_wan_count && (selectwantype.indexOf("Routed") == -1 &&  selectwantype.indexOf("Mix") == -1)) {
					if ($("#WanConnectMode_select").val() == "route") {
						if(gNewUiFlag){
								if(operator_name == "MEX_MEGA"){
									myAlert('Tip','You can configure 8 Route WAN connections at most!');
								}
								else{
									myAlert('Tip','You can configure 4 Route WAN connections at most!');
								}
							}else{
								if(operator_name == "MEX_MEGA"){
									alert("at_most_8_Route_WAN_connections".i18n());
								}
								else{
									alert("at_most_4_Route_WAN_connections".i18n());
								}
							}
						return false;
					}
				}
			}
		}
	}
	
	return true;
}

//下发postdata 数据
function saveApply() {
	if (!maxRules()) {
		return false;
	}

	if (!$("#broadband_form").valid()) {
		if(gNewUiFlag)
			myAlert('Tip',''+"invalid_value_alert".i18n()+'');
		else
		alert("invalid_value_alert".i18n());
		return false;
	}
	if (!extraValidCheck()) {
		return;
	}

	var postdata = new Object();
	var action = '';
	var wanAddress = $("#WanAddress_select").val();
	var serviceList = "";
	var connectionMode = $("#WanConnectMode_select").val();


	if (addflag == "add") {
		action = "wan_add_new";
	}
	else {
		action = "wan_modify";
		var wan_num = $("#WanConnectName_select").val();
		postdata.wan_index = wan_num.split("_")[0];
		postdata.wan_session_index = wan_num.split("_")[1];
		postdata.wan_iporppp_old = getSingleWanInfo($("#WanConnectName_select").val()).iporppp;

		postdata.wan_name = selectwan;
	}
	if ($("#WanAddress_select").val() == "IPoE" && ($("#WanConnectMode_select").val() != "bridge")) {
		postdata.wan_iporppp_new = "1";
	}
	else {
		postdata.wan_iporppp_new = "2";
	}
	if (connect_flag == "true") {
		postdata.X_FH_AutoConnection = 1;
	} else if (connect_flag == "false") {
		postdata.X_FH_AutoConnection = 2;
	}
	if ($("#WanConnectMode_select").val() == connectModeAarry[0] && $("#WanAddress_select").val() == "IPoE") {
		postdata.ConnectionType = "IP_Routed";
	}
	else if ($("#WanConnectMode_select").val() == connectModeAarry[0] && $("#WanAddress_select").val() == "PPPoE") {
		postdata.ConnectionType = "PPPoE_Routed";
	}


	/**&& $("#WanAddress_select").val() == "IPoE" )
	{
		postdata.ConnectionType = "IP_Bridged";
	}		
	else if($("#WanConnectMode_select").val() == connectModeAarry[1] && $("#WanAddress_select").val() == "PPPoE" )
	{**/
	else if ($("#WanConnectMode_select").val() == connectModeAarry[1]) {
		postdata.ConnectionType = "PPPoE_Bridged";
	}



	ServiceList = $("#WanServiceList_select").val();
	postdata.ServiceList = ServiceList;

	if (operator_name == "ARG_CLARO" || operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP" || operator_name == "TH_AIS" || operator_name == "MY_TM" || operator_name == "COL_ETB") {
		if ($("#WanEnable_checkbox").is(":checked")) {
			postdata.Enable = "1";
		} else {
			postdata.Enable = "0";
		}
	}
	if(operator_name == "COL_ETB")
		postdata.wanName = $("#wanName").val();

	postdata.IPMode = $("#WanIP_Mode_select").val();

	postdata.mtu = $("#WanMTU_text").val();
	if (getOperator() == "CU") {
		if ($("#WanVlan_Enable").attr("checked")) {
			postdata.VLANEnabled = 1;
			postdata.vlanid = $("#WanVlanID_text").val();
		}
		else {
			postdata.VLANEnabled = 0;
			postdata.vlanid = 0;
		}
	}
	else if (getOperator() == "CM") {
		if ($("#WanVlan_Enable").attr("checked")) {
			postdata.VLANEnabled = 2;
			postdata.vlanid = $("#WanVlanID_text").val();
		}
		else {
			postdata.VLANEnabled = 0;
			postdata.vlanid = 0;
		}
	}
	else {
		if (operator_name == "TH_AIS" || operator_name == "MY_TM" || operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO" || gDevice_type != 1) {

			postdata.VLANEnable = getCheckbox("WanVlan_Enable");

			if (getCheckbox("WanVlan_Enable") == "1") {

				postdata.vlanid = $("#WanVlanID_text").val();

			} else {
				/*if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO" )
				{
					if (($("#WanServiceList_select").val() == 'INTERNET' || $("#WanServiceList_select").val() == 'TR069,INTERNET' || $("#WanServiceList_select").val() == 'VOIP,INTERNET' || $("#WanServiceList_select").val() == 'TR069,VOIP,INTERNET'))
					{
						postdata.vlanid = 0;
					}
					else
					{
						postdata.VLANEnable = 1;
						postdata.vlanid = $("#WanVlanID_text").val();
					}	
				}
				else
				{
					postdata.vlanid = 0;
				}*/
				postdata.vlanid = 0;
			}

		}
		else if(operator_name == "FTTR_MAIN_SFU_COMMON"){
			postdata.vlanid = $("#WanVlanID_text").val();
			if(postdata.vlanid == "0")
				postdata.VLANEnable = "0"
			else
				postdata.VLANEnable = "1"
		}
		else {
			postdata.VLANEnable = "1";
			postdata.vlanid = $("#WanVlanID_text").val();
		}

	}
	postdata.p8021 = $("#Wan_802_1_P_select").val();

	postdata.LanInterface = calcBindList();

	if ($("#WanAddress_select").val() == "IPoE") {
		if ($("#WanIP_Mode_select").val() == v4V6ModeAarry[1]) //ipv6
		{
			if ($("#WanIPv6Address_select").val() == ipv6AddressArray[2]) //Static
			{
				postdata.AddressingType = addressTypeArray[1]; //Static
			}
			else {
				postdata.AddressingType = addressTypeArray[0]; //DHCP
			}
		}
		else //v4&v6 ipv4 以ipv4的为准
		{
			postdata.AddressingType = $("#wan_connect_mode_select").val();

		}
		if (($("#wan_connect_mode_select").val() == "DHCP") && ($("#WanIP_Mode_select").val() != v4V6ModeAarry[1])) {
			var option60_value = '';
			option60_value = $("#option60_text").val();
			if (!option60_value.match(/^[ ]*$/))//非空，包括空格
			{
				postdata.option60_enable = 1;
				var str_check = option60_value;

				var arr = str_check.split(',');
				var len = arr.length;
				for (var i = 0; i < len - 1; i++) {
					if (arr[i].match(/^[ ]*$/)) {
						alert("option60_alert".i18n());//报错
						return;
					}
				}
				postdata.option60_value = option60_value;
			}
			else {
				postdata.option60_enable = 0;
				postdata.option60_value = "";
			}

		}

	}
	else {
		postdata.AddressingType = addressTypeArray[2]; //PPPoE
	}

	//add by fengshuo 20191220 se需求确认 ，只有在wanmode 选择为 桥接的时候， wanmode 设置为 空，以供status页面调用数据。
	if ($("#WanConnectMode_select").val() == "bridge") {
		postdata.AddressingType = "";
	}
    
    if (operator_name == "MY_TM" ){
        if($("input[name='WlanEnable_checkbox']").val() == "0")
        {
            postdata.pppoeStaticEnable = "0";
        }else if($("input[name='WlanEnable_checkbox']").val() == "1"){
            postdata.pppoeStaticEnable = "1";
            postdata.pppoeStaticIP =  $("#pppoe_static_ip").val();
            postdata.pppoeSubnetmask =  $("#pppoe_static_mask").val();
            postdata.pppoeStaticStartIP =  $("#pppoe_static_start_ip").val();
            postdata.pppoeStaticEndIP =  $("#pppoe_static_end_ip").val();
        }
        
    }

	if (operator_name == "ALGERIA_TELECOM" || operator_name == "ECU_CNT" || operator_name == "PLE_PALTEL" || operator_name == "BZ_ALGAR") {
		if ($("#wan_connect_mode_select").val() == "DHCP" || $("#wan_connect_mode_select").val() == "PPPOE") {

			postdata.DnsOverrideEnable = $("#wan_dnsoverride_select").val();
			if ($("#wan_dnsoverride_select").val() == "1") {
				var priDns = $("#WanPri_DNS_text").val();
				var secDns = $("#WanSec_DNS_text").val();

				if (secDns != "") {
					postdata.DNSOverrideServer = priDns + "," + secDns;
				} else {
					postdata.DNSOverrideServer = priDns;
				}
			}
		}
	}

	if ($("#wan_connect_mode_select").val() == "Static") {
		postdata.ExternalIPAddress = $("#WanIPv4Address_text").val();
		postdata.SubnetMask = $("#WanSubmask_text").val();
		postdata.DefaultGateway = $("#WanGateway_text").val();

		if ($("#WanSec_DNS_text").val() == '') {
			postdata.DNSServers = $("#WanPri_DNS_text").val();
		}
		else {
			postdata.DNSServers = $("#WanPri_DNS_text").val() + ',' + $("#WanSec_DNS_text").val();
		}
	}

	/**
	if ( $("#IPv4_Address_Static_Settings").is(":visible") )
	{
		postdata.ExternalIPAddress = $("#WanIPv4Address_text").val();
		postdata.SubnetMask = $("#WanSubmask_text").val();
		postdata.DefaultGateway = $("#WanGateway_text").val();
		
		if ( $("#WanSec_DNS_text").val() == '' )
		{
			postdata.DNSServers = $("#WanPri_DNS_text").val();
		}
		else
		{
			postdata.DNSServers = $("#WanPri_DNS_text").val() + ',' + $("#WanSec_DNS_text").val();
		}
	}**/

	if ($("#Address_PPPoE_Setting").is(":visible")) {
		if (operator_name == "EG_TELECOM") {
			postdata.Username = $("#WanUserName_text").val() + "@tedata.net.eg";
		} else {
			postdata.Username = $("#WanUserName_text").val();
		}
		if(operator_name == "BZ_INTELBRAS"){
			if($("#POED").val() == ppp_password_encode){
				postdata.WPd = fhencrypt(ppp_password_encode);
			}else{
				postdata.WPd = fhencrypt($("#POED").val());
			}
		}else{
			postdata.WPd = fhencrypt($("#POED").val());
		}

		if (operator_name == "JOR_UMNIAH") {
			postdata.PPPoEServiceName = $("#PPPoeServiceName_text").val();
		}
		postdata.ConnectionTrigger = $("#dialMode_select").val();
		if ($("#dialMode_select").val() == 'OnDemand') {
			postdata.IdleDisconnectTime = $("#idleDisconnectTime_text").val();
		}
		if (operator_name == "COL_MILLICOM") {
			postdata.PassthroughEnable = $("#PPPoEPassthroughEnable").prop("checked") ? "1" : "0";
		}
	}

	if (wanAddress == 'PPPoE' && connectionMode == 'route' && (serviceList == "INTERNET" || serviceList == "TR069,INTERNET" || serviceList == "VOIP,INTERNET" || serviceList == "TR069,VOIP,INTERNET")) {
		if (document.getElementById('WanProxyEnable_text').checked == true) {
			postdata.pppProxyEnable = "1";
			postdata.pppMAXUser = $("#WanMAXUser_text").val();
		}
		else {
			postdata.pppProxyEnable = "0";
		}
	}
	else {
		postdata.pppProxyEnable = 'NULL';
		postdata.pppMAXUser = 'NULL';
	}
	if (wanAddress == 'PPPoE' && connectionMode == 'route') {
		if (document.getElementById('BROADBUND_ppptobridge').checked == true) {
			postdata.pppToBridge = "1";
		}
		else {
			postdata.pppToBridge = "0";
		}
	}
	else {
		postdata.pppToBridge = 'NULL';
		postdata.pppToBridge = 'NULL';
	}
	if ($("#WanIP_Mode_select").val() == v4V6ModeAarry[1]
		|| $("#WanIP_Mode_select").val() == v4V6ModeAarry[2]) {
		if ($("#WanPrefix_checkbox").attr('checked')) {
			postdata.IPv6PrefixDelegationEnabled = 1;
		}
		else {
			postdata.IPv6PrefixDelegationEnabled = 0;
		}

		postdata.IPv6PrefixOrigin = $("#WanPrefix_select").val();
		if ($("#WanPrefix_select").val() == 'Static') {
			postdata.IPv6Prefix = $("#WanIPv6Address_Pre_text").val();
		}

		postdata.IPv6IPAddressOrigin = $("#WanIPv6Address_select").val();

		if ($("#WanIPv6Address_select").val() == ipv6AddressArray[2]) //Static
		{
			postdata.IPv6IPAddress = $("#WanIPv6Address_text").val();
			postdata.DefaultIPv6Gateway = $("#WanIPv6_Gateway_text").val();
			if ($("#WanIPv6Sec_DNS_text").val() == '') {
				postdata.IPv6DNSServers = $("#WanIPv6Pri_DNS_text").val();
			}
			else {
				postdata.IPv6DNSServers = $("#WanIPv6Pri_DNS_text").val() + ',' + $("#WanIPv6Sec_DNS_text").val();
			}
		}
	}

	if ($("#IPv6_Dslite_Settingstotal").is(":visible")) {
		if ($("#WanDslite_checkbox").attr('checked')) {
			postdata.Dslite_Enable = 1;
			if ($("#aftr_checkbox").attr('checked')) {
				postdata.AftrMode = 1;
				postdata.Aftr = $("#aftr_text").val();
			}
			else {
				postdata.AftrMode = 0;
			}
		}
		else {
			postdata.Dslite_Enable = 0;
		}
	}
	else {
		postdata.Dslite_Enable = 0;
	}

	/*var natFlag;
	if(operator_name == "BZ_INTELBRAS"){
		if($("#WanServiceList_select").val() == 'INTERNET' || $("#WanServiceList_select").val() == 'TR069,INTERNET' || $("#WanServiceList_select").val() == 'VOIP,INTERNET' || $("#WanServiceList_select").val() == 'TR069,VOIP,INTERNET'){
			natFlag = true
		}else{
			natFlag = false;
		}
	} else{
		natFlag = true
	}*/

	//route ipv4/ipv4v6 internet
	if(($("#WanConnectMode_select").val() == connectModeAarry[0])//route
		&& ($("#WanIP_Mode_select").val() == v4V6ModeAarry[0] || $("#WanIP_Mode_select").val() == v4V6ModeAarry[2])//v4 / v4v6
		//&& ( 4 == (4 & selectListValue) || 8 == selectListValue || selectListValue>=16) )
		&& ($("#nat_select").val() == 1) || $("#nat_select").val() == 3) {
		postdata.NATEnabled = "1";
	}
	else {
		postdata.NATEnabled = "0";
	}

	if(operator_name == "BZ_INTELBRAS")
	{
		if($("#WanServiceList_select").val() == 'INTERNET' || $("#WanServiceList_select").val() == 'TR069,INTERNET' || $("#WanServiceList_select").val() == 'VOIP,INTERNET' || $("#WanServiceList_select").val() == 'TR069,VOIP,INTERNET'
			&& $("#WanConnectMode_select").val() == connectModeAarry[1])//internet bridge
		{
			postdata.NATEnabled = "1";
		}
	} 

	if ((($("#nat_select").val() == 1) || ($("#nat_select").val() == 3)) && (operator_name == "ECU_CNT")) {
		postdata.NATType = $("#nat_select").val();
	}


	//路由模型下IPv6或者IPv4&IPv6，且非静态WAN时，可修改
	if ((operator_name == "CHL_GTD") &&
		($("#WanConnectMode_select").val() == connectModeAarry[0])
		&& ($("#WanIP_Mode_select").val() != v4V6ModeAarry[0])
		&& ($("#WanConnectMode_select").val() != connectModeAarry[1])) {
		if ($("#rapid_commit_select").val() == 1) {
			postdata.IPv6RapidCommitEnable = "1";
		}
		else {
			postdata.IPv6RapidCommitEnable = "0";
		}
	}
	postdata.sessionid = sessionidstr;
	pause();
	if (operator_name == "IDN_TELKOM") {
		return;
	}
	XHR.post(action, postdata, initPage);
	addflag = "edit";
}

function enableProxy() {
	var enable = $("#WanProxyEnable_text").attr('checked');

	if (enable) {
		document.getElementById('PROXY_Set').style.display = '';
	}
	else {
		document.getElementById('PROXY_Set').style.display = 'none';
	}
}

function addfilter() //增加新的wan连接条目
{
	addflag = "add";
	selectwantype = "";
	var addHtml = []; //新增一个占位标记行
	addHtml += '<tr id="add_item">';
	addHtml += '<td align="center">--</td>';
	addHtml += '<td align="center">--</td>';
	addHtml += '<td align="center">--</td>';
	addHtml += '<td align="center">--</td>';
	addHtml += '<td></td>';
	addHtml += '</tr>';


	if ($("#add_item").length == 0)//第一次添加数据时设置默认值
	{
		$("#internet_list").append(addHtml);
		$(".input_text").each(function(i) {
			$(this).val('');
		});
		displayFormHtml("init", "0");
		if(operator_name == "MAR_INWI"){
			$("#add_item").children().css("background-color", "#DEC0DF");
			$("#add_item").siblings().children().css("background-color", "#eef2f6");
			$("#add_item").css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
		}else{
		$("#add_item").children().css("background-color", "#b7e3e3");
		$("#add_item").siblings().children().css("background-color", "#eef2f6");
		$("#add_item").css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
		}
	}

	$("#WanEnable_checkbox").prop("checked", true);
	$("#wanName").val("");

	//保证每次添加新的WAN连接之前，所有端口都是可配的
	if (operator_name == "CHL_ENTEL" || operator_name == "MEX_TP" || operator_name == "ECU_CNT" || operator_name == "BZ_INTELBRAS") {
		XHR.get("get_lanmode_info", null, disableLAN);
	} else {
		$("#Wan_Port_checkbox1").prop("disabled", false);
		$("#Wan_Port_checkbox2").prop("disabled", false);
		$("#Wan_Port_checkbox3").prop("disabled", false);
		$("#Wan_Port_checkbox4").prop("disabled", false);
		$("#Wan_Port_checkbox5").prop("disabled", false);
	}
	$("#Wan_SSID_checkbox1").prop("disabled", false);
	$("#Wan_SSID_checkbox2").prop("disabled", false);
	$("#Wan_SSID_checkbox3").prop("disabled", false);
	$("#Wan_SSID_checkbox4").prop("disabled", false);
	$("#Wan_SSID_checkbox5").prop("disabled", false);
	$("#Wan_SSID_checkbox6").prop("disabled", false);
	$("#Wan_SSID_checkbox7").prop("disabled", false);
	$("#Wan_SSID_checkbox8").prop("disabled", false);
	$("#rapid_commit_select").val("1");
if(gNewUiFlag){
		$("#image").hide()
		if(gNew_Wan_Flag){
			$(".img_select").hide()
			$(".del_wan_icon").hide()
			$(".wan_name_select").removeClass("wan_name_select")
			var dynamicClsListHTML = '';
			dynamicClsListHTML += "<li class='wan_name_select'><span class='img_select'></span>"+"New WAN".i18n()+"</li>";
			$("#wan_rules").append(dynamicClsListHTML);
			gNew_Wan_Flag = false;
		}
		
	}
	if (operator_name == "MY_TM") {
		disable_lan(uplink_type);
	}
	
	if (operator_name == "BZ_INTELBRAS" || operator_name == "BZ_VERO" )
	{
		vlan_enable_switch();
		$("#nat_select").val("1");
		$("#WanPrefix_checkbox").prop("checked", true);
		$("#WanIPv6Address_select").val("AutoConfigured");
	}
}

function wanDelSleep(numberMillis) {
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
		if (now.getTime() > exitTime)
			return;
	}
}


function click_remove() {
	var checkNodes = $(".delselwan");
	var is_checked = false;
	var value_temp;
	var wan_num = $("#WanConnectName_select").val();
	var index = wan_num.split("_")[0];

	IPoEPPPoEArr = [];
	IPoEPPPoEArrIndex = 0;
	if (0 == checkNodes.length) //如果沒有数据，则返回并报错
	{
		alert("no_rules_alert".i18n());
		return;
	}

	for (var i = 0; i < checkNodes.length; i++) {
		if (checkNodes.eq(i).attr("checked") == "checked") {
			is_checked = true;
			IPoEPPPoEArr.push(getSingleWanInfo(checkNodes[i].value).iporppp);
		}
	}

	if (!is_checked) //如果没有选中任何条目
	{
		alert("no_selected_rules_alert".i18n());
		return;
	}

	if (confirm("delete_alert".i18n()) == false) {
		return;
	}
	for (var i = 0; i < checkNodes.length; i++) {
		if (checkNodes.eq(i).attr("checked") == "checked") {
			value_temp = checkNodes[i].value;
			index = value_temp;
			wanDelSleep(300);
			deleteWan(index); //执行删除操作

		}
	}

}
function deleteWan(index) {
	show_shadow();
	var postdata = new Object();
	postdata.wan_index = index.split("_")[0];
	postdata.wan_session_index = index.split("_")[1];
	postdata.wan_iporppp_old = IPoEPPPoEArr[IPoEPPPoEArrIndex];
	IPoEPPPoEArrIndex++;
	selectwan = '';
	postdata.sessionid = sessionidstr;
	if (operator_name == "IDN_TELKOM") {
		return;
	}
	XHR.post("wan_delete", postdata, initPage);

}

function calcBindList() {
	var bindlist = '';
	if ($("#port_div").is(":visible")) {
		for (var i = 0; i < portbind_num; i++) {
			var bindstr = '';
			var portnumber = '';
			if ($("input[name='portbind']:eq(" + i + ")").attr('checked')) {
				if (i < lanportbind_num) {
					portnumber = i + 1;
					bindstr = bindListLanHead + portnumber;
				}
				else {
					if (main_wifi_index_5g == 9) {
						portnumber = $("input[name='portbind']:eq(" + i + ")").attr('value');
						if (portnumber == "4" || portnumber == "5" || portnumber == "6" || portnumber == "7") {
							portnumber = parseInt(portnumber) + 5;
						} else {
							portnumber = parseInt(portnumber) + 1;
						}
						bindstr = bindListWifiHead + portnumber;
					} else {
						portnumber = $("input[name='portbind']:eq(" + i + ")").attr('value');
						portnumber = parseInt(portnumber) + 1;
						bindstr = bindListWifiHead + portnumber;
					}

				}
			}

			if (bindstr != '') {
				if (bindlist == '') {
					bindlist = bindstr;
				}
				else {
					bindlist += ',' + bindstr;
				}
			}
		}
	}

	return bindlist;
}
function disableLAN(getdata) {

	if (getdata && getdata.lan_mode) {
		var lan_mode_info = getdata.lan_mode;
		if(operator_name == "BZ_INTELBRAS")
		{
			lan_port_mode_enable = getdata.lan_mode.lan_port_mode_enable;
		}

		if (lan_mode_info.LanMode_1 == 0) {
			if(operator_name != "BZ_INTELBRAS")
			{
				$("#Wan_Port_checkbox1").attr("disabled", true);
			}
			lan1_bound = 0;

		} else {

			$("#Wan_Port_checkbox1").attr("disabled", false);
			lan1_bound = 1;
		}
		if (lan_mode_info.LanMode_2 == 0) {
			if(operator_name != "BZ_INTELBRAS")
			{
				$("#Wan_Port_checkbox2").attr("disabled", true);
			}
			lan2_bound = 0;

		} else {

			$("#Wan_Port_checkbox2").attr("disabled", false);
			lan2_bound = 1;
		}
		if (lan_mode_info.LanMode_3 == 0) {
			if(operator_name != "BZ_INTELBRAS")
			{
				$("#Wan_Port_checkbox3").attr("disabled", true);
			}
			lan3_bound = 0;

		} else {

			$("#Wan_Port_checkbox3").attr("disabled", false);
			lan3_bound = 1;
		}
		if (lan_mode_info.LanMode_4 == 0) {
			if(operator_name != "BZ_INTELBRAS")
			{
				$("#Wan_Port_checkbox4").attr("disabled", true);
			}
			lan4_bound = 0;

		} else {

			$("#Wan_Port_checkbox4").attr("disabled", false);
			lan4_bound = 1;
		}

	}

}

function disable_lan(uplink_type) {
	if (uplink_type != null && uplink_type)
	{
		console.log("uplink_type: " + uplink_type);
		if (uplink_type == "dev.eth.1") 
		{
			$("#Wan_Port_checkbox1").attr("disabled", true);
		}
		else
		{
			$("#Wan_Port_checkbox1").attr("disabled", false);
		} 
		
		if (uplink_type == "dev.eth.2") 
		{
			$("#Wan_Port_checkbox2").attr("disabled", true);
		}
		else
		{
			$("#Wan_Port_checkbox2").attr("disabled", false);
		} 

		if (uplink_type == "dev.eth.3") 
		{
			$("#Wan_Port_checkbox3").attr("disabled", true);
		}
		else
		{
			$("#Wan_Port_checkbox3").attr("disabled", false);
		} 

		if (uplink_type == "dev.eth.4") 
		{
			$("#Wan_Port_checkbox4").attr("disabled", true);
		}
		else
		{
			$("#Wan_Port_checkbox4").attr("disabled", false);
		} 

		if (uplink_type == "dev.eth.5") 
		{
			$("#Wan_Port_checkbox5").attr("disabled", true);
		}
		else
		{
			$("#Wan_Port_checkbox5").attr("disabled", false);
		} 
	}
}

function clearInputValue(id)
{
	//if(gOperatorName == "ALGERIA_TELECOM")
	//{
	//	$("#" + id).val("");
	//}
}
	

function resetInputValue(id)
{
	//if(gOperatorName == "ALGERIA_TELECOM")
	//{
	//	if($("#" + id).val() == "")
	//		$("#" + id).val(ppp_password_encode);
	//}
}

