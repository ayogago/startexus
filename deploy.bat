@echo off
echo Starting deployment to Hostinger VPS...

echo.
echo Step 1: Building production version...
call npm run build
if errorlevel 1 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating deployment package...
if exist deploy-package rmdir /s /q deploy-package
mkdir deploy-package

echo Copying essential files...
xcopy /E /I .next deploy-package\.next
copy package.json deploy-package\
copy package-lock.json deploy-package\
xcopy /E /I prisma deploy-package\prisma
copy .env deploy-package\

echo.
echo Deployment package created in 'deploy-package' folder
echo.
echo Next steps:
echo 1. Upload the 'deploy-package' folder contents to your VPS at /var/www/startexus.com/
echo 2. Run the server setup script on your VPS (see server-setup.sh)
echo.
echo You can use tools like:
echo - FileZilla (SFTP)
echo - WinSCP
echo - scp command: scp -P 65002 -r deploy-package/* u571521702@191.101.32.231:/var/www/startexus.com/
echo.
pause