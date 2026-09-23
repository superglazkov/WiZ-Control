# Changelog

## 3.4.5

- Fixed Light, Dark and System theme switching and persistence.
- System theme now follows Windows color-scheme changes while WiZ Control is running.
- Fixed GitHub Actions release builds so electron-builder builds the installer without trying to publish with a Personal Access Token. GitHub Actions remains responsible for attaching the installer to the Release.
- Kept all 3.4.4 device ordering, tray, startup and UI behavior.

## 3.4.4

- Moved **Keep running in tray** from Information to Settings.
- Kept **Start with Windows** in Settings.
- Preserved device ordering, All devices default selection, favorites, discovery, MAC recovery, tray mode and UI fixes from 3.4.3.

## 3.4.3

- Added drag-and-drop ordering for individual devices on Home.
- Kept All devices pinned as the first card.
- Home now starts in All devices mode after each application launch.
- Device card order is persisted and restored on the next launch.
- Moved Start with Windows from Information to Settings.

## 3.4.2

- Simplified manual IP placeholder to a clean example address.
- Renamed the manual field label to IP address.
- Enlarged and re-spaced the sidebar brightness slider so the thumb is not clipped at either edge.
- Slightly enlarged the selected-device shortcut card for better readability at the default window size.

## 3.4.1

- About version now reflects the actual packaged app version through Electron IPC.
- Removed Spanish from the UI, language menu and packaged resources.
- Real packaged tray icon resource, corrected tray/window close lifecycle and app identity.
- One-time first-run automatic LAN discovery when the profile has no saved devices.
- Explicit empty-state message after the scan finishes instead of an endless spinner.
- Responsive Home device grid and sidebar brightness controls at default window size.
- Preserved themes, existing device renaming, favorites, saved devices and MAC recovery.
- Migrate legacy `Wiz App` tray/startup preferences when found.

## 3.4.0

First public WiZ Control release maintained by Superglazkov.

- Multi-device and All devices control.
- Manual IP add and user-triggered LAN scanning.
- MAC-based identity and automatic IP recovery after DHCP changes.
- Favorite scenes, limited to 8 and placed near the top of Home.
- 5% brightness step.
- Scene color previews.
- Compact expandable information for every saved device.
- System tray mode.
- Start with Windows option with hidden tray startup.
- Adaptive health checks: 15 seconds in foreground and 60 seconds in background.
- English-only Windows x64 release.
- Packaging cleanup and removal of React DevTools from release development dependencies.
