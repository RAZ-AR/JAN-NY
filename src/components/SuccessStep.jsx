import './SuccessStep.css';

const SuccessStep = ({ orderNumber }) => {
  return (
    <div className="step success-step">
      <div className="success-content">
        <div className="confetti-container">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="confetti">
              {['🎉', '🎊', '✨', '⭐', '🎁'][i % 5]}
            </div>
          ))}
        </div>

        <div className="success-icon">✅</div>
        <h1 className="success-title">🎉 Заказ принят! 🎊</h1>
        {orderNumber && (
          <p className="order-number">📋 Заказ № {orderNumber}</p>
        )}
        <p className="success-message">
          🎁 Спасибо за заказ! Мы свяжемся с вами в ближайшее время для подтверждения. 📞
        </p>
        <p className="delivery-reminder">
          🚚 Доставка 31 декабря 🗓️ в выбранное время ⏰
        </p>
        <div className="celebration">
          🎄✨🎅 С наступающим Новым Годом! 🎊🎁🎆
        </div>
        <div className="celebration-emoji">
          <span className="emoji-bounce">🥳</span>
          <span className="emoji-bounce" style={{animationDelay: '0.2s'}}>🎈</span>
          <span className="emoji-bounce" style={{animationDelay: '0.4s'}}>🍾</span>
          <span className="emoji-bounce" style={{animationDelay: '0.6s'}}>🎂</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessStep;
