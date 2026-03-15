//do access control before load DOM elements
var login_user = gLoginUser;
var operator_name = gOperatorName;
var dev_info = gDeviceInfo;
var NewUiFlag  = gNewUiFlag;
var multiap_flag = gMultiapFlag;
var model_name = gModelName;
var area_code = gArea_code;
(function() {
    //登录用户0:普通用户 1:管理员用户 2:超级管理员用户 
    /*页面接入权限列表，多用户可见相加
    -1:无需登录即可见
    1:普通用户可见
    2:管理员用户可见
    4:超级管理员用户可见
    */
    var accessLevelArray = new Array(
        ["index.html", "-1"],
        ["main_inter.html", "3"],
        ["login_inter.html", "-1"],
        //Status
        ["stateOverview_inter.html", "3"],
        ["wifi_info_inter.html", "3"],
        ["wifi_info_inter5g.html", "3"],
        ["wifi_list_inter.html", "3"],
        ["ipconInfo_inter.html", "3"],
        ["statslan_inter.html", "3"],
        ["ethernetPorts.html", "2"],
        ["dhcp_user_list_inter.html", "3"],
        ["pon_link_info_inter.html", "3"],
        ["voice_info_inter.html", "3"],
        ["wifi_coverage_inter.html", "3"],
        ["dhcpv6_info_inter.html", "3"],
        //Network 
        ["band_steering.html", "3"],
        ["wlanBasicSettings_inter.html", "3"],//network
        ["wlanAdvancedSettings_inter.html", "3"],
        ["wlanControl_inter.html", "2"],
        ["wlanBasicSettings_5G_inter.html", "3"],
        ["wlanAdvancedSettings_5G_inter.html", "3"],
        ["wlanControl_5G_inter.html", "2"],
        ["wlanwps_inter.html", "3"],
        ["lan_ipv4_inter.html", "2"],
        ["dhcp_lan_inter.html", "2"],
        ["broadband_inter.html", "2"],
        ["iptv_inter.html", "2"],
        ["acs_config.html", "2"],
        ["snpwdauth_inter.html", "2"],
        ["voice_enable_inter.html", "2"],
        ["voice_base_inter.html", "2"],
        ["voice_advance_inter.html", "2"],
        ["voice_timer_inter.html", "2"],
        ["voice_codec_inter.html", "2"],
        ["ipv4_default_route.html", "2"],
        ["ipv4_static_route.html", "2"],
        ["qoslimit_inter.html", "2"],
        ["qos_base_inter.html", "2"],
        ["qos_queue_inter.html", "2"],
        ["qos_app_inter.html", "2"],
        ["qos_class_inter.html", "2"],
        //Security
        ["firewall_enable_inter.html", "2"],//firewall
        ["main_ipfilterv4_inter.html", "2"],
        ["main_ipfilterv6_inter.html", "2"],
        ["dhcp_filter_inter.html", "2"],
        ["url_filter_inter.html", "2"],
        ["port_scan_inter.html", "2"],
        ["mac_filter_inter.html", "2"],
        ["acl_setting.html", "2"],
        ["ipv6_acl_setting.html", "2"],
        ["ddos_enable_inter.html", "2"],
        ["HTTPS_inter.html", "2"],
        //application
        ["vpn_through_inter.html", "2"],
        ["ddns_new_inter.html", "2"],
        ["portmapping_inter.html", "2"],
        ["nat.html", "2"],
        ["upnp.html", "2"],
        ["dmz_inter.html", "2"],
        ["web_port.html", "2"],
        ["ping_inter.html", "2"],
        ["traceroute_inter.html", "2"],
        ["port_mirror_inter.html", "2"],
        ["samba.html","2"],
        ["alg_inter.html","2"],
        ["upnp.html","2"],
        //management
        ["admin_management_inter.html", "2"],
        ["user_management_inter.html", "3"],
        ["restoreDefault.html", "2"],
        ["ledstate.html", "2"],
        ["down_cfgfile.html", "2"],
        ["reboot.html", "3"],
        ["ntp_inter.html", "2"],
        ["catv_inter.html", "2"],
        ["ftp_server.html", "2"],
        ["logView.html", "2"],
        ["system_log.html", "2"],
        ["logSettings_inter.html", "2"],
        ["parental_control_inter.html", "2"],
        ["traffic_control.html", "2"],
        
        ["mqtt.html", "2"],

        ["schedule_reboot.html", "2"],
        ["service_config_inter.html", "2"],
        ["LanMode_inter.html", "2"],
        ["dlna_enable.html", "2"],
        ["dnssetting_inter.html", "2"],
        ["LanMode_inter.html", "2"],
        ["preset.html", "2"],
        ["preconfigure.html", "2"],
        ["remote_manage_inter.html", "2"],
        ["usb_info_inter.html", "2"],
        ["wlanGuest_inter.html", "2"]
    );
    

 function htmlAccessControl() {
    var herfArray = window.location.pathname.split("/");
    var htmlName = herfArray[herfArray.length - 1];
    if (htmlName == "") {
        return;
    }
    
    var singleAccessLevel; 
    var accessArray = accessLevelArray; // Assuming accessLevelArray is global

    /* Add capabilities based on device flags */
    var accessArrayMultiAP = [
        ["multi_ap_enable.html", "7"], 
        ["topo_new.html", "7"]
    ];
    
    if (typeof multiap_flag !== 'undefined' && multiap_flag == "1") {
        accessArray = accessArray.concat(accessArrayMultiAP);
    }

    if (typeof NewUiFlag !== 'undefined' && NewUiFlag == "1") {
        accessArray = accessArray.concat(accessArrayNewUI);
    }
    
    // Filter out pages based on device hardware (Voice, WiFi, USB)
    if (dev_info.voice_port_num == 0 || operator_name == "FTTR_SUB_COMMON") {
        accessArray = accessArray.filter(function(item) {
            return item[0].indexOf("voice") == -1;
        });
    }

    if (dev_info.wifi_enable == 0) {
        accessArray = accessArray.filter(function(item) {
            return (item[0].indexOf("wifi") == -1 && item[0].indexOf("wlan") == -1);
        });
    } else if (dev_info.wifi_5g_enable == 0) {
        accessArray = accessArray.filter(function(item) {
            return (item[0].indexOf("5g") == -1 && item[0].indexOf("5G") == -1);
        });
    }

    if (dev_info.usb_port_num == 0) {
        accessArray = accessArray.filter(function(item) {
            return item[0].indexOf("ftp_server") == -1;
        });
    }
      
    /* UI Path Access Logic */
    var pathname = herfArray[herfArray.length - 2];
    if (gNewUiFlag && pathname == "html") {
        accessArray = [];
    } else if (!gNewUiFlag && pathname == "new_ui") {
        accessArray = [];
    }

    if (!gNewUiFlag) {
        accessArray = accessArray.filter(function(item) {
            return (item[0].indexOf("main_new_ui") == -1 && item[0].indexOf("home_new") == -1);
        });
    } else {
        accessArray = accessArray.filter(function(item) {
            return (item[0].indexOf("main_inter") == -1);
        });
    }

    // Determine if the current page is in the allowed list
    for (var i = 0; i < accessArray.length; i++) {
        if (htmlName == accessArray[i][0]) {
            singleAccessLevel = accessArray[i][1];
            break;
        }
    }

    // Handle Access Redirection
    if (singleAccessLevel >= 0) {
        var requestURL = '../cgi-bin/is_logined.cgi?_=' + Math.random();
        $.ajax({
            url: requestURL,
            dataType: 'json',
            type: "POST",
            async: false,
            success: function(returndata) {
                if (returndata.result == 0) {
                    window.parent.location = "../index.html";
                } else {
                    var userAccessLevel = parseInt(returndata.user);
                    // Bitwise check for access permission
                    if (userAccessLevel != (userAccessLevel & singleAccessLevel)) {
                        window.parent.location = "../index.html";
                    }
                    // Optional: XHR.get("get_heartbeat", null, null); can go here
                }
            },
            error: function() {
                if (typeof fiberlog === "function") fiberlog("do is_logined.cgi failed");
            }
        });
    } else if (singleAccessLevel == -1) {
        // Do nothing, allow access
    } else {
        // Redirect to BadRequest if page not found in allowed list
        var protocol = window.location.protocol;
        var host = window.location.host;
        window.location.href = protocol + "//" + host + "/BadRequest";
    }
  }
    htmlAccessControl();
})(jQuery);
