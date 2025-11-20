// frontend/src/components/admin/SimpleShareLinkUpload.jsx - ENHANCED CORS HANDLING
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

  // 🎯 URL Detection & Conversion System (Kept original logic but refined)
  const detectAndConvertUrl = (url) => {
    const originalUrl = url.trim();

    // Patterns
    const patterns = {
      unsplash: { share: /unsplash\.com\/photos\/([^\/\?]+)/, direct: /images\.unsplash\.com/ },
      imgur: /imgur\.com\/([a-zA-Z0-9]+)/,
      googleDrive: /drive\.google\.com.*\/d\/([a-zA-Z0-9-_]+)/,
      dropbox: /dropbox\.com.*\.(jpg|jpeg|png|gif|webp)/i,
      imageBB: /ibb\.co\/([a-zA-Z0-9]+)/,
    };

    console.log('Analyzing URL:', originalUrl);

    // 1. Unsplash Conversion
    const unsplashMatch = originalUrl.match(patterns.unsplash.share);
    if (unsplashMatch) {
      return { url: `https://images.unsplash.com/photo-${unsplashMatch[1]}?auto=format&fit=crop&w=800&q=80`, type: 'unsplash' };
    }

    // 2. Imgur Conversion
    const imgurMatch = originalUrl.match(patterns.imgur);
    if (imgurMatch) {
      return { url: `https://i.imgur.com/${imgurMatch[1]}.jpg`, type: 'imgur' };
    }

    // 3. Google Drive Conversion
    const driveMatch = originalUrl.match(patterns.googleDrive);
    if (driveMatch) {
      return { url: `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`, type: 'google-drive' };
    }

    // 4. Dropbox Conversion
    if (patterns.dropbox.test(originalUrl)) {
      return { url: originalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com'), type: 'dropbox' };
    }

    // 5. ImageBB Conversion
    const imageBBMatch = originalUrl.match(patterns.imageBB);
    if (imageBBMatch) {
      // Note: ImageBB requires API usually, but trying direct guess
      return { url: originalUrl.replace('ibb.co', 'i.ibb.co') + '.jpg', type: 'imagebb-guess' };
    }

    // Default: Return original
    return { url: originalUrl, type: 'direct' };
  };

  // 🧪 Helper: Test Single Image with specific settings
  const testSingleImage = (url, useCors = true) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000); // 10s timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load'));
      };

      // ✅ KEY FIX: Handling CORS
      // If useCors is true, we try to validate properly (good for Canvas)
      // If useCors is false, we just check if the browser can render it (good for hotlinking)
      if (useCors) {
        img.crossOrigin = 'anonymous';
      }

      // Always try to hide referrer to bypass basic hotlink protection
      img.referrerPolicy = 'no-referrer';

      img.src = url;
    });
  };

  // 🔄 Main Image Processor (Double Check Strategy)
  const processImageUrl = async (inputUrl) => {
    const urlData = detectAndConvertUrl(inputUrl);
    let finalUrl = urlData.url;

    try {
      console.log(`Attempt 1: Strict Load (${finalUrl})`);
      await testSingleImage(finalUrl, true); // Try strict first
      setSuccessMessage(`✅ โหลดรูปภาพสำเร็จ (${urlData.type})`);
      return finalUrl;
    } catch (strictError) {
      console.warn('Strict load failed, trying relaxed load...', strictError);

      try {
        // Fallback 1: Try without CORS (Standard Hotlinking)
        console.log(`Attempt 2: Relaxed Load (${finalUrl})`);
        await testSingleImage(finalUrl, false);
        setSuccessMessage(`✅ โหลดรูปภาพสำเร็จ (External Source)`);
        return finalUrl;
      } catch (relaxedError) {
        console.warn('Relaxed load failed, trying fallbacks...', relaxedError);

        // Fallback 2: Common fixes
        const fallbacks = [
          finalUrl.replace('http://', 'https://'), // Force HTTPS
          finalUrl + '?v=' + Date.now() // Cache buster
        ];

        for (const fallbackUrl of fallbacks) {
          try {
            await testSingleImage(fallbackUrl, false);
            setSuccessMessage(`✅ โหลดรูปภาพสำเร็จ (Fallback)`);
            return fallbackUrl;
          } catch (e) { continue; }
        }

        throw new Error('ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบ Link หรือสิทธิ์การเข้าถึง');
      }
    }
  };

  // 📝 Handle URL submission
  const handleSubmit = async () => {
    if (!shareLink.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const validUrl = await processImageUrl(shareLink.trim());

      setPreview(validUrl);
      onImageSelect(validUrl);

    } catch (error) {
      console.error(error);
      setError('❌ ไม่สามารถใช้งาน Link นี้ได้: Link อาจเสีย, เป็น Private, หรือป้องกันการเชื่อมต่อ');
      setPreview('');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
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
          <img
            src={preview}
            alt="Product Preview"
            onError={(e) => {
              // Final safety net in UI
              e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
              setError('⚠️ รูปภาพแสดงผลไม่ได้ (ติด CORS หรือ Link เสีย)');
            }}
          />
          <button type="button" className="clear-btn" onClick={clearImage}>
            ✕ ลบรูปภาพ
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
            placeholder="Link : Image URL "
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
            {loading ? '⏳ ตรวจสอบ...' : '🚀 ทดสอบ Link'}
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
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default SimpleShareLinkUpload;
