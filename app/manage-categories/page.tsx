"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireOwner } from "@/components/RequireOwner";
import {
  appendCategory,
  CATEGORY_COVERS_CHANGED_EVENT,
  CATEGORY_ACCENT_CLASS_PRESETS,
  createSafeCategoryId,
  DEFAULT_CATEGORY_ID,
  getAllCategories,
  removeCategoryById,
  updateCategoryById,
} from "@/lib/categories";
import { OWNER_EMAIL } from "@/lib/owner";
import type { TemplateCategory } from "@/types";

type CategoryDraft = {
  title: string;
  description: string;
  coverImageSrc: string;
  accentClass: string;
};
type DraftMap = Record<string, CategoryDraft>;

type AccentClassPreset = (typeof CATEGORY_ACCENT_CLASS_PRESETS)[number];

type NewCategoryForm = {
  id: string;
  title: string;
  description: string;
  coverImageSrc: string;
  accentClass: AccentClassPreset;
};

const DEFAULT_NEW_ACCENT_CLASS = CATEGORY_ACCENT_CLASS_PRESETS[0];

function ManageCategoriesContent() {
  const [categories, setCategories] = useState<TemplateCategory[] | null>(null);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [message, setMessage] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    id: "",
    title: "",
    description: "",
    coverImageSrc: "",
    accentClass: DEFAULT_NEW_ACCENT_CLASS,
  });

  function refresh() {
    const list = getAllCategories();
    setCategories(list);
    setDrafts((prev) => {
      const next: DraftMap = {};
      for (const category of list) {
        next[category.id] = prev[category.id] ?? {
          title: category.title,
          description: category.description,
          coverImageSrc: category.coverImageSrc ?? "",
          accentClass: category.accentClass,
        };
      }
      return next;
    });
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("storage", onChange);
    window.addEventListener(CATEGORY_COVERS_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CATEGORY_COVERS_CHANGED_EVENT, onChange);
    };
  }, []);

  function onSave(e: FormEvent, categoryId: string) {
    e.preventDefault();
    const draft = drafts[categoryId];
    if (!draft) return;
    if (!draft.title.trim() || !draft.description.trim()) {
      setMessage("Заполните title и description перед сохранением.");
      return;
    }
    updateCategoryById(categoryId, {
      title: draft.title,
      description: draft.description,
      coverImageSrc: draft.coverImageSrc,
      accentClass: draft.accentClass,
    });
    setMessage("Категория сохранена.");
  }

  function onCreateCategory(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const safeId = createSafeCategoryId(newCategory.id);
    const result = appendCategory({
      id: safeId,
      title: newCategory.title,
      description: newCategory.description,
      coverImageSrc: newCategory.coverImageSrc,
      accentClass: newCategory.accentClass,
    });
    if (!result.ok) {
      if (result.reason === "duplicate-id") {
        setMessage("Категория с таким id уже существует.");
      } else {
        setMessage("Проверьте поля новой категории (id, title, description, accentClass).");
      }
      return;
    }
    setNewCategory({
      id: "",
      title: "",
      description: "",
      coverImageSrc: "",
      accentClass: DEFAULT_NEW_ACCENT_CLASS,
    });
    refresh();
    setMessage(`Категория "${safeId}" создана.`);
  }

  function onDeleteCategory(category: TemplateCategory) {
    const list = categories ?? [];
    if (category.id === DEFAULT_CATEGORY_ID) {
      setMessage(`Категорию "${DEFAULT_CATEGORY_ID}" удалять нельзя.`);
      return;
    }
    if (list.length <= 1) {
      setMessage("Нельзя удалить последнюю категорию.");
      return;
    }
    const ok = window.confirm(
      `Удалить категорию "${category.title}"? Все её шаблоны будут перенесены в "${DEFAULT_CATEGORY_ID}".`,
    );
    if (!ok) return;
    const result = removeCategoryById(category.id);
    if (!result.ok) {
      if (result.reason === "cannot-remove-default") {
        setMessage(`Категорию "${DEFAULT_CATEGORY_ID}" удалять нельзя.`);
      } else if (result.reason === "cannot-remove-last") {
        setMessage("Нельзя удалить последнюю категорию.");
      } else {
        setMessage("Категория не найдена.");
      }
      return;
    }
    refresh();
    setMessage(`Категория "${category.title}" удалена. Шаблоны перенесены в "${DEFAULT_CATEGORY_ID}".`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/gallery"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← В галерею
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Управление категориями</h1>
      <p className="mt-1 text-sm text-slate-600">
        Доступ только у владельца (email <code className="rounded bg-slate-100 px-1">{OWNER_EMAIL}</code>
        ). Категории хранятся локально в браузере этого компьютера.
      </p>

      {message && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {message}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Новая категория</h2>
        <form onSubmit={onCreateCategory} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">id / slug</span>
            <input
              type="text"
              value={newCategory.id}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, id: createSafeCategoryId(e.target.value) }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="urban-style"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Только латиница, цифры и дефисы.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              type="text"
              value={newCategory.title}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Новый стиль"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Краткое описание категории"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">coverImageSrc</span>
            <input
              type="url"
              value={newCategory.coverImageSrc}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, coverImageSrc: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="https://... или /image.jpg"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">accentClass</span>
            <select
              value={newCategory.accentClass}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  accentClass: e.target.value as AccentClassPreset,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
            >
              {CATEGORY_ACCENT_CLASS_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Создать категорию
            </button>
          </div>
        </form>
      </section>

      {categories === null ? (
        <p className="mt-8 text-slate-600">Загрузка…</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {categories.map((category) => {
            const hasCover = Boolean(category.coverImageSrc?.trim());
            const draft = drafts[category.id] ?? {
              title: category.title,
              description: category.description,
              coverImageSrc: category.coverImageSrc ?? "",
              accentClass: category.accentClass,
            };
            return (
              <li
                key={category.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 sm:grid-cols-[120px_1fr] sm:items-start">
                  <div className="relative h-48 w-[120px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {hasCover ? (
                      <Image
                        src={category.coverImageSrc!}
                        alt={`Обложка категории ${category.title}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-b ${category.accentClass}`} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                    <p className="mt-2 text-xs text-slate-500">id: {category.id}</p>

                    <form onSubmit={(e) => onSave(e, category.id)} className="mt-4 space-y-3">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">title</span>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [category.id]: { ...draft, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">description</span>
                        <textarea
                          value={draft.description}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [category.id]: { ...draft, description: e.target.value },
                            }))
                          }
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">coverImageSrc</span>
                        <input
                          type="url"
                          value={draft.coverImageSrc}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [category.id]: { ...draft, coverImageSrc: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                          placeholder="https://... или /image.jpg"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">accentClass</span>
                        <select
                          value={draft.accentClass}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [category.id]: { ...draft, accentClass: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          {CATEGORY_ACCENT_CLASS_PRESETS.map((preset) => (
                            <option key={preset} value={preset}>
                              {preset}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(category)}
                        disabled={category.id === DEFAULT_CATEGORY_ID || (categories?.length ?? 0) <= 1}
                        className="ml-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ManageCategoriesPage() {
  return (
    <RequireAuth>
      <RequireOwner>
        <ManageCategoriesContent />
      </RequireOwner>
    </RequireAuth>
  );
}
