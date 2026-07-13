-- AlterTable: VPN-поля сотрудника (копия групповых значений — общий аккаунт, без UNIQUE)
ALTER TABLE "users" ADD COLUMN     "marzbanUsername" TEXT,
ADD COLUMN     "subscriptionUrl" TEXT;

-- Data migration: добавить префикс GRP- к существующим групповым кодам
UPDATE "groups" SET "groupCode" = 'GRP-' || "groupCode" WHERE "groupCode" NOT LIKE 'GRP-%';
