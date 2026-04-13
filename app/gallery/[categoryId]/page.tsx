"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { TemplateCard } from "@/components/TemplateCard";
import { useAuth } from "@/lib/mock-auth";
import { getCategoryById } from "@/lib/categories";
import { OWNER_EMAIL } from "@/lib/owner";
import { TEMPLATE_LIST_CHANGED_EVENT } from "@/lib/template-storage";
import { getTemplatesByCategoryId } from "@/lib/templates-merge";
import type { Template } from "@/types";

export default function GalleryCategoryPage() {
  const params = useParams();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const { user } = useAuth();
  const isOwner =
    user != null &&
    user.email.trim().toLowerCase() === OWNER_EMAIL.trim().toLowerCase();
  const [templates, setTemplates] = useState<Template[] | null>(null);

  useEffect(() => {
    if (!categoryId || !getCategoryById(categoryId)) return;
    const load = () => setTemplates(getTemplatesByCategoryId(categoryId));
    load();
    window.addEventListener("storage", load);
    window.addEventListener(TEMPLATE_LIST_CHANGED_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(TEMPLATE_LIST_CHANGED_EVENT, load);
    };
  }, [categoryId]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link
          href="/gallery"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Все категории
        </Link>

        {!category ? (
          <div className="mt-8">
            <h1 className="text-xl font-bold text-slate-900">Категория не найдена</h1>
            <p className="mt-2 text-slate-600">
              Проверьте ссылку или вернитесь в галерею.
            </p>
            <Link
              href="/gallery"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
            >
              В галерею
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{category.title}</h1>
                <p className="mt-1 text-slate-600">{category.description}</p>
              </div>
              {isOwner && (
                <Link
                  href="/manage-templates"
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Управление шаблонами
                </Link>
              )}
            </div>

            {templates === null ? (
              <p className="mt-8 text-slate-600">Загрузка списка…</p>
            ) : templates.length === 0 ? (
              <p className="mt-8 text-slate-600">
                В этой категории пока нет шаблонов.
              </p>
            ) : (
              <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
                {templates.map((t) => (
                  <li key={t.id} className="flex justify-center sm:block sm:justify-stretch">
                    <TemplateCard template={t} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
