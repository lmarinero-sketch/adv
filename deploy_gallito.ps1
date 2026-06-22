# Deploy Gallito Edge Function
# Run from the project root: .\deploy_gallito.ps1

Write-Host "🐓 Deploying Gallito Edge Function..." -ForegroundColor Cyan

# Deploy the function
npx supabase functions deploy gallito --project-ref pxvhovctyewwppwkldaq --no-verify-jwt

Write-Host ""
Write-Host "✅ Gallito deployed successfully!" -ForegroundColor Green
Write-Host "📍 URL: https://pxvhovctyewwppwkldaq.supabase.co/functions/v1/gallito" -ForegroundColor Yellow
