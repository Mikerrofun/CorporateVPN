# Рефакторинг: UI Actions & Pending State Pattern

**Дата:** 17 июля 2026  
**Цель:** Устранить дублирование кода, разделить UI и бизнес-логику, унифицировать работу с async-действиями

---

## 🎯 Проблема

До рефакторинга в трёх UI-компонентах (`GroupActions`, `MembersTable`, `InviteManager`) дублировался один и тот же паттерн:

```tsx
// ❌ БЫЛО (дублирование в каждом компоненте)
const [busy, setBusy] = useState(false);
const router = useRouter();

async function handleAction() {
  setBusy(true);
  try {
    await someServerAction();
    router.refresh(); // обновить UI
  } finally {
    setBusy(false);
  }
}
```

**Недостатки:**
- 🔁 Код повторяется в каждом компоненте
- 🧩 Бизнес-логика смешана с UI
- 🐛 Легко забыть `finally` или `router.refresh()`
- 📦 InviteManager грузил данные на клиенте (отличался от MembersTable)

---

## ✅ Решение

### 1. Создали `usePendingAction` — универсальный хук

**Файл:** `web/src/5shared/lib/hooks/usePendingAction.ts`

```typescript
export function usePendingAction<T extends string | number = string>() {
  const [pendingKey, setPendingKey] = useState<T | null>(null);

  async function execute(key: T, action: () => Promise<void>) {
    setPendingKey(key);
    try {
      await action();
    } finally {
      setPendingKey(null);
    }
  }

  return { pendingKey, execute };
}
```

**Что делает:**
- Хранит **ключ** текущего pending-действия (`pendingKey`)
- Метод `execute(key, action)` запускает действие и управляет состоянием
- Автоматически сбрасывает pending после завершения (даже при ошибке)

**Как работает:**

```typescript
const { pendingKey, execute } = usePendingAction<"ban" | "delete">();

// Запускаем действие с ключом "ban"
await execute("ban", async () => {
  await userAction(userId, { action: "ban" });
});

// Проверяем состояние в UI
<button disabled={pendingKey === "ban"}>Заблокировать</button>
```

---

### 2. Вынесли бизнес-логику в feature-хуки

#### **useGroupActions** — действия над группой

**Файл:** `web/src/3features/group/model/useGroupActions.ts`

```typescript
export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType>();

  async function runAction(action: GroupActionType) {
    await execute(action, async () => {
      await groupAction(groupId, { action });
      // router.refresh() не нужен — revalidatePath из server action
    });
  }

  return { isPending, runAction };
}
```

**Компонент теперь чистый:**

```tsx
// ✅ СТАЛО
export function GroupActions({ groupId, status }) {
  const { isPending, runAction } = useGroupActions(groupId);

  return (
    <button 
      onClick={() => runAction("suspend")}
      disabled={isPending === "suspend"}
    >
      Приостановить
    </button>
  );
}
```

**Поток данных:**
1. Пользователь кликает → `runAction("suspend")`
2. `runAction` вызывает `execute("suspend", ...)`
3. `usePendingAction` устанавливает `pendingKey = "suspend"`
4. UI перерисовывается → кнопка `disabled={true}`
5. Выполняется `groupAction(groupId, { action: "suspend" })`
6. Server action вызывает `revalidatePath("/admin")` → Next.js обновляет UI
7. `usePendingAction` сбрасывает `pendingKey = null` → кнопка снова активна

---

#### **useMembersTable** — действия над участниками

**Файл:** `web/src/3features/user/model/useMembersTable.ts`

```typescript
export function useMembersTable() {
  const { pendingKey: pendingUserId, execute } = usePendingAction<string>();

  async function runAction(userId: string, action: UserActionType) {
    await execute(userId, async () => {
      await userAction(userId, { action });
    });
  }

  return { pendingUserId, runAction };
}
```

**Отличие от `useGroupActions`:**
- Ключ — это `userId` (string), а не тип действия
- Один пользователь может быть в pending, остальные кнопки активны

```tsx
// В таблице участников
{members.map(user => (
  <button 
    onClick={() => runAction(user.id, "ban")}
    disabled={pendingUserId === user.id} // ← только этот юзер заблокирован
  >
    Бан
  </button>
))}
```

**Поток данных:**
1. Клик по "Бан" для юзера `user-123`
2. `runAction("user-123", "ban")` → `execute("user-123", ...)`
3. `pendingUserId = "user-123"` → только эта кнопка `disabled`
4. Server action → `revalidatePath` → UI обновляется
5. `pendingUserId = null` → кнопка снова активна

---

#### **useInviteManager** — мутации инвайт-кодов

**Файл:** `web/src/3features/invite/model/useInviteManager.ts`

```typescript
export function useInviteManager(groupId: string) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const { pendingKey: deletingId, execute } = usePendingAction<string>();
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await createInvite(groupId);
      if (!result.ok) {
        setError(getErrorMessage(result.errorCode));
        return;
      }
      await navigator.clipboard.writeText(result.code).catch(() => null);
      router.refresh();
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(inviteId: string) {
    await execute(inviteId, async () => {
      const result = await deleteInvite(inviteId);
      if (!result.ok) {
        setError(getErrorMessage(result.errorCode));
        return;
      }
      router.refresh();
    });
  }

  return { isGenerating, deletingId, error, handleGenerate, handleDelete };
}
```

**Почему `usePendingAction` только для delete?**

```typescript
// ❓ Зачем: const { pendingKey: deletingId, execute } = usePendingAction<string>();
```

**Ответ:**
- `handleGenerate` — одна кнопка на группу → простой `useState(isGenerating)`
- `handleDelete` — много кнопок (по одной на код) → нужен `usePendingAction<string>`

```tsx
// В списке инвайт-кодов
{invites.map(invite => (
  <button 
    onClick={() => handleDelete(invite.id)}
    disabled={deletingId === invite.id} // ← только этот код pending
  >
    🗑 Удалить
  </button>
))}
```

**Отличие от других хуков:**
- `useGroupActions`: ключ = тип действия (`"suspend" | "resume"`)
- `useMembersTable`: ключ = userId
- `useInviteManager`: ключ = inviteId **+ отдельный** `isGenerating`

---

### 3. InviteManager → серверная загрузка данных

**До рефакторинга:**
```tsx
// ❌ Компонент сам грузил данные
const [invites, setInvites] = useState([]);
useEffect(() => { loadInvites() }, []);
```

**После рефакторинга:**
```tsx
// ✅ Данные приходят с сервера (как props)
export function InviteManager({ invites }: { invites: InviteInfo[] }) {
  const [isOpen, setIsOpen] = useState(false); // локальный UI-стейт
  const { deletingId, handleDelete } = useInviteManager(groupId);
  // ...
}
```

**Где грузятся данные:**

```typescript
// app/admin/(panel)/page.tsx (Server Component)
const groups = await getGroups(); // ← включает invites

<InviteManager 
  groupId={group.id}
  invites={group.invites} // ← передаём с сервера
/>
```

**Почему так лучше:**
- ✅ Нет задержки при раскрытии списка (данные уже есть)
- ✅ Единый паттерн с `MembersTable` (тоже серверные пропсы)
- ✅ Меньше состояния на клиенте (`hasLoaded`, `isLoading` удалены)

---

## 📊 Сравнение паттернов

### **usePendingAction с типами действий (useGroupActions)**

```typescript
const { pendingKey: isPending, execute } = usePendingAction<"suspend" | "resume">();

// Одновременно может быть pending только ОДНО действие
<button disabled={isPending === "suspend"}>Приостановить</button>
<button disabled={isPending === "resume"}>Возобновить</button>
```

### **usePendingAction с ID сущностей (useMembersTable, useInviteManager)**

```typescript
const { pendingKey: pendingUserId, execute } = usePendingAction<string>();

// Может быть pending КОНКРЕТНЫЙ элемент списка
{users.map(user => (
  <button disabled={pendingUserId === user.id}>Действие</button>
))}
```

### **Когда НЕ использовать usePendingAction**

```typescript
// Одна кнопка → простой useState
const [isLoading, setIsLoading] = useState(false);

<button disabled={isLoading}>Загрузить</button>
```

---

## 🎁 Преимущества

### 1. **DRY (Don't Repeat Yourself)**

**До:**
```tsx
// GroupActions.tsx
const [busy, setBusy] = useState(false);
async function run() { setBusy(true); try {} finally { setBusy(false) } }

// MembersTable.tsx  
const [busyId, setBusyId] = useState(null);
async function run() { setBusyId(id); try {} finally { setBusyId(null) } }

// InviteManager.tsx
const [deletingId, setDeletingId] = useState(null);
async function run() { setDeletingId(id); try {} finally { setDeletingId(null) } }
```

**После:**
```tsx
// Все используют один хук
const { pendingKey, execute } = usePendingAction();
```

### 2. **Separation of Concerns**

```
UI Component        Feature Hook         Server Action
────────────        ────────────         ─────────────
GroupActions   →    useGroupActions  →   groupAction
(кнопки, стили)     (логика, стейт)      (БД, API)
```

### 3. **Type Safety**

```typescript
// Компилятор проверит, что передан корректный тип
const { isPending, runAction } = useGroupActions(groupId);
runAction("invalid"); // ❌ TypeScript error
runAction("suspend"); // ✅ OK
```

### 4. **Лёгкое тестирование**

```typescript
// Можно тестировать хук отдельно от компонента
const { result } = renderHook(() => useGroupActions("group-1"));
await act(() => result.current.runAction("suspend"));
expect(result.current.isPending).toBe(null);
```

### 5. **Consistent Patterns**

Все компоненты следуют одной схеме:
1. Получают данные через props (серверные) или хук (клиентские)
2. Используют feature-хук для действий
3. Feature-хук использует `usePendingAction` для состояния
4. Server action обновляет UI через `revalidatePath`

---

## 📝 Итоги рефакторинга

### Созданные файлы (4)
- `5shared/lib/hooks/usePendingAction.ts` — универсальный хук
- `5shared/lib/hooks/index.ts` — экспорт
- `3features/group/model/useGroupActions.ts` — логика группы
- `3features/user/model/useMembersTable.ts` — логика участников

### Изменённые файлы (9)
- `GroupActions.tsx` — использует `useGroupActions`
- `MembersTable.tsx` — использует `useMembersTable`
- `InviteManager.tsx` — серверные пропсы, упрощён
- `useInviteManager.ts` — только мутации, без загрузки
- `getGroups.ts` — включает invites
- `types.ts` — добавлен `InviteInfo`
- `page.tsx` — передаёт invites
- `suspended/page.tsx` — admin redirect fix
- `useUserLogin.ts` — UX для DELETED

### Удалённый код
- ~60 строк дублированного pending-state кода
- Client-side загрузка в `InviteManager` (hasLoaded, isLoading, loadInvites)
- Лишние `router.refresh()` (используем `revalidatePath`)

---

## 🔍 Ключевые концепции

### usePendingAction — что это?

**Аналогия:** Светофор для async-действий
- 🟢 `pendingKey = null` → все действия доступны
- 🔴 `pendingKey = "delete"` → действие "delete" в процессе
- 🟢 `execute()` завершён → снова `null`

**Generic типы:**
```typescript
usePendingAction<"action1" | "action2">()  // enum-like ключи
usePendingAction<string>()                 // ID сущностей
usePendingAction<number>()                 // числовые ID
```

### Почему `router.refresh()` убран?

Server actions используют `revalidatePath("/admin")`:
```typescript
// В groupAction
await prisma.group.update({ ... });
revalidatePath("/admin"); // ← Next.js обновит кеш
return { ok: true };
```

Клиентский `router.refresh()` был избыточен — Next.js сам обновит UI после `revalidatePath`.

---

**Автор:** AI Assistant  
**Проверено:** ✅ Build successful, no errors
