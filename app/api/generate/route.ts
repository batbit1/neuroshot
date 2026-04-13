import { NextResponse } from "next/server";

const OPENAI_IMAGES_API_URL = "https://api.openai.com/v1/images/edits";
const OPENAI_MODEL = "gpt-image-1";
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

/** Допустимые для API значения size: 1024x1536 (вертикаль), 1536x1024 (горизонталь). */
const OPENAI_SIZE_BY_ASPECT = {
  "9:16": "1024x1536",
  "16:9": "1536x1024",
} as const;

type AspectKey = keyof typeof OPENAI_SIZE_BY_ASPECT;

function parseAspectFormat(value: unknown): AspectKey | null {
  const s = String(value ?? "").trim();
  if (s === "9:16" || s === "16:9") return s;
  return null;
}

/** Фраза в prompt в зависимости от интенсивности стиля. */
const STYLE_LINE_BY_INTENSITY = {
  low: "Сохрани максимально естественный вид человека.",
  medium: "Сохрани баланс между стилем и реальностью.",
  high: "Максимально примени стиль шаблона.",
} as const;

type StyleIntensityKey = keyof typeof STYLE_LINE_BY_INTENSITY;

function parseStyleIntensity(value: unknown): StyleIntensityKey | null {
  const s = String(value ?? "").trim();
  if (s === "low" || s === "medium" || s === "high") return s;
  return null;
}

type OpenAiImagesJson = {
  error?: { message?: string };
  data?: Array<{ b64_json?: string; url?: string }>;
};

type CallResult =
  | { ok: true; imageSrc: string }
  | { ok: false; status: number; message: string };

function buildOpenAiForm(
  userPrompt: string,
  imageBlob: Blob,
  fileName: string,
  size: string,
): FormData {
  const openAiForm = new FormData();
  openAiForm.append("model", OPENAI_MODEL);
  openAiForm.append("prompt", userPrompt);
  openAiForm.append("size", size);
  openAiForm.append("image", imageBlob, fileName);
  return openAiForm;
}

async function callOpenAiEdits(
  apiKey: string,
  openAiForm: FormData,
): Promise<CallResult> {
  let response: Response;
  try {
    response = await fetch(OPENAI_IMAGES_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openAiForm,
    });
  } catch (err) {
    console.error("[generate] OpenAI fetch failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 502,
      message: `Не удалось связаться с OpenAI: ${detail}`,
    };
  }

  let json: OpenAiImagesJson;
  try {
    json = (await response.json()) as OpenAiImagesJson;
  } catch (parseErr) {
    console.error("[generate] OpenAI response is not valid JSON:", parseErr);
    return {
      ok: false,
      status: 502,
      message: "OpenAI вернул ответ, который не удалось разобрать.",
    };
  }

  if (!response.ok) {
    const message =
      json.error?.message?.trim() ||
      `OpenAI вернул ошибку (код ${response.status}).`;
    if (!json.error?.message) {
      console.error(
        "[generate] OpenAI error without message:",
        response.status,
        json,
      );
    }
    return { ok: false, status: response.status, message };
  }

  const item = json.data?.[0];
  if (!item?.b64_json && !item?.url) {
    console.error("[generate] OpenAI OK but no image in data:", json);
    return {
      ok: false,
      status: 502,
      message: "OpenAI не вернул изображение.",
    };
  }

  const imageSrc = item.url ?? `data:image/png;base64,${item.b64_json}`;
  return { ok: true, imageSrc };
}

/** Повтор имеет смысл при сетевых сбоях, 5xx и rate limit — не при 4xx «логических». */
function shouldRetryOnce(result: Extract<CallResult, { ok: false }>): boolean {
  if (result.status === 429) return true;
  if (result.status >= 500) return true;
  return false;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY не настроен на сервере." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const imageField = formData.get("image");
    const templateTitle = String(formData.get("templateTitle") ?? "");
    const internalPrompt = String(formData.get("internalPrompt") ?? "");
    const aspectKey = parseAspectFormat(formData.get("aspectFormat"));
    if (!aspectKey) {
      return NextResponse.json(
        { error: "Выберите формат: 9:16 или 16:9." },
        { status: 400 },
      );
    }
    const openAiSize = OPENAI_SIZE_BY_ASPECT[aspectKey];

    const intensityKey = parseStyleIntensity(formData.get("styleIntensity"));
    if (!intensityKey) {
      return NextResponse.json(
        { error: "Укажите интенсивность стиля: low, medium или high." },
        { status: 400 },
      );
    }
    const styleLine = STYLE_LINE_BY_INTENSITY[intensityKey];

    const isFileLike =
      typeof imageField === "object" &&
      imageField !== null &&
      "name" in imageField &&
      "type" in imageField &&
      "size" in imageField &&
      "arrayBuffer" in imageField;

    if (!isFileLike) {
      return NextResponse.json(
        { error: "Нужно передать одно изображение." },
        { status: 400 },
      );
    }
    const file = imageField as File;

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Файл должен быть изображением." },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "Файл пустой. Выберите корректное изображение." },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер — 8MB." },
        { status: 400 },
      );
    }

    const userPrompt = [
      "Сделай стилизацию по шаблону и сохрани черты лица пользователя.",
      `Название шаблона: ${templateTitle || "без названия"}.`,
      internalPrompt.trim()
        ? `Внутренний prompt шаблона: ${internalPrompt.trim()}`
        : "Внутренний prompt шаблона не задан: сделай аккуратную художественную обработку.",
      styleLine,
      "Верни одно готовое изображение.",
    ].join("\n");

    const bytes = await file.arrayBuffer();
    const imageBlob = new Blob([bytes], { type: file.type });

    let result = await callOpenAiEdits(
      apiKey,
      buildOpenAiForm(userPrompt, imageBlob, file.name, openAiSize),
    );

    if (!result.ok && shouldRetryOnce(result)) {
      console.error("[generate] first OpenAI attempt failed, retrying once:", result.message);
      result = await callOpenAiEdits(
        apiKey,
        buildOpenAiForm(userPrompt, imageBlob, file.name, openAiSize),
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json({ imageSrc: result.imageSrc });
  } catch (err) {
    console.error("[generate] unexpected error:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Не удалось выполнить генерацию: ${detail}` },
      { status: 500 },
    );
  }
}
