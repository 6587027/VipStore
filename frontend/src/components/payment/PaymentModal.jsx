// frontend/src/components/payment/PaymentModal.jsx 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Save, 
  AlertCircle,
  Info,
  Loader2,
  X
} from 'lucide-react';
import './PaymentModal.css';
import { ordersAPI } from '../../services/api';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Methods Data
  const paymentMethods = [
    {
      id: 'qr_code',
      name: 'QR Code',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'สแกน QR Code ผ่าน Mobile Banking',
      available: true,
      processingTime: '3-5 วินาที'
    },
    {
      id: 'credit_card',
      name: 'บัตรเครดิต/เดบิต',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, JCB',
      available: true,
      processingTime: '1-2 นาที'
    },
    {
      id: 'bank_transfer',
      name: 'โอนเงินผ่านธนาคาร',
      icon: <Building2 className="w-6 h-6" />,
      description: 'โอนผ่านแอพธนาคาร',
      available: true,
      processingTime: '5-10 นาที'
    },
    {
      id: 'wallet',
      name: 'TrueMoney Wallet',
      icon: <Wallet className="w-6 h-6" />,
      description: 'ชำระผ่าน TrueMoney',
      available: false,
      processingTime: 'ไม่พร้อมใช้งาน'
    }
  ];

  // Credit Card Form State
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Countdown Timer Effect
  useEffect(() => {
    if (isOpen && paymentStep === 'methods' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, paymentStep, timeLeft, onClose]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStep('methods');
      setSelectedMethod('');
      setTimeLeft(300);
      setIsProcessing(false);
      setCardData({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle payment method selection
  const handleMethodSelect = (methodId) => {
    if (paymentMethods.find(m => m.id === methodId)?.available) {
      setSelectedMethod(methodId);
    }
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('กรุณาเลือกวิธีการชำระเงิน (เป็นระบบจำลองเท่านั้น)');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // จำลองการประมวลผล Payment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPaymentStep('success');
      setIsProcessing(false);
      
      // เรียก API เพื่ออัปเดต Order Payment Status
      if (orderData?.orderId) {
        console.log('Updating payment status for order:', orderData.orderId);
        
        const paymentUpdateData = {
          paymentMethod: selectedMethod,
          paymentMethodName: paymentMethods.find(m => m.id === selectedMethod)?.name,
          cardData: selectedMethod === 'credit_card' ? cardData : null,
          paymentStatus: 'completed'
        };

        try {
          const result = await ordersAPI.updatePayment(orderData.orderId, paymentUpdateData);

          if (result.success) {
            console.log('Payment status updated successfully');
          } else {
            console.error('Payment update failed:', result.message);
          }
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
        }
      }
      
      // เรียก callback function เพื่อแจ้ง CartModal
      const paymentResult = {
        method: selectedMethod,
        methodName: paymentMethods.find(m => m.id === selectedMethod)?.name,
        amount: orderData?.finalTotal,
        timestamp: new Date().toISOString(),
        cardData: selectedMethod === 'credit_card' ? cardData : null,
        paymentStatus: 'completed'
      };

      // Auto close after success และเรียก callback
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentResult);
        }
        onClose();
        setPaymentStep('methods');
      }, 3000);

    } catch (error) {
      console.error('Payment processing error:', error);
      alert('เกิดข้อผิดพลาดในการชำระเงิน');
      setIsProcessing(false);
      setPaymentStep('methods');
    }
  };

  // Handle payment later
  const handlePaymentLater = async () => {
    try {
      console.log('Saving order for later payment...');
      
      // บันทึกออเดอร์โดยไม่ชำระเงิน
      if (orderData?.orderId) {
        const saveForLaterData = {
          paymentStatus: 'pending',
          paymentMethod: 'pending',
          saveForLater: true,
          savedAt: new Date().toISOString()
        };

        try {
          const result = await ordersAPI.updatePayment(orderData.orderId, saveForLaterData);
          
          if (result.success) {
            console.log('Order saved for later payment');
          }
        } catch (updateError) {
          console.error('Error saving order:', updateError);
        }
      }
      
      // เรียก callback เพื่อแจ้ง CartModal ว่าบันทึกแล้ว
      const laterPaymentResult = {
        method: 'later',
        methodName: 'ชำระเงินภายหลัง',
        amount: orderData?.finalTotal,
        timestamp: new Date().toISOString(),
        savedForLater: true,
        paymentStatus: 'pending'
      };

      if (onPaymentSuccess) {
        onPaymentSuccess(laterPaymentResult);
      }
      
      // ปิด modal
      onClose();
      setPaymentStep('methods');
      
    } catch (error) {
      console.error('Error saving order for later:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกออเดอร์');
    }
  };

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      formattedValue = formattedValue.slice(0, 19);
    }
    // Format expiry date (MM/YY)
    else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    // CVV (3-4 digits only)
    else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Render Payment Methods Selection
  const renderPaymentMethods = () => (
    <div className="payment-methods-container">
      {/* Header */}
      <div className="payment-header">
        <div className="payment-title">
          <h3>
            <CreditCard className="w-5 h-5 inline mr-2" />
            เลือกวิธีการชำระเงิน (Demo)
          </h3>
          <div className="payment-timer">
            <Clock className="w-4 h-4" />
            <span className={`timer-display ${timeLeft <= 60 ? 'urgent' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="note-content">
          <h4>
            <Info className="w-4 h-4 inline mr-2" />
            หมายเหตุสำคัญ
          </h4>
          <p>
            <strong>
              <Save className="w-4 h-4 inline mr-1" />
              การบันทึกออเดอร์:
            </strong> 
            สามารถเลือก<span className="highlight"> "ชำระเงินภายหลัง" </span>
            เพื่อบันทึกออเดอร์ไว้ในประวัติการสั่งซื้อ และชำระเงินได้ในภายหลัง
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="payment-order-summary">
        <h4>
          <AlertCircle className="w-4 h-4 inline mr-2" />
          สรุปคำสั่งซื้อ
        </h4>
        <div className="summary-details">
          <div className="summary-row">
            <span>ยอดรวม</span>
            <span className="amount">{orderData?.totalAmount || '฿0'}</span>
          </div>
          <div className="summary-row">
            <span>ค่าจัดส่ง</span>
            <span className="amount">{orderData?.shippingCost || 'ฟรี!'}</span>
          </div>
          <div className="summary-total">
            <span>ยอดที่ต้องชำระ</span>
            <span className="total-amount">{orderData?.finalTotal || '฿0'}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="payment-methods-grid">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''} ${!method.available ? 'disabled' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="method-header">
              <span className="method-icon">{method.icon}</span>
              <div className="method-info">
                <div className="method-name">{method.name}</div>
                <div className="method-description">{method.description}</div>
              </div>
              {method.available && (
                <div className="method-radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === method.id}
                    onChange={() => {}}
                  />
                </div>
              )}
            </div>
            
            <div className="method-footer">
              <span className="processing-time">
                <Clock className="w-3 h-3 inline mr-1" />
                {method.processingTime}
              </span>
              {!method.available && (
                <span className="unavailable-badge">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  ไม่พร้อมใช้งาน
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Details based on selected method */}
      {selectedMethod && renderPaymentDetails()}
    </div>
  );

  // Render specific payment details
  const renderPaymentDetails = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return null;

    switch (selectedMethod) {
      case 'qr_code':
        return (
          <div className="payment-details qr-code-details">
            <h4>
              <Smartphone className="w-4 h-4 inline mr-2" />
              สแกน QR Code เพื่อชำระเงิน
            </h4>
            <div className="qr-code-container">
              <div className="qr-code-mock">
                <div className="qr-pattern">
                  <div className="qr-corner tl"></div>
                  <div className="qr-corner tr"></div>
                  <div className="qr-corner bl"></div>
                  <div className="qr-corner br"></div>
                  <div className="qr-center">VIP</div>
                </div>
              </div>
              <div className="qr-instructions">
                <p>1. เปิดแอพธนาคารของคุณ</p>
                <p>2. เลือกเมนู "สแกน QR Code"</p>
                <p>3. สแกน QR Code ที่แสดงบนหน้าจอ</p>
                <p>4. ยืนยันการชำระเงิน</p>
              </div>
            </div>
          </div>
        );

      case 'credit_card':
        return (
          <div className="payment-details credit-card-details">
            <h4>
              <CreditCard className="w-4 h-4 inline mr-2" />
              กรอกข้อมูลบัตรเครดิต/เดบิต
            </h4>
            <div className="card-form">
              <div className="card-visual">
                <div className="credit-card-mock">
                  <div className="card-chip">
                    <div className="chip-pattern"></div>
                  </div>
                  <div className="card-number">
                    {cardData.cardNumber || '**** **** **** ****'}
                  </div>
                  <div className="card-details">
                    <div className="card-name">
                      {cardData.cardName || 'CARD HOLDER NAME'}
                    </div>
                    <div className="card-expiry">
                      {cardData.expiryDate || 'MM/YY'}
                    </div>
                  </div>
                  <div className="card-brand">VISA</div>
                </div>
              </div>
              
              <div className="card-inputs">
                <div className="input-group">
                  <label>หมายเลขบัตร</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="card-input"
                  />
                </div>
                
                <div className="input-group">
                  <label>ชื่อผู้ถือบัตร *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardData.cardName}
                    onChange={handleCardInputChange}
                    placeholder="คุณชื่อ-นามสกุล"
                    className="card-input"
                    required
                  />
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>วันหมดอายุ</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardData.expiryDate}
                      onChange={handleCardInputChange}
                      placeholder="MM/YY"
                      className="card-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      className="card-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="payment-details bank-transfer-details">
            <h4>
              <Building2 className="w-4 h-4 inline mr-2" />
              ข้อมูลการโอนเงิน
            </h4>
            <div className="bank-accounts">
              <div className="bank-account">
                <div className="bank-header">
                  <div className="bank-icon blue-bank"></div>
                  <span className="bank-name">ธนาคารกรุงเทพ</span>
                </div>
                <div className="bank-details">
                  <div className="account-info">
                    <span>เลขที่บัญชี:</span>
                    <span className="account-number">123-4-56789-0</span>
                  </div>
                  <div className="account-info">
                    <span>ชื่อบัญชี:</span>
                    <span>บริษัท วิปสโตร์ จำกัด</span>
                  </div>
                </div>
              </div>
              
              <div className="bank-account">
                <div className="bank-header">
                  <div className="bank-icon purple-bank"></div>
                  <span className="bank-name">ธนาคารไทยพาณิชย์</span>
                </div>
                <div className="bank-details">
                  <div className="account-info">
                    <span>เลขที่บัญชี:</span>
                    <span className="account-number">987-6-54321-0</span>
                  </div>
                  <div className="account-info">
                    <span>ชื่อบัญชี:</span>
                    <span>บริษัท วิปสโตร์ จำกัด</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="transfer-instructions">
              <h5>
                <Info className="w-4 h-4 inline mr-2" />
                วิธีการโอนเงิน:
              </h5>
              <ol>
                <li>โอนเงินจำนวน <strong>{orderData?.finalTotal}</strong></li>
                <li>ใส่หมายเหตุ: "วิปสโตร์ - สั่งซื้อออนไลน์"</li>
                <li>เก็บหลักฐานการโอนเงิน</li>
                <li>กดปุ่ม "ยืนยันการชำระเงิน" ด้านล่าง</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render Processing State
  const renderProcessing = () => (
    <div className="payment-processing">
      <div className="processing-animation">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
      <h3>
        <Clock className="w-5 h-5 inline mr-2" />
        กำลังดำเนินการชำระเงิน
      </h3>
      <p>กรุณารอสักครู่...</p>
      <div className="processing-method">
        วิธีการชำระ: {paymentMethods.find(m => m.id === selectedMethod)?.name}
      </div>
    </div>
  );

  // Render Success State
  const renderSuccess = () => (
    <div className="payment-success">
      <div className="success-icon">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h3>ชำระเงินสำเร็จ!</h3>
      <p>ขอบคุณสำหรับการชำระเงิน</p>
      <div className="success-details">
        <div className="success-row">
          <span>
            <CreditCard className="w-4 h-4 inline mr-1" />
            วิธีการชำระ:
          </span>
          <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
        </div>
        <div className="success-row">
          <span>
            <Wallet className="w-4 h-4 inline mr-1" />
            ยอดเงิน:
          </span>
          <span>{orderData?.finalTotal}</span>
        </div>
        <div className="success-row">
          <span>
            <Clock className="w-4 h-4 inline mr-1" />
            วันที่:
          </span>
          <span>{new Date().toLocaleString('th-TH')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <h2>
            {paymentStep === 'methods' && (
              <>
                <CreditCard className="w-5 h-5 inline mr-2" />
                เลือกการชำระเงิน
              </>
            )}
            {paymentStep === 'processing' && (
              <>
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                กำลังดำเนินการ
              </>
            )}
            {paymentStep === 'success' && (
              <>
                <CheckCircle className="w-5 h-5 inline mr-2" />
                ชำระเงินสำเร็จ
              </>
            )}
          </h2>
          <button className="payment-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="payment-modal-content">
          {paymentStep === 'methods' && renderPaymentMethods()}
          {paymentStep === 'processing' && renderProcessing()}
          {paymentStep === 'success' && renderSuccess()}
        </div>

        {/* Footer */}
        {paymentStep === 'methods' && (
          <div className="payment-modal-footer">
            <button className="payment-back-btn" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </button>
            
            <button 
              className="payment-later-btn"
              onClick={handlePaymentLater}
            >
              <Save className="w-4 h-4 mr-2" />
              ชำระเงินภายหลัง
            </button>
            
            <button 
              className="payment-confirm-btn"
              onClick={handlePayment}
              disabled={!selectedMethod || isProcessing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              ยืนยันการชำระเงิน ({orderData?.finalTotal})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;