-- AlterEnum
-- Добавление значения в Postgres enum — отдельная не-транзакционная команда.
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';
