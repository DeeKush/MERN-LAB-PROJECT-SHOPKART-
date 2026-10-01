import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add a product to the logged-in customer's wishlist (duplicate-safe)

export const addToWishlist = async (req, res) => {
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

        if (req.user.wishlist.some((id) => id.equals(productId))) {
            return res.status(409).json({
                message: "Product already in wishlist"
            });
        }

        req.user.wishlist.push(productId);
        await req.user.save();

        res.status(201).json({
            success: true,
            message: "Added to wishlist",
            wishlist: req.user.wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Get the logged-in customer's wishlist, with product details populated

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate("wishlist");

        res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Remove a product from the logged-in customer's wishlist

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid Product Id"
            });
        }

        req.user.wishlist = req.user.wishlist.filter((id) => !id.equals(productId));
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Removed from wishlist",
            wishlist: req.user.wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};
