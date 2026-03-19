# CVE MITRE Form Submissions — Copy/Paste Ready
# URL: https://cveform.mitre.org/

Common fields for ALL submissions:
- Request type: Report Vulnerability/Request CVE ID
- Email: merzougrayane5@gmail.com (change to your email)
- Number of vulnerabilities: 1 (submit each separately)
- Verified not CNA-covered: Yes
- Verified no existing CVE: Yes
- Vendor confirmed: No
- Discoverer/Credits: Smothy (Rayane Merzoug) / Numb Team
- Reference: https://github.com/MrSmiiith/hg6145f1-full-access

=============================================
## SUBMISSION #5 — Unauthenticated Info Disclosure
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-200 Information Exposure
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Remote
Impact: Information Disclosure
Affected component(s): /cgi-bin/ajax, get_base_info method, get_device_name method
Attack vector(s): An unauthenticated attacker on the local network sends an HTTP GET request to http://192.168.1.1/cgi-bin/ajax?ajaxmethod=get_base_info which returns sensitive device information without requiring authentication.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 allows unauthenticated access to sensitive device information via the /cgi-bin/ajax CGI endpoint. The get_base_info and get_device_name AJAX methods do not require authentication and return the device MAC address, TR-069 MAC, GPON serial number, hardware/software versions, ONU state, LOID, CPU/memory usage, system uptime, LAN port status, and optical power levels. The MAC address disclosure is critical because the admin password is deterministically derived from the MAC address, allowing an unauthenticated attacker to chain this with the password generation vulnerability to gain full admin access.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
Tested on FiberHome HG6145F1 deployed by Algeria Telecom with firmware version RP4423 (compiled June 9, 2025). The vulnerability is in the CGI binary /www/cgi-bin/ajax which handles all AJAX API requests. The get_base_info method returns a JSON object with over 30 fields of sensitive device information. Combined with the predictable password vulnerability, this allows complete unauthenticated admin takeover.

=============================================
## SUBMISSION #6 — XOR Config File Encryption
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-327 Use of a Broken or Risky Cryptographic Algorithm
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Local
Impact: Information Disclosure
Affected component(s): libfhapi.so, fhapi_file_crypt_decrypt() function
Attack vector(s): An attacker obtains a configuration file export from the router (via admin panel Management > Configuration File, or by intercepting a backup). The XOR encryption can be reversed offline without any key to recover plaintext credentials.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 uses a trivially reversible XOR cipher for configuration file encryption in the fhapi_file_crypt_decrypt() function within libfhapi.so. The algorithm XORs each byte with a predictable counter value (i + 9527) with no cryptographic key. Configuration files exported from the router contain PPPoE credentials, VoIP SIP passwords, WiFi pre-shared keys, TR-069 credentials, and other sensitive settings. Any attacker with access to an exported configuration file can decrypt it offline using the formula: output = input_byte XOR (counter + 9527). This is separate from the hardcoded AES key vulnerability which affects individual credential storage within the running system.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
The XOR encryption was discovered through reverse engineering of libfhapi.so (ARM 32-bit shared library). The decryption algorithm is: for (i = len - len/9527; i != 2*len - len/9527; i++) output = getc(file) ^ (i + 9527). This provides zero security as the algorithm is deterministic with no key material.

=============================================
## SUBMISSION #7 — Boot Process Manufacturer Backdoor
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-912 Hidden Functionality
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Physical
Impact: Code Execution, Escalation of Privileges
Affected component(s): /fhrom/fhshell/initialize.sh, boot initialization script
Attack vector(s): An attacker with physical access connects to the router's UART serial console (typically accessible via solder pads on the PCB). During the 2-second boot window, they type a 9-character password derived from a known SHA1 hash and the router's MAC address to bypass the entire boot security initialization and obtain a root shell.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 contains a manufacturer backdoor in the boot initialization script /fhrom/fhshell/initialize.sh. During boot, the script waits for 2 seconds for input via the serial console (UART). If 9 characters are entered, the first 3 characters are hashed with SHA1 and compared against the hardcoded hash ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2. The remaining 6 characters are compared against a character-substituted transformation of the last 6 digits of the router's MAC address (using tr [0123456789ABCDEF] [FEDCBA9876543210]). If both checks pass, the initialization script exits immediately with "force exit!!", dropping the user to a root shell with uid=0 and bypassing all security initialization including firewall rules, access controls, and service restrictions. The MAC address is printed on the device sticker and also obtainable via the unauthenticated API.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
The SHA1 hash ef431b3bb9e0f022134ebde6d2b87c66ca2c58d2 corresponds to a 3-character string that can be brute-forced trivially (only 17,576 possible combinations for 3 lowercase characters, or 262,144 for mixed case). The MAC transformation is a simple character substitution cipher. Combined, this gives any attacker with physical access and knowledge of the MAC address full root access to the device. The backdoor appears to be intentional manufacturer debug/maintenance functionality that was not removed from production firmware.

=============================================
## SUBMISSION #8 — Cleartext Credential Transmission
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-319 Cleartext Transmission of Sensitive Information
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Remote
Impact: Information Disclosure
Affected component(s): nginx web server, /fhconf/nginx.conf, web administration interface
Attack vector(s): An attacker on the same network segment performs passive traffic sniffing or active man-in-the-middle attack to capture admin credentials and sensitive configuration data transmitted over unencrypted HTTP.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 serves its entire web administration interface over unencrypted HTTP on port 80 by default. HTTPS is not enabled. Admin login credentials are transmitted with only client-side AES encryption using a hardcoded key (see separate CVE), which provides no protection against network-level interception since the key is embedded in the JavaScript source code accessible to any user. All administrative operations after login, including viewing PPPoE credentials, VoIP passwords, WiFi pre-shared keys, changing passwords, uploading firmware, and modifying network settings, are transmitted in cleartext HTTP. An attacker on the local network can capture all admin credentials and sensitive configuration data through passive traffic sniffing.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
The nginx configuration file has HTTPS configuration support but it is not enabled by default. The client-side "encryption" using AES with the hardcoded key "ABCDEFGHIJKLMNOP" provides no meaningful security since the key is publicly accessible in the router's JavaScript files (aes.js).

=============================================
## SUBMISSION #9 — Cross-Site Request Forgery (CSRF)
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-352 Cross-Site Request Forgery
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Remote
Impact: Code Execution, Other
Affected component(s): /cgi-bin/ajax CGI binary, all POST AJAX methods
Attack vector(s): An attacker creates a malicious web page. When an authenticated admin user on the same network visits this page, JavaScript in the page sends XMLHttpRequest POST requests to the router's CGI endpoint to perform unauthorized admin actions. The victim must be logged into the router's admin panel.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 does not implement Cross-Site Request Forgery (CSRF) protections on its web administration interface. The CGI binary /www/cgi-bin/ajax uses a session ID mechanism (obtained via get_refresh_sessionid) for POST request authorization, but this session ID is not a proper CSRF token. It is a predictable value obtained via an unauthenticated GET request and rotates on each request. No Origin or Referer header validation is performed. An attacker can craft a malicious web page that, when visited by an admin user logged into the router, performs unauthorized actions including changing admin/user passwords (do_login), modifying WiFi settings (set_wifi_ssid), changing DNS settings, modifying WAN/PPPoE configuration, uploading malicious firmware (upgradeimage), rebooting the device (do_firmupgrade), and executing arbitrary commands via the triger_speedtest RCE. The X-Frame-Options SAMEORIGIN header prevents iframe-based clickjacking but does not prevent direct XMLHttpRequest CSRF attacks.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
The session management uses XHR.post() which internally calls get_refresh_sessionid before each POST request. This session ID is not tied to a login session or client identity and can be obtained by any script running in the browser context, making CSRF attacks trivial.

=============================================
## SUBMISSION #10 — Improper Privilege Management (All Services as Root)
=============================================

Vulnerability type: Other or Unknown
Other vulnerability type: CWE-269 Improper Privilege Management
Vendor: FiberHome Telecommunication Technologies Co., Ltd.
Product: HG6145F1
Version: RP4423 (all versions)
Has vendor confirmed: No
Attack type: Local
Impact: Escalation of Privileges
Affected component(s): nginx.conf (user root), thttpd.conf (user=root), /www/cgi-bin/ajax, /fhrom/bin/sysmgr, all system services
Attack vector(s): Any vulnerability in any network-facing service (web server, CGI, DHCP, DNS relay, TR-069 client, etc.) immediately grants full root access to the entire system because all services run as uid=0 with no privilege separation, capability restrictions, or mandatory access control.

Suggested description:
FiberHome HG6145F1 router with firmware RP4423 runs all services and processes as root (uid=0) with no privilege separation, sandboxing, capability restrictions, or mandatory access control. The nginx web server is explicitly configured with "user root;" in nginx.conf. The thttpd CGI server is configured with "user=root" in thttpd.conf. The CGI binary /www/cgi-bin/ajax executes all system() calls as root. System management services (sysmgr, cfgmgr), network services (dnsrelay, dhcpl2, pppd), and all other processes run as root. There are no non-root user accounts configured on the system. This lack of privilege separation means that exploitation of any vulnerability in any network-facing service, such as the command injection in triger_speedtest, immediately grants the attacker full unrestricted root access to the entire system including the ability to modify firmware, intercept all network traffic, and pivot to other devices on the network.

Reference(s):
https://github.com/MrSmiiith/hg6145f1-full-access

Additional information:
Confirmed by examining process list (ps aux showing all processes as root), nginx.conf ("user root;"), and thttpd.conf ("user=root"). The kernel is Linux 4.19.183 armv7l with no SELinux, AppArmor, or seccomp profiles configured. The device uses a single root filesystem with no containerization or namespace isolation.
