// Пример бота для обработки заказов новогодних сетов
// Установка: npm install node-telegram-bot-api dotenv

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Конфигурация из переменных окружения
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || 'YOUR_TELEGRAM_ID';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com';

// Создание бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Справочники
const SET_NAMES = {
  1: 'СЕТ НА 2Х',
  2: 'СЕТ НА 4Х',
  3: 'СЕТ НА 8Х'
};

const SET_PRICES = {
  1: 6000,
  2: 11200,
  3: 22000
};

const DELIVERY_SLOTS = {
  1: '18:00 - 19:00',
  2: '19:00 - 20:00',
  3: '20:00 - 21:00',
  4: '21:00 - 22:00'
};

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎄 <b>Добро пожаловать!</b>

Закажите новогодние сеты с доставкой 31 декабря.

Доступные сеты:
• СЕТ НА 2Х - 6000 дин
• СЕТ НА 4Х - 11200 дин
• СЕТ НА 8Х - 22000 дин

Нажмите кнопку ниже для оформления заказа 👇
  `;

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [
        [{
          text: '🎄 Заказать сеты',
          web_app: { url: WEB_APP_URL }
        }]
      ],
      resize_keyboard: true
    }
  });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
<b>Помощь по заказу</b>

1. Нажмите кнопку "Заказать сеты"
2. Заполните контактные данные
3. Выберите сеты и количество
4. Укажите время доставки
5. Введите адрес
6. Выберите способ оплаты
7. Подтвердите заказ

По вопросам: @your_support
  `;

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'HTML'
  });
});

// Обработка данных от Web App
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;

  try {
    const orderData = JSON.parse(msg.web_app_data.data);
    const orderNumber = generateOrderNumber();

    // Форматирование сообщения о заказе
    const adminMessage = formatOrderForAdmin(orderData, orderNumber, msg.from);
    const clientMessage = formatOrderForClient(orderData, orderNumber);

    // Отправка заказа админу
    await bot.sendMessage(ADMIN_CHAT_ID, adminMessage, {
      parse_mode: 'HTML'
    });

    // Подтверждение клиенту
    await bot.sendMessage(chatId, clientMessage, {
      parse_mode: 'HTML'
    });

    console.log(`Заказ ${orderNumber} получен от ${userName} (${chatId})`);

  } catch (error) {
    console.error('Ошибка обработки заказа:', error);
    await bot.sendMessage(chatId,
      '❌ Произошла ошибка при обработке заказа. Пожалуйста, попробуйте снова.'
    );
  }
});

// Форматирование сообщения для админа
function formatOrderForAdmin(data, orderNumber, user) {
  const { userInfo, selectedSets, deliverySlot, address, payment, promoCode, wishes } = data;

  let message = `<b>🎄 НОВЫЙ ЗАКАЗ #${orderNumber}</b>\n\n`;

  // Информация о клиенте
  message += `<b>👤 КЛИЕНТ:</b>\n`;
  message += `Имя: ${userInfo.name}\n`;
  message += `Телефон: ${userInfo.phone}\n`;
  message += `Telegram: @${user.username || 'нет'} (ID: ${user.id})\n\n`;

  // Заказ
  message += `<b>📦 ЗАКАЗ:</b>\n`;
  let totalPrice = 0;
  Object.entries(selectedSets).forEach(([setId, quantity]) => {
    if (quantity > 0) {
      const price = SET_PRICES[setId] * quantity;
      totalPrice += price;
      message += `• ${SET_NAMES[setId]} × ${quantity} = ${price} дин\n`;
    }
  });
  message += `\n<b>ИТОГО: ${totalPrice} дин</b>\n\n`;

  // Доставка
  message += `<b>🚚 ДОСТАВКА:</b>\n`;
  message += `Дата: 31 декабря\n`;
  message += `Время: ${DELIVERY_SLOTS[deliverySlot]}\n`;
  message += `Адрес: ул. ${address.street}, д. ${address.house}`;
  if (address.apartment) message += `, кв. ${address.apartment}`;
  message += `\n`;
  if (address.note) message += `📝 ${address.note}\n`;
  message += `\n`;

  // Оплата
  message += `<b>💳 ОПЛАТА:</b>\n`;
  message += `Способ: ${payment.method === 'cash' ? '💵 Наличные' : '💳 Безналичный'}\n`;
  if (payment.changeFrom) message += `Сдача с: ${payment.changeFrom} дин\n`;
  message += `\n`;

  // Промокод
  if (promoCode) {
    message += `<b>🎟 ПРОМОКОД:</b> ${promoCode}\n\n`;
  }

  // Пожелания
  if (wishes) {
    message += `<b>💭 ПОЖЕЛАНИЯ:</b>\n${wishes}\n\n`;
  }

  message += `⏰ Время заказа: ${new Date().toLocaleString('ru-RU')}`;

  return message;
}

// Форматирование сообщения для клиента
function formatOrderForClient(data, orderNumber) {
  const { selectedSets } = data;

  let message = `<b>✅ Заказ принят!</b>\n\n`;
  message += `Номер заказа: <b>#${orderNumber}</b>\n\n`;

  message += `<b>Ваш заказ:</b>\n`;
  Object.entries(selectedSets).forEach(([setId, quantity]) => {
    if (quantity > 0) {
      message += `• ${SET_NAMES[setId]} × ${quantity}\n`;
    }
  });

  message += `\n📅 Доставка: 31 декабря\n`;
  message += `\nМы свяжемся с вами в ближайшее время для подтверждения.\n`;
  message += `\n🎄 <b>С наступающим Новым Годом!</b> 🎄`;

  return message;
}

// Генерация номера заказа
function generateOrderNumber() {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `NY${timestamp}`;
}

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Запуск бота
console.log('🤖 Бот запущен и готов принимать заказы...');
console.log(`📱 Web App URL: ${WEB_APP_URL}`);
console.log(`👤 Admin Chat ID: ${ADMIN_CHAT_ID}`);
