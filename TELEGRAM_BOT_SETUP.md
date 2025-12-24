# Настройка Telegram Бота

Инструкция по настройке Telegram бота для приема заказов новогодних сетов.

## Шаг 1: Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Введите имя бота (например, "Новогодние Сеты")
4. Введите username бота (например, `ny_sets_2024_bot`)
5. Сохраните токен бота (будет вида `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Настройка Web App

1. Отправьте команду `/newapp` в BotFather
2. Выберите созданного бота
3. Введите название приложения (например, "Заказ сетов")
4. Введите краткое описание
5. Загрузите фото (квадратное, минимум 640x640px)
6. Отправьте демо GIF (опционально)
7. Введите URL вашего деплоя (например, `https://your-domain.com`)

## Шаг 3: Создание обработчика заказов (Node.js)

Создайте файл `bot.js`:

```javascript
const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// ID чата для получения заказов (ваш Telegram ID)
const ADMIN_CHAT_ID = 'YOUR_TELEGRAM_ID';

// Обработка данных от Web App
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);

  // Форматирование сообщения о заказе
  const orderMessage = formatOrderMessage(data);

  // Отправка заказа админу
  await bot.sendMessage(ADMIN_CHAT_ID, orderMessage, {
    parse_mode: 'HTML'
  });

  // Подтверждение клиенту
  await bot.sendMessage(chatId,
    '✅ Спасибо за заказ! Мы свяжемся с вами в ближайшее время.'
  );
});

function formatOrderMessage(data) {
  const { userInfo, selectedSets, deliverySlot, address, payment, promoCode, wishes } = data;

  const setNames = {
    1: 'СЕТ НА 2Х (6000 дин)',
    2: 'СЕТ НА 4Х (11200 дин)',
    3: 'СЕТ НА 8Х (22000 дин)'
  };

  const slotTimes = {
    1: '18:00 - 19:00',
    2: '19:00 - 20:00',
    3: '20:00 - 21:00',
    4: '21:00 - 22:00'
  };

  let message = `<b>🎄 НОВЫЙ ЗАКАЗ</b>\n\n`;
  message += `<b>👤 Клиент:</b>\n`;
  message += `Имя: ${userInfo.name}\n`;
  message += `Телефон: ${userInfo.phone}\n\n`;

  message += `<b>📦 Заказ:</b>\n`;
  Object.entries(selectedSets).forEach(([setId, quantity]) => {
    if (quantity > 0) {
      message += `• ${setNames[setId]} × ${quantity}\n`;
    }
  });
  message += `\n`;

  message += `<b>🚚 Доставка:</b>\n`;
  message += `Дата: 31 декабря\n`;
  message += `Время: ${slotTimes[deliverySlot]}\n`;
  message += `Адрес: ул. ${address.street}, д. ${address.house}`;
  if (address.apartment) message += `, кв. ${address.apartment}`;
  message += `\n`;
  if (address.note) message += `Комментарий: ${address.note}\n`;
  message += `\n`;

  message += `<b>💳 Оплата:</b>\n`;
  message += `Способ: ${payment.method === 'cash' ? 'Наличные' : 'Безналичный'}\n`;
  if (payment.changeFrom) message += `Сдача с: ${payment.changeFrom} дин\n`;
  message += `\n`;

  if (promoCode) {
    message += `<b>🎟 Промокод:</b> ${promoCode}\n\n`;
  }

  if (wishes) {
    message += `<b>💭 Пожелания:</b>\n${wishes}\n`;
  }

  return message;
}

console.log('Бот запущен...');
```

## Шаг 4: Установка зависимостей

```bash
npm install node-telegram-bot-api
```

## Шаг 5: Запуск бота

```bash
node bot.js
```

## Шаг 6: Получение вашего Telegram ID

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Нажмите Start
3. Скопируйте ваш ID
4. Вставьте в `ADMIN_CHAT_ID` в коде бота

## Альтернативный вариант: Google Apps Script

Если у вас нет сервера, можно использовать Google Apps Script для сохранения заказов в Google Sheets:

1. Создайте новую Google Таблицу
2. Откройте Tools → Script editor
3. Вставьте код для обработки webhook
4. Деплойте как Web App
5. Настройте webhook в боте через `setWebhook`

## Дополнительные настройки бота

### Установка меню

```javascript
bot.setMyCommands([
  { command: 'start', description: 'Начать заказ' },
  { command: 'help', description: 'Помощь' }
]);
```

### Добавление кнопки для запуска Web App

```javascript
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{
          text: '🎄 Заказать новогодние сеты',
          web_app: { url: 'https://your-domain.com' }
        }]
      ],
      resize_keyboard: true
    }
  });
});
```

## Тестирование

1. Откройте бота в Telegram
2. Нажмите на кнопку с Web App
3. Заполните форму заказа
4. Проверьте, что заказ пришел в чат админа

## Деплой бота

### На VPS/сервере

```bash
# Установка PM2
npm install -g pm2

# Запуск бота
pm2 start bot.js --name "ny-sets-bot"

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

### На Heroku

1. Создайте `Procfile`:
```
worker: node bot.js
```

2. Деплой:
```bash
git init
git add .
git commit -m "Initial commit"
heroku create
git push heroku main
heroku ps:scale worker=1
```

## Безопасность

1. Не храните токен в коде - используйте переменные окружения
2. Валидируйте данные от Web App
3. Используйте HTTPS для деплоя
4. Включите аутентификацию пользователей Telegram

## Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
