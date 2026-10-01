import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add a product to the cart, or increment its quantity if already present

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid Product Id"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const item = req.user.cart.find((i) => i.product.equals(productId));
        const nextQuantity = item ? item.quantity + 1 : 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        if (item) {
            item.quantity = nextQuantity;
        } else {
            req.user.cart.push({ product: productId, quantity: 1 });
        }

        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Added to cart",
            cart: req.user.cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Get the logged-in customer's cart, with product details populated

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate("cart.product");

        res.status(200).json({
            success: true,
            cart: customer.cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Update the quantity of a product already in the cart

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid Product Id"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        const item = req.user.cart.find((i) => i.product.equals(productId));

        if (!item) {
            return res.status(404).json({
                message: "Item not in cart"
            });
        }

        const product = await Product.findById(productId);

        if (!product || quantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        item.quantity = quantity;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: req.user.cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Remove a product from the cart

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid Product Id"
            });
        }

        req.user.cart = req.user.cart.filter((i) => !i.product.equals(productId));
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Removed from cart",
            cart: req.user.cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};
