@echo off
chcp 65001 > nul
echo تشغيل سيرفر الباك إند - 01-tarjeel-salon-management
cd /d "%~dp0backend"
python manage.py runserver 8000
pause
