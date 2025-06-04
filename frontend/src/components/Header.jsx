import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🛍️ Vip Store</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn-secondary">
              🛒 ตะกร้า (0)
            </button>
            <button className="btn-primary">
              ⚙️ Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;