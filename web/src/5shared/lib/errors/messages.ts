import { ErrorCode } from "./codes";

/**
 * Единый словарь: код ошибки → человекочитаемый текст.
 *
 * Здесь описаны ВСЕ типизированные ошибки приложения.
 * Динамические сообщения (zod-валидация, детали бэкенда) сюда не входят —
 * они приходят с сервера готовым текстом в поле `details` и показываются напрямую.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // ── Auth & Session ────────────────────────────────────────────────
  [ErrorCode.UNAUTHORIZED]: "Требуется авторизация",
  [ErrorCode.FORBIDDEN]: "Доступ запрещен",
  [ErrorCode.INVALID_CREDENTIALS]: "Неверный логин или пароль",
  [ErrorCode.RATE_LIMIT_EXCEEDED]: "Слишком много попыток. Попробуйте позже.",

  // ── General ───────────────────────────────────────────────────────
  [ErrorCode.SOMETHING_WRONG]: "Что-то пошло не так. Попробуйте позже.",
  [ErrorCode.VALIDATION_ERROR]: "Некорректные данные",

  // ── Group operations ──────────────────────────────────────────────
  [ErrorCode.GROUP_NOT_FOUND]: "Группа не найдена",
  [ErrorCode.GROUP_SUSPENDED]: "Группа приостановлена",
  [ErrorCode.GROUP_FULL]: "Группа заполнена",
  [ErrorCode.INVALID_INVITE_CODE]: "Инвайт-код недействителен",
  [ErrorCode.VPN_NOT_PROVISIONED]: "VPN-аккаунт ещё не выдан для этой группы",

  // ── User operations ───────────────────────────────────────────────
  [ErrorCode.USER_NOT_FOUND]: "Сотрудник не найден",
  [ErrorCode.LOGIN_ALREADY_EXISTS]: "Логин уже зарегистрирован",

  // ── Support ───────────────────────────────────────────────────────
  [ErrorCode.TICKET_NOT_FOUND]: "Тикет не найден",
};

/**
 * Переводит код ошибки в текст для пользователя.
 * @param code — код с сервера (может быть неизвестной строкой, напр. от NextAuth)
 * @param fallback — текст по умолчанию, если код не распознан
 */
export function getErrorMessage(
  code: string | null | undefined,
  fallback = ERROR_MESSAGES[ErrorCode.SOMETHING_WRONG],
): string {
  if (code && code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as ErrorCode];
  }
  return fallback;
}
