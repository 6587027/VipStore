# 🛒 VipStore - Professional E-commerce Platform

A modern, production-ready full-stack e-commerce platform built with React and Node.js. Complete with authentication, shopping cart, order management, admin dashboard, and real-time chat system.

**🌐 Live Demo**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)

## 🌟 Project Highlights

- ✨ **Complete E-commerce Solution** - From product browsing to order completion
- 🔐 **Secure Authentication System** - Role-based access control (Customer/Admin)
- 🛒 **Advanced Shopping Cart** - Real-time stock validation & localStorage persistence
- 👨‍💼 **Professional Admin Panel** - Complete order, user, and product management
- 📊 **Real-time Analytics Dashboard** - Dynamic reports from live database
- 💬 **Live Chat System** - Real-time customer support with Socket.IO
- 💳 **Payment Integration** - Multiple payment methods (QR Code, Bank Transfer)
- ⚙️ **Settings Management** - Complete user profile and preferences system
- 📱 **Mobile-First Design** - Responsive across all devices
- 🚀 **Production-Ready Code** - Industry-standard architecture and best practices

## 🎯 Key Features

### 🛍️ Customer Experience
- 📱 **Responsive Product Catalog** - Modern grid layout with image gallery
- 🛒 **Smart Shopping Cart** - Add/remove items with real-time stock validation
- 📝 **Complete Checkout Flow** - Address form with validation and order confirmation
- 💳 **Multiple Payment Options** - QR Code payments, Bank transfers, and more
- 🔐 **User Authentication** - Secure login/register system with profile management
- 📦 **Order Tracking** - View order status and detailed history
- 💬 **Live Customer Support** - Real-time chat with admin support team
- ⚙️ **Profile Settings** - Complete user profile and preference management
- 🔑 **Password Management** - Secure password change request system
- 🎨 **Modern UI/UX** - Professional design with smooth animations
- 🖼️ **Product Image Gallery** - High-quality product images with zoom functionality
- 📋 **Detailed Product Information** - Comprehensive product details and specifications

### 👨‍💼 Admin Dashboard
- 📊 **Analytics Dashboard** - Real-time order statistics and revenue tracking
- 👥 **User Management** - Create, edit, delete users with role management
- 📦 **Product Management** - Full CRUD operations with image upload
- 📋 **Order Management** - Track, update, and manage all orders with status changes
- 📈 **Dynamic Reports** - Live analytics from MongoDB with category performance
- 💬 **Chat Management** - Real-time customer support dashboard
- 🔍 **Advanced Search & Filters** - Find users/orders quickly with multiple criteria
- 🔔 **Password Request System** - Review and approve/reject password change requests
- 📤 **File Upload System** - Manage product images and documents
- 🗑️ **Complete CRUD Operations** - Full create, read, update, delete functionality
- 📊 **Admin Statistics** - Comprehensive business metrics and KPIs

### 💬 Real-time Chat System
- **Customer Chat Interface** - Easy-to-use chat window for customer support
- **Admin Chat Dashboard** - Manage multiple customer conversations
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **Message History** - Persistent chat history across sessions
- **Typing Indicators** - Real-time typing status
- **Unread Message Tracking** - Smart notification system
- **Chat Status Management** - Online/offline status indicators
- **Mobile-optimized Chat** - Perfect chat experience on all devices

### 💳 Payment System
- **Multiple Payment Methods** - QR Code, Bank Transfer, Credit Card ready
- **Payment Choice Modal** - User-friendly payment method selection
- **Secure Payment Processing** - Industry-standard security practices
- **Payment Confirmation** - Complete payment verification system
- **Transaction History** - Detailed payment records and receipts

### ⚙️ Settings & Profile Management
- **User Profile Settings** - Complete profile customization
- **Password Management** - Secure password change with admin approval
- **Preference Management** - User settings and preferences
- **Account Security** - Advanced security options and settings

### 🔧 Technical Excellence
- 🏗️ **Scalable Architecture** - Component-based React design with clean separation
- 🔒 **Security Features** - Input validation, role-based access, stock restoration
- ⚡ **Performance Optimized** - Fast loading and smooth interactions
- 🔄 **Real-time Updates** - Instant UI synchronization with database
- 📱 **Cross-Device Compatible** - Works perfectly on desktop, tablet, mobile
- 🌐 **Production Deployment** - Live on Vercel (Frontend) + Render (Backend)
- 🔌 **WebSocket Integration** - Real-time chat and notifications
- 📁 **File Management** - Secure file upload and management system

## 🛠️ Enhanced Tech Stack

### Frontend Stack
- **React 18** - Modern UI Framework with Hooks and Context API
- **Vite** - Lightning-fast build tool and development server
- **Context API** - Global state management (Auth + Cart + Chat)
- **Socket.IO Client** - Real-time WebSocket communication
- **Axios** - HTTP client for API calls
- **CSS3** - Custom responsive styling with modern design system
- **React Router** - Client-side routing with protected routes
- **File Upload Components** - Custom file handling and preview

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB Atlas** - Cloud NoSQL database (Singapore region)
- **Mongoose ODM** - Object modeling for MongoDB
- **RESTful API** - Standard HTTP methods and status codes
- **WebSocket Server** - Real-time chat and notifications
- **File Upload Middleware** - Secure file handling
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

### Database Schema
- **Users Collection** - Authentication, roles, and profile management
- **Products Collection** - Product catalog with inventory tracking
- **Orders Collection** - Complete order tracking with status management
- **ChatRooms Collection** - Chat room management and metadata
- **ChatMessages Collection** - Real-time message storage and history
- **PasswordRequests Collection** - Secure password change request system

### Real-time Features
- **Socket.IO Integration** - WebSocket server and client implementation
- **Chat System** - Customer support with admin dashboard
- **Live Notifications** - Real-time order and chat notifications
- **Typing Indicators** - Real-time typing status in chat
- **Online Status** - User presence and activity tracking

### Deployment & DevOps
- **Frontend**: Vercel (Auto-deployment from GitHub)
- **Backend**: Render (Container deployment with auto-deploy)
- **Database**: MongoDB Atlas (Cloud database, Singapore region)
- **File Storage**: Integrated file upload and management
- **Version Control**: Git + GitHub
- **Environment**: Production-ready configuration

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git version control
- MongoDB Atlas account (free)

### 🔄 Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/6587027/VipStore.git
cd VipStore
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
SOCKET_PORT=3002
```

Start backend server:
```bash
npm start
# Server running on localhost with secure configuration
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file in frontend directory (for local development):
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3002
```

Start frontend development server:
```bash
npm run dev
# App running on http://localhost:5173
```
---

### 🧪 System Access

**For demo access, please contact the developer:**

**👨‍💻 Developer Contact**: วิป (Phatra Wongsapsakul)  
**📧 Contact Form**: [https://vippersonalwebsite.vercel.app/contact](https://vippersonalwebsite.vercel.app/contact)  
**Note**: Please use Gmail accounts only for contact requests

*Demo accounts are provided upon request for legitimate testing and evaluation purposes.*

---

## 🌐 API Documentation

### Security Notice
**API endpoints and backend URLs are not publicly disclosed for security reasons. For development and integration purposes, please contact the developer through the official contact form.**

### Authentication System
- Secure user login and registration
- Role-based access control (Admin/Customer)
- JWT token-based authentication
- Session management and timeout
- Password encryption and validation

### Core Features
- **Product Management**: Complete CRUD operations for products
- **Order Processing**: Full order lifecycle management
- **User Management**: Comprehensive user administration
- **Real-time Chat**: Customer support system
- **Analytics & Reports**: Business intelligence dashboard
- **Payment Processing**: Multiple payment method support
- **File Management**: Secure upload and storage system

### WebSocket Events
- Real-time messaging and notifications
- Chat system with typing indicators
- Live order status updates
- User presence and activity tracking

## 📁 Complete Project Architecture 
Last Updated: 25 October 2025 

```
VipStore/
├── README.md                                # Project documentation
│
├── backend/                                 # Node.js + Express Backend
│   ├── models/                             # Database Models (MongoDB)
│   │   ├── ChatMessage.js                  # Chat message schema
│   │   ├── ChatRoom.js                     # Chat room schema
│   │   ├── Order.js                        # Order schema with status tracking
│   │   ├── Product.js                      # Product schema with stock management
│   │   └── User.js                         # User schema with roles
│   ├── routes/                             # API Route Handlers
│   │   ├── auth.js                         # Authentication & user management
│   │   ├── chat.js                         # Chat system API endpoints
│   │   ├── orders.js                       # Order management system
│   │   ├── products.js                     # Product CRUD operations
│   │   └── reports.js                      # Analytics and reporting system
│   ├── socket/                             # Real-time Communication
│   │   └── chatSocket.js                   # Socket.IO chat implementation
│   ├── utils/                              # Utility Functions
│   │   └── dbMonitor.js                    # Database monitoring utilities
│   ├── server.js                           # Express server entry point
│   ├── package.json                        # Backend dependencies
│   ├── package-lock.json                   # Dependency lock file
│   └── .env                                # Environment variables (not tracked)
│
├── frontend/                                # React + Vite Frontend
│   ├── public/                             # Static Assets
│   │   ├── VipStoreLogo.png                # Store logo (PNG)
│   │   ├── VipStoreLogo.svg                # Store logo (SVG)
│   │   └── vite.svg                        # Vite logo
│   ├── src/                                # Source Code
│   │   ├── components/                     # React Components
│   │   │   ├── AddToCartButton.jsx         # Smart add to cart with validation
│   │   │   ├── AddToCartButton.css         # Add to cart styling
│   │   │   ├── CartModal.jsx               # Complete shopping cart interface
│   │   │   ├── CartModal.css               # Cart modal styling
│   │   │   ├── Header.jsx                  # Navigation with cart badge
│   │   │   ├── LoginForm.jsx               # Authentication modal
│   │   │   ├── LoginForm.css               # Login form styling
│   │   │   ├── LogoutModal.jsx             # Logout confirmation
│   │   │   ├── ProductCard.jsx             # Product display component
│   │   │   ├── ProductDetails.jsx          # Detailed product information
│   │   │   ├── ProductImageGallery.jsx     # Image gallery with zoom
│   │   │   ├── ProductList.jsx             # Product grid layout
│   │   │   ├── ProductPreview.jsx          # Product preview modal
│   │   │   ├── ProductPreview.css          # Product preview styling
│   │   │   ├── UserProfileModal.jsx        # User profile management
│   │   │   ├── WelcomeAnimation.jsx        # Welcome page animation
│   │   │   │
│   │   │   ├── admin/                      # Admin Panel Components
│   │   │   │   ├── AddProductForm.jsx      # Product creation form
│   │   │   │   ├── AdminDashboard.jsx      # Admin navigation hub
│   │   │   │   ├── AdminPanel.css          # Admin panel styling
│   │   │   │   ├── AdminStats.jsx          # Admin statistics dashboard
│   │   │   │   ├── EditProductModal.jsx    # Product editing interface
│   │   │   │   ├── OrderManager.jsx        # Order management with status
│   │   │   │   ├── ProductManager.jsx      # Product CRUD interface
│   │   │   │   ├── ReportsManager.jsx      # Real-time analytics dashboard
│   │   │   │   ├── SimpleShareLinkUpload.jsx  # File upload component
│   │   │   │   ├── SimpleShareLinkUpload.css  # File upload styling
│   │   │   │   └── UserManager.jsx         # Complete user management
│   │   │   │
│   │   │   ├── chat/                       # Live Chat System
│   │   │   │   ├── AdminChatTab.jsx        # Admin chat management interface
│   │   │   │   ├── AdminChatTab.css        # Admin chat styling
│   │   │   │   ├── ChatButton.jsx          # Floating chat button
│   │   │   │   ├── ChatButton.css          # Chat button styling
│   │   │   │   ├── ChatModal.jsx           # Customer chat interface
│   │   │   │   ├── ChatModal.css           # Chat modal styling
│   │   │   │   ├── ChatStatus.jsx          # Chat connection status
│   │   │   │   ├── ChatWindow.jsx          # Main chat window component
│   │   │   │   ├── MessageInput.jsx        # Message input with emoji
│   │   │   │   └── MessageList.jsx         # Message history display
│   │   │   │
│   │   │   ├── payment/                    # Payment System
│   │   │   │   ├── PaymentChoiceModal.jsx  # Payment method selection
│   │   │   │   ├── PaymentChoiceModal.css  # Payment choice styling
│   │   │   │   ├── PaymentModal.jsx        # Payment processing interface
│   │   │   │   └── PaymentModal.css        # Payment modal styling
│   │   │   │
│   │   │   ├── settings/                   # User Settings
│   │   │   │   ├── CustomerSettings.jsx    # User settings dashboard
│   │   │   │   ├── PaymentSettings.jsx     # Payment preferences
│   │   │   │   └── ProfileSettings.jsx     # Profile management
│   │   │   │
│   │   │   └── user/                       # User Management
│   │   │       └── PasswordRequestDashboard.jsx  # Password change requests
│   │   │
│   │   ├── context/                        # React Context API
│   │   │   ├── AuthContext.jsx             # Authentication state management
│   │   │   ├── CartContext.jsx             # Shopping cart state management
│   │   │   └── ChatContext.jsx             # Chat state management
│   │   │
│   │   ├── services/                       # API Services
│   │   │   ├── api.js                      # Complete API service layer
│   │   │   └── socketClient.js             # Socket.IO client implementation
│   │   │
│   │   ├── styles/                         # Global Styles
│   │   │   └── AdminPanel.css              # Admin panel global styles
│   │   │
│   │   ├── locales/                        # Internationalization (i18n)
│   │   │   ├── en.json                     # English translations
│   │   │   └── th.json                     # Thai translations
│   │   │
│   │   ├── assets/                         # Static Assets
│   │   │   └── react.svg                   # React logo
│   │   │
│   │   ├── App.jsx                         # Main application component
│   │   ├── App.css                         # Global application styles
│   │   ├── index.css                       # Global CSS and responsive design
│   │   ├── main.jsx                        # Application entry point
│   │   └── i18n.js                         # i18n configuration
│   │
│   ├── eslint.config.js                    # ESLint configuration
│   ├── index.html                          # HTML entry point
│   ├── package.json                        # Frontend dependencies
│   ├── package-lock.json                   # Dependency lock file
│   ├── postcss.config.js                   # PostCSS configuration
│   ├── tailwind.config.js                  # Tailwind CSS configuration
│   ├── vite.config.js                      # Vite build configuration
│   ├── .env.local                          # Local environment variables (not tracked)
│   └── README.md                           # Frontend documentation
│
├── .gitignore                              # Git ignore rules
├── .env.example                            # Environment variables template
├── package.json                            # Root package.json (if using workspaces)
└── package-lock.json                       # Root dependency lock file

📊 Project Statistics:
├── Total Directories: 20
├── Total Files: 88 (tracked)
├── Backend Files: 13
├── Frontend Files: 75
├── Configuration Files: 8
└── Documentation Files: 2

🔧 Technology Stack:
├── Frontend: React 18 + Vite + TailwindCSS
├── Backend: Node.js + Express.js
├── Database: MongoDB Atlas
├── Real-time: Socket.IO
├── State Management: Context API
├── Internationalization: i18next
└── Deployment: Vercel (Frontend) + Render (Backend)

📝 Hidden Files (Not Tracked by Git):
├── backend/.env                            # Backend environment variables
├── frontend/.env.local                     # Frontend environment variables
├── node_modules/                           # Dependencies (both root and subdirectories)
├── .DS_Store                               # macOS system files
├── frontend/dist/                          # Vite build output
└── backend/logs/                           # Server logs (if exists)

🌟 Key Features:
├── E-commerce Platform (Complete)
├── User Authentication & Authorization
├── Shopping Cart & Checkout System
├── Admin Dashboard & Management
├── Real-time Chat System (Socket.IO)
├── Order Management & Tracking
├── Analytics & Reporting Dashboard
├── Payment System Integration
├── Multi-language Support (Thai/English)
└── Responsive Mobile-First Design

```

## 🚀 Deployment Guide

### Production Environment
- **Frontend**: Deployed on Vercel with automatic deployment
- **Backend**: Secure cloud hosting with auto-scaling
- **Database**: MongoDB Atlas cloud database
- **Security**: Environment variables and secrets management

### Frontend Deployment (Vercel)
1. **Connect Repository**: Link GitHub repo to Vercel
2. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
3. **Environment Variables**: Configure through Vercel dashboard
4. **Auto-Deploy**: Automatic deployment on git push

### Backend Deployment
1. **Cloud Hosting Platform**: Professional hosting service
2. **Build Configuration**: Automated build and deployment
3. **Environment Management**: Secure environment variable handling
4. **Auto-Deploy**: Continuous integration/deployment pipeline

### Database Setup (MongoDB Atlas)
1. **Create Cluster**: Free tier cloud database
2. **Network Security**: Configured IP whitelisting
3. **User Authentication**: Database user with appropriate permissions
4. **Connection Security**: Encrypted connection strings

<!-- ## 📊 Enhanced Development Statistics

- **⏱️ Development Time**: ~8 weeks intensive development
- **📝 Lines of Code**: 6000+ lines across frontend/backend
- **🎨 Components**: 30+ React components
- **🔌 API Endpoints**: 35+ RESTful endpoints
- **💬 Real-time Features**: Socket.IO chat system with 10+ events
- **📱 Responsive Breakpoints**: 4 device sizes (mobile, tablet, desktop, large)
- **🧪 Test Scenarios**: 50+ user flow tests
- **📊 Database Collections**: 5 with complex relationships
- **🔐 Security Features**: Role-based access, input validation, stock management
- **📁 File Management**: Complete upload and management system
- **🎨 CSS Files**: 15+ specialized stylesheets -->

## 🎯 Enhanced Project Milestones

- [x] **Phase 1**: Basic product listing and MongoDB integration
- [x] **Phase 2**: Authentication system with role-based access
- [x] **Phase 3**: Shopping cart with localStorage persistence
- [x] **Phase 4**: Complete checkout flow with address validation
- [x] **Phase 5**: Admin dashboard with user management
- [x] **Phase 6**: Order management system with status tracking
- [x] **Phase 7**: Real-time analytics and reports dashboard
- [x] **Phase 8**: Mobile optimization and responsive design
- [x] **Phase 9**: Stock management and restoration system
- [x] **Phase 10**: Real-time chat system with Socket.IO
- [x] **Phase 11**: Payment system integration
- [x] **Phase 12**: Settings and profile management
- [x] **Phase 13**: File upload and management system
- [x] **Phase 14**: Production deployment (COMPLETED ✅)

## 🏆 Enhanced Learning Outcomes

### Technical Skills Mastered
- ✅ **Full Stack Development** - Complete E2E application development
- ✅ **React Development** - Advanced hooks, context API, component architecture
- ✅ **Node.js Backend** - Express.js, middleware, RESTful API design
- ✅ **Real-time Programming** - Socket.IO WebSocket implementation
- ✅ **Database Design** - MongoDB schema design and complex relationships
- ✅ **Authentication Systems** - JWT tokens, role-based access control
- ✅ **State Management** - Global state with Context API and localStorage
- ✅ **Responsive Design** - Mobile-first CSS and cross-device compatibility
- ✅ **File Management** - Upload, storage, and processing systems
- ✅ **Payment Integration** - Multiple payment method implementation
- ✅ **Production Deployment** - Environment configuration and cloud deployment
- ✅ **API Integration** - Frontend-backend communication patterns
- ✅ **Real-time Analytics** - Dynamic reporting from database aggregation

### Professional Skills Developed
- ✅ **Project Management** - Feature planning and milestone execution
- ✅ **Problem Solving** - Complex debugging and optimization
- ✅ **Code Organization** - Clean architecture and best practices
- ✅ **API Design** - RESTful standards and comprehensive documentation
- ✅ **User Experience** - Intuitive interface design and user flows
- ✅ **Real-time Systems** - WebSocket and event-driven architecture
- ✅ **Production Operations** - Environment management and deployment

## 🔮 Future Enhancements (comming soon)

### Phase 15: Advanced Features (Optional)
- 💳 **Enhanced Payment Integration** - Stripe/PayPal for real payments
- 📧 **Email Notifications** - Order confirmations and status updates
- 🔍 **Advanced Search** - Product filtering by category, price range
- ⭐ **Product Reviews** - Customer rating and review system
- 📱 **Push Notifications** - Real-time order and chat updates
- 🎯 **Recommendation Engine** - AI-powered product suggestions
- 🌐 **Multi-language Support** - Thai/English localization

### Phase 16: Optimization (Optional)
- ⚡ **Performance Optimization** - Code splitting and lazy loading
- 🔒 **Enhanced Security** - Rate limiting and advanced validation
- 📱 **Progressive Web App** - Offline functionality and app-like experience
- 📊 **Advanced Analytics** - Customer behavior tracking and insights
- 🤖 **AI Integration** - Chatbot for automated customer support
- 📈 **Business Intelligence** - Advanced reporting and forecasting

## 🤝 Contributing

This project was developed as a learning exercise and portfolio piece by **วิป (Vip)** - ICT Student at Mahidol University. 

<!-- **Development Collaboration**: Built with guidance from **พี่จาวิส (Javis)** AI Assistant for technical mentorship, code review, and problem-solving support. -->

## 📄 License

This project is created for **educational purposes** and portfolio development. Feel free to use as reference for learning full-stack development.

## 📞 Contact & Links

- **👨‍💻 Developer**: วิป (Phatra Wongsapsakul) 
- **🎓 Institution**: Mahidol University - ICT Program (Year 3 → 4)
- **🌐 Portfolio**: [vippersonalwebsite.vercel.app](https://vippersonalwebsite.vercel.app/)
- **🛒 Live Project**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)


## 🙏 Acknowledgments

- **University**: Mahidol University ICT Program for providing foundational knowledge in software development
- **Open Source**: React, Node.js, MongoDB, and Socket.IO communities for excellent documentation and resources
- **Inspiration**: Modern e-commerce platforms (Shopify, WooCommerce) for UX/UI design patterns and feature ideas

---

## 🏆 Project Status: **PRODUCTION READY** ✨

**VipStore** represents a complete, professional-grade e-commerce platform built from scratch using modern web technologies. This project demonstrates comprehensive proficiency in full-stack development, real-time systems, database design, user authentication, payment integration, and responsive web design.

**Perfect for:**
- 💼 **Job Interview Portfolio** - Showcases real-world development skills
- 📚 **Learning Reference** - Study modern full-stack architecture patterns
- 🚀 **Startup Foundation** - Scalable e-commerce platform foundation

### 📈 **Technical Achievements:**
- **Production Deployment**: Live on Vercel + Render with MongoDB Atlas
- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Real-time Systems**: Chat system with Socket.IO WebSocket implementation
- **Payment Integration**: Multiple payment method support
- **Mobile-First Design**: Perfect responsive experience across all devices
- **Security Implementation**: Role-based access and comprehensive data validation
- **Professional Code Quality**: Industry-standard architecture and best practices

---

**Made with ❤️, ☕, and countless hours of coding by วิป**  
**Technical by วิป | Powered by Modern Web Technologies**

*© 2025 VipStore - Educational Portfolio Project | Mahidol University ICT Program*

---
