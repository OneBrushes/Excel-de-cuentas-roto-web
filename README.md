# CRM Dropshipping

Dashboard de gestión para tiendas de Shopify con seguimiento de productos, pedidos y gastos.

## 🚀 Características

- 📊 Dashboard con métricas en tiempo real
- 🏪 Gestión de productos/tiendas
- 🛒 Seguimiento de pedidos
- 💸 Control de gastos
- 📈 Gráficos y análisis
- 🔗 Integración con Shopify
- 🔐 Autenticación con Supabase

## 🛠️ Tecnologías

- **Next.js 16** - Framework React
- **Supabase** - Backend y autenticación
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos
- **shadcn/ui** - Componentes UI

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Crea un archivo .env.local con:
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# Ejecutar en desarrollo
pnpm dev

# Build para producción
pnpm build
```

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para desplegarse en Vercel.

### Despliegue Rápido:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OneBrushes/Excel-de-cuentas-roto-web)

### Configuración Manual:

1. Ve a [vercel.com](https://vercel.com/signup)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `Excel-de-cuentas-roto-web`
4. Añade las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en "Deploy"

**Ver guía completa:** [DEPLOY.md](./DEPLOY.md)

---

## 📝 Estructura del Proyecto

```
├── app/                    # Páginas y rutas
│   ├── page.tsx           # Dashboard principal
│   ├── products/          # Gestión de productos
│   ├── charts/            # Gráficos y análisis
│   └── auth/              # Autenticación
├── components/            # Componentes React
├── lib/                   # Utilidades y lógica
│   ├── supabase/         # Cliente Supabase
│   ├── queries.ts        # Consultas a BD
│   ├── analytics.ts      # Análisis de datos
│   └── shopify.ts        # Integración Shopify
└── .github/workflows/    # GitHub Actions
```

## 🗄️ Base de Datos

El proyecto usa Supabase con las siguientes tablas:

- `users` - Usuarios de la aplicación
- `products` - Productos/tiendas
- `orders` - Pedidos
- `expenses` - Gastos adicionales

## 📄 Licencia

MIT
