import { useState } from 'react';
import { paymentMethods } from '../data/sets';
import './PaymentStep.css';

const PaymentStep = ({ onNext, onBack, initialData }) => {
  const [payment, setPayment] = useState(initialData || {
    method: null,
    changeFrom: ''
  });

  const handleMethodSelect = (methodId) => {
    setPayment({
      ...payment,
      method: methodId,
      changeFrom: methodId === 'card' ? '' : payment.changeFrom
    });
  };

  const handleChangeInput = (e) => {
    setPayment({
      ...payment,
      changeFrom: e.target.value
    });
  };

  const handleNext = () => {
    if (payment.method) {
      onNext(payment);
    }
  };

  return (
    <div className="step payment-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">Способ оплаты</h2>
      </div>

      <div className="payment-methods">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-method-btn ${payment.method === method.id ? 'selected' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <span className="method-icon">
              {method.id === 'cash' ? '💵' : '💳'}
            </span>
            <span className="method-name">{method.name}</span>
          </button>
        ))}
      </div>

      {payment.method === 'cash' && (
        <div className="change-section">
          <label htmlFor="changeFrom" className="change-label">
            Нужна сдача?
          </label>
          <input
            type="text"
            id="changeFrom"
            value={payment.changeFrom}
            onChange={handleChangeInput}
            placeholder="С какой суммы?"
            className="change-input"
          />
          <p className="change-hint">Укажите сумму, если нужна сдача</p>
        </div>
      )}

      {payment.method && (
        <button className="next-btn" onClick={handleNext}>
          Далее
        </button>
      )}
    </div>
  );
};

export default PaymentStep;
