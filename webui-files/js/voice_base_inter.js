var sessionidstr = "";
var voicedata;
var operator_name = gOperatorName;
var all_wan_info;
var wan_info;
var option120_enable;
var voip_password_encode;
$(document).ready(function(){
	//优化滚动条，无需改动
	//customScrollBar("html");
	
	initValidate();
	
	//清除自定义错误提示
	$(".main_item_error_hint_extra").each(function (i){
		$(this).html('');
	});
	
	//菲律宾PLDT版本第一注册服务器做成下拉框，且可编辑--start
	$('.select input').bind('click',function(){
		if($('.select .serverAddr').is('.hide')){
			$('.select .serverAddr').removeClass('hide');
		}else{
			$('.select .serverAddr').addClass('hide');
		}
	})
	$('.select ul li').bind('click',function(){
		$('.select input').val($(this).html());
		$('.select .serverAddr').addClass('hide');
		//$('.select input').css('border-bottom','1px solid #d6d6d6');
	})
	$('.select ul li').hover(
		function(){
			$(this).css({'backgroundColor':'#fd9','font-size':'18px'});
		},function(){
			$(this).css({'backgroundColor':'#fff','font-size':'14px'});
		}
	)
	$(document).click(function(e){
	  var a = $('.select input'); //设置空白以外的目标区域
	  if(!a.is(e.target) && a.has(e.target).length === 0){
		   //写你需要做的事件
		   $('.select .serverAddr').addClass('hide');
	  }
	});
	//菲律宾PLDT版本第一注册服务器做成下拉框，且可编辑--end

	// 	$(".main_item_name").each(function (i){
	// 	$(this).css("width","200px");
	// });
	

	// $('input[type="checkbox"]').each(function (i){
	// 	$(this).css({"margin-top": "7px"});
	// });
	
	$("input:checkbox").bind("click", function(){
		displayControl();
	});
	
	$("#servicevoip_H248ConfigMethod").bind("click", function(){
		displayControl();
	});
    
    if(operator_name == "ECU_CNT")
    {
        $("#signaling_port_div").show();
        $("#media_port_div").show();
    }
    
    $("input[type=radio][name=option120enable]").change(function(){
            if($("input[name='option120enable']:checked").val() == "1"){
                $("#RegistrarServer_text").attr("disabled", true);
                $("#RegistrarServerPort_text").attr("disabled", true);
                $("#StandbyRegistrarServer_text").attr("disabled", true);
                $("#StandbyRegistrarServerPort_text").attr("disabled", true);
                $("#ProxyServer_text").attr("disabled", true);
                $("#ProxyServerPort_text").attr("disabled", true);
                $("#StandbyProxyServer_text").attr("disabled", true);
                $("#StandbyProxyServerPort_text").attr("disabled", true);
                $("#OutboundProxy_text").attr("disabled", true);
                $("#OutboundProxyPort_text").attr("disabled", true);
                $("#StandbyOutboundProxy_text").attr("disabled", true);
                $("#StandbyOutboundProxyPort_text").attr("disabled", true);
            }else{
                $("input[name='option120enable']:last").attr('checked', 'checked');
                $("#RegistrarServer_text").attr("disabled", false);
                $("#RegistrarServerPort_text").attr("disabled", false);
                $("#StandbyRegistrarServer_text").attr("disabled", false);
                $("#StandbyRegistrarServerPort_text").attr("disabled", false);
                $("#ProxyServer_text").attr("disabled", false);
                $("#ProxyServerPort_text").attr("disabled", false);
                $("#StandbyProxyServer_text").attr("disabled", false);
                $("#StandbyProxyServerPort_text").attr("disabled", false);
                $("#OutboundProxy_text").attr("disabled", false);
                $("#OutboundProxyPort_text").attr("disabled", false);
                $("#StandbyOutboundProxy_text").attr("disabled", false);
                $("#StandbyOutboundProxyPort_text").attr("disabled", false);
             
            }    
    })
	
	if ( gDebug ) //调试模式读取本地数据
	{
		getDataByAjax("../fake/voice_base", initPage);
	}
	else
	{	
        if(operator_name == "MY_TM"){
          XHR.get("get_voice_advance_info", null, getVoiceInfo);  
          $("#option120_enable_div").show();
        }
		XHR.get("get_voice_base_info", null, initPage);
			
		if(operator_name == "ECU_CNT")
        		XHR.get("get_allwan_info", null, getWan);    
	}

	//if(gOperatorName == "ALGERIA_TELECOM"){
	//	$("#AuthPassword_password_1").prop('type', "password");	
	//	$("#AuthPassword_password_2").prop('type', "password");
	//	$("#AuthPassword_password_3").prop('type', "password");
	//	$("#AuthPassword_password_4").prop('type', "password");
	//}else if(gOperatorName == "COL_ETB"){
	$("#show_password_1").show();
	$("#show_password_2").show();
	//}
});
function change_eye(index){
	$("#AuthPassword_password_"+index).toggleClass("fh-text-security");
}
function getVoiceInfo(getdata)
{
    option120_enable = getdata.voice_advance.Option_120;
    if(option120_enable == "1")
    {
        $("input[name='option120enable']:first").attr('checked', 'checked');
        $("#RegistrarServer_text").attr("disabled", true);
        $("#RegistrarServerPort_text").attr("disabled", true);
        $("#StandbyRegistrarServer_text").attr("disabled", true);
        $("#StandbyRegistrarServerPort_text").attr("disabled", true);
        $("#ProxyServer_text").attr("disabled", true);
        $("#ProxyServerPort_text").attr("disabled", true);
        $("#StandbyProxyServer_text").attr("disabled", true);
        $("#StandbyProxyServerPort_text").attr("disabled", true);
        $("#OutboundProxy_text").attr("disabled", true);
        $("#OutboundProxyPort_text").attr("disabled", true);
        $("#StandbyOutboundProxy_text").attr("disabled", true);
        $("#StandbyOutboundProxyPort_text").attr("disabled", true);
    }else if(option120_enable == "0")
    {
        $("input[name='option120enable']:last").attr('checked', 'checked');
        $("#RegistrarServer_text").attr("disabled", false);
        $("#RegistrarServerPort_text").attr("disabled", false);
        $("#StandbyRegistrarServer_text").attr("disabled", false);
        $("#StandbyRegistrarServerPort_text").attr("disabled", false);
        $("#ProxyServer_text").attr("disabled", false);
        $("#ProxyServerPort_text").attr("disabled", false);
        $("#StandbyProxyServer_text").attr("disabled", false);
        $("#StandbyProxyServerPort_text").attr("disabled", false);
        $("#OutboundProxy_text").attr("disabled", false);
        $("#OutboundProxyPort_text").attr("disabled", false);
        $("#StandbyOutboundProxy_text").attr("disabled", false);
        $("#StandbyOutboundProxyPort_text").attr("disabled", false);
    }
}

function getWan(getdata)
{
    var wan_num = 0;
    var dynamicHtml;
    if (getdata != null && getdata.wan) {
    		all_wan_info = getdata;
    		wan_info = all_wan_info.wan;
    		if(all_wan_info != '' && all_wan_info.wan)
    		{
    			wan_num = all_wan_info.wan.length;
    		}
    
    		if (wan_num > 0)
    		{
    			for (i = 0; i < wan_num; i++) {
    				var single_wan = all_wan_info.wan[i];
    				var wan_path = single_wan.WAN_url;
    				if (single_wan.Name.indexOf("VOIP") >= 0 ) 
    				{
    					dynamicHtml += ' <option name= "single_wan" value="' + wan_path + '">' + single_wan.Name + '</option>';
    				}
    		}
   
    	
    	}
    }
    $("#signaling_port").html(dynamicHtml);
    $("#media_port").html(dynamicHtml);
}

function initValidate()
{
	var flag_pldt = operator_name == "PH_PLDT"? true : false ;
	$("#voice_base_form").validate({
		debug: true,
		rules: {
			"ProxyServerPort_text": {required: true, range_int:[1025,65535]},
			"RegistrarServerPort_text": {required: true, range_int:[1025,65535]},
			"OutboundProxyPort_text": {range_int:[1025,65535]},
			"StandbyProxyServerPort_text": {range_int:[1025,65535]},
			"StandbyRegistrarServerPort_text": {range_int:[1025,65535]},
			"StandbyOutboundProxyPort_text": {range_int:[1025,65535]},
			"RegistrarServer_text": {required: !flag_pldt, ipv4_domain: !flag_pldt},
			"RegistrarServer_pldt": {required: flag_pldt, ipv4_domain_pldt: flag_pldt},
			"ProxyServer_text": {required: true, ipv4_domain: true},
			"StandbyRegistrarServer_text": {ipv4_domain: true},
			"StandbyProxyServer_text": {ipv4_domain: true},
			"OutboundProxy_text": {ipv4_domain: true},
			"StandbyOutboundProxy_text": {ipv4_domain: true},
			"AuthUserName_text_1": {required: true, minlength:1, maxlength:64, nocn: true},
			"AuthUserName_text_2": { maxlength:64, nocn: true},
			"AuthUserName_text_3": { maxlength:64, nocn: true},
			"AuthUserName_text_4": { maxlength:64, nocn: true},
			"AuthPassword_password_1": {required: true, minlength:1, maxlength:64, nocn: true},
			"AuthPassword_password_2": {maxlength:64,nocn: true},
			"AuthPassword_password_3": {maxlength:64,nocn: true},
			"AuthPassword_password_4": {maxlength:64,nocn: true},
			"DirectoryNumber_text_1": { maxlength:64,nocn: true},
			"DirectoryNumber_text_2": { maxlength:64,nocn: true},
			"DirectoryNumber_text_3": { maxlength:64,nocn: true},
			"DirectoryNumber_text_4": { maxlength:64,nocn: true},
			"URI_text_1": { maxlength:64},
			"URI_text_2": { maxlength:64},
			"URI_text_3": { maxlength:64},
			"URI_text_4": { maxlength:64},
			"MediaGatewayControlerPort_text": {range_int:[1,65535]},
			"StandbyMediaGatewayControlerPort_text": {range_int:[1,65535]},
			"MediaGatewayPort_text": {range_int:[1,65535]},
			"MediaGatewayControler_text":{ipv4: true},
			"DeviceID_text":{nocn: true},
			"PhysicalTermIDPrefix_text":{nocn: true},
			"PhysicalTermIDStart_text":{nocn: true},
			"PhysicalTermIDAddLen_text":{nocn: true},
			"RTPPrefix_text":{nocn: true},
			"EphemeralTermIDStart_text":{nocn: true},
			"EphemeralTermIDAddLen_text":{nocn: true},
			"StandbyMediaGatewayControler_text":{ipv4: true}
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
			if($(element).attr("id") == "RegistrarServer_pldt")
			{
				error.insertAfter(element.parent().parent().parent().parent());
			}
			else
			{
				error.insertAfter(element.parent().parent());
			}
		},
		messages: {
		},
		submitHandler: function(form){//校验成功回调
			fiberlog("validate mac filter ok.....");
		},
		invalidHandler: function(form, validator) {  //校验失败回调
			fiberlog("validate mac filter failed.....");
			return false;
		}
	}); 
}

function initPage(getdata)
{
	if ( getdata && getdata.voice_base )
	{
		voicedata = getdata.voice_base;
		displayHTML();
	}
	if (voicedata.voice_port_num == 1) {
		$(".line_div_2").hide();
	    $(".line_div_3").hide();
	    $(".line_div_4").hide();
	}else if (voicedata.voice_port_num == 2) {
	    $(".line_div_3").hide();
	    $(".line_div_4").hide();
	}else if (voicedata.voice_port_num == 4) {
	    $(".line_div_3").show();
	    $(".line_div_4").show();
	}
	if(operator_name != "COL_MILLICOM"){
		$("#uri_div_1").hide();
		$("#uri_div_2").hide();
		$("#uri_div_3").hide();
		$("#uri_div_4").hide();
	}
	//判断当前用户为普通用户还是管理员用户
	var login_user = gLoginUser;
	if(operator_name == "TH_TRUE" || operator_name == "TH_SME_TRUE"){
		if(login_user == "0"){
		//	alert("当前为泰国TREU的普通用户");
			$("input").attr("disabled", true);
			$("select").attr("disabled", true);		
		}
	}
	if(operator_name == "PH_PLDT")
	{
		$("#RegistrarServer_text").css("display", "none");
		$("#select_server").css("display", "");
	}
	
	if(operator_name == "ARG_CLARO"){
		$("#server_font").show();
		$("#protocol_font").hide();
	}

	if(operator_name == "TH_3BB")
    {
		$("#AuthPassword_password_1,#AuthPassword_password_2,#AuthPassword_password_3,#AuthPassword_password_4").prop('type','password')

		setInterval(function(){
    	    if($("#AuthPassword_password_1").length > 0){
				if($("#AuthPassword_password_1").attr('type') != 'password'){
					$('#AuthPassword_password_1').prop('type','password')
				}
    		}else{
    			window.location.reload();
    		}
            if($("#AuthPassword_password_2").length > 0){
				if($("#AuthPassword_password_2").attr('type') != 'password'){
					$('#AuthPassword_password_2').prop('type','password')
				}
            }else{
            	window.location.reload();
            }
            if($("#AuthPassword_password_3").length > 0){
				if($("#AuthPassword_password_3").attr('type') != 'password'){
					$('#AuthPassword_password_3').prop('type','password')
				}
            }else{
            	window.location.reload();
            }
            if($("#AuthPassword_password_4").length > 0){
				if($("#AuthPassword_password_4").attr('type') != 'password'){
					$('#AuthPassword_password_4').prop('type','password')
				}
            }else{
            	window.location.reload();
            }
    	}, 10);
	}
}

function CancelBtn()
{
	displayHTML();
}

function displayHTML()
{
	if (voicedata.ServerType == 0)
	{
		$(".ServerType").html("IMS");
	}
	else if (voicedata.ServerType == 1)
	{
		$(".ServerType").html("SIP");
	}
	
	else
	{
		$(".ServerType").html("H.248");
	}

	if ( voicedata.ServerType == 2 )
	{
		$("#MediaGatewayPort_text").val(voicedata.MediaGatewayPort);
		$("#MediaGatewayControler_text").val(voicedata.MediaGatewayControler);
		$("#MediaGatewayControlerPort_text").val(voicedata.MediaGatewayControlerPort);
		$("#StandbyMediaGatewayControler_text").val(voicedata.StandbyMediaGatewayControler);
		$("#StandbyMediaGatewayControlerPort_text").val(voicedata.StandbyMediaGatewayControlerPort);
		$("#DeviceIDType_text").val(voicedata.DeviceIDType);
		$("#DeviceID_text").val(voicedata.DeviceID);
		$("#MessageEncodingType_text").val(voicedata.MessageEncodingType);
		$("#PhysicalTermIDPrefix_text").val(voicedata.PhysicalTermIDPrefix);
		$("#PhysicalTermIDStart_text").val(voicedata.PhysicalTermIDStart);
		$("#PhysicalTermIDAddLen_text").val(voicedata.PhysicalTermIDAddLen);
		$("#RTPPrefix_text").val(voicedata.RTPPrefix);
		$("#EphemeralTermIDStart_text").val(voicedata.EphemeralTermIDStart);
		$("#EphemeralTermIDAddLen_text").val(voicedata.EphemeralTermIDAddLen);
		$("#servicevoip_H248ConfigMethod").val(voicedata.PhysicalTermIDConfigMethod);
		for ( i=1; i<=voicedata.voice_port_num; i++ )
		{
			$("#PS_PortID_" + i).val( eval("voicedata.PhysicalTermID" + i) );
		}
	}
	else //sip, ims
	{
		//当读取到的ip为0.0.0.0时，设置其显示为空
		if(voicedata.StandbyProxyServer == "0.0.0.0"){
			voicedata.StandbyProxyServer = "";
		}
		if(voicedata.StandbyRegistrarServer == "0.0.0.0"){
			voicedata.StandbyRegistrarServer = "";
		}
		if(voicedata.OutboundProxy == "0.0.0.0"){
			voicedata.OutboundProxy = "";
		}
		if(voicedata.StandbyOutboundProxy == "0.0.0.0"){
			voicedata.StandbyOutboundProxy = "";
		}
		
		$("#ProxyServer_text").val(voicedata.ProxyServer);
		$("#ProxyServerPort_text").val(voicedata.ProxyServerPort);
		if(operator_name == "PH_PLDT")
		{
			$("#RegistrarServer_pldt").val(voicedata.RegistrarServer);
		}
		else
		{
			$("#RegistrarServer_text").val(voicedata.RegistrarServer);
		}
		$("#RegistrarServerPort_text").val(voicedata.RegistrarServerPort);
		$("#OutboundProxy_text").val(voicedata.OutboundProxy);
		$("#OutboundProxyPort_text").val(voicedata.OutboundProxyPort);
		
		$("#StandbyProxyServer_text").val(voicedata.StandbyProxyServer);
		$("#StandbyProxyServerPort_text").val(voicedata.StandbyProxyServerPort);
		$("#StandbyRegistrarServer_text").val(voicedata.StandbyRegistrarServer);
		$("#StandbyRegistrarServerPort_text").val(voicedata.StandbyRegistrarServerPort);
		$("#StandbyOutboundProxy_text").val(voicedata.StandbyOutboundProxy);
		$("#StandbyOutboundProxyPort_text").val(voicedata.StandbyOutboundProxyPort);

		if(operator_name == "BZ_INTELBRAS")
		{
			voip_password_encode = voicedata.voip_password_encode;
		}
		for ( i=1; i<=voicedata.voice_port_num; i++ )
		{
			$("#AuthUserName_text_" + i).val(fhdecrypt(eval("voicedata.AuthUserName" + i)));
			if(operator_name == "BZ_INTELBRAS"){
				$("#AuthPassword_password_" + i).val(voip_password_encode);
			}
            //else if(operator_name == "ALGERIA_TELECOM")
			//{
			//	voip_password_encode = voicedata.voip_password_encode
			//	$("#AuthPassword_password_" + i).val(voip_password_encode);
			//}
			else{	
				$("#AuthPassword_password_" + i).val(fhdecrypt(eval("voicedata.AuthPassword" + i)));
			}
			
			if(operator_name == "COL_MILLICOM"){
				$("#URI_text_" + i).val(fhdecrypt(eval("voicedata.DirectoryNumber" + i)));
				$("#DirectoryNumber_text_" + i).val(eval("voicedata.URI" + i));
			}else{
				$("#DirectoryNumber_text_" + i).val(fhdecrypt(eval("voicedata.DirectoryNumber" + i)));
			}
			
			if ($("#DirectoryNumber_text_" + i).val() == "" && operator_name != "COL_MILLICOM")//add by fengshuo 20191220, reason: SE要求，在读取到的电话号码为空的情况下，则显示用户名的@前缀。
			{
			    var temp_num = "";
                temp_num = $("#AuthUserName_text_" + i).val().split("@")[0];
			    $("#DirectoryNumber_text_" + i).val(temp_num);
			}
		}	
	}
	displayControl();
}

function displayControl()
{
	if ( voicedata.ServerType == 2 ) //H.248
	{

		$(".h248_div").css("display","");
		$(".sip_div").css("display","none");
		for ( i=1; i<=voicedata.voice_port_num; i++ )
		{
			$(".h248_line_" + i).css("display","");
			if ( eval("voicedata.Enable" + i) == "Disabled" )
			{
				$("#PS_PortID_" + i).attr("disabled", true);
			}
			else
			{
				$("#PS_PortID_" + i).attr("disabled", false);
			}
		}
		if ( $("#servicevoip_H248ConfigMethod").val() == 0 )
		{
			$(".physicalterm_div").css("display","");
			$(".portid_div").css("display","none");
		}
		else
		{
			$(".physicalterm_div").css("display","none");
			$(".portid_div").css("display","");
		}
	}
	else //sip ims
	{
		$(".h248_div").css("display","none");
		$(".sip_div").css("display","");
		for ( i=1; i<=voicedata.voice_port_num; i++ )
		{
			$(".line_div_" + i).css("display","");
			if(operator_name != "COL_MILLICOM"){
				$("#uri_div_" + i).css("display","none");
			}
			if ( eval("voicedata.Enable" + i) == "Disabled" )
			{
				$("#DirectoryNumber_text_" + i).attr("disabled", true);
				$("#AuthUserName_text_" + i).attr("disabled", true);
				$("#AuthPassword_password_" + i).attr("disabled", true);
				$("#URI_text_" + i).attr("disabled", true);
			}
			else
			{
				$("#DirectoryNumber_text_" + i).attr("disabled", false);
				$("#AuthUserName_text_" + i).attr("disabled", false);
				$("#AuthPassword_password_" + i).attr("disabled", false);
				$("#AuthPassword_password_" + i).css("cursor", "text");
				if(operator_name == "COL_MILLICOM"){
					$("#URI_text_" + i).attr("disabled", false);
				}
			}
		}
	}
}

function checkVoipTelNum(str)
{
	if (str == ""){
		return true;
	}
	var reg = /^[\w+]{1,64}$/;	//数字字母_+
	if (!reg.test(str))
	{ 
		return false; 
	}
	else
	{
		return true;
	}
}

function serverTypeChange()
{
	var postdata = new Object();
	postdata.action = "typechange";
	postdata.ServerType = $("#ServerType_select").val();
	postdata.sessionid = sessionidstr;
	XHR.post("set_voice_base_info", postdata, initPage);
}

function saveApply()
{
	show_shadow();
	if( !$("#voice_base_form").valid() )
	{
		if (gNewUiFlag)
            myAlert('Tip', '' + "value_invilid".i18n() + '', function() { })
        else
		alert("value_invilid".i18n());
		return;
	}
	var postdata = new Object();
	postdata.action = "setvalue";
	postdata.ServerType = voicedata.ServerType;
	if ( voicedata.ServerType == 2 )//h248
	{
		$("#MediaGatewayPort_text").val() == '' ? postdata.MediaGatewayPort = '0' : postdata.MediaGatewayPort = $("#MediaGatewayPort_text").val();
		$("#MediaGatewayControler_text").val() == '' ? postdata.MediaGatewayControler = '0.0.0.0' : postdata.MediaGatewayControler = $("#MediaGatewayControler_text").val();
		$("#MediaGatewayControlerPort_text").val() == '' ? postdata.MediaGatewayControlerPort = '0' : postdata.MediaGatewayControlerPort = $("#MediaGatewayControlerPort_text").val();
		$("#StandbyMediaGatewayControler_text").val() == '' ? postdata.StandbyMediaGatewayControler = '0.0.0.0' : postdata.StandbyMediaGatewayControler = $("#StandbyMediaGatewayControler_text").val();
		$("#StandbyMediaGatewayControlerPort_text").val() == '' ? postdata.StandbyMediaGatewayControlerPort = '0' : postdata.StandbyMediaGatewayControlerPort = $("#StandbyMediaGatewayControlerPort_text").val();
		$("#PhysicalTermIDPrefix_text").val() == '' ? postdata.PhysicalTermIDPrefix = 'NULL' : postdata.PhysicalTermIDPrefix = $("#PhysicalTermIDPrefix_text").val();
		$("#PhysicalTermIDStart_text").val() == '' ? postdata.PhysicalTermIDStart = 'NULL' : postdata.PhysicalTermIDStart = $("#PhysicalTermIDStart_text").val();
		$("#PhysicalTermIDAddLen_text").val() == '' ? postdata.PhysicalTermIDAddLen = '0' : postdata.PhysicalTermIDAddLen = $("#PhysicalTermIDAddLen_text").val();
		$("#RTPPrefix_text").val() == '' ? postdata.RTPPrefix = 'NULL' : postdata.RTPPrefix = $("#RTPPrefix_text").val();
		$("#EphemeralTermIDStart_text").val() == '' ? postdata.EphemeralTermIDStart = 'NULL' : postdata.EphemeralTermIDStart = $("#EphemeralTermIDStart_text").val();
		$("#EphemeralTermIDAddLen_text").val() == '' ? postdata.EphemeralTermIDAddLen = '0' : postdata.EphemeralTermIDAddLen = $("#EphemeralTermIDAddLen_text").val();
		
		postdata.DeviceIDType = $('#DeviceIDType_text').val();
		if ( $('#DeviceID_text').val() == '' )
		{
			if ('0' == $('#DeviceIDType_text').val() )
			{
				postdata.DeviceID = '0.0.0.0';
			}
			else
			{
				postdata.DeviceID = 'NULL';
			}
		}
		else
		{
			postdata.DeviceID = $('#DeviceID_text').val();
		}
		
		postdata.MessageEncodingType = $('#MessageEncodingType_text').val();
		postdata.PhysicalTermIDConfigMethod = $('#servicevoip_H248ConfigMethod').val();
		
		for ( i=1; i<=voicedata.voice_port_num; i++ )
		{
			postdata["Enable" + i] = eval("voicedata.Enable" + i);
			postdata["PhysicalTermID" + i] = $("#PS_PortID_" + i).val();
		}
	}
	else //sip ims
	{
	
		postdata.ProxyServer = $("#ProxyServer_text").val();
		postdata.ProxyServerPort = $("#ProxyServerPort_text").val();
		if(operator_name == "PH_PLDT")
		{
			postdata.RegistrarServer = $("#RegistrarServer_pldt").val();
		}
		else
		{
			postdata.RegistrarServer = $("#RegistrarServer_text").val();
		}
		postdata.RegistrarServerPort = $("#RegistrarServerPort_text").val();
		postdata.OutboundProxy = $("#OutboundProxy_text").val();
		postdata.OutboundProxyPort = $("#OutboundProxyPort_text").val();
		postdata.StandbyProxyServer = $("#StandbyProxyServer_text").val();
		postdata.StandbyProxyServerPort = $("#StandbyProxyServerPort_text").val();
		postdata.StandbyRegistrarServer = $("#StandbyRegistrarServer_text").val();
		postdata.StandbyRegistrarServerPort = $("#StandbyRegistrarServerPort_text").val();
		postdata.StandbyOutboundProxy = $("#StandbyOutboundProxy_text").val();
		postdata.StandbyOutboundProxyPort = $("#StandbyOutboundProxyPort_text").val();
		if(operator_name == "MY_TM"){
			postdata.option120_enable = $("input[name='option120enable']:checked").val();
		}
        
		for (var i=1; i<=voicedata.voice_port_num; i++ ){
			postdata["Enable" + i] = eval("voicedata.Enable" + i);
			var temp_phone_num = $("#AuthUserName_text_" + i).val().split("@")[0];
			if($("#DirectoryNumber_text_" + i).val()=="")//20191218 语音程亮方面需求，在号码不填写的时候，使用用户名的@前缀作为号码填入
			{
				postdata["DirectoryNumber" + i] = fhencrypt(temp_phone_num);
			}
			else
			{
				postdata["DirectoryNumber" + i] = fhencrypt($("#DirectoryNumber_text_" + i).val());
			}
			postdata["AuthUserName" + i] = fhencrypt($("#AuthUserName_text_" + i).val());

			if(operator_name == "BZ_INTELBRAS"){
				if($("#AuthPassword_password_" + i).val() == voip_password_encode){
					postdata["AuthPassword" + i] = fhencrypt(voip_password_encode);
				}else{
					postdata["AuthPassword" + i] = fhencrypt($("#AuthPassword_password_" + i).val());
				}
			}else{
				postdata["AuthPassword" + i] = fhencrypt($("#AuthPassword_password_" + i).val());
			}

			if(operator_name == "COL_MILLICOM"){
				postdata["URI" + i] = $("#URI_text_" + i).val();
			}
		}
	}
	XHR.post("set_voice_base_info", postdata, initPage);	
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
	//		$("#" + id).val(voip_password_encode);
	//}
}