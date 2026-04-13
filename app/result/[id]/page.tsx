"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import {
  getGenerationResult,
  setGenerationFavorite,
} from "@/lib/results-storage";
import { useAuth } from "@/lib/mock-auth";
import { getTemplateById } from "@/lib/templates-merge";
import type { GenerationRecord } from "@/types";

export default function ResultPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();
  const [record, setRecord] = useState<GenerationRecord | undefined>(undefined);
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    setRecord(getGenerationResult(id));
  }, [id]);

  useEffect(() => {
    reload();
    setReady(true);
  }, [reload]);

  const template = record ? getTemplateById(record.templateId) : undefined;
  const isMine = Boolean(user && record && record.userId === user.id);
  const downloadName = record ? `generation-${record.id}.png` : "image.png";

  function toggleFavorite() {
    if (!record || !isMine) return;
    const next = !record.isFavorite;
    setGenerationFavorite(record.id, next);
    reload();
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-10">
        {!ready ? (
          <p className="text-slate-600">Загрузка…</p>
        ) : !record ? (
          <>
            <h1 className="text-xl font-bold text-slate-900">Результат не найден</h1>
            <p className="mt-2 text-slate-600">
              Возможно, вкладка открыта заново или сессия сброшена. Создайте картинку ещё раз.
            </p>
            <Link
              href="/gallery"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
            >
              В галерею шаблонов
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Готово</h1>
            <p className="mt-1 text-slate-600">
              Шаблон: <span className="font-medium text-slate-800">{template?.title ?? record.templateId}</span>
            </p>
            <p className="text-sm text-slate-500">Файл: {record.fileNames.join(", ")}</p>
            <div className="relative mt-8 aspect-square w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={record.imageSrc}
                alt="Результат генерации"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={record.imageSrc}
                download={downloadName}
                className="inline-block rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800"
              >
                Скачать
              </a>
              {isMine && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  aria-pressed={record.isFavorite}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {record.isFavorite ? "❤️" : "🤍"}
                  </span>
                  {record.isFavorite ? "В избранном" : "Добавить в избранное"}
                </button>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Избранное сохраняется в браузере — оно появится в разделе «Мои избранные» в профиле.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gallery"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-800 hover:bg-slate-50"
              >
                Другой шаблон
              </Link>
              <Link
                href={`/templates/${record.templateId}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-800 hover:bg-slate-50"
              >
                Тот же шаблон ещё раз
              </Link>
              <Link
                href="/profile"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-800 hover:bg-slate-50"
              >
                Профиль
              </Link>
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
