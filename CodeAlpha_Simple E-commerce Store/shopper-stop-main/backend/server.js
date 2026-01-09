const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

/* ===============================
   COLOR LOG HELPERS
================================ */
const log = {
    info: (msg) => console.log(`[INFO ${time()}] ${msg}`),
    success: (msg) => console.log(`[SUCCESS ${time()}] ${msg}`),
    warn: (msg) => console.log(`[WARN ${time()}] ${msg}`),
    error: (msg) => console.log(`[ERROR ${time()}] ${msg}`)
};

function time() {
    return new Date().toLocaleTimeString();
}

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(
        `[REQ ${time()}] ${req.method} ${req.originalUrl}`
    );
    next();
});

/* ===============================
   DATABASE CONNECTION
================================ */
mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/shopper-stop',
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => log.success('MongoDB Connected'))
.catch(err => log.error(err.message));

/* ===============================
   ROUTES
================================ */
app.use('/api/auth', require('./routes/auth'));
log.info('Auth routes loaded');

app.use('/api/products', require('./routes/products'));
log.info('Product routes loaded');

app.use('/api/cart', require('./routes/cart'));
log.info('Cart routes loaded');

app.use('/api/orders', require('./routes/orders'));
log.info('Order routes loaded');

/* ===============================
   ROOT ROUTE
================================ */
app.get('/', (req, res) => {
    res.json({ message: 'Shopper Stop API is running' });
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
    console.log(
        `🚀 Server running on port ${PORT} | ENV: ${ENV.toUpperCase()}`
    );
});
