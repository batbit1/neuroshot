import Image from "next/image";
import Link from "next/link";
import type { TemplateCategory } from "@/types";

export function CategoryCard({ category }: { category: TemplateCategory }) {
  const coverSrc = category.coverImageSrc?.trim();
  const hasCover =
    Boolean(coverSrc) &&
    coverSrc !== "undefined" &&
    coverSrc !== "null";

  return (
    <Link
      href={`/gallery/${category.id}`}
      className="group mx-auto flex h-full w-full max-w-[220px] flex-col overflow-hidden rounded-3xl border-2 border-violet-200/90 bg-white shadow-md shadow-violet-950/5 ring-2 ring-violet-100/80 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:ring-violet-200/90 sm:max-w-none"
    >
      <div className="relative w-full shrink-0 overflow-hidden bg-slate-100 aspect-[9/16]">
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
          Категория
        </span>
        {hasCover ? (
          <Image
            src={coverSrc!}
            alt={`Обложка: ${category.title}`}
            fill
            className="object-cover object-center transition duration-300 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            unoptimized
          />
        ) : (
          <div className={`relative h-full w-full bg-gradient-to-b ${category.accentClass}`}>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.35) 1px, transparent 0)",
                backgroundSize: "12px 12px",
              }}
              aria-hidden
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-violet-100/80 bg-white p-3">
        <h2 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-violet-950">
          {category.title}
        </h2>
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
          {category.description}
        </p>
        <span className="mt-auto pt-1 text-xs font-semibold text-violet-700 group-hover:text-violet-900">
          Шаблоны →
        </span>
      </div>
    </Link>
  );
}
