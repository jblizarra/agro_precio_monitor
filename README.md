# AgroPrecio Monitor

MVP full-stack para comparar precios normalizados de supermercados espanoles con precios publicados por productores. Esta version esta preparada para Vercel, Next.js App Router y Supabase.

## Stack

- Next.js + TypeScript.
- Supabase Auth/Postgres/RLS.
- Vercel Cron para `/api/cron/scrape-prices`.
- Conectores reemplazables para Mercadona, Carrefour y Dia.

## Ejecutar en local

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

Sin variables de Supabase, la app usa datos demo para que el dashboard, productor, admin y cron funcionen en modo dry-run.

## Configuracion Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL editor.
3. Copia `.env.example` a `.env.local`.
4. Rellena:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

## Despliegue en Vercel

1. Conecta el repositorio en Vercel.
2. Anade las variables de entorno anteriores.
3. Despliega con el comando por defecto `next build`.
4. Vercel ejecutara el cron definido en `vercel.json` cada 8 horas.

Para invocar el cron manualmente:

```powershell
curl -H "Authorization: Bearer <CRON_SECRET>" https://tu-app.vercel.app/api/cron/scrape-prices
```

## Flujo MVP

- Usuarios anonimos ven comparativas publicas con precios de productor aprobados.
- Productores envian precios normalizados en euros por kg o litro.
- Admin aprueba o rechaza precios pendientes.
- El cron obtiene precios de supermercados mediante conectores. Los conectores actuales son demo y estan disenados para sustituirse por APIs o scraping permitido por cadena.

## Cumplimiento

Antes de activar scraping real para una cadena, revisa `robots.txt`, terminos de uso, frecuencia permitida y disponibilidad de API/feed. Si una cadena no permite captura fiable o permitida, deja su conector desactivado y documenta la razon.
