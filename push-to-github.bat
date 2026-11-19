@echo off
title Push Smart Grocery to GitHub & Vercel
color 0A
echo ============================================================
echo   MENGIRIM PERUBAHAN KE GITHUB DAN VERCEL
echo ============================================================
echo.
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;C:\Users\Teacher\AppData\Local\Programs\Git\cmd;C:\Users\Student\AppData\Local\Programs\Git\cmd;%PATH%"

cd /d "%~dp0"

echo Menambahkan perubahan file...
git add .
git commit -m "feat: perbaikan toggle diskon 0 persen, auto scroll to top, dan modal pengaturan barang kustom"
echo.
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
    echo [INFO] Jika muncul jendela login GitHub di layar, silakan klik 'Authorize'.
    echo ============================================================
)
echo.
pause
