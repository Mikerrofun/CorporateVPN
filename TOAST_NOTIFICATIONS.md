---

**Дата:** 20.07.2026  
**Теги:** #features #toast-notifications #ui-feedback

---

## 1. Зачем

После действий над группой (suspend, resume, rotate, delete) админ не видел результата операции — успешно или с ошибкой. При ошибках нет обратной связи, непонятно что пошло не так. Отсутствует визуальное подтверждение успешного выполнения. Текущий `useGroupActions` не возвращал результат — UI не мог отреагировать на итог операции.

## 2. Где/что уже было

Переиспользованы существующие паттерны и инфраструктура:

**usePendingAction** — уже управлял pending-состоянием, нужно было только добавить возврат результата:

```ts
// 5shared/lib/hooks/usePendingAction.ts
// БЫЛО: Promise<void>
// СТАЛО: Promise<R | undefined>
async function execute<R>(key: T, action: () => Promise<R>): Promise<R | undefined> {
  setPendingKey(key);
  try {
    const result = await action();
    return result;
  } finally {
    setPendingKey(null);
  }
}
```

**groupAction** — уже возвращал `GroupActionResult` с полем `ok`, просто не использовался в UI.

**getErrorMessage** — уже существовал для маппинга `ErrorCode` → текст ошибки.

**framer-motion** — уже использовался в проекте для анимаций.

Задача была не писать новую инфраструктуру, а добавить UI-слой поверх существующей бизнес-логики.

## 3. Реализация

### Типы

```ts
// 5shared/ui/Toast/Toast.types.ts
export type ToastVariant = "success" | "error";

export type ToastType = {
  id: string;
  message: string;
  variant: ToastVariant;
};

export type ToastContextValue = {
  toasts: ToastType[];
  showToast: (message: string, variant: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  removeToast: (id: string) => void;
};
```

### Context и Provider

```tsx
// 5shared/ui/Toast/ToastContext.tsx
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
```

### Hook для доступа

```ts
// 5shared/ui/Toast/useToast.ts
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
```

### Обновление useGroupActions

```ts
// 3features/group/model/useGroupActions.ts
// Теперь возвращает результат наружу
async function runAction(action: GroupActionType): Promise<GroupActionResult | undefined> {
  return await execute(action, async () => {
    return await groupAction(groupId, { action });
  });
}
```

Остальная логика `groupAction` и `execute` не изменилась — они уже возвращали результат, просто он терялся.

## 4. UI

### Toast компонент

```tsx
// 5shared/ui/Toast/Toast.tsx
export function Toast({ id, message, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 2000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const isSuccess = variant === "success";
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;
  const colorClasses = isSuccess
    ? "border-green-500/20 bg-green-500/10 text-green-400"
    : "border-bad/20 bg-bad/10 text-bad";

  return (
    <motion.button
      onClick={() => onClose(id)}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`flex items-center gap-2.5 rounded-2xl border ${colorClasses} px-4 py-3`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{message}</span>
    </motion.button>
  );
}
```

### ToastContainer

```tsx
// 5shared/ui/Toast/ToastContainer.tsx
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed inset-x-0 bottom-8 z-50 flex flex-col items-center gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### Интеграция в GroupActions

```tsx
// 3features/group/ui/GroupActions/GroupActions.tsx
export function GroupActions({ groupId, status }: GroupActionsProps) {
  const { isPending, runAction } = useGroupActions(groupId);
  const { showSuccess, showError } = useToast();

  async function run(action: "suspend" | "resume" | "rotate" | "delete") {
    const result = await runAction(action);
    
    if (!result?.ok) {
      showError(getErrorMessage(result?.errorCode));
      setMenuOpen(false);
      return;
    }
    
    showSuccess("Успешно");
    setMenuOpen(false);
  }

  // ... rest
}
```

### Подключение в layout

```tsx
// app/admin/(panel)/layout.tsx
export default async function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <header>...</header>
        <main>{children}</main>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}
```

## 5. Поток данных

```
Клик на "Приостановить" → GroupActions.run("suspend")
  ↓
useGroupActions.runAction("suspend")
  ↓
usePendingAction.execute(action, () => groupAction(...))
  ↓
groupAction API → server action → Prisma + Marzban
  ↓
возврат GroupActionResult { ok: true/false, errorCode?: ... }
  ↓
GroupActions проверяет result?.ok
  ↓
  ├─ ok=false → showError(getErrorMessage(errorCode))
  └─ ok=true → showSuccess("Успешно")
  ↓
ToastProvider.showSuccess/showError → добавляет toast в массив
  ↓
ToastContainer рендерит toast с анимацией
  ↓
через 2 сек или по клику → removeToast(id)
  ↓
AnimatePresence запускает exit-анимацию → toast исчезает
```

## 6. Почему так, а не иначе

1. **Context + Provider вместо singleton хука** — глобальный стейт нужен чтобы `ToastContainer` в layout видел toast из любого компонента. Singleton через module-level state — не React-way и ломает SSR.

2. **showSuccess/showError дополнительно к showToast** — shortcuts делают код чище: `showError("Ошибка")` короче чем `showToast("Ошибка", "error")`. Аналогично `logger.error()` vs `logger.log("error", ...)`.

3. **Возврат результата из action** — UI должен принимать решение о toast на основе `result.ok`. Model слой не знает про toast, только возвращает данные. Разделение ответственности.

4. **Клик по toast закрывает его** — UX: пользователь может закрыть уведомление раньше чем через 2 сек. Весь toast кликабельный, не нужен отдельный крестик.

5. **AnimatePresence mode="popLayout" + layout prop** — плавная анимация при удалении элементов из списка. Без `layout` toast дергается при закрытии соседнего.

## Преимущества

- ✅ Визуальная обратная связь для всех действий над группой
- ✅ Понятные сообщения об ошибках через `getErrorMessage`
- ✅ Переиспользование существующей инфраструктуры (`usePendingAction`, `groupAction`)
- ✅ Разделение ответственности: Model возвращает результат, UI решает что показать
- ✅ Плавные анимации появления/исчезновения (framer-motion)
- ✅ Поддержка нескольких toast одновременно
- ✅ Автозакрытие через 2 сек + ручное закрытие по клику
- ✅ Типобезопасность на всех уровнях (TypeScript)
- ✅ Готово к переиспользованию в других features (invite, user actions)
