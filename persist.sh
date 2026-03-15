#!/bin/sh
# FiberHome HG6145F1 Boot Persistence Script
# By Smothy — https://merzougrayane.com/
# Numb Team — https://numbhub.com/
#
# Stored in /fhconf/custom-webui/ (survives reboot)
# Run with: sh persist.sh
# First-time setup: sh persist.sh setup_boot

PERSIST="/fhconf/custom-webui"
DEST="/var/www-custom"
WWW="/www"

echo "[*] Applying custom WebUI from $PERSIST ..."

# Copy persistent files to writable location for bind mounts
mkdir -p "$DEST/cgi-bin" "$DEST/css" "$DEST/html" "$DEST/image" "$DEST/js" "$DEST/menu"
cp -r "$PERSIST/cgi-bin/"* "$DEST/cgi-bin/" 2>/dev/null
cp -r "$PERSIST/css/"* "$DEST/css/" 2>/dev/null
cp -r "$PERSIST/html/"* "$DEST/html/" 2>/dev/null
cp -r "$PERSIST/image/"* "$DEST/image/" 2>/dev/null
cp -r "$PERSIST/js/"* "$DEST/js/" 2>/dev/null
cp -r "$PERSIST/menu/"* "$DEST/menu/" 2>/dev/null
chmod +x "$DEST/cgi-bin/ajax"

# Apply bind mounts
for f in cgi-bin/ajax menu/sub_menu_admin_inter css/index.css css/main_style.css css/mainLeft.css \
    image/logo_Intelbras_fiberhome.png html/broadband_inter.html html/login_inter.html \
    html/main_inter.html html/snpwdauth_inter.html html/voice_base_inter.html html/ddns_new_inter.html \
    js/broadband_inter.js js/ddns_new_inter.js js/logView.js js/page_access_check.js js/access.js \
    js/snpwdauth_inter.js js/util.js js/voice_base_inter.js js/xhr.js \
    js/wlanAdvancedSettings_inter.js js/wlanAdvancedSettings_5G_inter.js; do
    [ -f "$DEST/$f" ] && mount --bind "$DEST/$f" "$WWW/$f" 2>/dev/null
done

echo "[+] Bind mounts applied"

# Flush iptables
iptables -F 2>/dev/null
iptables -P INPUT ACCEPT 2>/dev/null
iptables -P OUTPUT ACCEPT 2>/dev/null
iptables -P FORWARD ACCEPT 2>/dev/null

# Enable SSH
if ! pidof dropbear >/dev/null 2>&1; then
    /fhrom/bin/dropbear -p 22 -r /fhconf/dropbear_rsa_host_key 2>/dev/null &
    echo "[+] SSH started on port 22"
fi

echo "[*] All services started"

# Boot persistence setup (run once)
if [ "$1" = "setup_boot" ]; then
    echo "[*] Setting up boot persistence..."

    # Save files to persistent storage
    mkdir -p "$PERSIST"
    cp -r "$DEST/"* "$PERSIST/" 2>/dev/null
    cp "$0" "$PERSIST/apply.sh" 2>/dev/null

    # Hook into fhconf_init.sh (runs on every boot)
    FHINIT="/etc/init.d/fhconf_init.sh"
    if [ -f "$FHINIT" ] && ! grep -q 'custom-webui' "$FHINIT" 2>/dev/null; then
        cp "$FHINIT" /tmp/fhconf_init_mod.sh
        echo "" >> /tmp/fhconf_init_mod.sh
        echo "# Custom WebUI - auto apply on boot" >> /tmp/fhconf_init_mod.sh
        echo "(sleep 10 && /bin/sh $PERSIST/apply.sh) &" >> /tmp/fhconf_init_mod.sh
        mount --bind /tmp/fhconf_init_mod.sh "$FHINIT"
    fi

    # Crontab backup
    CRON_LINE="@reboot /bin/sh $PERSIST/apply.sh"
    (crontab -l 2>/dev/null | grep -v "custom-webui"; echo "$CRON_LINE") | crontab - 2>/dev/null

    echo "[+] Boot persistence installed — will survive reboot"
fi
