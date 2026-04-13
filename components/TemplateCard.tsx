import Link from "next/link";
import Image from "next/image";
import type { Template } from "@/types";

export function TemplateCard({ template }: { template: Template }) {
  const hasPreview = Boolean(template.previewImageSrc?.trim());

  return (
    <Link
      href={`/templates/${template.id}`}
      className="group mx-auto flex h-full w-full max-w-[220px] flex-col overflow-hidden rounded-2xl border border-slate-200/95 bg-slate-50/50 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md sm:max-w-none"
    >
      <div className="relative w-full shrink-0 overflow-hidden bg-slate-100 aspect-[9/16]">
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-[2px]">
          Шаблон
        </span>
        {hasPreview ? (
          <>
            <Image
              src={template.previewImageSrc!}
              alt={`Превью: ${template.title}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
              className="object-cover object-center transition duration-300 ease-out group-hover:scale-[1.03]"
              unoptimized
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-90 transition group-hover:opacity-100"
              aria-hidden
            />
            <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-[2px]">
              Пример
            </span>
          </>
        ) : (
          <div
            className={`relative flex h-full w-full flex-col justify-between bg-gradient-to-b p-3 ${template.accentClass}`}
          >
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.45) 1px, transparent 0)",
                backgroundSize: "12px 12px",
              }}
              aria-hidden
            />
            <div />
            <div className="relative flex flex-col items-center justify-end pb-2 text-center">
              <span className="rounded-full border border-slate-900/15 bg-white/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-800 shadow-sm backdrop-blur-sm">
                Без примера
              </span>
              <p className="mt-2 line-clamp-3 text-sm font-bold leading-tight text-slate-900 drop-shadow-sm">
                {template.title}
              </p>
              <p className="mt-1 text-[10px] font-medium leading-snug text-slate-800/85">
                Откройте и загрузите фото
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-slate-200/80 bg-white p-3">
        <h2 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-slate-950">
          {template.title}
        </h2>
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">{template.description}</p>
        <span className="mt-auto pt-1 text-xs font-semibold text-slate-700 transition group-hover:text-slate-900">
          Открыть →
        </span>
      </div>
    </Link>
  );
}
