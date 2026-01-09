const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "Premium wireless headphones with active noise cancellation",
        price: 199.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        stock: 50,
        rating: 4.5
    },
    {
        name: "Smartphone 12 Pro",
        description: "Latest smartphone with advanced camera features",
        price: 999.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop",
        stock: 30,
        rating: 4.8
    },
    {
        name: "Running Shoes",
        description: "Lightweight running shoes with cushion technology",
        price: 89.99,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        stock: 100,
        rating: 4.3
    },
    {
        name: "Cotton T-Shirt",
        description: "100% cotton premium t-shirt",
        price: 24.99,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
        stock: 200,
        rating: 4.2
    },
    {
        name: "Coffee Table Book",
        description: "Beautiful photography coffee table book",
        price: 49.99,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
        stock: 40,
        rating: 4.7
    },
    {
        name: "Desk Lamp",
        description: "Modern LED desk lamp with adjustable brightness",
        price: 39.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
        stock: 60,
        rating: 4.4
    },
    {
        name: "Yoga Mat",
        description: "Non-slip yoga mat with carrying strap",
        price: 29.99,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop",
        stock: 80,
        rating: 4.6
    },
    {
        name: "Backpack",
        description: "Waterproof backpack with laptop compartment",
        price: 59.99,
        category: "Other",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
        stock: 70,
        rating: 4.5
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopper-stop');
        console.log('Connected to database');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log('Sample products inserted');
        
        mongoose.disconnect();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();