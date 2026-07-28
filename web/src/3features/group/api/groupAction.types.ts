import type { ActionResult } from "../model/types";

/**
 * Типы действий над группой.
 * Используется в groupAction API и useGroupActions хуке.
 */
export type GroupActionType = 
  | "suspend" 
  | "resume" 
  | "rotate" 
  | "delete" 
  | "refresh-code"
  | "update-max-members"; // ← новое действие

/**
 * Дискриминированный union результатов groupAction.
 * 
 * - refresh-code возвращает новый groupCode
 * - update-max-members возвращает обновлённый maxMembers
 * - остальные действия возвращают void
 */
export type GroupActionResult =
  | ActionResult<{ groupCode: string }> // для refresh-code
  | ActionResult<{ maxMembers: number }> // для update-max-members
  | ActionResult<void>;                 // для suspend, resume, rotate, delete