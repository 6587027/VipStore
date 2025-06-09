// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import ProductManager from './ProductManager';
import AdminStats from './AdminStats';
import UserManager from './UserManager';
import OrderManager from './OrderManager'; 
import ReportsManager from './ReportsManager'; 

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
      const response = await productsAPI.getAll({ limit: 100 });
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
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>👨‍💼 Admin Panel</h1>
            <span className="admin-badge">Administrator</span>
          </div>
          <div className="admin-user-info">
            <span>Welcome back, <strong>{user.name}</strong></span>
            <span className="admin-time">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="admin-nav">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders 
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users 
          </button>
          {/* 🆕 เพิ่มปุ่ม Reports */}
          <button 
            className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📊 Reports 
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
                <h3>⚡ Quick Actions</h3>
                <div className="action-cards">
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('products')}
                  >
                    <div className="action-icon">📦</div>
                    <div className="action-text">
                      <h4>Manage Products</h4>
                      <p>Add, edit, or remove products</p>
                    </div>
                  </button>
                  
                  {/* 🆕 แก้ไขปุ่ม Reports ให้ทำงานได้จริง */}
                  <button 
                    className="action-card"
                    onClick={() => setActiveTab('reports')}
                  >
                    <div className="action-icon">📊</div>
                    <div className="action-text">
                      <h4>View Reports</h4>
                      <p>Sales and analytics</p>
                    </div>
                  </button> 
                  
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h3>📋 Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">➕</span>
                    <div className="activity-content">
                      <p><strong>System</strong> Admin panel initialized</p>
                      <span className="activity-time">Just now</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">👨‍💼</span>
                    <div className="activity-content">
                      <p><strong>{user.name}</strong> logged in as admin</p>
                      <span className="activity-time">Today</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">📦</span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;