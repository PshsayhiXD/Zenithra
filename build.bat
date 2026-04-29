@echo off
TITLE Dredbot Evolve - Build
color 0A
echo [!] Building production files...
call npm run build:prod
echo [+] Done.
pause
