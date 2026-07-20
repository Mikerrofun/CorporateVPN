# Toast Notification System

Система уведомлений для отображения результатов действий пользователя.

## Архитектура

```
Toast/
├── Toast.types.ts        # Все типы системы
├── ToastContext.tsx      # React Context + Provider
├── useToast.ts           # Hook для доступа к контексту
├── Toast.tsx             # UI компонент одного уведомления
├── ToastContainer.tsx    # Рендер списка уведомлений
└── index.ts              # Публичное API
```

## Использование

### 1. Обернуть приложение в ToastProvider

```tsx
import { ToastProvider, ToastContainer } from "@/5shared/ui";

export default function Layout({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
```

### 2. Использовать в компонентах

```tsx
import { useToast } from "@/5shared/ui";

export function MyComponent() {
  const { showSuccess, showError } = useToast();

  async function handleAction() {
    const result = await someAction();
    
    if (!result?.ok) {
      showError("Произошла ошибка");
      return;
    }
    
    showSuccess("Успешно выполнено");
  }

  return <button onClick={handleAction}>Выполнить</button>;
}
```

## API

### useToast()

Возвращает:
- `showSuccess(message)` - показать зелёный toast
- `showError(message)` - показать красный toast
- `showToast(message, variant)` - универсальный метод
- `removeToast(id)` - закрыть конкретный toast (обычно не нужен)
- `toasts` - массив активных уведомлений (обычно не нужен)

## Особенности

**1. Автоматическое закрытие**
- Toast автоматически исчезает через 2 секунды
- Таймер настраивается в `Toast.tsx` через `AUTO_HIDE_MS`

**2. Ручное закрытие**
- Клик по toast закрывает его немедленно
- Удобно для длинных сообщений, которые пользователь хочет закрыть раньше

**3. Анимация**
- Плавное появление снизу (`y: 20` → `y: 0`)
- Плавное исчезновение вверх (`y: 0` → `y: -20`)
- Использует `framer-motion` для анимации

**4. Множественные уведомления**
- Можно показать несколько toast одновременно
- Они выстраиваются вертикально с gap в 8px
- Каждый имеет уникальный `id` (crypto.randomUUID)

**5. Shortcuts vs универсальный метод**
- `showSuccess()` и `showError()` - shortcuts для удобства
- `showToast(message, variant)` - универсальный метод
- Shortcuts делают код чище: `showError("Ошибка")` вместо `showToast("Ошибка", "error")`

## Дизайн-решения

### Почему Context + Provider?
- Глобальный стейт toast доступен из любого компонента
- Не нужно прокидывать props через дерево компонентов
- Единая точка управления очередью уведомлений

### Почему не EventEmitter?
- React Context - стандартное решение для React
- Автоматическая подписка/отписка при unmount
- TypeScript-friendly API

### Почему showSuccess/showError дополнительно к showToast?
- Удобство: короче писать `showSuccess("OK")` чем `showToast("OK", "success")`
- Частые кейсы (успех/ошибка) имеют простой API
- Универсальный `showToast` остается для кастомных случаев

### Почему возвращаем результат из action?
```typescript
// ДО: ничего не возвращали
async function runAction(action: GroupActionType) {
  await execute(action, async () => {
    await groupAction(groupId, { action });
  });
}

// ПОСЛЕ: возвращаем результат
async function runAction(action: GroupActionType): Promise<GroupActionResult | undefined> {
  return await execute(action, async () => {
    return await groupAction(groupId, { action });
  });
}
```

Причины:
1. **UI может показать toast** - проверяем `result.ok` и решаем что показать
2. **UI может получить данные** - например `refresh-code` возвращает новый код
3. **Единообразие** - всегда проверяем результат одинаково: `if (!result?.ok)`

## Примеры использования

### Базовый пример
```tsx
const { showSuccess, showError } = useToast();

async function deleteItem() {
  const result = await deleteAction(id);
  
  if (!result?.ok) {
    showError(getErrorMessage(result?.errorCode));
    return;
  }
  
  showSuccess("Удалено");
}
```

### С данными из ответа
```tsx
const { showSuccess, showError } = useToast();

async function refreshCode() {
  const result = await runAction("refresh-code");
  
  if (!result?.ok) {
    showError("Не удалось обновить код");
    return;
  }
  
  // result.data содержит { groupCode: string }
  showSuccess(`Новый код: ${result.data.groupCode}`);
}
```

### Универсальный метод
```tsx
const { showToast } = useToast();

function notify(type: "success" | "error") {
  showToast(
    type === "success" ? "Операция выполнена" : "Ошибка операции",
    type
  );
}
```
