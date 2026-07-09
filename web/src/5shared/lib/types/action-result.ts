import type { ErrorCode } from "@/5shared/lib/errors";

/**
 * Результат Server Action — единый формат ответа.
 * errorCode — типизированный код для логики клиента,
 * details — опциональные динамические детали (zod-сообщения, ошибки бэкенда).
 * Клиент приоритезирует details если есть, иначе маппит errorCode.
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; errorCode: ErrorCode; details?: string };
