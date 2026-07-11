-- AlterTable: индивидуальные VPN-поля сотрудника
ALTER TABLE "users" ADD COLUMN     "marzbanUsername" TEXT,
ADD COLUMN     "subscriptionUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_marzbanUsername_key" ON "users"("marzbanUsername");

-- Data migration: добавить префикс GRP- к существующим групповым кодам
UPDATE "groups" SET "groupCode" = 'GRP-' || "groupCode" WHERE "groupCode" NOT LIKE 'GRP-%';
