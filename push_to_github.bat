@echo off
echo Pushing code to GitHub...
git config user.email "admin@relicus.com"
git config user.name "Relicus Admin"
git add .
git commit -m "Admin panel and mobile app updates"
git branch -M main
git remote remove origin
git remote add origin https://github.com/relicus123/relicus-application.git
git push -u origin main -f
echo.
echo Push complete!
pause
