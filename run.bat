@echo off
TITLE Dredbot Evolve - Run
color 0A
echo [!] Starting bot (direct execution)...
call npm run start:prod
if %errorlevel% neq 0 (
    echo [X] Crashed with error code %errorlevel%.
    pause
)
