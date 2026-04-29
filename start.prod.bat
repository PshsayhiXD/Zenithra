@echo off
TITLE Dredbot Evolve - PM2 Start
color 0A
echo [!] Starting bot via PM2...
call npm run pm2:start
echo [+] Done.
pause
