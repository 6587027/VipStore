// frontend/src/components/admin/ReportsManager.jsx

import React, { useState, useEffect } from 'react';
import { 
  getReportsOverview, 
  getSalesReports, 
  getProductsReports, 
  getUsersReports, 
  getOrdersReports 
} from '../../services/api';

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
    if (reportData.overview) { // Only fetch if initial data is loaded
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
    if (reportType === 'overview') return; // Overview already loaded
    
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

  // 📅 Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 🎨 Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6', 
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // 🔢 Safe number formatting
  const safeNumber = (value, defaultValue = 0) => {
    return typeof value === 'number' ? value : defaultValue;
  };

  // 🚀 Loading State
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '1.2rem', fontWeight: '600' }}>
          📊 กำลังโหลดรายงาน...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // ❌ Error State
  if (error && !reportData.overview) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#dc2626'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 16px', color: '#dc2626' }}>เกิดข้อผิดพลาด</h3>
        <p style={{ margin: '0 0 24px', color: '#6b7280' }}>{error}</p>
        <button
          onClick={fetchInitialData}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* 🔥 Reports Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                📊 Reports & Analytics
              </h1>
              <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: '0.9' }}>
                📈 ข้อมูลการวิเคราะห์แบบ Real-time 
              </p>
            </div>
            <button
              onClick={refreshReport}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              🔄 รีเฟรช
            </button>
          </div>
        </div>

        {/* 📋 Report Navigation */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'sales', label: '💰 Sales', icon: '💰' },
            { id: 'products', label: '📦 Products', icon: '📦' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'orders', label: '🛒 Orders', icon: '🛒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '10px',
                background: activeReport === tab.id 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'white',
                color: activeReport === tab.id ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 📅 Date Range Selector (for Sales report) */}
        {activeReport === 'sales' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>📅 ช่วงเวลา:</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  padding: '8px 15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="7days">7 วันที่ผ่านมา</option>
                <option value="30days">30 วันที่ผ่านมา</option>
                <option value="3months">3 เดือนที่ผ่านมา</option>
                <option value="1year">1 ปีที่ผ่านมา</option>
              </select>
            </div>
          </div>
        )}

        {/* ⚠️ Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 📊 Overview Dashboard */}
        {activeReport === 'overview' && reportData.overview && (
          <div style={{ display: 'grid', gap: '25px' }}>
            
            {/* 🔥 Key Metrics Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Revenue Card */}
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(255,107,107,0.3)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💰</div>
                <h3 style={{ margin: '0 0 10px 0' }}>รายได้รวม</h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {formatCurrency(reportData.overview.revenue?.total)}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '5px' }}>
                  📈 วันนี้: {formatCurrency(reportData.overview.revenue?.today)}
                </div>
              </div>

              {/* Orders Card */}
              <div style={{
                background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(116,185,255,0.3)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
                <h3 style={{ margin: '0 0 10px 0' }}>ออเดอร์ทั้งหมด</h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {safeNumber(reportData.overview.orders?.total)}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '5px' }}>
                  ค่าเฉลี่ย {formatCurrency(reportData.overview.orders?.average)}/ออเดอร์
                </div>
              </div>

              {/* Users Card */}
              <div style={{
                background: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(85,163,255,0.3)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                <h3 style={{ margin: '0 0 10px 0' }}>ผู้ใช้ทั้งหมด</h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {safeNumber(reportData.overview.users?.total)}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '5px' }}>
                  👨‍💼 Admin: {safeNumber(reportData.overview.users?.admins)} | 
                  🛍️ ลูกค้า: {safeNumber(reportData.overview.users?.customers)}
                </div>
              </div>

              {/* Products Card */}
              <div style={{
                background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(0,184,148,0.3)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                <h3 style={{ margin: '0 0 10px 0' }}>สินค้าทั้งหมด</h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {safeNumber(reportData.overview.products?.total)}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '5px' }}>
                  ⚠️ สินค้าใกล้หมด {safeNumber(reportData.overview.products?.lowStock)} รายการ
                </div>
              </div>
            </div>

            {/* 📈 Sales Trend Chart */}
            {reportData.overview.salesTrend && reportData.overview.salesTrend.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0', fontSize: '20px' }}>
                  📈 แนวโน้มยอดขาย ({reportData.overview.salesTrend.length} เดือนที่ผ่านมา)
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'end', 
                  gap: '15px', 
                  height: '200px',
                  padding: '20px 0'
                }}>
                  {reportData.overview.salesTrend.map((data, index) => {
                    const maxRevenue = Math.max(...reportData.overview.salesTrend.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 150 : 0;
                    
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{
                          width: '40px',
                          height: `${height}px`,
                          background: `linear-gradient(to top, #667eea, #764ba2)`,
                          borderRadius: '5px 5px 0 0',
                          marginBottom: '10px',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatCurrency(data.revenue)}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🎯 Key Metrics Summary */}
            {reportData.overview.keyMetrics && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0', fontSize: '20px' }}>🎯 ตัวชี้วัดสำคัญ</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {formatPercentage(reportData.overview.keyMetrics.conversionRate)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>อัตราการส่งมอบสำเร็จ</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {formatCurrency(reportData.overview.keyMetrics.averageOrderValue)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>ค่าเฉลี่ยต่อออเดอร์</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {formatPercentage(reportData.overview.keyMetrics.customerRetentionRate)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>อัตราลูกค้าใหม่</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 💰 Sales Report */}
        {activeReport === 'sales' && reportData.sales && (
          <div style={{ display: 'grid', gap: '25px' }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 25px 0' }}>💰 รายงานยอดขาย ({dateRange})</h3>
              
              {reportData.sales.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {formatCurrency(reportData.sales.summary.totalRevenue)}
                    </div>
                    <div style={{ fontSize: '14px', opacity: '0.9' }}>รายได้รวม</div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {safeNumber(reportData.sales.summary.totalOrders)}
                    </div>
                    <div style={{ fontSize: '14px', opacity: '0.9' }}>ออเดอร์ทั้งหมด</div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {formatCurrency(reportData.sales.summary.averageDaily)}
                    </div>
                    <div style={{ fontSize: '14px', opacity: '0.9' }}>เฉลี่ยต่อวัน</div>
                  </div>
                </div>
              )}

              {/* Sales Trend Data */}
              {reportData.sales.salesData && reportData.sales.salesData.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 20px 0' }}>📊 รายละเอียดยอดขายรายวัน</h4>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>วันที่</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>ออเดอร์</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>รายได้</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>ค่าเฉลี่ย</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.sales.salesData.slice(0, 10000).map((day, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px' }}>
                              {day._id.day}/{day._id.month}/{day._id.year}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {safeNumber(day.orders)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                              {formatCurrency(day.revenue)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {formatCurrency(day.avgOrderValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📦 Products Report */}
        {activeReport === 'products' && reportData.products && (
          <div style={{ display: 'grid', gap: '25px' }}>
            
            {/* Top Selling Products */}
            {reportData.products.topSellingProducts && reportData.products.topSellingProducts.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>🔥 สินค้าขายดี Top {reportData.products.topSellingProducts.length}</h3>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  {reportData.products.topSellingProducts.map((product, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          background: `linear-gradient(135deg, #667eea, #764ba2)`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{product.productName}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            ขายได้ {safeNumber(product.totalSold)} ชิ้น | {safeNumber(product.orderCount)} ออเดอร์
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#27ae60' }}>
                          {formatCurrency(product.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Alert */}
            {reportData.products.lowStockProducts && reportData.products.lowStockProducts.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>⚠️ สินค้าใกล้หมด ({reportData.products.lowStockProducts.length} รายการ)</h3>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  {reportData.products.lowStockProducts.map((product, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#fff3cd',
                      borderRadius: '8px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          หมวด: {product.category} | ราคา: {formatCurrency(product.price)}
                        </div>
                      </div>
                      <span style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        เหลือ {safeNumber(product.stock)} ชิ้น
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Performance */}
            {reportData.products.categoryPerformance && reportData.products.categoryPerformance.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>📊 ประสิทธิภาพตามหมวดหมู่</h3>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  {reportData.products.categoryPerformance.map((category, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          {category._id || 'ไม่ระบุหมวดหมู่'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          สินค้าทั้งหมด: {safeNumber(category.totalProducts)} | 
                          ใช้งาน: {safeNumber(category.activeProducts)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#374151' }}>
                          สต็อก: {safeNumber(category.totalStock)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          ราคาเฉลี่ย: {formatCurrency(category.averagePrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 👥 Users Report */}
        {activeReport === 'users' && reportData.users && (
          <div style={{ display: 'grid', gap: '25px' }}>
            
            {/* User Statistics Cards */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 25px 0' }}>👥 สถิติผู้ใช้งาน</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {safeNumber(reportData.users.totalUsers)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>ผู้ใช้ทั้งหมด</div>
                </div>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {safeNumber(reportData.users.activeUsersCount)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>ผู้ใช้ที่มีออเดอร์</div>
                </div>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {safeNumber(reportData.users.activeUsersCount) > 0 && safeNumber(reportData.users.totalUsers) > 0
                      ? formatPercentage((reportData.users.activeUsersCount / reportData.users.totalUsers) * 100)
                      : '0%'
                    }
                  </div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>อัตราผู้ใช้ที่ Active</div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            {reportData.users.roleDistribution && reportData.users.roleDistribution.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>🔑 การแบ่งสิทธิ์ผู้ใช้</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {reportData.users.roleDistribution.map((role, index) => (
                    <div key={index} style={{
                      background: role._id === 'admin' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                        {role._id === 'admin' ? '👨‍💼' : '🛍️'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {safeNumber(role.count)}
                      </div>
                      <div style={{ fontSize: '14px', opacity: '0.9' }}>
                        {role._id === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 🛒 Orders Report */}
        {activeReport === 'orders' && reportData.orders && (
          <div style={{ display: 'grid', gap: '25px' }}>
            
            {/* Order Status Distribution */}
            {reportData.orders.statusDistribution && reportData.orders.statusDistribution.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>🛒 สถานะออเดอร์</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  {reportData.orders.statusDistribution.map((status, index) => (
                    <div key={index} style={{
                      background: getStatusColor(status._id),
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {safeNumber(status.count)}
                      </div>
                      <div style={{ fontSize: '14px', opacity: '0.9', textTransform: 'capitalize' }}>
                        {status._id === 'pending' && 'รอดำเนินการ'}
                        {status._id === 'confirmed' && 'ยืนยันแล้ว'}
                        {status._id === 'processing' && 'กำลังจัดเตรียม'}
                        {status._id === 'shipped' && 'จัดส่งแล้ว'}
                        {status._id === 'delivered' && 'ส่งสำเร็จ'}
                        {status._id === 'cancelled' && 'ยกเลิก'}
                      </div>
                      <div style={{ fontSize: '12px', opacity: '0.8', marginTop: '5px' }}>
                        {formatCurrency(status.totalValue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Status Distribution */}
            {reportData.orders.paymentDistribution && reportData.orders.paymentDistribution.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>💳 สถานะการชำระเงิน</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  {reportData.orders.paymentDistribution.map((payment, index) => {
                    const paymentColors = {
                      pending: '#f59e0b',
                      paid: '#10b981',
                      failed: '#ef4444',
                      refunded: '#6b7280'
                    };
                    
                    return (
                      <div key={index} style={{
                        background: paymentColors[payment._id] || '#6b7280',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {safeNumber(payment.count)}
                        </div>
                        <div style={{ fontSize: '14px', opacity: '0.9' }}>
                          {payment._id === 'pending' && 'รอชำระ'}
                          {payment._id === 'paid' && 'ชำระแล้ว'}
                          {payment._id === 'failed' && 'ชำระไม่สำเร็จ'}
                          {payment._id === 'refunded' && 'คืนเงินแล้ว'}
                        </div>
                        <div style={{ fontSize: '12px', opacity: '0.8', marginTop: '5px' }}>
                          {formatCurrency(payment.totalValue)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Orders Trend */}
            {reportData.orders.dailyOrders && reportData.orders.dailyOrders.length > 0 && (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0' }}>📊 แนวโน้มออเดอร์รายวัน (30 วันที่ผ่านมา)</h3>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>วันที่</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>ออเดอร์</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>รายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.orders.dailyOrders.slice(-10).map((day, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>
                            {day._id.day}/{day._id.month}/{day._id.year}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {safeNumber(day.orders)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                            {formatCurrency(day.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 🎉 Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '16px' }}>
            📊 <strong>Vip Store Dynamic Reports Dashboard</strong> 
            <br />
            <span style={{ fontSize: '14px' }}>
              ระบบรายงานแบบ Real-time สำหรับการวิเคราะห์ข้อมูลธุรกิจ
            </span>
          </p>
          <div style={{ marginTop: '10px', fontSize: '12px', opacity: '0.7' }}>
            สถานะ: {reportData.overview ? '🟢 เชื่อมต่อสำเร็จ' : '🔴 ไม่สามารถเชื่อมต่อได้'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsManager;