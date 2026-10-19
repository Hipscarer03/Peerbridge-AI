@echo off
cd /d "%~dp0"
<<<<<<< HEAD
set NEXT_PUBLIC_API_URL=http://localhost:8001
npx next dev -p 3000 --webpack
=======
set NEXT_PUBLIC_API_URL=http://localhost:8000
npx next dev -p 3000
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
