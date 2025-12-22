import { useState, useEffect } from 'react';
import UserInfoStep from './components/UserInfoStep';
import SetsSelectionStep from './components/SetsSelectionStep';
import DeliverySlotStep from './components/DeliverySlotStep';
import AddressStep from './components/AddressStep';
import PaymentStep from './components/PaymentStep';
import ConfirmationStep from './components/ConfirmationStep';
import SuccessStep from './components/SuccessStep';
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
    }
  }, []);

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

  const handleOrderSubmit = async (finalOrderData) => {
    // Send order to Telegram Bot
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Format order message
      const orderMessage = formatOrderMessage(finalOrderData);

      // Send data to bot
      tg.sendData(JSON.stringify(finalOrderData));

      // Generate order number
      const orderNum = `NY${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);
      setCurrentStep(7);
    } else {
      // For testing without Telegram
      console.log('Order submitted:', finalOrderData);
      const orderNum = `NY${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);
      setCurrentStep(7);
    }
  };

  const formatOrderMessage = (data) => {
    // This will be used to format the message sent to bot
    return {
      userInfo: data.userInfo,
      selectedSets: data.selectedSets,
      deliverySlot: data.deliverySlot,
      address: data.address,
      payment: data.payment,
      promoCode: data.promoCode,
      wishes: data.wishes
    };
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
        return <ConfirmationStep onSubmit={handleOrderSubmit} onBack={handleBack} orderData={orderData} />;
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
