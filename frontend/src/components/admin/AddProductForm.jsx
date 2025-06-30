// frontend/src/components/admin/AddProductForm.jsx - Updated with SimpleShareLinkUpload
import React, { useState } from 'react';
import { productsAPI } from '../../services/api';
import SimpleShareLinkUpload from './SimpleShareLinkUpload';

const AddProductForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Electronics',
    'Clothing', 
    'Books',
    'Home',
    'Sports',
    'Beauty',
    'Other'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image selection from SimpleShareLinkUpload component
  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
    
    // Clear image error
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Product image is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      await productsAPI.create(productData);
      alert('✅ Product added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('❌ Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content add-product-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>➕ Add New Product</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-product-form">
          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="name">📝 Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={errors.name ? 'error' : ''}
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">📄 Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
              className={errors.description ? 'error' : ''}
              disabled={loading}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Price and Stock Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">💰 Price (THB) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.price ? 'error' : ''}
                disabled={loading}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stock">📦 Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={errors.stock ? 'error' : ''}
                disabled={loading}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">🏷️ Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* ShareLink Upload Section */}
          <div className="form-group">
            <label>🖼️ Product Image * </label>
            <SimpleShareLinkUpload
              onImageSelect={handleImageSelect}
              currentImage={formData.image}
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* New Product Info */}
          <div className="new-product-info">
            <h4>📋 New Product Summary</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Product Name:</span>
                <span className="info-value">{formData.name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">{formData.category || 'Not selected'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Price:</span>
                <span className="info-value">
                  {formData.price ? `฿${parseFloat(formData.price).toLocaleString()}` : 'Not set'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Stock:</span>
                <span className="info-value">{formData.stock || '0'} units</span>
              </div>
              <div className="info-item">
                <span className="info-label">Image:</span>
                <span className="info-value">
                  {formData.image ? '✅ Ready' : '❌ Not uploaded'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Adding Product...' : '✅ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;