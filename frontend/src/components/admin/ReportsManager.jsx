// frontend/src/components/admin/ReportsManager.jsx


import React, { useState, useEffect } from 'react';
import { 
  getReportsOverview, 
  getSalesReports, 
  getProductsReports, 
  getUsersReports, 
  getOrdersReports 
} from '../../services/api';
import {
  ChartNoAxesCombined,
  RefreshCw,
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Filter,
  TrendingUp,
  BarChart3,
  Star,
  AlertTriangle,
  LayoutGrid,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  Ban,
  BadgePercent
} from 'lucide-react';

// 📊 Dynamic Reports Component for Vip Store Admin Panel
const ReportsManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  
  // 🎯 Reports Data State
  const [reportData, setReportData] = useState({
    overview: null,
    sales: null,
    products: null,
    users: null,
    orders: null
  });

  // 📱 Fetch reports data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 🔄 Fetch data when active report or date range changes
  useEffect(() => {
    if (!loading) { // Only fetch if initial data is loaded
      fetchReportData(activeReport);
    }
  }, [activeReport, dateRange]);

  // 🚀 Fetch initial overview data
  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📊 Fetching initial reports data...');
      
      const overviewResult = await getReportsOverview();
      
      if (overviewResult.success) {
        setReportData(prev => ({
          ...prev,
          overview: overviewResult.data.data
        }));
        console.log('✅ Overview data loaded successfully');
      } else {
        throw new Error(overviewResult.message);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch initial data:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // 📈 Fetch specific report data
  const fetchReportData = async (reportType) => {
    if (reportType === 'overview') {
      // If we only want to refresh overview, call fetchInitialData
      if(loading) return; // Prevent double fetch
      await fetchInitialData();
      return;
    };
    
    setLoading(true);
    setError('');

    try {
      console.log(`📊 Fetching ${reportType} report...`);
      
      let result;
      const params = reportType === 'sales' ? { dateRange } : {};
      
      switch (reportType) {
        case 'sales':
          result = await getSalesReports(params);
          break;
        case 'products':
          result = await getProductsReports(params);
          break;
        case 'users':
          result = await getUsersReports(params);
          break;
        case 'orders':
          result = await getOrdersReports(params);
          break;
        default:
          setLoading(false);
          return;
      }
      
      if (result.success) {
        setReportData(prev => ({
          ...prev,
          [reportType]: result.data.data
        }));
        console.log(`✅ ${reportType} report loaded successfully`);
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch ${reportType} report:`, error);
      setError(`เกิดข้อผิดพลาดในการโหลดรายงาน ${reportType}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refresh current report
  const refreshReport = () => {
    if (activeReport === 'overview') {
      fetchInitialData();
    } else {
      fetchReportData(activeReport);
    }
  };

  // 💰 Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '฿0';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // 📊 Format percentage
  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // 🔢 Safe number formatting
  const safeNumber = (value, defaultValue = 0) => {
    return typeof value === 'number' ? value : defaultValue;
  };

  // 🚀 Loading State
  if (loading && !reportData.overview) { // Show initial load only
    return (
      <div className="admin-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>กำลังโหลดรายงาน...</p>
        </div>
      </div>
    );
  }

  // ❌ Error State
  if (error && !reportData.overview) {
    return (
      <div className="admin-content">
        <div className="empty-state">
          <XCircle size={64} className="empty-icon" style={{ color: '#dc2626' }} />
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button
            onClick={fetchInitialData}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            <RefreshCw size={16} />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // --- Helper Components for Clean JSX ---

  // 📊 Overview Report Component
  const OverviewReport = () => {
    const data = reportData.overview;
    if (!data) return null;

    return (
      <div className="dashboard-content">
        {/* Key Metrics Cards */}
        <div className="stats-grid">
          {/* [🌟 COLOR ADDED] */}
          <div className="stat-card" style={{ background: '#ecfdf5' }}>
            <div className="stat-header">
              <div className="stat-icon-lucide" style={{ color: '#10b981' }}><DollarSign size={20} /></div>
              <span className="stat-title">รายได้รวม</span>
            </div>
            <div className="stat-value">{formatCurrency(data.revenue?.total)}</div>
            <span className="stat-subtitle">📈 วันนี้: {formatCurrency(data.revenue?.today)}</span>
          </div>
           {/* [🌟 COLOR ADDED] */}
          <div className="stat-card" style={{ background: '#eff6ff' }}>
            <div className="stat-header">
              <div className="stat-icon-lucide" style={{ color: '#3b82f6' }}><ShoppingCart size={20} /></div>
              <span className="stat-title">ออเดอร์ทั้งหมด</span>
            </div>
            <div className="stat-value">{safeNumber(data.orders?.total)}</div>
            <span className="stat-subtitle">เฉลี่ย {formatCurrency(data.orders?.average)}/ออเดอร์</span>
          </div>
           {/* [🌟 COLOR ADDED] */}
          <div className="stat-card" style={{ background: '#faf5ff' }}>
            <div className="stat-header">
              <div className="stat-icon-lucide" style={{ color: '#8b5cf6' }}><Users size={20} /></div>
              <span className="stat-title">ผู้ใช้ทั้งหมด</span>
            </div>
            <div className="stat-value">{safeNumber(data.users?.total)}</div>
            <span className="stat-subtitle">🛍️ ลูกค้า: {safeNumber(data.users?.customers)}</span>
          </div>
           {/* [🌟 COLOR ADDED] */}
          <div className="stat-card" style={{ background: '#fffbeb' }}>
            <div className="stat-header">
              <div className="stat-icon-lucide" style={{ color: '#f59e0b' }}><Package size={20} /></div>
              <span className="stat-title">สินค้าทั้งหมด</span>
            </div>
            <div className="stat-value">{safeNumber(data.products?.total)}</div>
            <span className="stat-subtitle">⚠️ ใกล้หมด: {safeNumber(data.products?.lowStock)}</span>
          </div>
        </div>

        {/* Sales Trend Chart */}
        {data.salesTrend && data.salesTrend.length > 0 && (
          <div className="products-table-container" style={{ padding: '30px' }}>
             {/* [🌟 ICON ADDED] */}
            <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
              <TrendingUp size={22} className="section-icon"/>
              แนวโน้มยอดขาย ({data.salesTrend.length} เดือนที่ผ่านมา)
            </h3>
            <div style={{ display: 'flex', alignItems: 'end', gap: '15px', height: '200px', padding: '20px 0', borderTop: '1px solid #f1f5f9' }}>
              {data.salesTrend.map((item, index) => {
                const maxRevenue = Math.max(...data.salesTrend.map(d => d.revenue));
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 150 : 0;
                
                return (
                  <div key={index} title={`${item.month}: ${formatCurrency(item.revenue)}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: `${height}px`,
                      background: `linear-gradient(to top, #3b82f6, #1e40af)`,
                      borderRadius: '5px 5px 0 0',
                      marginBottom: '10px',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Metrics Summary */}
        {data.keyMetrics && (
          <div className="products-table-container" style={{ padding: '30px' }}>
             {/* [🌟 ICON ADDED] */}
            <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
              <BarChart3 size={22} className="section-icon"/>
              ตัวชี้วัดสำคัญ (Key Metrics)
            </h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value">{formatPercentage(data.keyMetrics.conversionRate)}</div>
                <span className="stat-title">อัตราการส่งมอบสำเร็จ</span>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value">{formatCurrency(data.keyMetrics.averageOrderValue)}</div>
                <span className="stat-title">ค่าเฉลี่ยต่อออเดอร์</span>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value">{formatPercentage(data.keyMetrics.customerRetentionRate)}</div>
                <span className="stat-title">อัตราลูกค้าใหม่</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 💰 Sales Report Component
  const SalesReport = () => {
    const data = reportData.sales;
    if (!data) return null;

    return (
      <div className="products-table-container">
        {data.summary && (
          <div className="stats-grid" style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
             {/* [🌟 COLOR ADDED] */}
            <div className="stat-card" style={{ background: '#fef2f2' }}>
              <div className="stat-header"><span className="stat-title">รายได้รวม</span></div>
              <div className="stat-value">{formatCurrency(data.summary.totalRevenue)}</div>
            </div>
             {/* [🌟 COLOR ADDED] */}
            <div className="stat-card" style={{ background: '#eff6ff' }}>
              <div className="stat-header"><span className="stat-title">ออเดอร์ทั้งหมด</span></div>
              <div className="stat-value">{safeNumber(data.summary.totalOrders)}</div>
            </div>
             {/* [🌟 COLOR ADDED] */}
            <div className="stat-card" style={{ background: '#ecfdf5' }}>
              <div className="stat-header"><span className="stat-title">เฉลี่ยต่อวัน</span></div>
              <div className="stat-value">{formatCurrency(data.summary.averageDaily)}</div>
            </div>
          </div>
        )}
        
        {data.salesData && data.salesData.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th style={{ textAlign: 'center' }}>ออเดอร์</th>
                <th style={{ textAlign: 'right' }}>รายได้</th>
                <th style={{ textAlign: 'right' }}>ค่าเฉลี่ย</th>
              </tr>
            </thead>
            <tbody>
              {data.salesData.map((day, index) => (
                <tr key={index}>
                  <td>{day._id.day}/{day._id.month}/{day._id.year}</td>
                  <td style={{ textAlign: 'center' }}>{safeNumber(day.orders)}</td>
                  <td style={{ textAlign: 'right', color: '#15803d', fontWeight: 'bold' }}>
                    {formatCurrency(day.revenue)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(day.avgOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><p>ไม่มีข้อมูลยอดขายในข่วงเวลานี้</p></div>
        )}
      </div>
    );
  };

  // 📦 Products Report Component
  const ProductsReport = () => {
    const data = reportData.products;
    if (!data) return null;

    return (
      <div className="dashboard-content">
        {/* Top Selling */}
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <Star size={22} className="section-icon" style={{ color: '#f59e0b' }}/>
            สินค้าขายดี Top {data.topSellingProducts.length}
          </h3>
          <table className="products-table">
            <thead><tr><th>#</th><th>สินค้า</th><th>จำนวนที่ขาย</th><th>รายได้รวม</th></tr></thead>
            <tbody>
              {data.topSellingProducts.map((product, index) => (
                <tr key={index}>
                  <td><strong>{index + 1}</strong></td>
                  <td>{product.productName}</td>
                  <td>{safeNumber(product.totalSold)} ชิ้น</td>
                  <td style={{ color: '#15803d', fontWeight: 'bold' }}>{formatCurrency(product.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Low Stock */}
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <AlertTriangle size={22} className="section-icon" style={{ color: '#dc2626' }}/>
            สินค้าใกล้หมด ({data.lowStockProducts.length} รายการ)
          </h3>
          <table className="products-table">
            <thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>คงเหลือ</th></tr></thead>
            <tbody>
              {data.lowStockProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td>{formatCurrency(product.price)}</td>
                  <td><span className="stock-status stock-low">{safeNumber(product.stock)} ชิ้น</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Category Performance */}
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <LayoutGrid size={22} className="section-icon"/>
            ประสิทธิภาพตามหมวดหมู่
          </h3>
          <table className="products-table">
            <thead><tr><th>หมวดหมู่</th><th>สินค้าทั้งหมด</th><th>สินค้าที่ใช้งาน</th><th>สต็อกรวม</th><th>ราคาเฉลี่ย</th></tr></thead>
            <tbody>
              {data.categoryPerformance.map((cat, index) => (
                <tr key={index}>
                  <td><strong>{cat._id || 'ไม่ระบุ'}</strong></td>
                  <td>{safeNumber(cat.totalProducts)}</td>
                  <td>{safeNumber(cat.activeProducts)}</td>
                  <td>{safeNumber(cat.totalStock)}</td>
                  <td>{formatCurrency(cat.averagePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 👥 Users Report Component
  const UsersReport = () => {
    const data = reportData.users;
    if (!data) return null;

    return (
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">ผู้ใช้ทั้งหมด</span></div>
            <div className="stat-value">{safeNumber(data.totalUsers)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">ผู้ใช้ที่มีออเดอร์ (Active)</span></div>
            <div className="stat-value">{safeNumber(data.activeUsersCount)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">อัตราผู้ใช้ที่ Active</span></div>
            <div className="stat-value">
              {safeNumber(data.activeUsersCount) > 0 && safeNumber(data.totalUsers) > 0
                ? formatPercentage((data.activeUsersCount / data.totalUsers) * 100)
                : '0%'
              }
            </div>
          </div>
        </div>
        
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <BadgePercent size={22} className="section-icon"/>
            การแบ่งสิทธิ์ผู้ใช้
          </h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {data.roleDistribution.map((role, index) => (
               /* [🌟 COLOR ADDED] */
              <div key={index} className="stat-card" style={{ background: role._id === 'admin' ? '#eff6ff' : '#f0fdf4' }}>
                <div className="stat-header"><span className="stat-title" style={{ textTransform: 'capitalize' }}>{role._id}</span></div>
                <div className="stat-value">{safeNumber(role.count)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 🛒 Orders Report Component
  const OrdersReport = () => {
    const data = reportData.orders;
    if (!data) return null;

    // [🌟 ICONS ADDED]
    const statusIcons = {
      pending: <Clock size={16} style={{ color: '#f59e0b' }}/>,
      confirmed: <CheckCircle size={16} style={{ color: '#3b82f6' }}/>,
      processing: <Package size={16} style={{ color: '#8b5cf6' }}/>,
      shipped: <Truck size={16} style={{ color: '#06b6d4' }}/>,
      delivered: <PackageCheck size={16} style={{ color: '#10b981' }}/>,
      cancelled: <Ban size={16} style={{ color: '#ef4444' }}/>,
    };

    // [🌟 ICONS ADDED]
    const paymentIcons = {
      pending: <Clock size={16} style={{ color: '#f59e0b' }}/>,
      paid: <CheckCircle size={16} style={{ color: '#10b981' }}/>,
      failed: <XCircle size={16} style={{ color: '#ef4444' }}/>,
      refunded: <Ban size={16} style={{ color: '#6b7280' }}/>,
    };

    return (
      <div className="dashboard-content">
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <ShoppingCart size={22} className="section-icon"/>
            สถานะออเดอร์
          </h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {data.statusDistribution.map((status, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  {statusIcons[status._id] || <ShoppingCart size={16} />}
                  <span className="stat-title" style={{ textTransform: 'capitalize' }}>{status._id}</span>
                </div>
                <div className="stat-value">{safeNumber(status.count)}</div>
                <span className="stat-subtitle">{formatCurrency(status.totalValue)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="products-table-container" style={{ padding: '30px' }}>
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ margin: '0 0 25px 0' }}>
            <DollarSign size={22} className="section-icon"/>
            สถานะการชำระเงิน
          </h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {data.paymentDistribution.map((payment, index) => (
               <div key={index} className="stat-card">
                <div className="stat-header">
                  {paymentIcons[payment._id] || <DollarSign size={16} />}
                  <span className="stat-title" style={{ textTransform: 'capitalize' }}>{payment._id}</span>
                </div>
                <div className="stat-value">{safeNumber(payment.count)}</div>
                <span className="stat-subtitle">{formatCurrency(payment.totalValue)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="products-table-container">
           {/* [🌟 ICON ADDED] */}
          <h3 className="recent-activity" style={{ padding: '30px 30px 0' }}>
            <CalendarDays size={22} className="section-icon"/>
            แนวโน้มออเดอร์รายวัน (30 วันล่าสุด)
          </h3>
          <table className="products-table">
            <thead><tr><th>วันที่</th><th style={{ textAlign: 'center' }}>ออเดอร์</th><th style={{ textAlign: 'right' }}>รายได้</th></tr></thead>
            <tbody>
              {data.dailyOrders.slice(-30).map((day, index) => (
                 <tr key={index}>
                  <td>{day._id.day}/{day._id.month}/{day._id.year}</td>
                  <td style={{ textAlign: 'center' }}>{safeNumber(day.orders)}</td>
                  <td style={{ textAlign: 'right', color: '#15803d', fontWeight: 'bold' }}>{formatCurrency(day.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // --- Main Render ---

  return (
    <div className="reports-manager">
      
      {/* 🔥 Reports Header (Using AdminPanel.css classes) */}
      <div className="manager-header">
        <div>
          <h2>
             {/* [🌟 ICON ADDED] */}
            <ChartNoAxesCombined color="#3b82f6" size={28} />
            Reports & Analytics
          </h2>
          <p>Real-time analytics data system for Vip Store</p>
        </div>
        <button
          onClick={refreshReport}
          className="btn-primary"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
        </button>
      </div>

      {/* 📋 Report Navigation (Using AdminPanel.css classes) */}
      <div className="admin-nav">
         {/* [🌟 ICONS ADDED] */}
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={13} /> },
          { id: 'sales', label: 'Sales', icon: <DollarSign size={13} /> },
          { id: 'products', label: 'Products', icon: <Package size={13} /> },
          { id: 'users', label: 'Users', icon: <Users size={13} /> },
          { id: 'orders', label: 'Orders', icon: <ShoppingCart size={13} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`admin-tab ${activeReport === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 📅 Date Range Selector (for Sales report) */}
      {activeReport === 'sales' && (
        <div className="filters-section">
          <div className="filter-box">
             {/* [🌟 ICON ADDED] */}
            <Filter size={16} className="filter-icon" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="7days">7 วันที่ผ่านมา</option>
              <option value="30days">30 วันที่ผ่านมา</option>
              <option value="3months">3 เดือนที่ผ่านมา</option>
              <option value="1year">1 ปีที่ผ่านมา</option>
            </select>
          </div>
          {loading && <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: 0 }}></div>}
        </div>
      )}

      {/* ⚠️ Error Message */}
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 📊 Render Active Report Content */}
      <div className="report-content-area">
        {activeReport === 'overview' && <OverviewReport />}
        {activeReport === 'sales' && <SalesReport />}
        {activeReport === 'products' && <ProductsReport />}
        {activeReport === 'users' && <UsersReport />}
        {activeReport === 'orders' && <OrdersReport />}
      </div>

    </div>
  );
};

export default ReportsManager;