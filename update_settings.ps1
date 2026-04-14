# PowerShell script to update settings
$headers = @{
    "Content-Type" = "application/json"
}

$body = Get-Content -Path "D:\Work\Web_app_stock_recon_React_v2\settings_update.json" -Raw

Invoke-RestMethod -Uri "http://localhost:8000/settings/aneta" -Method Put -Headers $headers -Body $body

Write-Host "Settings updated successfully!" -ForegroundColor Green
