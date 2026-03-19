# CVE Submissions — FiberHome HG6145F1 (Algeria Telecom RP4423)

Reference URL for all: https://github.com/MrSmiiith/hg6145f1-full-access
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: Firmware RP4423 (compiled June 9, 2025)
Discovered by: Smothy (Rayane Merzoug) / Numb Team

---

## CVE #5 — Unauthenticated Information Disclosure

**MITRE Form Fields:**

- **Vulnerability Type:** Information Disclosure
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Remote
- **Impact:** Information Disclosure
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) exposes sensitive device information via unauthenticated HTTP API endpoints. The CGI endpoint at /cgi-bin/ajax accepts the "get_base_info" method without requiring authentication, returning detailed device information including:

- Bridge MAC address (88:65:9F:6A:D7:70)
- TR-069 MAC address
- GPON Serial Number (used for ISP authentication)
- Hardware version (WKE2.094.424A01)
- Software version (RP4423)
- ONU registration state and LOID
- CPU/memory usage
- System uptime
- LAN port link status
- Optical power levels (Tx/Rx)

The MAC address disclosure is particularly critical because the admin password is derived from the MAC address (see CVE for Predictable Admin Password), allowing an unauthenticated attacker on the local network to chain these vulnerabilities for full admin access.

Other unauthenticated endpoints include: get_device_name, get_operator, get_refresh_sessionid.

**CVSS:** 5.3 (Medium) — AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N

---

## CVE #6 — XOR Config File "Encryption"

**MITRE Form Fields:**

- **Vulnerability Type:** Use of a Broken or Risky Cryptographic Algorithm (CWE-327)
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Local
- **Impact:** Information Disclosure
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) uses a trivially reversible XOR-based "encryption" for configuration file protection. The function fhapi_file_crypt_decrypt() in libfhapi.so implements:

```
for (i = len - len/9527; i != 2*len - len/9527; i++)
    output = getc(file) ^ (i + 9527);
```

This is a simple XOR cipher with a predictable counter starting at offset 9527. No key is required to decrypt. Any configuration file exported from the router (containing PPPoE credentials, VoIP passwords, WiFi keys, and other sensitive settings) can be decrypted offline by anyone with access to the file.

This is separate from the AES encryption vulnerability — the XOR cipher is used for config file import/export while AES is used for individual credential storage.

**CVSS:** 7.5 (High) — AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

---

## CVE #7 — Boot Process Manufacturer Backdoor

**MITRE Form Fields:**

- **Vulnerability Type:** Hidden Functionality / Backdoor (CWE-912)
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Physical / Serial Console
- **Impact:** Code Execution, Security Bypass
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) contains a manufacturer backdoor in the boot initialization script /etc/init.d/initialize.sh (also at /fhrom/fhshell/initialize.sh). During boot, the script reads 9 characters from the serial console within a 2-second window and checks them against a hardcoded SHA1 hash and MAC-derived value:

```bash
macaddr=$(uci get /fhdata/factory_conf.brmac.value | tr -d ":" | tr [a-z] [A-Z] | tr [0123456789ABCDEF] [FEDCBA9876543210])
macaddr=${macaddr:6:6}
read -n9 -t 2 passwd
passwd1=${passwd:0:3}
passwd2=${passwd:3:6}
passwd_fh=$(echo -n $passwd1 | sha1sum | cut -d " " -f1)
if [ $passwd_fh == "ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2" ]; then
    if [ $passwd2 == $macaddr ]; then
        echo "force exit!!"
        exit 0
    fi
fi
```

The first 3 characters are validated against SHA1 hash ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2. The remaining 6 characters must match a transformed (character-substituted) version of the last 6 digits of the router's MAC address. When the correct 9-character password is entered via serial console during the 2-second boot window, the initialization script exits immediately, dropping the user to a root shell and bypassing all security initialization.

This backdoor allows any attacker with physical access (serial console/UART) and knowledge of the MAC address to gain full root access to the device.

**CVSS:** 9.0 (Critical) — AV:P/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H

---

## CVE #8 — Cleartext Credential Transmission

**MITRE Form Fields:**

- **Vulnerability Type:** Cleartext Transmission of Sensitive Information (CWE-319)
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Network
- **Impact:** Information Disclosure
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) serves its web administration interface over HTTP (port 80) by default with no HTTPS enforcement. The admin login credentials, while client-side "encrypted" using AES with a hardcoded key (see separate CVE), are transmitted over unencrypted HTTP connections.

Additionally, after authentication, all admin operations including password changes, PPPoE credential viewing, VoIP configuration, WiFi password management, and firmware uploads are performed over cleartext HTTP.

An attacker on the same network segment can perform a man-in-the-middle attack or passive traffic sniffing to capture admin credentials and all sensitive configuration data. The nginx web server configuration (nginx.conf) has HTTPS configuration commented out by default.

**CVSS:** 6.5 (Medium) — AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

---

## CVE #9 — No CSRF Protection

**MITRE Form Fields:**

- **Vulnerability Type:** Cross-Site Request Forgery (CWE-352)
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Remote
- **Impact:** Code Execution, Configuration Change
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) web administration interface does not implement CSRF tokens or anti-CSRF protections on any administrative actions. The CGI binary (/www/cgi-bin/ajax) uses a session ID mechanism (get_refresh_sessionid) but this is not a proper CSRF token — it is a predictable value that rotates on each request and is accessible to any JavaScript running in the browser context.

An attacker can craft a malicious web page that, when visited by an authenticated admin user on the same network, performs unauthorized actions including:
- Changing admin/user passwords
- Modifying WiFi settings (SSID, password)
- Changing DNS settings
- Modifying WAN/PPPoE configuration
- Uploading firmware
- Rebooting the device
- Enabling/disabling services

The X-Frame-Options header is set to SAMEORIGIN, preventing iframe-based attacks, but direct form submissions and XMLHttpRequest-based CSRF attacks are not mitigated.

**CVSS:** 6.5 (Medium) — AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N

---

## CVE #10 — All Services Run as Root

**MITRE Form Fields:**

- **Vulnerability Type:** Improper Privilege Management (CWE-269)
- **Vendor:** FiberHome Telecommunication Technologies
- **Product:** HG6145F1
- **Version:** RP4423
- **Attack Type:** Local
- **Impact:** Privilege Escalation
- **Reference URL:** https://github.com/MrSmiiith/hg6145f1-full-access

**Description:**

The FiberHome HG6145F1 router (firmware RP4423) runs all services and processes as root (uid=0) with no privilege separation or sandboxing:

- nginx web server: runs as root (configured with "user root;" in nginx.conf)
- thttpd CGI server: runs as root on port 8840
- CGI binary (ajax): executes as root, all system() calls run as uid=0
- dropbear SSH server: runs as root
- sysmgr, cfgmgr, and all system services: run as root
- All kernel modules and drivers: loaded as root

This lack of privilege separation means that any vulnerability in any service (such as the command injection in triger_speedtest) immediately grants full root access to the entire system. There are no user accounts other than root, no capability restrictions, no seccomp filters, and no mandatory access control (SELinux/AppArmor).

The thttpd configuration explicitly sets "user=root" and nginx configuration sets "user root;", confirming this is by design rather than a misconfiguration.

**CVSS:** 7.0 (High) — AV:L/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H
