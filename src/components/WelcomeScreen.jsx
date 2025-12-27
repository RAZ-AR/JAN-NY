import { useState, useEffect } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className={`welcome-screen ${loaded ? 'loaded' : ''}`} onClick={onStart}>
      <div className="welcome-content">
        {!imageError ? (
          <div className="welcome-image-container">
            <img
              src="/welcome-poster.jpg"
              alt="Happy New Year - Новогодние сеты"
              className="welcome-image"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="welcome-fallback">
            <div className="fallback-carpet"></div>
            <div className="fallback-text">
              <h1 className="fallback-title">
                НОВОГОДНИЕ<br/>
                СЕТЫ<br/>
                2025
              </h1>
              <div className="fallback-balloons">
                <span className="balloon">🎈</span>
                <span className="balloon">🎊</span>
                <span className="balloon">✨</span>
              </div>
              <p className="fallback-subtitle">
                Ресторан кавказской кухни
              </p>
              <div className="fallback-label">ĐAN (JAN)</div>
            </div>
          </div>
        )}

        <div className="welcome-overlay">
          <div className="tap-indicator">
            <div className="tap-circle"></div>
            <p className="tap-text">👆 Нажмите, чтобы заказать</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
