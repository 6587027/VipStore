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
import AnnouncementManager from './AnnouncementManager';

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
  Megaphone,
} from 'lucide-react';

// ✅ รับ Props announcementConfig และ setAnnouncementConfig จาก App.jsx
const AdminDashboard = ({ announcementConfig, setAnnouncementConfig }) => {
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
      const response = await productsAPI.getAll({ limit: 1000, includeInactive: true });
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
        {/* Admin Navigation  */}
        <div className="admin-nav">
          <button
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={13} /> <span>Dashboard</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={13} /> <span>Products</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={13} /> <span>Orders</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <User size={13} /> <span>Users</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ChartNoAxesCombined size={13} /> <span>Reports</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcement')}
          >
            <Megaphone size={13} /> <span>Announcement</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{ position: 'relative' }}
          >
            <MessageCircleMore size={13} /> <span>Live Chat</span>
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
                  <BadgeInfo size={22} className="section-icon" /> Recent Activity
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
          {activeTab === 'announcement' && (
            <AnnouncementManager
              currentConfig={announcementConfig}
              onUpdateConfig={setAnnouncementConfig}
            />
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