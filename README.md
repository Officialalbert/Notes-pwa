# Notes PWA

Прогрессивное веб-приложение (PWA) для управления заметками.
Учебный проект по дисциплине «Фронтенд и бэкенд разработка».

## Возможности

- Добавление и отображение заметок
- Сохранение данных в localStorage (переживают перезагрузку)
- Работа офлайн через Service Worker
- Установка на устройство как приложение (Web App Manifest)
- Две стратегии кэширования:
  - Cache First — для статики (HTML, JS, иконки, манифест)
  - Network First — для динамического контента (/content/*)

## Стек

- Vanilla JavaScript (ES6)
- Service Worker API
- Cache API
- Web App Manifest
- HTTPS (локально через mkcert)

## Требования

- Node.js 18+
- npm
- mkcert 

## Установка mkcert (Fedora)

```bash
sudo dnf install -y nss-tools curl
sudo dnf copr enable filippo/mkcert
sudo dnf install mkcert
