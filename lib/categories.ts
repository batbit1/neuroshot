import { defaultCategories } from "@/data/categories";
import { STORAGE_CATEGORIES, STORAGE_CATEGORY_COVERS } from "@/lib/storage-keys";
import type { TemplateCategory } from "@/types";

const defaultIdSet = new Set(defaultCategories.map((c) => c.id));
export const DEFAULT_CATEGORY_ID = defaultCategories[0].id;
export const CATEGORY_COVERS_CHANGED_EVENT = "mvp-category-covers-changed";
const TEMPLATE_LIST_CHANGED_EVENT = "mvp-templates-changed";
const SAFE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_ACCENT_CLASS = defaultCategories[0]?.accentClass ?? "from-sky-200 to-blue-300";

export const CATEGORY_ACCENT_CLASS_PRESETS = [
  "from-violet-500 via-fuchsia-400 to-orange-300",
  "from-amber-200 via-orange-200 to-rose-300",
  "from-slate-700 via-indigo-900 to-slate-900",
  "from-cyan-400 via-teal-500 to-emerald-700",
  "from-sky-300 via-blue-400 to-indigo-500",
  "from-pink-300 via-rose-400 to-red-500",
] as const;

type CategoryCoversMap = Record<string, string>;
type CategoryInput = {
  id: string;
  title: string;
  description: string;
  coverImageSrc?: string;
  accentClass: string;
};
type CategoryEditableFields = Pick<
  TemplateCategory,
  "title" | "description" | "coverImageSrc" | "accentClass"
>;
const defaultCoverById = new Map(
  defaultCategories.map((category) => [category.id, category.coverImageSrc] as const),
);

function notifyCategoryCoversChanged() {
  window.dispatchEvent(new Event(CATEGORY_COVERS_CHANGED_EVENT));
}

function isValidSafeId(id: string) {
  return SAFE_ID_RE.test(id);
}

function isValidAccentClass(accentClass: string) {
  return CATEGORY_ACCENT_CLASS_PRESETS.includes(
    accentClass as (typeof CATEGORY_ACCENT_CLASS_PRESETS)[number],
  );
}

export function createSafeCategoryId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-+/g, "-");
}

function loadCategoryCoversMap(): CategoryCoversMap {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_CATEGORY_COVERS);
  if (raw === null) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: CategoryCoversMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!defaultIdSet.has(key)) continue;
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed;
    }
    return out;
  } catch {
    return {};
  }
}

function normalizeCategory(input: CategoryInput): TemplateCategory | null {
  const id = createSafeCategoryId(input.id);
  if (!id || !isValidSafeId(id)) return null;
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) return null;
  const coverImageSrc = input.coverImageSrc?.trim();
  const accentClass = isValidAccentClass(input.accentClass)
    ? input.accentClass
    : DEFAULT_ACCENT_CLASS;
  return {
    id,
    title,
    description,
    coverImageSrc: coverImageSrc || undefined,
    accentClass,
  };
}

function mergeWithLegacyCoverOverrides(list: TemplateCategory[]): TemplateCategory[] {
  const legacy = loadCategoryCoversMap();
  if (Object.keys(legacy).length === 0) return list;
  return list.map((c) => {
    const override = legacy[c.id];
    if (!override) return c;
    return { ...c, coverImageSrc: override };
  });
}

function applyDefaultCoversIfMissing(list: TemplateCategory[]): TemplateCategory[] {
  return list.map((category) => {
    if (category.coverImageSrc?.trim()) return category;
    const fallbackCover = defaultCoverById.get(category.id)?.trim();
    if (!fallbackCover) return category;
    return { ...category, coverImageSrc: fallbackCover };
  });
}

function seedCategories(): TemplateCategory[] {
  const seeded = mergeWithLegacyCoverOverrides(defaultCategories.map((c) => ({ ...c })));
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(seeded));
  localStorage.removeItem(STORAGE_CATEGORY_COVERS);
  return seeded;
}

function loadCategories(): TemplateCategory[] {
  if (typeof window === "undefined") {
    return defaultCategories.map((c) => ({ ...c }));
  }
  const raw = localStorage.getItem(STORAGE_CATEGORIES);
  if (raw === null) return seedCategories();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedCategories();
    const out: TemplateCategory[] = [];
    const ids = new Set<string>();
    for (const item of parsed as CategoryInput[]) {
      const normalized = normalizeCategory(item);
      if (!normalized || ids.has(normalized.id)) continue;
      ids.add(normalized.id);
      out.push(normalized);
    }
    if (out.length === 0) return seedCategories();
    const next = applyDefaultCoversIfMissing(out);
    if (JSON.stringify(next) !== JSON.stringify(out)) {
      saveCategories(next);
    }
    return next;
  } catch {
    return seedCategories();
  }
}

function saveCategories(list: TemplateCategory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(list));
}

function reassignTemplatesFromCategory(fromCategoryId: string, toCategoryId: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem("mvp_templates");
  if (raw === null) return;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return;
    let changed = false;
    const next = parsed.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;
      const record = item as Record<string, unknown>;
      if (record.categoryId !== fromCategoryId) return item;
      changed = true;
      return { ...record, categoryId: toCategoryId };
    });
    if (!changed) return;
    localStorage.setItem("mvp_templates", JSON.stringify(next));
    window.dispatchEvent(new Event(TEMPLATE_LIST_CHANGED_EVENT));
  } catch {
    /* ignore broken mock data */
  }
}

export function updateCategoryCoverImageSrc(categoryId: string, nextCoverImageSrc: string) {
  if (!categoryId) return;
  if (typeof window === "undefined") return;
  const list = loadCategories();
  const index = list.findIndex((c) => c.id === categoryId);
  if (index === -1) return;
  const next = [...list];
  const trimmed = nextCoverImageSrc.trim();
  next[index] = { ...next[index], coverImageSrc: trimmed || undefined };
  saveCategories(next);
  notifyCategoryCoversChanged();
}

export function getAllCategories(): TemplateCategory[] {
  return loadCategories();
}

export function getCategoryById(id: string): TemplateCategory | undefined {
  return getAllCategories().find((c) => c.id === id);
}

export function isValidCategoryId(id: string | undefined): id is string {
  if (!id) return false;
  return getAllCategories().some((c) => c.id === id);
}

export function updateCategoryById(id: string, fields: CategoryEditableFields) {
  if (typeof window === "undefined") return;
  const list = loadCategories();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return;
  const title = fields.title.trim();
  const description = fields.description.trim();
  if (!title || !description) return;
  const coverImageSrc = fields.coverImageSrc?.trim();
  const accentClass = isValidAccentClass(fields.accentClass)
    ? fields.accentClass
    : DEFAULT_ACCENT_CLASS;
  const next = [...list];
  next[index] = {
    ...next[index],
    title,
    description,
    coverImageSrc: coverImageSrc || undefined,
    accentClass,
  };
  saveCategories(next);
  notifyCategoryCoversChanged();
}

export function appendCategory(input: CategoryInput): { ok: true } | { ok: false; reason: string } {
  if (typeof window === "undefined") return { ok: false, reason: "no-window" };
  const normalized = normalizeCategory(input);
  if (!normalized) {
    return { ok: false, reason: "invalid-fields" };
  }
  const list = loadCategories();
  if (list.some((c) => c.id === normalized.id)) {
    return { ok: false, reason: "duplicate-id" };
  }
  const next = [...list, normalized];
  saveCategories(next);
  notifyCategoryCoversChanged();
  return { ok: true };
}

export function removeCategoryById(
  id: string,
): { ok: true } | { ok: false; reason: "not-found" | "cannot-remove-default" | "cannot-remove-last" } {
  if (typeof window === "undefined") return { ok: false, reason: "not-found" };
  const list = loadCategories();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, reason: "not-found" };
  if (id === DEFAULT_CATEGORY_ID) {
    return { ok: false, reason: "cannot-remove-default" };
  }
  if (list.length <= 1) {
    return { ok: false, reason: "cannot-remove-last" };
  }
  const next = list.filter((c) => c.id !== id);
  saveCategories(next);
  reassignTemplatesFromCategory(id, DEFAULT_CATEGORY_ID);
  notifyCategoryCoversChanged();
  return { ok: true };
}
