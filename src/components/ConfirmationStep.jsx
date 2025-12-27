import { useState } from 'react';
import { sets, deliverySlots, paymentMethods } from '../data/sets';
import './ConfirmationStep.css';

const ConfirmationStep = ({ onSubmit, onBack, orderData, onUpdate }) => {
  const [promoCode, setPromoCode] = useState(orderData.promoCode || '');
  const [wishes, setWishes] = useState(orderData.wishes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSetName = (setId) => {
    const set = sets.find(s => s.id === parseInt(setId));
    return set ? set.name : '';
  };

  const getSetPrice = (setId) => {
    const set = sets.find(s => s.id === parseInt(setId));
    return set ? set.price : 0;
  };

  const getSlotLabel = (slotId) => {
    const slot = deliverySlots.find(s => s.id === slotId);
    return slot ? slot.label : '';
  };

  const getPaymentMethodName = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : '';
  };

  const getTotalPrice = () => {
    return Object.entries(orderData.selectedSets).reduce((total, [setId, quantity]) => {
      return total + getSetPrice(setId) * quantity;
    }, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({
      ...orderData,
      promoCode,
      wishes
    });
  };

  // Обновляем orderData при изменении промокода или пожеланий
  const handlePromoCodeChange = (e) => {
    const value = e.target.value;
    setPromoCode(value);
    if (onUpdate) {
      onUpdate({ ...orderData, promoCode: value, wishes });
    }
  };

  const handleWishesChange = (e) => {
    const value = e.target.value;
    setWishes(value);
    if (onUpdate) {
      onUpdate({ ...orderData, promoCode, wishes: value });
    }
  };

  return (
    <div className="step confirmation-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">✅ Подтверждение заказа 🎁</h2>
      </div>

      <div className="order-summary">
        <section className="summary-section">
          <h3>👤 Контактные данные</h3>
          <p>{orderData.userInfo.name}</p>
          <p>{orderData.userInfo.phone}</p>
        </section>

        <section className="summary-section">
          <h3>🍽️ Ваш заказ</h3>
          {Object.entries(orderData.selectedSets).map(([setId, quantity]) => (
            quantity > 0 && (
              <div key={setId} className="order-item">
                <span>{getSetName(setId)} × {quantity}</span>
                <span>{getSetPrice(setId) * quantity} дин</span>
              </div>
            )
          ))}
          <div className="order-total">
            <strong>Итого:</strong>
            <strong>{getTotalPrice()} дин</strong>
          </div>
        </section>

        <section className="summary-section">
<<<<<<< HEAD
          <h3>Доставка</h3>
          <p>31 декабря</p>
=======
          <h3>🚚 Доставка</h3>
          <p>🎄 31 декабря</p>
>>>>>>> d93b8f8bb954e900833d485edcb2c07609fab9af
          <p>{getSlotLabel(orderData.deliverySlot)}</p>
          <p className="address-text">
            ул. {orderData.address.street}, д. {orderData.address.house}
            {orderData.address.apartment && `, кв. ${orderData.address.apartment}`}
          </p>
          {orderData.address.note && (
            <p className="address-note">{orderData.address.note}</p>
          )}
        </section>

        <section className="summary-section">
          <h3>💳 Оплата</h3>
          <p>{getPaymentMethodName(orderData.payment.method)}</p>
          {orderData.payment.changeFrom && (
            <p>Сдача с {orderData.payment.changeFrom} дин</p>
          )}
        </section>
      </div>

      <div className="final-form">
        <div className="form-group">
          <label htmlFor="promoCode">🎁 Промокод (если есть)</label>
          <input
            type="text"
            id="promoCode"
            value={promoCode}
            onChange={handlePromoCodeChange}
            placeholder="Введите промокод 🎟️"
          />
        </div>

        <div className="form-group">
          <label htmlFor="wishes">💬 Пожелания к заказу</label>
          <textarea
            id="wishes"
            value={wishes}
            onChange={handleWishesChange}
            placeholder="Особые пожелания... ✨"
            rows="3"
          />
        </div>

        <p className="telegram-hint">
          👇 Нажмите кнопку внизу экрана для отправки заказа
        </p>
      </div>
    </div>
  );
};

export default ConfirmationStep;
