// frontend/src/components/user/PasswordRequestDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PasswordRequestDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newReason, setNewReason] = useState('');

  // ✅ ดึงประวัติคำขอของ user
  const fetchPasswordRequests = async () => {
    if (!user?.id && !user?._id) return;

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';
      const userId = user.id || user._id;
      
      console.log('🔍 Fetching password requests for user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/auth/user-password-requests/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('📋 Password requests response:', data);

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        console.error('Failed to fetch requests:', data.message);
      }
    } catch (error) {
      console.error('Error fetching password requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ส่งคำขอเปลี่ยนรหัสผ่าน
  const submitPasswordRequest = async () => {
    if (!newReason.trim()) {
      alert('กรุณาระบุเหตุผลในการขอเปลี่ยนรหัสผ่าน');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';
      const userId = user.id || user._id;

      const response = await fetch(`${API_BASE_URL}/auth/request-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          requestedBy: userId,
          reason: newReason.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('ส่งคำขอเปลี่ยนรหัสผ่านสำเร็จ Admin จะตรวจสอบและดำเนินการ');
        setNewReason('');
        setShowRequestForm(false);
        fetchPasswordRequests(); // รีเฟรชข้อมูล
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting password request:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ');
    }
  };

  // ✅ Load ข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchPasswordRequests();
  }, [user]);

  // ✅ ฟังก์ชันแสดงสถานะ
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">⏳ รอดำเนินการ</span>;
      case 'approved':
        return <span className="status-badge approved">✅ อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="status-badge rejected">❌ ปฏิเสธ</span>;
      default:
        return <span className="status-badge unknown">❓ ไม่ทราบสถานะ</span>;
    }
  };

  // ✅ ฟังก์ชันแสดงรายละเอียด
  const getRequestDetails = (request) => {
    if (request.status === 'approved') {
      return (
        <div className="request-details approved">
          <p>✅ <strong>อนุมัติเมื่อ:</strong> {new Date(request.approvedAt).toLocaleString('th-TH')}</p>
          <p>💬 <strong>ข้อความ:</strong> รหัสผ่านได้รับการเปลี่ยนแปลงแล้ว</p>
        </div>
      );
    } else if (request.status === 'rejected') {
      return (
        <div className="request-details rejected">
          <p>❌ <strong>ปฏิเสธเมื่อ:</strong> {new Date(request.rejectedAt).toLocaleString('th-TH')}</p>
          <p>💬 <strong>เหตุผล:</strong> {request.rejectionReason || 'ไม่ระบุเหตุผล'}</p>
        </div>
      );
    } else {
      return (
        <div className="request-details pending">
          <p>⏳ <strong>สถานะ:</strong> รอ Admin ตรวจสอบและดำเนินการ</p>
          <p>📅 <strong>ส่งคำขอเมื่อ:</strong> {new Date(request.createdAt).toLocaleString('th-TH')}</p>
        </div>
      );
    }
  };

  return (
    <div className="password-request-dashboard">
      <style jsx>{`
        .password-request-dashboard {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .dashboard-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .request-button {
          background: #4285f4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .request-button:hover {
          background: #3367d6;
        }

        .request-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .submit-button {
          background: #34a853;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .requests-list {
          margin-top: 20px;
        }

        .request-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .request-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.approved {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.rejected {
          background: #f8d7da;
          color: #721c24;
        }

        .request-reason {
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          border-left: 4px solid #4285f4;
        }

        .request-details {
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
        }

        .request-details.approved {
          border-left: 4px solid #34a853;
        }

        .request-details.rejected {
          border-left: 4px solid #ea4335;
        }

        .request-details.pending {
          border-left: 4px solid #fbbc05;
        }

        .no-requests {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .refresh-button {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-left: 12px;
        }
      `}</style>

      <div className="dashboard-header">
        <h1 className="dashboard-title">🔐 การขอเปลี่ยนรหัสผ่าน</h1>
        <div>
          <button className="refresh-button" onClick={fetchPasswordRequests}>
            🔄 รีเฟรช
          </button>
          <button className="request-button" onClick={() => setShowRequestForm(!showRequestForm)}>
            📝 ส่งคำขอใหม่
          </button>
        </div>
      </div>

      {showRequestForm && (
        <div className="request-form">
          <h3>📝 ส่งคำขอเปลี่ยนรหัสผ่าน</h3>
          <div className="form-group">
            <label className="form-label">เหตุผลในการขอเปลี่ยนรหัสผ่าน:</label>
            <textarea
              className="form-textarea"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="กรุณาระบุเหตุผล เช่น ลืมรหัสผ่าน, ต้องการเปลี่ยนรหัสผ่านใหม่, etc."
            />
          </div>
          <div className="form-actions">
            <button className="submit-button" onClick={submitPasswordRequest}>
              📤 ส่งคำขอ
            </button>
            <button className="cancel-button" onClick={() => setShowRequestForm(false)}>
              ❌ ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="requests-list">
        <h3>📋 ประวัติคำขอเปลี่ยนรหัสผ่าน ({requests.length} รายการ)</h3>
        
        {loading ? (
          <div className="loading">⏳ กำลังโหลดข้อมูล...</div>
        ) : requests.length === 0 ? (
          <div className="no-requests">
            📝 ยังไม่มีประวัติการขอเปลี่ยนรหัสผ่าน<br/>
            คลิก "ส่งคำขอใหม่" เพื่อเริ่มต้น
          </div>
        ) : (
          requests.map((request, index) => (
            <div key={request.id || index} className="request-item">
              <div className="request-header">
                <h4>คำขอ #{request.id || index + 1}</h4>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="request-reason">
                <strong>📝 เหตุผล:</strong> {request.reason}
              </div>

              {getRequestDetails(request)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PasswordRequestDashboard;