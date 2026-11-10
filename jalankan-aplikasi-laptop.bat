@echo off
title Smart Grocery Sentinel - Server Lokal Laptop
color 0A
cd /d "%~dp0"
echo ============================================================
echo   MENJALANKAN SERVER SMART GROCERY SENTINEL DI LAPTOP
echo ============================================================
echo.
echo [1/2] Memastikan port 3000 aktif...
echo [2/2] Membuka aplikasi di browser...
echo.
start http://localhost:3000
echo Server lokal aktif di: http://localhost:3000
echo Tautan alternatif Vercel: https://smartgrocerypricetrackerapp.vercel.app/
echo.
echo [JANGAN TUTUP JENDELA INI SELAMA ANDA MEMBUKA APLIKASI DI LAPTOP]
echo.
node server.js
pause
