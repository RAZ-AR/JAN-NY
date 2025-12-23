import { useState } from 'react';
import './UserInfoStep.css';

const UserInfoStep = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      onNext(formData);
    }
  };

  return (
    <div className="step user-info-step">
      <div className="emoji-decoration emoji-top">✨🎄✨</div>
      <h1 className="step-title">🎉 Новогодние сеты 🎊</h1>
      <p className="step-subtitle">🗓️ 31 декабря 🎆</p>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">👤 Ваше имя</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Как вас зовут? 😊"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">📱 Телефон</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+381 60 123 4567 📞"
            required
          />
        </div>

        <button type="submit" className="next-btn">
          Далее ➜ 🎁
        </button>
      </form>
      <div className="emoji-decoration emoji-bottom">🎁🎅🎁</div>
    </div>
  );
};

export default UserInfoStep;
