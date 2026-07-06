# Auth System Architecture

## Общая концепция

Система аутентификации построена на **NextAuth.js** с JWT стратегией и разделением по ролям (admin/employee). Архитектура следует **FSD (Feature-Sliced Design)** принципам с изолированными фичами и переиспользуемыми компонентами.

---

## Поток данных

### User Login Flow
```
1. User вводит login + password
2. React Hook Form валидирует через Zod схему
3. signIn("employee-login", { redirect: false }) вызывается
4. NextAuth CredentialsProvider проверяет БД через Prisma
5. При успехе создаётся JWT токен с { id, isAdmin, groupId }
6. Session обновляется автоматически
7. Redirector (в layout) отслеживает изменение статуса
8. Редирект на /dashboard или /admin в зависимости от isAdmin
```

### Registration Flow
```
1. User вводит login + password + inviteCode
2. Zod валидация на клиенте
3. POST /api/auth/register отправляет данные
4. API проверяет:
   - Существует ли группа с таким inviteCode
   - Не превышен ли лимит участников (maxMembers)
   - Не занят ли login
5. Хеширование пароля через bcrypt (12 rounds)
6. Создание User в Prisma с привязкой к groupId
7. Автоматический логин через signIn("employee-login")
8. Redirector перенаправляет на /dashboard
```

### Admin Login Flow
```
1. Admin вводит login + password
2. signIn("admin-login", { redirect: false })
3. NextAuth проверяет .env переменные:
   - ADMIN_LOGIN === credentials.login
   - bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH)
4. При успехе создаёт JWT с { id: "admin", isAdmin: true, groupId: null }
5. Redirector перенаправляет на /admin
```

---

## NextAuth конфигурация

### Провайдеры

#### 1. Admin Login Provider
```ts
CredentialsProvider({
  id: "admin-login",
  credentials: { login, password },
  authorize(credentials) {
    // Проверка .env переменных
    if (credentials.login !== process.env.ADMIN_LOGIN) return null;
    
    const valid = await bcrypt.compare(
      credentials.password, 
      process.env.ADMIN_PASSWORD_HASH
    );
    
    if (!valid) return null;
    
    return {
      id: "admin",
      isAdmin: true,
      groupId: null,
    };
  }
})
```

**Особенности**:
- Admin не хранится в БД (только в .env)
- Один логин на весь деплой
- Используется для создания групп и управления пользователями

#### 2. Employee Login Provider
```ts
CredentialsProvider({
  id: "employee-login",
  credentials: { login, password },
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { login: credentials.login.toLowerCase() },
      include: { group: { select: { status: true } } }
    });
    
    if (!user) return null;
    if (user.status !== "ACTIVE") return null;
    if (user.group.status !== "ACTIVE") return null;
    
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) return null;
    
    return {
      id: user.id,
      name: user.login,
      isAdmin: false,
      groupId: user.groupId,
    };
  }
})
```

**Особенности**:
- Проверяет статус пользователя (ACTIVE/BANNED)
- Проверяет статус группы (ACTIVE/SUSPENDED)
- Нормализует login через toLowerCase()
- Включает groupId для доступа к подписке

### JWT Callbacks

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.uid = user.id;
      token.isAdmin = user.isAdmin;
      token.groupId = user.groupId;
    }
    return token;
  },
  
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.uid;
      session.user.isAdmin = token.isAdmin;
      session.user.groupId = token.groupId;
    }
    return session;
  }
}
```

**Зачем это нужно**:
- JWT токен хранит только `{ uid, isAdmin, groupId }` - минимум данных
- Session на клиенте получает эти же поля через callback
- Middleware может проверять роли без обращения к БД

### Middleware Protection

```ts
// /web/src/middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getToken({ req });
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.isAdmin) return NextResponse.redirect('/login');
  }
  
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session || session.isAdmin || !session.groupId) {
      return NextResponse.redirect('/login');
    }
  }
}
```

---

## Структура файлов (FSD)

### Feature Slices (изолированные домены)

```
/3features/
  ├── user-login/
  │   ├── model/
  │   │   ├── userLoginSchema.ts      # Zod схема: login + password
  │   │   ├── useUserLogin.ts          # Хук с логикой формы
  │   │   └── types.ts                 # Экспорт типов
  │   ├── ui/
  │   │   └── UserLoginForm.tsx        # Форма с Input/SubmitButton
  │   └── index.ts                     # Public API фичи
  │
  ├── user-register/
  │   ├── model/
  │   │   ├── userRegisterSchema.ts    # Zod: login + password + inviteCode
  │   │   ├── useUserRegister.ts       # Хук + API вызов
  │   │   └── types.ts
  │   ├── ui/
  │   │   └── UserRegisterForm.tsx
  │   └── index.ts
  │
  └── admin-login/
      ├── model/
      │   ├── adminLoginSchema.ts      # Zod: login + password (без email валидации)
      │   ├── useAdminLogin.ts
      │   └── types.ts
      ├── ui/
      │   └── AdminLoginForm.tsx
      └── index.ts
```

**Принципы изоляции**:
- Каждая фича не знает о других фичах
- Импорты только из `/5shared/`
- Нельзя импортировать `user-login` из `user-register`
- Public API через `index.ts` (экспортируем только форму и типы)

### Shared Layer (переиспользуемые компоненты)

```
/5shared/
  ├── ui/
  │   ├── Input.tsx              # Инпут с label + error (forwardRef)
  │   ├── SubmitButton.tsx       # Кнопка с loading состоянием
  │   ├── FormCard.tsx           # Обёртка формы с badge/title/subtitle
  │   ├── ErrorMessage.tsx       # Красный блок с ошибкой
  │   ├── AuthLink.tsx           # Ссылка "Нет аккаунта? Зарегистрироваться"
  │   └── index.ts               # Barrel export
  │
  └── session/
      ├── auth.ts                # NextAuth authOptions
      ├── guards.ts              # requireAdminSession, requireEmployeeSession
      ├── Redirector.tsx         # Headless компонент для редиректов
      └── index.ts
```

**SubmitButton** - специализированная кнопка для форм:
```ts
interface SubmitButtonProps {
  loading?: boolean;           // Блокирует кнопку + текст "Загрузка..."
  variant?: 'primary' | 'secondary';  // Стиль (btn-primary/btn-secondary CSS классы)
  disabled?: boolean;          // HTML disabled атрибут
  className?: string;          // Доп. классы (например "w-full py-3")
  ...props                     // Все остальные button атрибуты (type, onClick и т.д.)
}
```

---

## Логика хуков (детально)

### Структура хука

```ts
function useUserLogin() {
  // Состояния
  const [serverError, setServerError] = useState<string | null>(null);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  
  // React Hook Form
  const form = useForm<UserLoginFormValues>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",              // Валидация только при сабмите
    reValidateMode: "onSubmit",    // Ревалидация тоже при сабмите
  });

  // Обработчик сабмита
  async function handleSubmit(values: UserLoginFormValues) {
    setWasSubmitted(true);         // Отмечаем что была попытка
    setServerError(null);          // Сбрасываем предыдущие ошибки
    
    const res = await signIn("employee-login", {
      login: values.login,
      password: values.password,
      redirect: false,             // НЕ редиректим автоматически
    });
    
    if (res?.error) {
      setServerError("Неверный логин или пароль");
      return;
    }
    
    // Если успех - Redirector сам перенаправит
  }

  // Возвращаем только нужное
  return {
    register: form.register,                    // Для {...register("login")}
    handleSubmit: form.handleSubmit(handleSubmit), // Обёрнутый handleSubmit
    errors: form.formState.errors,              // Ошибки валидации Zod
    isSubmitting: form.formState.isSubmitting,  // Для блокировки кнопки
    serverError,                                // Ошибка с сервера
  };
}
```

### Почему не возвращаем весь `form`?

**Плохо**:
```ts
return { form, onSubmit, error, loading };
// В компоненте: form.register, form.handleSubmit(onSubmit), form.formState.errors
// Непонятно что внутри form, слишком много вложенности
```

**Хорошо**:
```ts
return { register, handleSubmit, errors, isSubmitting, serverError };
// В компоненте: register("login"), handleSubmit, errors.login?.message
// Явно видно что доступно, меньше вложенности
```

### Зачем `wasSubmitted`?

Флаг для условного показа ошибок:
```tsx
{wasSubmitted && errors.login && <ErrorMessage />}
```
Чтобы не показывать ошибки до первой попытки сабмита.

### Зачем `isSubmitting` из formState?

Для блокировки кнопки во время запроса:
```tsx
<SubmitButton loading={isSubmitting}>Войти</SubmitButton>
```
Автоматически становится `true` между `handleSubmit` вызовом и завершением async функции.

---

## Redirector (глобальный компонент)

### Зачем нужен?

**Проблема до рефакторинга**:
```ts
// В каждом хуке дублировался код:
if (!res?.error) {
  router.push('/dashboard');
  router.refresh();
}
```

**Решение**:
Один компонент в `layout.tsx` отслеживает изменение сессии и редиректит автоматически.

### Реализация

```ts
function Redirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const previousStatus = useRef<string>(status);

  useEffect(() => {
    // Проверяем изменение статуса
    if (previousStatus.current !== 'authenticated' && status === 'authenticated') {
      const isAdmin = session?.user?.isAdmin;
      
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      
      router.refresh();  // Обновляем серверные компоненты
    }
    
    previousStatus.current = status;  // Запоминаем текущий статус
  }, [status, session, router]);

  return null;  // Ничего не рендерим (headless pattern)
}
```

### Почему `useRef`?

Без `useRef` компонент будет редиректить на каждый ререндер:
```ts
// ПЛОХО (без useRef)
if (status === 'authenticated') {
  router.push('/dashboard');  // Каждый раз при ререндере!
}

// ХОРОШО (с useRef)
if (previousStatus.current !== 'authenticated' && status === 'authenticated') {
  router.push('/dashboard');  // Только один раз при изменении статуса
}
```

### Где живёт?

```tsx
// /web/src/app/layout.tsx
<Providers>
  <Redirector />  {/* Один раз на всё приложение */}
  {children}
</Providers>
```

---

## Преимущества архитектуры

### До рефакторинга

❌ **Проблемы**:
- Табы на одной странице `/login` - плохо для UX и SEO
- Код редиректов дублировался в каждом хуке (`router.push('/dashboard')`)
- Одна большая папка `/3features/auth/` со всеми формами вместе
- UI компоненты (Input, Button) дублировались в каждой форме
- Хуки возвращали весь объект `form` - непонятно что внутри
- Смешанные поля в User модели (`email`, `name`, `login`)

### После рефакторинга

✅ **Решения**:

**1. Отдельные роуты**
- `/login` - только логин пользователей
- `/register` - только регистрация
- `/admin/login` - только админ вход
- Лучше для UX (прямые ссылки), SEO (отдельные meta tags), навигации

**2. Централизованные редиректы**
- Один компонент `Redirector` в layout
- Все формы просто вызывают `signIn({ redirect: false })`
- Легко изменить логику редиректов в одном месте

**3. Изолированные фичи**
- Каждая фича в своей папке с `model` + `ui`
- Легко тестировать, изменять, удалять
- Новый разработчик сразу понимает где что лежит

**4. Переиспользуемые UI**
- `Input`, `SubmitButton`, `FormCard` в `/5shared/ui/`
- Изменения в одном месте применяются везде
- Консистентный дизайн

**5. Чистые хуки**
- Возвращают `{ register, handleSubmit, errors, isSubmitting, serverError }`
- Понятная структура состояний (`wasSubmitted`, `serverError`)
- `mode: "onSubmit"` - валидация только при сабмите

**6. Явный поток данных**
- `signIn()` → NextAuth → JWT → Session → Redirector → Route
- Легко отследить где происходит ошибка
- Нет скрытой магии

**7. Упрощённая модель User**
- Только `login` (без `email` и `name`)
- Меньше полей = меньше багов
- Единственный способ идентификации

---

## Быстрый старт для нового разработчика

### Добавить новую форму аутентификации

1. Создать фичу `/3features/my-auth/`
2. Добавить схему в `model/myAuthSchema.ts` (zod)
3. Создать хук `model/useMyAuth.ts` с `mode: "onSubmit"`
4. Создать форму `ui/MyAuthForm.tsx` с компонентами из `/5shared/ui/`
5. Форма автоматически получит редирект через `Redirector`

### Изменить логику редиректа

Править только `/5shared/session/Redirector.tsx`:
```ts
if (isAdmin) {
  router.push('/new-admin-path');
} else {
  router.push('/new-user-path');
}
```

### Добавить новое поле в JWT

1. Добавить в `authorize()` провайдера
2. Добавить в `jwt()` callback
3. Добавить в `session()` callback
4. Обновить TypeScript типы в `next-auth.d.ts`

---

## Технологии

- **NextAuth.js** - аутентификация с JWT стратегией
- **Prisma** - ORM для работы с PostgreSQL
- **React Hook Form** - управление формами
- **Zod** - валидация схем на клиенте и сервере
- **bcryptjs** - хеширование паролей
- **FSD** - архитектурная методология
