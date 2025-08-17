import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Zap, Heart, Package, Gift, Sparkles, TrendingUp } from 'lucide-react';

const WelcomeAnimation = ({ onAnimationComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // Simple Logic: แสดง Animation เฉพาะเมื่อไม่มี User Login
  useEffect(() => {
    console.log('VipStore Welcome: Checking login status...');
    
    // ตรวจสอบสถานะ User Login
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
    
    console.log('VipStore Login Check:', {
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

    if (!isLoggedIn) {
      console.log('Welcome to VipStore - Show Premium Animation');
      setShowWelcome(true);
    } else {
      console.log('VipStore User Detected - Skip Animation');
      onAnimationComplete && onAnimationComplete();
      return;
    }

    // Premium E-commerce Animation Timeline
    const timeline = [
      { step: 1, delay: 200 },   // Brand reveal
      { step: 2, delay: 600 },   // Logo animation
      { step: 3, delay: 1000 },  // Store name
      { step: 4, delay: 1400 },  // Tagline
      { step: 5, delay: 1800 },  // Shopping features
      { step: 6, delay: 2200 },  // Loading experience
      { step: 7, delay: 3000 }   // Elegant fade out
    ];

    timeline.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCurrentStep(step);
        if (step === 7) {
          setTimeout(() => {
            setShowWelcome(false);
            console.log('VipStore Animation: Experience Complete');
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: currentStep >= 7 ? 'elegantFadeOut 1s ease-out forwards' : 'none',
      overflow: 'hidden'
    }}>
      {/* Premium Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)
        `,
        animation: 'breathe 8s ease-in-out infinite'
      }} />

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.15), transparent),
          radial-gradient(2px 2px at 40px 70px, rgba(16, 185, 129, 0.3), transparent),
          radial-gradient(1px 1px at 90px 40px, rgba(59, 130, 246, 0.4), transparent),
          radial-gradient(1px 1px at 130px 80px, rgba(245, 158, 11, 0.3), transparent),
          radial-gradient(2px 2px at 160px 30px, rgba(255, 255, 255, 0.1), transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'particles 20s linear infinite'
      }} />

      {/* Main Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Brand Reveal Animation */}
        <div style={{
          animation: currentStep >= 1 ? 'brandReveal 0.8s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
          opacity: currentStep >= 1 ? 1 : 0,
          transform: currentStep >= 1 ? 'translateY(0)' : 'translateY(40px)'
        }}>
          {/* Premium Logo Container */}
          <div style={{
            animation: currentStep >= 2 ? 'logoFloat 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
            opacity: currentStep >= 2 ? 1 : 0
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '3px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `
                0 40px 80px rgba(0, 0, 0, 0.3),
                0 0 100px rgba(16, 185, 129, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}>
              {/* Logo Image */}
              <img 
                src="/VipStoreLogo.png" 
                alt="VipStore Premium Logo"
                style={{
                  width: '130px',
                  height: '130px',
                  objectFit: 'contain',
                  borderRadius: '20px',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
                  animation: currentStep >= 2 ? 'logoGlow 3s ease-in-out infinite' : 'none'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback Icon */}
              <div style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                animation: currentStep >= 2 ? 'logoGlow 3s ease-in-out infinite' : 'none'
              }}>
                <ShoppingBag size={80} color="#10b981" strokeWidth={1.5} />
              </div>
              
              {/* Premium Glow Rings */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                right: '-15px',
                bottom: '-15px',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '50%',
                animation: currentStep >= 2 ? 'pulseRing 3s ease-in-out infinite' : 'none'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '-25px',
                right: '-25px',
                bottom: '-25px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                animation: currentStep >= 2 ? 'pulseRing 3s ease-in-out infinite 0.5s' : 'none'
              }} />
            </div>
          </div>
        </div>

        {/* Store Name with Premium Typography */}
        <div style={{
          animation: currentStep >= 3 ? 'titleReveal 0.8s ease-out' : 'none',
          opacity: currentStep >= 3 ? 1 : 0,
          transform: currentStep >= 3 ? 'translateY(0)' : 'translateY(30px)'
        }}>
          <h1 style={{
            color: 'transparent',
            fontSize: '4rem',
            fontWeight: '900',
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 25%, #3b82f6 50%, #f59e0b 75%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            letterSpacing: '-2px',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            animation: currentStep >= 3 ? 'textShimmer 4s ease-in-out infinite' : 'none'
          }}>
            VipStore
          </h1>
        </div>

        {/* Premium Tagline */}
        <div style={{
          animation: currentStep >= 4 ? 'taglineSlide 0.7s ease-out' : 'none',
          opacity: currentStep >= 4 ? 1 : 0
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            margin: 0,
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            ยินดีต้อนรับสู่ร้านค้าออนไลน์
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            margin: '8px 0 0',
            fontWeight: '400',
            letterSpacing: '0.2px'
          }}>
            ระบบจำลองร้านค้าออนไลน์ ( DEMO )
          </p>
        </div>

        {/* Shopping Features Showcase */}
        <div style={{
          animation: currentStep >= 5 ? 'featuresReveal 0.8s ease-out' : 'none',
          opacity: currentStep >= 5 ? 1 : 0,
          marginTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: Star, color: '#f59e0b', label: 'Welcome' },
              { icon: Heart, color: '#ef4444', label: 'to' },
              { icon: ShoppingBag, color: '#10b981', label: 'Vip' },
              { icon: Sparkles, color: '#3b82f6', label: 'Store' }
            ].map(({ icon: Icon, color, label }, index) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  animation: `featureFloat 2s ease-in-out infinite ${index * 0.2}s`
                }}
              >
                <div style={{
                  background: `rgba(${color === '#f59e0b' ? '245, 158, 11' : color === '#10b981' ? '16, 185, 129' : color === '#ef4444' ? '239, 68, 68' : '59, 130, 246'}, 0.15)`,
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '12px',
                  border: `1px solid ${color}33`,
                  boxShadow: `0 8px 25px ${color}20`
                }}>
                  <Icon size={24} color={color} strokeWidth={1.5} />
                </div>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Loading Experience */}
        <div style={{
          animation: currentStep >= 6 ? 'loadingReveal 0.6s ease-out' : 'none',
          opacity: currentStep >= 6 ? 1 : 0,
          marginTop: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            padding: '20px 32px',
            borderRadius: '60px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              กำลังเตรียมข้อมูล
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4].map(dot => (
                <div
                  key={dot}
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: `premiumBounce 1.6s infinite ease-in-out ${dot * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating E-commerce Icons */}
      {[
        { icon: ShoppingBag, position: { top: '12%', left: '8%' }, delay: '0s', color: '#10b981' },
        { icon: Package, position: { top: '20%', right: '12%' }, delay: '1s', color: '#3b82f6' },
        { icon: Gift, position: { bottom: '25%', left: '10%' }, delay: '2s', color: '#f59e0b' },
        { icon: Star, position: { bottom: '15%', right: '8%' }, delay: '1.5s', color: '#ffffff' }
      ].map(({ icon: Icon, position, delay, color }, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            ...position,
            animation: `floatingIcon 6s ease-in-out infinite ${delay}`,
            opacity: currentStep >= 2 ? 0.4 : 0
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            padding: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Icon size={20} color={color} strokeWidth={1.5} />
          </div>
        </div>
      ))}

      {/* Premium CSS Animations */}
      <style jsx>{`
        @keyframes brandReveal {
          0% { opacity: 0; transform: translateY(60px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes logoFloat {
          0% { opacity: 0; transform: translateY(40px) scale(0.7) rotateY(-15deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateY(0deg); }
        }

        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3)); }
          50% { filter: drop-shadow(0 15px 30px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.3)); }
        }

        @keyframes titleReveal {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes textShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes taglineSlide {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes featuresReveal {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes featureFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes loadingReveal {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes premiumBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes pulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes floatingIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(5deg); }
          66% { transform: translateY(-8px) rotate(-3deg); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes particles {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-200px); }
        }

        @keyframes elegantFadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;