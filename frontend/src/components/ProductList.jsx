import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';

const ProductList = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const [loadingPhase, setLoadingPhase] = useState('initializing');
  const [serverWakeAttempts, setServerWakeAttempts] = useState(0);
  const [showRealError, setShowRealError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 🛠️ Maintenance Mode Toggle (เปิด comment เมื่อต้องการ maintenance)
// const MAINTENANCE_MODE = true; // ⚠️ เปิด comment นี้เมื่อต้องการโหมดปรับปรุงระบบ

  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

const handleProductClick = (productId) => {
    console.log('🖱️ ProductList - handleProductClick called with ID:', productId);
    if (onProductClick) {
      onProductClick(productId);
    } else {
      console.warn('⚠️ onProductClick prop not provided');
    }
  };

const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);
    setShowRealError(false);
    
    // 🆕 Enhanced Loading Phases - แค่ตอน initial load
    if (isInitialLoad) {
      setLoadingPhase('initializing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Show initializing
      
      setLoadingPhase('connecting');
      await new Promise(resolve => setTimeout(resolve, 800)); // Show connecting
      
      setLoadingPhase('fetching');
    }
    // ถ้าไม่ใช่ initial load (filter change) จะ skip animation
    
    const params = selectedCategory ? { category: selectedCategory } : {};
    const response = await productsAPI.getAll(params);
    
    setProducts(response.data.data || []);
    setRetryCount(0);
    setServerWakeAttempts(0);
    
    // ✅ Mark ว่าไม่ใช่ initial load แล้ว
    setIsInitialLoad(false);
    setLoading(false);
    
  } catch (err) {
    console.error('Error fetching products:', err);
    
    // 🔥 FIXED: ตรวจสอบก่อนว่าถึง 20 ครั้งหรือยัง
    console.log(`🔄 Current retry attempts: ${serverWakeAttempts}`);
    
    // ✅ เช็คก่อนว่า retry ครบ 20 ครั้งหรือยัง
    if (serverWakeAttempts >= 19) { // เปลี่ยนจาก 20 เป็น 19 (เพราะ count เริ่มจาก 0)
      console.log('🛑 Reached maximum retry attempts (20), showing error');
      setShowRealError(true);
      setError('เซิร์ฟเวอร์ไม่สามารถเข้าถึงได้หลังจากพยายาม 20 ครั้ง');
      setIsInitialLoad(false);
      setLoading(false);
      // ✅ ไม่ต้อง increment retry count อีก
      return; // ✅ หยุดการทำงานที่นี่
    }
    
    // 🆕 Smart Error Handling
    const isServerSleeping = err.code === 'ECONNREFUSED' || 
                            err.message?.includes('Network Error') ||
                            err.response?.status === 502 ||
                            err.response?.status === 503;

    // ถ้ายังไม่ครบ 20 ครั้ง และเป็น server sleeping
    if (isServerSleeping) {
      console.log(`🔄 Server sleeping, retrying... (${serverWakeAttempts + 1}/20)`);
      
      // ✅ เพิ่ม retry count ก่อน
      setServerWakeAttempts(prev => {
        const newCount = prev + 1;
        console.log(`📊 Updated serverWakeAttempts to: ${newCount}`);
        return newCount;
      });
      
      setRetryCount(prev => prev + 1);
      
      // แสดง retrying phase (แค่ตอน initial load)
      if (isInitialLoad) {
        setLoadingPhase('retrying');
      }
      
      // รอแล้วลองใหม่ (delay เพิ่มขึ้นตาม attempt)
      const delay = 3000 + (Math.min(serverWakeAttempts, 10) * 500);
      console.log(`⏱️ Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        fetchProducts();
      }, delay);
      
      // ✅ return เพื่อไม่ให้ไปทำส่วนอื่น
      return;
      
    } else {
      // Error อื่น ๆ ที่ไม่ใช่ server หลับ - แสดง error ทันที
      console.log('🚨 Non-server error, showing error immediately');
      setShowRealError(true);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่');
      setIsInitialLoad(false);
      setLoading(false);
      setRetryCount(prev => prev + 1);
      return; // ✅ หยุดการทำงานที่นี่
    }
  }
};

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Other'];

  // 🛠️ Enhanced Maintenance Mode Display
  if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fb923c 70%, #ea580c 100%)',
          borderRadius: '25px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(251, 146, 60, 0.2)'
        }}>
          {/* Enhanced Background Animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 3px, transparent 3px),
              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 2px, transparent 2px),
              radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 4px, transparent 4px),
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)
            `,
            backgroundSize: '80px 80px, 60px 60px, 100px 100px, 200px 200px',
            animation: 'floatingPattern 15s ease-in-out infinite'
          }} />

          {/* Decorative Corner Elements */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            fontSize: '2rem',
            opacity: 0.3,
            animation: 'gentleRotate 8s ease-in-out infinite'
          }}>⚙️</div>
          
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '2rem',
            opacity: 0.3,
            animation: 'gentleRotate 8s ease-in-out infinite reverse'
          }}>🔧</div>

          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontSize: '1.5rem',
            opacity: 0.3,
            animation: 'float 6s ease-in-out infinite'
          }}>✨</div>

          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            fontSize: '1.5rem',
            opacity: 0.3,
            animation: 'float 6s ease-in-out infinite 3s'
          }}>🌟</div>

          {/* Main Icon Group with Enhanced Animation */}
          <div style={{
            fontSize: '4.5rem',
            marginBottom: '32px',
            animation: 'maintenanceBounce 2.5s ease-in-out infinite',
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))'
          }}>
            <span style={{ 
              display: 'inline-block',
              animation: 'wiggle 3s ease-in-out infinite',
              marginRight: '10px'
            }}>🛠️</span>
            <span style={{ 
              display: 'inline-block',
              animation: 'spin 4s linear infinite',
              margin: '0 10px'
            }}>⚙️</span>
            <span style={{ 
              display: 'inline-block',
              animation: 'wiggle 3s ease-in-out infinite 1s'
            }}>🔧</span>
          </div>

          {/* Enhanced Main Title */}
          <h1 style={{
            color: '#c2410c',
            fontSize: '2.8rem',
            fontWeight: '800',
            marginBottom: '20px',
            textAlign: 'center',
            animation: 'titleSlideIn 1s ease-out',
            textShadow: '0 4px 8px rgba(194, 65, 12, 0.2)',
            letterSpacing: '0.5px'
          }}>
            🔄 กำลังปรับปรุงระบบ
          </h1>

          {/* Subtitle */}
          <p style={{
            color: '#9a3412',
            fontSize: '1.3rem',
            fontWeight: '500',
            marginBottom: '32px',
            textAlign: 'center',
            animation: 'fadeInUp 1.2s ease-out',
            opacity: 0.9
          }}>
            เพื่อประสบการณ์ที่ดีกว่าเดิม ✨
          </p>

          {/* Enhanced Message Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '32px',
            borderRadius: '20px',
            border: '2px solid rgba(251, 146, 60, 0.3)',
            marginBottom: '32px',
            maxWidth: '650px',
            textAlign: 'center',
            animation: 'cardSlideUp 1.4s ease-out',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* <div style={{
              fontSize: '2rem',
              marginBottom: '1px',
              animation: 'heartbeat 2s ease-in-out infinite'
            }}>
              💝
            </div> */}
            
            <h3 style={{ 
              color: '#c2410c', 
              margin: '0 0 20px',
              fontSize: '1.4rem',
              fontWeight: '700'
            }}>
              🎯 เรากำลังอัพเกรดระบบให้คุณ!
            </h3>
            
            <p style={{ 
              color: '#9a3412', 
              margin: '0 0 20px',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              fontWeight: '500'
            }}>
              นักพัฒนากำลังทำงานหนักเพื่อปรับปรุงระบบให้มีประสิทธิภาพดีขึ้น
              <strong>ขอบคุณที่รอคอยและให้ความเชื่อมั่นกับระบบของเรานะ</strong> 🙏
            </p>

            {/* Enhanced Progress Section */}
            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
              padding: '20px',
              borderRadius: '15px',
              border: '1px solid rgba(251, 146, 60, 0.2)',
              marginBottom: '20px'
            }}>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⏱️</span>
                <span style={{ 
                  color: '#92400e', 
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  เวลาที่คาดการณ์ : 1 ชั่วโมง หรือ มากว่า

                </span>
              </div>

              {/* Enhanced Progress Bar */}
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: 'rgba(194, 65, 12, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(194, 65, 12, 0.2)'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #fb923c, #ea580c, #fb923c)',
                  borderRadius: '10px',
                  animation: 'progressGlow 2.5s ease-in-out infinite',
                  boxShadow: '0 0 10px rgba(251, 146, 60, 0.4)'
                }} />
              </div>
            </div>

            {/* Status Updates */}
            <div style={{
              background: 'rgba(251, 146, 60, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(251, 146, 60, 0.2)'
            }}>
              <p style={{ 
                color: '#9a3412', 
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                📋 <strong>กำลังดำเนินการ:</strong> อัพเดทฐานข้อมูล, ปรับปรุง UI, เพิ่มฟีเจอร์ใหม่
              </p>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '32px',
            zIndex: 10,
            position: 'relative'
          }}>

            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Refresh button clicked!');
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                border: 'none',
                padding: '16px 32px',
                fontSize: '1.2rem',
                fontWeight: '700',
                borderRadius: '15px',
                color: 'white',
                boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 100,
                position: 'relative',
                userSelect: 'none',
                outline: 'none',
                animation: 'buttonPulse 3s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(251, 146, 60, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(251, 146, 60, 0.4)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(-1px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
              }}
            >
              🔄 ตรวจสอบสถานะใหม่
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📞 Contact button clicked!');
                window.open('https://vippersonalwebsite.vercel.app/contact', '_blank');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '3px solid #fb923c',
                padding: '16px 32px',
                fontSize: '1.2rem',
                fontWeight: '700',
                borderRadius: '15px',
                color: '#c2410c',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 100,
                position: 'relative',
                userSelect: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fff7ed';
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.borderColor = '#ea580c';
                e.target.style.boxShadow = '0 12px 35px rgba(251, 146, 60, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.borderColor = '#fb923c';
                e.target.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(-1px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
              }}
            >
              📞 ติดต่อผู้ดูแลระบบ
            </button>
          </div>

          {/* Enhanced Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '30px',
            border: '2px solid rgba(251, 146, 60, 0.3)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              background: 'linear-gradient(45deg, #fb923c, #ea580c)',
              borderRadius: '50%',
              animation: 'statusGlow 2s infinite',
              boxShadow: '0 0 10px rgba(251, 146, 60, 0.6)'
            }}></div>
            <span style={{ 
              color: '#c2410c', 
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              🔧 สถานะ: กำลังปรับปรุงระบบ
            </span>
            <div style={{
              fontSize: '1.2rem',
              animation: 'bounce 2s infinite'
            }}>⚡</div>
          </div>

          {/* Enhanced Contact Information */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '16px',
            border: '2px solid rgba(251, 146, 60, 0.2)',
            maxWidth: '450px',
            animation: 'contactSlideIn 1.8s ease-out',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ 
              color: '#c2410c', 
              margin: '0 0 12px',
              fontSize: '1.1rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              💬 ต้องการสอบถามข้อมูลเพิ่มเติม? กับนักพัฒนาระบบนี้
            </h4>
            <div style={{ 
              color: '#9a3412', 
              fontSize: '0.9rem',
              lineHeight: '1.8',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: '600' }}>
                👨‍💻 <strong>วิป (Phatra Wongsapsakul)</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
  🌐 Website: <a 
    href="https://vippersonalwebsite.vercel.app/contact" 
    target="_blank" 
    rel="noopener noreferrer"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🌐 Website link clicked!');
      window.open('https://vippersonalwebsite.vercel.app/contact', '_blank');
    }}
    style={{ 
      color: '#ea580c', 
      textDecoration: 'underline',
      fontWeight: '600',
      cursor: 'pointer',
      zIndex: 1000,
      position: 'relative',
      padding: '2px 4px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = 'rgba(234, 88, 12, 0.1)';
      e.target.style.color = '#c2410c';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#ea580c';
    }}
  >
    Vip Personal Website
  </a>
</div>
              <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                🎓 นักศึกษา ICT มหาวิทยาลัยมหิดล
              </div>
            </div>
          </div>

          {/* CSS Animations for Enhanced Maintenance */}
          <style jsx>{`
            @keyframes floatingPattern {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-10px) rotate(1deg); }
              50% { transform: translateY(-5px) rotate(0deg); }
              75% { transform: translateY(-8px) rotate(-1deg); }
            }
            
            @keyframes maintenanceBounce {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-15px) scale(1.05); }
            }
            
            @keyframes gentleRotate {
              0%, 100% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.1); }
            }
            
            @keyframes wiggle {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-5deg); }
              75% { transform: rotate(5deg); }
            }
            
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            @keyframes progressGlow {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400px); }
            }
            
            @keyframes statusGlow {
              0%, 100% { 
                opacity: 1; 
                box-shadow: 0 0 10px rgba(251, 146, 60, 0.6);
              }
              50% { 
                opacity: 0.6; 
                box-shadow: 0 0 20px rgba(251, 146, 60, 0.8);
              }
            }
            
            @keyframes buttonPulse {
              0%, 100% {
                box-shadow: 0 8px 25px rgba(251, 146, 60, 0.4);
              }
              50% {
                box-shadow: 0 8px 35px rgba(251, 146, 60, 0.6);
              }
            }
            
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            
            @keyframes titleSlideIn {
              from {
                opacity: 0;
                transform: translateY(-30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes cardSlideUp {
              from {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            @keyframes contactSlideIn {
              from {
                opacity: 0;
                transform: translateX(-30px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  
// 🎨 Selective Loading Component - Enhanced vs Simple
if (loading && !showRealError) {
  // 🆕 Enhanced Loading แค่ตอน initial load
  if (isInitialLoad) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          gap: '24px',
          padding: '40px 20px'
        }}>
          
          {/* 🔄 Dynamic Loading Icon based on Phase */}
          <div style={{
            width: '80px',
            height: '80px',
            position: 'relative',
            marginBottom: '20px'
          }}>
            {/* Outer Ring */}
            <div style={{
              width: '100%',
              height: '100%',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite'
            }}></div>
            
            {/* Inner Ring */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderRight: '3px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite reverse'
            }}></div>
            
            {/* Center Icon */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.5rem',
              animation: 'pulse 2s infinite'
            }}>
              {loadingPhase === 'initializing' && '🚀'}
              {loadingPhase === 'connecting' && '🔗'}
              {loadingPhase === 'fetching' && '📦'}
              {loadingPhase === 'retrying' && '☕'}
            </div>
          </div>

          {/* 📝 Dynamic Loading Messages */}
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{
              color: '#374151',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '12px',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              {loadingPhase === 'initializing' && '🚀 เริ่มต้นระบบ...'}
              {loadingPhase === 'connecting' && '🔗 เชื่อมต่อเซิร์ฟเวอร์...'}
              {loadingPhase === 'fetching' && '📦 โหลดข้อมูลสินค้า...'}
              {loadingPhase === 'retrying' && '☕ ปลุกเซิร์ฟเวอร์ให้ตื่น...'}
            </h2>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              {loadingPhase === 'initializing' && 'กำลังเตรียมความพร้อม'}
              {loadingPhase === 'connecting' && 'กำลังสร้างการเชื่อมต่อ'}
              {loadingPhase === 'fetching' && 'กำลังดึงข้อมูลจากฐานข้อมูล'}
              {loadingPhase === 'retrying' && `ความพยายามครั้งที่ ${serverWakeAttempts} จาก 20 ครั้ง`}
            </p>

            {/* 📊 Progress Indicator */}
            {loadingPhase === 'retrying' && (
              <div style={{
                background: '#f3f4f6',
                borderRadius: '10px',
                overflow: 'hidden',
                height: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: '10px',
                  width: `${(serverWakeAttempts / 20) * 100}%`,
                  transition: 'width 0.5s ease',
                  animation: 'progressGlow 2s infinite'
                }}></div>
              </div>
            )}

            {/* 💡 Helpful Tips */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              marginTop: '20px'
            }}>
              <p style={{
                color: '#0369a1',
                fontSize: '0.9rem',
                margin: 0,
                fontWeight: '500'
              }}>
                  {loadingPhase === 'initializing' && '💡 เตรียมส่วนประกอบของเว็บไซต์'}
                  {loadingPhase === 'connecting' && '💡 กำลังติดต่อกับเซิร์ฟเวอร์'}
                  {loadingPhase === 'fetching' && '💡 กำลังโหลดสินค้าทั้งหมดให้คุณ'}
                  {loadingPhase === 'retrying' && serverWakeAttempts <= 5 && '💡 เซิร์ฟเวอร์อาจกำลังหลับ กำลังปลุกให้ตื่น'}
                  {loadingPhase === 'retrying' && serverWakeAttempts > 5 && serverWakeAttempts <= 15 && '💡 เซิร์ฟเวอร์กำลังอุ่นเครื่อง กรุณารอสักครู่'}
                  {loadingPhase === 'retrying' && serverWakeAttempts > 15 && '💡 เซิร์ฟเวอร์ใช้เวลานานกว่าปกติ กำลังพยายามเชื่อมต่อ'}
              </p>
            </div>
          </div>

          {/* 🎭 Fun Loading Animation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px'
          }}>
            {[1, 2, 3, 4, 5].map(dot => (
              <div
                key={dot}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: `bounce 1.8s infinite ease-in-out`,
                  animationDelay: `${dot * 0.2}s`
                }}
              ></div>
            ))}
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes progressGlow {
              0%, 100% {
                box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
              }
              50% {
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
              }
            }
          `}</style>
        </div>
      </div>
    );
  } else {
    // 🆕 Simple Loading สำหรับ Filter Change
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: '16px',
          padding: '20px'
        }}>
          {/* Simple Spinner */}
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          
          {/* Simple Text */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              color: '#374151',
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 8px 0'
            }}>
              🔄 อัปเดตรายการสินค้า
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.95rem',
              margin: 0
            }}>
              กำลังโหลดสินค้าในหมวดหมู่ที่เลือก...
            </p>
          </div>

          {/* Simple Loading Dots */}
          <div style={{
            display: 'flex',
            gap: '6px'
          }}>
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: `bounce 1.4s infinite ease-in-out`,
                  animationDelay: `${dot * 0.16}s`
                }}
              ></div>
            ))}
          </div>

          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }
}

// 🌟 Only Show Error when REALLY needed
  if (error && showRealError) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          margin: '20px 0'
        }}>
          {/* Server Really Down Icon */}
          <div style={{
            fontSize: '4rem',
            marginBottom: '24px',
            animation: 'gentleBounce 3s ease-in-out infinite'
          }}>
            🔌💥🖥️
          </div>

          <h2 style={{
            color: '#92400e',
            fontSize: '1.8rem',
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            เซิร์ฟเวอร์ไม่สามารถเข้าถึงได้
          </h2>

          <p style={{
            color: '#d97706',
            fontSize: '1.1rem',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            ระบบได้พยายามเชื่อมต่อแล้ว {serverWakeAttempts} ครั้ง<br/>
            เซิร์ฟเวอร์อาจปิดการให้บริการชั่วคราว หรือ กำลังปรับปรุงระบบ
          </p>

          <button
            onClick={() => {
              setServerWakeAttempts(0);
              setShowRealError(false);
              fetchProducts();
            }}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 ลองใหม่อีกครั้ง
          </button>

          <style jsx>{`
            @keyframes gentleBounce {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      </div>
    );
  }


  return (
    <div className="container">
      {/* Filter Section */}
<div className="card" style={{ marginBottom: '32px' }}>
  <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>กรองสินค้าตามหมวดหมู่</h2>
  
  {/* Desktop: Buttons (เหมือนเดิม) */}
  <div className="filter-desktop" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
    <button
      className={selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}
      onClick={() => setSelectedCategory('')}
    >
      ทั้งหมด
    </button>
    {categories.map(category => (
      <button
        key={category}
        className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
        onClick={() => setSelectedCategory(category)}
      >
        {category}
      </button>
    ))}
  </div>

  {/* Mobile: Dropdown */}
  <div className="filter-mobile">
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: '1rem',
        fontWeight: '600',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: 'white',
        color: '#374151',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <option value="">ทั้งหมด ({products.length} รายการ)</option>
      {categories.map(category => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
</div>

      {/* Products Count */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1f2937' }}>
          สินค้าทั้งหมด ({products.length} รายการ)
          {selectedCategory && ` - หมวดหมู่: ${selectedCategory}`}
        </h2>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '16px' }}>ไม่พบสินค้า</h3>
          <p style={{ color: '#9ca3af' }}>
            {selectedCategory 
              ? `ไม่มีสินค้าในหมวดหมู่ ${selectedCategory}` 
              : 'ยังไม่มีสินค้าในระบบ'
            }
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard 
  key={product._id} 
  product={product}
  onProductClick={handleProductClick}
/>
          ))}
        </div>
      )}
      {/* 📱 MOBILE FILTER CSS - ย้ายเข้ามาใน return */}
      <style jsx>{`
        /* ===== FILTER RESPONSIVE SYSTEM ===== */
        
        /* Desktop: แสดง buttons, ซ่อน dropdown */
        .filter-desktop {
          display: flex !important;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .filter-mobile {
          display: none !important;
        }

        /* Mobile: ซ่อน buttons, แสดง dropdown */
        @media (max-width: 768px) {
          .filter-desktop {
            display: none !important;
          }
          
          .filter-mobile {
            display: block !important;
          }
          
          .filter-mobile select {
            width: 100%;
            padding: 12px 16px;
            fontSize: 1rem;
            fontWeight: 600;
            border: 2px solid #e5e7eb;
            borderRadius: 12px;
            backgroundColor: white;
            color: #374151;
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 20px;
            padding-right: 40px;
          }
          
          .filter-mobile select:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }
          
          .filter-mobile select:hover {
            border-color: #9ca3af;
          }
        }

        /* Extra Small Mobile */
        @media (max-width: 480px) {
          .filter-mobile select {
            padding: 10px 14px;
            fontSize: 0.9rem;
            padding-right: 35px;
            background-size: 18px;
            background-position: right 10px center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductList;