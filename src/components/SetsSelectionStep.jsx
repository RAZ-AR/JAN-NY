import { useState } from 'react';
import { sets } from '../data/sets';
import './SetsSelectionStep.css';

const SetsSelectionStep = ({ onNext, onBack, initialData }) => {
  const [selectedSets, setSelectedSets] = useState(initialData || {});
  const [expandedSet, setExpandedSet] = useState(null);

  const handleQuantityChange = (setId, change) => {
    const newQuantity = (selectedSets[setId] || 0) + change;
    if (newQuantity >= 0) {
      setSelectedSets({
        ...selectedSets,
        [setId]: newQuantity
      });
    }
  };

  const toggleSetDetails = (setId) => {
    setExpandedSet(expandedSet === setId ? null : setId);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedSets).reduce((total, [setId, quantity]) => {
      const set = sets.find(s => s.id === parseInt(setId));
      return total + (set ? set.price * quantity : 0);
    }, 0);
  };

  const hasSelection = () => {
    return Object.values(selectedSets).some(qty => qty > 0);
  };

  const handleNext = () => {
    if (hasSelection()) {
      onNext(selectedSets);
    }
  };

  const setEmojis = {
    1: '🍖',
    2: '🍗',
    3: '🥩'
  };

  return (
    <div className="step sets-selection-step">
      <div className="step-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="step-title">🍽️ Выберите сеты 🍖</h2>
      </div>

      <div className="sets-list">
        {sets.map(set => (
          <div key={set.id} className="set-card">
            <div className="set-emoji">{setEmojis[set.id]}</div>
            <div className="set-header">
              <div className="set-info">
                <h3 className="set-name">{set.name}</h3>
                <p className="set-details">
                  ⚖️ {set.weight} г • 💰 {set.price} дин
                </p>
              </div>
              <button
                className="details-btn"
                onClick={() => toggleSetDetails(set.id)}
              >
                {expandedSet === set.id ? '🔼 Скрыть' : '🔽 Состав'}
              </button>
            </div>

            {expandedSet === set.id && (
              <div className="set-composition">
                <ul>
                  {set.items.map((item, idx) => (
                    <li key={idx}>
                      ✅ {item.name} — {typeof item.weight === 'number' ? `${item.weight} г` : item.weight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => handleQuantityChange(set.id, -1)}
                disabled={!selectedSets[set.id]}
              >
                ➖
              </button>
              <span className="quantity">{selectedSets[set.id] || 0}</span>
              <button
                className="qty-btn"
                onClick={() => handleQuantityChange(set.id, 1)}
              >
                ➕
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasSelection() && (
        <div className="total-section">
          <div className="total-price">
            <span>💵 Итого:</span>
            <span className="price">🎁 {getTotalPrice()} дин</span>
          </div>
          <button className="next-btn" onClick={handleNext}>
            Далее ➜ 🚚
          </button>
        </div>
      )}
    </div>
  );
};

export default SetsSelectionStep;
