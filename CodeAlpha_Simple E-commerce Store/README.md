Shopper Stop 🛍️ A complete, full-stack e-commerce platform built with modern web technologies. Features a responsive frontend, RESTful API backend, and MongoDB database. 🌟 Features 🛒 Shopping Experience • Product Browsing - Browse products with filters, sorting, and search • Product Details - Detailed product pages with images, reviews, and specifications • Shopping Cart - Add, update, and remove items with real-time calculations • Checkout Process - Complete order placement with multiple payment options 👤 User Management • User Registration/Login - Secure authentication with JWT tokens • User Profile - Manage personal information, addresses, and preferences • Order History - View and track past orders • Wishlist - Save favorite products for later 📦 Order Management • Order Processing - Complete order lifecycle from creation to delivery • Order Tracking - Track order status in real-time • Order Cancellation - Cancel orders before shipping • Order Confirmation - Detailed confirmation pages with receipts 💻 Technical Features • Responsive Design - Works on mobile, tablet, and desktop • RESTful API - Clean, well-documented backend API • Real-time Updates - Cart and order updates without page refresh • Secure Authentication - JWT-based protected routes • Error Handling - Comprehensive error handling and validation 🏗️ Architecture text Frontend (Client-side) ├── HTML5, CSS3, JavaScript ├── Responsive Design ├── Single Page Application Features └── AJAX/Fetch API for data

Backend (Server-side) ├── Node.js with Express.js ├── MongoDB with Mongoose ODM ├── JWT Authentication └── RESTful API Design

Database ├── MongoDB ├── Collections: Users, Products, Carts, Orders └── Relationships and Indexes 📁 Project Structure text shopper-stop/ ├── backend/ # Express.js backend │ ├── config/ # Configuration files │ ├── controllers/ # Business logic │ ├── middleware/ # Custom middleware │ ├── models/ # MongoDB schemas │ ├── routes/ # API routes │ ├── utils/ # Utility functions │ ├── server.js # Main server file │ ├── seed.js # Database seeding │ └── package.json # Backend dependencies │ ├── frontend/ # Frontend application │ ├── assets/ # Images and static files │ ├── js/ # JavaScript files │ ├── pages/ # HTML pages │ ├── styles/ # CSS stylesheets │ ├── index.html # Home page │ ├── products.html # Products page │ ├── cart.html # Shopping cart │ └── README.md # Frontend documentation │ ├── .gitignore # Git ignore rules ├── README.md # This file └── package.json # Root dependencies 🚀 Quick Start Prerequisites • Node.js (v14 or higher) • MongoDB (v4.4 or higher) • Git Installation

Clone the repository bash git clone https://github.com/nikhil-programmer-official/shopper-stop.git cd shopper-stop
Install backend dependencies bash cd backend npm install
Set up environment variables bash cp .env.example .env
Edit .env with your configuration
Start MongoDB bash
On macOS
brew services start mongodb-community

On Ubuntu
sudo systemctl start mongod

On Windows (Run as Administrator)
net start MongoDB 5. Seed the database bash npm run seed 6. Start the backend server bash npm run dev

Server runs on http://localhost:5000
Start the frontend bash
Open a new terminal
cd frontend

Using Python (Python 3)
python3 -m http.server 8000

Using Node.js http-server
npx http-server

Using Live Server (VS Code extension)
Right-click index.html → "Open with Live Server"
Frontend runs on http://localhost:8000
⚙️ Configuration Backend Configuration (.env) env PORT=5000 MONGODB_URI=mongodb://localhost:27017/shopper-stop JWT_SECRET=your-super-secret-jwt-key-change-this-in-production NODE_ENV=development API Endpoints Authentication • POST /api/auth/register - Register a new user • POST /api/auth/login - Login user • GET /api/auth/profile - Get user profile (Protected) Products • GET /api/products - Get all products (with filters) • GET /api/products/:id - Get single product • POST /api/products - Create product (Protected) • PUT /api/products/:id - Update product (Protected) • DELETE /api/products/:id - Delete product (Protected) Cart • GET /api/cart - Get user's cart (Protected) • POST /api/cart/add - Add to cart (Protected) • PUT /api/cart/update/:itemId - Update cart item (Protected) • DELETE /api/cart/remove/:itemId - Remove from cart (Protected) • DELETE /api/cart/clear - Clear cart (Protected) Orders • POST /api/orders - Create order (Protected) • GET /api/orders - Get user's orders (Protected) • GET /api/orders/:id - Get order details (Protected) • PUT /api/orders/:id/cancel - Cancel order (Protected) 📦 Database Schema User Model javascript { name: String, email: String (unique), password: String (hashed), address: Object, phone: String, createdAt: Date } Product Model javascript { name: String, description: String, price: Number, category: String, image: String, stock: Number, rating: Number, reviews: Array, specifications: Array, createdAt: Date } Cart Model javascript { user: ObjectId (ref: User), items: [{ product: ObjectId (ref: Product), quantity: Number }], total: Number, updatedAt: Date } Order Model javascript { user: ObjectId (ref: User), items: Array, shippingAddress: Object, paymentMethod: String, paymentStatus: String, orderStatus: String, totalAmount: Number, tax: Number, shippingFee: Number, createdAt: Date } 🎨 Frontend Pages

Home Page (/) - Welcome page with featured products
Products Page (/products.html) - Browse all products with filters
Product Details (/pages/product-details.html) - Detailed product view
Shopping Cart (/cart.html) - Manage cart items
Checkout - Integrated in cart page
Order Confirmation (/pages/order-confirmation.html) - Order success page
Order History (/pages/order-history.html) - View past orders
User Profile (/pages/profile.html) - Manage account 🧪 Testing Test User Credentials javascript // After seeding Email: test@example.com Password: password123 Sample API Requests Register a user: bash curl -X POST http://localhost:5000/api/auth/register
-H "Content-Type: application/json"
-d '{"name":"John Doe","email":"john@example.com","password":"password123"}' Login: bash curl -X POST http://localhost:5000/api/auth/login
-H "Content-Type: application/json"
-d '{"email":"john@example.com","password":"password123"}' Get products: bash curl http://localhost:5000/api/products 🐛 Troubleshooting Common Issues
MongoDB Connection Error o Ensure MongoDB is running: mongod --version o Check connection string in .env
Port Already in Use bash
Find process using port 5000
lsof -i :5000

Kill the process
kill -9 3. CORS Errors o Ensure frontend and backend origins are correctly configured o Check browser console for specific errors 4. Authentication Issues o Clear browser localStorage and try again o Verify JWT token is being sent in headers Debug Mode bash

Run backend in debug mode
NODE_ENV=development npm run dev

Check logs for detailed errors
tail -f backend/logs/app.log 📚 API Documentation Filtering Products http GET /api/products?category=Electronics&minPrice=100&maxPrice=500&sort=price_asc&page=1&limit=10 Query Parameters: • category - Filter by category (Electronics, Clothing, Books, Home, Sports, Other) • minPrice - Minimum price • maxPrice - Maximum price • sort - Sort by (price_asc, price_desc, rating) • page - Page number (default: 1) • limit - Items per page (default: 20) Authentication Headers javascript // For protected routes headers: { 'Authorization': Bearer ${token}, 'Content-Type': 'application/json' } 🚢 Deployment Heroku Deployment

Create a Heroku account and install CLI
Create Procfile in backend: text web: node server.js
Deploy: bash heroku create shopper-stop-app heroku addons:create mongolab heroku config:set JWT_SECRET=your-secret-key git push heroku main Vercel Deployment (Frontend)
Install Vercel CLI: npm i -g vercel
Deploy frontend: bash cd frontend vercel --prod Docker Deployment
Build and run with Docker Compose: bash docker-compose up --build 🔧 Development Code Standards • Use meaningful variable and function names • Add comments for complex logic • Follow consistent indentation (2 spaces) • Use async/await for asynchronous operations Git Workflow bash
Create a new branch
git checkout -b feature/your-feature

Make changes and commit
git add . git commit -m "Add: Description of changes"

Push to GitHub
git push origin feature/your-feature

Create Pull Request on GitHub
Adding New Features

Create new model in backend/models/
Create controller in backend/controllers/
Define routes in backend/routes/
Update frontend JavaScript for new functionality
Add corresponding HTML/CSS if needed 👥 Contributors • Nikhilsuresh.S 🙏 Acknowledgments • Unsplash for product images • Font Awesome for icons • MongoDB, Express.js, Node.js communities • All open-source libraries used in this project 📞 Support For support, email nikhilsuresh482006@gmail.com or create an issue in the GitHub repository.
Happy Shopping! 🛍️
