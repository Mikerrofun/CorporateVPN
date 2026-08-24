import type { GroupAction } from "../model/schemas";
import type { ActionResult } from "../model/types";
import type { UserStatus } from "@prisma/client";
/**
 * Типы действий над группой.
 * Используется в groupAction API и useGroupActions хуке.
 * Производный от GroupAction["action"] — при добавлении нового action в схему обновится автоматически.
 */
export type GroupActionType = GroupAction["action"];

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

export type MemberSelect = {
    id: string;
    status: UserStatus;
    marzbanUsername: string | null;
  };
  
export type VpnStatus = "active" | "disabled";
  