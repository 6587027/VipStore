// frontend/src/components/admin/SimpleShareLinkUpload.jsx - FINAL FIXED VERSION
import React, { useState, useEffect } from 'react';
import './SimpleShareLinkUpload.css';

const SimpleShareLinkUpload = ({ onImageSelect, currentImage }) => {
  const [shareLink, setShareLink] = useState(currentImage || ''); // แสดง URL เดิม
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState(''); // เพิ่ม error state ที่หายไป

  // เพิ่ม useEffect เพื่ออัปเดต shareLink เมื่อ currentImage เปลี่ยน
  useEffect(() => {
    if (currentImage) {
      setShareLink(currentImage);
      setPreview(currentImage);
    }
  }, [currentImage]);

  // Convert share links to direct image URLs
  const convertShareLink = (url) => {
    // OneDrive conversion - Multiple methods
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      // Method 1: Add download parameter
      if (url.includes('1drv.ms') && !url.includes('download=1')) {
        const separator = url.includes('?') ? '&' : '?';
        return url + separator + 'download=1';
      }
      
      // Method 2: Replace domain for thumbnail
      if (url.includes('1drv.ms')) {
        return url.replace('1drv.ms', 'onedrive.live.com/download');
      }
      
      // Method 3: Full OneDrive URLs
      if (url.includes('/view?')) {
        return url.replace('/view?', '/embed?');
      }
    }

    // Google Drive conversion
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
      }
    }

    // Dropbox conversion
    if (url.includes('dropbox.com')) {
      return url.replace('?dl=0', '?raw=1');
    }

    // If no conversion needed, return original
    return url;
  };

  // Test if image URL works
  const testImageLoad = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timeout'));
      }, 8000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  // Handle share link submission
  const handleSubmit = async () => {
    if (!shareLink.trim()) return;

    try {
      setLoading(true);
      setError('');

      const directUrl = convertShareLink(shareLink.trim());
      await testImageLoad(directUrl);
      
      setPreview(directUrl);
      onImageSelect(directUrl);
      // ไม่ clear shareLink เพื่อให้คง URL ไว้
      
    } catch (error) {
      setError('ไม่สามารถโหลดรูปจาก URL นี้ได้ กรุณาตรวจสอบ URL');
      setPreview('');
    } finally {
      setLoading(false);
    }
  };

  // Clear image
  const clearImage = () => {
    setPreview('');
    setShareLink(''); // Clear ช่อง input ด้วย
    setError('');
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
      <div className="sharelink-form">
        <div className="input-row">
          <input
            type="url"
            value={shareLink}
            onChange={(e) => {
              setShareLink(e.target.value);
              setError('');
            }}
            placeholder="วาง Direct Image URL (Imgur, Unsplash, ImageBB) ที่นี่..."
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
            {loading ? '⏳' : '✅ เพิ่ม'}
          </button>
        </div>

        {error && (
          <div className="error-msg">❌ {error}</div>
        )}

        {/* Quick Tips */}
        <div className="quick-tips">
          <strong>💡 แนะนำ: ใช้ Direct Image URL!</strong><br/>
          <strong style={{color: '#1bb76e'}}>🥇 Unsplash (ดีที่สุด):</strong><br/>
          1. Copy URL จาก images.unsplash.com/...<br/>
          2. วางที่นี่ → ทำงานทันที!<br/><br/>
          <span style={{color: '#059669', fontSize: '0.8rem'}}>
            ✅ Unsplash URL ทำงานได้ 100%!
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleShareLinkUpload;