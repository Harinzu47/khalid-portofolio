@echo off
echo Cleaning old dependencies...
rmdir /s /q node_modules 2>nul
del /f /q package-lock.json 2>nul

echo.
echo Installing updated dependencies...
npm install

echo.
echo Done! You can now run: npm run dev
pause
