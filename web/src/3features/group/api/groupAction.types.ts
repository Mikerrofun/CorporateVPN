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
  | "refresh-code";

/**
 * Дискриминированный union результатов groupAction.
 * 
 * - refresh-code возвращает новый groupCode
 * - остальные действия возвращают void
 */
export type GroupActionResult =
  | ActionResult<{ groupCode: string }> // для refresh-code
  | ActionResult<void>;                 // для suspend, resume, rotate, delete
