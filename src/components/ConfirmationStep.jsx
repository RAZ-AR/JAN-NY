import { useState } from 'react';
import { sets, deliverySlots, paymentMethods } from '../data/sets';
import './ConfirmationStep.css';

const ConfirmationStep = ({ onSubmit, onBack, orderData }) => {
  const [promoCode, setPromoCode] = useState('');
  const [wishes, setWishes] = useState('');
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

  return (
    <div className="step confirmation-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">Подтверждение</h2>
      </div>

      <div className="order-summary">
        <section className="summary-section">
          <h3>Контактные данные</h3>
          <p>{orderData.userInfo.name}</p>
          <p>{orderData.userInfo.phone}</p>
        </section>

        <section className="summary-section">
          <h3>Ваш заказ</h3>
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
          <h3>Доставка</h3>
          <p>31 декабря</p>
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
          <h3>Оплата</h3>
          <p>{getPaymentMethodName(orderData.payment.method)}</p>
          {orderData.payment.changeFrom && (
            <p>Сдача с {orderData.payment.changeFrom} дин</p>
          )}
        </section>
      </div>

      <div className="final-form">
        <div className="form-group">
          <label htmlFor="promoCode">Промокод (если есть)</label>
          <input
            type="text"
            id="promoCode"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Введите промокод"
          />
        </div>

        <div className="form-group">
          <label htmlFor="wishes">Пожелания к заказу</label>
          <textarea
            id="wishes"
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder="Особые пожелания..."
            rows="3"
          />
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
