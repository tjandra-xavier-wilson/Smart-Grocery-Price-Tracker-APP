@echo off
title Push GrabFood UI to GitHub & Vercel
color 0A
echo ============================================================
echo   MENGIRIM PERUBAHAN GRABFOOD KE GITHUB DAN VERCEL
echo ============================================================
echo.
set "PATH=C:\Users\Student\AppData\Local\Programs\Git\cmd;C:\Users\Student\AppData\Local\Programs\Git\bin;%PATH%"

cd /d "%~dp0"

echo Menjalankan git push origin main...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo [BERHASIL] Kode berhasil terkirim ke GitHub!
    echo Vercel sedang otomatis mengupdate https://smartgrocerypricetrackerapp.vercel.app/
    echo ============================================================
) else (
    echo ============================================================
    echo [INFO] Jika muncul jendela login GitHub, silakan klik 'Authorize'.
    echo ============================================================
)
echo.
pause
