var g_data;
var login_user = "";
var operator_name = gOperatorName;
var loid_pwd_encode;
$(document).ready(function(){
	//优化滚动条，无需改动
	//customScrollBar("html");
	initValidate();
	if ( gDebug ) //调试模式读取本地数据
	{
		getDataByAjax("../fake/oltauth", initPage);
	}
	else
	{
		XHR.get("get_loid_phy_pwd", null, initPage);
	}
	//解决密码框自动填充问题
	if(gOperatorName != "EG_TELECOM"){
		setTimeout(function(){
			document.getElementById("LoidId_text").removeAttribute("disabled");
		}, 1000);
	}

	if(gOperatorName == "TH_AIS"){
		 $(".main_item_name").css("width","15%");
		$(".main_item_content").css("width","calc(85% - 3px)");
	}

	if(operator_name == "ALGERIA_TELECOM"){
		//$("#button_change_eye").hide();
		//$("#show_password").hide();
		//$("#Pwd_password").prop('type', "password");	
		//$("#Loidpwd_text").prop('type', "password");	
	}
});

function change_eye()
{
    $("#Loidpwd_text").toggleClass("fh-text-security");	 
}

function change_passKey_eye()
{
    $("#Pwd_password").toggleClass("fh-text-security");	
}

function initValidate()
{
	$("#loid_form").validate({
		debug: false,
		rules: {
			"LoidId_text": {required: true, maxlength:24, minlength:1, nocn: true},
			"Loidpwd_text": { maxlength:12, nocn: true}
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法
			error.insertAfter(element.parent().parent());
		},
		messages: {
		},
		submitHandler: function(form){//校验成功回调
			fiberlog("validate user management settings ok.....");
		},
		invalidHandler: function(form, validator) {  //校验失败回调
			fiberlog("validate user management failed.....");
			return false;
		}
	}); 
}

function initPage(data)
{
	login_user = gLoginUser;
	if (data != null && data && data.loid_phy)
	{
		g_data = data.loid_phy;
		var usernamecfg_enable = g_data.usernamecfg_enable;
		displayLOIDHtml();
		displayPWDHtml();
	}
	//泰国TRUE的普通用户在该页面无法进行任何操作
	if(login_user =="0" && (operator_name == "TH_TRUE"|| operator_name == "TH_SME_TRUE"))
	{
		if(usernamecfg_enable == 0){
			$(".input_text").attr("disabled", true);
			$(".input_button").attr("disabled", true);
		}
		else if(usernamecfg_enable == 1){
			
			$(".input_text").attr("disabled", true);
			$(".input_button").attr("disabled", true);
			$("#LoidId_text").attr("disabled", false);
			$("#loid_save").attr("disabled", false);
			$("#loid_cancle").attr("disabled", false);
		}
	}
		
	//巴西Claro的普通用户在该页面无法进行任何操作
	if((login_user =="0" && operator_name == "BZ_CLARO") || operator_name == "EG_TELECOM")
	{
		$(".input_text").attr("disabled", true);
		$(".input_button").attr("disabled", true);
	}
}

function displayLOIDHtml()
{
	$("#LoidId_text").val(g_data.loid_name);
	//if(operator_name == "ALGERIA_TELECOM"){
	//	loid_pwd_encode = g_data.loid_pwd_encode
	//	$("#Loidpwd_text").val(loid_pwd_encode);
	//}else{
		$("#Loidpwd_text").val(fhdecrypt(g_data.loid_pwd));
	//}
}

function displayPWDHtml()
{
	//if(operator_name == "ALGERIA_TELECOM"){
	//	$("#Pwd_password").val(g_data.password_encode);
	//}else{
		$("#Pwd_password").val(fhdecrypt(g_data.password));
	//}
}

function LOIDCancel()
{
	displayLOIDHtml();
}

function PWDCancel()
{
	displayPWDHtml();
}

function isLetterornumber(s)//是否为字母或者数字或者_
{
	if (s == ""){
	    return true;
	}

	//if(operator_name == "ALGERIA_TELECOM" && s== loid_pwd_encode){
	//	return true;
	//}

	var re = /^[A-Za-z0-9\_\-]*$/g ;
	return re.test(s);
}

function LOIDsaveApply()
{
	$(".main_item_error_hint_extra").html("");
	if( !$("#loid_form").valid())
	{
		if (gNewUiFlag)
            myAlert('Tip', '' + "sncfg_value_invilid".i18n() + '', function() { })
        else
		alert("sncfg_value_invilid".i18n());
		return;
	}
	var LoidId_text = $("#LoidId_text").val();
	var Loidpwd_text = $("#Loidpwd_text").val();
	if(operator_name == "FTTR_SUB_COMMON" || operator_name == "FTTR_MAIN_SFU_COMMON"){
		if (!isLetter_number(LoidId_text)){
			$("#LOID_error").html("sncfg_loidIllegalAlert".i18n());
			return;
		}
	
		if (!isLetter_number(Loidpwd_text)){
			$("#sncfg_lopwd_error").html("sncfg_lopwdIllegalAlert".i18n());
			return;
		}
	}
	

	var postdata = new Object();
	postdata.method = "loid";
	postdata.LoidId_text = LoidId_text;
	postdata.Loidpwd_text = fhencrypt(Loidpwd_text);
	show_shadow();
	XHR.post("set_loid_phy_pwd", postdata, initPage);
}

function isLetter_number(s){
	var re = /^[A-Za-z0-9]+$/g;
	return re.test(s);
}

function PWDsaveApply()
{	
	$(".main_item_error_hint_extra").html("");
	var Pwd_password = $("#Pwd_password").val();
	if (Pwd_password.length < 0 || Pwd_password.length > 10 || !isLetterornumber(Pwd_password))
	{
		if(gNewUiFlag)
			myAlert('Tip', "sncfg_pwdCfgIllegalAlert".i18n())
		else
			alert("sncfg_pwdCfgIllegalAlert".i18n())
		return;
	}
	var postdata = new Object();
	postdata.method = "password";
	postdata.Pwd_password = fhencrypt(Pwd_password);
	show_shadow();
	XHR.post("set_loid_phy_pwd", postdata, initPage);
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
	//		$("#" + id).val(loid_pwd_encode);
	//}
}


