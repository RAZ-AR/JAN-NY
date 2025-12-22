import { useState } from 'react';
import { deliverySlots } from '../data/sets';
import './DeliverySlotStep.css';

const DeliverySlotStep = ({ onNext, onBack, initialData }) => {
  const [selectedSlot, setSelectedSlot] = useState(initialData || null);

  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleNext = () => {
    if (selectedSlot) {
      onNext(selectedSlot);
    }
  };

  return (
    <div className="step delivery-slot-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">Время доставки</h2>
      </div>

      <p className="delivery-date">31 декабря 2024</p>

      <div className="slots-list">
        {deliverySlots.map(slot => (
          <button
            key={slot.id}
            className={`slot-btn ${selectedSlot === slot.id ? 'selected' : ''}`}
            onClick={() => handleSlotSelect(slot.id)}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <button className="next-btn" onClick={handleNext}>
          Далее
        </button>
      )}
    </div>
  );
};

export default DeliverySlotStep;
