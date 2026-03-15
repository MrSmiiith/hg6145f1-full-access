var ddns_data = "";
var all_wan_info = '';
var wan_info = '';
var addflag = "edit";
var selfilterIndex = 1;
var operator_name = gOperatorName;
var login_user = gLoginUser;
var provider_list = new Array();
var ddns_password_encode;

$(document).ready(function() {
	//优化滚动条，无需改动
	//customScrollBar("html");

	initValidate();
	if (operator_name == "TH_AIS") {
		$("#ddns_provider").empty();
		$("#ddns_provider").append("<option value='DynDNS' selected='selected'>DynDNS</option>");
		$("#ddns_provider").append("<option value='No-IP.com'>No-IP.com</option>");
	}
	$(".main_item_error_hint_extra").each(function(i) {
		$(this).html('');
	});

	if (gDebug) //调试模式读取本地数据
	{
		getDataByAjax("../fake/ddns", initPage);
	} else {
		//XHR.get("get_allwan_info", null, initConnectName);

		XHR.get("get_allwan_info", null, initPage);
	}



	//if (operator_name != "TH_3BB" && operator_name != "TH_TRUE") {
	//	$('#ddns_provider option[value="Other"]').remove();
	//}
	//if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP") {
	//	$('#ddns_provider option[value="www.3322.org"]').remove();
	//	$('#ddns_provider option[value="www.pubyun.com"]').show();
	//}

	//当DDNS Provider为Other时，x显示出其他相关信息
	$("#ddns_provider").bind("change", function() {
		if ($("#ddns_provider").val() == "Other") {
			$("#Oher_info").show();
		} else {
			$("#Oher_info").hide();
		}
	});

	//当Protocol为GUNDip.http时，显示Server urL
	$("#ddns_protocol").bind("change", function() {
		if ($("#ddns_protocol").val() == "GNUDip.http") {
			$("#ddns_url_info").show();
		} else {
			$("#ddns_url_info").hide();
		}
	});

	if (operator_name == "TH_AIS") {
		$("#ddns_interface").css("width", "45%");
	}

	if(gOperatorName == "BZ_INTELBRAS"){
		$("#ddns_password").prop('type', "password");	
	}

        //if(operator_name == "COL_ETB"){
	if(operator_name == "ALGERIA_TELECOM"){
		$("#show_password").show();
	}
	//if(gOperatorName == "ALGERIA_TELECOM"){
	//	$("#ddns_password").prop('type', "password");	
	//}

	if(operator_name == "TH_3BB")
    {
		$("#ddns_password").prop('type','password')

		setInterval(function(){
		    if($("#ddns_password").length > 0){
				if($("#ddns_password").attr('type') != 'password'){
					$('#ddns_password').prop('type','password')
				}
			}else{
				window.location.reload();
			}
		}, 10);
	}
});


function change_eye(){
	$("#ddns_password").toggleClass("fh-text-security");
}

function initPage(getdata) //从后端获取数据，初始化页面
{
	var wan_num = 0;
	var dynamicHtml = '';

	if (getdata != null) {
		all_wan_info = getdata;
		wan_info = all_wan_info.wan;
		if (all_wan_info != '' && all_wan_info.wan) {
			wan_num = all_wan_info.wan.length;
		}

		if (wan_num > 0) {
			for (i = 0; i < wan_num; i++) {
				var single_wan = all_wan_info.wan[i];
				var wan_path = single_wan.WAN_url;
				if (operator_name == "TH_AIS" && single_wan.Name.indexOf("aisfibre") >= 0 && single_wan.ServiceList.indexOf("INTERNET") >= 0 && single_wan.ConnectionType.indexOf("Routed") >= 0) {
					dynamicHtml += ' <option name= "single_wan" value="' + wan_path + '">' + single_wan.Name + '</option>';
				}
				else if (single_wan.Name.indexOf("INTERNET") >= 0 && single_wan.Name.indexOf("_B_") == -1) {
					dynamicHtml += ' <option name= "single_wan" value="' + wan_path + '">' + single_wan.Name + '</option>';
				}
			}
		}
		$("#ddns_interface").html(dynamicHtml);
		$("#ddns_interface").attr("disabled", true);
		if (gNewUiFlag) {
			displayTableHtmlNewUI();
			$("#fw_config_form").hide()
			$("#loading_div").hide();
			$("#checkAll").prop("checked", false);
		} else {
			displayTableHtml();
			//displayFormHtml("init", 0 , 1);	
			//$("#ddns_config_form").hide();
			if (gOperatorName == "EG_TELECOM" || operator_name == "MAR_INWI") {
				$("#ddns_list").children().eq(0).children().css("background-color", "#DEC0DF");
				$("#ddns_list").children().eq(0).siblings().children().css("background-color", "#eef2f6");
				$("#ddns_list").children().eq(0).css("background-color", "#b7e3e3").siblings().css("background-color",
					"#eef2f6");
			} else {
				$("#ddns_list").children().eq(0).children().css("background-color", "#b7e3e3");
				$("#ddns_list").children().eq(0).siblings().children().css("background-color", "#eef2f6");
				$("#ddns_list").children().eq(0).css("background-color", "#b7e3e3").siblings().css("background-color",
					"#eef2f6");
			}
		}

	}
}
function initValidate() {
	$("#ddns_list_form").validate({
		debug: true,
		rules: {
			"ddns_user_name": { required: false, rangelength: [1, 40] },
			"ddns_password": { required: false, rangelength: [1, 40] },
			"ddns_host": { required: true },
			"ddns_domain": { required: true },
			"ddns_server_address": { required: true },
			"ddns_url": { required: true },


		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
			error.insertAfter(element.parent().parent());
		},
		messages: {},
		submitHandler: function(form) { //校验成功回调
			fiberlog("validate ddns ok.....");
		},
		invalidHandler: function(form, validator) { //校验失败回调
			fiberlog("validate ddns failed.....");
			return false;
		}
	});
}

function Showthisinfo(element, value) //选中当前行并改变背景色
{
	if (!gNewUiFlag) {
		$("#fw_config_form").show();
	}
	addflag = "edit";
	$("#add_item").remove();
	if (gOperatorName == "EG_TELECOM" || operator_name == "MAR_INWI") {
		$("#" + element).children().css("background-color", "#DEC0DF");
		$("#" + element).siblings().children().css("background-color", "#eef2f6");
		$("#" + element).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
	} else {
		if (!gNewUiFlag) {
			$("#" + element).children().css("background-color", "#b7e3e3");
			$("#" + element).siblings().children().css("background-color", "#eef2f6");
			$("#" + element).css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
		}
	}


	var mode = "old";
	var ddns_index = element.split("_")[1];
	var wan_index = element.split("_")[2];
	selfilterIndex = parseInt(value.split("_")[1]);

	displayFormHtml(mode, wan_index, ddns_index);
}

function displayFormHtml(mode, wan_index, ddns_index) //显示详细信息
{

	var curdata = wan_info[wan_index].ddns[ddns_index];
	var wan_url = wan_info[wan_index].WAN_url;
	if (mode == "init") //初始化状态
	{
		if (curdata && curdata.length > 0) {
			curdata = wan_info[wan_index].ddns[ddns_index];
		} else {
			return;
		}
	}

	if (gNewUiFlag) {
		$("#ddns_enable").val(curdata.DDNSCfgEnabled);
	} else {
		if (curdata.DDNSCfgEnabled == "1") {
			$("input[name='ddns_enable']:first").attr('checked', 'checked');
		} else {
			$("input[name='ddns_enable']:last").attr('checked', 'checked');
		}
	}
	$("#ddns_interface").attr("disabled", true);
	$("#ddns_interface").val(wan_url);
	$("#ddns_user_name").val(curdata.DDNSUsername);

	if(operator_name == "BZ_INTELBRAS"){
		ddns_password_encode = curdata.ddns_password_encode;
		$("#ddns_password").val(ddns_password_encode);
	}
    	//else if(operator_name == "ALGERIA_TELECOM"){
	//	ddns_password_encode = curdata.ddns_password_encode;
	//	$("#ddns_password").val(ddns_password_encode);
	//}
	else{	
		$("#ddns_password").val(fhdecrypt(curdata.DDNSPassword));
	}
	
	$("#ddns_host").val(curdata.DDNSHostName);
	if (curdata.DDNSDomainName != "" && (operator_name == "ALGERIA_TELECOM" || operator_name == "TH_3BB" || operator_name == "TH_TRUE")) {
		$("#ddns_provider").val("Other");
		$("#Oher_info").show();
		$("#ddns_domain").val(curdata.DDNSDomainName);
		$("#ddns_server_address").val(curdata.DDNSServerAddress);
		$("#ddns_protocol").val(curdata.DDNSServerProtocol);
		if (curdata.DDNSServerProtocol == "GNUDip.http") {
			$("#ddns_url_info").show();
			$("#ddns_url").val(curdata.DDNSServerURL);
		}

	} else {
		$("#ddns_provider").val(curdata.DDNSProvider);
		$("#Oher_info").hide();
		$("#ddns_domain").val("");
		$("#ddns_server_address").val("");
		$("#ddns_url").val("");
	}

	$("#ddns_provider").change();
	$("#ddns_protocol").change();
}

function displayTableHtml() {
	var num = 1;
	var dynamicClsListHTML = '';
	wan_info = all_wan_info.wan; //获取所有wan连接信息
	for (var i = 0; i < wan_info.length; i++) {
		ddns_data = wan_info[i].ddns; //获取当前第i条WAN下的ddns信息
		var wan_url = wan_info[i].WAN_url; // 获取当前wan的url信息，供单条mapping的wan_name信息显示
		var wan_url_temp = wan_url;//此变量用于以下：如果wan连接改变或者是变为不包含internet 的 时候，则将url栏置空
		if (ddns_data.length != 0) {
			for (var m = 0; m < ddns_data.length; m++) //将第i条WAN连接下的ddns信息进行遍历
			{
				var n = m + 1;
				var single = ddns_data[m]; //对于第m条portmapping 信息赋值给single
				$("#ddns_interface option").each(function() {
					if (wan_url == this.value) {
						wan_url = this.text;
					}
				});
				if (wan_url == wan_url_temp)//如果没有改变，则将url置空
				{
					wan_url = "";
				}
				//针对每一条ddns信息，其id中i、m分别表示第i条wan连接下的第m条ddns信息。以供showshisinfo调用
				dynamicClsListHTML += '<tr id="table_' + m + "_" + i +
					'" style="cursor: pointer;" title="delout_' + single.ddns_index + '" onclick="Showthisinfo(this.id,this.title)">'; //新增数据时，把数据在前端显示
				dynamicClsListHTML += '<td align="center">' + num + '</td>';
				if (single.DDNSCfgEnabled == "1") {
					dynamicClsListHTML += '<td align="center">' + "enable_certificate".i18n() + '</td>';
				} else {
					dynamicClsListHTML += '<td align="center">' + "disable_certificate".i18n() + '</td>';
				}
				dynamicClsListHTML += '<td align="center">' + wan_url + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSUsername + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSProvider + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSHostName + '</td>';
				dynamicClsListHTML += '<td align="center"><input type="checkbox"  value="del_' + i + '_' + single.ddns_index +
					'" name="ddns_flag"></td>';
				dynamicClsListHTML += '</tr>';
				num++;
			}
		}
	}

	$("#ddns_list").html(dynamicClsListHTML);
	$("#ddns_list tr:eq(0)").click();
}

function displayTableHtmlNewUI() {
	var dynamicClsListHTML = '';
	var num = 1;
	wan_info = all_wan_info.wan;
	for (var i = 0; i < wan_info.length; i++) {
		ddns_data = wan_info[i].ddns;
		var wan_url = wan_info[i].WAN_url;
		var wan_url_temp = wan_url;
		if (ddns_data.length != 0) {
			for (var m = 0; m < ddns_data.length; m++) {
				var n = m + 1;
				var single = ddns_data[m];
				$("#ddns_interface option").each(function() {
					if (wan_url == this.value) {
						wan_url = this.text;
					}
				});
				if (wan_url == wan_url_temp) {
					wan_url = "";
				}
				dynamicClsListHTML += '<tr id="mactable_' + m + "_" + i + '" class = "table_content" style="cursor: pointer;color:rgba(255, 255, 255, 0.8);font-size:14px"  title="del_' + single.ddns_index + '" onclick="Showthisinfo(this.id,this.title)">';
				dynamicClsListHTML += '<td align="center"><input type="checkbox" style="margin-top: 3px"  value="del_' + i + '_' + single.ddns_index + '" name="fw_remove_flag"></td>';
				dynamicClsListHTML += '<td align="center">' + num + '</td>';
				if (single.DDNSCfgEnabled == "1") {
					dynamicClsListHTML += '<td align="center">' + "Enable".i18n() + '</td>';
				} else {
					dynamicClsListHTML += '<td align="center">' + "Disable".i18n() + '</td>';
				}
				dynamicClsListHTML += '<td align="center">' + wan_url + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSUsername + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSProvider + '</td>';
				dynamicClsListHTML += '<td align="center">' + single.DDNSHostName + '</td>';
				dynamicClsListHTML += '<td id="' + m + '" align="center" style="color:rgba(255, 107, 49, 1)" onclick="showEditForm(this.id)">' + "Edit".i18n() + '</td>';
				dynamicClsListHTML += '</tr>';
				num++;
			}
		}
	}
	if (dynamicClsListHTML != '')
		$("#image").hide();
	else
		$("#image").show();
	$("#ddns_list").html(dynamicClsListHTML);
	$("#ddns_list tr:eq(0)").click();
}
function showEditForm(id) {
	$("#fw_config_form").show();
	$("#loading_div").show()
	//$(window.parent.document).find("#loading_window_div4").show();
	//$(window.parent.document).find("#loading_window_div5").show();
	removeError();
	if (id)
		$("#title").html("Edit DDNS Rule (ID:".i18n() + (Number(id) + 1) + ")");
}
function addfilter() //增加过滤条目
{
	if (gNewUiFlag) {
		$("#loading_div").show()
		//$(window.parent.document).find("#loading_window_div4").show();
		//$(window.parent.document).find("#loading_window_div5").show();
		$("#title").html("Add DDNS Rule".i18n());
		$(".input_text").each(function(i) {
			$(this).val('');
		});
	}
	addflag = "add";
	var addHtml = []; //新增一个占位标记行
	$("#fw_config_form").show();
	$("#ddns_interface").attr("disabled", false);
	if (!gNewUiFlag) {
		addHtml += '<tr id="add_item">';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td align="center">--</td>';
		addHtml += '<td></td>';
		addHtml += '</tr>';

		if ($("#add_item").length == 0) //第一次添加数据时设置默认值
		{
			$("#ddns_list").append(addHtml);
			$(".input_text").each(function(i) {
				$(this).val('');
			});
			$("input[name='ddns_enable']").eq(0).attr('checked', 'true');
			if (operator_name == "MEX_TP" || operator_name == "SFU_MEX_TP") {
				$("#ddns_provider").val("www.pubyun.com");
			} else {
				$("#ddns_provider").val("www.3322.org");
			}
			$("#Oher_info").hide();
			if (gOperatorName == "EG_TELECOM" || operator_name == "MAR_INWI") {
				$("#add_item").children().css("background-color", "#DEC0DF");
				$("#add_item").siblings().children().css("background-color", "#eef2f6");
				$("#add_item").css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
			} else {
				$("#add_item").children().css("background-color", "#b7e3e3");
				$("#add_item").siblings().children().css("background-color", "#eef2f6");
				$("#add_item").css("background-color", "#b7e3e3").siblings().css("background-color", "#eef2f6");
			}

		}
	}
}


function doDelete(wan_num, index) //删除操作
{
	var postdata = new Object();
	postdata.action = "delete";
	postdata.url = wan_info[parseInt(wan_num)].WAN_url;
	postdata.ddns_index = parseInt(index);
	XHR.post("set_ddns_info", postdata);//删除ddns 的操作
	sleep(300);
}

function click_remove() //点击删除按钮，可以删除单个和多个
{
	var checkNodes = $("input[type='checkbox']");
	var is_checked;
	var value_temp;
	var index;

	if (0 == checkNodes.length) //如果沒有数据，则返回并报错
	{
		if (gNewUiFlag)
			myAlert('Tip', '' + "no_rules_alert".i18n() + '', function() { })
		else
			alert("no_rules_alert".i18n());
		return;
	}

	is_checked = $("input[type = checkbox]").is(':checked'); //判断是否有选中

	if (!is_checked) //如果没有选中任何条目
	{
		if (gNewUiFlag)
			myAlert('Tip', '' + "no_selected_rules_alert".i18n() + '', function() { })
		else
			alert("no_selected_rules_alert".i18n());
		return;
	}

	if (gNewUiFlag) {
		myConfirm('Tip', '' + "delete_alert".i18n() + '', function(r) {
			if (r) {
				var i = 1
				for (i; i < checkNodes.length; i++) {
					if (checkNodes[i].checked == true) {
						value_temp = checkNodes[i].value;
						var wan_num = value_temp.split("_")[1];
						index = value_temp.split("_")[2];
						doDelete(wan_num, index);
					}
				}
				window.location.reload();
			}
		});
	} else {
		if (confirm("delete_alert".i18n()) == false) //确认删除
		{
			return;
		}

		for (var i = 0; i < checkNodes.length; i++) {
			if (checkNodes[i].checked == true) {
				value_temp = checkNodes[i].value;
				var wan_num = value_temp.split("_")[1];
				index = value_temp.split("_")[2];
				doDelete(wan_num, index);
			}
		}
		//XHR.get("get_allwan_info", null, initConnectName);
		$("#fw_config_form").hide();
		$(".input_text").val("");
		window.location.reload();
	}
	//XHR.get("get_allwan_info", null, initPage);	
}

function click_remove_all() {
	var checkNodes = $("input[type='checkbox']");
	if (0 == checkNodes.length) //如果沒有数据，则返回并报错
	{
		alert("no_rules_alert".i18n());
		return;
	}
	if (confirm("delete_all_alert".i18n()) == false) {
		return;
	}
	for (var i = 0; i < checkNodes.length; i++) {
		value_temp = checkNodes[i].value;
		var wan_num = value_temp.split("_")[1];
		index = value_temp.split("_")[2];
		doDelete(wan_num, index);
	}
	$("#fw_config_form").hide();
	$(".input_text").val("");
	window.location.reload();
	//XHR.get("get_allwan_info", null, initPage);	
}
/*
function extraValidCheck()//额外规则校验（包括ip、端口等）
{
	if (ip2int($("#SourceIPStart").val()) > ip2int($("#SourceIPEnd").val()))
	{
		$("#MinSourceAddress-error").html("fw_endIPTooSmallAlert".i18n());
		return false;
	}

	if (parseInt($("#SourcePortStart").val()) > parseInt($("#SourcePortEnd").val()))
	{
		$("#MinSourcePort-error").html("fw_endPortTooSmallAlert".i18n());
		return false;
	}
    
	if (ip2int($("#DestIPStart").val()) > ip2int($("#DestIPEnd").val()))
	{
		$("#MinDestinationAddress-error").html("fw_endIPTooSmallAlert".i18n());
		return false;
	}
    
	if (parseInt($("#DestPortStart").val()) > parseInt($("#DestPortEnd").val()))
	{
		$("#MinDestinationPort-error").html("fw_endPortTooSmallAlert".i18n());
		return false;
	}

	return true;
}
*/
function save_apply() //提交页面数据 
{
	show_shadow();
	//清除自定义错误提示
	$(".main_item_error_hint_extra").each(function(i) {
		$(this).html('');
	});
	var new_info;
	if (!$("#ddns_list_form").valid()) {
		if (gNewUiFlag)
			myAlert('Tip', '' + "illegal_value_alert".i18n() + '', function() { })
		else
			alert("illegal_value_alert".i18n());
		return;
	}
	var postdata = new Object();
	postdata.action = addflag;
	if (addflag == "edit") {
		postdata.ddns_index = selfilterIndex;
	}

	if (addflag == "add") {

		for (var m = 0; m < wan_info.length; m++) {
			if ($("#ddns_interface").val() == wan_info[m].WAN_url) {
				if (wan_info[m].ddns.length >= 4) {
					alert("app_most4RulesAlert".i18n());
					return;
				}
			}
		}

		// if (ddns_data.length >= 4) {
		// 	alert("app_most4RulesAlert".i18n());
		// 	return;
		// }	
	}

	var interface = $("#ddns_interface").val();
	var username = $("#ddns_user_name").val();
	var password;
	if(operator_name != "BZ_INTELBRAS")
	{
		password = fhencrypt($("#ddns_password").val());
	}
	var host = $("#ddns_host").val();
	var provider = $("#ddns_provider").val();
	var domain = $("#ddns_domain").val();
	var server_addr = $("#ddns_server_address").val();
	var protocol = $("#ddns_protocol").val();
	var server_url = $("#ddns_url").val();
	var isRepeat = false;
	for (var i = 0; i < wan_info.length; i++) {
		if (interface == wan_info[i].WAN_url) {
			var ddns = wan_info[i].ddns;
			for (var j = 0; j < ddns.length; j++) {
				if (provider == "Other") {
					if (protocol == "GNUDip.http") {
						if (addflag == "add") {
							if ((ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
								&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider) && (ddns[j].DDNSDomainName == domain)
								&& (ddns[j].DDNSServerAddress == server_addr) && (ddns[j].DDNSServerProtocol == protocol) && (ddns[j].DDNSServerURL == server_url)) {
								isRepeat = true;
							}
						} else if (addflag == "edit") {
							if ((selfilterIndex != ddns[j].ddns_index) && (ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
								&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider) && (ddns[j].DDNSDomainName == domain)
								&& (ddns[j].DDNSServerAddress == server_addr) && (ddns[j].DDNSServerProtocol == protocol) && (ddns[j].DDNSServerURL == server_url)) {
								isRepeat = true;
							}
						}
					} else {
						if (addflag == "add") {
							if ((ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
								&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider) && (ddns[j].DDNSDomainName == domain)
								&& (ddns[j].DDNSServerAddress == server_addr) && (ddns[j].DDNSServerProtocol == protocol)) {
								isRepeat = true;
							}
						} else if (addflag == "edit") {
							if ((selfilterIndex != ddns[j].ddns_index) && (ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
								&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider) && (ddns[j].DDNSDomainName == domain)
								&& (ddns[j].DDNSServerAddress == server_addr) && (ddns[j].DDNSServerProtocol == protocol)) {
								isRepeat = true;
							}
						}
					}
				} else {
					if (addflag == "add") {
						if ((ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
							&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider)) {
							isRepeat = true;
						}
					} else if (addflag == "edit") {
						if ((selfilterIndex != ddns[j].ddns_index) && (ddns[j].DDNSUsername == username) && (ddns[j].DDNSPassword == password && operator_name != "BZ_INTELBRAS")
							&& (ddns[j].DDNSHostName == host) && (ddns[j].DDNSProvider == provider)) {
							isRepeat = true;
						}
					}
				}

			}
		}
	}
	if (isRepeat) {
		alert("repeat_with_the_existing_rules".i18n());
		return;
	}

	if (gNewUiFlag) {
		postdata.DDNSCfgEnabled = $("#ddns_enable").val();
	} else {
		postdata.DDNSCfgEnabled = $("input[name='ddns_enable']:checked").val();
	}
	postdata.wanurl = $("#ddns_interface").val();//postdata数据，需要和后端同步写
	postdata.DDNSUsername = $("#ddns_user_name").val();

	if(operator_name == "BZ_INTELBRAS"){
		if($("#ddns_password").val() == ddns_password_encode){
			postdata.DDNSPassword = fhencrypt(ddns_password_encode);
		}else{
			postdata.DDNSPassword = fhencrypt($("#ddns_password").val());
		}
	}else{
		postdata.DDNSPassword = fhencrypt($("#ddns_password").val());
	}
	
	postdata.DDNSHostName = $("#ddns_host").val();
	postdata.DDNSProvider = $("#ddns_provider").val();
	if (postdata.DDNSProvider == "Other") {
		postdata.DDNSDomainName = $("#ddns_domain").val();
		postdata.DDNSServerAddress = $("#ddns_server_address").val();
		postdata.DDNSServerProtocol = $("#ddns_protocol").val();
		if ($("#ddns_protocol").val() == "GNUDip.http") {
			postdata.DDNSServerURL = $("#ddns_url").val();
		}
	}

	XHR.post("set_ddns_info", postdata, initPage);
	addflag = "edit";
	selfilterIndex = 1;
}

function clearInputValue(id)
{
	if(gOperatorName == "ALGERIA_TELECOM")
	{
	//	$("#" + id).val("");
	}
}
	

function resetInputValue(id)
{
	if(gOperatorName == "ALGERIA_TELECOM")
	{
	//	if($("#" + id).val() == "")
	//		$("#" + id).val(ddns_password_encode);
	}
}