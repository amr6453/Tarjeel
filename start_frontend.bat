@echo off
chcp 65001 > nul
echo تشغيل سيرفر الفرونت إند - 01-tarjeel-salon-management
cd /d "%~dp0frontend"
call npm run dev
pause
