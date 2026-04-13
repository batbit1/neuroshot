"use client";

import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { RequireAuth } from "@/components/RequireAuth";
import { getAllCategories } from "@/lib/categories";
import { useAuth } from "@/lib/mock-auth";
import { OWNER_EMAIL } from "@/lib/owner";

export default function GalleryPage() {
  const { user } = useAuth();
  const isOwner =
    user != null &&
    user.email.trim().toLowerCase() === OWNER_EMAIL.trim().toLowerCase();
  const categories = getAllCategories();

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Галерея</h1>
            <p className="mt-1 text-slate-600">
              Выберите категорию, затем шаблон — загрузите фото и создайте картинку.
            </p>
          </div>
          {isOwner && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/manage-categories"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Управление категориями
              </Link>
              <Link
                href="/manage-templates"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Управление шаблонами
              </Link>
            </div>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {categories.map((c) => (
            <li key={c.id} className="flex justify-center sm:block sm:justify-stretch">
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </div>
    </RequireAuth>
  );
}
