[[О проекте(CorparateVPN)]]

# Групповой код: кнопка обновления (refresh-code)

Стек: Next.js (Server Actions), Prisma, React (Radix Dialog)

---

## 1. Зачем

`groupCode` (`GRP-XXXXXXXXX`) — многоразовый код регистрации, который
живёт в карточке группы и виден админу открытым текстом. Если код
утёк (скопирован в чужой чат, засветился на скрине) — единственным
способом закрыть дырку было руками полезть в БД. Нужна кнопка в UI,
которая одним кликом генерирует новый код той же группе, не трогая
уже зарегистрированных сотрудников.

## 2. Где генерируется код

Генератор уже существовал и использовался при создании группы —
`5shared/lib/codes/generateCode.ts`:

```ts
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без похожих I/1, O/0
const randomPart = customAlphabet(ALPHABET, 9);

export async function generateGroupCode(): Promise<string> {
  return generateUniqueCode("GRP"); // префикс + дефис + 9 символов + проверка уникальности в БД
}
```

Задача была не писать новый генератор, а **вызвать существующий** из
нового места — группового действия обновления кода.

## 3. Реализация: новый case в `groupAction`

`groupAction` — уже существующий Server Action с `switch` по типу
действия (`suspend` / `resume` / `rotate` / `delete`). Груповой код
обновляется тем же способом — просто ещё один `case`:

```ts
// 3features/group/api/groupAction.ts
case "refresh-code": {
  const groupCode = await generateGroupCode();
  await prisma.group.update({ where: { id: group.id }, data: { groupCode } });
  await audit("group_refresh_code");
  resultGroupCode = groupCode;
  break;
}
```

`groupActionSchema` (zod) расширена ещё одним литералом:

```ts
export const groupActionSchema = z.union([
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("rotate") }),
  z.object({ action: z.literal("delete") }),
  z.object({ action: z.literal("refresh-code") }), // ← новое
]);
```

Ничего в остальной логике `groupAction` не тронуто — `suspend`/`rotate`/`delete`
всё так же ходят в Marzban по участникам группы, а `refresh-code`
работает только с Prisma, backend не трогает.

## 4. UI: `RefreshCodeButton`

Маленькая кнопка-иконка рядом с кодом группы, обёрнутая в уже
существующий `ConfirmDialog` (тот же компонент, что у бана/удаления):

```tsx
// 3features/group/ui/RefreshCodeButton/RefreshCodeButton.tsx
export function RefreshCodeButton({ groupId }: { groupId: string }) {
  const { isPending, runAction } = useGroupActions(groupId);
  const busy = isPending === "refresh-code";

  return (
    <ConfirmDialog
      trigger={<button disabled={busy}>{/* svg-иконка refresh, spin при busy */}</button>}
      title="Обновить код группы?"
      description="Старый код перестанет работать для новых регистраций.
                    Уже зарегистрированных участников это не затронет."
      confirmLabel="Обновить"
      onConfirm={() => runAction("refresh-code")}
    />
  );
}
```

Ни `useGroupActions`, ни `ConfirmDialog`, ни `usePendingAction` — новый
код не писался, всё уже было готово после
[[REFACTORING_UI_ACTIONS|рефакторинга UI actions]]. Добавился только
один литерал в тип действия:

```ts
// 3features/group/model/useGroupActions.ts
type GroupActionType = "suspend" | "resume" | "rotate" | "delete" | "refresh-code";
```

Кнопка встроена прямо в строку с кодом на странице админки:

```tsx
// app/admin/(panel)/page.tsx
<p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
  {group._count.members} / {group.maxMembers} участников ·
  код: <span className="font-mono">{group.groupCode}</span>
  <RefreshCodeButton groupId={group.id} />
</p>
```

## 5. Поток данных

```
Клик по иконке
  ↓
ConfirmDialog открывает подтверждение
  ↓
"Обновить" → runAction("refresh-code")
  ↓
useGroupActions → usePendingAction.execute("refresh-code", ...)
  ↓ pendingKey = "refresh-code" → иконка крутится (disabled)
groupAction(groupId, { action: "refresh-code" })
  ↓
generateGroupCode() → prisma.group.update({ groupCode })
  ↓
audit log ("group_refresh_code") + revalidatePath("/admin")
  ↓
Next.js перерисовывает Server Component → новый код виден сразу
  ↓
pendingKey = null → иконка снова активна
```

## 6. Почему так, а не иначе

1. **Не отдельный action, а ветка существующего `groupAction`.**
   У `suspend`/`resume`/`rotate`/`delete` уже была единая точка входа
   с проверкой прав, аудит-логом и `revalidatePath`. Дублировать это
   в отдельном файле `refreshGroupCode.ts` — лишний код без выгоды.

2. **Confirm, а не мгновенное действие.** Обновление кода — не деструктив
   уровня «удалить группу», но обратной силы у старого кода нет: кто не
   успел зарегистрироваться по старому коду — не сможет. `ConfirmDialog`
   уже существовал именно для таких «необратимых, но не разрушительных»
   действий.

3. **Переиспользование, а не новый хук.** `useGroupActions` уже был
   заточен под «ключ действия → pending state», добавление литерала в
   union type — минимальное изменение, не ломающее остальные экшены
   (`switch` в `groupAction` — exhaustive по построению).

## Преимущества

- ✅ Ноль нового «инфраструктурного» кода — только новая ветка в уже
  существующих `schema`/`action`/`hook`
- ✅ UI-паттерн идентичен бану/ротации ключа — разработчику, который
  видел один компонент, понятны все остальные
- ✅ `revalidatePath` уже был в `groupAction` — не пришлось думать
  об обновлении UI отдельно
- ✅ Аудит обновления кода бесплатно достался от общего `audit()`
  хелпера внутри `groupAction`

---

19.07.2026

#invite-system #ui
