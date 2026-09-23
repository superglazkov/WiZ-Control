# WiZ Control 3.4.5 release verification

This archive is a **complete source project**, not a binary installer. Build on Windows 11 x64 with Node.js LTS using `BUILD_WINDOWS.cmd` from this folder. The generated installer is `dist/WiZ-Control-3.4.5-Setup.exe`. It upgrades the existing `WiZ Control` identity without wiping AppData. Backup your `%APPDATA%` WiZ Control data before any removal.

## First-run checks

1. Back up user profile settings first. Install and start using a **new empty profile**. The Home page should show `Searching for WiZ devices...` while the one-time scan runs, then show discovered devices or the empty state. Unknown devices are not automatically added on later launches. Use `Add device` for manual rescans.
2. Close and reopen with saved lamps and verify no unrequested bulk scan, working MAC/IP recovery, and individual/All devices controls.
3. Open Help/About and confirm `3.4.5`, `Superglazkov`, and the source link.
4. In Settings, switch Theme between Light, Dark and System. Light must stay light even when Windows is dark, Dark must stay dark, and System must follow Windows. Reopen Settings and restart the app to confirm the preference persists. Confirm there are no Spanish or Auto-Detect choices and lamp renaming still works.
5. At default window size, confirm the sidebar brightness slider remains inside its card and the Home device cards fit without horizontal overflow.
6. Enable minimize-to-tray. Click X and confirm the background process remains, the tray icon is visible, and clicking it restores the window. `Exit` must terminate the process. Repeat with minimize-to-tray off.
7. Enable Start with Windows and test launch hidden in tray after logon.

Note: the source has been statically reviewed. Full TypeScript dependency resolution, live LAN/device, Windows tray, and NSIS installer behavior must be confirmed on an actual Windows computer before publishing a public release.
