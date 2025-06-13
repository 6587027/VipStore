import React, { useState, useEffect } from 'react';

const WelcomeAnimation = ({ onAnimationComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // 🎯 Simple Logic: แสดง Animation เฉพาะเมื่อไม่มี User Login
  useEffect(() => {
    console.log('🎬 Welcome Animation: Checking login status...');
    
    // 🔍 ตรวจสอบสถานะ User Login - ลองหลาย key ที่เป็นไปได้
    const possibleUserKeys = ['currentUser', 'user', 'loggedInUser', 'authUser'];
    let currentUser = null;
    let userKey = null;
    
    for (const key of possibleUserKeys) {
      const userData = localStorage.getItem(key);
      if (userData && userData !== 'null' && userData !== 'undefined') {
        currentUser = userData;
        userKey = key;
        break;
      }
    }
    
    const isLoggedIn = currentUser !== null;
    
    console.log('🔍 Login Check:', {
      isLoggedIn,
      userKey,
      user: isLoggedIn ? (function() {
        try {
          return JSON.parse(currentUser).username || JSON.parse(currentUser).name || 'unknown';
        } catch (e) {
          return currentUser.slice(0, 20) + '...';
        }
      })() : 'no user'
    });

    // 🎯 Simple Logic: แสดง Animation เฉพาะเมื่อไม่มี User Login
    if (!isLoggedIn) {
      // ✅ ไม่มี User Login → แสดง Animation
      console.log('✅ No user logged in → Show Welcome Animation');
      setShowWelcome(true);
    } else {
      // 🚫 มี User Login → ข้าม Animation
      console.log('🚫 User logged in → Skip Animation');
      onAnimationComplete && onAnimationComplete();
      return;
    }

    // Timeline ของ animation
    const timeline = [
      { step: 1, delay: 300 },   // Logo bounce in
      { step: 2, delay: 800 },  // Welcome text
      { step: 3, delay: 1200 },  // Tagline
      { step: 4, delay: 1600 },  // Loading dots
      { step: 5, delay: 2400 }   // Fade out
    ];

    timeline.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCurrentStep(step);
        if (step === 5) {
          setTimeout(() => {
            setShowWelcome(false);
            console.log('🎬 Welcome Animation: Completed successfully');
            onAnimationComplete && onAnimationComplete();
          }, 800);
        }
      }, delay);
    });
  }, [onAnimationComplete]);

  // 🔄 ฟังก์ชันสำหรับ Reset (สำหรับทดสอบ)
  const resetAndReload = () => {
    console.log('🔄 Manual logout and reload');
    
    // เคลียร์ทุก possible user keys
    const possibleUserKeys = ['currentUser', 'user', 'loggedInUser', 'authUser'];
    possibleUserKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    window.location.reload();
  };

  if (!showWelcome) return null;


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: currentStep >= 5 ? 'fadeOut 0.8s ease-out forwards' : 'none'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, white 2px, transparent 2px)
        `,
        backgroundSize: '50px 50px',
        animation: 'float 6s ease-in-out infinite'
      }} />

      {/* Main Logo Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center'
      }}>
        {/* Enhanced Large Glass Logo */}
        <div style={{
          animation: currentStep >= 1 ? 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
          opacity: currentStep >= 1 ? 1 : 0
        }}>
          <div style={{
            width: '160px',
            height: '160px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Logo Image */}
            <img 
              src="/VipStoreLogo.png" 
              alt="Vip Store Logo"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback emoji */}
            <div style={{
              display: 'none',
              fontSize: '4rem',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
            }}>
              🛍️
            </div>
            
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              animation: currentStep >= 1 ? 'shine 2s ease-in-out infinite' : 'none'
            }} />
          </div>
        </div>

        {/* Welcome Text */}
        <div style={{
          animation: currentStep >= 2 ? 'slideUp 0.6s ease-out' : 'none',
          opacity: currentStep >= 2 ? 1 : 0
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            letterSpacing: '1px'
          }}>
            Vip Store
          </h1>
        </div>

        {/* Tagline */}
        <div style={{
          animation: currentStep >= 3 ? 'slideUp 0.6s ease-out 0.1s both' : 'none',
          opacity: currentStep >= 3 ? 1 : 0
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '300',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            ยินดีต้อนรับสู่ร้านค้าออนไลน์
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem',
            margin: '6px 0 0',
            fontStyle: 'italic',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            ระบบจำลองร้านค้าออนไลน์ ( DEMO )
          </p>
        </div>

        {/* Loading Animation */}
        <div style={{
          animation: currentStep >= 4 ? 'fadeIn 0.4s ease-out' : 'none',
          opacity: currentStep >= 4 ? 1 : 0,
          marginTop: '30px'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              marginRight: '12px'
            }}>
              กำลังเตรียมข้อมูล
            </span>
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: `bounce 1.2s infinite ease-in-out both`,
                  animationDelay: `${dot * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        animation: 'float 4s ease-in-out infinite',
        opacity: 0.25,
        fontSize: '1.5rem'
      }}>
        🛒
      </div>
      
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '15%',
        animation: 'float 4s ease-in-out infinite 1s',
        opacity: 0.25,
        fontSize: '1.5rem'
      }}>
        💳
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '15%',
        animation: 'float 4s ease-in-out infinite 2s',
        opacity: 0.25,
        fontSize: '1.5rem'
      }}>
        🎁
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        animation: 'float 4s ease-in-out infinite 0.5s',
        opacity: 0.25,
        fontSize: '1.5rem'
      }}>
        ⭐
      </div>

      {/* Dev Reset Button - สำหรับ Development Testing */}
      {/* {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetAndReload}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '15px',
            padding: '6px 12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.7rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          🚪 Logout & Reload
        </button>
      )} */}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;