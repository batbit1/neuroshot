/** Ключи localStorage / sessionStorage — в одном месте, без опечаток. */
export const STORAGE_USER = "mvp_user";
export const STORAGE_USERS_DB = "mvp_users";
export const STORAGE_RESULTS = "mvp_generation_results";
/** Полные data:image и т.п. только на время вкладки — не бьёт лимит localStorage. */
export const STORAGE_SESSION_RESULTS = "mvp_session_generation_results";
/** Единый список шаблонов (mock): галерея и страница управления. */
export const STORAGE_TEMPLATES = "mvp_templates";
/** Кастомные обложки категорий (mock): id категории -> coverImageSrc. */
export const STORAGE_CATEGORY_COVERS = "mvp_category_covers";
/** Единый список категорий (mock): дефолт + owner-изменения + новые категории. */
export const STORAGE_CATEGORIES = "mvp_categories";
