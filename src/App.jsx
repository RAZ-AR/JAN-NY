import { useState, useEffect } from 'react';
import UserInfoStep from './components/UserInfoStep';
import SetsSelectionStep from './components/SetsSelectionStep';
import DeliverySlotStep from './components/DeliverySlotStep';
import AddressStep from './components/AddressStep';
import PaymentStep from './components/PaymentStep';
import ConfirmationStep from './components/ConfirmationStep';
import SuccessStep from './components/SuccessStep';
import { sets, deliverySlots, paymentMethods } from './data/sets';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    userInfo: null,
    selectedSets: null,
    deliverySlot: null,
    address: null,
    payment: null
  });
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set theme colors
      tg.setHeaderColor('#1a1a1a');
      tg.setBackgroundColor('#0a0a0a');

      // Скрываем MainButton по умолчанию
      tg.MainButton.hide();

      // Получаем данные пользователя из Telegram
      const user = tg.initDataUnsafe?.user;
      if (user) {
        // Предзаполняем имя пользователя
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        if (userName && !orderData.userInfo) {
          setOrderData(prev => ({
            ...prev,
            userInfo: { name: userName, phone: '' }
          }));
        }
      }
    }
  }, []);

  // Управление MainButton в зависимости от шага
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Показываем MainButton только на шаге подтверждения (шаг 6)
      if (currentStep === 6) {
        console.log('📱 Настройка MainButton для отправки заказа');

        tg.MainButton.setText('🎁 Подтвердить заказ');
        tg.MainButton.show();
        tg.MainButton.enable();

        // Устанавливаем обработчик клика
        const handleMainButtonClick = async () => {
          console.log('🔘 MainButton нажата!');

          tg.MainButton.showProgress();
          tg.MainButton.disable();

          try {
            // Подготовка данных для отправки
            const formattedData = {
              userInfo: orderData.userInfo,
              selectedSets: Object.entries(orderData.selectedSets || {})
                .filter(([_, quantity]) => quantity > 0)
                .map(([setId, quantity]) => {
                  const set = sets.find(s => s.id === parseInt(setId));
                  return {
                    id: setId,
                    name: set?.name || '',
                    price: set?.price || 0,
                    quantity: quantity
                  };
                }),
              deliverySlot: deliverySlots.find(s => s.id === orderData.deliverySlot)?.label || '',
              address: orderData.address,
              payment: {
                method: paymentMethods.find(m => m.id === orderData.payment?.method)?.name || '',
                changeFrom: orderData.payment?.changeFrom || ''
              },
              promoCode: orderData.promoCode || '',
              wishes: orderData.wishes || ''
            };

            console.log('📤 Отправка данных через MainButton:', formattedData);

            // Получаем userId из Telegram
            const userId = tg.initDataUnsafe?.user?.id;
            console.log('👤 User ID:', userId);

            if (!userId) {
              throw new Error('User ID не найден');
            }

            // Отправляем через Telegram Bot API напрямую
            const BOT_TOKEN = '8315779033:AAHqzMaxA4TMWrYPIPxQ9aebmAFsV-lPbvc';
            const chatId = userId;

            // Генерируем номер заказа
            const orderNumber = `NY${Date.now().toString().slice(-6)}`;

            // Форматируем сообщение для клиента
            const clientMessage = formatClientMessage(formattedData, orderNumber);
            const adminMessage = formatAdminMessage(formattedData, orderNumber, tg.initDataUnsafe.user);

            console.log('📨 Отправка клиенту...');

            // Отправляем клиенту
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: clientMessage,
                parse_mode: 'HTML'
              })
            });

            console.log('✅ Сообщение клиенту отправлено');
            console.log('📨 Отправка в группу...');

            // Отправляем в группу
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: '-1003141977295',
                text: adminMessage,
                parse_mode: 'HTML'
              })
            });

            console.log('✅ Сообщение в группу отправлено');

            tg.MainButton.hideProgress();

            // Показываем экран успеха
            setOrderNumber(orderNumber);
            setCurrentStep(7);

            // Закрываем через 2 секунды
            setTimeout(() => {
              tg.close();
            }, 2000);

          } catch (error) {
            console.error('❌ Ошибка отправки:', error);
            tg.MainButton.hideProgress();
            tg.MainButton.enable();
            tg.showAlert('Ошибка отправки заказа. Попробуйте снова.');
          }
        };

        tg.MainButton.onClick(handleMainButtonClick);

        // Очистка при размонтировании
        return () => {
          tg.MainButton.offClick(handleMainButtonClick);
          tg.MainButton.hide();
        };
      } else {
        tg.MainButton.hide();
      }
    }
  }, [currentStep, orderData]);

  const handleUserInfoNext = (userInfo) => {
    setOrderData({ ...orderData, userInfo });
    setCurrentStep(2);
  };

  const handleSetsNext = (selectedSets) => {
    setOrderData({ ...orderData, selectedSets });
    setCurrentStep(3);
  };

  const handleDeliverySlotNext = (deliverySlot) => {
    setOrderData({ ...orderData, deliverySlot });
    setCurrentStep(4);
  };

  const handleAddressNext = (address) => {
    setOrderData({ ...orderData, address });
    setCurrentStep(5);
  };

  const handlePaymentNext = (payment) => {
    setOrderData({ ...orderData, payment });
    setCurrentStep(6);
  };

  const handleOrderDataUpdate = (updatedData) => {
    setOrderData(updatedData);
  };

  const handleOrderSubmit = async (finalOrderData) => {
    // Send order to Telegram Bot
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      try {
        console.log('🔄 Подготовка данных для отправки...');
        console.log('finalOrderData:', finalOrderData);

        // Преобразуем данные для бота
        const formattedData = {
          userInfo: finalOrderData.userInfo,
          selectedSets: Object.entries(finalOrderData.selectedSets || {})
            .filter(([_, quantity]) => quantity > 0)
            .map(([setId, quantity]) => {
              const set = sets.find(s => s.id === parseInt(setId));
              return {
                id: setId,
                name: set?.name || '',
                price: set?.price || 0,
                quantity: quantity
              };
            }),
          deliverySlot: deliverySlots.find(s => s.id === finalOrderData.deliverySlot)?.label || '',
          address: finalOrderData.address,
          payment: {
            method: paymentMethods.find(m => m.id === finalOrderData.payment?.method)?.name || '',
            changeFrom: finalOrderData.payment?.changeFrom || ''
          },
          promoCode: finalOrderData.promoCode || '',
          wishes: finalOrderData.wishes || ''
        };

        console.log('📤 Отправка данных в бот:', formattedData);
        console.log('📤 JSON строка:', JSON.stringify(formattedData));

        // ВАЖНО: Показываем экран успеха ПЕРЕД отправкой
        const orderNum = `NY${Date.now().toString().slice(-6)}`;
        setOrderNumber(orderNum);
        setCurrentStep(7);

        // Небольшая задержка чтобы пользователь увидел экран успеха
        setTimeout(() => {
          console.log('⏰ Отправка данных и закрытие WebApp...');

          // Отправляем данные боту через WebApp API
          tg.sendData(JSON.stringify(formattedData));

          console.log('✅ sendData вызван успешно');

          // WebApp закроется автоматически после sendData
        }, 1500)
      } catch (error) {
        console.error('❌ Ошибка отправки заказа:', error);
        console.error('Stack trace:', error.stack);
        alert('Произошла ошибка при отправке заказа. Попробуйте еще раз.');
      }
    } else {
      // Для тестирования без Telegram
      console.log('⚠️ Telegram WebApp не доступен, локальное тестирование');
      console.log('Order submitted:', finalOrderData);
      const orderNum = `NY${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);
      setCurrentStep(7);
    }
  };

  const formatClientMessage = (data, orderNumber) => {
    const setsText = data.selectedSets.map(s =>
      `  • ${s.name} (${s.quantity} шт.) - ${s.price * s.quantity} дин.`
    ).join('\n');

    const totalPrice = data.selectedSets.reduce((sum, s) => sum + s.price * s.quantity, 0);

    return `✅ <b>Заказ принят!</b>

📋 <b>Номер заказа:</b> ${orderNumber}

👤 <b>Контакты:</b>
${data.userInfo.name}
${data.userInfo.phone}

🍽️ <b>Заказ:</b>
${setsText}

💰 <b>Итого:</b> ${totalPrice} дин.

🚚 <b>Доставка:</b> 31 декабря, ${data.deliverySlot}

📍 <b>Адрес:</b>
${data.address.street}, ${data.address.building || data.address.house}
${data.address.apartment ? `кв. ${data.address.apartment}` : ''}
${data.address.entrance ? `подъезд ${data.address.entrance}` : ''}
${data.address.floor ? `этаж ${data.address.floor}` : ''}
${data.address.notes || data.address.note ? `\n📝 ${data.address.notes || data.address.note}` : ''}

💳 <b>Оплата:</b> ${data.payment.method}
${data.payment.changeFrom ? `Сдача с ${data.payment.changeFrom} дин.` : ''}

${data.promoCode ? `🎁 <b>Промокод:</b> ${data.promoCode}` : ''}
${data.wishes ? `💬 <b>Пожелания:</b> ${data.wishes}` : ''}

📞 Мы свяжемся с вами в ближайшее время для подтверждения!

🎄 С наступающим Новым Годом! 🎊`;
  };

  const formatAdminMessage = (data, orderNumber, user) => {
    const setsText = data.selectedSets.map(s =>
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
${setsText}

💰 <b>Сумма:</b> ${totalPrice} дин.

🚚 <b>Доставка:</b>
  Дата: 31 декабря
  Время: ${data.deliverySlot}

📍 <b>Адрес доставки:</b>
  ${data.address.street}, ${data.address.building || data.address.house}
  ${data.address.apartment ? `кв. ${data.address.apartment}` : ''}
  ${data.address.entrance ? `подъезд ${data.address.entrance}` : ''}
  ${data.address.floor ? `этаж ${data.address.floor}` : ''}
  ${data.address.notes || data.address.note ? `\n  📝 Примечание: ${data.address.notes || data.address.note}` : ''}

💳 <b>Способ оплаты:</b> ${data.payment.method}
${data.payment.changeFrom ? `  Сдача с ${data.payment.changeFrom} дин.` : ''}

${data.promoCode ? `🎁 <b>Промокод:</b> ${data.promoCode}` : ''}
${data.wishes ? `💬 <b>Пожелания от клиента:</b>\n  ${data.wishes}` : ''}

⏰ <b>Время заказа:</b> ${new Date().toLocaleString('ru-RU')}`;
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <UserInfoStep onNext={handleUserInfoNext} initialData={orderData.userInfo} />;
      case 2:
        return <SetsSelectionStep onNext={handleSetsNext} onBack={handleBack} initialData={orderData.selectedSets} />;
      case 3:
        return <DeliverySlotStep onNext={handleDeliverySlotNext} onBack={handleBack} initialData={orderData.deliverySlot} />;
      case 4:
        return <AddressStep onNext={handleAddressNext} onBack={handleBack} initialData={orderData.address} />;
      case 5:
        return <PaymentStep onNext={handlePaymentNext} onBack={handleBack} initialData={orderData.payment} />;
      case 6:
        return <ConfirmationStep onSubmit={handleOrderSubmit} onBack={handleBack} orderData={orderData} onUpdate={handleOrderDataUpdate} />;
      case 7:
        return <SuccessStep orderNumber={orderNumber} />;
      default:
        return <UserInfoStep onNext={handleUserInfoNext} />;
    }
  };

  return (
    <div className="app">
      <div className="gradient-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Падающие снежинки */}
      <div className="snowflakes" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="snowflake">
            {['❄️', '⭐', '✨'][i % 3]}
          </div>
        ))}
      </div>

      <div className="content">
        {renderStep()}
      </div>

      <div className="progress-indicator">
        <div className="progress-label">🎁</div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`progress-dot ${i + 1 <= currentStep ? 'active' : ''}`}
          />
        ))}
        <div className="progress-label">🎉</div>
      </div>
    </div>
  );
}

export default App;
