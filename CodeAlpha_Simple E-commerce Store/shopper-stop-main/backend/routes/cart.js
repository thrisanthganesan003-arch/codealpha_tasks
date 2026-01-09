const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => {
            return sum + (product.price * item.quantity);
        }, 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => 
            item._id.toString() !== req.params.itemId
        );

        // Recalculate total
        const populatedCart = await cart.populate('items.product');
        cart.total = populatedCart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update cart item quantity
router.put('/update/:itemId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.userId });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => 
            item._id.toString() === req.params.itemId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate total
        const populatedCart = await cart.populate('items.product');
        cart.total = populatedCart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;