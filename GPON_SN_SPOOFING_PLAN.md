# GPON Serial Number Spoofing — Research Plan

## What We Found

1. **`fhdrv_pon_set_onu_physical_sn`** — kernel driver function to SET GPON SN
2. **`fhdrv_pon_set_onu_physical_password`** — SET PLOAM password
3. **`set_snpwdauth` CGI API** — web interface to change SN/password
4. **`snpwdauth_inter.html`** — web page for SN/password settings
5. **`i2c_debug write`** — can write to SFP module I2C bus
6. **`/fhdata/factory_conf`** — factory partition with original SN

## Current GPON Identity

- GPON SN: FHTTC0B3B90D
- Vendor: FHTT (FiberHome)
- SFP Module: HISENSE
- ONU ID: 15
- Auth Status: 5 (authenticated)
- PON Reg State: 5 (registered/operational)

## Next Steps to Test

### Step 1: Read current SN via snpwdauth page
- Navigate to http://192.168.1.1/html/snpwdauth_inter.html
- This page shows current GPON SN and PLOAM password
- It also has SET functionality

### Step 2: Set a new SN via the web API
```
POST /cgi-bin/ajax
ajaxmethod=set_snpwdauth&GPONPassWord=NEW_PASSWORD&GPONPassWordAsciiHex=0
```

### Step 3: Set SN via RCE (alternative)
```javascript
// In browser console:
XHR.post("set_snpwdauth", {
    GPONPassWord: "NEW_SN_HERE",
    GPONPassWordAsciiHex: "0"
}, function(data) { console.log(data); });
```

### Step 4: After SN change
- The ONU will deregister from OLT (loses connection)
- Need to reboot for new SN to take effect
- OLT will see a "new" ONU trying to register
- If OLT auto-provisions → free internet
- If OLT requires manual provisioning → no service

### Risks
- **WILL lose internet connectivity** when SN changes
- **May need to restore original SN** if ISP doesn't auto-provision
- Original SN backed up in /fhdata/factory_conf
- restore_pon tool can restore original SN from factory

### How to Restore
```bash
# Restore original SN from factory
LD_LIBRARY_PATH=/fhrom/lib:/lib /fhrom/bin/restore_pon
# Or factory reset via web UI
```
