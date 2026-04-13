import type { GenerationRecord } from "@/types";
import { STORAGE_RESULTS } from "@/lib/storage-keys";

type ResultMap = Record<string, GenerationRecord>;

export function isBase64Image(src: string): boolean {
  return src.startsWith("data:image");
}

function normalizeRecord(raw: GenerationRecord): GenerationRecord {
  return { ...raw, isFavorite: Boolean(raw.isFavorite) };
}

function loadMap(): ResultMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_RESULTS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ResultMap;
    const out: ResultMap = {};
    for (const key of Object.keys(parsed)) {
      const r = parsed[key];
      if (r && typeof r === "object" && "id" in r) {
        out[key] = normalizeRecord(r as GenerationRecord);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveGenerationResult(record: GenerationRecord) {
  const map = loadMap();
  const imageSrc = isBase64Image(record.imageSrc) ? "" : record.imageSrc;
  const toSave = normalizeRecord({
    ...record,
    imageSrc,
    isFavorite: Boolean(record.isFavorite),
  });
  map[record.id] = toSave;
  localStorage.setItem(STORAGE_RESULTS, JSON.stringify(map));
}

export function getGenerationResult(id: string): GenerationRecord | undefined {
  const r = loadMap()[id];
  return r ? normalizeRecord(r) : undefined;
}

export function setGenerationFavorite(id: string, isFavorite: boolean) {
  const map = loadMap();
  const rec = map[id];
  if (!rec) return;
  map[id] = { ...rec, isFavorite };
  localStorage.setItem(STORAGE_RESULTS, JSON.stringify(map));
}

export function getFavoriteGenerationResultsByUser(
  userId: string,
): GenerationRecord[] {
  return Object.values(loadMap())
    .filter((r) => r.userId === userId && r.isFavorite)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
