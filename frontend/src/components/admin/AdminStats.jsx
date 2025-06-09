// frontend/src/components/admin/AdminStats.jsx
import React from 'react';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: '✅',
      color: '#10b981',
      bgColor: '#f0fdf4'
    },
    {
      title: 'Categories',
      value: stats.categories.length,
      icon: '🏷️',
      color: '#8b5cf6',
      bgColor: '#faf5ff'
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStock,
      icon: '⚠️',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    }
  ];

  return (
    <div className="admin-stats">
      <h3>📊 Overview</h3>
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{
            backgroundColor: stat.bgColor,
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-title">{stat.title}</span>
            </div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            {stat.title === 'Low Stock Alert' && stat.value > 0 && (
              <div className="stat-subtitle">
                {stat.value} products need restocking
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Categories Breakdown */}
      {stats.categories.length > 0 && (
        <div className="categories-breakdown">
          <h4>📁 Categories</h4>
          <div className="categories-list">
            {stats.categories.map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;