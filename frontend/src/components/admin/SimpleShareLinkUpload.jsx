// frontend/src/components/admin/SimpleShareLinkUpload.jsx - ENHANCED UNIVERSAL VERSION
import React, { useState, useEffect } from 'react';
import './SimpleShareLinkUpload.css';

const SimpleShareLinkUpload = ({ onImageSelect, currentImage }) => {
  const [shareLink, setShareLink] = useState(currentImage || '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentImage) {
      setShareLink(currentImage);
      setPreview(currentImage);
    }
  }, [currentImage]);

  // 🎯 Enhanced URL Detection & Conversion System
  const detectAndConvertUrl = (url) => {
    const originalUrl = url.trim();
    
    // 🔍 URL Pattern Detection
    const patterns = {
      // ✅ Direct Image URLs (already working)
      directImage: /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i,
      
      // 🌟 Unsplash URLs
      unsplash: {
        share: /unsplash\.com\/photos\/([^\/\?]+)/,
        direct: /images\.unsplash\.com/
      },
      
      // 📷 Instagram URLs
      instagram: /instagram\.com\/p\/([^\/\?]+)/,
      
      // 🖼️ Pinterest URLs
      pinterest: /pinterest\.com\/pin\/([^\/\?]+)/,
      
      // 🎨 DeviantArt URLs
      deviantart: /deviantart\.com\/.*\/art\//,
      
      // 📸 Flickr URLs
      flickr: /flickr\.com\/photos\/.*\/([0-9]+)/,
      
      // ☁️ Cloud Storage URLs
      googleDrive: /drive\.google\.com.*\/d\/([a-zA-Z0-9-_]+)/,
      oneDrive: /(1drv\.ms|onedrive\.live\.com)/,
      dropbox: /dropbox\.com.*\.(jpg|jpeg|png|gif|webp)/i,
      
      // 🌐 Image Hosting Services
      imgur: /imgur\.com\/([a-zA-Z0-9]+)/,
      imageBB: /ibb\.co\/([a-zA-Z0-9]+)/,
      postImage: /postimg\.cc\/([a-zA-Z0-9]+)/,
      
      // 📱 Social Media
      twitter: /twitter\.com\/.*\/status\/([0-9]+).*\/photo/,
      facebook: /facebook\.com.*\.(jpg|jpeg|png|gif)/i,
      
      // 🎮 Gaming Platforms
      steam: /steamcommunity\.com.*\.(jpg|jpeg|png|gif)/i,
      discord: /cdn\.discordapp\.com.*\.(jpg|jpeg|png|gif|webp)/i,
      
      // 📰 News & Blogs
      medium: /miro\.medium\.com/,
      wordpress: /.*\.wordpress\.com.*\.(jpg|jpeg|png|gif)/i,
      
      // 🛒 E-commerce
      amazon: /images-na\.ssl-images-amazon\.com/,
      ebay: /i\.ebayimg\.com/,
      
      // 🌏 International Platforms
      weibo: /wx[0-9]\.sinaimg\.cn/,
      pixiv: /i\.pximg\.net/,
      
      // 🏢 Corporate/Business Websites (NEW!)
      corporateWebsite: /^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/.*\.(jpg|jpeg|png|gif|webp|svg|avif)/i,
      
      // 💎 Luxury/Watch Brands (NEW!)
      luxuryBrand: {
        cortina: /cortinawatch\.com/,
        rolex: /rolex\.com/,
        omega: /omegawatches\.com/,
        tag: /tagheuer\.com/,
        breitling: /breitling\.com/,
        iwc: /iwc\.com/,
        cartier: /cartier\.com/,
        patek: /patek\.com/
      },
      
      // 🏪 E-commerce Platforms (NEW!)
      ecommercePlatform: {
        shopify: /cdn\.shopify\.com/,
        woocommerce: /.*\/wp-content\/uploads\//,
        magento: /.*\/media\/catalog\/product\//,
        prestashop: /.*\/img\/p\//,
        bigcommerce: /cdn[0-9]*\.bigcommerce\.com/
      }
    };

    console.log('🔍 Analyzing URL:', originalUrl);

    // ✅ 1. Direct Image URLs (highest priority)
    if (patterns.directImage.test(originalUrl)) {
      console.log('✅ Direct image URL detected');
      return {
        url: originalUrl,
        type: 'direct',
        confidence: 100
      };
    }

    // 🏢 2. Corporate/Business Website URLs (NEW!)
    if (patterns.corporateWebsite.test(originalUrl)) {
      console.log('🏢 Corporate website image detected');
      
      // Try multiple approaches for corporate sites
      const attempts = [
        originalUrl, // Original URL
        originalUrl.replace(/\?.*/, ''), // Remove query parameters
        originalUrl + '?cache=false', // Add cache buster
        originalUrl.replace('http://', 'https://'), // Force HTTPS
      ];
      
      return {
        url: originalUrl,
        alternatives: attempts,
        type: 'corporate',
        confidence: 75
      };
    }

    // 💎 3. Luxury Brand Websites (NEW!)
    for (const [brand, pattern] of Object.entries(patterns.luxuryBrand)) {
      if (pattern.test(originalUrl)) {
        console.log(`💎 ${brand.charAt(0).toUpperCase() + brand.slice(1)} luxury brand detected`);
        
        const attempts = [
          originalUrl,
          originalUrl.replace(/\?.*/, ''),
          originalUrl + '?v=' + Date.now(), // Cache buster
          originalUrl.replace(/\/wp-content\//, '/wp-content/'),
          originalUrl.replace('.webp', '.jpg'), // Try different format
          originalUrl.replace('.webp', '.png'),
        ];
        
        return {
          url: originalUrl,
          alternatives: attempts,
          type: `luxury-${brand}`,
          confidence: 70
        };
      }
    }

    // 🏪 4. E-commerce Platform Detection (NEW!)
    for (const [platform, pattern] of Object.entries(patterns.ecommercePlatform)) {
      if (pattern.test(originalUrl)) {
        console.log(`🏪 ${platform.charAt(0).toUpperCase() + platform.slice(1)} platform detected`);
        
        const attempts = [
          originalUrl,
          originalUrl.replace(/\?.*/, ''),
          originalUrl + '?timestamp=' + Date.now(),
          originalUrl.replace('.webp', '.jpg'),
          originalUrl.replace('.webp', '.png'),
        ];
        
        return {
          url: originalUrl,
          alternatives: attempts,
          type: `ecommerce-${platform}`,
          confidence: 65
        };
      }
    }

    // 🌟 5. Unsplash Conversions
    if (patterns.unsplash.direct.test(originalUrl)) {
      console.log('✅ Unsplash direct URL detected');
      return {
        url: originalUrl,
        type: 'unsplash-direct',
        confidence: 95
      };
    }

    const unsplashMatch = originalUrl.match(patterns.unsplash.share);
    if (unsplashMatch) {
      const photoId = unsplashMatch[1];
      const directUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
      console.log('🌟 Unsplash share URL converted to:', directUrl);
      return {
        url: directUrl,
        type: 'unsplash',
        confidence: 90
      };
    }

    // 🖼️ 6. Imgur Conversions
    const imgurMatch = originalUrl.match(patterns.imgur);
    if (imgurMatch) {
      const imageId = imgurMatch[1];
      const directUrl = `https://i.imgur.com/${imageId}.jpg`;
      console.log('🖼️ Imgur URL converted to:', directUrl);
      return {
        url: directUrl,
        type: 'imgur',
        confidence: 85
      };
    }

    // 📸 4. ImageBB Conversions
    const imageBBMatch = originalUrl.match(patterns.imageBB);
    if (imageBBMatch) {
      // Try to extract direct URL from ImageBB
      const directUrl = originalUrl.replace('ibb.co', 'i.ibb.co');
      console.log('📸 ImageBB URL converted to:', directUrl);
      return {
        url: directUrl,
        type: 'imagebb',
        confidence: 80
      };
    }

    // ☁️ 5. Google Drive Conversions
    const driveMatch = originalUrl.match(patterns.googleDrive);
    if (driveMatch) {
      const fileId = driveMatch[1];
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      console.log('☁️ Google Drive URL converted to:', directUrl);
      return {
        url: directUrl,
        type: 'google-drive',
        confidence: 75
      };
    }

    // 📱 6. Discord CDN
    if (patterns.discord.test(originalUrl)) {
      console.log('📱 Discord CDN URL detected');
      return {
        url: originalUrl,
        type: 'discord',
        confidence: 85
      };
    }

    // 🌐 7. Generic attempts for other URLs
    const genericAttempts = [
      // Try adding common image extensions
      originalUrl + '.jpg',
      originalUrl + '.png',
      originalUrl + '.jpeg',
      // Try removing query parameters
      originalUrl.split('?')[0],
      // Try HTTPS if HTTP
      originalUrl.replace('http://', 'https://'),
    ];

    // Return the first valid attempt
    for (const attempt of genericAttempts) {
      if (patterns.directImage.test(attempt)) {
        console.log('🔧 Generic conversion successful:', attempt);
        return {
          url: attempt,
          type: 'generic',
          confidence: 60
        };
      }
    }

    // 🤷‍♂️ If no conversion possible, try original
    console.log('⚠️ No conversion pattern matched, trying original URL');
    return {
      url: originalUrl,
      type: 'unknown',
      confidence: 30
    };
  };

  // 🧪 Advanced Image Testing with Multiple Attempts for Corporate Sites
  const testImageLoad = async (urlData) => {
    const { url, type, confidence, alternatives } = urlData;
    
    // For corporate/luxury sites, try multiple approaches
    if (alternatives && alternatives.length > 0) {
      console.log(`🔄 Testing ${alternatives.length} alternatives for ${type}...`);
      
      for (let i = 0; i < alternatives.length; i++) {
        const testUrl = alternatives[i];
        console.log(`🧪 Attempt ${i + 1}/${alternatives.length}: ${testUrl}`);
        
        try {
          await testSingleImage(testUrl, `${type}-attempt-${i + 1}`, 8000);
          console.log(`✅ Success with attempt ${i + 1}!`);
          return { ...urlData, url: testUrl, finalType: `${type}-attempt-${i + 1}` };
        } catch (error) {
          console.log(`❌ Attempt ${i + 1} failed: ${error.message}`);
          if (i === alternatives.length - 1) {
            throw new Error(`All ${alternatives.length} attempts failed for ${type} URL`);
          }
        }
      }
    }
    
    // For non-corporate sites, use single test
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error(`⏰ Image loading timeout (${type})`));
      }, 12000); // Increased timeout for corporate sites

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ Image loaded successfully! Type: ${type}, Confidence: ${confidence}%`);
        resolve(urlData);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`❌ Failed to load image from ${type} service`));
      };

      // Enhanced CORS handling for corporate sites
      if (type.includes('corporate') || type.includes('luxury') || type.includes('ecommerce')) {
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
      } else {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = url;
    });
  };

  // Helper function for testing single image
  const testSingleImage = (url, type, timeout = 8000) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => {
        reject(new Error(`Timeout loading ${type}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timer);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to load ${type}`));
      };

      // Enhanced headers for corporate sites
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = url;
    });
  };

  // 🎯 Smart URL Processing Pipeline
  const processImageUrl = async (inputUrl) => {
    try {
      console.log('🚀 Starting image processing pipeline...');
      
      // Step 1: Detect and convert URL
      const urlData = detectAndConvertUrl(inputUrl);
      console.log('📋 URL Analysis Result:', urlData);

      // Step 2: Test the converted URL
      const validatedUrl = await testImageLoad(urlData);
      
      // Step 3: Success!
      setSuccessMessage(`✅ Image loaded successfully from ${validatedUrl.type} (${validatedUrl.confidence}% confidence)`);
      return validatedUrl.url;

    } catch (error) {
      console.error('❌ Image processing failed:', error.message);
      
      // 🔄 Fallback: Try some common fixes for corporate sites
      const fallbackAttempts = [
        inputUrl.replace('http://', 'https://'),
        inputUrl + '?v=' + Date.now(), // Cache buster
        inputUrl.replace(/\?.*/, ''), // Remove query params
        inputUrl + '?cache=false',
        inputUrl.replace('.webp', '.jpg'), // Format conversion
        inputUrl.replace('.webp', '.png'),
        inputUrl.replace('.avif', '.jpg'),
        inputUrl + '?timestamp=' + new Date().getTime(),
      ];

      for (const fallbackUrl of fallbackAttempts) {
        try {
          console.log('🔄 Trying fallback:', fallbackUrl);
          const fallbackData = { url: fallbackUrl, type: 'fallback', confidence: 40 };
          await testImageLoad(fallbackData);
          setSuccessMessage(`✅ Image loaded using fallback method`);
          return fallbackUrl;
        } catch (fallbackError) {
          console.log('❌ Fallback failed:', fallbackError.message);
        }
      }

      throw error;
    }
  };

  // 📝 Handle URL submission
  const handleSubmit = async () => {
    if (!shareLink.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      console.log('🎬 Processing URL:', shareLink);
      const validUrl = await processImageUrl(shareLink.trim());
      
      setPreview(validUrl);
      onImageSelect(validUrl);
      
    } catch (error) {
      const errorMsg = getHelpfulErrorMessage(shareLink, error.message);
      setError(errorMsg);
      setPreview('');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  // 💡 Generate helpful error messages with suggestions
  const getHelpfulErrorMessage = (url, originalError) => {
    if (url.includes('cortinawatch.com') || url.includes('rolex.com') || url.includes('omega')) {
      return '💎 Luxury Brand Website: ลองคลิกขวาที่รูป → "Copy Image Address" หรือใช้ "Save Image As" แล้วอัพโหลดใหม่';
    }
    if (url.includes('/wp-content/uploads/')) {
      return '🏪 WordPress Site: เว็บนี้อาจมี hotlink protection - ลอง right-click → "Save Image" แล้วใช้ image hosting';
    }
    if (url.includes('.webp')) {
      return '🖼️ WebP Format: บางเว็บบล็อก .webp - ลองเปลี่ยน URL จาก .webp เป็น .jpg หรือ .png';
    }
    if (url.includes('instagram.com')) {
      return '📸 Instagram: Please use a direct image link. Right-click on the image and "Copy Image Address"';
    }
    if (url.includes('facebook.com')) {
      return '📘 Facebook: Please use a direct image link. Right-click on the image and "Copy Image Address"';
    }
    if (url.includes('pinterest.com')) {
      return '📌 Pinterest: Click on the image to open it full size, then copy the URL';
    }
    if (url.includes('twitter.com')) {
      return '🐦 Twitter: Right-click on the image and "Copy Image Address"';
    }
    if (url.includes('linkedin.com')) {
      return '💼 LinkedIn: Please use a direct image link from an image hosting service';
    }
    if (!url.includes('http')) {
      return '🔗 Please enter a complete URL starting with https://';
    }
    
    return `❌ ไม่สามารถโหลดรูปจาก URL นี้ได้\n💡 แนะนำ: 1) Right-click "Save Image" → อัพโหลดไป Imgur 2) ใช้ Unsplash 3) ลอง Direct Image URL`;
  };

  // 🗑️ Clear image
  const clearImage = () => {
    setPreview('');
    setShareLink('');
    setError('');
    setSuccessMessage('');
    onImageSelect('');
  };

  return (
    <div className="simple-sharelink-upload">
      {/* Current Image Preview */}
      {preview && (
        <div className="current-preview">
          <img src={preview} alt="Product Preview" />
          <button type="button" className="clear-btn" onClick={clearImage}>
            ✕ Remove
          </button>
        </div>
      )}

      {/* ShareLink Input */}
      <div className={`sharelink-form ${successMessage ? 'success' : ''}`}>
        <div className="input-row">
          <input
            type="url"
            value={shareLink}
            onChange={(e) => {
              setShareLink(e.target.value);
              setError('');
              setSuccessMessage('');
            }}
            placeholder="วาง Image URL จากที่ไหนก็ได้ (Unsplash, Instagram, Pinterest, Discord, ฯลฯ)"
            disabled={loading}
            className={error ? 'error' : ''}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button 
            type="button"
            disabled={!shareLink.trim() || loading}
            className="add-btn"
            onClick={handleSubmit}
          >
            {loading ? '⏳ กำลังตรวจสอบ...' : '🚀 ทดสอบ'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-msg" style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '0.75rem'
          }}>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-msg">
            {error.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        {/* Enhanced Quick Tips */}

        {/* <div className="quick-tips">
          <strong>🎯 รองรับ URL จากทุกที่! (รวม Corporate Sites)</strong><br/>
          
          <div style={{marginTop: '8px', fontSize: '0.8rem'}}>
            <strong style={{color: '#1bb76e'}}>🥇 แนะนำ (ใช้งานง่าย):</strong><br/>
            • <strong>Unsplash:</strong> Copy URL จากเว็บ → ทำงานทันที!<br/>
            • <strong>Discord:</strong> อัพโหลดรูป → Copy link → ใช้ได้เลย<br/>
            • <strong>Imgur:</strong> อัพโหลดรูป → Copy direct link<br/><br/>

            <strong style={{color: '#0ea5e9'}}>📱 Social Media:</strong><br/>
            • <strong>Instagram/Twitter:</strong> Right-click รูป → "Copy Image Address"<br/>
            • <strong>Pinterest:</strong> เปิดรูปขนาดเต็ม → Copy URL<br/><br/>

            <strong style={{color: '#8b5cf6'}}>☁️ Cloud Storage:</strong><br/>
            • <strong>Google Drive:</strong> แชร์เป็น Public → Copy link<br/>
            • <strong>OneDrive:</strong> แชร์รูป → Copy sharing link<br/><br/>

            <strong style={{color: '#ef4444'}}>🏢 Corporate/Business Sites:</strong><br/>
            • <strong>Luxury Brands:</strong> Right-click → "Save Image" → อัพโหลดไป Imgur<br/>
            • <strong>E-commerce:</strong> ลองเปลี่ยน .webp เป็น .jpg ใน URL<br/>
            • <strong>WordPress Sites:</strong> อาจมี hotlink protection - ใช้ image hosting
          </div>
        </div> */}
        
      </div>
    </div>
  );
};

export default SimpleShareLinkUpload;