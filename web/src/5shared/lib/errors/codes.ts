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
}
