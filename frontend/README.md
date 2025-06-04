# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# --------------------------------------------------------

# 🛒 VipStore - E-commerce Platform

A modern, full-stack e-commerce platform built with React and Node.js for learning purposes.

![VipStore Preview](https://via.placeholder.com/800x400?text=VipStore+E-commerce+Platform)

## 🚀 Features

- 📱 Responsive product catalog
- 🛍️ Shopping cart functionality  
- 👨‍💼 Admin panel for product management
- 🔍 Product search and filtering
- 💳 Simple checkout process
- 📊 Modern UI/UX design

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **CSS3** - Modern styling
- **Axios** - HTTP client

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway/Render
- **Database**: MongoDB Atlas (Free Tier)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Clone Repository
```bash
git clone https://github.com/6587027/VipStore.git
cd VipStore
```

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

Start backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

## 📁 Project Structure

```
VipStore/
├── backend/
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── products.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically on push

## 🎯 Development Roadmap

- [x] Basic product listing
- [x] MongoDB integration
- [x] RESTful API
- [ ] Shopping cart
- [ ] Admin dashboard
- [ ] User authentication
- [ ] Payment integration

## 🤝 Contributing

This is a learning project by Vip (Computer Science Student, Mahidol University).

## 📄 License

This project is created for educational purposes.

## 📞 Contact

- **Developer**: Vip
- **University**: Mahidol University
- **Program**: Computer Science

---

**Made with ❤️ for learning Full Stack Development**