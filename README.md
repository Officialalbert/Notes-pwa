#  Notes PWA

Прогрессивное веб-приложение для управления заметками.
Учебный проект по дисциплине «Фронтенд и бэкенд разработка».

##  Возможности

- Добавление и отображение заметок
- Сохранение данных в `localStorage` (переживают перезагрузку)
- Работа офлайн через Service Worker
- Установка на устройство как приложение (Web App Manifest)
- Две стратегии кэширования:
  - **Cache First** — для статики (HTML, JS, иконки, манифест)
  - **Network First** — для динамического контента (`/content/*`)

## 🛠 Стек

- Vanilla JavaScript (ES6)
- Service Worker API
- Cache API
- Web App Manifest
- HTTPS (локально через mkcert)

##  Требования

- Node.js 18+
- npm
- mkcert (для локального HTTPS)

### Установка mkcert (Fedora)

```bash
sudo dnf install -y nss-tools curl
sudo dnf copr enable filippo/mkcert
sudo dnf install mkcert
```

### Установка http-server

```bash
sudo npm install -g http-server
```

##  Генерация сертификатов

В корне проекта:

```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

Появятся файлы `localhost.pem` и `localhost-key.pem`.

##  Запуск

```bash
http-server --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```

Открой: **https://localhost:3000**

##  Структура проекта

```
notes-pwa/
├── content/
│   ├── home.html         # форма + список заметок
│   └── about.html        # страница «О приложении»
├── icons/                # иконки 16x16 ... 512x512
├── index.html            # App Shell
├── app.js                # логика + регистрация SW
├── sw.js                 # Service Worker
├── manifest.json         # Web App Manifest
├── localhost.pem
└── localhost-key.pem
```

##  Проверка работы

### Service Worker
DevTools (F12) → **Application → Service Workers**
Статус: `activated and is running`, scope `https://localhost:3000/`.

### Кэш
DevTools → **Application → Cache Storage**
Должны быть два кэша:
- `app-shell-v2` — статика
- `dynamic-content-v1` — страницы `/content/*`

### Manifest
DevTools → **Application → Manifest**
Все поля отображаются, иконки загружены, в адресной строке появляется кнопка **Install**.

### Офлайн-режим
1. DevTools → **Network** → включи **Offline**
2. Обнови страницу (F5)
3. Приложение открывается, заметки на месте, можно добавить новую

## Как это работает

### Service Worker (`sw.js`)
- При `install` кэширует все статические ресурсы в `app-shell-v2`
- При `activate` удаляет старые кэши
- При `fetch`:
  - для `/content/*` — Network First (сеть → кэш → `home.html` как fallback)
  - для остального — Cache First (кэш → сеть)

### App Shell
Каркас (`index.html` — шапка, навигация, пустой контейнер `#app-content`) загружается мгновенно из кэша. Контент подгружается динамически через `fetch()`.

### Данные
Заметки хранятся в `localStorage` под ключом `notes`. Формат:

```json
[{ "id": 1700000000, "text": "Текст заметки", "reminder": null, "createdAt": "..." }]
```

##  Почему HTTPS обязателен

Service Worker может перехватывать сетевые запросы и подменять ответы. Браузеры разрешают регистрацию SW только на защищённых origin'ах: `https://` или `localhost`. По HTTP SW не зарегистрируется.
