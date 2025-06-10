# 🛒 VipStore - Professional E-commerce Platform

A modern, production-ready full-stack e-commerce platform built with React and Node.js. Complete with authentication, shopping cart, order management, and admin dashboard.

**🌐 Live Demo**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)

## 🌟 Project Highlights

- ✨ **Complete E-commerce Solution** - From product browsing to order completion
- 🔐 **Secure Authentication System** - Role-based access control (Customer/Admin)
- 🛒 **Advanced Shopping Cart** - Real-time stock validation & localStorage persistence
- 👨‍💼 **Professional Admin Panel** - Complete order, user, and product management
- 📊 **Real-time Analytics Dashboard** - Dynamic reports from live database
- 📱 **Mobile-First Design** - Responsive across all devices
- 🚀 **Production-Ready Code** - Industry-standard architecture and best practices

## 🎯 Key Features

### 🛍️ Customer Experience
- 📱 **Responsive Product Catalog** - Modern grid layout with high-quality images
- 🛒 **Smart Shopping Cart** - Add/remove items with stock validation
- 📝 **Complete Checkout Flow** - Address form with validation and order confirmation
- 🔐 **User Authentication** - Secure login/register system
- 📦 **Order Tracking** - View order status and history
- 🎨 **Modern UI/UX** - Professional design with smooth animations

### 👨‍💼 Admin Dashboard
- 📊 **Analytics Dashboard** - Real-time order statistics and revenue tracking
- 👥 **User Management** - Create, edit, delete users with role management
- 📦 **Product Management** - Full CRUD operations for products
- 📋 **Order Management** - Track, update, and manage all orders with status changes
- 📈 **Dynamic Reports** - Live analytics from MongoDB with category performance
- 🔍 **Advanced Search & Filters** - Find users/orders quickly
- 🔔 **Password Request System** - Admin can approve/reject password change requests
- 🗑️ **Complete CRUD Operations** - Full create, read, update, delete functionality

### 🔧 Technical Excellence
- 🏗️ **Scalable Architecture** - Component-based React design
- 🔒 **Security Features** - Input validation, role-based access, stock restoration
- ⚡ **Performance Optimized** - Fast loading and smooth interactions
- 🔄 **Real-time Updates** - Instant UI synchronization with database
- 📱 **Cross-Device Compatible** - Works perfectly on desktop, tablet, mobile
- 🌐 **Production Deployment** - Live on Vercel (Frontend) + Render (Backend)

## 🛠️ Tech Stack

### Frontend Stack
- **React 18** - Modern UI Framework with Hooks
- **Vite** - Lightning-fast build tool and development server
- **Context API** - Global state management (Auth + Cart)
- **Axios** - HTTP client for API calls
- **CSS3** - Custom responsive styling with modern design
- **React Router** - Client-side routing with protected routes

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web application framework
- **MongoDB Atlas** - Cloud NoSQL database (Singapore region)
- **Mongoose ODM** - Object modeling for MongoDB
- **RESTful API** - Standard HTTP methods and status codes
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

### Database Schema
- **Users Collection** - Authentication, roles, and profile management
- **Products Collection** - Product catalog with inventory tracking
- **Orders Collection** - Complete order tracking with status management

### Deployment & DevOps
- **Frontend**: Vercel (Auto-deployment from GitHub)
- **Backend**: Render (Container deployment with auto-deploy)
- **Database**: MongoDB Atlas (Cloud database, Singapore region)
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
```

Start backend server:
```bash
npm start
# Server running on http://localhost:3001
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file in frontend directory (optional for local development):
```env
VITE_API_URL=http://localhost:3001/api
```

Start frontend development server:
```bash
npm run dev
# App running on http://localhost:5173
```

### 🧪 Test Accounts

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `123456` | Full system access |
| **Customer** | `vip` | `vip123` | Shopping features |
| **Customer** | `customer` | `customer123` | Shopping features |

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/create-admin` - Create admin user
- `GET /api/auth/users` - Get all users (Admin)
- `PUT /api/auth/users/:id` - Update user (Admin)
- `DELETE /api/auth/users/:id` - Delete user (Admin)
- `GET /api/auth/stats` - Get user statistics (Admin)

### Products API
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders API
- `POST /api/orders` - Create new order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `GET /api/orders/admin/stats` - Get order statistics (Admin)
- `PUT /api/orders/admin/:id/status` - Update order status (Admin)
- `DELETE /api/orders/admin/:id` - Delete order (Admin)
- `GET /api/orders/my-orders` - Get user's orders

### Reports API
- `GET /api/reports/overview` - Get overview analytics
- `GET /api/reports/sales` - Get sales reports
- `GET /api/reports/products` - Get product analytics
- `GET /api/reports/users` - Get user analytics
- `GET /api/reports/orders` - Get order analytics

## 📁 Project Architecture

```
VipStore/
├── backend/
│   ├── models/
│   │   ├── Product.js          # Product schema with stock management
│   │   ├── User.js             # User schema with roles
│   │   └── Order.js            # Order schema with status tracking
│   ├── routes/
│   │   ├── products.js         # Product CRUD operations
│   │   ├── auth.js             # Authentication & user management
│   │   ├── orders.js           # Order management system
│   │   └── reports.js          # Analytics and reporting system
│   ├── server.js               # Express server configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx      # Navigation with cart badge
│   │   │   ├── ProductCard.jsx # Product display component
│   │   │   ├── ProductList.jsx # Product grid layout
│   │   │   ├── AddToCartButton.jsx # Smart add to cart with stock validation
│   │   │   ├── CartModal.jsx   # Complete shopping cart interface
│   │   │   └── LoginForm.jsx   # Authentication modal with register
│   │   ├── components/admin/
│   │   │   ├── AdminDashboard.jsx # Admin navigation hub
│   │   │   ├── UserManager.jsx    # Complete user management
│   │   │   ├── OrderManager.jsx   # Order management with status tracking
│   │   │   ├── ProductManager.jsx # Product CRUD interface
│   │   │   └── ReportsManager.jsx # Real-time analytics dashboard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state management
│   │   │   └── CartContext.jsx    # Shopping cart state management
│   │   ├── services/
│   │   │   └── api.js             # Complete API service layer
│   │   ├── App.jsx                # Main application component
│   │   └── main.jsx              # Application entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Deployment Guide

### Production URLs
- **Frontend**: https://vipstore-sigma.vercel.app
- **Backend**: https://vipstore-backend.onrender.com
- **Database**: MongoDB Atlas (Singapore region)

### Frontend Deployment (Vercel)
1. **Connect Repository**: Link GitHub repo to Vercel
2. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
3. **Environment Variables**:
   ```env
   VITE_API_URL=https://vipstore-backend.onrender.com/api
   ```
4. **Auto-Deploy**: Automatic deployment on git push

### Backend Deployment (Render)
1. **Create Web Service**: Connect GitHub repository
2. **Build Settings**:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
3. **Environment Variables**:
   ```env
   MONGODB_URI=your_production_mongodb_uri
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=your_production_jwt_secret
   ```
4. **Auto-Deploy**: Automatic deployment from main branch

### Database Setup (MongoDB Atlas)
1. **Create Cluster**: Free tier in Singapore region
2. **Network Access**: Allow access from anywhere (0.0.0.0/0)
3. **Database User**: Create user with read/write permissions
4. **Connection String**: Use in MONGODB_URI environment variable

## 📊 Development Statistics

- **⏱️ Development Time**: ~6 weeks intensive development
- **📝 Lines of Code**: 4000+ lines across frontend/backend
- **🎨 Components**: 15+ React components
- **🔌 API Endpoints**: 25+ RESTful endpoints
- **📱 Responsive Breakpoints**: 4 device sizes (mobile, tablet, desktop, large)
- **🧪 Test Scenarios**: 30+ user flow tests
- **📊 Database Collections**: 3 with complex relationships
- **🔐 Security Features**: Role-based access, input validation, stock management

## 🎯 Project Milestones

- [x] **Phase 1**: Basic product listing and MongoDB integration
- [x] **Phase 2**: Authentication system with role-based access
- [x] **Phase 3**: Shopping cart with localStorage persistence
- [x] **Phase 4**: Complete checkout flow with address validation
- [x] **Phase 5**: Admin dashboard with user management
- [x] **Phase 6**: Order management system with status tracking
- [x] **Phase 7**: Real-time analytics and reports dashboard
- [x] **Phase 8**: Mobile optimization and responsive design
- [x] **Phase 9**: Stock management and restoration system
- [x] **Phase 10**: Production deployment (COMPLETED ✅)

## 🏆 Learning Outcomes

### Technical Skills Mastered
- ✅ **Full Stack Development** - Complete E2E application development
- ✅ **React Development** - Modern hooks, context API, component architecture
- ✅ **Node.js Backend** - Express.js, middleware, RESTful API design
- ✅ **Database Design** - MongoDB schema design and complex relationships
- ✅ **Authentication Systems** - JWT tokens, role-based access control
- ✅ **State Management** - Global state with Context API and localStorage
- ✅ **Responsive Design** - Mobile-first CSS and cross-device compatibility
- ✅ **Production Deployment** - Environment configuration and cloud deployment
- ✅ **API Integration** - Frontend-backend communication patterns
- ✅ **Real-time Analytics** - Dynamic reporting from database aggregation

### Professional Skills Developed
- ✅ **Project Management** - Feature planning and milestone execution
- ✅ **Problem Solving** - Complex debugging and optimization
- ✅ **Code Organization** - Clean architecture and best practices
- ✅ **API Design** - RESTful standards and comprehensive documentation
- ✅ **User Experience** - Intuitive interface design and user flows
- ✅ **Production Operations** - Environment management and deployment

## 🔮 Future Enhancements

### Phase 11: Advanced Features (Optional)
- 💳 **Payment Integration** - Stripe/PayPal for real payments
- 📧 **Email Notifications** - Order confirmations and status updates
- 🔍 **Enhanced Search** - Product filtering by category, price range
- ⭐ **Product Reviews** - Customer rating and review system
- 📱 **Push Notifications** - Real-time order updates
- 🎯 **Recommendation Engine** - AI-powered product suggestions

### Phase 12: Optimization (Optional)
- ⚡ **Performance Optimization** - Code splitting and lazy loading
- 🔒 **Enhanced Security** - Rate limiting and advanced validation
- 📱 **Progressive Web App** - Offline functionality and app-like experience
- 🌐 **Internationalization** - Multi-language support (Thai/English)
- 📊 **Advanced Analytics** - Customer behavior tracking and insights

## 🤝 Contributing

This project was developed as a learning exercise and portfolio piece by **วิป (Vip)** - ICT Student at Mahidol University. 

**Development Collaboration**: Built with guidance from **พี่จาวิส (Javis)** AI Assistant for technical mentorship, code review, and problem-solving support.

## 📄 License

This project is created for **educational purposes** and portfolio development. Feel free to use as reference for learning full-stack development.

## 📞 Contact & Links

- **👨‍💻 Developer**: วิป (Phatra Wongsapsakul) - Student ID: 6587027
- **🎓 Institution**: Mahidol University - ICT Program (Year 3 → 4)
- **🌐 Portfolio**: [vippersonalwebsite.vercel.app](https://vippersonalwebsite.vercel.app/)
- **📧 Email**: Contact via Portfolio Website
- **📱 GitHub**: [@6587027](https://github.com/6587027)
- **🛒 Live Project**: [vipstore-sigma.vercel.app](https://vipstore-sigma.vercel.app)

## 🙏 Acknowledgments

- **Special Thanks**: พี่จาวิส AI Assistant for comprehensive technical guidance, debugging support, and development mentorship throughout the entire project lifecycle
- **University**: Mahidol University ICT Program for providing foundational knowledge in software development
- **Open Source**: React, Node.js, and MongoDB communities for excellent documentation and resources
- **Inspiration**: Modern e-commerce platforms (Shopify, WooCommerce) for UX/UI design patterns and feature ideas

---

## 🏆 Project Status: **PRODUCTION READY** ✨

**VipStore** represents a complete, professional-grade e-commerce platform built from scratch using modern web technologies. This project demonstrates comprehensive proficiency in full-stack development, database design, user authentication, real-time analytics, and responsive web design.

**Perfect for:**
- 💼 **Job Interview Portfolio** - Showcases real-world development skills
- 🎓 **Senior Project** - University-level computer science capstone project
- 📚 **Learning Reference** - Study modern full-stack architecture patterns
- 🚀 **Startup Foundation** - Scalable e-commerce platform foundation

### 📈 **Technical Achievements:**
- **Production Deployment**: Live on Vercel + Render with MongoDB Atlas
- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Real-time Analytics**: Dynamic reports from live database
- **Mobile-First Design**: Perfect responsive experience
- **Security Implementation**: Role-based access and data validation
- **Professional Code Quality**: Industry-standard architecture

---

**Made with ❤️, ☕, and countless hours of coding by วิป**  
**Technical Guidance by พี่จาวิส | Powered by Modern Web Technologies**

*© 2025 VipStore - Educational Portfolio Project | Mahidol University ICT Program*

---

### 🎯 **Development Journey: From Concept to Production**

**June 2025** - What started as a "small practice project" evolved into a comprehensive, production-ready e-commerce platform that demonstrates professional-level full-stack development capabilities. This project represents not just technical achievement, but also problem-solving, project management, and the ability to deliver complete, working software solutions.

**Ready for the real world. Ready for professional opportunities. Ready to make an impact.** 🚀