# 🚀 Guía de Despliegue en Vercel

## ⚠️ Importante
Esta aplicación **NO puede desplegarse en GitHub Pages** porque usa:
- Rutas dinámicas con datos del servidor
- Server Components de Next.js
- Autenticación con cookies de Supabase

**Solución: Usar Vercel** (gratis y optimizado para Next.js)

---

## Método 1: Despliegue Directo desde Vercel (Más Fácil) ✅

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com/signup
2. Haz clic en "Continue with GitHub"
3. Autoriza a Vercel

### Paso 2: Importar el proyecto
1. En el dashboard de Vercel, haz clic en **"Add New Project"**
2. Busca el repositorio `Excel-de-cuentas-roto-web`
3. Haz clic en **"Import"**

### Paso 3: Configurar variables de entorno
Antes de desplegar, añade estas variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL` = Tu URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Tu clave anónima de Supabase

### Paso 4: Deploy
1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

---

## Método 2: Deploy Automático con GitHub Actions (Opcional)

Si quieres que cada push a `main` despliegue automáticamente:

### Paso 1: Obtener tokens de Vercel

1. Ve a https://vercel.com/account/tokens
2. Crea un nuevo token y cópialo

### Paso 2: Obtener IDs del proyecto

Ejecuta en tu terminal local:
```bash
pnpm add -g vercel
vercel login
vercel link
```

Esto creará un archivo `.vercel/project.json` con tus IDs.

### Paso 3: Añadir secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

Añade estos 3 secrets:
- `VERCEL_TOKEN` = El token que creaste
- `VERCEL_ORG_ID` = Del archivo `.vercel/project.json`
- `VERCEL_PROJECT_ID` = Del archivo `.vercel/project.json`

### Paso 4: Push y deploy automático
Cada vez que hagas `git push` a `main`, se desplegará automáticamente.

---

## 🌐 Tu sitio estará disponible en:
```
https://tu-proyecto.vercel.app
```

O puedes configurar un dominio personalizado gratis en Vercel.

---

## 📝 Comandos útiles

```bash
# Ver logs en tiempo real
vercel logs

# Deploy manual desde terminal
vercel --prod

# Ver información del proyecto
vercel inspect
```

---

## ⚡ Ventajas de Vercel

- ✅ **Gratis** para proyectos personales
- ✅ **Deploy automático** en cada push
- ✅ **HTTPS** incluido
- ✅ **CDN global** para máxima velocidad
- ✅ **Preview deployments** para cada PR
- ✅ **Optimizado** para Next.js (mismo equipo)
- ✅ **Dominio personalizado** gratis

---

## 🆘 Problemas comunes

### Error: "Missing environment variables"
→ Asegúrate de haber añadido las variables de Supabase en Vercel

### Error: "Build failed"
→ Revisa los logs en Vercel Dashboard → Deployments → Click en el deployment fallido

### La app no carga datos
→ Verifica que las URLs de Supabase sean correctas y que las políticas RLS estén configuradas
