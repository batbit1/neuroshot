import type { GenerationRecord } from "@/types";

/** Два варианта формата — только они, без свободного ввода. */
export type GenerationAspectFormat = "9:16" | "16:9";

/** Насколько сильно применять стиль шаблона. */
export type GenerationStyleIntensity = "low" | "medium" | "high";

type GenerateRequest = {
  templateId: string;
  templateTitle: string;
  internalPrompt: string;
  userId: string;
  imageFile: File;
  aspectFormat: GenerationAspectFormat;
  styleIntensity: GenerationStyleIntensity;
};

export async function generateWithOpenAi(
  input: GenerateRequest,
): Promise<GenerationRecord> {
  const form = new FormData();
  form.append("image", input.imageFile);
  form.append("templateTitle", input.templateTitle);
  form.append("internalPrompt", input.internalPrompt);
  form.append("aspectFormat", input.aspectFormat);
  form.append("styleIntensity", input.styleIntensity);

  const response = await fetch("/api/generate", {
    method: "POST",
    body: form,
  });

  const json = (await response.json()) as { imageSrc?: string; error?: string };
  if (!response.ok || !json.imageSrc) {
    throw new Error(json.error || "Генерация не удалась.");
  }

  return {
    id: crypto.randomUUID(),
    templateId: input.templateId,
    userId: input.userId,
    createdAt: new Date().toISOString(),
    imageSrc: json.imageSrc,
    fileNames: [input.imageFile.name],
    isFavorite: false,
  };
}
