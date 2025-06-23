// frontend/src/components/payment/PaymentChoiceModal.jsx - ใหม่!
import React, { useState } from 'react';
import './PaymentChoiceModal.css';

const PaymentChoiceModal = ({ isOpen, onClose, orderData, onChoosePayNow, onChoosePayLater }) => {
  const [selectedChoice, setSelectedChoice] = useState('');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  // Handle scroll detection
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Handle choice selection
  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  // Handle confirm choice
  const handleConfirm = () => {
    if (!selectedChoice) {
      alert('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }

    if (!hasScrolledToBottom) {
      alert('กรุณาอ่านรายละเอียดให้ครบถ้วนก่อนดำเนินการต่อ');
      return;
    }

    if (selectedChoice === 'pay_now') {
      onChoosePayNow();
    } else if (selectedChoice === 'pay_later') {
      onChoosePayLater();
    }
  };

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedChoice('');
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  return (
    <div className="payment-choice-overlay" onClick={onClose}>
      <div className="payment-choice-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-choice-header">
          <h2>💳 เลือกวิธีการชำระเงิน</h2>
          <button className="payment-choice-close" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable Content */}
        <div className="payment-choice-content" onScroll={handleScroll}>
          {/* Order Summary */}
          <div className="choice-order-summary">
            <h3>📋 สรุปคำสั่งซื้อ</h3>
            <div className="choice-summary-details">
              <div className="summary-row">
                <span>ยอดรวมสินค้า</span>
                <span>{orderData?.totalAmount || '฿0'}</span>
              </div>
              <div className="summary-row">
                <span>ค่าจัดส่ง</span>
                <span>{orderData?.shippingCost || 'ฟรี!'}</span>
              </div>
              <div className="summary-total">
                <span>ยอดที่ต้องชำระ</span>
                <span className="total-amount">{orderData?.finalTotal || '฿0'}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="payment-choices">
            <h3>🎯 เลือกวิธีการชำระเงิน</h3>
            
            {/* Pay Now Option */}
            <div 
              className={`payment-choice-card ${selectedChoice === 'pay_now' ? 'selected' : ''}`}
              onClick={() => handleChoiceSelect('pay_now')}
            >
              <div className="choice-header">
                <span className="choice-icon">💳</span>
                <div className="choice-info">
                  <h4>ชำระเงินทันที</h4>
                  <p>ชำระเงินและยืนยันคำสั่งซื้อในขั้นตอนถัดไป</p>
                </div>
                <div className="choice-radio">
                  <input 
                    type="radio" 
                    name="paymentChoice" 
                    checked={selectedChoice === 'pay_now'}
                    onChange={() => {}}
                  />
                </div>
              </div>
              
              <div className="choice-benefits">
                <div className="benefit-item">✅ ได้รับสินค้าเร็วที่สุด</div>
                <div className="benefit-item">✅ ยืนยันคำสั่งซื้อทันที</div>
                <div className="benefit-item">✅ ไม่มีค่าใช้จ่ายเพิ่มเติม</div>
              </div>
            </div>

            {/* Pay Later Option */}
            <div 
              className={`payment-choice-card ${selectedChoice === 'pay_later' ? 'selected' : ''}`}
              onClick={() => handleChoiceSelect('pay_later')}
            >
              <div className="choice-header">
                <span className="choice-icon">⏰</span>
                <div className="choice-info">
                  <h4>ชำระเงินภายหลัง</h4>
                  <p>สร้างคำสั่งซื้อและชำระเงินภายใน 3 วัน</p>
                </div>
                <div className="choice-radio">
                  <input 
                    type="radio" 
                    name="paymentChoice" 
                    checked={selectedChoice === 'pay_later'}
                    onChange={() => {}}
                  />
                </div>
              </div>
              
              <div className="choice-benefits pay-later-benefits">
                <div className="benefit-item">⏰ ระยะเวลาชำระ 3 วัน</div>
                <div className="benefit-item">📱 ชำระผ่านหน้าโปรไฟล์</div>
                <div className="benefit-item">🔔 แจ้งเตือนก่อนหมดเวลา</div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="payment-terms">
            <h3>📜 ข้อกำหนดและเงื่อนไข</h3>
            
            <div className="terms-section">
              <h4>🚀 การชำระเงินทันที:</h4>
              <ul>
                <li>คำสั่งซื้อจะได้รับการยืนยันทันทีหลังชำระเงินสำเร็จ</li>
                <li>สินค้าจะจัดส่งภายใน 1-2 วันทำการ</li>
                <li>รองรับการชำระผ่าน QR Code, บัตรเครดิต/เดบิต, และโอนเงิน</li>
                <li>ไม่มีค่าธรรมเนียมเพิ่มเติม</li>
              </ul>
            </div>

            <div className="terms-section">
              <h4>⏰ การชำระเงินภายหลัง:</h4>
              <ul>
                <li>คำสั่งซื้อจะถูกสร้างและจองสินค้าไว้ให้ 3 วัน</li>
                <li>ลูกค้าต้องชำระเงินภายใน 3 วัน นับจากวันสั่งซื้อ</li>
                <li>หากไม่ชำระเงินภายในกำหนด คำสั่งซื้อจะถูกยกเลิกอัตโนมัติ</li>
                <li>สินค้าจะจัดส่งหลังจากชำระเงินแล้วเท่านั้น</li>
                <li>สามารถชำระเงินผ่านหน้าโปรไฟล์ส่วนตัว</li>
              </ul>
            </div>

            <div className="terms-section">
              <h4>📦 การจัดส่งและการคืนเงิน:</h4>
              <ul>
                <li>การจัดส่งฟรีสำหรับคำสั่งซื้อมากกว่า 1,000 บาท</li>
                <li>สามารถยกเลิกคำสั่งซื้อได้ก่อนการจัดส่ง</li>
                <li>การคืนเงินจะดำเนินการภายใน 7-14 วันทำการ</li>
                <li>สินค้าต้องอยู่ในสภาพเดิมสำหรับการคืนสินค้า</li>
              </ul>
            </div>

            <div className="terms-section">
              <h4>🔒 ความปลอดภัยข้อมูล:</h4>
              <ul>
                <li>ข้อมูลการชำระเงินได้รับการเข้ารหัสและปกป้องอย่างปลอดภัย</li>
                <li>ไม่เก็บข้อมูลบัตรเครดิตบนระบบ</li>
                <li>ข้อมูลส่วนตัวจะไม่ถูกเปิดเผยต่อบุคคลที่สาม</li>
                <li>ระบบการชำระเงินผ่านการรับรองมาตรฐานสากล</li>
              </ul>
            </div>

            <div className="terms-section">
              <h4>🛒 ข้อมูลร้านค้า:</h4>
              <ul>
                <li>VipStore - ร้านค้าออนไลน์ (ระบบสาธิต)</li>
                <li>พัฒนาโดย: วิป (Phatra Wongsapsakul) - นักศึกษา ICT มหิดล</li>
                <li>โครงการเพื่อการศึกษาและฝึกทักษะการพัฒนาระบบ</li>
                <li>การทำธุรกรรมเป็นเพียงการจำลองเท่านั้น</li>
              </ul>
            </div>

            <div className="scroll-indicator">
              {!hasScrolledToBottom && (
                <div className="scroll-prompt">
                  <span className="scroll-icon">👇</span>
                  <span>เลื่อนลงเพื่ออ่านข้อกำหนดให้ครบถ้วน</span>
                </div>
              )}
              {hasScrolledToBottom && (
                <div className="scroll-complete">
                  <span className="check-icon">✅</span>
                  <span>อ่านข้อกำหนดครบถ้วนแล้ว</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="payment-choice-footer">
          <button className="choice-back-btn" onClick={onClose}>
            ← กลับ
          </button>
          <button 
            className={`choice-confirm-btn ${(!selectedChoice || !hasScrolledToBottom) ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!selectedChoice || !hasScrolledToBottom}
          >
            {selectedChoice === 'pay_now' && '💳 ไปชำระเงิน'}
            {selectedChoice === 'pay_later' && '⏰ สร้างคำสั่งซื้อ'}
            {!selectedChoice && '🎯 เลือกวิธีการชำระ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentChoiceModal;