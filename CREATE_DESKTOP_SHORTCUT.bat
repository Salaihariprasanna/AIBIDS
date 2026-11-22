@echo off
TITLE Create AIBIDS Desktop Shortcut
echo Creating desktop shortcut for AIBIDS...

powershell -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut((Join-Path $desktop 'AIBIDS.lnk')); $s.TargetPath = '%~dp0START_AIBIDS.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Launch AIBIDS: AI-Powered BI & Decision Support System'; $s.Save(); Write-Host 'Shortcut created at: ' (Join-Path $desktop 'AIBIDS.lnk') -ForegroundColor Green"

echo.
echo ==============================================================================
echo  Desktop shortcut "AIBIDS" created successfully on your Desktop!
echo  You can now launch the software directly from your Desktop with 1 click.
echo ==============================================================================
echo.
pause
