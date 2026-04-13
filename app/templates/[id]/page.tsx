"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import {
  generateWithOpenAi,
  type GenerationAspectFormat,
  type GenerationStyleIntensity,
} from "@/lib/generation/client-generate";
import { useAuth } from "@/lib/mock-auth";
import { saveGenerationResult } from "@/lib/results-storage";
import { getTemplateById } from "@/lib/templates-merge";
import type { Template } from "@/types";

export default function TemplatePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [template, setTemplate] = useState<Template | undefined | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aspectFormat, setAspectFormat] =
    useState<GenerationAspectFormat>("9:16");
  const [styleIntensity, setStyleIntensity] =
    useState<GenerationStyleIntensity>("medium");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setTemplate(getTemplateById(id));
  }, [id]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onPickFile = useCallback((list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFormError("Нужен файл изображения.");
      return;
    }
    setFile(f);
    setFormError(null);
  }, []);

  const onCreate = useCallback(async () => {
    if (!template || !user) return;
    if (!file) {
      setFormError("Загрузите одно фото.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const record = await generateWithOpenAi({
        templateId: template.id,
        templateTitle: template.title,
        internalPrompt: template.internalPrompt,
        userId: user.id,
        imageFile: file,
        aspectFormat,
        styleIntensity,
      });
      saveGenerationResult(record);
      router.push(`/result/${record.id}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Не удалось создать изображение. Попробуйте позже.",
      );
    } finally {
      setBusy(false);
    }
  }, [aspectFormat, file, router, styleIntensity, template, user]);

  if (template === null) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-600">
          Загрузка…
        </div>
      </RequireAuth>
    );
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Шаблон не найден.</p>
        <Link href="/gallery" className="mt-4 inline-block text-slate-900 underline">
          В галерею
        </Link>
      </div>
    );
  }

  const formatBtn =
    "flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Link
          href={`/gallery/${template.categoryId}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← К категории
        </Link>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-10">
          <aside className="mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-[320px]">
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-sm ring-1 ring-slate-900/5 aspect-[9/16] lg:sticky lg:top-24">
              {template.previewImageSrc ? (
                <Image
                  src={template.previewImageSrc}
                  alt={`${template.title} — пример`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 280px, 320px"
                  unoptimized
                />
              ) : (
                <div className={`relative h-full w-full bg-gradient-to-b ${template.accentClass}`}>
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.45) 1px, transparent 0)",
                      backgroundSize: "12px 12px",
                    }}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </aside>

          <section>
            <h1 className="text-2xl font-bold text-slate-900">{template.title}</h1>
            <p className="mt-2 text-slate-600">{template.description}</p>

            <div className="mt-7 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-900">Настройки генерации</h3>

                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Формат изображения
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectFormat("9:16")}
                    className={`${formatBtn} ${
                      aspectFormat === "9:16"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    9:16 · портрет
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectFormat("16:9")}
                    className={`${formatBtn} ${
                      aspectFormat === "16:9"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    16:9 · альбом
                  </button>
                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Интенсивность стиля
                </p>
                <div className="mt-2 inline-flex w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto sm:min-w-[320px]">
                  {(
                    [
                      { key: "low" as const, label: "Слабый" },
                      { key: "medium" as const, label: "Средний" },
                      { key: "high" as const, label: "Сильный" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStyleIntensity(key)}
                      className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition sm:px-3 sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                        styleIntensity === key
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ваше фото (1 файл)</h2>
                <p className="mt-1 text-sm text-slate-600">
                  На этом шаге поддерживается только одно изображение.
                </p>

                <div className="mt-4">
                  <label className="inline-flex cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onPickFile(e.target.files)}
                    />
                    Выбрать файл
                  </label>
                </div>

                {preview && (
                  <div className="mt-6">
                    <div className="relative h-36 w-36 overflow-hidden rounded-lg border border-slate-200">
                      <Image src={preview} alt={file?.name ?? ""} fill className="object-cover" unoptimized />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-1 text-xs text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <button
              type="button"
              onClick={onCreate}
              disabled={busy}
              className="mt-7 w-full rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Создаём…" : "Создать"}
            </button>
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
