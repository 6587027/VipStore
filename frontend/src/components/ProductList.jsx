import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // 🛠️ Maintenance Mode Toggle (เปิด comment เมื่อต้องการ maintenance)
  // const MAINTENANCE_MODE = true; // ⚠️ เปิด comment นี้เมื่อต้องการโหมดปรับปรุงระบบ

  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productsAPI.getAll(params);
      
      setProducts(response.data.data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
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

  // 🎨 Enhanced Loading Component with Animation
  if (loading) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '20px'
        }}>
          {/* Animated Loading Spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          
          {/* Loading Text with Pulse */}
          <div style={{
            fontSize: '1.2rem',
            color: '#6b7280',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
          }}>
            🛍️ กำลังโหลดสินค้า...
          </div>
          
          {/* Loading Dots */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: `bounce 1.4s infinite ease-in-out both`,
                  animationDelay: `${dot * 0.16}s`
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
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              }
              40% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 🌟 User-Friendly Error Component 
  if (error) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gentle Background Animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 15%, transparent 15%),
              radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.3) 15%, transparent 15%),
              radial-gradient(circle at 40% 40%, rgba(191, 219, 254, 0.3) 15%, transparent 15%)
            `,
            backgroundSize: '60px 60px',
            animation: 'gentleFloat 12s ease-in-out infinite'
          }} />

          {/* Friendly Icon Animation */}
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '24px',
            animation: 'gentleBounce 3s ease-in-out infinite'
          }}>
            😅 📡 💤
          </div>

          {/* Friendly Title */}
          <h2 style={{
            color: '#1e40af',
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            อุ๊ปส์! เซิร์ฟเวอร์หลับไปแล้ว 💤
          </h2>

          {/* Friendly Description */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid #93c5fd',
            marginBottom: '24px',
            maxWidth: '500px',
            textAlign: 'center',
            animation: 'slideIn 0.8s ease-out',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ 
              color: '#1e40af', 
              margin: '0 0 16px',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              🎯 ไม่ต้องกังวลนะครับ!
            </p>
            <p style={{ 
              color: '#1d4ed8', 
              margin: '0 0 16px',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              เซิร์ฟเวอร์อาจจะพักผ่อนอยู่ หรือกำลังอัพเดทข้อมูลใหม่<br/>
              ลองกดปุ่มด้านล่างเพื่อปลุกให้ตื่นดูนะครับ 😊
            </p>
            
            {/* Fun Message */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#dbeafe',
              borderRadius: '10px',
              border: '1px solid #93c5fd',
              marginBottom: '16px'
            }}>
              <span style={{ 
                color: '#1e3a8a', 
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                💡 เทคนิค: ลองรอ 10 วินาที แล้วกดลองใหม่
              </span>
            </div>

            {/* Retry Count Display
            {retryCount > 0 && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <span style={{ color: '#92400e', fontSize: '0.85rem' }}>
                  🔄 ความพยายามครั้งที่: {retryCount} (ขอบคุณที่อดทนครับ!)
                </span>
              </div>
            )} */}

          </div>

          {/* Gentle Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '24px',
            zIndex: 10,
            position: 'relative'
          }}>
            {/* <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('☕ Wake server button clicked!');
                fetchProducts();
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'gentlePulse 3s infinite',
                zIndex: 100,
                position: 'relative',
                userSelect: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(1px) scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              ☕ ปลุกเซิร์ฟเวอร์ให้ตื่น
            </button> */}

            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Refresh page button clicked!');
                window.location.reload();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid #93c5fd',
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '12px',
                color: '#1e40af',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 100,
                position: 'relative',
                userSelect: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dbeafe';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.borderColor = '#93c5fd';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(1px) scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              🔄 รีเฟรชหน้า
            </button>
          </div>

          {/* Network Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '25px',
            border: '1px solid #93c5fd',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              animation: 'gentleBlink 2s infinite'
            }}></div>
            <span style={{ 
              color: '#1e40af', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              สถานะ: กำลังพยายามเชื่อมต่อ...
            </span>
          </div>

          {/* Contact Information */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #93c5fd',
            maxWidth: '400px',
            animation: 'fadeIn 1.2s ease-out'
          }}>
            <h4 style={{ 
              color: '#1e40af', 
              margin: '0 0 8px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              💬 ต้องการความช่วยเหลือ? นักพัฒนาระบบ
            </h4>
            <ul style={{ 
              color: '#1d4ed8', 
              margin: 0,
              paddingLeft: '16px',
              fontSize: '0.8rem',
              lineHeight: '1.6',
              listStyle: 'none'
            }}>
              <li style={{ marginBottom: '6px' }}>
                👨‍💻 <strong>วิป (Phatra Wongsapsakul)</strong>
              </li>
              <li style={{ marginBottom: '6px' }}>
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
                    color: '#2563eb', 
                    textDecoration: 'underline',
                    fontWeight: '500',
                    cursor: 'pointer',
                    zIndex: 1000,
                    position: 'relative',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                    e.target.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#2563eb';
                  }}
                >
                  Vip Personal Website
                </a>
              </li>
              <li>
                🎓 <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                  นักศึกษา ICT มหาวิทยาลัยมหิดล
                </span>
              </li>
            </ul>
          </div>

          {/* CSS Animations for Error State */}
          <style jsx>{`
            @keyframes gentleFloat {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              33% { transform: translateY(-10px) rotate(1deg); }
              66% { transform: translateY(-5px) rotate(-1deg); }
            }
            
            @keyframes gentleBounce {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
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
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes gentlePulse {
              0% {
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
              }
              50% {
                box-shadow: 0 4px 25px rgba(59, 130, 246, 0.4);
              }
              100% {
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
              }
            }
            
            @keyframes gentleBlink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0.4; }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
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