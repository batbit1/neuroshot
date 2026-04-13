import type { Template } from "@/types";

/** Встроенные шаблоны (как «начальные данные»). Позже — таблица в Supabase. */
export const defaultTemplates: Template[] = [
  {
    id: "portrait-soft",
    categoryId: "photoshoots",
    title: "Мягкий портрет",
    description: "Тёплый свет и мягкие тона для селфи или портрета.",
    accentClass: "from-amber-200 to-orange-300",
    internalPrompt: "",
  },
  {
    id: "poster-bold",
    categoryId: "trends",
    title: "Яркий постер",
    description: "Контраст и крупная типографика в стиле афиши.",
    accentClass: "from-violet-300 to-fuchsia-400",
    internalPrompt: "",
  },
  {
    id: "minimal-card",
    categoryId: "movies",
    title: "Минималистичная карточка",
    description: "Много воздуха, ровные линии, нейтральный фон.",
    accentClass: "from-slate-200 to-zinc-300",
    internalPrompt: "",
  },
  {
    id: "summer-vibe",
    categoryId: "fantasy",
    title: "Летнее настроение",
    description: "Солнечные акценты и лёгкая зерность, как на плёнке.",
    accentClass: "from-cyan-200 to-lime-200",
    internalPrompt: "",
  },
];
