@echo off
setlocal
cd /d "%~dp0"
echo WiZ Control 3.4.4 Windows x64 build
echo Source: %CD%
where node >nul 2>&1 || (echo Node.js LTS is required. & exit /b 1)
where npm.cmd >nul 2>&1 || (echo npm.cmd is required. & exit /b 1)
call npm.cmd install --legacy-peer-deps || exit /b 1
call npm.cmd run typecheck || exit /b 1
call npm.cmd run test:smoke || exit /b 1
call npm.cmd run build:win || exit /b 1
echo.
echo SUCCESS: dist\WiZ-Control-3.4.4-Setup.exe
