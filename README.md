# SAJA Booking

Одностраничный сайт концертного агентства на `Next.js + TypeScript`.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

## Где редактируются афиши

Все данные находятся в одном файле: [data/events.ts](/Users/mg/Desktop/saja/data/events.ts).

Изображения теперь разложены по папкам:

- логотипы: `/Users/mg/Desktop/saja/assets/logos`
- афиши: `/Users/mg/Desktop/saja/assets/posters`

Для каждой афиши в этом массиве можно менять:

- `title`
- `date`
- `dateLabel`
- `city`
- `venue`
- `mapUrl`
- `poster`
- `actions`
- `priorityClass`

## Как меняется приоритет

Поле `priorityClass` принимает значения `1`, `2` или `3`.

Сортировка работает так:

1. Сначала по `date` по возрастанию.
2. Внутри одинаковой даты по `priorityClass`: `1`, потом `2`, потом `3`.

## Форма и Telegram-бот

Форма уже валидирует поля и отправляет `multipart/form-data` на `/api/inquiry`.

Для подключения Telegram:

1. Создайте файл `.env.local` на основе `.env.example`.
2. Создайте бота через `@BotFather` и получите `TELEGRAM_BOT_TOKEN`.
3. Узнайте `TELEGRAM_CHAT_ID` чата, группы или канала, куда должны приходить заявки.
4. Если используете темы в группе, опционально заполните `TELEGRAM_MESSAGE_THREAD_ID`.
5. Маршрут [app/api/inquiry/route.ts](/Users/mg/Desktop/saja/app/api/inquiry/route.ts) уже отправляет текст заявки и файл афиши в Telegram, как только эти переменные будут заполнены.

## Что нужно подставить вручную

- Реальные ссылки кнопок и сами афиши в [data/events.ts](/Users/mg/Desktop/saja/data/events.ts) при добавлении новых мероприятий.
- Финальный публичный домен сайта, если будете публиковать проект.
- Данные Telegram-бота в `.env.local`.
