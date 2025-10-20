# Booking API

REST API для бронирования мест на мероприятия.

## Возможности

- Бронирование мест на события
- Защита от дублирования (один пользователь = одно бронирование на событие)
- Защита от race conditions (pessimistic locking)
- Проверка доступности мест
- Автоматическая валидация запросов
- Swagger документация

## Технологии

- NestJS 10
- PostgreSQL 16
- TypeORM
- Docker Compose

## Быстрый старт

### 1. Установите зависимости

```bash
npm install
```

### 2. Создайте файл .env

```powershell
Copy-Item .env.example .env
```

Или создайте вручную:
```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_db
PORT=3000
```

**Примечание:** Порт `5433` используется чтобы не конфликтовать с локально установленным PostgreSQL на порту 5432.

### 3. Запустите PostgreSQL

```bash
docker-compose up -d
```

### 4. Запустите приложение

```bash
npm run start:dev
```

### 5. Добавьте тестовые события

Подождите 3-5 секунд для создания таблиц, затем:

```powershell
Get-Content seed-events.sql | docker exec -i booking-api-postgres psql -U booking_user -d booking_db
```

### 6. Готово!

Откройте в браузере:
- **Swagger документация:** http://localhost:3000/api/docs

## API Endpoints

### POST /api/bookings/reserve

Создать бронирование.

**Запрос:**
```json
{
  "event_id": 1,
  "user_id": "user123"
}
```

**Успешный ответ (201):**
```json
{
  "id": 1,
  "eventId": 1,
  "userId": "user123",
  "createdAt": "2025-10-20T15:00:00.000Z"
}
```

**Ошибки:**
- `400` - Неверные данные
- `404` - Событие не найдено
- `409` - Уже забронировано или нет мест

### GET /api/bookings

Получить все бронирования.

### GET /api/bookings/event/:eventId

Получить бронирования для конкретного события.

### GET /api/bookings/user/:userId

Получить бронирования конкретного пользователя.

### GET /api/events

Получить список всех событий.

## Примеры использования

### PowerShell

```powershell
# Создать бронирование
Invoke-RestMethod -Uri "http://localhost:3000/api/bookings/reserve" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"event_id": 1, "user_id": "user123"}'

# Получить события
Invoke-RestMethod http://localhost:3000/api/events
```

### curl

```bash
# Создать бронирование
curl -X POST http://localhost:3000/api/bookings/reserve \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1, "user_id": "user123"}'

# Получить события
curl http://localhost:3000/api/events
```

## Схема базы данных

### Таблица events

| Колонка | Тип | Описание |
|---------|-----|----------|
| id | SERIAL | Первичный ключ |
| name | VARCHAR | Название события |
| totalSeats | INT | Количество мест |

### Таблица bookings

| Колонка | Тип | Описание |
|---------|-----|----------|
| id | SERIAL | Первичный ключ |
| eventId | INT | Внешний ключ на events |
| userId | VARCHAR | ID пользователя |
| createdAt | TIMESTAMP | Дата создания |

**Ограничения:**
- `UNIQUE(eventId, userId)` - защита от дубликатов на уровне БД

## Защита от race conditions

API использует **pessimistic locking** с транзакциями:

```typescript
async createBooking(dto: CreateBookingDto) {
  return this.dataSource.transaction(async (manager) => {
    // Блокируем строку события (SELECT ... FOR UPDATE)
    const event = await manager.findOne(Event, {
      where: { id: dto.event_id },
      lock: { mode: 'pessimistic_write' },
    });
    
    // Проверки и создание бронирования
    // Все операции атомарны внутри транзакции
  });
}
```

**Как это работает:**
1. Первый пользователь захватывает lock на событие
2. Второй пользователь ждет освобождения lock
3. После commit первого, второй получает актуальные данные
4. Если мест нет - второй получает ошибку 409

## Тестирование

### Запуск тестов

```bash
npm test
```

**Результат:**
```
PASS src/modules/bookings/bookings.service.spec.ts
  ✓ should successfully create a booking
  ✓ should throw NotFoundException if event does not exist
  ✓ should throw ConflictException if user already booked
  ✓ should throw ConflictException if no seats available

Tests: 4 passed
```

## Структура проекта

```
src/
├── modules/
│   ├── events/
│   │   ├── entities/
│   │   │   └── event.entity.ts
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   └── events.module.ts
│   └── bookings/
│       ├── entities/
│       │   └── booking.entity.ts
│       ├── dto/
│       │   └── create-booking.dto.ts
│       ├── bookings.repository.ts
│       ├── bookings.service.ts
│       ├── bookings.service.spec.ts
│       ├── bookings.controller.ts
│       └── bookings.module.ts
├── app.module.ts
└── main.ts
```

## Работа с БД

### Подключение к PostgreSQL

```bash
docker exec -it booking-api-postgres psql -U booking_user -d booking_db
```

### Полезные SQL запросы

```sql
-- Все события
SELECT * FROM event;

-- Все бронирования
SELECT * FROM booking;

-- Количество бронирований по событиям
SELECT "eventId", COUNT(*) FROM booking GROUP BY "eventId";

-- Добавить событие
INSERT INTO event (name, "totalSeats") VALUES ('Конференция', 100);
```

## Команды разработки

```bash
# Запуск в dev режиме
npm run start:dev

# Компиляция
npm run build

# Production запуск
npm run start:prod

# Тесты
npm test

# Тесты с coverage
npm run test:cov
```

## Остановка

```bash
# Остановить приложение: Ctrl+C

# Остановить PostgreSQL
docker-compose down

# Остановить и удалить данные
docker-compose down -v
```

## Лицензия

MIT
