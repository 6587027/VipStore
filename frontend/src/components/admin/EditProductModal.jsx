// frontend/src/components/admin/EditProductModal.jsx
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';

const EditProductModal = ({ product, onClose, onSuccess }) => {
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

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        image: product.image || '',
        category: product.category || '',
        stock: product.stock?.toString() || ''
      });
    }
  }, [product]);

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
      newErrors.image = 'Image URL is required';
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

      await productsAPI.update(product._id, productData);
      alert('Product updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-product-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>✏️ Edit Product</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-product-form">
          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="edit-name">Product Name *</label>
            <input
              type="text"
              id="edit-name"
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
            <label htmlFor="edit-description">Description *</label>
            <textarea
              id="edit-description"
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
              <label htmlFor="edit-price">Price (THB) *</label>
              <input
                type="number"
                id="edit-price"
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
              <label htmlFor="edit-stock">Stock Quantity *</label>
              <input
                type="number"
                id="edit-stock"
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
            <label htmlFor="edit-category">Category *</label>
            <select
              id="edit-category"
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

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="edit-image">Image URL *</label>
            <input
              type="url"
              id="edit-image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={errors.image ? 'error' : ''}
              disabled={loading}
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
            
            {/* Image Preview */}
            {formData.image && !errors.image && (
              <div className="image-preview">
                <img 
                  src={formData.image} 
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setErrors(prev => ({
                      ...prev,
                      image: 'Invalid image URL'
                    }));
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                    if (errors.image === 'Invalid image URL') {
                      setErrors(prev => ({
                        ...prev,
                        image: ''
                      }));
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Current vs Updated Info */}
          <div className="update-info">
            <h4>📋 Update Summary</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Product ID:</span>
                <span className="info-value">{product._id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {new Date(product.updatedAt).toLocaleDateString()}
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
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Updating...' : '✅ Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;