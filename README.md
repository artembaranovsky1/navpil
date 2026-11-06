<div align="center">

<img src="frontend/public/navpil-logo.png" alt="navpil" width="220" />

### Спільні витрати в подорожі — без таблиць і сварок

Записуйте, хто що оплатив, а navpil порахує, хто кому скільки винен,
і запропонує **мінімальну кількість переказів**, щоб усі розрахувалися.

[![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev)
[![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)

**[🌐 Веб-застосунок](https://YOUR-APP.vercel.app)** ·
**[⚙️ API](https://api-node-navpil.onrender.com)** ·
**[📖 Swagger-документація](https://api-node-navpil.onrender.com/api-docs)**

</div>

> [!NOTE]
> API розгорнуто на безкоштовному тарифі Render: після 15 хвилин без запитів сервер «засинає»,
> тож перше відкриття може тривати до хвилини. Далі все працює швидко.

---

## Зміст

- [Можливості](#можливості)
- [Скріншоти](#скріншоти)
- [Технології](#технології)
- [Структура репозиторію](#структура-репозиторію)
- [Запуск локально](#запуск-локально)
- [API](#api)
- [Як рахується розрахунок](#як-рахується-розрахунок)
- [Деплой](#деплой)

## Можливості

- **Подорожі.** Створення з назвою, описом і датами; автоматичний статус — *триває*, *скоро* чи *завершена*.
- **Учасники.** Запрошення друзів за кодом, ролі власника й учасника, видалення учасників.
- **Витрати.** Сума, категорія, дата, хто платив і між ким ділити. Редагування й видалення.
- **Аналітика.** Загальна сума подорожі, розподіл за категоріями, витрати по днях, «у середньому на день».
- **Розрахунок.** Баланс кожного учасника й мінімальний набір переказів; оплачені перекази позначаються одним натиском.
- **Підсумки.** На головній — скільки витрачено за всі подорожі й ваш загальний баланс.
- **Авторизація.** Реєстрація та вхід за JWT; сесія автоматично завершується, коли токен спливає.
- **Два клієнти.** Веб-версія для браузера й мобільний застосунок для iOS та Android на одному API.

## Скріншоти

### Веб

**Мої подорожі.** Поточна поїздка, майбутні й минулі, а зверху — загальний баланс і скільки витрачено за всі подорожі.

![Мої подорожі](docs/screenshots/web-trips.png)

**Витрати й аналітика.** Усі витрати подорожі з пошуком і фільтром «мої», розподіл за категоріями та хто скільки заплатив.

![Витрати подорожі](docs/screenshots/web-trip.png)

**Розрахунок.** Баланс кожного учасника й мінімальний набір переказів — 3 замість 12. Оплачені перекази позначаються одним натиском.

![Розрахунок](docs/screenshots/web-settle.png)

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/web-members.png" alt="Учасники" /><br /><sub>Учасники, код запрошення й налаштування подорожі</sub></td>
    <td align="center"><img src="docs/screenshots/web-new-trip.png" alt="Нова подорож" /><br /><sub>Створення подорожі</sub></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><img src="docs/screenshots/web-login.png" alt="Вхід" width="60%" /><br /><sub>Вхід</sub></td>
  </tr>
</table>

<!-- TODO: скріншоти мобільного застосунку (docs/screenshots/mobile-*.png) -->
<!--
### Мобільний застосунок

<p align="center">
  <img src="docs/screenshots/mobile-trips.png" alt="Подорожі" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-trip.png" alt="Подорож" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-add-expense.png" alt="Нова витрата" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-settle.png" alt="Розрахунок" width="200" />
</p>
-->

## Технології

| Частина | Стек |
|---|---|
| **Веб** | React 19, TypeScript, Vite 8, React Router, TanStack Query 5, SCSS (BEM), шрифт Geologica |
| **Мобільний** | Expo SDK 57, React Native 0.86, Expo Router, TanStack Query 5, Expo Secure Store, React Native SVG, Reanimated |
| **Бекенд** | Node.js, Express 5, TypeScript, Zod 4 (валідація), JWT + bcrypt (авторизація) |
| **База даних** | PostgreSQL на Neon, Prisma 7 ORM з міграціями |
| **Документація API** | OpenAPI, згенерований зі схем Zod (`zod-to-openapi`), Swagger UI |
| **Тести** | Vitest |
| **Деплой** | Vercel (веб), Render (API), Neon (база) |

### Що цікавого всередині

- **Гроші — в копійках.** Усі розрахунки йдуть у цілих копійках, тож копійки не губляться на округленні: 100 ₴ на трьох — це 33,34 + 33,33 + 33,33.
- **Кеш запитів.** TanStack Query кешує дані між сторінками, а після змін оновлює лише те, що змінилось. Усі ключі кешу зібрані в одному файлі.
- **Шари на бекенді.** Маршрути → контролери → сервіси; помилки валідації повертаються з деталями по полях (`422`), а доступ до чужих подорожей закритий (`403`).
- **Документація, що не відстає.** Swagger будується з тих самих схем Zod, якими перевіряються запити, тож опис API завжди збігається з реальною поведінкою.

## Структура репозиторію

```
navpil/
├── backend/            # REST API: Express + Prisma
│   ├── prisma/         # схема бази й міграції
│   └── src/
│       ├── routes/       # маршрути
│       ├── controllers/  # обробка запитів і статуси
│       ├── services/     # бізнес-логіка й робота з базою
│       ├── validation/   # схеми Zod
│       └── docs/         # OpenAPI-опис
├── frontend/           # веб-клієнт: React + Vite
│   └── src/
│       ├── api/          # запити до API
│       ├── hooks/        # useQuery / useMutation
│       ├── pages/        # сторінки
│       ├── components/   # спільні компоненти
│       └── utils/        # розрахунок, форматування, валідація
└── mobile/             # мобільний клієнт: Expo + React Native
    └── src/
        ├── app/          # екрани (файлова маршрутизація Expo Router)
        ├── components/
        ├── hooks/
        └── api/
```

## Запуск локально

**Потрібно:** Node.js 20.19 або новіший і база PostgreSQL (наприклад, безкоштовна на [Neon](https://neon.tech)).

### 1. Бекенд

```bash
cd backend
npm install
```

Створіть `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET_KEY="будь-який-довгий-випадковий-рядок"
```

```bash
npm run db:migrate   # створити таблиці
npm run dev          # http://localhost:3000, Swagger — /api-docs
```

### 2. Веб

```bash
cd frontend
npm install
echo 'VITE_API_URL="http://localhost:3000"' > .env
npm run dev          # http://localhost:5173
```

> Бекенд і веб разом можна запустити з кореня: `npm run dev`.

### 3. Мобільний застосунок

```bash
cd mobile
npm install
echo 'EXPO_PUBLIC_API_URL=https://api-node-navpil.onrender.com' > .env
npx expo start
```

Відскануйте QR-код застосунком **Expo Go** на телефоні.

### Тести

```bash
npm test             # з кореня, запускає Vitest для бекенду
```

## API

Повний інтерактивний опис — у **[Swagger](https://api-node-navpil.onrender.com/api-docs)**. Усі маршрути, крім `/auth`, потребують заголовка `Authorization: Bearer <token>`.

| Метод | Маршрут | Опис |
|---|---|---|
| `POST` | `/auth/register` | Реєстрація |
| `POST` | `/auth/login` | Вхід, повертає JWT |
| `GET` | `/users/me` | Поточний користувач |
| `GET` | `/rooms` | Мої подорожі: `active`, `upcoming`, `past` |
| `GET` | `/rooms/summary` | Підсумки й баланс за всіма подорожами |
| `POST` | `/rooms` | Створити подорож |
| `POST` | `/rooms/join` | Приєднатися за кодом запрошення |
| `GET` · `PATCH` · `DELETE` | `/rooms/:roomId` | Подорож: отримати, змінити, видалити |
| `DELETE` | `/rooms/:roomId/members/:userId` | Видалити учасника |
| `GET` · `POST` | `/rooms/:roomId/items` | Витрати подорожі |
| `GET` · `PATCH` · `DELETE` | `/rooms/:roomId/items/:itemId` | Одна витрата |
| `GET` · `POST` | `/rooms/:roomId/payments` | Перекази між учасниками |

## Як рахується розрахунок

1. Для кожного учасника рахується, **скільки він заплатив** і **яка його частка** у витратах, де він бере участь.
2. Баланс = заплатив − частка, з урахуванням уже зроблених переказів. Плюс — учасникові мають повернути, мінус — він винен.
3. Боржники й кредитори сортуються за сумою, і найбільший борг закривається найбільшим кредитом, поки баланси не обнуляться.

Так замість переказів «кожен кожному» виходить мінімум: для чотирьох людей — щонайбільше три перекази, а не до дванадцяти.

## Деплой

| Що | Де | Налаштування |
|---|---|---|
| API | [Render](https://render.com) | Root: `backend`, build: `npm install && npm run build && npm run db:deploy`, start: `npm start` |
| Веб | [Vercel](https://vercel.com) | Root: `frontend`, змінна `VITE_API_URL`; `vercel.json` перенаправляє всі шляхи на `index.html` |
| База | [Neon](https://neon.tech) | PostgreSQL, рядок підключення — у `DATABASE_URL` на Render |

---

<div align="center">

Зроблено **Артемом Барановським** як лабораторні роботи
[Lab 21 — REST API з авторизацією](https://github.com/rmalkevy/Programming-Practice-Projects/blob/main/labs/lab-21-rest-api-auth.md)
і Lab 30 — кросплатформений мобільний застосунок.

</div>
