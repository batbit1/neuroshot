/**
 * Заглушка под будущий Supabase (Auth + Storage + Postgres).
 *
 * Типичный следующий шаг:
 * 1. Проект на https://supabase.com
 * 2. `npm i @supabase/supabase-js` (и при SSR — `@supabase/ssr`)
 * 3. Переменные `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`
 * 4. Заменить этот файл на `createBrowserClient` / `createServerClient` из документации Supabase для Next.js.
 *
 * Документация: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

export function createBrowserClientPlaceholder(): never {
  throw new Error("Supabase ещё не подключён — см. lib/supabase/client-placeholder.ts");
}
