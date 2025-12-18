# Script para configurar y subir a GitHub
# Ejecuta este script después de crear tu repositorio en GitHub

Write-Host "🚀 Configurando repositorio de GitHub..." -ForegroundColor Cyan
Write-Host ""

# Pedir el nombre de usuario de GitHub
$username = Read-Host "Ingresa tu nombre de usuario de GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Error: Debes ingresar un nombre de usuario" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Configurando remote..." -ForegroundColor Yellow

# Verificar si ya existe un remote
$remoteExists = git remote get-url origin 2>$null

if ($remoteExists) {
    Write-Host "⚠️  Ya existe un remote configurado. ¿Quieres reemplazarlo? (S/N)" -ForegroundColor Yellow
    $replace = Read-Host
    if ($replace -eq "S" -or $replace -eq "s") {
        git remote remove origin
        git remote add origin "https://github.com/$username/Excel-de-cuentas-roto-web.git"
        Write-Host "✅ Remote actualizado" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$username/Excel-de-cuentas-roto-web.git"
    Write-Host "✅ Remote configurado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Preparando para subir a GitHub..." -ForegroundColor Yellow

# Cambiar a rama main
git branch -M main

Write-Host ""
Write-Host "🚀 Subiendo código a GitHub..." -ForegroundColor Cyan
Write-Host ""

# Push a GitHub
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Código subido exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Ve a: https://github.com/$username/Excel-de-cuentas-roto-web/settings/pages" -ForegroundColor White
    Write-Host "2. En 'Source', selecciona 'GitHub Actions'" -ForegroundColor White
    Write-Host "3. Ve a: https://github.com/$username/Excel-de-cuentas-roto-web/settings/secrets/actions" -ForegroundColor White
    Write-Host "4. Añade los secrets:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌐 Tu sitio estará en: https://$username.github.io/Excel-de-cuentas-roto-web/" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al subir el código" -ForegroundColor Red
    Write-Host "Asegúrate de haber creado el repositorio en GitHub primero:" -ForegroundColor Yellow
    Write-Host "https://github.com/new" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Presiona Enter para salir"
