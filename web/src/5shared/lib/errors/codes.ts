/**
 * Глобальные коды ошибок приложения.
 * Значение = имя ключа, чтобы код можно было безопасно передавать
 * через NextAuth error string и JSON-ответы.
 */
export enum ErrorCode {
  // ── Auth & Session ────────────────────────────────────────────────
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // ── General ───────────────────────────────────────────────────────
  SOMETHING_WRONG = "SOMETHING_WRONG",
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // ── Group operations ──────────────────────────────────────────────
  GROUP_NOT_FOUND = "GROUP_NOT_FOUND",
  GROUP_SUSPENDED = "GROUP_SUSPENDED",
  GROUP_FULL = "GROUP_FULL",
  INVALID_INVITE_CODE = "INVALID_INVITE_CODE",
  VPN_NOT_PROVISIONED = "VPN_NOT_PROVISIONED",

  // ── User operations ───────────────────────────────────────────────
  USER_NOT_FOUND = "USER_NOT_FOUND",
  LOGIN_ALREADY_EXISTS = "LOGIN_ALREADY_EXISTS",

  // ── Support ───────────────────────────────────────────────────────
  TICKET_NOT_FOUND = "TICKET_NOT_FOUND",

  // ── Validation (zod) ──────────────────────────────────────────────
  FIELDS_REQUIRED = "FIELDS_REQUIRED",
  PASSWORD_MIN_LENGTH_6 = "PASSWORD_MIN_LENGTH_6",
  PASSWORD_MIN_LENGTH_8 = "PASSWORD_MIN_LENGTH_8",
  GROUP_NAME_REQUIRED = "GROUP_NAME_REQUIRED",
  GROUP_REQUIRED = "GROUP_REQUIRED",
  TOPIC_REQUIRED = "TOPIC_REQUIRED",
  MESSAGE_REQUIRED = "MESSAGE_REQUIRED",
}

/**
 * Приводит произвольную строку к ErrorCode.
 * Используется для zod-issue.message (в схемах message = код)
 * и любых внешних строк. Неизвестное значение → fallback.
 */
export function toErrorCode(
  value: string | null | undefined,
  fallback: ErrorCode = ErrorCode.VALIDATION_ERROR,
): ErrorCode {
  if (value && Object.values(ErrorCode).includes(value as ErrorCode)) {
    return value as ErrorCode;
  }
  return fallback;
}
