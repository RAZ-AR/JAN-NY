import { useState } from 'react';
import './AddressStep.css';

const AddressStep = ({ onNext, onBack, initialData }) => {
  const [address, setAddress] = useState(initialData || {
    street: '',
    house: '',
    apartment: '',
    note: ''
  });

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.street && address.house) {
      onNext(address);
    }
  };

  return (
    <div className="step address-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">Адрес доставки</h2>
      </div>

      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="street">Улица</label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleChange}
            placeholder="Название улицы"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="house">Дом</label>
            <input
              type="text"
              id="house"
              name="house"
              value={address.house}
              onChange={handleChange}
              placeholder="№"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apartment">Квартира</label>
            <input
              type="text"
              id="apartment"
              name="apartment"
              value={address.apartment}
              onChange={handleChange}
              placeholder="№"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="note">Комментарий</label>
          <textarea
            id="note"
            name="note"
            value={address.note}
            onChange={handleChange}
            placeholder="Подъезд, этаж, домофон..."
            rows="3"
          />
        </div>

        <button type="submit" className="next-btn">
          Далее
        </button>
      </form>
    </div>
  );
};

export default AddressStep;
