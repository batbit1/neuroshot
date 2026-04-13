import { defaultTemplates } from "@/data/templates";
import { DEFAULT_CATEGORY_ID, isValidCategoryId } from "@/lib/categories";
import type { Template } from "@/types";
import { STORAGE_TEMPLATES } from "@/lib/storage-keys";

export function normalizeTemplate(t: Template): Template {
  return {
    ...t,
    categoryId: isValidCategoryId(t.categoryId) ? t.categoryId : DEFAULT_CATEGORY_ID,
  };
}

/**
 * Раньше «свои» шаблоны лежали отдельно. Один раз читаем и удаляем ключ
 * (не экспортируем — не часть текущей модели).
 */
const LEGACY_ONLY_ADDED_TEMPLATES_KEY = "mvp_owner_templates";

/** Событие для обновления галереи в той же вкладке. */
export const TEMPLATE_LIST_CHANGED_EVENT = "mvp-templates-changed";

function notifyTemplatesChanged() {
  window.dispatchEvent(new Event(TEMPLATE_LIST_CHANGED_EVENT));
}

function saveTemplates(list: Template[]) {
  localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(list));
}

/** Стартовый набор + элементы из старого хранилища без повторов по id. */
function seedFromDefaultsAndLegacy(extra: Template[]): Template[] {
  const ids = new Set<string>();
  const out: Template[] = [];
  for (const t of defaultTemplates) {
    if (!ids.has(t.id)) {
      ids.add(t.id);
      out.push(normalizeTemplate({ ...t }));
    }
  }
  for (const t of extra) {
    if (!ids.has(t.id)) {
      ids.add(t.id);
      out.push(normalizeTemplate({ ...t }));
    }
  }
  return out;
}

/**
 * Все шаблоны из `mvp_templates`.
 * Первый запуск: копия `defaultTemplates` из `data/templates`.
 * Если есть только старый ключ `mvp_owner_templates` — переносим без дублей и удаляем его.
 */
export function loadTemplates(): Template[] {
  if (typeof window === "undefined") {
    return defaultTemplates.map((t) => normalizeTemplate({ ...t }));
  }

  const unifiedRaw = localStorage.getItem(STORAGE_TEMPLATES);
  if (unifiedRaw !== null) {
    try {
      const parsed = JSON.parse(unifiedRaw) as unknown;
      if (Array.isArray(parsed)) {
        return (parsed as Template[]).map((t) => normalizeTemplate(t));
      }
    } catch {
      /* ниже — переинициализация */
    }
  }

  let legacyList: Template[] = [];
  const legacyRaw = localStorage.getItem(LEGACY_ONLY_ADDED_TEMPLATES_KEY);
  if (legacyRaw !== null) {
    try {
      const parsed = JSON.parse(legacyRaw) as unknown;
      if (Array.isArray(parsed)) legacyList = parsed as Template[];
    } catch {
      legacyList = [];
    }
  }

  const initial =
    legacyRaw !== null
      ? seedFromDefaultsAndLegacy(legacyList)
      : defaultTemplates.map((t) => normalizeTemplate({ ...t }));

  saveTemplates(initial);
  localStorage.removeItem(LEGACY_ONLY_ADDED_TEMPLATES_KEY);
  return initial;
}

export function appendTemplate(template: Template) {
  const next = [...loadTemplates(), normalizeTemplate(template)];
  saveTemplates(next);
  notifyTemplatesChanged();
}

export function removeTemplateById(id: string) {
  const next = loadTemplates().filter((t) => t.id !== id);
  saveTemplates(next);
  notifyTemplatesChanged();
}

type TemplateEditableFields = Pick<
  Template,
  "title" | "description" | "internalPrompt" | "previewImageSrc" | "categoryId"
>;

/** Обновляет только редактируемые поля; id и accentClass не меняются. */
export function updateTemplateById(id: string, fields: TemplateEditableFields) {
  const list = loadTemplates();
  const i = list.findIndex((t) => t.id === id);
  if (i === -1) return;
  const cur = list[i];
  const previewSrc = fields.previewImageSrc?.trim();
  const categoryId = isValidCategoryId(fields.categoryId)
    ? fields.categoryId
    : DEFAULT_CATEGORY_ID;
  const next = [...list];
  next[i] = {
    ...cur,
    title: fields.title.trim(),
    description: fields.description.trim(),
    internalPrompt: fields.internalPrompt.trim(),
    previewImageSrc: previewSrc ? previewSrc : undefined,
    categoryId,
  };
  saveTemplates(next);
  notifyTemplatesChanged();
}
