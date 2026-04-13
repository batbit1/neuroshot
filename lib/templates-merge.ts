import { defaultTemplates } from "@/data/templates";
import { loadTemplates, normalizeTemplate } from "@/lib/template-storage";
import type { Template } from "@/types";

/** Все шаблоны из единого mock-хранилища (на сервере — только стартовый набор для отображения). */
export function getAllTemplates(): Template[] {
  if (typeof window === "undefined") {
    return defaultTemplates.map((t) => normalizeTemplate({ ...t }));
  }
  return loadTemplates();
}

export function getTemplatesByCategoryId(categoryId: string): Template[] {
  return getAllTemplates().filter((t) => t.categoryId === categoryId);
}

export function getTemplateById(id: string): Template | undefined {
  return getAllTemplates().find((t) => t.id === id);
}
