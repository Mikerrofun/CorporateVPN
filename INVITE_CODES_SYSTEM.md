# Система инвайт-кодов CorporateVPN

## Концепция

Система поддерживает два типа доступа для регистрации сотрудников:

- **Групповой код** (`GRP-XXXXXXXXX`) — многоразовый, действует пока группа не заполнится
- **Персональный код** (`INV-XXXXXXXXX`) — одноразовый, генерируется админом для конкретного человека

## Генерация кодов

### Утилита `generateCode.ts`

```typescript
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomPart = customAlphabet(ALPHABET, 9);

async function generateUniqueCode(prefix: "GRP" | "INV"): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = `${prefix}-${randomPart()}`;
    if (await isCodeUnique(prefix, code)) return code;
  }
  throw new Error(`Не удалось сгенерировать уникальный код`);
}
```

**Алгоритм:** Префикс + дефис + 9 случайных символов. Проверка уникальности через БД (5 попыток). Символы исключают похожие (I/1, O/0) для удобства набора.

## Регистрация пользователя

### Поток данных (`register/route.ts`)

```
Форма (login + password + code) → API endpoint
  ↓
1. Нормализация: code.trim().toUpperCase()
2. Определение типа по префиксу:
   ├─ GRP-* → registerWithGroupCode()
   ├─ INV-* → registerWithInviteCode()
   └─ другое → INVALID_INVITE_CODE
```

### Групповой код

```typescript
// 1. Найти группу по groupCode
const group = await prisma.group.findUnique({ where: { groupCode } });

// 2. Проверки: статус ACTIVE, свободные места
if (group._count.members >= group.maxMembers) return GROUP_FULL;

// 3. Создать User с привязкой к группе
await prisma.user.create({ data: { login, passwordHash, groupId } });
```

### Персональный код

```typescript
// 1. Найти инвайт по code
const invite = await prisma.invite.findUnique({ where: { code } });

// 2. Проверки: не использован, группа активна, есть места
if (invite.usedAt) return INVITE_ALREADY_USED;

// 3. Транзакция: User + пометка инвайта
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ ... });
  await tx.invite.update({
    where: { id: invite.id },
    data: { usedAt: new Date(), usedById: user.id },
  });
});
```

**Ключевое отличие:** При персональном коде обязательна транзакция, чтобы атомарно создать пользователя и пометить инвайт использованным.

## Создание инвайтов админом

### Server Action `createInvite.ts`

```typescript
export async function createInvite(groupId: string) {
  // 1. Проверка прав админа
  await requireAdminSession();

  // 2. Расчёт свободных мест
  const occupied = members.count + unusedInvites.count;
  if (occupied >= maxMembers) return NO_AVAILABLE_SLOTS;

  // 3. Генерация уникального кода
  const code = await generateInviteCode();
  await prisma.invite.create({ data: { code, groupId } });

  // 4. Аудит-лог + revalidatePath
  return { ok: true, code };
}
```

**UI интеграция:** Кнопка "Сгенерировать код" → `createInvite()` → копирование в буфер → отображение в collapsible-списке.

## Лимиты и защита

- **maxMembers** — жёсткий лимит на группу
- **Свободные места** = `maxMembers - (текущие User + неиспользованные Invite)`
- **Rate limiting:** 3 попытки регистрации / 15 минут (IP + login)
- **Уникальность:** Логины и коды уникальны на уровне БД

## Структура БД

```prisma
model Invite {
  code      String   @unique  // INV-XXXXXXXXX
  groupId   String
  usedAt    DateTime?         // null = свободен
  usedById  String?           // User.id после использования
}
```

Префикс кода не хранится отдельно — определяется парсингом строки кода.

## TODO: Интеграция VPN

После создания User необходимо вызвать `backend.createVpnUser()` и сохранить:
- `marzbanUsername` — идентификатор в Marzban
- `subscriptionUrl` — ссылка для подключения

При ошибке VPN — откатить транзакцию (удалить User, вернуть Invite в свободное состояние).
