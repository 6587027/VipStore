// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import ProductManager from './ProductManager';
import AdminStats from './AdminStats';
import UserManager from './UserManager';
import OrderManager from './OrderManager'; 
import ReportsManager from './ReportsManager'; 
import AdminChatTab from "../chat/AdminChatTab";

import { 
  LayoutDashboard, 
  Package, 
  CheckCircle,
  UserCheck, 
  AlertTriangle,
  Grid3x3,
  Activity,
  TrendingUp,
  UserRoundCheck,
  ShoppingCart,
  BarChart3,
  MessageCircleMore,
  Bell,
  User,
  ChartNoAxesCombined,
  BadgeInfo,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    categories: [],
    lowStock: 0
  });

  // ดึงข้อมูลสินค้าและสถิติ
  useEffect(() => {
    if (isAdmin()) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 1000 });
      const productData = response.data.data;
      setProducts(productData);
      calculateStats(productData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productData) => {
    const totalProducts = productData.length;
    const activeProducts = productData.filter(p => p.isActive).length;
    const categories = [...new Set(productData.map(p => p.category))];
    const lowStock = productData.filter(p => p.stock < 10).length;

    setStats({
      totalProducts,
      activeProducts,
      categories,
      lowStock
    });
  };

  // ตรวจสอบสิทธิ์ admin
  if (!isAdmin()) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h2>🚫 Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        {/* Admin Header */}
        {/* <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserRoundCheck size={28} className="header-icon" />
            <h1>Admin Panel</h1>
          </div>
          <div className="admin-user-info">
            <span>Welcome back <strong>{user.name}</strong></span>
            <span className="admin-time">{new Date().toLocaleDateString()}</span>
          </div>
        </div> */}

        {/* Admin Navigation */}
        <div className="admin-nav">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
             <LayoutDashboard size={13} /> Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={13} /> Products
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={13} /> Orders
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <User size={13} /> Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ChartNoAxesCombined size={13} /> Reports
          </button>
      <button 
        className={`admin-tab ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => setActiveTab('chat')}
        style={{ position: 'relative' }}
      >
        <MessageCircleMore size={13} /> Live Chat
        {/* Real-time notification badge */}
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#ef4444',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '10px',
          minWidth: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          animation: 'pulse 2s infinite'
        }}>
          🔥
        </span>
      </button>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              {/* Stats Overview */}
              <AdminStats stats={stats} />
              
              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>⚡ Quick Actions :       </h3>
                <div className="action-cards">
                  <StoreStatusToggle />
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('products')}
                  >
                    <Package size={32} className="action-icon-lucide" />
                    <div className="action-text">
                      <h4> Manage Products</h4>
                      <p>  Add, edit, or remove products</p>
                    </div>
                  </button>
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('reports')}
                  >
                    <ChartNoAxesCombined size={32} className="action-icon-lucide" />
                    <div className="action-text">
                      <h4> View Reports</h4>
                      <p> Sales and analytics</p>
                    </div>
                  </button> 
                  
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
               <h3>
                <BadgeInfo size={22} className="section-icon"/> Recent Activity
               </h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <CheckCircle size={20} className="activity-icon-success" />
                    <div className="activity-content">
                      <p><strong>System</strong> Admin panel initialized</p>
                      <span className="activity-time">Just now</span>
                    </div>
                  </div>
                  <div className="activity-item">
                  <UserCheck size={20} className="activity-icon-primary" />
                  <div className="activity-content">
                    <p>
                      <strong>{user.firstName} {user.lastName} : </strong> logged in as admin
                    </p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
                  <div className="activity-item">
                    <Package size={20} className="activity-icon-primary" />
                    <div className="activity-content">
                      <p><strong>Database</strong> {stats.totalProducts} products loaded</p>
                      <span className="activity-time">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductManager 
              products={products}
              onProductsChange={fetchProducts}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManager />
          )}

          {activeTab === 'users' && (
            <UserManager />
          )}
          
          {activeTab === 'reports' && (
            <ReportsManager />
          )}
          {activeTab === 'chat' && (
            <AdminChatTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


// (ดึง API_BASE_URL มาใช้ - ถ้าไม่มี ให้ import)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

const StoreStatusToggle = () => {
  const [isMaintenance, setIsMaintenance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch current status on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        // ❗️ ใช้ /orders/settings/status
        const response = await fetch(`${API_BASE_URL}/orders/settings/status`);
        const data = await response.json();
        if (data.success) {
          setIsMaintenance(data.isMaintenanceMode);
        } else {
          setError('Failed to fetch status');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // 2. Handle toggle change
  const handleToggle = async (e) => {
    const newStatus = e.target.checked;
    
    if (newStatus === isMaintenance) return;
    
    // ถามยืนยันก่อน
    const confirmMessage = newStatus
      ? '⚠️ Are you sure you want to CLOSE the store (Enable Maintenance Mode)?'
      : '✅ Are you sure you want to OPEN the store (Disable Maintenance Mode)?';
    
    if (!window.confirm(confirmMessage)) {
      e.target.checked = !newStatus; // Revert checkbox
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // ❗️ ใช้ /orders/settings/maintenance
      const response = await fetch(`${API_BASE_URL}/orders/settings/maintenance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMaintenanceMode: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setIsMaintenance(data.isMaintenanceMode);
        alert(data.message);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }
  
  const statusClass = isMaintenance ? 'status-maintenance' : 'status-online';
  const statusText = isMaintenance ? 'MAINTENANCE (CLOSED)' : 'ONLINE (OPEN)';

  return (
    <div className={`store-status-card action-card ${statusClass}`}>
      <div className="action-text">
        <h4>Store Status</h4>
        <p>Toggle customer-facing website on/off</p>
      </div>
      <div className="status-indicator">
        <strong>{statusText}</strong>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isMaintenance}
            onChange={handleToggle}
            disabled={isLoading}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};