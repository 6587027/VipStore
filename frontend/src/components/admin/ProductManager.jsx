// frontend/src/components/admin/ProductManager.jsx

import React, { useState } from 'react';
import { productsAPI } from '../../services/api';
import AddProductForm from './AddProductForm';
import EditProductModal from './EditProductModal';

import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit2, 
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pencil,
  RefreshCw 
} from 'lucide-react';

const ProductManager = ({ products, onProductsChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  // ❌ REMOVED: const [showProductList, setShowProductList] = useState(true);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await productsAPI.delete(productId);
      onProductsChange(); // Refresh products list
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  // Get stock status
  const getStockStatus = (stock) => {
  if (stock === 0) return { 
    text: ' Out of Stock', 
    class: 'stock-out',
    icon: <XCircle size={13} />
  };
  if (stock < 10) return { 
    text: ' Low Stock', 
    class: 'stock-low',
    icon: <AlertCircle size={13} />
  };
  return { 
    text: ' In Stock', 
    class: 'stock-good',
    icon: <CheckCircle size={13} />
  };
};

  return (
    <div className="product-manager">
      {/* Header Actions */}
      <div className="manager-header">
        <div>
          <h2><Package size={33} className="section-icon" /> Product Management</h2>
          <p>Manage your store inventory</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} className="icon" />Add New Product
        </button>
      </div>

      {/* 👇 (2) MODIFIED: Filters and Search (New Search Box + Refresh Button) */}
      <div className="filters-section">
        <div className="search-box">  
          <Search size={18} className="search-icon" /> 
          <input
            type="text"
            placeholder="Search products..." // 👈 Removed emoji
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <button
          className="btn-primary"
          onClick={onProductsChange} // This calls fetchProducts from AdminDashboard
          disabled={loading}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3><AlertCircle size={24} className="icon" /> No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                    </td>
                    <td>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <p className="product-description">
                          {product.description.length > 50 
                            ? product.description.substring(0, 50) + '...'
                            : product.description
                          }
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {product.category}
                      </span>
                    </td>
                    <td>
                      <strong>{formatCurrency(product.price)}</strong>
                    </td>
                    <td>
                      <span className="stock-count">
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`stock-status ${stockStatus.class}`}>
                        {stockStatus.icon}
                        {stockStatus.text}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={loading}
                          title="Delete Product"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Form Modal */}
      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            onProductsChange();
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            onProductsChange();
          }}
        />
      )}
    </div>
  );
};

export default ProductManager;