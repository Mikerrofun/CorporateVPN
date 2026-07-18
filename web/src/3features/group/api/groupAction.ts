"use server";

import { revalidatePath } from "next/cache";

import { backend, BackendError, isVpnMockMode, setVpnStatus } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import { generateGroupCode } from "@/5shared/lib/codes";
import { groupActionSchema, type GroupAction } from "../model/schemas";
import type { ActionResult } from "../model/types";

export async function groupAction(
  groupId: string,
  input: GroupAction,
): Promise<ActionResult<{ subscriptionUrl?: string; groupCode?: string }>> {

  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = groupActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errorCode: ErrorCode.VALIDATION_ERROR };

  // VPN-аккаунты индивидуальные — групповые действия применяются
  // ко всем участникам группы (кроме уже забаненных лично).
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { id: true, status: true, marzbanUsername: true } },
    },
  });
  if (!group) return { ok: false, errorCode: ErrorCode.GROUP_NOT_FOUND };

  const audit = (action: string, details?: string) =>
    prisma.adminAuditLog
      .create({
        data: {
          adminLogin: process.env.ADMIN_LOGIN ?? "admin",
          action,
          details: details ?? `group=${group.name}`,
        },
      })
      .catch(() => null);

  /** Меняет статус Marzban-аккаунтов всех участников (кроме BANNED — у них свой статус). */
  const setMembersVpnStatus = async (status: "active" | "disabled") => {
    const targets = group.members.filter((m) => m.marzbanUsername && m.status !== "BANNED");
    await Promise.all(targets.map((m) => setVpnStatus(m.marzbanUsername, status)));
  };

  try {
    let resultGroupCode: string | undefined;

    switch (parsed.data.action) {
      case "suspend": {
        await setMembersVpnStatus("disabled");
        await prisma.group.update({ where: { id: group.id }, data: { status: "SUSPENDED" } });
        await audit("group_suspend");
        break;
      }
      case "refresh-code": {
        const groupCode = await generateGroupCode();
        await prisma.group.update({ where: { id: group.id }, data: { groupCode } });
        await audit("group_refresh_code");
        resultGroupCode = groupCode;
        break;
      }

      case "resume": {
        await setMembersVpnStatus("active");
        await prisma.group.update({ where: { id: group.id }, data: { status: "ACTIVE" } });
        await audit("group_resume");
        break;
      }
      case "rotate": {
        // Ротация индивидуальная: каждому участнику — новый subscription URL.
        if (!isVpnMockMode) {
          for (const m of group.members) {
            if (!m.marzbanUsername) continue;
            const { subscription_url } = await backend.rotateKey(m.marzbanUsername);
            await prisma.user.update({
              where: { id: m.id },
              data: { subscriptionUrl: subscription_url },
            });
          }
        }
        await audit("group_rotate", `group=${group.name} members=${group.members.length}`);
        break;
      }
      case "delete": {
        // Best-effort отключение VPN всех участников, затем каскадное удаление.
        await Promise.all(
          group.members.map((m) => setVpnStatus(m.marzbanUsername, "disabled").catch(() => null)),
        );
        await prisma.group.delete({ where: { id: group.id } });
        await audit("group_delete");
        break;
      }
    }

    revalidatePath("/admin");
    return resultGroupCode ? { ok: true, data: { groupCode: resultGroupCode } } : { ok: true };
  } catch (err) {

    const detail = err instanceof BackendError ? err.message : "unknown error";
    console.error(`[groupAction] Действие не выполнено (${detail})`);
    return { ok: false, errorCode: ErrorCode.SOMETHING_WRONG };
  }
}
