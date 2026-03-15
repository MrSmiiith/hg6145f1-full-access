var goperator_name = null;
var devicename = null;
var gNewUiFlag = false;
XHR.get("get_operator", null, function(data) {
	if (data) {
		if(data.UI_flag == "1"){
			gNewUiFlag = true;	
		}
	}
});
if (goperator_name === null) {
	XHR.get("get_operator_test", null, function(data) {
		if (data) {
			goperator_name = data.operator_name;
		}
	});
	XHR.get("get_device_name", null, function(data) {
		devicename = data.ModelName
	});
	if (gNewUiFlag) {
		goperator_name = "COMMON_NEW_UI"
	}

}

function loginPageAccessCheck(operator_name, curentpage) {
	return;
	var url;
	if (curentpage == "3bb.html" || curentpage == "rmnt.html" || curentpage == "update.html" || curentpage == "tr069.html" || curentpage == "changemode.html") {
		if (operator_name != "TH_3BB") {
			url = "html/login_inter.html";
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "html/login_pldt.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "public/index.html";
			}
			if (operator_name == "PLE_PALTEL") {
				url = "html/login_paltel.html";
			}
			if (operator_name == "TH_AIS") {
				url = "html/login_ais.html";
			}
			if (operator_name == "BZ_INTELBRAS") {//BZ_INTELBRAS
				url = "html/login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "html/login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "help.html") {
		if (operator_name != "PH_PLDT") {
			url = "html/login_inter.html";
			if (operator_name == "BZ_TIM") {
				url = "public/index.html";
			}
			if (operator_name == "PLE_PALTEL") {
				url = "html/login_paltel.html";
			}
			if (operator_name == "TH_AIS") {
				url = "html/login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "html/login_3bb.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "html/login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "html/login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "index_th_ais.html" || curentpage == "LandingPage.html") {
		if (operator_name != "TH_AIS") {
			url = "html/login_inter.html";
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "html/login_pldt.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "public/index.html";
			}
			if (operator_name == "PLE_PALTEL") {
				url = "html/login_paltel.html";
			}
			if (operator_name == "TH_3BB") {
				url = "html/login_3bb.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "html/login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "html/login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
}


function loginHtmlAccessCheck(operator_name, curentpage) {
	return;
	var url;
	if (curentpage == "login_3bb.html") {
		if (operator_name != "TH_3BB") {
			url = "login_inter.html";
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "PLE_PALTEL") {
				url = "login_paltel.html";
			}
			if (operator_name == "TH_AIS") {
				url = "login_ais.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "login_romania.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_ais.html") {
		if (operator_name != "TH_AIS") {
			url = "login_inter.html";
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "PLE_PALTEL") {
				url = "login_paltel.html";
			}
			if (operator_name == "TH_3BB") {
				url = "login_3bb.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "login_romania.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_paltel.html") {
		if (operator_name != "PLE_PALTEL") {
			url = "login_inter.html";
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "TH_AIS") {
				url = "login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "login_3bb.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "login_romania.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_pldt.html") {
		if (operator_name != "PH_PLDT") {
			url = "login_inter.html";
			if(operator_name == "PLE_PALTEL"){
				url = "login_paltel.html";
			}
			if(operator_name == "BZ_TIM"){
				url = "index.html";
			}
			if(operator_name == "TH_AIS"){
				url = "login_ais.html";
			}
			if(operator_name == "TH_3BB"){
				url = "login_3bb.html";
			}
			if(operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG"){
				url = "login_romania.html";
			}
			if(operator_name == "BZ_INTELBRAS"){
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_romania.html") {
		if (operator_name != "ROM_RCSRDS" && operator_name != "MAGYAR_4IG") {
			url = "login_inter.html";
			if(operator_name == "PLE_PALTEL"){
				url = "login_paltel.html";
			}
			if(operator_name == "BZ_TIM"){
				url = "index.html";
			}
			if(operator_name == "TH_AIS"){
				url = "login_ais.html";
			}
			if(operator_name == "TH_3BB"){
				url = "login_3bb.html";
			}
			if(operator_name == "PH_PLDT"){
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if(operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG"){
				url = "login_romania.html";
			}
			if(operator_name == "BZ_INTELBRAS"){
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}	
	}
	else if (curentpage == "login_mytm.html") {
		if (operator_name != "MY_TM") {
			url = "login_inter.html";
			if(operator_name == "PLE_PALTEL"){
				url = "login_paltel.html";
			}
			if(operator_name == "BZ_TIM"){
				url = "index.html";
			}
			if(operator_name == "TH_AIS"){
				url = "login_ais.html";
			}
			if(operator_name == "TH_3BB"){
				url = "login_3bb.html";
			}
			if(operator_name == "PH_PLDT"){
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if(operator_name == "BZ_INTELBRAS"){
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}	
	}
	else if (curentpage == "login_ed.html") {
		if (operator_name != "EG_TELECOM") {
			url = "login_inter.html";
			if (operator_name == "PLE_PALTEL") {
				url = "login_paltel.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "TH_AIS") {
				url = "login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "login_3bb.html";
			}
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "login_bz_intelbras.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_bz_intelbras.html") {
		if (operator_name != "BZ_INTELBRAS") {
			url = "login_inter.html";
			if (operator_name == "PLE_PALTEL") {
				url = "login_paltel.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "TH_AIS") {
				url = "login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "login_3bb.html";
			}
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "login_romania.html";
			}
			if(operator_name == "EG_TELECOM"){
				url = "login_ed.html";
			}
			if(operator_name == "MY_TM"){
				url = "login_mytm.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "login_mex_netwey.html";
			}
    		window.location.href = url;
    	}	
    }
	else if(curentpage == "login_inter.html"){
		var url;
		if(operator_name == "PLE_PALTEL"){
			url = "login_paltel.html";
			window.location.href = url;
		}
		// if(operator_name == "BZ_TIM"){
		// 	url = "/public/index.html";
		// 	window.location.href = url;
		// }
		if(operator_name == "TH_AIS"){
			url = "login_ais.html";
			window.location.href = url;
		}
		if(operator_name == "TH_3BB"){
			url = "login_3bb.html";
			window.location.href = url;
		}
		if(operator_name == "PH_PLDT"){
			sessionStorage.setItem("fh_access", "0");
			url = "login_pldt.html";
			window.location.href = url;
		}	
		if(operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG"){
			url = "login_romania.html";
			window.location.href = url;
		}
		if (operator_name == "COMMON_NEW_UI") {
			url = "../new_ui/login.html";
			window.location.href = url;
		}
		if (operator_name == "BZ_INTELBRAS") {
			url = "login_bz_intelbras.html";
			window.location.href = url;
		}
		if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
			url = "login_mex_netwey.html";
			window.location.href = url;
		}

	}
	else if (curentpage == "login.html") {
		if (operator_name != "COMMON_NEW_UI") {
			url = "../html/login_inter.html";
			if (operator_name == "PLE_PALTEL") {
				url = "../html/login_paltel.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "../html/index.html";
			}
			if (operator_name == "TH_AIS") {
				url = "../html/login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "../html/login_3bb.html";
			}
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "../html/login_pldt.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "../html/login_romania.html";
			}
			if (operator_name == "EG_TELECOM") {
				url = "../html/login_ed.html";
			}
			if (operator_name == "MY_TM") {
				url = "../html/login_mytm.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "../html/login_bz_intelbras.html";
			}
			if (operator_name == "MEX_NETWEY") {//MEX_NETWEY
				url = "../html/login_mex_netwey.html";
			}
			window.location.href = url;
		}
	}
	else if (curentpage == "login_mex_netwey.html") {
		if (operator_name != "MEX_NETWEY") {
			url = "login_inter.html";
			if (operator_name == "PLE_PALTEL") {
				url = "login_paltel.html";
			}
			if (operator_name == "BZ_TIM") {
				url = "index.html";
			}
			if (operator_name == "TH_AIS") {
				url = "login_ais.html";
			}
			if (operator_name == "TH_3BB") {
				url = "login_3bb.html";
			}
			if (operator_name == "PH_PLDT") {
				sessionStorage.setItem("fh_access", "0");
				url = "login_pldt.html";
			}
			if (operator_name == "ROM_RCSRDS" || operator_name == "MAGYAR_4IG") {
				url = "login_romania.html";
			}
			if(operator_name == "EG_TELECOM"){
				url = "login_ed.html";
			}
			if(operator_name == "MY_TM"){
				url = "login_mytm.html";
			}
			if (operator_name == "COMMON_NEW_UI") {
				url = "../new_ui/login.html";
			}
			if (operator_name == "BZ_INTELBRAS") {
				url = "login_bz_intelbras.html";
			}
    		window.location.href = url;
    	}	
    }
}
