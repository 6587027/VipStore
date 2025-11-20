// src/components/admin/AnnouncementManager.jsx

import React, { useState } from 'react';
import { 
  Megaphone, 
  Save, 
  Power, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  MousePointerClick,
  MessageSquare
} from 'lucide-react';

const AnnouncementManager = ({ currentConfig, onUpdateConfig }) => {
  const [formData, setFormData] = useState(currentConfig || {
    active: false,
    title: '',
    content: '',
    priority: 'green',
    mode: 'toast'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ แก้ไขฟังก์ชันนี้ครับ
  const handleSave = () => {
    // 🕒 สร้างรหัสเวลาปัจจุบัน (Timestamp) เพื่อบอกว่าเป็นเวอร์ชันใหม่
    const timestamp = Date.now(); 
    
    const configWithTimestamp = {
      ...formData,
      lastUpdated: timestamp // ฝังเวลาลงไปในข้อมูล
    };

    onUpdateConfig(configWithTimestamp);
    alert('Announcement Updated & Published Successfully!');
  };

  const toggleActive = () => {
    setFormData(prev => ({ ...prev, active: !prev.active }));
  };

  // Helper สำหรับเลือกสี Border ตาม Priority
  const getBorderColor = (priority) => {
    if (priority === 'red') return '#ef4444';
    if (priority === 'yellow') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="product-manager"> 
      {/* Header Section */}
      <div className="manager-header">
        <div>
          <h2><Megaphone size={33} className="section-icon" /> Announcement System</h2>
          <p>Manage global website notifications & alerts</p>
        </div>
        <button 
          className="btn-primary"
          onClick={handleSave}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Save size={18} className="icon" /> Save & Publish
        </button>
      </div>

      {/* Main Content Card */}
      <div className="products-table-container" style={{ padding: '32px', display: 'block', background: 'white' }}>
        
        {/* Status Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '24px', 
          marginBottom: '24px', 
          borderBottom: '1px solid #e5e7eb' 
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1f2937', fontWeight: '600' }}>System Status</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Enable or disable the announcement banner globally.</p>
          </div>
          
          <button 
            onClick={toggleActive}
            style={{
              padding: '10px 24px',
              borderRadius: '30px',
              border: formData.active ? '1px solid #10b981' : '1px solid #d1d5db',
              background: formData.active ? '#ecfdf5' : '#f3f4f6',
              color: formData.active ? '#059669' : '#6b7280',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
          >
            <Power size={18} />
            {formData.active ? 'Active : ON' : 'Active : OFF'}
          </button>
        </div>

        {/* Form Grid */}
        <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
          
          {/* Title Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
              Title / Headline
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., System Maintenance Update"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
              Message Content
            </label>
            {/* ✅ ปรับ rows เป็น 12 ตามที่ขอไว้รอบก่อนครับ */}
            <textarea
              name="content"
              rows="12" 
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter the details of your announcement here..."
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '1rem', 
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Settings Row (Priority & Mode) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Priority Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
                Priority Level
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    paddingLeft: '40px', 
                    borderRadius: '8px', 
                    border: `1px solid ${getBorderColor(formData.priority)}`,
                    background: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="green">Normal (Green)</option>
                  <option value="yellow">Warning (Yellow)</option>
                  <option value="red">Critical (Red)</option>
                </select>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  {formData.priority === 'green' && <CheckCircle size={18} color="#10b981" />}
                  {formData.priority === 'yellow' && <Info size={18} color="#f59e0b" />}
                  {formData.priority === 'red' && <AlertTriangle size={18} color="#ef4444" />}
                </div>
              </div>
            </div>

            {/* Mode Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
                Display Mode
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    paddingLeft: '40px',
                    borderRadius: '8px', 
                    border: '1px solid #d1d5db', 
                    background: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="toast">Toast (Auto-hide 20s)</option>
                  <option value="modal">Modal (Force User Action)</option>
                </select>
                 <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }}>
                  {formData.mode === 'toast' && <MessageSquare size={18} />}
                  {formData.mode === 'modal' && <MousePointerClick size={18} />}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AnnouncementManager;