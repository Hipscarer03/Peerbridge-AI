@echo off
setlocal
cd /d "%~dp0.."
echo [ai-log] Dang quet prompt tu Antigravity IDE...
backend\.venv\Scripts\python.exe scripts\log_antigravity.py --auto
echo [ai-log] Dang day log len AI Log Server...
backend\.venv\Scripts\python.exe scripts\submit_log.py
echo [ai-log] Hoan tat!
pause
