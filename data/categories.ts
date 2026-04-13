import type { TemplateCategory } from "@/types";

function makeCategoryCover(title: string, subtitle: string, colors: [string, string, string]) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#g)"/>
      <circle cx="600" cy="220" r="180" fill="rgba(255,255,255,0.18)"/>
      <circle cx="140" cy="980" r="220" fill="rgba(255,255,255,0.12)"/>
      <text x="60" y="980" fill="white" font-size="70" font-weight="700" font-family="Inter, Arial, sans-serif">${title}</text>
      <text x="60" y="1040" fill="rgba(255,255,255,0.88)" font-size="34" font-weight="500" font-family="Inter, Arial, sans-serif">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Стартовый каталог категорий (позже можно вынести в БД). */
export const defaultCategories: TemplateCategory[] = [
  {
    id: "trends",
    title: "Тренды",
    description: "Актуальные визуальные стили и смелые, заметные решения.",
    coverImageSrc: makeCategoryCover("Trends", "Bold style", [
      "#7c3aed",
      "#ec4899",
      "#fb923c",
    ]),
    accentClass: "from-violet-500 via-fuchsia-400 to-orange-300",
  },
  {
    id: "photoshoots",
    title: "Фотосессии",
    description: "Свет, фон и настроение как у профессиональной съёмки.",
    coverImageSrc: makeCategoryCover("Photoshoots", "Studio mood", [
      "#f59e0b",
      "#fb7185",
      "#f97316",
    ]),
    accentClass: "from-amber-200 via-orange-200 to-rose-300",
  },
  {
    id: "movies",
    title: "Фильмы",
    description: "Кадр, цветокор и атмосфера киношных историй.",
    coverImageSrc: makeCategoryCover("Movies", "Cinematic scene", [
      "#0f172a",
      "#312e81",
      "#111827",
    ]),
    accentClass: "from-slate-700 via-indigo-900 to-slate-900",
  },
  {
    id: "fantasy",
    title: "Фантастика",
    description: "Вымысел, магия и необычные миры вокруг вас.",
    coverImageSrc: makeCategoryCover("Fantasy", "Dream worlds", [
      "#06b6d4",
      "#14b8a6",
      "#0ea5e9",
    ]),
    accentClass: "from-cyan-400 via-teal-500 to-emerald-700",
  },
];
