"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/mock-auth";

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/gallery");
  }, [user, router]);

  if (user) {
    return (
      <p className="mx-auto max-w-md px-4 py-12 text-center text-slate-600">
        Вы уже вошли. Перенаправляем…
      </p>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "login") {
      const r = login(email, password);
      if (r.ok) router.push("/gallery");
      else setError(r.message ?? "Ошибка входа");
      return;
    }
    if (!name.trim()) {
      setError("Введите имя.");
      return;
    }
    const r = register(email, password, name);
    if (r.ok) router.push("/gallery");
    else setError(r.message ?? "Ошибка регистрации");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">
        {mode === "login" ? "Вход" : "Регистрация"}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Данные хранятся только в браузере (mock). Позже замените на Supabase Auth.
      </p>

      <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 font-medium ${mode === "login" ? "bg-white shadow-sm" : "text-slate-600"}`}
          onClick={() => setMode("login")}
        >
          Вход
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 font-medium ${mode === "register" ? "bg-white shadow-sm" : "text-slate-600"}`}
          onClick={() => setMode("register")}
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Имя</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-slate-400 focus:ring-2"
              autoComplete="name"
            />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-slate-400 focus:ring-2"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Пароль</span>
          <input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-slate-400 focus:ring-2"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-slate-800"
        >
          {mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/" className="underline hover:text-slate-900">
          ← На главную
        </Link>
      </p>
    </div>
  );
}
