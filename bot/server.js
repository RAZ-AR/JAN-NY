const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID || '-3141977295';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-app-url.vercel.app';

// Проверка токена
if (!TOKEN || TOKEN === 'your_bot_token_here') {
  console.error('❌ ОШИБКА: BOT_TOKEN не настроен!');
  console.error('📖 Инструкция: читайте SETUP_BOT_TOKEN.md');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

// Логирование ошибок бота
bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error.message);
  if (error.message.includes('401')) {
    console.error('💡 Проверьте BOT_TOKEN в файле .env');
  }
});

bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error);
});

// Команда /start - показать Mini App
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Гость';
  const lastName = msg.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  console.log(`👤 /start от: ${fullName} (ID: ${chatId})`);

  const welcomeMessage = `🎄 Привет, ${firstName}! С наступающим Новым Годом! 🎊

🍽️ Закажите новогодние сеты от ресторана кавказской кухни ĐAN (JAN)

✨ Доставка 31 декабря
🎁 Три варианта сетов на выбор
💰 Специальные новогодние цены

Нажмите кнопку ниже, чтобы сделать заказ! 👇`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🎁 Сделать заказ',
          web_app: { url: WEBAPP_URL }
        }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard })
    .then(() => console.log('✅ Приветствие отправлено'))
    .catch(err => console.error('❌ Ошибка отправки приветствия:', err.message));
});

// Логируем ВСЕ сообщения для отладки
bot.on('message', (msg) => {
  console.log('\n🔍 НОВОЕ СООБЩЕНИЕ:');
  console.log('Тип:', msg.chat.type);
  console.log('От:', msg.from?.first_name, msg.from?.username);
  console.log('Текст:', msg.text);
  console.log('Есть web_app_data?', !!msg.web_app_data);
  if (msg.web_app_data) {
    console.log('📦 WEB_APP_DATA:', msg.web_app_data.data);
  }
  console.log('---\n');
});

// Обработка данных из WebApp
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;

  console.log('\n✅ СОБЫТИЕ WEB_APP_DATA СРАБОТАЛО!');
  console.log('📦 Получены данные из WebApp');
  console.log('От:', msg.from.first_name, msg.from.username);

  try {
    const data = JSON.parse(msg.web_app_data.data);
    console.log('📋 Данные заказа:', JSON.stringify(data, null, 2));

    // Генерируем номер заказа
    const orderNumber = `NY${Date.now().toString().slice(-6)}`;
    console.log('🔢 Номер заказа:', orderNumber);

    // Форматируем сообщение для клиента
    const clientMessage = formatClientMessage(data, orderNumber, msg.from);

    // Форматируем сообщение для администраторов
    const adminMessage = formatAdminMessage(data, orderNumber, msg.from);

    // Отправляем клиенту
    console.log('📤 Отправка клиенту...');
    await bot.sendMessage(chatId, clientMessage, { parse_mode: 'HTML' });
    console.log('✅ Сообщение клиенту отправлено');

    // Отправляем в группу администраторов
    console.log('📤 Отправка в группу', ADMIN_GROUP_ID);
    await bot.sendMessage(ADMIN_GROUP_ID, adminMessage, { parse_mode: 'HTML' });
    console.log('✅ Сообщение в группу отправлено');

    console.log(`🎉 Заказ ${orderNumber} успешно обработан!`);
  } catch (error) {
    console.error('❌ Ошибка обработки заказа:', error);
    console.error('Stack:', error.stack);
    bot.sendMessage(chatId, '❌ Произошла ошибка. Пожалуйста, попробуйте снова.')
      .catch(e => console.error('Не удалось отправить сообщение об ошибке:', e));
  }
});

// Форматирование сообщения для клиента
function formatClientMessage(data, orderNumber, user) {
  const sets = data.selectedSets.map(s =>
    `  • ${s.name} (${s.quantity} шт.) - ${s.price * s.quantity} дин.`
  ).join('\n');

  return `✅ <b>Заказ принят!</b>

📋 <b>Номер заказа:</b> ${orderNumber}

👤 <b>Контакты:</b>
${data.userInfo.name}
${data.userInfo.phone}

🍽️ <b>Заказ:</b>
${sets}

💰 <b>Итого:</b> ${data.selectedSets.reduce((sum, s) => sum + s.price * s.quantity, 0)} дин.

🚚 <b>Доставка:</b> 31 декабря, ${data.deliverySlot}

📍 <b>Адрес:</b>
${data.address.street}, ${data.address.building}
${data.address.apartment ? `кв. ${data.address.apartment}` : ''}
${data.address.entrance ? `подъезд ${data.address.entrance}` : ''}
${data.address.floor ? `этаж ${data.address.floor}` : ''}
${data.address.notes ? `\n📝 ${data.address.notes}` : ''}

💳 <b>Оплата:</b> ${data.payment.method}
${data.payment.changeFrom ? `Сдача с ${data.payment.changeFrom} дин.` : ''}

${data.promoCode ? `🎁 <b>Промокод:</b> ${data.promoCode}` : ''}
${data.wishes ? `💬 <b>Пожелания:</b> ${data.wishes}` : ''}

📞 Мы свяжемся с вами в ближайшее время для подтверждения!

🎄 С наступающим Новым Годом! 🎊`;
}

// Форматирование сообщения для администраторов
function formatAdminMessage(data, orderNumber, user) {
  const sets = data.selectedSets.map(s =>
    `  • ${s.name} (${s.quantity} шт.) - ${s.price * s.quantity} дин.`
  ).join('\n');

  const totalPrice = data.selectedSets.reduce((sum, s) => sum + s.price * s.quantity, 0);

  return `🔔 <b>НОВЫЙ ЗАКАЗ #${orderNumber}</b>

👤 <b>Клиент:</b>
  Telegram: @${user.username || 'нет username'}
  ID: ${user.id}
  Имя: ${data.userInfo.name}
  Телефон: ${data.userInfo.phone}

🍽️ <b>Заказ:</b>
${sets}

💰 <b>Сумма:</b> ${totalPrice} дин.

🚚 <b>Доставка:</b>
  Дата: 31 декабря
  Время: ${data.deliverySlot}

📍 <b>Адрес доставки:</b>
  ${data.address.street}, ${data.address.building}
  ${data.address.apartment ? `кв. ${data.address.apartment}` : ''}
  ${data.address.entrance ? `подъезд ${data.address.entrance}` : ''}
  ${data.address.floor ? `этаж ${data.address.floor}` : ''}
  ${data.address.notes ? `\n  📝 Примечание: ${data.address.notes}` : ''}

💳 <b>Способ оплаты:</b> ${data.payment.method}
${data.payment.changeFrom ? `  Сдача с ${data.payment.changeFrom} дин.` : ''}

${data.promoCode ? `🎁 <b>Промокод:</b> ${data.promoCode}` : ''}
${data.wishes ? `💬 <b>Пожелания от клиента:</b>\n  ${data.wishes}` : ''}

⏰ <b>Время заказа:</b> ${new Date().toLocaleString('ru-RU')}`;
}

// Endpoint для приема заказов (альтернативный способ)
app.post('/api/order', async (req, res) => {
  try {
    const { orderData, userId } = req.body;
    const orderNumber = `NY${Date.now().toString().slice(-6)}`;

    // Получаем информацию о пользователе
    const userInfo = await bot.getChat(userId);

    // Отправляем сообщения
    const clientMessage = formatClientMessage(orderData, orderNumber, userInfo);
    const adminMessage = formatAdminMessage(orderData, orderNumber, userInfo);

    await bot.sendMessage(userId, clientMessage, { parse_mode: 'HTML' });
    await bot.sendMessage(ADMIN_GROUP_ID, adminMessage, { parse_mode: 'HTML' });

    res.json({ success: true, orderNumber });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Команда /groupid - показать ID текущего чата
bot.onText(/\/groupid/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const chatTitle = msg.chat.title || 'N/A';

  const message = `🔍 <b>Информация о чате:</b>

<b>ID чата:</b> <code>${chatId}</code>
<b>Тип:</b> ${chatType}
<b>Название:</b> ${chatTitle}

💡 Используйте этот ID в .env файле`;

  bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const helpMessage = `📱 <b>Новогодние сеты - Помощь</b>

<b>Доступные команды:</b>
/start - Начать заказ
/help - Показать это сообщение
/groupid - Показать ID чата (для админов)

<b>Как заказать:</b>
1️⃣ Нажмите /start
2️⃣ Откройте форму заказа
3️⃣ Выберите сеты
4️⃣ Укажите адрес и время доставки
5️⃣ Подтвердите заказ

📞 Поддержка: @your_support_username`;

  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🤖 Telegram Bot запущен успешно!');
  console.log('='.repeat(50));
  console.log(`📱 WebApp URL: ${WEBAPP_URL}`);
  console.log(`🌐 API сервер: http://localhost:${PORT}`);
  console.log(`📨 Группа админов: ${ADMIN_GROUP_ID}`);
  console.log('='.repeat(50));
  console.log('✅ Бот готов принимать заказы!');
  console.log('📖 Откройте @Jan_ny2026_bot и отправьте /start');
  console.log('='.repeat(50) + '\n');
});
