# WiZ Control

A fast local Windows desktop controller for WiZ smart lights.

**Developer / maintainer:** [Superglazkov](https://github.com/Superglazkov)

## Features

- Multiple WiZ bulbs and LED strips in one app.
- Manual device add by IPv4 address.
- On-demand LAN discovery with **Scan devices**.
- Device identity stored by MAC address with transparent DHCP/IP recovery.
- Control one device or **All devices**.
- Power, brightness, built-in scenes and custom colors.
- Brightness step of 5%.
- Scene cards with visual scene colors.
- Up to 8 favorite scenes shown at the top of Home.
- Compact expandable device information.
- Minimize to Windows system tray.
- Optional **Start with Windows**, launching silently in the tray.
- Adaptive health checks: faster while the window is open, low-frequency in the background.
- English-only release build and Windows x64 packaging.

## Privacy and networking

WiZ Control talks directly to WiZ devices on the local network over UDP. Device discovery runs once on the first launch when no devices have been saved; afterwards, new devices are scanned only on demand, except for background recovery of already saved MAC addresses after an IP address changes.

## Windows build

```powershell
npm install --legacy-peer-deps
npm run typecheck
npm run build:win
```

The installer is created in `dist/`.

## Releases

Create a tag such as `v3.4.5`. GitHub Actions will build the Windows x64 installer and attach it to the GitHub Release.

## License

GPL-3.0-only. See `LICENSE` and `NOTICE.md`.

WiZ Control is not affiliated with, maintained by, or endorsed by WiZ / Signify.
