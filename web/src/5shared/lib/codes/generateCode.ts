import { customAlphabet } from "nanoid";

import { prisma } from "@/5shared/api/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomPart = customAlphabet(ALPHABET, 9);

const MAX_ATTEMPTS = 5;

type CodePrefix = "GRP" | "INV";

async function isCodeUnique(prefix: CodePrefix, code: string): Promise<boolean> {
  switch (prefix) {
    case "GRP":
      return !(await prisma.group.findUnique({ where: { groupCode: code } }));
    case "INV":
      return !(await prisma.invite.findUnique({ where: { code } }));
  }
}

async function generateUniqueCode(prefix: CodePrefix): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = `${prefix}-${randomPart()}`;
    if (await isCodeUnique(prefix, code)) return code;
  }
  throw new Error(`Не удалось сгенерировать уникальный код (${prefix})`);
}

export function generateGroupCode(): Promise<string> {
  return generateUniqueCode("GRP");
}

export function generateInviteCode(): Promise<string> {
  return generateUniqueCode("INV");
}
