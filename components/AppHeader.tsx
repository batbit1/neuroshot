"use client";

import Link from "next/link";
import { useAuth } from "@/lib/mock-auth";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 shadow-md shadow-violet-500/20 transition group-hover:scale-[1.03]">
              <div className="h-4 w-4 rounded-full bg-white/90 shadow-sm" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent transition group-hover:opacity-90">
                NeuroShot
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                AI Photo Studio
              </span>
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Главная
          </Link>
          {user ? (
            <>
              <Link href="/gallery" className="text-slate-600 hover:text-slate-900">
                Галерея
              </Link>
              <Link href="/profile" className="text-slate-600 hover:text-slate-900">
                Профиль
              </Link>
              <span className="text-slate-400 hidden sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
