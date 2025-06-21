// frontend/src/components/ProductCard.jsx - FIXED with Product Click Support
import React from 'react';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product, onProductClick }) => {
  // Format price in Thai Baht
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // ✅ **Handle Product Click**
  const handleProductClick = (e) => {
    // ป้องกันการ click ผ่านไปยัง parent เมื่อคลิกปุ่ม Add to Cart
    if (e.target.closest('.add-to-cart-button') || e.target.closest('button')) {
      return; // หยุดการทำงานถ้าคลิกปุ่ม
    }

    console.log('🖱️ ProductCard - Product clicked:', product.name, 'ID:', product._id);
    
    if (onProductClick && typeof onProductClick === 'function') {
      onProductClick(product._id);
    } else {
      console.warn('⚠️ onProductClick prop not provided or not a function');
    }
  };

  // Check if product is out of stock or low stock
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  return (
    <div 
      className="product-card"
      onClick={handleProductClick} // ✅ **เพิ่ม onClick handler**
      style={{
        cursor: 'pointer', // ✅ **แสดงว่าคลิกได้**
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        
        {/* Stock Status Badge */}
        {isOutOfStock && (
          <div className="stock-badge out-of-stock">
            สินค้าหมด
          </div>
        )}
        {isLowStock && (
          <div className="stock-badge low-stock">
            เหลือ {product.stock} ชิ้น
          </div>
        )}
        
        {/* Hover Overlay with "View Details" */}
        <div className="product-hover-overlay">
          <span className="view-details-text">
            👁️ ดูรายละเอียด
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Category Badge */}
        {product.category && (
          <div className="product-category">
            📦 {product.category}
          </div>
        )}

        {/* Product Name */}
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Product Description (if exists) */}
        {product.description && (
          <p className="product-description" title={product.description}>
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
        )}

        {/* Price */}
        <div className="product-price">
          {formatPrice(product.price)}
        </div>

        {/* Stock Info */}
       <div className="product-stock">
  {isOutOfStock ? (
    <span className="stock-status out-of-stock">❌ สินค้าหมด</span>
  ) : isLowStock ? (
    <span className="stock-status low-stock">⚠️ เหลือน้อย</span>
  ) : (
    <span className="stock-status in-stock">✅ มีสินค้า {product.stock} ชิ้น</span>  
  )}
</div>

        {/* Add to Cart Button */}
        <div className="product-actions">
          <AddToCartButton 
            product={product}
            disabled={isOutOfStock}
            className="add-to-cart-button" // ✅ **เพิ่ม class สำหรับ prevent click**
          />
        </div>
      </div>

      {/* CSS สำหรับ ProductCard */}
      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f8fafc;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        /* ✅ **Hover Overlay เพื่อแสดงว่าคลิกได้** */
        .product-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .product-hover-overlay {
          opacity: 1;
        }

        .view-details-text {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.3s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .stock-badge.out-of-stock {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .stock-badge.low-stock {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .product-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-category {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #3730a3;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
          border: 1px solid #a5b4fc;
        }

        .product-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: #059669;
          text-shadow: 0 1px 2px rgba(5, 150, 105, 0.1);
        }

        .product-stock {
          margin-bottom: 8px;
        }

        .stock-status {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .stock-status.in-stock {
          background: #dcfce7;
          color: #166534;
        }

        .stock-status.low-stock {
          background: #fef3c7;
          color: #92400e;
        }

        .stock-status.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
        }

        .product-actions {
          margin-top: auto;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .product-image-container {
            height: 160px;
          }

          .product-info {
            padding: 16px;
            gap: 10px;
          }

          .product-name {
            font-size: 1rem;
          }

          .product-price {
            font-size: 1.2rem;
          }

          .view-details-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .product-image-container {
            height: 140px;
          }

          .product-info {
            padding: 14px;
            gap: 8px;
          }

          .product-name {
            font-size: 0.95rem;
            -webkit-line-clamp: 2;
          }

          .product-price {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;