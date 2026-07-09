import type { ErrorCode } from "@/5shared/lib/errors";

/**
 * Результат Server Action — единый формат ответа.
 * errorCode — типизированный код ошибки; клиент переводит его
 * в текст через единый словарь ERROR_MESSAGES (getErrorMessage).
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; errorCode: ErrorCode };
