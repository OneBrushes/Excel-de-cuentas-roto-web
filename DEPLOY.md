# 🚀 Guía de Despliegue en GitHub Pages

## Paso 1: Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `Excel-de-cuentas-roto-web` (o el que prefieras)
3. **NO** inicialices con README, .gitignore o licencia
4. Haz clic en "Create repository"

## Paso 2: Conectar tu repositorio local

Copia tu nombre de usuario de GitHub y ejecuta estos comandos:

```powershell
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/Excel-de-cuentas-roto-web.git
git branch -M main
git push -u origin main
```

## Paso 3: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En "Build and deployment":
   - Source: **GitHub Actions**
5. Guarda los cambios

## Paso 4: Configurar Secrets (Variables de Entorno)

1. En tu repositorio, ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Añade estos dos secrets:

   **Secret 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Tu URL de Supabase (ejemplo: https://xxxxx.supabase.co)

   **Secret 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Tu clave anónima de Supabase

## Paso 5: ¡Listo! 🎉

Cada vez que hagas `git push` a la rama `main`, GitHub Actions automáticamente:
1. Instalará las dependencias
2. Compilará tu aplicación Next.js
3. La desplegará en GitHub Pages

Tu sitio estará disponible en:
```
https://TU_USUARIO.github.io/Excel-de-cuentas-roto-web/
```

## 📝 Comandos útiles para el futuro

```powershell
# Ver estado de git
git status

# Añadir cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub (esto desplegará automáticamente)
git push

# Ver el historial
git log --oneline
```

## ⚠️ Importante

- El nombre del repositorio debe coincidir con el `basePath` en `next.config.mjs`
- Si cambias el nombre del repositorio, actualiza también `next.config.mjs`
- Los secrets de Supabase son necesarios para que la app funcione

## 🔧 Si algo falla

1. Ve a tu repositorio → **Actions**
2. Verás el workflow "Deploy to GitHub Pages"
3. Click en el último run para ver los logs
4. Si hay errores, revisa que los secrets estén bien configurados
