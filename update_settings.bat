@echo off
curl -X PUT http://localhost:8000/settings/aneta ^
  -H "Content-Type: application/json" ^
  -d @settings_update.json
echo.
echo Settings updated successfully!
pause
