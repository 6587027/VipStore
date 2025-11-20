# 🛒 VipStore - Professional E-commerce Platform

A modern, production-ready full-stack e-commerce platform built with React and Node.js. Complete with authentication, shopping cart, order management, admin dashboard, and real-time chat system.

**🌐 Live Demo**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)

## 🌟 Key Features

### 🛍️ Customer Features
- **Product Catalog** - Responsive grid layout with image gallery and search
- **Shopping Cart** - Real-time stock validation with localStorage persistence
- **Checkout System** - Complete order flow with address validation
- **Payment Options** - QR Code and Bank Transfer methods
- **Order Tracking** - View order status and history
- **Live Chat** - Real-time customer support with Socket.IO
- **User Profile** - Profile management and password change requests
- **Favorites** - Save and manage favorite products
- **Announcements** - View important updates and promotions
- **Multi-language** - Thai and English support

### 👨‍💼 Admin Features
- **Analytics Dashboard** - Real-time statistics and revenue tracking
- **User Management** - Complete CRUD operations with role control
- **Product Management** - Inventory control with image upload
- **Order Management** - Track and update order status
- **Chat Management** - Handle multiple customer conversations
- **Reports** - Dynamic analytics from MongoDB aggregation
- **Announcements** - Create and manage system-wide notifications
- **Password Requests** - Review and approve password changes

### 💬 Real-time Chat System
- Customer and admin interfaces
- Instant messaging with Socket.IO
- Typing indicators and message history
- Unread message tracking
- Mobile-optimized design

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework with Hooks and Context API
- **Vite** - Build tool and development server
- **Socket.IO Client** - Real-time communication
- **i18next** - Internationalization (Thai/English)
- **Axios** - HTTP client
- **CSS3** - Custom responsive styling

### Backend
- **Node.js + Express.js** - Server framework
- **Socket.IO** - WebSocket server
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens

### Deployment
- **Frontend**: Vercel (Auto-deploy)
- **Backend**: Render (Cloud hosting)
- **Database**: MongoDB Atlas (Singapore region)

## 📦 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/6587027/VipStore.git
cd VipStore

# Backend setup
cd backend
npm install
# Create .env file with: MONGODB_URI, PORT, JWT_SECRET, SOCKET_PORT
npm start

# Frontend setup
cd ../frontend
npm install
# Create .env.local with: VITE_API_URL, VITE_SOCKET_URL
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your_jwt_secret_key
SOCKET_PORT=3002
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3002
```

## 📁 Project Structure

```
VipStore/
├── backend/
│   ├── models/
│   │   ├── Announcement.js
│   │   ├── ChatMessage.js
│   │   ├── ChatRoom.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── announcement.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── reports.js
│   ├── socket/
│   │   └── chatSocket.js
│   ├── utils/
│   │   └── dbMonitor.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddToCartButton.jsx
│   │   │   ├── Announcement.jsx
│   │   │   ├── CartModal.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── ProductFavoriteList.jsx
│   │   │   ├── ProductImageGallery.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductPreview.jsx
│   │   │   ├── UserProfileModal.jsx
│   │   │   ├── WelcomeAnimation.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AddProductForm.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminStats.jsx
│   │   │   │   ├── AnnouncementManager.jsx
│   │   │   │   ├── EditProductModal.jsx
│   │   │   │   ├── OrderManager.jsx
│   │   │   │   ├── ProductManager.jsx
│   │   │   │   ├── ReportsManager.jsx
│   │   │   │   ├── SimpleShareLinkUpload.jsx
│   │   │   │   └── UserManager.jsx
│   │   │   ├── chat/
│   │   │   │   ├── AdminChatTab.jsx
│   │   │   │   ├── ChatButton.jsx
│   │   │   │   ├── ChatModal.jsx
│   │   │   │   ├── ChatStatus.jsx
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── MessageList.jsx
│   │   │   ├── payment/
│   │   │   │   ├── PaymentChoiceModal.jsx
│   │   │   │   └── PaymentModal.jsx
│   │   │   ├── settings/
│   │   │   │   ├── CustomerSettings.jsx
│   │   │   │   ├── PaymentSettings.jsx
│   │   │   │   └── ProfileSettings.jsx
│   │   │   └── user/
│   │   │       └── PasswordRequestDashboard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socketClient.js
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── th.json
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── i18n.js
│   └── vite.config.js
│
└── README.md

Total: 20 directories, 95 files
```

## 🧪 Demo Access

**For demo credentials, contact the developer:**

**👨‍💻 Developer**: วิป (Phatra Wongsapsakul)  
**📧 Contact**: [vippersonalwebsite.vercel.app/contact](https://vippersonalwebsite.vercel.app/contact)

*Note: Please use Gmail accounts for contact requests*

## 🎯 Project Milestones

- [x] Product catalog with MongoDB integration
- [x] Authentication system with role-based access
- [x] Shopping cart with stock validation
- [x] Complete checkout flow
- [x] Admin dashboard and user management
- [x] Order management system
- [x] Real-time analytics dashboard
- [x] Mobile-responsive design
- [x] Real-time chat system (Socket.IO)
- [x] Payment integration
- [x] Settings and profile management
- [x] File upload system
- [x] Announcement system
- [x] Multi-language support (Thai/English)
- [x] Production deployment ✅

## 🏆 Technical Achievements

- **Full-Stack Development** - Complete MERN stack implementation
- **Real-time Systems** - Socket.IO WebSocket integration
- **Database Design** - MongoDB schema with relationships
- **Authentication** - JWT with role-based access control
- **State Management** - Context API and localStorage
- **Internationalization** - Multi-language support
- **Responsive Design** - Mobile-first approach
- **Production Deployment** - Live on Vercel + Render
- **Security** - Input validation and data protection

## 📞 Contact & Links

- **👨‍💻 Developer**: วิป (Phatra Wongsapsakul)
- **🎓 Institution**: Mahidol University - ICT Program (Year 4)
- **🌐 Portfolio**: [vippersonalwebsite.vercel.app](https://vippersonalwebsite.vercel.app/)
- **🛒 Live Demo**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)

## 📄 License

Educational portfolio project for learning and demonstration purposes.

---

**Made with ❤️ and ☕ by วิป**  
*© 2025 VipStore - Mahidol University ICT Program*