# Деплой приложения

Инструкции по деплою Telegram Mini App на различные платформы.

## Вариант 1: GitHub Pages (Бесплатно)

### Шаг 1: Настройка Vite для GitHub Pages

Обновите `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ny-sets-miniapp/', // замените на имя вашего репозитория
})
```

### Шаг 2: Добавление скрипта деплоя

Добавьте в `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

### Шаг 3: Деплой

```bash
npm install
npm run deploy
```

### Шаг 4: Настройка GitHub Pages

1. Перейдите в Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages / root
4. Save

URL: `https://username.github.io/ny-sets-miniapp/`

---

## Вариант 2: Vercel (Бесплатно, рекомендуется)

### Через веб-интерфейс:

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте репозиторий GitHub
4. Framework Preset: Vite
5. Deploy

### Через CLI:

```bash
npm install -g vercel
vercel login
vercel

# Для продакшена
vercel --prod
```

URL: `https://your-project.vercel.app`

---

## Вариант 3: Netlify (Бесплатно)

### Через веб-интерфейс:

1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. Нажмите "Add new site" → "Import an existing project"
3. Подключите GitHub
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

### Через CLI:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Создайте `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

URL: `https://your-project.netlify.app`

---

## Вариант 4: Cloudflare Pages (Бесплатно)

1. Зарегистрируйтесь на [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect Git → выберите репозиторий
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Save and Deploy

URL: `https://your-project.pages.dev`

---

## Вариант 5: VPS/Сервер с Nginx

### Шаг 1: Сборка проекта

```bash
npm run build
```

### Шаг 2: Загрузка на сервер

```bash
scp -r dist/* user@your-server:/var/www/ny-sets/
```

### Шаг 3: Настройка Nginx

Создайте `/etc/nginx/sites-available/ny-sets`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/ny-sets;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Шаг 4: Активация и SSL

```bash
sudo ln -s /etc/nginx/sites-available/ny-sets /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Установка SSL с Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

---

## После деплоя

### 1. Проверка работы

Откройте URL в браузере и проверьте:
- ✅ Загружается ли приложение
- ✅ Работают ли все шаги
- ✅ Корректно ли отображаются градиенты
- ✅ Работает ли форма

### 2. Настройка Telegram Web App

В BotFather:
1. `/newapp` или `/myapps`
2. Выберите бота
3. Edit → Web App URL
4. Введите ваш URL деплоя
5. Сохраните

### 3. Тестирование в Telegram

1. Откройте бота в Telegram
2. Нажмите кнопку Web App
3. Проверьте все шаги заказа
4. Убедитесь, что заказ приходит боту

---

## Оптимизация производительности

### Минимизация размера бандла

```bash
npm run build -- --mode production
```

### Анализ бандла

```bash
npm install -D rollup-plugin-visualizer

# Добавьте в vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer()
  ]
})
```

### Включение gzip на сервере

Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## Мониторинг и аналитика

### Google Analytics

Добавьте в `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Sentry для отслеживания ошибок

```bash
npm install @sentry/react

# В src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## Обновление приложения

### GitHub Pages / Vercel / Netlify

Просто пушьте изменения в репозиторий - деплой произойдет автоматически.

### VPS/Сервер

```bash
npm run build
scp -r dist/* user@your-server:/var/www/ny-sets/
```

---

## Устранение проблем

### Приложение не загружается

- Проверьте `base` в `vite.config.js`
- Проверьте CORS настройки
- Проверьте консоль браузера на ошибки

### Telegram SDK не работает

- Убедитесь, что скрипт подключен в `index.html`
- Проверьте, что приложение открыто в Telegram
- Проверьте URL в настройках бота

### Градиенты не отображаются

- Проверьте поддержку CSS в браузере
- Проверьте, что CSS файлы загружаются
- Попробуйте hard refresh (Ctrl+Shift+R)

---

## Бэкап и восстановление

### Создание бэкапа

```bash
# Код
git push origin main

# База данных (если есть)
mongodump --uri="mongodb://..." --out=/backup/

# Файлы
tar -czf ny-sets-backup.tar.gz /var/www/ny-sets/
```

### Восстановление

```bash
# Код
git clone https://github.com/username/ny-sets-miniapp.git

# База данных
mongorestore --uri="mongodb://..." /backup/

# Файлы
tar -xzf ny-sets-backup.tar.gz -C /var/www/
```

---

## Полезные команды

```bash
# Локальный предпросмотр продакшен-сборки
npm run build && npm run preview

# Проверка размера бандла
npm run build && ls -lh dist/

# Очистка кэша и пересборка
rm -rf node_modules dist && npm install && npm run build
```
