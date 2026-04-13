"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/mock-auth";
import {
  getFavoriteGenerationResultsByUser,
  setGenerationFavorite,
} from "@/lib/results-storage";
import { getTemplateById } from "@/lib/templates-merge";
import type { GenerationRecord } from "@/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU");
}

export default function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [items, setItems] = useState<GenerationRecord[] | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!user) return;
    if (!currentPassword) {
      setPasswordError("Введите текущий пароль.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Новый пароль и подтверждение не совпадают.");
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError("Введите новый пароль.");
      return;
    }
    const result = changePassword(user.id, currentPassword, newPassword);
    if (!result.ok) {
      setPasswordError(result.message ?? "Не удалось сменить пароль.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
  }

  const refresh = useCallback(() => {
    if (!user) return;
    setItems(getFavoriteGenerationResultsByUser(user.id));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function removeFromFavorites(id: string) {
    if (!user) return;
    setGenerationFavorite(id, false);
    refresh();
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Профиль</h1>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Аккаунт</h2>
          <p className="mt-2 text-sm text-slate-600">
            Email: <span className="font-medium text-slate-900">{user?.email}</span>
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Безопасность</h2>
          <p className="mt-2 text-sm text-slate-600">Сменить пароль</p>
          <p className="mt-1 text-xs text-slate-500">
            Демо-режим: пароль хранится только в браузере. Восстановление по почте появится при
            переходе на настоящую авторизацию.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">
                Текущий пароль
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                Новый пароль
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                Подтверждение нового пароля
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-700" role="status">
                Пароль успешно обновлён.
              </p>
            )}

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Сохранить новый пароль
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Мои избранные</h2>

          {items === null ? (
            <p className="mt-3 text-slate-600">Загрузка…</p>
          ) : items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-slate-600">Пока нет избранных генераций.</p>
              <p className="mt-2 text-sm text-slate-500">
                После генерации нажмите «Добавить в избранное» на странице результата.
              </p>
              <Link
                href="/gallery"
                className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
              >
                Перейти к шаблонам
              </Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-6 sm:grid-cols-2">
              {items.map((r) => {
                const template = getTemplateById(r.templateId);
                const downloadName = `generation-${r.id}.png`;
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                      <Image
                        src={r.imageSrc}
                        alt="Сгенерированное изображение"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="mt-3 font-medium text-slate-900">
                      {template?.title ?? r.templateId}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Создано: {formatDate(r.createdAt)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/result/${r.id}`}
                        className="inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Открыть результат
                      </Link>
                      <a
                        href={r.imageSrc}
                        download={downloadName}
                        className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Скачать
                      </a>
                      <button
                        type="button"
                        onClick={() => removeFromFavorites(r.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Убрать из избранного
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </RequireAuth>
  );
}
