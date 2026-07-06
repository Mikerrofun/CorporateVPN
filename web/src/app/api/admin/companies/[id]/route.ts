import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/5shared/session/guards";
import { backend, BackendError } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.union([
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("rotate") }),
]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const company = await prisma.company.findFirst({ where: { id: params.id, isInternal: false } });
  if (!company) return NextResponse.json({ error: "Корпорация не найдена" }, { status: 404 });
  if (!company.marzbanUsername) {
    return NextResponse.json({ error: "VPN-подписка ещё не выпущена для этой корпорации" }, { status: 400 });
  }

  const audit = (action: string) =>
    prisma.adminAuditLog
      .create({ data: { companyId: company.id, adminId: session.user.id, action } })
      .catch(() => null);

  try {
    if (parsed.data.action === "suspend") {
      await backend.setStatus(company.marzbanUsername, "disabled");
      await prisma.company.update({ where: { id: company.id }, data: { status: "SUSPENDED" } });
      await audit("company_suspend");
      return NextResponse.json({ ok: true });
    }

    if (parsed.data.action === "resume") {
      await backend.setStatus(company.marzbanUsername, "active");
      await prisma.company.update({ where: { id: company.id }, data: { status: "ACTIVE" } });
      await audit("company_resume");
      return NextResponse.json({ ok: true });
    }

    // action === "rotate"
    const { subscription_url: subscriptionUrl } = await backend.rotateKey(company.marzbanUsername);
    await prisma.company.update({ where: { id: company.id }, data: { subscriptionUrl } });
    await audit("company_rotate_link");
    return NextResponse.json({ ok: true, subscriptionUrl });
  } catch (err) {
    const detail = err instanceof BackendError ? err.message : "unknown error";
    return NextResponse.json({ error: `Действие не выполнено (${detail})` }, { status: 502 });
  }
}
