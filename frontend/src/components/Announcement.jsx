// src/components/Announcement.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, Info, CheckCircle, Megaphone, X } from 'lucide-react';
import './Announcement.css';

const Announcement = ({ config, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    const {
        active = false,
        title = '',
        content = '',
        priority = 'green',
        mode = 'toast',
        lastUpdated = 0
    } = config || {};

    // 1. Effect สำหรับการแสดงผลและ Timer (เหมือนเดิม)
    useEffect(() => {
        if (!active) {
            setIsVisible(false);
            return;
        }

        const uniqueId = `seen_announcement_${title}_${lastUpdated}`;

        if (mode === 'modal') {
            const hasSeen = sessionStorage.getItem(uniqueId);
            if (hasSeen) {
                setIsVisible(false);
                return;
            }
        }

        setIsVisible(true);

        if (mode === 'toast') {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, 20000);
            return () => clearTimeout(timer);
        }
    }, [config, active, mode, title, lastUpdated, onClose]);

    // ✅ 2. [NEW] Effect สำหรับ "ล็อคหน้าจอ" (Body Scroll Lock)
    useEffect(() => {
        if (isVisible && mode === 'modal') {
            // เมื่อ Modal ขึ้น -> ห้ามเลื่อนหน้าหลัง
            document.body.style.overflow = 'hidden';
        } else {
            // เมื่อ Modal ปิด -> ให้เลื่อนได้ปกติ
            document.body.style.overflow = 'unset';
        }

        // Cleanup: คืนค่าเมื่อปิด Component
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, mode]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (mode === 'modal') {
            const uniqueId = `seen_announcement_${title}_${lastUpdated}`;
            sessionStorage.setItem(uniqueId, 'true');
        }
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    const renderIcon = () => {
        const size = mode === 'modal' ? 48 : 32;
        switch (priority) {
            case 'red': return <AlertTriangle size={size} className="announcement-icon" />;
            case 'yellow': return <Megaphone size={size} className="announcement-icon" />;
            case 'green': return <CheckCircle size={size} className="announcement-icon" />;
            default: return <Info size={size} className="announcement-icon" />;
        }
    };

    // RENDER: MODAL
    if (mode === 'modal') {
        return (
            <div className="announcement-overlay">
                <div className={`announcement-modal priority-${priority}`}>
                    <div className="announcement-header">
                        {renderIcon()}
                        <h3 className="announcement-title">{title}</h3>
                    </div>
                    {/* ส่วนเนื้อหา */}
                    <div className="announcement-scroll-area">
                        <p className="announcement-content">{content}</p>
                    </div>
                    <button className="announcement-btn" onClick={handleDismiss}>
                        Understand / Close
                    </button>
                </div>
            </div>
        );
    }

    // RENDER: TOAST
    return (
        <div className="announcement-container">
            <div className={`announcement-toast priority-${priority}`}>
                <button className="announcement-close-btn" onClick={handleDismiss}>
                    <X size={20} />
                </button>

                <div className="announcement-header">
                    {renderIcon()}
                    <h3 className="announcement-title">{title}</h3>
                </div>
                <div className="announcement-scroll-area">
                     <p className="announcement-content">{content}</p>
                </div>
            </div>
        </div>
    );
};

Announcement.propTypes = {
    config: PropTypes.shape({
        active: PropTypes.bool,
        title: PropTypes.string,
        content: PropTypes.string,
        priority: PropTypes.oneOf(['red', 'yellow', 'green']),
        mode: PropTypes.oneOf(['toast', 'modal']),
        lastUpdated: PropTypes.number
    }),
    onClose: PropTypes.func
};

export default Announcement;