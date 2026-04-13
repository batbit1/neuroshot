/** Данные пользователя (позже придут из Supabase Auth). */
export type User = {
  id: string;
  email: string;
  name: string;
};

/** Категория шаблонов в каталоге галереи. */
export type TemplateCategory = {
  id: string;
  title: string;
  description: string;
  /** Обложка категории; если нет — показываем градиент `accentClass`. */
  coverImageSrc?: string;
  accentClass: string;
};

/** Шаблон для генерации (позже — строки из БД или Supabase). */
export type Template = {
  id: string;
  /** Ссылка на категорию из `defaultCategories` (trends, photoshoots, …). */
  categoryId: string;
  title: string;
  description: string;
  accentClass: string;
  previewImageSrc?: string;
  internalPrompt: string;
};

/** Входные данные генерации (сохранён как базовый тип проекта). */
export type GenerationInput = {
  templateId: string;
  userId: string;
  files: { name: string; size: number }[];
};

/** Сохранённый результат генерации. */
export type GenerationRecord = {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  imageSrc: string;
  fileNames: string[];
  /** Показывать в профиле в блоке «Мои избранные». */
  isFavorite: boolean;
};
