"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireOwner } from "@/components/RequireOwner";
import { OWNER_EMAIL } from "@/lib/owner";
import {
  appendTemplate,
  removeTemplateById,
  updateTemplateById,
} from "@/lib/template-storage";
import {
  DEFAULT_CATEGORY_ID,
  getAllCategories,
  getCategoryById,
} from "@/lib/categories";
import { getAllTemplates } from "@/lib/templates-merge";
import type { Template } from "@/types";

const DEFAULT_ACCENT = "from-sky-200 to-blue-300";

type EditDraft = {
  title: string;
  description: string;
  previewImageSrc: string;
  internalPrompt: string;
  categoryId: string;
};

function ManageTemplatesContent() {
  const [list, setList] = useState<Template[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  const [internalPrompt, setInternalPrompt] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [message, setMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  useEffect(() => {
    setList(getAllTemplates());
  }, []);

  function refresh() {
    setList(getAllTemplates());
  }

  function startEdit(t: Template) {
    setMessage(null);
    setEditId(t.id);
    setEditDraft({
      title: t.title,
      description: t.description,
      previewImageSrc: t.previewImageSrc ?? "",
      internalPrompt: t.internalPrompt,
      categoryId: t.categoryId,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditDraft(null);
  }

  function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editId || !editDraft) return;
    if (
      !editDraft.title.trim() ||
      !editDraft.description.trim() ||
      !editDraft.internalPrompt.trim()
    ) {
      setMessage("При редактировании заполните название, описание и служебный текст.");
      return;
    }
    const preview = editDraft.previewImageSrc.trim();
    updateTemplateById(editId, {
      title: editDraft.title,
      description: editDraft.description,
      internalPrompt: editDraft.internalPrompt,
      previewImageSrc: preview || undefined,
      categoryId: editDraft.categoryId,
    });
    cancelEdit();
    refresh();
    setMessage("Изменения сохранены.");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!title.trim() || !description.trim() || !internalPrompt.trim()) {
      setMessage("Заполните название, описание и служебный текст.");
      return;
    }
    const preview = previewImageSrc.trim();
    appendTemplate({
      id: crypto.randomUUID(),
      categoryId: newCategoryId,
      title: title.trim(),
      description: description.trim(),
      accentClass: DEFAULT_ACCENT,
      internalPrompt: internalPrompt.trim(),
      previewImageSrc: preview || undefined,
    });
    setTitle("");
    setDescription("");
    setPreviewImageSrc("");
    setInternalPrompt("");
    refresh();
    setMessage("Шаблон добавлен — он уже в галерее.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/gallery"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← В галерею
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Управление шаблонами
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Доступ только у владельца (email <code className="rounded bg-slate-100 px-1">{OWNER_EMAIL}</code>
        ). Данные шаблонов пока хранятся в браузере этого компьютера.
      </p>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Новый шаблон</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Категория</span>
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
            >
              {getAllCategories().map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Название</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Например: Неоновый коллаж"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Короткое описание</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="То, что увидят пользователи в галерее"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Превью-картинка (необязательно)
            </span>
            <input
              type="url"
              value={previewImageSrc}
              onChange={(e) => setPreviewImageSrc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="https://… или /placeholder-result.svg"
            />
            <span className="mt-1 block text-xs text-slate-500">
              URL или путь к файлу в папке <code className="rounded bg-slate-100 px-1">public</code>
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Служебный текст / будущий prompt для AI
            </span>
            <textarea
              value={internalPrompt}
              onChange={(e) => setInternalPrompt(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Опишите стиль так, как потом передам в API…"
            />
          </label>
          {message && (
            <p className="text-sm text-slate-700" role="status">
              {message}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-slate-800"
          >
            Добавить шаблон
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Все шаблоны в галерее</h2>
        <p className="mt-1 text-sm text-slate-600">
          Служебный текст виден только здесь, не в карточке у пользователя.
          Все шаблоны в списке хранятся в браузере; любой можно изменить или удалить.
        </p>
        {list === null ? (
          <p className="mt-4 text-slate-600">Загрузка…</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {list.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {editId === t.id && editDraft ? (
                  <form onSubmit={onSaveEdit} className="space-y-3">
                    <p className="text-xs text-slate-400">id: {t.id}</p>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Категория</span>
                      <select
                        value={editDraft.categoryId}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, categoryId: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        {getAllCategories().map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Название</span>
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, title: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Описание</span>
                      <textarea
                        value={editDraft.description}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, description: e.target.value })
                        }
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Превью (URL или путь в public)
                      </span>
                      <input
                        type="url"
                        value={editDraft.previewImageSrc}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, previewImageSrc: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="оставьте пустым — будет градиент"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Служебный текст / prompt
                      </span>
                      <textarea
                        value={editDraft.internalPrompt}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, internalPrompt: e.target.value })
                        }
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {t.previewImageSrc ? (
                        <Image
                          src={t.previewImageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${t.accentClass}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        Категория:{" "}
                        {getCategoryById(t.categoryId)?.title ?? t.categoryId}
                      </p>
                      <p className="text-sm text-slate-600">{t.description}</p>
                      {t.internalPrompt ? (
                        <p
                          className="mt-2 truncate font-mono text-xs text-slate-500"
                          title={t.internalPrompt}
                        >
                          {t.internalPrompt}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-400">id: {t.id}</p>
                    </div>
                    <div className="flex shrink-0 flex-col justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Удалить шаблон «${t.title}»? Его не будет в галерее.`,
                            )
                          ) {
                            return;
                          }
                          if (editId === t.id) cancelEdit();
                          removeTemplateById(t.id);
                          refresh();
                          setMessage(null);
                        }}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ManageTemplatesPage() {
  return (
    <RequireAuth>
      <RequireOwner>
        <ManageTemplatesContent />
      </RequireOwner>
    </RequireAuth>
  );
}
