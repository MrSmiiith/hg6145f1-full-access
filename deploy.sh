#!/bin/sh
# FiberHome HG6145F1 Custom WebUI Deploy Script
# By Smothy — https://merzougrayane.com/
# Numb Team — https://numbhub.com/
#
# Usage: sh deploy.sh http://YOUR_IP:9999

BASE_URL="$1"
DEST="/var/www-custom"

if [ -z "$BASE_URL" ]; then
    echo "Usage: sh deploy.sh http://YOUR_IP:PORT"
    echo "Run 'python3 -m http.server 9999' in the repo directory first"
    exit 1
fi

echo "[*] Downloading custom WebUI files..."
mkdir -p "$DEST/cgi-bin" "$DEST/css" "$DEST/html" "$DEST/image" "$DEST/js" "$DEST/menu"

# Download all files
wget -q -O "$DEST/cgi-bin/ajax" "$BASE_URL/webui-files/cgi-bin/ajax"
wget -q -O "$DEST/css/index.css" "$BASE_URL/webui-files/css/index.css"
wget -q -O "$DEST/css/main_style.css" "$BASE_URL/webui-files/css/main_style.css"
wget -q -O "$DEST/css/mainLeft.css" "$BASE_URL/webui-files/css/mainLeft.css"
wget -q -O "$DEST/css/style.css" "$BASE_URL/webui-files/css/style.css"
wget -q -O "$DEST/css/dark-theme.css" "$BASE_URL/webui-files/css/dark-theme.css"
wget -q -O "$DEST/image/logo_Intelbras_fiberhome.png" "$BASE_URL/webui-files/image/logo_Intelbras_fiberhome.png"
wget -q -O "$DEST/html/broadband_inter.html" "$BASE_URL/webui-files/html/broadband_inter.html"
wget -q -O "$DEST/html/login_inter.html" "$BASE_URL/webui-files/html/login_inter.html"
wget -q -O "$DEST/html/main_inter.html" "$BASE_URL/webui-files/html/main_inter.html"
wget -q -O "$DEST/html/snpwdauth_inter.html" "$BASE_URL/webui-files/html/snpwdauth_inter.html"
wget -q -O "$DEST/html/voice_base_inter.html" "$BASE_URL/webui-files/html/voice_base_inter.html"
wget -q -O "$DEST/html/ddns_new_inter.html" "$BASE_URL/webui-files/html/ddns_new_inter.html"
wget -q -O "$DEST/js/broadband_inter.js" "$BASE_URL/webui-files/js/broadband_inter.js"
wget -q -O "$DEST/js/ddns_new_inter.js" "$BASE_URL/webui-files/js/ddns_new_inter.js"
wget -q -O "$DEST/js/logView.js" "$BASE_URL/webui-files/js/logView.js"
wget -q -O "$DEST/js/page_access_check.js" "$BASE_URL/webui-files/js/page_access_check.js"
wget -q -O "$DEST/js/access.js" "$BASE_URL/webui-files/js/access.js"
wget -q -O "$DEST/js/snpwdauth_inter.js" "$BASE_URL/webui-files/js/snpwdauth_inter.js"
wget -q -O "$DEST/js/util.js" "$BASE_URL/webui-files/js/util.js"
wget -q -O "$DEST/js/voice_base_inter.js" "$BASE_URL/webui-files/js/voice_base_inter.js"
wget -q -O "$DEST/js/xhr.js" "$BASE_URL/webui-files/js/xhr.js"
wget -q -O "$DEST/js/wlanAdvancedSettings_inter.js" "$BASE_URL/webui-files/js/wlanAdvancedSettings_inter.js"
wget -q -O "$DEST/js/wlanAdvancedSettings_5G_inter.js" "$BASE_URL/webui-files/js/wlanAdvancedSettings_5G_inter.js"
wget -q -O "$DEST/js/wlanGuset_inter.js" "$BASE_URL/webui-files/js/wlanGuset_inter.js"
wget -q -O "$DEST/menu/sub_menu_admin_inter" "$BASE_URL/webui-files/menu/sub_menu_admin_inter"

chmod +x "$DEST/cgi-bin/ajax"

echo "[*] Applying bind mounts..."

# Unmount any previous custom mounts
for f in cgi-bin/ajax menu/sub_menu_admin_inter css/index.css css/main_style.css css/mainLeft.css \
    image/logo_Intelbras_fiberhome.png html/broadband_inter.html html/login_inter.html \
    html/main_inter.html html/snpwdauth_inter.html html/voice_base_inter.html html/ddns_new_inter.html \
    js/broadband_inter.js js/ddns_new_inter.js js/logView.js js/page_access_check.js js/access.js \
    js/snpwdauth_inter.js js/util.js js/voice_base_inter.js js/xhr.js \
    js/wlanAdvancedSettings_inter.js js/wlanAdvancedSettings_5G_inter.js; do
    umount "/www/$f" 2>/dev/null
done

# Apply bind mounts
for f in cgi-bin/ajax menu/sub_menu_admin_inter css/index.css css/main_style.css css/mainLeft.css \
    image/logo_Intelbras_fiberhome.png html/broadband_inter.html html/login_inter.html \
    html/main_inter.html html/snpwdauth_inter.html html/voice_base_inter.html html/ddns_new_inter.html \
    js/broadband_inter.js js/ddns_new_inter.js js/logView.js js/page_access_check.js js/access.js \
    js/snpwdauth_inter.js js/util.js js/voice_base_inter.js js/xhr.js \
    js/wlanAdvancedSettings_inter.js js/wlanAdvancedSettings_5G_inter.js; do
    mount --bind "$DEST/$f" "/www/$f" 2>/dev/null && echo "  [+] $f"
done

# Enable SSH
if ! pidof dropbear >/dev/null 2>&1; then
    /fhrom/bin/dropbear -p 22 -r /fhconf/dropbear_rsa_host_key 2>/dev/null &
    echo "[+] SSH started on port 22"
fi

# Flush iptables
iptables -F 2>/dev/null
iptables -P INPUT ACCEPT 2>/dev/null
iptables -P OUTPUT ACCEPT 2>/dev/null
iptables -P FORWARD ACCEPT 2>/dev/null

echo "[*] Done! Refresh http://192.168.1.1"
