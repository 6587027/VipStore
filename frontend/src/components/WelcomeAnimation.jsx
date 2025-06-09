import React, { useState, useEffect } from 'react';

const WelcomeAnimation = ({ onAnimationComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timeline = [
      { step: 1, delay: 500 },   // Logo bounce in
      { step: 2, delay: 1500 },  // Welcome text
      { step: 3, delay: 2500 },  // Tagline
      { step: 4, delay: 3500 },  // Loading dots
      { step: 5, delay: 4500 }   // Fade out
    ];

    timeline.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCurrentStep(step);
        if (step === 5) {
          setTimeout(() => {
            setShowWelcome(false);
            onAnimationComplete && onAnimationComplete();
          }, 1000);
        }
      }, delay);
    });
  }, [onAnimationComplete]);

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
      animation: currentStep >= 5 ? 'fadeOut 1s ease-out forwards' : 'none'
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
          animation: currentStep >= 1 ? 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
          opacity: currentStep >= 1 ? 1 : 0
        }}>
          <div style={{
            width: '180px',
            height: '180px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Logo Image */}
            <img 
              src="/VipStoreLogo.png" 
              alt="Vip Store Logo"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback emoji - Enhanced */}
            <div style={{
              display: 'none',
              fontSize: '5rem',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
            }}>
              🛍️
            </div>
            
            {/* Enhanced Shine effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              animation: currentStep >= 1 ? 'shine 2s ease-in-out infinite' : 'none'
            }} />
            
            {/* Additional Glow Ring */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              animation: currentStep >= 1 ? 'pulse 3s ease-in-out infinite' : 'none'
            }} />
          </div>
        </div>

        {/* Welcome Text */}
        <div style={{
          animation: currentStep >= 2 ? 'slideUp 0.8s ease-out' : 'none',
          opacity: currentStep >= 2 ? 1 : 0
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            letterSpacing: '2px'
          }}>
            Vip Store
          </h1>
        </div>

        {/* Tagline */}
        <div style={{
          animation: currentStep >= 3 ? 'slideUp 0.8s ease-out 0.2s both' : 'none',
          opacity: currentStep >= 3 ? 1 : 0
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            margin: 0,
            fontWeight: '300',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            ยินดีต้อนรับสู่ร้านค้าออนไลน์
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            margin: '8px 0 0',
            fontStyle: 'italic',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            * Project จำลองระบบจัดการร้านค้า
          </p>
        </div>

        {/* Loading Animation */}
        <div style={{
          animation: currentStep >= 4 ? 'fadeIn 0.5s ease-out' : 'none',
          opacity: currentStep >= 4 ? 1 : 0,
          marginTop: '40px'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              marginRight: '16px'
            }}>
              กำลังเตรียมข้อมูล
            </span>
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: `bounce 1.4s infinite ease-in-out both`,
                  animationDelay: `${dot * 0.16}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        animation: 'float 4s ease-in-out infinite',
        opacity: 0.3
      }}>
        <div style={{ fontSize: '2rem' }}>🛒</div>
      </div>
      
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '15%',
        animation: 'float 4s ease-in-out infinite 1s',
        opacity: 0.3
      }}>
        <div style={{ fontSize: '2rem' }}>💳</div>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '15%',
        animation: 'float 4s ease-in-out infinite 2s',
        opacity: 0.3
      }}>
        <div style={{ fontSize: '2rem' }}>🎁</div>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        animation: 'float 4s ease-in-out infinite 0.5s',
        opacity: 0.3
      }}>
        <div style={{ fontSize: '2rem' }}>⭐</div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
          100% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;