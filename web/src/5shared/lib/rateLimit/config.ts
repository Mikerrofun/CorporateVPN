/** Конфигурация одного лимита (Token Bucket) */
export interface RateLimitConfig {
  /** Максимум попыток за окно */
  points: number;
  /** Окно в секундах */
  duration: number;
}

export const RATE_LIMITS = {
  /** Регистрация: 3 попытки / 15 мин (по IP + login) */
  REGISTER: { points: 3, duration: 900 },
  /** Вход, уровень IP: 20 попыток / 10 мин (защита от credential stuffing) */
  LOGIN_BY_IP: { points: 20, duration: 600 },
  /** Вход, уровень аккаунта: 5 попыток / 10 мин (защита от brute force) */
  LOGIN_BY_ACCOUNT: { points: 5, duration: 600 },
} as const satisfies Record<string, RateLimitConfig>;
