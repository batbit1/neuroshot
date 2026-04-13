"use client";

import { useRef } from "react";
import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { getAllCategories } from "@/lib/categories";

export default function HomePage() {
  const categories = getAllCategories();
  const categoriesScrollRef = useRef<HTMLUListElement | null>(null);
  const steps = [
    {
      title: "Выбери категорию или шаблон",
      description: "Открой галерею и найди стиль под настроение.",
      icon: "🎨",
    },
    {
      title: "Загрузи свои фото",
      description: "Добавь снимки, чтобы AI понял твой образ.",
      icon: "📷",
    },
    {
      title: "Нажми «Создать» и получи результат",
      description: "Через пару секунд получишь готовые варианты.",
      icon: "✨",
    },
  ];

  function scrollCategories(direction: "left" | "right") {
    if (!categoriesScrollRef.current) return;
    categoriesScrollRef.current.scrollBy({
      left: direction === "right" ? 300 : -300,
      behavior: "smooth",
    });
  }

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-violet-50/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.2),rgba(236,72,153,0.08),rgba(15,23,42,0)_72%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-8%] -z-0 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* HERO */}
        <section className="rounded-3xl border border-white/60 bg-white/80 px-6 py-12 text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            NeuroShot
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Создавай фотосессии
            <span className="block text-slate-700">с помощью AI</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Загрузи фото — получи стильные образы в разных стилях: ретро, кино,
            арт и многое другое
          </p>

          <div className="mt-8">
            <Link
              href="/gallery"
              className="inline-flex items-center rounded-xl bg-slate-900 px-7 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
            >
              Перейти в галерею
            </Link>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Как это работает
          </h2>

          <div className="mt-8 grid gap-5 text-sm text-slate-600 sm:grid-cols-3 sm:text-base">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="rounded-2xl border border-violet-100 bg-white/90 p-5 text-left shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-lg" aria-hidden>
                      {step.icon}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                    {step.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <span
                    className="pointer-events-none absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-400 shadow-sm sm:inline-flex"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mt-16">
          <h2 className="text-center text-xl font-semibold text-slate-900 sm:text-2xl">
            Категории
          </h2>

          <div className="relative mt-8">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white sm:inline-flex"
              aria-label="Прокрутить категории влево"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white sm:inline-flex"
              aria-label="Прокрутить категории вправо"
            >
              →
            </button>

            <ul
              ref={categoriesScrollRef}
              className="flex gap-4 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
            {categories.map((category) => (
                <li key={category.id} className="w-[220px] shrink-0">
                <CategoryCard category={category} />
              </li>
            ))}
            </ul>
          </div>
        </section>

        {/* FOOTER */}
        <section className="mt-16 text-center">
          <p className="text-xs text-slate-400">
            Демо AI-сервиса для генерации фотосессий
          </p>
        </section>
      </div>
    </main>
  );
}
