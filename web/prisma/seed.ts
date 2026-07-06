/**
 * Bootstraps the one platform ADMIN account, since there is no self-service
 * registration by design. Idempotent — running it again when an admin already
 * exists is a no-op. Run with `npm run seed` (wraps `prisma db seed`).
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { generateCompanyCode } from "../src/5shared/lib/codes";

const prisma = new PrismaClient();

function randomSecret(bytes = 18): string {
  return randomBytes(bytes).toString("base64url");
}

async function main() {
  const companyName = process.env.ADMIN_COMPANY_NAME?.trim() || "Platform Admin";
  const adminEmail = (process.env.ADMIN_EMAIL?.trim() || "admin@corporatevpn.local").toLowerCase();

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { company: true },
  });
  if (existingAdmin) {
    console.log(`Admin already exists: ${adminEmail} (company code: ${existingAdmin.company.code}). Skipping.`);
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || randomSecret();
  let companyCode = process.env.ADMIN_COMPANY_CODE?.trim().toUpperCase() || generateCompanyCode(companyName);
  for (let i = 0; i < 5; i += 1) {
    const clash = await prisma.company.findUnique({ where: { code: companyCode } });
    if (!clash) break;
    companyCode = generateCompanyCode(companyName);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const company = await prisma.company.create({
    data: { name: companyName, code: companyCode, isInternal: true },
  });
  await prisma.user.create({
    data: { email: adminEmail, passwordHash, role: "ADMIN", companyId: company.id },
  });

  const credentials = [
    "URL=/login",
    `EMAIL=${adminEmail}`,
    `PASSWORD=${adminPassword}`,
    `COMPANY_CODE=${companyCode}`,
    "",
  ].join("\n");
  const outPath = path.join(__dirname, "..", "..", "ADMIN_CREDENTIALS.txt");
  writeFileSync(outPath, credentials, "utf-8");
  console.log(`Admin bootstrapped: ${adminEmail} / company code ${companyCode}`);
  console.log(`Credentials written to ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
