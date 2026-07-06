import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/5shared/session/guards";
import { backend, BackendError } from "@/5shared/api/backend-client";
import { generateCompanyCode } from "@/5shared/lib/codes";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
});

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректное название корпорации" }, { status: 400 });

  const name = parsed.data.name.trim();
  let code = generateCompanyCode(name);
  for (let i = 0; i < 5; i += 1) {
    const existing = await prisma.company.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCompanyCode(name);
  }

  const company = await prisma.company.create({ data: { name, code } });

  try {
    const provisioned = await backend.createVpnUser();
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { marzbanUsername: provisioned.username, subscriptionUrl: provisioned.subscription_url },
    });

    await prisma.adminAuditLog
      .create({
        data: {
          companyId: updated.id,
          adminId: session.user.id,
          action: "company_create",
          details: `company=${updated.name}`,
        },
      })
      .catch(() => null);

    return NextResponse.json({ ok: true, company: updated });
  } catch (err) {
    await prisma.company.delete({ where: { id: company.id } }).catch(() => null);
    const detail = err instanceof BackendError ? err.message : "unknown error";
    return NextResponse.json({ error: `Не удалось выпустить VPN-подписку (${detail})` }, { status: 502 });
  }
}
